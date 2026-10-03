// 2.5D camera.  Every layer sits at a distance D from the lens and is drawn
// in screen coordinates as it looks with the camera at rest.  Moving the
// camera (x, y, z = dolly forward, roll) slides and scales near layers more
// than far ones, which is what makes flat cards read as depth.
import { W, H, clamp, ease, fbm1, noise1 } from './core.js';
import { pulse, events } from './timing.js';

export const F = 1500; // a layer at D = F moves 1:1 with the camera

// typical depths
export const D = {
  far: 4200, // distant snow and bokeh
  image: 2600, // the picture card
  back: 2200, // graphics behind the lyrics
  text: 1800, // lyrics
  front: 1200, // graphics in front of the lyrics
  near: 800, // petals passing the lens
};

export const still = () => ({ x: 0, y: 0, z: 0, roll: 0 });
export const plus = (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z, roll: a.roll + b.roll });

/** Scale and screen offset of a layer at distance d under camera c. */
export function lens(c, d) {
  const dist = Math.max(60, d - c.z);
  return { k: d / dist, ox: (-c.x * F) / dist, oy: (-c.y * F) / dist };
}

/** Set g's transform so that drawing in rest-screen coordinates lands right. */
export function layer(g, c, d) {
  const { k, ox, oy } = lens(c, d);
  const cs = Math.cos(c.roll);
  const sn = Math.sin(c.roll);
  // p' = C + R (k (p - C) + o)
  const tx = ox - (k * W) / 2;
  const ty = oy - (k * H) / 2;
  g.setTransform(cs * k, sn * k, -sn * k, cs * k, W / 2 + cs * tx - sn * ty, H / 2 + sn * tx + cs * ty);
}

/** Project a rest-screen point at distance d: [x, y, k]. */
export function project(c, d, x, y) {
  const { k, ox, oy } = lens(c, d);
  const px = k * (x - W / 2) + ox;
  const py = k * (y - H / 2) + oy;
  const cs = Math.cos(c.roll);
  const sn = Math.sin(c.roll);
  return [W / 2 + cs * px - sn * py, H / 2 + sn * px + cs * py, k];
}

/**
 * Smallest scale (>= 1) of a W x H card at distance d that still covers the
 * whole screen under camera c.
 */
export function coverNeed(c, d) {
  const { k, ox, oy } = lens(c, d);
  const cs = Math.cos(-c.roll);
  const sn = Math.sin(-c.roll);
  let need = 1;
  for (const [qx, qy] of [[-W / 2, -H / 2], [W / 2, -H / 2], [-W / 2, H / 2], [W / 2, H / 2]]) {
    const ux = (cs * qx - sn * qy - ox) / k;
    const uy = (sn * qx + cs * qy - oy) / k;
    need = Math.max(need, Math.abs(ux) / (W / 2), Math.abs(uy) / (H / 2));
  }
  return need;
}

// ------------------------------------------------------- global camera --
// Continuous across cuts: hand-held drift, kick-drum punch-ins, snare roll
// swings in the choruses and impact shake.  Shot cameras add on top.
export function makeGlobalCam({ intensity, impacts = [], swings = [] }) {
  return (t) => {
    const k = intensity(t);
    const kick = pulse('kicks', t, 0.11, 0.35);
    // punch-in on the kick: the dolly jumps forward and settles
    const z = 70 * k * k * Math.min(kick, 1.6);
    // hand-held float
    let x = 16 * fbm1(t * 0.23, 11) + 6 * k * fbm1(t * 1.7, 12);
    let y = 10 * fbm1(t * 0.19, 13) + 4 * k * fbm1(t * 1.5, 14);
    let roll = 0.005 * fbm1(t * 0.15, 15);
    // shake on hard hits
    let shake = 7 * k * k * pulse('kicks', t, 0.07, 0.6);
    for (const [t0, amp, decay] of impacts) {
      const a = t - t0;
      if (a >= 0 && a < decay * 6) shake += amp * Math.exp(-a / decay);
    }
    x += shake * noise1(t * 37, 1);
    y += shake * noise1(t * 37, 2);
    roll += shake * 0.0009 * noise1(t * 29, 3);
    // roll swings on the snare, alternating sides
    for (const [a, b] of swings) {
      if (t < a || t > b + 1) continue;
      const hits = events('snares', a, Math.min(t, b), 0.45);
      hits.forEach(([ti], i) => {
        const age = t - ti;
        roll += (i % 2 ? 1 : -1) * 0.018 * Math.exp(-age / 0.22) * Math.cos(age * 14);
      });
    }
    return { x, y, z, roll };
  };
}

// ------------------------------------------------------- shot cameras --
// Each preset returns (t, shot) => {x, y, z, roll}; p runs 0..1 over the shot.
export const move = {
  hold: () => () => still(),
  push: (z0 = 0, z1 = 260, x = 0, y = 0) => (t, s) => ({ x, y, z: z0 + (z1 - z0) * ease.inOutSine(s.p(t)), roll: 0 }),
  pull: (z0 = 380, z1 = 40, x = 0, y = 0) => (t, s) => ({ x, y, z: z0 + (z1 - z0) * ease.outCubic(s.p(t)), roll: 0 }),
  // fast settle from a punched-in start, then a slow creep
  snap: (z0 = 520, z1 = 60, x = 0, y = 0) => (t, s) => ({ x, y, z: z0 + (z1 - z0) * ease.outExpo(clamp((t - s.t0) / 0.6)) + 70 * s.p(t), roll: 0 }),
  truck: (x0 = -180, x1 = 180, z = 120, y = 0) => (t, s) => ({ x: x0 + (x1 - x0) * ease.inOutSine(s.p(t)), y, z, roll: 0 }),
  crane: (y0 = -120, y1 = 120, z = 120, x = 0) => (t, s) => ({ x, y: y0 + (y1 - y0) * ease.inOutSine(s.p(t)), z, roll: 0 }),
  roll: (r0 = -0.04, r1 = 0.04, z = 160) => (t, s) => ({ x: 0, y: 0, z, roll: r0 + (r1 - r0) * ease.inOutSine(s.p(t)) }),
  // dolly in while drifting sideways (the classic slow parallax move)
  drift: (x0 = -120, x1 = 120, z0 = 0, z1 = 220, y = 0) => (t, s) => {
    const p = ease.inOutSine(s.p(t));
    return { x: x0 + (x1 - x0) * p, y, z: z0 + (z1 - z0) * p, roll: 0 };
  },
};
