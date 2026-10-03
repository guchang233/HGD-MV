// Motion-graphics vocabulary for the PV: HUD furniture, shockwaves, speed
// lines, lattice frames, a self-drawing house, the 24 solar terms dial,
// brush strokes, ink splashes, butterflies and glitch slices.
import { W, H, TAU, clamp, ease, lerp, hash, mulberry32, noise1, makeCanvas, ctx2d, rgba } from './core.js';
import { font } from './type.js';
import { FONTS } from './lyrics.js';

// ------------------------------------------------------------------ HUD --
// Camera-viewfinder furniture: corner brackets, title, section, timecode,
// bar/beat counter, lyric and picture-slot index, song progress.
export function hud(g, t, o = {}) {
  const a = o.alpha ?? 1;
  if (a <= 0) return;
  const col = o.color ?? '255,255,255';
  const m = o.margin ?? 46;
  const L = 34;
  g.save();
  g.globalAlpha = a;
  g.strokeStyle = `rgba(${col},0.75)`;
  g.lineWidth = 2;
  for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
    g.beginPath();
    g.moveTo(x, y + sy * L);
    g.lineTo(x, y);
    g.lineTo(x + sx * L, y);
    g.stroke();
  }
  g.font = font(15, 500, FONTS.sans);
  g.letterSpacing = '2px';
  g.fillStyle = `rgba(${col},0.85)`;
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  if (o.tl) g.fillText(o.tl, m + 12, m + 54);
  if (o.sec) {
    g.fillStyle = `rgba(${col},0.55)`;
    g.fillText(o.sec, m + 12, m + 78);
  }
  // bar / beat counter
  const beatIdx = Math.floor((t - 0.055) * 2);
  const bar = Math.max(0, Math.floor(beatIdx / 4) + 1);
  const beat = ((beatIdx % 4) + 4) % 4;
  g.fillStyle = `rgba(${col},0.85)`;
  g.fillText(`BAR ${String(bar).padStart(3, '0')}`, m + 12, H - m - 54);
  for (let i = 0; i < 4; i++) {
    const on = i === beat && t >= 0.055;
    g.fillStyle = on ? 'rgba(226,72,58,1)' : `rgba(${col},0.35)`;
    g.fillRect(m + 112 + i * 16, H - m - 59, 10, 10);
  }
  g.textAlign = 'right';
  if (o.br) g.fillText(o.br, W - m - 12, H - m - 54);
  const tc = o.tc ?? t;
  const mm = Math.floor(tc / 60);
  const ss = Math.floor(tc % 60);
  const ff = Math.floor((tc % 1) * 30);
  g.fillStyle = `rgba(${col},0.85)`;
  g.fillText(`${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}:${String(ff).padStart(2, '0')}`, W - m - 12, m + 54);
  // record dot blinking on the beat
  g.fillStyle = `rgba(226,72,58,${beat % 2 === 0 ? 1 : 0.25})`;
  g.beginPath();
  g.arc(W - m - 132, m + 54, 5, 0, TAU);
  g.fill();
  // progress ticks along the top edge
  g.strokeStyle = `rgba(${col},0.35)`;
  g.lineWidth = 1;
  for (let i = 0; i <= 40; i++) {
    const x = W / 2 - 400 + i * 20;
    g.beginPath();
    g.moveTo(x, m);
    g.lineTo(x, m + (i % 5 === 0 ? 12 : 6));
    g.stroke();
  }
  g.fillStyle = 'rgba(226,72,58,0.9)';
  g.fillRect(W / 2 - 400, m - 6, 800 * clamp(tc / 170.4), 2);
  g.restore();
}

