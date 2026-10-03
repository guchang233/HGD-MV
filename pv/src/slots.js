// Picture slots.  Every illustrated shot shows one numbered slot from
// assets/slots.json.  A file pv/assets/images/<id>.(png|jpg|webp) fills the
// slot; until it exists a placeholder card stands in, tinted to the slot's
// mood and labelled with its number so the prompt is easy to find in
// PROMPTS.md.  Optional depth layers (tools/ai/make_layers.py) give the
// picture real parallax.
import { W, H, TAU, clamp, makeCanvas, ctx2d, mulberry32 } from './core.js';
import { layer, coverNeed } from './camera.js';
import { font, LATIN } from './type.js';

const SANS = '"PV Sans SC", sans-serif';

export const MOODS = {
  night: { top: '#060912', bottom: '#1a2644', glow: '#4a64a8', ink: '235,240,255' },
  snow: { top: '#25324a', bottom: '#9aacc4', glow: '#eef4fb', ink: '240,246,255' },
  paper: { top: '#f7f3eb', bottom: '#ded6c7', glow: '#ffffff', ink: '58,46,42' },
  red: { top: '#2e0407', bottom: '#a8171e', glow: '#ff7a5e', ink: '255,236,230' },
  dark: { top: '#030304', bottom: '#151117', glow: '#45313a', ink: '230,222,226' },
  gold: { top: '#241205', bottom: '#c98a36', glow: '#ffe4a6', ink: '255,246,226' },
  green: { top: '#0c2416', bottom: '#4d8f5f', glow: '#d4f5c8', ink: '240,255,240' },
};

const LW = 64;
const LH = 36;

function lumaMap(img) {
  const c = makeCanvas(LW, LH, true);
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0, LW, LH);
  const d = g.getImageData(0, 0, LW, LH).data;
  const out = new Float32Array(LW * LH);
  let sum = 0;
  for (let i = 0; i < out.length; i++) {
    out[i] = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;
    sum += out[i];
  }
  return { map: out, mean: sum / out.length };
}

