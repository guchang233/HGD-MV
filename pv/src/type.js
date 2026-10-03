// Typography: Song-style serif (Noto Serif SC, like the MV's lettering),
// vertical layout and ink-bleed reveals.
import { TAU, clamp, ease, makeCanvas, ctx2d, mulberry32 } from './core.js';

export const SERIF = '"PV Serif SC", serif';
export const LATIN = '"PV Garamond", serif';

export async function loadFonts(base) {
  const faces = [
    new FontFace('PV Serif SC', `url(${base}/NotoSerifSC-VF.woff2)`, { weight: '200 900' }),
    new FontFace('PV Garamond', `url(${base}/CormorantGaramond-VF.woff2)`, { weight: '300 700' }),
    new FontFace('PV Garamond', `url(${base}/CormorantGaramond-Italic.woff2)`, { style: 'italic', weight: '400' }),
    new FontFace('PV Sans SC', `url(${base}/NotoSansSC-VF.woff2)`, { weight: '100 900' }),
    new FontFace('PV Brush', `url(${base}/ZhiMangXing.woff2)`),
    new FontFace('PV Cursive', `url(${base}/LiuJianMaoCao.woff2)`),
  ];
  for (const f of faces) document.fonts.add(await f.load());
  await document.fonts.ready;
}

export const font = (size, weight = 600, family = SERIF, style = 'normal') =>
  `${style} ${weight} ${Math.round(size)}px ${family}`;

/**
 * Lay out `text` as a vertical column starting at (x, y) (top centre of the
 * first character).  Returns [{ch, x, y}] in reading order.
 */
export function verticalLayout(text, x, y, size, lead = 1.08) {
  const out = [];
  let cy = y + size / 2;
  for (const ch of text) {
    if (ch === ' ') {
      cy += size * 0.5;
      continue;
    }
    if (ch === '。' || ch === '，' || ch === '、') {
      out.push({ ch, x: x + size * 0.32, y: cy - size * 0.32, punct: true });
      cy += size * 0.45;
      continue;
    }
    out.push({ ch, x, y: cy });
    cy += size * lead;
  }
  return out;
}

/** Spaced horizontal layout (centre-anchored).  Returns [{ch, x, y}]. */
export function horizontalLayout(g, text, cx, y, size, tracking = 0) {
  const chars = [...text];
  const widths = chars.map((c) => g.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * size * (chars.length - 1);
  let x = cx - total / 2;
  return chars.map((ch, i) => {
    const o = { ch, x: x + widths[i] / 2, y };
    x += widths[i] + tracking * size;
    return o;
  });
}

// --------------------------------------------------------- ink reveal --
const inkCache = new Map();

function glyphCanvas(ch, size, weight, color, family) {
  const key = `${ch}|${size}|${weight}|${color}|${family}`;
  if (inkCache.has(key)) return inkCache.get(key);
  const pad = Math.ceil(size * 0.35);
  const s = Math.ceil(size + pad * 2);
  const c = makeCanvas(s, s);
  const g = ctx2d(c);
  g.font = font(size, weight, family);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = color;
  g.fillText(ch, s / 2, s / 2 + size * 0.04);
  const item = { c, s };
  inkCache.set(key, item);
  return item;
}

// a per-glyph noise mask computed at low resolution
const maskCache = new Map();
function inkGlyphMask(p, seed, n = 48) {
  const key = `${seed}`;
  let m = maskCache.get(key);
  if (!m) {
    const r = mulberry32(seed * 977 + 3);
    const field = new Float32Array(n * n);
    // a few blobs of "ink pooling" + noise
    const blobs = Array.from({ length: 5 }, () => [r.range(0.25, 0.75), r.range(0.25, 0.75), r.range(0.15, 0.4)]);
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const nx = x / (n - 1);
        const ny = y / (n - 1);
        let v = 1;
        for (const [bx, by, br] of blobs) v = Math.min(v, Math.hypot(nx - bx, ny - by) / (br * 2.4));
        field[y * n + x] = v * 0.75 + r() * 0.25;
      }
    }
    const c = makeCanvas(n, n);
    m = { c, g: ctx2d(c), field, img: null, n };
    m.img = m.g.createImageData(n, n);
    maskCache.set(key, m);
  }
  const d = m.img.data;
  const reach = p * 1.25;
  for (let i = 0; i < m.n * m.n; i++) {
    const v = reach - m.field[i];
    const a = v <= 0 ? 0 : v >= 0.12 ? 255 : (v / 0.12) * 255;
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = 255;
    d[i * 4 + 3] = a;
  }
  m.g.putImageData(m.img, 0, 0);
  return m.c;
}

let scratch = null;
let gscratch = null;

/**
 * Draw one character revealing like ink soaking into paper.
 * p: 0..1 reveal progress.  bleed: soft halo strength.
 */
