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
  const key = `${ch}|${size}|${st.font}|${st.weight}|${st.color}|${st.stroke}|${st.strokeW}|${st.glow}|${st.glowBlur}|${st.outline}`;
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
  g.lineJoin = 'round';
  if (st.outline) {
    // hollow letter: stroke only
    g.strokeStyle = st.color ?? '#fff';
    g.lineWidth = st.outline;
    g.strokeText(ch, x, y);
  } else {
    if (st.stroke) {
      g.strokeStyle = st.stroke;
      g.lineWidth = st.strokeW ?? Math.max(2, size * 0.06);
      g.strokeText(ch, x, y);
      g.shadowBlur = 0;
    }
    g.fillStyle = st.color ?? '#fff';
    g.fillText(ch, x, y);
  }
  gl = { c, w };
  glyphs.set(key, gl);
  if (glyphs.size > 1500) glyphs.delete(glyphs.keys().next().value);
  return gl;
}

// ----------------------------------------------------------------- layout --
/**
 * Place the characters of a line.  Returns [{ch, t, x, y, size, st, i, cx, cy}]
 * (cx, cy: centre of the whole block).
 * style.layout:
 *   'h'      horizontal line centred on (x, y)
 *   'v'      vertical column(s) starting at (x, y); style.breaks splits columns
 *   'grid'   rows of style.cols characters centred on (x, y)
 *   'scatter' characters strewn around (x, y) within style.spread
 *   'arc'    along an arc of radius style.radius
 *   'split'  first part left of centre, rest right (style.at = split index)
 *   'pos'    explicit style.pos[i] = [x, y, sizeMul]
 */
const layoutCache = new WeakMap();
export function layoutLine(line, style) {
  let byStyle = layoutCache.get(style);
  if (!byStyle) layoutCache.set(style, (byStyle = new Map()));
  if (byStyle.has(line)) return byStyle.get(line);
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
  const vis = out.filter((c) => c.x > -500);
  const cx = vis.reduce((a, c) => a + c.x, 0) / Math.max(1, vis.length);
  const cy = vis.reduce((a, c) => a + c.y, 0) / Math.max(1, vis.length);
  for (const c of out) {
    c.cx = cx;
    c.cy = cy;
  }
  byStyle.set(line, out);
  return out;
}

/** Bounding box [x, y, w, h] of a laid-out line (rest-screen coordinates). */
export function lineBox(items) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const c of items) {
    if (c.x < -500) continue;
    const r = c.size * 0.55;
    x0 = Math.min(x0, c.x - r);
    y0 = Math.min(y0, c.y - r);
    x1 = Math.max(x1, c.x + r);
    y1 = Math.max(y1, c.y + r);
  }
  return [x0, y0, x1 - x0, y1 - y0];
}

// ------------------------------------------------------------- animation --
const IN = {
  // slam down from large and blurred
  stamp: (p) => ({ s: lerp(2.3, 1, ease.outExpo(p)), a: clamp(p * 3) }),
  drop: (p) => ({ dy: -140 * (1 - ease.outBack(p, 2.2)), a: clamp(p * 2.5) }),
  rise: (p) => ({ dy: 90 * (1 - ease.outExpo(p)), a: clamp(p * 2), blur: (1 - p) * 4 }),
  soft: (p) => ({ a: ease.outCubic(p), blur: (1 - ease.outCubic(p)) * 12, s: lerp(1.08, 1, p) }),
  zoom: (p) => ({ s: lerp(6, 1, ease.outExpo(p)), a: clamp(p * 1.6) }),
  flip: (p) => ({ sx: Math.max(0.02, Math.abs(Math.cos((1 - ease.outBack(p, 1.8)) * Math.PI * 0.5))), a: clamp(p * 3) }),
  grow: (p) => ({ sy: Math.max(0.02, ease.outBack(p, 2)), a: clamp(p * 4), oy: 0.5 }),
  slide: (p, c) => ({ dx: (c.st.dir ?? 1) * 240 * (1 - ease.outExpo(p)), a: clamp(p * 2) }),
  scatter: (p, c) => ({ dx: (hash(c.i, 7) - 0.5) * 900 * (1 - ease.outExpo(p)), dy: (hash(c.i, 8) - 0.5) * 600 * (1 - ease.outExpo(p)), rot: (hash(c.i, 9) - 0.5) * 3 * (1 - ease.outExpo(p)), a: clamp(p * 2) }),
  glitch: (p) => ({ a: p < 0.15 ? (Math.floor(p * 40) % 2) : 1, rgb: (1 - ease.outCubic(p)) * 18, jx: (1 - p) * 14 }),
  freeze: (p, c, t) => ({ a: clamp(p * 2), jx: (1 - ease.outCubic(p)) * 7 * Math.sin(t * 90 + c.i), blur: (1 - p) * 4 }),
  type: (p) => ({ a: p > 0 ? 1 : 0, cursor: p < 1 }),
  ink: (p) => ({ ink: p }),
  // spring pop from nothing
  pop: (p) => ({ s: Math.max(0.001, ease.outBack(p, 2.6)), a: clamp(p * 4) }),
  // rises out of an invisible line under the glyph
  mask: (p) => ({ mask: ease.outExpo(p) }),
  // tracking in: glyphs slide together from a wider spacing
  track: (p, c) => ({ dx: (c.x - c.cx) * 0.9 * (1 - ease.outExpo(p)), a: clamp(p * 2.5) }),
};