// ------------------------------------------------------- placeholder --
function placeholder(def) {
  const mood = MOODS[def.mood] ?? MOODS.dark;
  const c = makeCanvas(W, H, true);
  const g = ctx2d(c);
  const [fx, fy] = def.focus ?? [0.5, 0.5];
  const px = fx * W;
  const py = fy * H;
  const r = mulberry32(parseInt(def.id, 10) + 7);

  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, mood.top);
  sky.addColorStop(1, mood.bottom);
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);
  // light where the subject will be
  const glow = g.createRadialGradient(px, py, 0, px, py, 820);
  glow.addColorStop(0, mood.glow + 'aa');
  glow.addColorStop(0.45, mood.glow + '33');
  glow.addColorStop(1, mood.glow + '00');
  g.fillStyle = glow;
  g.fillRect(0, 0, W, H);
  // a few soft out-of-focus shapes for depth
  for (let i = 0; i < 9; i++) {
    const x = r() * W;
    const y = r() * H;
    const rad = 60 + r() * 220;
    const blob = g.createRadialGradient(x, y, 0, x, y, rad);
    blob.addColorStop(0, `rgba(${mood.ink},${0.05 + r() * 0.05})`);
    blob.addColorStop(1, `rgba(${mood.ink},0)`);
    g.fillStyle = blob;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }

  const ink = (a) => `rgba(${mood.ink},${a})`;
  // composition guides: thirds, safe frame, focus target
  g.strokeStyle = ink(0.07);
  g.lineWidth = 1.5;
  g.beginPath();
  for (const k of [1, 2]) {
    g.moveTo((W * k) / 3, 0);
    g.lineTo((W * k) / 3, H);
    g.moveTo(0, (H * k) / 3);
    g.lineTo(W, (H * k) / 3);
  }
  g.stroke();
  g.strokeStyle = ink(0.18);
  g.lineWidth = 2;
  const m = 110;
  const L = 46;
  g.beginPath();
  for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
    g.moveTo(x, y + sy * L);
    g.lineTo(x, y);
    g.lineTo(x + sx * L, y);
  }
  g.stroke();

  // the subject: a soft silhouette for the heroine, rings for anything else
  g.save();
  g.translate(px, py);
  if (def.heroine) {
    // bust silhouette: head with the two side buns, neck, shoulders
    g.fillStyle = ink(0.11);
    g.beginPath();
    g.ellipse(0, -150, 58, 66, 0, 0, TAU);
    g.fill();
    g.beginPath();
    g.arc(-60, -196, 27, 0, TAU);
    g.arc(60, -196, 27, 0, TAU);
    g.fill();
    g.beginPath();
    g.moveTo(-22, -96);
    g.lineTo(-24, -58);
    g.bezierCurveTo(-70, -44, -150, -30, -176, 30);
    g.bezierCurveTo(-196, 80, -200, 180, -204, 250);
    g.lineTo(204, 250);
    g.bezierCurveTo(200, 180, 196, 80, 176, 30);
    g.bezierCurveTo(150, -30, 70, -44, 24, -58);
    g.lineTo(22, -96);
    g.closePath();
    g.fill();
  } else {
    g.strokeStyle = ink(0.16);
    g.lineWidth = 2;
    for (const rad of [90, 190, 320]) {
      g.beginPath();
      g.arc(0, 0, rad, 0, TAU);
      g.stroke();
    }
  }
  g.strokeStyle = ink(0.45);
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(-26, 0);
  g.lineTo(26, 0);
  g.moveTo(0, -26);
  g.lineTo(0, 26);
  g.stroke();
  g.restore();

  // label beside the subject
  const right = px < W * 0.62;
  const lx = px + (right ? 70 : -70);
  g.textAlign = right ? 'left' : 'right';
  g.textBaseline = 'alphabetic';
  g.fillStyle = ink(0.55);
  g.font = font(60, 500, LATIN);
  g.fillText(`S${def.id}`, lx, py + 64);
  g.font = font(30, 500, SANS);
  g.fillStyle = ink(0.5);
  g.fillText(def.name, lx, py + 108);
  g.font = font(15, 400, SANS);
  g.fillStyle = ink(0.38);
  g.fillText('PLACEHOLDER · 提示词见 PROMPTS.md', lx, py + 138);

  // dither so the gradients do not band after encoding
  const img = g.getImageData(0, 0, W, H);
  const d = img.data;
  let s = 12345;
  for (let i = 0; i < d.length; i += 4) {
    s = (s * 1103515245 + 12345) >>> 0;
    const n = ((s >>> 16) & 7) - 3.5;
    d[i] = clamp(d[i] + n, 0, 255);
    d[i + 1] = clamp(d[i + 1] + n, 0, 255);
    d[i + 2] = clamp(d[i + 2] + n, 0, 255);
  }
  g.putImageData(img, 0, 0);
  return c;
}

