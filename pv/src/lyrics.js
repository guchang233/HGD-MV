// Kinetic typography: every lyric syllable animates in on its sung time
// (forced-aligned from the vocal stem, see tools/ai/align_lyrics.py).
import { TAU, clamp, ease, lerp, hash, makeCanvas, ctx2d } from './core.js';
import { SERIF, LATIN, font } from './type.js';

export const FONTS = {
  serif: SERIF,
  sans: '"PV Sans SC", sans-serif',
  brush: '"PV Brush", serif',
  cursive: '"PV Cursive", serif',
  latin: LATIN,
};

// ------------------------------------------------------------ glyph cache --
const glyphs = new Map();
function glyph(ch, size, st) {
  const key = `${ch}|${size}|${st.font}|${st.weight}|${st.color}|${st.stroke}|${st.glow}|${st.glowBlur}`;
  let gl = glyphs.get(key);
  if (gl) return gl;
  const pad = Math.ceil(size * 0.45 + (st.glowBlur ?? 0));
  const w = Math.ceil(size * 1.25 + pad * 2);
  const c = makeCanvas(w, w);
  const g = ctx2d(c);
  g.font = font(size, st.weight ?? 700, FONTS[st.font] ?? FONTS.serif);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const x = w / 2;
  const y = w / 2 + size * 0.05;
  if (st.glow) {
    g.shadowColor = st.glow;
    g.shadowBlur = st.glowBlur ?? size * 0.25;
  }
  if (st.stroke) {
    g.lineJoin = 'round';
    g.strokeStyle = st.stroke;
    g.lineWidth = st.strokeW ?? Math.max(2, size * 0.06);
    g.strokeText(ch, x, y);
    g.shadowBlur = 0;
  }
  g.fillStyle = st.color ?? '#fff';
  g.fillText(ch, x, y);
  gl = { c, w };
  glyphs.set(key, gl);
  if (glyphs.size > 1500) glyphs.delete(glyphs.keys().next().value);
  return gl;
}

// ----------------------------------------------------------------- layout --
/**
 * Place the characters of a line.  Returns [{ch, t, x, y, size, st}].
 * style.layout:
 *   'h'      horizontal line centred on (x, y)
 *   'v'      vertical column(s) starting at (x, y); style.breaks splits columns
 *   'grid'   rows of style.cols characters centred on (x, y)
 *   'scatter' characters strewn around (x, y) within style.spread
 *   'arc'    along an arc of radius style.radius
 *   'split'  first part left of centre, rest right (style.at = split index)
 *   'pos'    explicit style.pos[i] = [x, y, sizeMul]
 */