const OUT = {
  fade: (p) => ({ a: 1 - p }),
  cut: (p) => ({ a: p > 0 ? 0 : 1 }),
  blow: (p, c) => ({ dx: ease.inCubic(p) * (260 + hash(c.i, 3) * 200), dy: -ease.inCubic(p) * (80 + hash(c.i, 4) * 120), rot: ease.inCubic(p) * (hash(c.i, 5) - 0.5) * 2, a: 1 - ease.inQuad(p), blur: p * 6 }),
  drift: (p, c) => ({ dy: -ease.inQuad(p) * 140, dx: (hash(c.i, 6) - 0.5) * 120 * p, a: 1 - p, blur: p * 6 }),
  drop: (p, c) => ({ dy: ease.inCubic(p) * (500 + hash(c.i, 2) * 300), rot: (hash(c.i, 1) - 0.5) * p * 1.5, a: 1 - ease.inQuad(p) }),
  zoom: (p) => ({ s: 1 + ease.inExpo(p) * 4, a: 1 - p }),
  slash: (p, c) => ({ cut: p, a: 1, sl: hash(c.i, 11) }),
  shatter: (p, c) => ({ sh: p, a: 1 - ease.inQuad(p), sl: hash(c.i, 12) }),
  glitch: (p) => ({ a: p > 0.6 ? 0 : (Math.floor(p * 30) % 2 ? 0.2 : 1), rgb: p * 24, jx: p * 30 }),
  mask: (p) => ({ mask: -ease.inExpo(p) }),
  shrink: (p) => ({ s: Math.max(0.001, 1 - ease.inBack(p)), a: 1 - ease.inQuad(p) }),
};

/** Exit time of a line under a style. */
export const exitAt = (line, style) => style.outAt ?? line.end + (style.hold ?? 0.15);

/** Is any part of the line on screen at t? */
export function lineLive(line, style, t) {
  const lead = style.lead ?? 0.03;
  const outDur = style.outDur ?? 0.35;
  const stagger = style.outStagger ?? 0.03;
  return t >= line.chars[0][1] - lead - 0.01 && t <= exitAt(line, style) + outDur + stagger * line.chars.length + 0.05;
}

/**
 * Draw one lyric line at time t.
 *  style.in / style.out   animation names (see IN / OUT)
 *  style.inDur, outDur    seconds
 *  style.lead             start the in-animation this long before the syllable
 *  style.outAt            time the exit starts (defaults to line end + hold)
 */
export function drawLine(g, line, style, t, opts = {}) {
  if (!lineLive(line, style, t)) return;
  const inDur = style.inDur ?? 0.28;
  const outDur = style.outDur ?? 0.35;
  const lead = style.lead ?? 0.03;
  const outAt = exitAt(line, style);
  const stagger = style.outStagger ?? 0.03;
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
  const blur = ((A.blur ?? 0) + (B.blur ?? 0)) * (opts.blurScale ?? 1);
  // 'grow' scales from the baseline instead of the centre
  const oy = A.oy ? c.size * 0.45 : 0;
  g.save();
  g.translate(x, y + oy);
  const rot = (c.rot ?? 0) + (st.rot ?? 0) + (A.rot ?? 0) + (B.rot ?? 0);
  if (rot) g.rotate(rot);
  g.scale(s * (A.sx ?? 1), s * (A.sy ?? 1));
  g.globalAlpha *= a;
  if (blur > 0.6) g.filter = `blur(${blur.toFixed(1)}px)`;
  const rgb = (A.rgb ?? 0) + (B.rgb ?? 0);
  const mask = A.mask !== undefined && A.mask < 1 ? A.mask : B.mask !== undefined && B.mask < 0 ? B.mask : null;
  if (mask !== null) {
    // the glyph slides through a slot: up from below on entry, up and out on exit
    const h = c.size * 0.62;
    g.beginPath();
    g.rect(-w / 2, -h, w, h * 2);
    g.clip();
    const off = mask >= 0 ? (1 - mask) * h * 2 : mask * h * 2;
    g.drawImage(img, -w / 2, -w / 2 - oy + off);
  } else if (B.cut !== undefined) {
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
    // echo: hollow copies expanding off a glyph as it lands
    const age = t - c.t;
    if (st.echo && age > 0 && age < 0.6) {
      const { c: ring, w: rw } = glyph(c.ch, Math.round(c.size), { ...st, outline: 2.5, glow: null, glowBlur: 0, stroke: null });
      for (let e = 1; e <= 3; e++) {
        const k = 1 + e * 0.13 * (0.3 + age * 2.2);
        g.save();
        g.globalAlpha *= (1 - age / 0.6) * (0.55 / e);
        g.scale(k, k);
        g.drawImage(ring, -rw / 2, -rw / 2 - oy);
        g.restore();
      }
    }
  }
  if (A.cursor) {
    g.filter = 'none';
    g.fillStyle = st.color ?? '#fff';
    g.fillRect(c.size * 0.55, -c.size * 0.45, c.size * 0.08, c.size * 0.9);
  }
  g.restore();
}