export function inkChar(g, ch, x, y, size, p, o = {}) {
  if (p <= 0) return;
  const weight = o.weight ?? 900;
  const color = o.color ?? '#c8102e';
  const family = o.family ?? SERIF;
  const { c, s } = glyphCanvas(ch, size, weight, color, family);
  const scale = (o.scale ?? 1) * (1 + (1 - ease.outCubic(clamp(p * 1.6))) * (o.settle ?? 0.08));
  const alpha = o.alpha ?? 1;
  g.save();
  g.translate(x, y);
  if (o.rot) g.rotate(o.rot);
  g.scale(scale, scale);
  if (p >= 0.999) {
    g.globalAlpha *= alpha;
    g.drawImage(c, -s / 2, -s / 2);
  } else {
    const k = Math.min(1, 512 / s);
    if (!scratch) {
      scratch = makeCanvas(512, 512);
      gscratch = ctx2d(scratch);
    }
    gscratch.save();
    gscratch.globalCompositeOperation = 'copy';
    gscratch.drawImage(c, 0, 0, s * k, s * k);
    gscratch.globalCompositeOperation = 'destination-in';
    gscratch.drawImage(inkGlyphMask(p, o.seed ?? ch.charCodeAt(0)), 0, 0, s * k, s * k);
    gscratch.restore();
    g.globalAlpha *= alpha;
    g.drawImage(scratch, 0, 0, s * k, s * k, -s / 2, -s / 2, s, s);
  }
  // ink halo soaking outward
  const halo = (o.bleed ?? 0.35) * Math.sin(Math.PI * clamp(p)) ;
  if (halo > 0.01) {
    g.globalAlpha = alpha * halo;
    g.filter = `blur(${Math.max(2, size * 0.04)}px)`;
    g.drawImage(c, -s / 2 - size * 0.02, -s / 2 - size * 0.02, s * 1.04, s * 1.04);
  }
  g.restore();
}

/** Plain character with optional blur-to-sharp focus and drop scale. */
export function softChar(g, ch, x, y, size, p, o = {}) {
  if (p <= 0) return;
  g.save();
  g.font = font(size, o.weight ?? 600, o.family ?? SERIF, o.style ?? 'normal');
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = o.color ?? '#222';
  g.globalAlpha *= clamp(p) * (o.alpha ?? 1);
  const blur = (1 - clamp(p)) * (o.blur ?? 6);
  if (blur > 0.3) g.filter = `blur(${blur}px)`;
  const s = 1 + (1 - ease.outCubic(clamp(p))) * (o.grow ?? 0.15);
  g.translate(x, y + (1 - ease.outCubic(clamp(p))) * (o.rise ?? 0));
  g.scale(s, s);
  g.fillText(ch, 0, size * 0.04);
  g.restore();
}

/** Square red seal (印章) with carved characters, rendered once and cached. */
const sealCache = new Map();
function sealImage(text, size, color, seed) {
  const key = `${text}|${size}|${color}|${seed}`;
  if (sealCache.has(key)) return sealCache.get(key);
  const pad = Math.ceil(size * 0.1);
  const c = makeCanvas(size + pad * 2, size + pad * 2);
  const g = ctx2d(c);
  const r = mulberry32(seed);
  g.translate(c.width / 2, c.height / 2);
  g.fillStyle = color;
  g.beginPath();
  const h = size / 2;
  const pts = 28;
  for (let i = 0; i < pts; i++) {
    const side = Math.floor(i / (pts / 4));
    const f = (i % (pts / 4)) / (pts / 4);
    const j = (r() - 0.5) * size * 0.035;
    const [px, py] = [
      [-h + f * size, -h + j],
      [h + j, -h + f * size],
      [h - f * size, h + j],
      [-h + j, h - f * size],
    ][side];
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.fill();
  // carve the characters (white space of a 朱文/白文 seal)
  g.globalCompositeOperation = 'destination-out';
  g.font = font(size * 0.4, 800);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#000';
  const chars = [...text];
  if (chars.length === 2) {
    g.fillText(chars[0], 0, -size * 0.2);
    g.fillText(chars[1], 0, size * 0.22);
  } else {
    chars.forEach((ch, i) => g.fillText(ch, (i % 2 ? -1 : 1) * size * 0.2, (i < 2 ? -1 : 1) * size * 0.2));
  }
  // worn texture
  for (let i = 0; i < 40; i++) {
    g.globalAlpha = 0.25 + r() * 0.4;
    g.beginPath();
    g.arc((r() - 0.5) * size, (r() - 0.5) * size, r() * size * 0.03, 0, TAU);
    g.fill();
  }
  sealCache.set(key, c);
  return c;
}

export function seal(g, text, x, y, size, p, o = {}) {
  if (p <= 0) return;
  const img = sealImage(text, size, o.color ?? '#b81d24', o.seed ?? 9);
  const k = ease.outBack(clamp(p), 2.2);
  const sc = 1.6 - 0.6 * k;
  g.save();
  g.translate(x, y);
  g.rotate(o.rot ?? -0.04);
  g.scale(sc, sc);
  g.globalAlpha *= clamp(p * 3) * (o.alpha ?? 0.92);
  g.drawImage(img, -img.width / 2, -img.height / 2);
  g.restore();
}