export function layoutLine(line, style) {
  const chars = line.chars;
  const n = chars.length;
  const base = style.size ?? 90;
  const emph = style.emph ?? {};
  const st = (i) => ({ ...style, ...(emph[i] ?? {}) });
  const sz = (i) => base * (emph[i]?.scale ?? 1);
  const track = style.track ?? 0.08;
  const out = [];
  const L = style.layout ?? 'h';
  if (L === 'h' || L === 'split') {
    const widths = chars.map((_, i) => sz(i) * (1 + track));
    let total = widths.reduce((a, b) => a + b, 0);
    const gap = L === 'split' ? style.gap ?? 260 : 0;
    total += gap;
    let x = (style.x ?? 960) - total / 2;
    chars.forEach(([ch, t], i) => {
      if (L === 'split' && i === (style.at ?? Math.ceil(n / 2))) x += gap;
      out.push({ ch, t, x: x + widths[i] / 2, y: (style.y ?? 540) + (emph[i]?.dy ?? 0), size: sz(i), st: st(i), i });
      x += widths[i];
    });
  } else if (L === 'v') {
    const breaks = style.breaks ?? [];
    const colGap = style.colGap ?? base * 1.25;
    let col = 0;
    let y = style.y ?? 160;
    chars.forEach(([ch, t], i) => {
      if (breaks.includes(i)) {
        col++;
        y = (style.y ?? 160) + (style.stagger ?? 0) * col;
      }
      const s = sz(i);
      out.push({ ch, t, x: (style.x ?? 1600) - col * colGap * (style.dir ?? 1), y: y + s / 2, size: s, st: st(i), i });
      y += s * (1 + track);
    });
  } else if (L === 'grid') {
    const cols = style.cols ?? 2;
    const rows = Math.ceil(n / cols);
    const cell = base * (1 + track);
    chars.forEach(([ch, t], i) => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      out.push({ ch, t, x: (style.x ?? 960) + (c - (cols - 1) / 2) * cell, y: (style.y ?? 540) + (r - (rows - 1) / 2) * cell, size: sz(i), st: st(i), i });
    });
  } else if (L === 'scatter') {
    const sp = style.spread ?? [700, 320];
    chars.forEach(([ch, t], i) => {
      const a = hash(i, style.seed ?? 1);
      const b = hash(i + 50, style.seed ?? 1);
      const k = 0.6 + 0.8 * hash(i + 99, style.seed ?? 1);
      out.push({ ch, t, x: (style.x ?? 960) + (a - 0.5) * 2 * sp[0], y: (style.y ?? 540) + (b - 0.5) * 2 * sp[1], size: sz(i) * k, st: st(i), i });
    });
  } else if (L === 'arc') {
    const R = style.radius ?? 420;
    const span = style.span ?? 2.2;
    chars.forEach(([ch, t], i) => {
      const a = (style.a0 ?? -Math.PI / 2) - span / 2 + (n === 1 ? 0.5 : i / (n - 1)) * span;
      out.push({ ch, t, x: (style.x ?? 960) + Math.cos(a) * R, y: (style.y ?? 540) + Math.sin(a) * R, size: sz(i), st: st(i), i, rot: a + Math.PI / 2 });
    });
  } else if (L === 'pos') {
    chars.forEach(([ch, t], i) => {
      const [x, y, k = 1] = style.pos[i];
      out.push({ ch, t, x, y, size: base * k, st: st(i), i });
    });
  }
  return out;
}

// ------------------------------------------------------------- animation --
const IN = {
  // slam down from large and blurred
  stamp: (p) => ({ s: lerp(2.3, 1, ease.outExpo(p)), a: clamp(p * 3), blur: (1 - ease.outCubic(p)) * 10 }),
  drop: (p) => ({ dy: -140 * (1 - ease.outBack(p, 2.2)), a: clamp(p * 2.5) }),
  rise: (p) => ({ dy: 90 * (1 - ease.outExpo(p)), a: clamp(p * 2), blur: (1 - p) * 6 }),
  soft: (p) => ({ a: ease.outCubic(p), blur: (1 - ease.outCubic(p)) * 14, s: lerp(1.08, 1, p) }),
  zoom: (p) => ({ s: lerp(6, 1, ease.outExpo(p)), a: clamp(p * 1.6), blur: (1 - p) * 16 }),
  flip: (p) => ({ sx: Math.max(0.02, Math.abs(Math.cos((1 - ease.outBack(p, 1.8)) * Math.PI * 0.5))), a: clamp(p * 3) }),
  grow: (p) => ({ sy: Math.max(0.02, ease.outBack(p, 2)), a: clamp(p * 4), oy: 0.5 }),
  slide: (p, c) => ({ dx: (c.dir ?? 1) * 240 * (1 - ease.outExpo(p)), a: clamp(p * 2), blur: (1 - p) * 8 }),
  scatter: (p, c) => ({ dx: (hash(c.i, 7) - 0.5) * 900 * (1 - ease.outExpo(p)), dy: (hash(c.i, 8) - 0.5) * 600 * (1 - ease.outExpo(p)), rot: (hash(c.i, 9) - 0.5) * 3 * (1 - ease.outExpo(p)), a: clamp(p * 2) }),
  glitch: (p) => ({ a: p < 0.15 ? (Math.floor(p * 40) % 2) : 1, rgb: (1 - ease.outCubic(p)) * 18, jx: (1 - p) * 14 }),
  freeze: (p, c, t) => ({ a: clamp(p * 2), jx: (1 - ease.outCubic(p)) * 7 * Math.sin(t * 90 + c.i), blur: (1 - p) * 5 }),
  type: (p) => ({ a: p > 0 ? 1 : 0, cursor: p < 1 }),
  ink: (p) => ({ ink: p }),
};