/** Chapter card sliding in at the lower left: number, Chinese title, English. */
export function chapter(g, t, t0, num, cn, en, o = {}) {
  const a = t - t0;
  const dur = o.dur ?? 2.4;
  if (a < 0 || a > dur) return;
  const pin = ease.outExpo(clamp(a / 0.45));
  const pout = ease.inCubic(clamp((a - (dur - 0.4)) / 0.4));
  const col = o.color ?? '255,255,255';
  const x = 96 - 60 * (1 - pin) - 80 * pout;
  const y = H - 190;
  g.save();
  g.globalAlpha = pin * (1 - pout);
  g.fillStyle = `rgba(${col},0.95)`;
  g.font = font(64, 900, FONTS.sans);
  g.textBaseline = 'alphabetic';
  g.textAlign = 'left';
  g.fillText(num, x, y);
  g.fillStyle = 'rgba(226,72,58,1)';
  g.fillRect(x + 92, y - 46, 4, 52);
  g.fillStyle = `rgba(${col},0.95)`;
  g.font = font(40, 700, FONTS.serif);
  g.fillText(cn, x + 112, y - 12);
  g.font = font(16, 500, FONTS.sans);
  g.fillStyle = `rgba(${col},0.7)`;
  g.fillText(en.split('').join(' '), x + 114, y + 14);
  g.fillStyle = 'rgba(226,72,58,0.9)';
  g.fillRect(x, y + 30, 380 * pin, 2);
  g.restore();
}

// ---------------------------------------------------------- shockwaves --
export function ring(g, t, t0, x, y, o = {}) {
  const dur = o.dur ?? 0.6;
  const a = (t - t0) / dur;
  if (a < 0 || a > 1) return;
  const k = ease.outCubic(a);
  g.save();
  g.globalCompositeOperation = o.blend ?? 'screen';
  g.strokeStyle = rgba(o.color ?? '#ffffff', (o.alpha ?? 0.8) * (1 - a));
  g.lineWidth = (o.width ?? 18) * (1 - k) + 1;
  g.beginPath();
  g.arc(x, y, lerp(o.r0 ?? 20, o.r1 ?? 700, k), 0, TAU);
  g.stroke();
  g.restore();
}

export function speedLines(g, t, x, y, amount, o = {}) {
  if (amount <= 0.01) return;
  const r = mulberry32(Math.floor(t * 30) + (o.seed ?? 0));
  g.save();
  g.globalCompositeOperation = o.blend ?? 'screen';
  g.strokeStyle = rgba(o.color ?? '#ffffff', 0.5 * amount);
  for (let i = 0; i < 70; i++) {
    const a = r() * TAU;
    const r0 = 260 + r() * 300;
    const r1 = r0 + 200 + r() * 900;
    g.lineWidth = 1 + r() * 3;
    g.beginPath();
    g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
    g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
    g.stroke();
  }
  g.restore();
}

// --------------------------------------------------- lattice (窗棂) frame --
export function lattice(g, x, y, w, h, p, o = {}) {
  if (p <= 0) return;
  g.save();
  g.strokeStyle = rgba(o.color ?? '#c8102e', o.alpha ?? 0.9);
  g.lineWidth = o.width ?? 4;
  g.lineCap = 'square';
  const cell = o.cell ?? 70;
  const lines = [];
  lines.push([x, y, x + w, y], [x + w, y, x + w, y + h], [x + w, y + h, x, y + h], [x, y + h, x, y]);
  for (let cx = x + cell; cx < x + w - 1; cx += cell) lines.push([cx, y, cx, y + h]);
  for (let cy = y + cell; cy < y + h - 1; cy += cell) lines.push([x, cy, x + w, cy]);
  // a 回-pattern band inside the border
  const i = cell * 0.35;
  lines.push([x + i, y + i, x + w - i, y + i], [x + w - i, y + i, x + w - i, y + h - i], [x + w - i, y + h - i, x + i, y + h - i], [x + i, y + h - i, x + i, y + i]);
  const n = lines.length;
  lines.forEach((ln, k) => {
    const q = clamp(p * n * 0.35 - k * 0.3);
    if (q <= 0) return;
    g.beginPath();
    g.moveTo(ln[0], ln[1]);
    g.lineTo(lerp(ln[0], ln[2], q), lerp(ln[1], ln[3], q));
    g.stroke();
  });
  g.restore();
}

