// 2.5D camera.  Every layer sits at a distance D from the lens and is drawn
// in screen coordinates as it looks with the camera at rest.  Moving the
// camera (x, y, z = dolly forward, roll) slides and scales near layers more
// than far ones, which is what makes flat cards read as depth.
import { W, H } from './core.js';

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
// The camera is locked off between shots: no hand-held float, no beat
// punch-ins.  Only the shot moves below act.
export function makeGlobalCam() {
  return () => still();
}

// ------------------------------------------------------- shot cameras --
// Each preset returns (t, shot) => {x, y, z, roll}; p runs 0..1 over the shot.
// Every move is a slow, steady push in or out; the old preset names are
// kept so the storyboard reads the same, but none of them snap, swing or
// roll any more.
const slowPush = (dz) => (t, s) => ({ x: 0, y: 0, z: dz * s.p(t), roll: 0 });
const slowPull = (dz) => (t, s) => ({ x: 0, y: 0, z: dz * (1 - s.p(t)), roll: 0 });
export const move = {
  hold: () => () => still(),
  push: () => slowPush(120),
  pull: () => slowPull(120),
  snap: () => slowPush(100),
  truck: () => slowPush(100),
  crane: () => slowPush(100),
  roll: () => slowPush(100),
  drift: () => slowPush(110),
};