// colour-separated copies for RGB-split glitches
const tintCache = new Map();
function tinted(img, col) {
  let entry = tintCache.get(img);
  if (!entry) {
    entry = new Map();
    tintCache.set(img, entry);
  }
  if (entry.has(col)) return entry.get(col);
  const c = makeCanvas(img.width, img.height);
  const g = ctx2d(c);
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = col;
  g.fillRect(0, 0, c.width, c.height);
  entry.set(col, c);
  return c;
}

// --------------------------------------------------------- ghost type --
/**
 * Oversized hollow lettering behind a line (style.ghost = {text, x, y, size,
 * color, alpha, drift}): it fades in with the line and creeps larger.
 */
export function drawGhost(g, line, style, t) {
  const gh = style.ghost;
  if (!gh || t < line.chars[0][1] || !lineLive(line, style, t)) return;
  const t0 = line.chars[0][1];
  const t1 = exitAt(line, style) + (style.outDur ?? 0.35);
  const a = clamp((t - t0) / 0.25) * (1 - clamp((t - t1 + 0.3) / 0.3)) * (gh.alpha ?? 0.16);
  if (a <= 0.003) return;
  const text = gh.text ?? line.text;
  const size = gh.size ?? 420;
  const k = 1 + (gh.drift ?? 0.08) * clamp((t - t0) / (t1 - t0));
  g.save();
  g.translate(gh.x ?? 960, gh.y ?? 540);
  g.scale(k, k);
  g.globalAlpha *= a;
  g.font = font(size, gh.weight ?? 900, FONTS[gh.font ?? 'sans']);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.letterSpacing = `${Math.round(size * (gh.track ?? 0.04))}px`;
  g.lineJoin = 'round';
  g.strokeStyle = gh.color ?? '#ffffff';
  g.lineWidth = gh.width ?? 2.5;
  if (gh.vertical) {
    [...text].forEach((ch, i) => g.strokeText(ch, 0, (i - (text.length - 1) / 2) * size * 1.02));
  } else g.strokeText(text, 0, 0);
  g.restore();
}

// ------------------------------------------------------ subtitle lockup --
/**
 * Bilingual lockup under the kinetic lyric: pinyin that lights up syllable
 * by syllable as it is sung, and the English line beneath it.
 */
export function drawSubtitle(g, line, style, t, o = {}) {
  if (!line.en || style.sub === false) return;
  const sub = style.sub ?? {};
  const first = line.chars[0][1];
  const t0 = first - 0.2;
  // hold until the line has gone, but always clear out before the next one
  const end = Math.min(exitAt(line, style) + 0.7, o.until ?? Infinity);
  if (t < t0 || t > end) return;
  const a = ease.outCubic(clamp((t - t0) / 0.3)) * (1 - ease.inCubic(clamp((t - end + 0.25) / 0.25)));
  if (a <= 0.003) return;
  const x = sub.x ?? o.x ?? 960;
  const y = sub.y ?? o.y ?? 1000;
  const align = sub.align ?? 'center';
  const ink = o.dark ? '34,26,24' : '255,255,255';
  const shade = o.dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.75)';
  g.save();
  g.textBaseline = 'alphabetic';
  g.shadowColor = shade;
  g.shadowBlur = 10;
  // pinyin, one syllable at a time
  g.font = font(17, 400, FONTS.sans);
  g.letterSpacing = '1.5px';
  const syl = line.py ?? [];
  const gap = 12;
  const widths = syl.map((s) => g.measureText(s).width);
  const total = widths.reduce((p, w) => p + w, 0) + gap * Math.max(0, syl.length - 1);
  let px = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
  g.textAlign = 'left';
  syl.forEach((s, i) => {
    const ct = line.chars[i]?.[1] ?? first;
    const lit = clamp((t - ct + 0.04) / 0.1);
    g.fillStyle = `rgba(${ink},${a * (0.3 + 0.62 * lit)})`;
    g.fillText(s, px, y - 40 - 3 * (1 - lit));
    if (lit > 0 && lit < 1) {
      // a tick under the syllable being sung
      g.fillStyle = `rgba(226,72,58,${a * (1 - lit)})`;
      g.fillRect(px, y - 32, widths[i], 2);
    }
    px += widths[i] + gap;
  });
  // English
  g.font = font(31, 500, FONTS.latin, 'italic');
  g.letterSpacing = '0.5px';
  g.textAlign = align;
  g.fillStyle = `rgba(${ink},${a * 0.95})`;
  g.fillText(line.en, x, y + 6 * (1 - a));
  g.restore();
}

export { TAU };