// --------------------------------------------- a house drawing itself --
const HOUSE = [
  // eaves (curved roof) as polylines in unit space (-1..1 x, -1..1 y)
  [[-1.15, -0.25], [-0.9, -0.33], [-0.55, -0.48], [0, -0.62], [0.55, -0.48], [0.9, -0.33], [1.15, -0.25]],
  [[-1.15, -0.25], [-1.25, -0.32]],
  [[1.15, -0.25], [1.25, -0.32]],
  [[-0.95, -0.25], [0.95, -0.25]],
  [[-0.6, -0.62], [0.6, -0.62]],
  [[-0.85, -0.25], [-0.85, 0.75]],
  [[0.85, -0.25], [0.85, 0.75]],
  [[-0.3, -0.25], [-0.3, 0.75]],
  [[0.3, -0.25], [0.3, 0.75]],
  [[-1.0, 0.75], [1.0, 0.75]],
  [[-0.3, 0.1], [0.3, 0.1]],
  [[-0.75, 0.0], [-0.4, 0.0], [-0.4, 0.4], [-0.75, 0.4], [-0.75, 0.0]],
  [[0.4, 0.0], [0.75, 0.0], [0.75, 0.4], [0.4, 0.4], [0.4, 0.0]],
  [[-1.1, 0.85], [1.1, 0.85]],
];
/** Wire-frame house; p = 0..1 build progress, glow = window light 0..1. */
export function house(g, x, y, s, p, o = {}) {
  if (p <= 0) return;
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  g.strokeStyle = o.color ?? '#ffffff';
  g.lineWidth = (o.width ?? 4) / s;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.shadowColor = o.glowColor ?? 'rgba(255,200,140,0.8)';
  g.shadowBlur = 12;
  const n = HOUSE.length;
  HOUSE.forEach((pts, k) => {
    const q = clamp(p * n - k);
    if (q <= 0) return;
    let total = 0;
    for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    let left = total * q;
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length && left > 0; i++) {
      const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      const f = Math.min(1, left / l);
      g.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f));
      left -= l;
    }
    g.stroke();
  });
  const glow = o.glow ?? 0;
  if (glow > 0) {
    g.shadowBlur = 0;
    for (const wx of [-0.575, 0.575]) {
      const grd = g.createRadialGradient(wx, 0.2, 0, wx, 0.2, 0.5);
      grd.addColorStop(0, `rgba(255,190,110,${0.9 * glow})`);
      grd.addColorStop(1, 'rgba(255,150,60,0)');
      g.fillStyle = grd;
      g.fillRect(wx - 0.5, -0.3, 1, 1);
    }
  }
  g.restore();
}

// -------------------------------------------------- 24 solar terms dial --
export const TERMS = ['立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
  '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'];
/** angle: which term sits at the top (fractional index); hi: highlighted indices */
export function solarDial(g, x, y, r, idx, o = {}) {
  const a0 = -Math.PI / 2 - (idx / 24) * TAU;
  const alpha = o.alpha ?? 1;
  g.save();
  g.globalAlpha = alpha;
  g.translate(x, y);
  g.strokeStyle = 'rgba(255,255,255,0.7)';
  g.lineWidth = 2;
  g.beginPath();
  g.arc(0, 0, r, 0, TAU);
  g.stroke();
  g.beginPath();
  g.arc(0, 0, r * 0.72, 0, TAU);
  g.stroke();
  g.lineWidth = 1;
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * TAU;
    const l = i % 5 === 0 ? 16 : 7;
    g.beginPath();
    g.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    g.lineTo(Math.cos(a) * (r - l), Math.sin(a) * (r - l));
    g.stroke();
  }
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  TERMS.forEach((name, i) => {
    const a = a0 + (i / 24) * TAU;
    const hi = (o.hi ?? []).includes(i);
    g.save();
    g.rotate(a + Math.PI / 2);
    g.translate(0, -r * 0.86);
    g.font = font(hi ? 46 : 28, hi ? 900 : 500, FONTS.serif);
    g.fillStyle = hi ? '#ff4b3e' : 'rgba(255,255,255,0.75)';
    if (hi) {
      g.shadowColor = 'rgba(255,60,40,0.9)';
      g.shadowBlur = 20;
    }
    g.fillText(name, 0, 0);
    g.restore();
  });
  // pointer at the top
  g.fillStyle = '#ff4b3e';
  g.beginPath();
  g.moveTo(0, -r - 8);
  g.lineTo(-14, -r - 34);
  g.lineTo(14, -r - 34);
  g.closePath();
  g.fill();
  g.restore();
}