// Very large pictures are resampled once (high quality) to a working size,
// so per-frame bilinear filtering never has to shrink them much.
function fit(img) {
  if (!img || img.naturalWidth <= 2600) return img;
  const k = 2400 / img.naturalWidth;
  const c = makeCanvas(2400, Math.round(img.naturalHeight * k), true);
  const g = c.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

// ------------------------------------------------------------ loader --
export class Slots {
  /**
   * defs: slots.json `slots`; files: { "<id>": url, "<id>_bg": url,
   * "<id>_fg": url } for the images that exist.
   */
  constructor(defs, files = {}) {
    this.defs = Object.fromEntries(defs.map((d) => [d.id, d]));
    this.files = files;
    this.cache = new Map();
  }

  has(id) {
    return Boolean(this.files[id] || this.files[`${id}_bg`]);
  }

  load(id) {
    if (this.cache.has(id)) {
      const p = this.cache.get(id);
      this.cache.delete(id);
      this.cache.set(id, p);
      return p;
    }
    const def = this.defs[id];
    if (!def) throw new Error(`unknown slot ${id}`);
    const img = (url) => {
      if (!url) return Promise.resolve(null);
      const el = new Image();
      el.decoding = 'sync';
      el.src = url;
      return el.decode().then(() => el, () => null);
    };
    const f = this.files;
    const p = (async () => {
      const layered = f[`${id}_bg`] && f[`${id}_fg`];
      const [bg, fg] = (await Promise.all([img(layered ? f[`${id}_bg`] : f[id]), layered ? img(f[`${id}_fg`]) : null])).map(fit);
      const pic = bg ?? placeholder(def);
      return { id, def, img: pic, fg, placeholder: !bg, ...lumaMap(pic) };
    })();
    this.cache.set(id, p);
    if (this.cache.size > 10) this.cache.delete(this.cache.keys().next().value);
    return p;
  }

  async get(ids) {
    const out = {};
    await Promise.all([...new Set(ids)].map(async (id) => (out[id] = await this.load(id))));
    return out;
  }
}

/** Mean luminance of a slot under a rest-screen rectangle (cover fit). */
export function lumaUnder(slot, x, y, w, h) {
  if (!slot) return 0.5;
  const x0 = clamp(Math.floor((x / W) * LW), 0, LW - 1);
  const x1 = clamp(Math.ceil(((x + w) / W) * LW), x0 + 1, LW);
  const y0 = clamp(Math.floor((y / H) * LH), 0, LH - 1);
  const y1 = clamp(Math.ceil(((y + h) / H) * LH), y0 + 1, LH);
  let sum = 0;
  for (let j = y0; j < y1; j++) for (let i = x0; i < x1; i++) sum += slot.map[j * LW + i];
  return sum / ((x1 - x0) * (y1 - y0));
}

/**
 * Draw a slot as a card at distance d.  The picture is cover-fitted to the
 * frame and enlarged by `cover` (computed per shot so the camera never sees
 * an edge).  o.anchor puts the picture's focus at a screen point (split
 * screens); o.clip limits drawing to a rect.
 */
// paper grain printed into the pictures
let paper = null;
function paperSheet() {
  if (paper) return paper;
  const n = 512;
  paper = makeCanvas(n, n, true);
  const g = paper.getContext('2d');
  const d = g.createImageData(n, n);
  const r = mulberry32(99);
  for (let i = 0; i < n * n; i++) {
    const v = 236 + r() * 19 - (r() < 0.02 ? 18 * r() : 0);
    d.data[i * 4] = v;
    d.data[i * 4 + 1] = v - 2;
    d.data[i * 4 + 2] = v - 6;
    d.data[i * 4 + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  // a few long fibres
  g.strokeStyle = 'rgba(150,140,125,0.12)';
  g.lineWidth = 0.8;
  for (let i = 0; i < 140; i++) {
    const x = r() * n;
    const y = r() * n;
    const a2 = r() * TAU;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a2) * 20 + r() * 10, y + Math.sin(a2) * 20, x + Math.cos(a2) * 40, y + Math.sin(a2) * 40);
    g.stroke();
  }
  return paper;
}

export function drawCard(g, slot, cam, d, cover = 1, o = {}) {
  if (!slot) return;
  const img = slot.img;
  const iw = img.naturalWidth ?? img.width;
  const ih = img.naturalHeight ?? img.height;
  const s = Math.max(W / iw, H / ih) * cover * (o.zoom ?? 1);
  // real pictures are 3:2: crop more from the bottom than the top so heads
  // survive the 16:9 frame and the camera moves (slot.cropY overrides)
  const [fx, fy] = o.anchor ? slot.def.focus ?? [0.5, 0.5] : [0.5, slot.placeholder ? 0.5 : slot.def.cropY ?? 0.4];
  const [ax, ay] = o.anchor ?? [W / 2, H / 2];
  const x = ax - fx * iw * s;
  const y = ay - fy * ih * s;
  g.save();
  if (o.clip) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.beginPath();
    g.rect(...o.clip);
    g.clip();
  }
  if (o.filter) g.filter = o.filter;
  layer(g, cam, d);
  g.drawImage(img, x, y, iw * s, ih * s);
  if (!slot.placeholder) {
    // paper grain printed into the picture
    g.globalCompositeOperation = 'multiply';
    g.globalAlpha = 0.35;
    g.fillStyle = g.createPattern(paperSheet(), 'repeat');
    g.fillRect(x, y, iw * s, ih * s);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  }
  if (slot.fg) {
    // the cut-out subject sits nearer the lens; both layers meet at rest
    layer(g, cam, d * 0.8);
    g.drawImage(slot.fg, x, y, iw * s, ih * s);
  }
  g.restore();
}

/** Cover scale a card at distance d needs over a list of camera states. */
export function coverFor(cams, d, margin = 1.02) {
  let need = 1;
  for (const c of cams) need = Math.max(need, coverNeed(c, d), slotFgNeed(c, d));
  return need * margin;
}
const slotFgNeed = (c, d) => coverNeed(c, d * 0.8);
