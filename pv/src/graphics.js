// Motion-graphics vocabulary for the PV: HUD furniture, shockwaves, speed
// lines, lattice frames, a self-drawing house, the 24 solar terms dial,
// brush swipes, ink splashes, butterflies, glitch slices and split screens.
import { W, H, TAU, clamp, ease, lerp, hash, mulberry32, noise1, makeCanvas, ctx2d, rgba } from './core.js';
import { font } from './type.js';
import { FONTS } from './lyrics.js';

// ------------------------------------------------------------------ HUD --
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
  // corner brackets
  for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
    g.beginPath();
    g.moveTo(x, y + sy * L);
    g.lineTo(x, y);
    g.lineTo(x + sx * L, y);
    g.stroke();
  }
  g.font = font(15, 500, FONTS.sans);
  g.fillStyle = `rgba(${col},0.8)`;
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  if (o.tl) g.fillText(o.tl, m + 12, m + 54);
  if (o.bl) g.fillText(o.bl, m + 12, H - m - 54);
  g.textAlign = 'right';
  if (o.tr) g.fillText(o.tr, W - m - 12, m + 54);
  const tc = o.tc ?? t;
  const mm = Math.floor(tc / 60);
  const ss = Math.floor(tc % 60);
  const ff = Math.floor((tc % 1) * 60);
  g.fillText(`${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}:${String(ff).padStart(2, '0')}`, W - m - 12, H - m - 54);
  // blinking record dot on the beat
  const blink = (Math.floor((t - 0.055) * 2) % 2 === 0) ? 1 : 0.25;
  g.fillStyle = `rgba(226,72,58,${blink})`;
  g.beginPath();
  g.arc(W - m - 12, m + 24, 5, 0, TAU);
  g.fill();
  // ticks along the bottom edge
  g.strokeStyle = `rgba(${col},0.35)`;
  g.lineWidth = 1;
  for (let i = 0; i <= 40; i++) {
    const x = W / 2 - 400 + i * 20;
    g.beginPath();
    g.moveTo(x, H - m);
    g.lineTo(x, H - m - (i % 5 === 0 ? 12 : 6));
    g.stroke();
  }
  const prog = clamp(tc / 170.4);
  g.fillStyle = `rgba(226,72,58,0.9)`;
  g.fillRect(W / 2 - 400, H - m + 4, 800 * prog, 2);
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

/** Thin horizontal scan line sweeping down the frame. */
export function scanline(g, t, t0, dur, o = {}) {
  const p = (t - t0) / dur;
  if (p < 0 || p > 1) return;
  const y = lerp(-40, H + 40, ease.inOutCubic(p));
  g.save();
  g.globalCompositeOperation = 'screen';
  const grd = g.createLinearGradient(0, y - 60, 0, y + 4);
  grd.addColorStop(0, 'rgba(255,255,255,0)');
  grd.addColorStop(1, rgba(o.color ?? '#ffffff', 0.35));
  g.fillStyle = grd;
  g.fillRect(0, y - 60, W, 64);
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
/** A wet red brush stroke dragged from (x0,y0) to (x1,y1); p = 0..1. */
export function brushSwipe(g, x0, y0, x1, y1, width, p, o = {}) {
  if (p <= 0) return;
  const r = mulberry32(o.seed ?? 3);
  const k = ease.outCubic(clamp(p));
  const ex = lerp(x0, x1, k);
  const ey = lerp(y0, y1, k);
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const nx = -Math.sin(ang);
  const ny = Math.cos(ang);
  g.save();
  g.globalAlpha = o.alpha ?? 0.95;
  g.lineCap = 'round';
  for (let i = 0; i < 26; i++) {
    const off = (r() - 0.5) * width;
    const wid = width * (0.05 + r() * 0.16);
    const end = 0.75 + r() * 0.25;
    const tone = Math.floor(150 + r() * 70);
    g.strokeStyle = o.color ?? `rgb(${tone},${Math.floor(r() * 18)},${Math.floor(10 + r() * 18)})`;
    g.lineWidth = wid;
    g.beginPath();
    g.moveTo(x0 + nx * off, y0 + ny * off);
    g.lineTo(lerp(x0, ex, end) + nx * off * 0.9, lerp(y0, ey, end) + ny * off * 0.9);
    g.stroke();
  }
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

/** Two images side by side with a sliding divider (左/右). */
export function splitScreen(g, left, right, t, divX, o = {}) {
  g.save();
  g.beginPath();
  g.rect(0, 0, divX, H);
  g.clip();
  left(g, t);
  g.restore();
  g.save();
  g.beginPath();
  g.rect(divX, 0, W - divX, H);
  g.clip();
  right(g, t);
  g.restore();
  g.save();
  g.fillStyle = o.color ?? '#ffffff';
  g.fillRect(divX - 2, 0, 4, H);
  g.restore();
}

/** Full-frame colour inversion (strobe) over what is already drawn. */
export function invert(g, amount) {
  if (amount <= 0.01) return;
  g.save();
  g.globalCompositeOperation = 'difference';
  g.globalAlpha = clamp(amount);
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, W, H);
  g.restore();
}

/** Halftone dot screen used as a graphic texture. */
const dotCache = new Map();
export function halftone(g, color, alpha, cell = 14) {
  const key = `${color}|${cell}`;
  let pat = dotCache.get(key);
  if (!pat) {
    const c = makeCanvas(cell, cell);
    const x = ctx2d(c);
    x.fillStyle = color;
    x.beginPath();
    x.arc(cell / 2, cell / 2, cell * 0.28, 0, TAU);
    x.fill();
    pat = g.createPattern(c, 'repeat');
    dotCache.set(key, pat);
  }
  g.save();
  g.globalAlpha = alpha;
  g.fillStyle = pat;
  g.fillRect(0, 0, W, H);
  g.restore();
}

export { hash };