// --------------------------------------------------------- sun and moon --
export function sunMoon(g, x, y, r, phase, o = {}) {
  // phase 0 = sun, 1 = moon (blend through a hard eclipse)
  g.save();
  g.translate(x, y);
  g.globalAlpha = o.alpha ?? 1;
  if (phase < 0.5) {
    const grd = g.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 2.4);
    grd.addColorStop(0, 'rgba(255,240,200,1)');
    grd.addColorStop(0.35, 'rgba(255,160,70,0.5)');
    grd.addColorStop(1, 'rgba(255,120,40,0)');
    g.fillStyle = grd;
    g.fillRect(-r * 2.4, -r * 2.4, r * 4.8, r * 4.8);
    g.fillStyle = '#fff4dc';
    g.beginPath();
    g.arc(0, 0, r, 0, TAU);
    g.fill();
  } else {
    g.fillStyle = '#e8eefc';
    g.shadowColor = 'rgba(180,200,255,0.9)';
    g.shadowBlur = 40;
    g.beginPath();
    g.arc(0, 0, r, 0, TAU);
    g.fill();
    g.globalCompositeOperation = 'destination-out';
    g.shadowBlur = 0;
    g.beginPath();
    g.arc(r * 0.45, -r * 0.2, r * 0.95, 0, TAU);
    g.fill();
  }
  g.restore();
}

// ----------------------------------------------------------- brush swipe --
// A loaded calligraphy brush dragged across the frame.  The stroke is
// painted once into a texture — pressed head, bristle streaks, dry-brush
// tail — and revealed along its length as the brush travels.
const strokeCache = new Map();
function strokeTexture(len, width, seed, color) {
  const key = `${len}|${width}|${seed}|${color}`;
  if (strokeCache.has(key)) return strokeCache.get(key);
  const r = mulberry32(seed);
  const pad = Math.ceil(width * 0.5);
  const c = makeCanvas(len + pad * 2, width + pad * 2);
  const g = ctx2d(c);
  g.translate(pad, c.height / 2);
  // thickness along the stroke: quick press, full belly, lifting tail
  const prof = (u) => {
    const press = ease.outCubic(clamp(u / 0.07));
    const lift = 1 - 0.7 * ease.inQuad(clamp((u - 0.5) / 0.5));
    return (0.82 + 0.18 * press) * lift;
  };
  const edge = (u, side) => (width / 2) * prof(u) * (1 + 0.05 * noise1(u * 30, seed + side)) + 0.02 * width * noise1(u * 90, seed + side * 3);
  const N = 120;
  g.beginPath();
  for (let i = 0; i <= N; i++) g.lineTo((i / N) * len, -edge(i / N, 1));
  for (let i = N; i >= 0; i--) g.lineTo((i / N) * len, edge(i / N, 2));
  // blunt, rounded entry of the pressed brush (藏锋)
  const e0 = (edge(0, 1) + edge(0, 2)) / 2;
  g.ellipse(0, (edge(0, 2) - edge(0, 1)) / 2, e0 * 0.55, e0, 0, Math.PI / 2, (3 * Math.PI) / 2);
  g.closePath();
  const n = parseInt(color.slice(1), 16);
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const shade = (k, a = 1) => `rgba(${Math.round(rgb[0] * k)},${Math.round(rgb[1] * k)},${Math.round(rgb[2] * k)},${a})`;
  const body = g.createLinearGradient(0, -width / 2, 0, width / 2);
  body.addColorStop(0, shade(0.8));
  body.addColorStop(0.25, shade(1));
  body.addColorStop(0.75, shade(0.96));
  body.addColorStop(1, shade(0.78));
  g.fillStyle = body;
  g.fill();
  // bristle streaks
  g.lineCap = 'round';
  for (let i = 0; i < 160; i++) {
    const v = r() - 0.5;
    const u0 = r() * 0.35;
    const u1 = 0.45 + r() * 0.55;
    const dark = r() < 0.55;
    g.strokeStyle = dark ? shade(0.45, 0.1 + r() * 0.25) : `rgba(255,${120 + r() * 80},${100 + r() * 60},${0.06 + r() * 0.16})`;
    g.lineWidth = 0.6 + r() * 2.4;
    g.beginPath();
    for (let j = 0; j <= 12; j++) {
      const u = u0 + ((u1 - u0) * j) / 12;
      g.lineTo(u * len, v * 1.9 * edge(u, 1));
    }
    g.stroke();
  }
  // dry brush: the ink runs out in streaks toward the tail
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 90; i++) {
    const v = r() - 0.5;
    const u0 = 0.4 + r() * 0.45;
    g.strokeStyle = `rgba(0,0,0,${0.5 + r() * 0.5})`;
    g.lineWidth = 1 + r() * r() * 9;
    g.beginPath();
    for (let j = 0; j <= 10; j++) {
      const u = u0 + ((1.02 - u0) * j) / 10;
      g.lineTo(u * len, v * 1.9 * edge(Math.min(u, 1), 1));
    }
    g.stroke();
  }
  g.globalCompositeOperation = 'source-over';
  // a few drops flicked off the head
  for (let i = 0; i < 14; i++) {
    g.fillStyle = shade(0.85, 0.9);
    g.beginPath();
    g.arc(r() * len * 0.25, (r() - 0.5) * width * 1.5, 1 + r() * r() * 7, 0, TAU);
    g.fill();
  }
  const item = { c, pad };
  strokeCache.set(key, item);
  return item;
}

