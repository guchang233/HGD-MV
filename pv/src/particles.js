// Analytic particle systems: every particle's state is a closed-form function
// of its age, so any frame can be rendered independently.
import { TAU, clamp, makeCanvas, ctx2d, mulberry32 } from './core.js';
import { petalPath } from './plum.js';
import { F, project } from './camera.js';

// motion streaks stand in for motion blur when frames are not supersampled
let STREAKS = true;
export const setStreaks = (on) => (STREAKS = on);

// ---------------------------------------------------------------- sprites --
function sprite(size, paint) {
  const c = makeCanvas(size, size);
  const g = ctx2d(c);
  g.translate(size / 2, size / 2);
  paint(g, size);
  return c;
}

function petalSprite(edge, base, vein) {
  return sprite(96, (g, s) => {
    const L = s * 0.86;
    const grd = g.createLinearGradient(0, L * 0.5, 0, -L * 0.5);
    grd.addColorStop(0, base);
    grd.addColorStop(1, edge);
    petalPath(g, L);
    g.fillStyle = grd;
    g.fill();
    g.strokeStyle = vein;
    g.lineWidth = 1.6;
    g.stroke();
    g.beginPath();
    g.moveTo(0, L * 0.42);
    g.quadraticCurveTo(L * 0.04, 0, 0, -L * 0.3);
    g.strokeStyle = vein;
    g.lineWidth = 1.1;
    g.stroke();
  });
}

function discSprite(size, stops) {
  return sprite(size, (g, s) => {
    const grd = g.createRadialGradient(0, 0, 0, 0, 0, s / 2);
    for (const [o, c] of stops) grd.addColorStop(o, c);
    g.fillStyle = grd;
    g.fillRect(-s / 2, -s / 2, s, s);
  });
}

