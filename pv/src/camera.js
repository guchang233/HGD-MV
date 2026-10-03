// 2.5D camera.  Every layer sits at a distance D from the lens and is drawn
// in screen coordinates as it looks with the camera at rest.  Moving the
// camera (x, y, z = dolly forward, roll) slides and scales near layers more
// than far ones, which is what makes flat cards read as depth.
import { W, H, clamp, ease, fbm1 } from './core.js';
import { events } from './timing.js';

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
export function makeGlobalCam({ intensity, impacts = [] }) {
  return (t) => {
    const k = intensity(t);
    // a soft breath on the kick: the dolly eases forward and settles (no shake)
    let z = 0;
    for (const [ti, st] of events('kicks', t - 1.2, t, 0.5)) {
      const a = t - ti;
      z += 16 * k * Math.min(st, 1.2) * (1 - Math.exp(-a / 0.05)) * Math.exp(-a / 0.3);
    }
    // big moments: a slow push rather than a jolt
    for (const [t0] of impacts) {
      const a = t - t0;
      if (a >= 0 && a < 3) z += 60 * (1 - Math.exp(-a / 0.12)) * Math.exp(-a / 0.9);
    }
    // a very slow float
    const x = 10 * fbm1(t * 0.11, 11);
    const y = 6 * fbm1(t * 0.09, 13);
    const roll = 0.0025 * fbm1(t * 0.07, 15);
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
  snap: (z0 = 520, z1 = 60, x = 0, y = 0) => (t, s) => ({ x, y, z: z1 + (Math.min(z0, 320) - z1) * (1 - ease.outCubic(clamp((t - s.t0) / 1.4))) + 60 * s.p(t), roll: 0 }),
  truck: (x0 = -180, x1 = 180, z = 120, y = 0) => (t, s) => ({ x: x0 + (x1 - x0) * ease.inOutSine(s.p(t)), y, z, roll: 0 }),
  crane: (y0 = -120, y1 = 120, z = 120, x = 0) => (t, s) => ({ x, y: y0 + (y1 - y0) * ease.inOutSine(s.p(t)), z, roll: 0 }),
  // gentle tilt (presets are scaled down: big rolls read as shaky)
  roll: (r0 = -0.015, r1 = 0.015, z = 160) => (t, s) => ({ x: 0, y: 0, z, roll: 0.4 * (r0 + (r1 - r0) * ease.inOutSine(s.p(t))) }),
  // dolly in while drifting sideways (the classic slow parallax move)
  drift: (x0 = -120, x1 = 120, z0 = 0, z1 = 220, y = 0) => (t, s) => {
    const p = ease.inOutSine(s.p(t));
    return { x: x0 + (x1 - x0) * p, y, z: z0 + (z1 - z0) * p, roll: 0 };
  },
};