/** A red brush stroke dragged from (x0,y0) to (x1,y1); p = 0..1. */
export function brushSwipe(g, x0, y0, x1, y1, width, p, o = {}) {
  if (p <= 0) return;
  const len = Math.round(Math.hypot(x1 - x0, y1 - y0));
  const { c, pad } = strokeTexture(len, Math.round(width), o.seed ?? 3, o.color ?? '#c8141e');
  const k = ease.outCubic(clamp(p));
  g.save();
  g.translate(x0, y0);
  g.rotate(Math.atan2(y1 - y0, x1 - x0));
  g.globalAlpha *= o.alpha ?? 0.97;
  g.beginPath();
  g.rect(-pad, -c.height / 2, pad + len * k + (k >= 1 ? pad : 0), c.height);
  g.clip();
  g.drawImage(c, -pad, -c.height / 2);
  g.restore();
}

// ----------------------------------------------------------- ink splash --
/** Organic ink splatter: a lumpy pool, a few thrown streaks and droplets. */
export function inkSplash(g, x, y, R, p, o = {}) {
  if (p <= 0) return;
  const r = mulberry32(o.seed ?? 5);
  const k = ease.outExpo(clamp(p));
  const harm = Array.from({ length: 5 }, (_, i) => [r() * TAU, (0.18 / (i + 1)) * (0.6 + r())]);
  g.save();
  g.fillStyle = o.color ?? '#0d0b0c';
  g.globalAlpha = o.alpha ?? 1;
  // pool: a circle wobbled by a few low harmonics
  g.beginPath();
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * TAU;
    let rr = 1;
    harm.forEach(([ph, amp], h) => (rr += amp * Math.sin(a * (h + 2) + ph)));
    const px = x + Math.cos(a) * R * rr * k;
    const py = y + Math.sin(a) * R * rr * k * 0.92;
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.fill();
  // streaks thrown outward, each ending in a drop
  const streaks = 4 + Math.floor(r() * 4);
  for (let i = 0; i < streaks; i++) {
    const a = r() * TAU;
    const len = R * (0.9 + r() * 1.3) * k;
    const w = R * (0.06 + r() * 0.1);
    const ex = x + Math.cos(a) * (R * 0.7 + len);
    const ey = y + Math.sin(a) * (R * 0.7 + len);
    const nx = -Math.sin(a) * w;
    const ny = Math.cos(a) * w;
    const bx = x + Math.cos(a) * R * 0.6;
    const by = y + Math.sin(a) * R * 0.6;
    g.beginPath();
    g.moveTo(bx + nx, by + ny);
    g.quadraticCurveTo((bx + ex) / 2 + nx * 0.3, (by + ey) / 2 + ny * 0.3, ex, ey);
    g.quadraticCurveTo((bx + ex) / 2 - nx * 0.3, (by + ey) / 2 - ny * 0.3, bx - nx, by - ny);
    g.fill();
    g.beginPath();
    g.arc(ex + Math.cos(a) * w, ey + Math.sin(a) * w, w * 1.3, 0, TAU);
    g.fill();
  }
  // loose droplets
  for (let i = 0; i < 22; i++) {
    const a = r() * TAU;
    const d = R * (1.15 + r() * 1.4) * k;
    g.beginPath();
    g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, (1.5 + r() * r() * 16) * k, 0, TAU);
    g.fill();
  }
  g.restore();
}