export const SPRITES = {};
export function initSprites() {
  SPRITES.petalFront = petalSprite('#f59a7c', '#c92e2a', 'rgba(120,16,16,0.45)');
  SPRITES.petalBack = petalSprite('#e0806a', '#9e2222', 'rgba(90,10,10,0.5)');
  SPRITES.petalDeep = petalSprite('#e2453c', '#860a12', 'rgba(70,0,0,0.5)');
  SPRITES.petalWhite = petalSprite('#ffffff', '#efe6dd', 'rgba(60,50,46,0.55)');
  SPRITES.petalWhiteBack = petalSprite('#e9e4de', '#d6cbc0', 'rgba(60,50,46,0.5)');
  SPRITES.snow = discSprite(64, [[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,255,255,0.85)'], [1, 'rgba(255,255,255,0)']]);
  SPRITES.bokeh = discSprite(128, [[0, 'rgba(235,242,255,0.55)'], [0.7, 'rgba(225,235,255,0.35)'], [0.85, 'rgba(225,235,255,0.15)'], [1, 'rgba(225,235,255,0)']]);
  SPRITES.ember = discSprite(64, [[0, 'rgba(255,240,200,1)'], [0.25, 'rgba(255,170,70,0.9)'], [1, 'rgba(255,80,20,0)']]);
  SPRITES.mote = discSprite(32, [[0, 'rgba(255,245,220,1)'], [1, 'rgba(255,220,160,0)']]);
}

// ---------------------------------------------------------------- physics --
// Velocity relaxes from v0 to vt with time constant tau (closed form).
const drift = (p0, v0, vt, tau, a) => p0 + vt * a + (v0 - vt) * tau * (1 - Math.exp(-a / tau));
const driftV = (v0, vt, tau, a) => vt + (v0 - vt) * Math.exp(-a / tau);

/**
 * Generic particle field.  Each particle: {t0, life, x, y, z, vx, vy, vz,
 * tx, ty, tz (terminal velocities), tau, size, rot, spin, flip, flipS,
 * swayA, swayF, swayP, kind}
 */
export class Field {
  constructor(particles, opts = {}) {
    this.p = particles;
    this.opts = opts;
  }

  state(q, t) {
    const a = t - q.t0;
    if (a < 0 || a > q.life) return null;
    const sway = q.swayA * Math.sin(q.swayF * a + q.swayP);
    const x = drift(q.x, q.vx, q.tx, q.tau, a) + sway;
    const y = drift(q.y, q.vy, q.ty, q.tau, a);
    const z = drift(q.z, q.vz, q.tz, q.tau, a);
    return { a, x, y, z };
  }

  draw(g, t, o = {}) {
    const cx = o.cx ?? 960;
    const cy = o.cy ?? 378;
    const fade = this.opts.fade ?? 0.25;
    const live = [];
    for (const q of this.p) {
      const s = this.state(q, t);
      if (!s || s.z < 0.12) continue;
      live.push([q, s]);
    }
    live.sort((m, n) => n[1].z - m[1].z);
    const quality = g.imageSmoothingQuality;
    g.imageSmoothingQuality = 'medium';
    const cam = o.cam;
    for (const [q, s] of live) {
      let k = 1 / s.z;
      let sx = cx + (s.x - cx) * k;
      let sy = cy + (s.y - cy) * k;
      if (cam) {
        // each particle sits at its own distance from the 2.5D camera
        const [px, py, kk] = project(cam, F * s.z * (o.depth ?? 1), sx, sy);
        sx = px;
        sy = py;
        k *= kk;
      }
      const size = q.size * k;
      if (sx < -size * 2 || sx > 1920 + size * 2 || sy < -size * 2 || sy > 1080 + size * 2) continue;
      let alpha = (o.alpha ?? 1) * (q.alpha ?? 1);
      alpha *= clamp(s.a / 0.18) * clamp((q.life - s.a) / (q.life * fade));
      if (q.zFade) alpha *= clamp((s.z - 0.12) / 0.4) * clamp((q.zFade - s.z) / (q.zFade * 0.5));
      if (alpha <= 0.003) continue;
      this.drawOne(g, q, s, sx, sy, size, alpha, k, t, cx, cy, cam ? cam.roll : 0);
    }
    g.imageSmoothingQuality = quality;
  }

  drawOne(g, q, s, sx, sy, size, alpha, k, t, cx, cy, roll = 0) {
    const kind = q.kind;
    if (kind === 'petal' || kind === 'white') {
      const rot = q.rot + q.spin * s.a + roll;
      const flip = Math.cos(q.flip + q.flipS * s.a);
      const front = flip >= 0;
      const img =
        kind === 'white'
          ? front ? SPRITES.petalWhite : SPRITES.petalWhiteBack
          : q.deep ? SPRITES.petalDeep : front ? SPRITES.petalFront : SPRITES.petalBack;
      // motion streak for fast petals
      const vx = (driftV(q.vx, q.tx, q.tau, s.a) - (s.x - cx) * driftV(q.vz, q.tz, q.tau, s.a) / s.z) * k;
      const vy = (driftV(q.vy, q.ty, q.tau, s.a) - (s.y - cy) * driftV(q.vz, q.tz, q.tau, s.a) / s.z) * k;
      const speed = Math.hypot(vx, vy);
      const ghosts = !STREAKS ? 0 : speed > 900 ? 3 : speed > 450 ? 2 : 0;
      for (let i = ghosts; i >= 0; i--) {
        const back = i * 0.012;
        g.save();
        g.globalAlpha = alpha * (i === 0 ? 1 : 0.28 / i);
        g.translate(sx - vx * back, sy - vy * back);
        g.rotate(rot);
        g.scale(size / 96, (size / 96) * Math.max(0.08, Math.abs(flip)));
        g.drawImage(img, -48, -48);
        g.restore();
      }
    } else if (kind === 'snow' || kind === 'bokeh') {
      const img = kind === 'snow' ? SPRITES.snow : SPRITES.bokeh;
      g.globalAlpha = alpha;
      g.drawImage(img, sx - size / 2, sy - size / 2, size, size);
    } else if (kind === 'ember' || kind === 'mote') {
      const flick = 0.55 + 0.45 * Math.sin(t * q.swayF * 3.1 + q.swayP * 5);
      g.globalAlpha = alpha * flick;
      const img = kind === 'ember' ? SPRITES.ember : SPRITES.mote;
      g.drawImage(img, sx - size / 2, sy - size / 2, size, size);
    }
    g.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------- factories --
const base = (r) => ({
  rot: r() * TAU,
  spin: r.range(-2.2, 2.2),
  flip: r() * TAU,
  flipS: r.range(2, 6) * r.sign(),
  swayA: r.range(10, 45),
  swayF: r.range(1.2, 3.2),
  swayP: r() * TAU,
});

/** Petals drifting down across the frame during [t0, t1]. */
export function fallingPetals({ seed, t0, t1, rate, wind = 60, region = [0, 1920], white = 0, deep = 0, zRange = [0.6, 2.4], size = [16, 30], y0 = -60 }) {
  const r = mulberry32(seed);
  const n = Math.round((t1 - t0) * rate);
  const ps = [];
  for (let i = 0; i < n; i++) {
    const z = r.range(...zRange);
    const born = t0 + r() * (t1 - t0) - 2.5; // pre-roll so the screen starts populated
    ps.push({
      ...base(r),
      kind: r() < white ? 'white' : 'petal',
      deep: r() < deep,
      t0: born,
      life: 9,
      x: r.range(region[0] - 300, region[1] + 100) * z - 960 * (z - 1),
      y: (y0 + r.range(-80, 0)) * z - 378 * (z - 1),
      z,
      vx: wind * r.range(0.6, 1.4),
      vy: r.range(40, 80),
      vz: 0,
      tx: wind * r.range(0.6, 1.4),
      ty: r.range(70, 140),
      tz: 0,
      tau: 1.2,
      size: r.range(...size),
    });
  }
  return new Field(ps, { fade: 0.15 });
}

/** Radial burst of petals flying toward the camera from (x, y). */
export function petalBurst({ seed, t0, x, y, count = 260, power = 1, spread = 1, white = 0.15, deep = 0.3, life = 4.5, size = [18, 40], z = [1.0, 1.6], toward = 1 }) {
  const r = mulberry32(seed);
  const ps = [];
  for (let i = 0; i < count; i++) {
    const a = r() * TAU;
    const sp = r.range(350, 1500) * power;
    const born = t0 + Math.pow(r(), 3) * 0.25;
    ps.push({
      ...base(r),
      spin: r.range(-7, 7),
      flipS: r.range(6, 14) * r.sign(),
      kind: r() < white ? 'white' : 'petal',
      deep: r() < deep,
      t0: born,
      life: life * r.range(0.7, 1.1),
      x: x + r.range(-40, 40),
      y: y + r.range(-40, 40),
      z: r.range(...z),
      vx: Math.cos(a) * sp * spread,
      vy: Math.sin(a) * sp * 0.75 - r.range(0, 200),
      vz: -r.range(0.1, 1.1) * power * toward,
      tx: r.range(20, 90),
      ty: r.range(40, 110),
      tz: -r.range(0.0, 0.08),
      tau: r.range(0.25, 0.6),
      swayA: r.range(5, 30),
      size: r.range(...size),
    });
  }
  return new Field(ps, { fade: 0.3 });
}

/** Petals letting go of a branch (points along `path`) and riding the wind. */
export function shedPetals({ seed, t0, t1, rate, path, wind = [-170, -60], white = 0.1, size = [14, 26] }) {
  const r = mulberry32(seed);
  const n = Math.round((t1 - t0) * rate);
  const segs = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const l = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
    segs.push([path[i - 1], path[i], l]);
    total += l;
  }
  const ps = [];
  for (let i = 0; i < n; i++) {
    let d = r() * total;
    let [a, b, l] = segs[0];
    for (const sg of segs) {
      if (d <= sg[2]) {
        [a, b, l] = sg;
        break;
      }
      d -= sg[2];
    }
    const f = d / l;
    const z = r.range(0.85, 1.25);
    ps.push({
      ...base(r),
      kind: r() < white ? 'white' : 'petal',
      t0: t0 + r() * (t1 - t0),
      life: 6,
      x: (a[0] + (b[0] - a[0]) * f + r.range(-30, 30)) * z - 960 * (z - 1),
      y: (a[1] + (b[1] - a[1]) * f + r.range(-30, 30)) * z - 378 * (z - 1),
      z,
      vx: r.range(-30, 20),
      vy: r.range(-10, 30),
      vz: 0,
      tx: r.range(...wind),
      ty: r.range(10, 70),
      tz: 0,
      tau: r.range(0.8, 1.6),
      size: r.range(...size),
    });
  }
  return new Field(ps, { fade: 0.25 });
}

/** Snowfall with depth: tiny distant flakes to large out-of-focus bokeh. */
export function snowfall({ seed, t0, t1, rate = 90, wind = -40, bokeh = 0.08, preroll = 6 }) {
  const r = mulberry32(seed);
  const n = Math.round((t1 - t0 + preroll) * rate);
  const ps = [];
  for (let i = 0; i < n; i++) {
    const isBokeh = r() < bokeh;
    const z = isBokeh ? r.range(0.18, 0.45) : r.range(0.6, 3.2);
    ps.push({
      kind: isBokeh ? 'bokeh' : 'snow',
      t0: t0 - preroll + r() * (t1 - t0 + preroll),
      life: 8,
      x: r.range(-200, 2120) * z - 960 * (z - 1),
      y: r.range(-200, -20) * z - 378 * (z - 1),
      z,
      vx: wind,
      vy: r.range(60, 120),
      vz: 0,
      tx: wind * r.range(0.7, 1.3),
      ty: r.range(80, 160),
      tz: 0,
      tau: 1,
      swayA: r.range(8, 30),
      swayF: r.range(0.8, 2.2),
      swayP: r() * TAU,
      size: isBokeh ? r.range(30, 70) : r.range(4, 9),
      alpha: isBokeh ? r.range(0.35, 0.7) : r.range(0.55, 1),
    });
  }
  return new Field(ps, { fade: 0.1 });
}

/** Sparks rising from a fire (sedan chair shot). */
export function embers({ seed, t0, t1, rate = 40, x = [600, 1300], y = 800 }) {
  const r = mulberry32(seed);
  const n = Math.round((t1 - t0 + 3) * rate);
  const ps = [];
  for (let i = 0; i < n; i++) {
    const z = r.range(0.5, 1.6);
    ps.push({
      kind: 'ember',
      t0: t0 - 3 + r() * (t1 - t0 + 3),
      life: r.range(2, 4),
      x: r.range(...x),
      y: y + r.range(-30, 60),
      z,
      vx: r.range(-60, 60),
      vy: -r.range(120, 300),
      vz: 0,
      tx: r.range(-30, 50),
      ty: -r.range(80, 160),
      tz: 0,
      tau: 0.8,
      swayA: r.range(10, 40),
      swayF: r.range(2, 5),
      swayP: r() * TAU,
      size: r.range(6, 16),
    });
  }
  return new Field(ps, { fade: 0.4 });
}

/** Slow luminous dust motes (sunrise). */
export function motes({ seed, t0, t1, count = 160 }) {
  const r = mulberry32(seed);
  const ps = [];
  for (let i = 0; i < count; i++) {
    const z = r.range(0.4, 2);
    ps.push({
      kind: 'mote',
      t0: t0 - r() * 2,
      life: t1 - t0 + 4,
      x: r.range(-100, 2020),
      y: r.range(0, 804),
      z,
      vx: r.range(-12, 12),
      vy: r.range(-25, -5),
      vz: 0,
      tx: r.range(-10, 10),
      ty: r.range(-20, -5),
      tz: 0,
      tau: 2,
      swayA: r.range(5, 20),
      swayF: r.range(0.5, 1.5),
      swayP: r() * TAU,
      size: r.range(3, 9),
      alpha: r.range(0.3, 0.9),
    });
  }
  return new Field(ps, { fade: 0.2 });
}
