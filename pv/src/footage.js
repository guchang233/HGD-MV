// Frame-accurate access to the MV shots extracted by tools/extract_frames.py
// (2048x806 JPEGs named by source frame index at 30 fps).
import { VIEW, clamp } from './core.js';

export const SRC_FPS = 30;

export class Footage {
  constructor(base, capacity = 40) {
    this.base = base;
    this.capacity = capacity;
    this.cache = new Map(); // index -> Promise<HTMLImageElement|null>
  }

  index(src) {
    return Math.floor(src * SRC_FPS + 1e-3);
  }

  load(n) {
    if (this.cache.has(n)) {
      const p = this.cache.get(n);
      this.cache.delete(n); // refresh LRU position
      this.cache.set(n, p);
      return p;
    }
    const img = new Image();
    img.decoding = 'sync';
    img.src = `${this.base}/f_${String(n).padStart(5, '0')}.jpg`;
    const p = img.decode().then(() => img, () => null);
    this.cache.set(n, p);
    while (this.cache.size > this.capacity) this.cache.delete(this.cache.keys().next().value);
    return p;
  }

  /** Resolve the frames for the given source times (in order). */
  frames(srcTimes) {
    return Promise.all(srcTimes.map((s) => this.load(this.index(s))));
  }
}

/**
 * Draw a footage frame into `view` through a virtual camera.
 *  cam.zoom  >= 1 scale on top of "cover" fit
 *  cam.x/y   focus point in normalized frame coordinates
 *  cam.rot   roll in radians
 *  cam.dx/dy screen-space offset (shake), kept inside the frame
 */
export function drawFootage(g, img, cam = {}, view = VIEW) {
  if (!img) return;
  const fw = img.naturalWidth;
  const fh = img.naturalHeight;
  const zoom = cam.zoom ?? 1;
  const rot = cam.rot ?? 0;
  const dx = cam.dx ?? 0;
  const dy = cam.dy ?? 0;
  const base = Math.max(view.w / fw, view.h / fh);
  const ar = Math.abs(rot);
  // grow the scale just enough that roll and shake never reveal the edge
  const needW = view.w * Math.cos(ar) + view.h * Math.sin(ar) + 2 * Math.abs(dx);
  const needH = view.w * Math.sin(ar) + view.h * Math.cos(ar) + 2 * Math.abs(dy);
  const s = Math.max(base * zoom, needW / fw, needH / fh);
  const hw = needW / 2 / s;
  const hh = needH / 2 / s;
  const cx = hw * 2 >= fw ? fw / 2 : clamp((cam.x ?? 0.5) * fw, hw, fw - hw);
  const cy = hh * 2 >= fh ? fh / 2 : clamp((cam.y ?? 0.5) * fh, hh, fh - hh);
  g.save();
  g.beginPath();
  g.rect(view.x, view.y, view.w, view.h);
  g.clip();
  g.translate(view.x + view.w / 2 + dx, view.y + view.h / 2 + dy);
  g.rotate(rot);
  g.scale(s, s);
  g.translate(-cx, -cy);
  if (cam.filter) g.filter = cam.filter;
  g.drawImage(img, 0, 0);
  g.restore();
}