// ------------------------------------------------------------ butterflies --
/** Blue butterflies (the MV's 胭脂虫 motif) fluttering along noise paths. */
export class Butterflies {
  constructor(seed, n, o = {}) {
    const r = mulberry32(seed);
    this.o = o;
    this.b = Array.from({ length: n }, () => ({
      t0: (o.t0 ?? 0) + r() * (o.stagger ?? 0.4),
      x: o.x ?? 960,
      y: o.y ?? 540,
      vx: (r() - 0.5) * (o.speed ?? 900),
      vy: (r() - 0.7) * (o.speed ?? 900) * 0.6,
      size: (o.size ?? 40) * (0.6 + r() * 0.8),
      seed: r() * 100,
      flap: 9 + r() * 6,
    }));
  }

  draw(g, t) {
    for (const b of this.b) {
      const a = t - b.t0;
      if (a < 0 || a > (this.o.life ?? 4)) continue;
      const damp = 1 - Math.exp(-a / 0.7);
      const x = b.x + b.vx * 0.7 * damp + noise1(a * 0.8, b.seed) * 160 * a;
      const y = b.y + b.vy * 0.7 * damp + noise1(a * 0.7, b.seed + 9) * 120 * a - 40 * a;
      const fade = clamp(a / 0.15) * clamp(((this.o.life ?? 4) - a) / 0.8);
      const flap = Math.abs(Math.sin(a * b.flap + b.seed));
      drawButterfly(g, x, y, b.size, flap, noise1(a, b.seed + 3) * 0.6, fade);
    }
  }
}

export function drawButterfly(g, x, y, s, flap, rot, alpha) {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.globalAlpha *= alpha;
  for (const side of [-1, 1]) {
    g.save();
    g.scale(side * (0.15 + 0.85 * flap), 1);
    const grd = g.createLinearGradient(0, -s, s * 1.2, s * 0.4);
    grd.addColorStop(0, '#0b1a6b');
    grd.addColorStop(0.45, '#2f6bff');
    grd.addColorStop(0.75, '#7ad0ff');
    grd.addColorStop(1, '#0b1440');
    g.fillStyle = grd;
    g.beginPath();
    g.moveTo(0, 0);
    g.bezierCurveTo(s * 0.4, -s * 1.15, s * 1.35, -s * 0.95, s * 1.1, -s * 0.1);
    g.bezierCurveTo(s * 1.0, s * 0.25, s * 0.5, s * 0.2, 0, 0);
    g.bezierCurveTo(s * 0.55, s * 0.3, s * 0.85, s * 0.95, s * 0.3, s * 0.85);
    g.bezierCurveTo(s * 0.1, s * 0.75, 0, s * 0.3, 0, 0);
    g.fill();
    g.strokeStyle = 'rgba(5,10,40,0.9)';
    g.lineWidth = Math.max(1, s * 0.05);
    g.stroke();
    g.restore();
  }
  g.fillStyle = '#0a0a14';
  g.fillRect(-s * 0.05, -s * 0.35, s * 0.1, s * 0.8);
  g.restore();
}

// ------------------------------------------------------------- glitches --
/** Displace horizontal bands of `src` into g. */
export function glitchSlices(g, src, t, amount, o = {}) {
  if (amount <= 0.01) return;
  const r = mulberry32(Math.floor(t * 24) * 7 + (o.seed ?? 1));
  const n = 5 + Math.floor(r() * 7);
  for (let i = 0; i < n; i++) {
    const y = r() * H;
    const h = 6 + r() * 70;
    const dx = (r() - 0.5) * 160 * amount;
    g.drawImage(src, 0, y, W, h, dx, y, W, h);
    if (r() < 0.35) {
      g.save();
      g.globalCompositeOperation = 'screen';
      g.fillStyle = r() < 0.5 ? 'rgba(255,40,60,0.35)' : 'rgba(40,200,255,0.3)';
      g.fillRect(dx, y, W, h);
      g.restore();
    }
  }
}

export { hash };