const OUT = {
  fade: (p) => ({ a: 1 - p }),
  cut: (p) => ({ a: p > 0 ? 0 : 1 }),
  blow: (p, c) => ({ dx: ease.inCubic(p) * (260 + hash(c.i, 3) * 200), dy: -ease.inCubic(p) * (80 + hash(c.i, 4) * 120), rot: ease.inCubic(p) * (hash(c.i, 5) - 0.5) * 2, a: 1 - ease.inQuad(p), blur: p * 10 }),
  drift: (p, c) => ({ dy: -ease.inQuad(p) * 140, dx: (hash(c.i, 6) - 0.5) * 120 * p, a: 1 - p, blur: p * 8 }),
  drop: (p, c) => ({ dy: ease.inCubic(p) * (500 + hash(c.i, 2) * 300), rot: (hash(c.i, 1) - 0.5) * p * 1.5, a: 1 - ease.inQuad(p) }),
  zoom: (p) => ({ s: 1 + ease.inExpo(p) * 4, a: 1 - p, blur: p * 14 }),
  slash: (p, c) => ({ cut: p, a: 1, sl: hash(c.i, 11) }),
  shatter: (p, c) => ({ sh: p, a: 1 - ease.inQuad(p), sl: hash(c.i, 12) }),
  glitch: (p) => ({ a: p > 0.6 ? 0 : (Math.floor(p * 30) % 2 ? 0.2 : 1), rgb: p * 24, jx: p * 30 }),
};

/**
 * Draw one lyric line at time t.
 *  style.in / style.out   animation names (see IN / OUT)
 *  style.inDur, outDur    seconds
 *  style.lead             start the in-animation this long before the syllable
 *  style.out_at           time the exit starts (defaults to line end + hold)
 */
export function drawLine(g, line, style, t, opts = {}) {
  const inDur = style.inDur ?? 0.28;
  const outDur = style.outDur ?? 0.35;
  const lead = style.lead ?? 0.03;
  const outAt = style.outAt ?? line.end + (style.hold ?? 0.15);
  const stagger = style.outStagger ?? 0.03;
  if (t < line.chars[0][1] - lead - 0.01 || t > outAt + outDur + stagger * line.chars.length + 0.05) return;
  const items = layoutLine(line, style);
  const inFn = IN[style.in ?? 'stamp'];
  const outFn = OUT[style.out ?? 'fade'];
  g.save();
  if (style.blend) g.globalCompositeOperation = style.blend;
  for (const c of items) {
    const cin = c.st.in ? IN[c.st.in] : inFn;
    const pi = clamp((t - (c.t - lead)) / (c.st.inDur ?? inDur));
    if (pi <= 0) continue;
    const po = clamp((t - (outAt + c.i * stagger)) / outDur);
    if (po >= 1) continue;
    const A = cin(pi, c, t);
    const B = po > 0 ? outFn(po, c, t) : {};
    drawChar(g, c, A, B, t, opts);
  }
  g.restore();
}

