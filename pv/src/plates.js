// AI plates drawn as 2.5D parallax: a background layer and a depth-cut
// foreground layer move at different rates under the same virtual camera.
import { W, H, clamp, makeCanvas } from './core.js';

// mean luminance of an image (0..1), used to pick dark or light overlays
function luminance(img) {
  const c = makeCanvas(32, 18);
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0, 32, 18);
  const d = g.getImageData(0, 0, 32, 18).data;
  let sum = 0;
  for (let i = 0; i < d.length; i += 4) sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  return sum / (d.length / 4) / 255;
}

export class Plates {
  constructor(base, manifest) {
    this.base = base;
    this.manifest = manifest; // name -> { fg: bool }
    this.cache = new Map();
  }

  load(name) {
    if (this.cache.has(name)) return this.cache.get(name);
    const m = this.manifest[name] ?? {};
    const img = (file) => {
      const el = new Image();
      el.decoding = 'sync';
      el.src = `${this.base}/${file}`;
      return el.decode().then(() => el, () => null);
    };
    const p = Promise.all([img(m.fg ? `${name}_bg.webp` : `${name}.webp`), m.fg ? img(`${name}_fg.webp`) : null]).then(([bg, fg]) => ({ bg, fg, lum: bg ? luminance(bg) : 0 }));
    this.cache.set(name, p);
    if (this.cache.size > 24) this.cache.delete(this.cache.keys().next().value);
    return p;
  }

  async get(names) {
    const out = {};
    await Promise.all(names.map(async (n) => (out[n] = await this.load(n))));
    return out;
  }
}

/**
 * Draw a plate filling `rect` (default full frame).
 *  cam.zoom   >= 1 on top of cover fit;  cam.z0 the zoom at the shot's start
 *  cam.x/y    focus point (0..1);         cam.x0/y0 the focus at the start
 *  cam.rot    roll (radians)
 *  cam.par    parallax strength (0 = flat)
 *  cam.dx/dy  screen-space offset (shake)
 * At the start pose both layers line up exactly; as the camera dollies or
 * pans, the foreground moves further, like an object nearer the lens.
 */
export function drawPlate(g, plate, cam = {}, rect = { x: 0, y: 0, w: W, h: H }) {
  if (!plate?.bg) return;
  const zoom = cam.zoom ?? 1;
  const par = plate.fg ? cam.par ?? 0.8 : 0;
  const bg = plate.bg;
  const iw = bg.naturalWidth;
  const ih = bg.naturalHeight;
  const s = Math.max(rect.w / iw, rect.h / ih) * zoom * 1.02;
  const vw = rect.w / s;
  const vh = rect.h / s;
  const cx = clamp((cam.x ?? 0.5) * iw, vw / 2, iw - vw / 2);
  const cy = clamp((cam.y ?? 0.5) * ih, vh / 2, ih - vh / 2);
  const draw = (img, sc, fx, fy) => {
    g.save();
    g.translate(rect.x + rect.w / 2 + (cam.dx ?? 0), rect.y + rect.h / 2 + (cam.dy ?? 0));
    if (cam.rot) g.rotate(cam.rot);
    g.scale(sc, sc);
    g.translate(-fx, -fy);
    if (cam.filter) g.filter = cam.filter;
    g.drawImage(img, 0, 0, iw, ih);
    g.restore();
  };
  g.save();
  g.beginPath();
  g.rect(rect.x, rect.y, rect.w, rect.h);
  g.clip();
  draw(bg, s, cx, cy);
  if (par > 0 && plate.fg) {
    const dz = zoom - (cam.z0 ?? zoom);
    const sf = s * (1 + par * 0.6 * dz);
    const fx = cx + ((cam.x ?? 0.5) - (cam.x0 ?? cam.x ?? 0.5)) * iw * par * 0.5;
    const fy = cy + ((cam.y ?? 0.5) - (cam.y0 ?? cam.y ?? 0.5)) * ih * par * 0.5;
    draw(plate.fg, sf, fx, fy);
  }
  g.restore();
}