// -------------------------------------------------------- pencil marks --
// Hand-drawn annotations that draw themselves on: loose doubled pencil
// lines with a little wobble, like notes scribbled over the picture.
function pencilPath(g, pts, p, o) {
  const n = pts.length;
  const upto = Math.max(1, Math.floor((n - 1) * clamp(p)));
  for (const [w, a, off] of [[o.width ?? 2.4, 0.85, 0], [(o.width ?? 2.4) * 0.5, 0.45, 1.6]]) {
    g.strokeStyle = rgba(o.color ?? '#2b2a35', (o.alpha ?? 1) * a);
    g.lineWidth = w;
    g.beginPath();
    for (let i = 0; i <= upto; i++) {
      const [x, y] = pts[i];
      if (i === 0) g.moveTo(x + off, y - off * 0.5);
      else g.lineTo(x + off, y - off * 0.5);
    }
    g.stroke();
  }
}

/** Loose ellipse that overshoots its start, drawn on as p goes 0..1. */
export function sketchCircle(g, x, y, rx, ry, p, o = {}) {
  if (p <= 0) return;
  const r = mulberry32(o.seed ?? 1);
  const turns = 1.18;
  const a0 = -2.2 + r() * 0.6;
  const pts = [];
  for (let i = 0; i <= 90; i++) {
    const u = i / 90;
    const a = a0 + u * turns * TAU;
    const wob = 1 + 0.05 * Math.sin(u * 9 + r() * 0.3) + (u - 0.5) * 0.06;
    pts.push([x + Math.cos(a) * rx * wob, y + Math.sin(a) * ry * wob + u * ry * 0.1]);
  }
  g.save();
  g.lineCap = 'round';
  g.lineJoin = 'round';
  pencilPath(g, pts, ease.outCubic(p), o);
  g.restore();
}

/** Quick double underline swept from x0 to x1. */
export function sketchUnderline(g, x0, x1, y, p, o = {}) {
  if (p <= 0) return;
  const r = mulberry32(o.seed ?? 2);
  g.save();
  g.lineCap = 'round';
  for (let k = 0; k < (o.lines ?? 2); k++) {
    const q = clamp(p * 1.6 - k * 0.5);
    if (q <= 0) continue;
    const pts = [];
    const yy = y + k * 10;
    for (let i = 0; i <= 30; i++) {
      const u = i / 30;
      pts.push([lerp(x0 - 10 + k * 20, x1 + 10 - k * 30, u), yy + Math.sin(u * 3 + r() * 6) * 3 + (u - 0.5) * (r() - 0.5) * 12]);
    }
    pencilPath(g, pts, ease.outCubic(q), o);
  }
  g.restore();
}

/** Hand-drawn arrow from (x0,y0) to (x1,y1). */
export function sketchArrow(g, x0, y0, x1, y1, p, o = {}) {
  if (p <= 0) return;
  const pts = [];
  const bend = o.bend ?? 0.15;
  const mx = (x0 + x1) / 2 - (y1 - y0) * bend;
  const my = (y0 + y1) / 2 + (x1 - x0) * bend;
  for (let i = 0; i <= 30; i++) {
    const u = i / 30;
    pts.push([(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1]);
  }
  g.save();
  g.lineCap = 'round';
  pencilPath(g, pts, ease.outCubic(clamp(p * 1.3)), o);
  const hp = clamp((p - 0.7) / 0.3);
  if (hp > 0) {
    const a = Math.atan2(y1 - my, x1 - mx);
    for (const s of [-1, 1]) {
      const hx = x1 - Math.cos(a + s * 0.5) * 26;
      const hy = y1 - Math.sin(a + s * 0.5) * 26;
      pencilPath(g, [[x1, y1], [lerp(x1, hx, 0.5), lerp(y1, hy, 0.5)], [hx, hy]], hp, o);
    }
  }
  g.restore();
}

/** Tight scribble over a rect (crossing something out). */
export function sketchScribble(g, x, y, w, h, p, o = {}) {
  if (p <= 0) return;
  const r = mulberry32(o.seed ?? 3);
  const pts = [];
  for (let i = 0; i <= 14; i++) pts.push([x + (i % 2 ? w : 0) + (r() - 0.5) * 20, y + (i / 14) * h + (r() - 0.5) * 10]);
  g.save();
  g.lineCap = 'round';
  g.lineJoin = 'round';
  pencilPath(g, pts, p, o);
  g.restore();
}