function drawChar(g, c, A, B, t, opts) {
  const a = (A.a ?? 1) * (B.a ?? 1) * (opts.alpha ?? 1);
  if (a <= 0.004) return;
  const st = c.st;
  if (A.ink !== undefined && A.ink < 1) {
    opts.inkChar?.(g, c, A.ink);
    return;
  }
  const { c: img, w } = glyph(c.ch, Math.round(c.size), st);
  const s = (A.s ?? 1) * (B.s ?? 1) * (1 + (opts.pulse ?? 0));
  const x = c.x + (A.dx ?? 0) + (B.dx ?? 0) + (A.jx ?? 0) * Math.sin(t * 97 + c.i * 3) + (B.jx ?? 0) * Math.sin(t * 83 + c.i);
  const y = c.y + (A.dy ?? 0) + (B.dy ?? 0);
  const blur = (A.blur ?? 0) + (B.blur ?? 0);
  // 'grow' scales from the baseline instead of the centre
  const oy = A.oy ? c.size * 0.45 : 0;
  g.save();
  g.translate(x, y + oy);
  const rot = (c.rot ?? 0) + (st.rot ?? 0) + (A.rot ?? 0) + (B.rot ?? 0);
  if (rot) g.rotate(rot);
  g.scale(s * (A.sx ?? 1), s * (A.sy ?? 1));
  g.globalAlpha *= a;
  if (blur > 0.4) g.filter = `blur(${blur.toFixed(1)}px)`;
  const rgb = (A.rgb ?? 0) + (B.rgb ?? 0);
  if (B.cut !== undefined) {
    // diagonal slash: the two halves part along a cut line
    const k = ease.inCubic(B.cut);
    for (const side of [-1, 1]) {
      g.save();
      g.beginPath();
      g.moveTo(-w, side * -w);
      g.lineTo(w, side * w * 0.2);
      g.lineTo(w, side * -w);
      g.closePath();
      g.clip();
      g.globalAlpha *= 1 - k;
      g.drawImage(img, -w / 2 + side * k * 80, -w / 2 + side * k * 40);
      g.restore();
    }
  } else if (B.sh !== undefined) {
    const k = ease.inCubic(B.sh);
    for (let q = 0; q < 3; q++) {
      g.save();
      g.beginPath();
      g.rect(-w / 2, -w / 2 + (q * w) / 3, w, w / 3);
      g.clip();
      g.drawImage(img, -w / 2 + (q - 1) * k * 160 * (0.5 + c.i % 3), -w / 2 + k * (q - 1) * 60);
      g.restore();
    }
  } else if (rgb > 0.5) {
    g.globalCompositeOperation = 'lighter';
    const tint = (col, dx) => {
      g.save();
      g.translate(dx, 0);
      g.drawImage(tinted(img, col), -w / 2, -w / 2 - oy);
      g.restore();
    };
    tint('#ff2a2a', -rgb);
    tint('#22ff88', 0);
    tint('#3a5cff', rgb);
  } else {
    g.drawImage(img, -w / 2, -w / 2 - oy);
    // echo: ghost copies expanding off a glyph as it lands
    const age = t - c.t;
    if (st.echo && age > 0 && age < 0.5) {
      for (let e = 1; e <= 3; e++) {
        const k = 1 + e * 0.11 * (0.4 + age * 2);
        g.save();
        g.globalAlpha *= (1 - age / 0.5) * (0.38 / e);
        g.scale(k, k);
        g.drawImage(img, -w / 2, -w / 2 - oy);
        g.restore();
      }
    }
  }
  if (A.cursor) {
    g.fillStyle = st.color ?? '#fff';
    g.fillRect(c.size * 0.55, -c.size * 0.45, c.size * 0.08, c.size * 0.9);
  }
  g.restore();
}

// colour-separated copies for RGB-split glitches
const tintCache = new Map();
function tinted(img, col) {
  const key = col;
  let entry = tintCache.get(img);
  if (!entry) {
    entry = new Map();
    tintCache.set(img, entry);
  }
  if (entry.has(key)) return entry.get(key);
  const c = makeCanvas(img.width, img.height);
  const g = ctx2d(c);
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = col;
  g.fillRect(0, 0, c.width, c.height);
  entry.set(key, c);
  return c;
}

export { TAU };
