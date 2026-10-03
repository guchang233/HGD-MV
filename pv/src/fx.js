// Compositing and film effects, all done with Canvas 2D (fast in headless
// Chromium, unlike WebGL readback under SwiftShader).
import { W, H, VIEW, TAU, clamp, smoothstep, makeCanvas, ctx2d, mulberry32, noiseField } from './core.js';

const MW = 480;
const MH = 270;

export class FX {
  constructor() {
    this.a = makeCanvas(W, H);
    this.ga = ctx2d(this.a);
    this.b = makeCanvas(W, H);
    this.gb = ctx2d(this.b);
    this.small = makeCanvas(MW, MH, true);
    this.gs = ctx2d(this.small);
    this.small2 = makeCanvas(MW, MH, true);
    this.gs2 = ctx2d(this.small2);
    this.mask = makeCanvas(MW, MH, true);
    this.gm = ctx2d(this.mask);
    this.maskData = this.gm.createImageData(MW, MH);
    this.field = noiseField(MW, MH, 11, 0.018, 5);
    this.field2 = noiseField(MW, MH, 23, 0.05, 4);
    this.grainTiles = [0, 1, 2, 3].map((i) => this.makeGrain(256, 100 + i));
  }

  makeGrain(size, seed) {
    const c = makeCanvas(size, size, true);
    const g = ctx2d(c);
    const img = g.createImageData(size, size);
    const r = mulberry32(seed);
    for (let i = 0; i < size * size; i++) {
      const v = 128 + r.gauss() * 38;
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  /**
   * Ink-bleed mask: ink spreading over rice paper from (cx, cy) (normalised
   * to the view).  p in [0,1].  Returns a 480x270 canvas with alpha.
   */
  inkMask(p, cx = 0.5, cy = 0.5, o = {}) {
    const rough = o.rough ?? 0.55;
    const soft = o.soft ?? 0.06;
    const fine = o.fine ?? 0.18;
    const d = this.maskData.data;
    const asp = VIEW.w / VIEW.h;
    const maxD = Math.hypot(Math.max(cx, 1 - cx) * asp, Math.max(cy, 1 - cy));
    const reach = p * (1 + rough * 0.6 + soft) - rough * 0.3;
    for (let y = 0; y < MH; y++) {
      const ny = y / (MH - 1);
      for (let x = 0; x < MW; x++) {
        const nx = x / (MW - 1);
        const i = y * MW + x;
        const dist = Math.hypot((nx - cx) * asp, ny - cy) / maxD;
        const v = reach - dist - (this.field[i] - 0.5) * rough - (this.field2[i] - 0.5) * fine;
        const a = v <= 0 ? 0 : v >= soft ? 255 : (v / soft) * 255;
        const j = i * 4;
        d[j] = d[j + 1] = d[j + 2] = 255;
        d[j + 3] = a;
      }
    }
    this.gm.putImageData(this.maskData, 0, 0);
    return this.mask;
  }

  /** Ink-bleed transition: a dark wet rim runs ahead of the incoming layer. */
  inkTransition(g, layer, p, cx, cy, view = VIEW) {
    const rim = this.inkMask(Math.min(1, p + 0.045), cx, cy);
    const t = this.gb;
    t.save();
    t.setTransform(1, 0, 0, 1, 0, 0);
    t.globalCompositeOperation = 'copy';
    t.drawImage(rim, view.x, view.y, view.w, view.h);
    t.globalCompositeOperation = 'source-in';
    t.fillStyle = `rgba(36,28,26,${0.3 * (1 - p)})`;
    t.fillRect(0, 0, W, H);
    t.restore();
    g.drawImage(this.b, 0, 0);
    this.masked(g, layer, this.inkMask(p, cx, cy), view);
  }

  /** Draw `layer` onto g through a mask canvas stretched over the view. */
  masked(g, layer, mask, view = VIEW) {
    const t = this.gb;
    t.save();
    t.setTransform(1, 0, 0, 1, 0, 0);
    t.globalCompositeOperation = 'copy';
    t.drawImage(layer, 0, 0);
    t.globalCompositeOperation = 'destination-in';
    t.drawImage(mask, view.x, view.y, view.w, view.h);
    t.restore();
    g.drawImage(this.b, 0, 0);
  }

  /** Radial chromatic aberration of canvas `src` into g (amount ~0.002-0.02). */
  chromatic(g, src, amount) {
    if (amount < 0.0005) {
      g.drawImage(src, 0, 0);
      return;
    }
    const t = this.ga;
    const cx = W / 2;
    const cy = H / 2;
    g.save();
    g.fillStyle = '#000';
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    // every channel is scaled up (never down) so no edge is ever uncovered
    const chans = [
      ['#ff0000', 1 + amount * 2],
      ['#00ff00', 1 + amount],
      ['#0000ff', 1],
    ];
    for (const [col, s] of chans) {
      t.save();
      t.setTransform(1, 0, 0, 1, 0, 0);
      t.globalCompositeOperation = 'copy';
      if (s !== 1) t.setTransform(s, 0, 0, s, cx * (1 - s), cy * (1 - s));
      t.drawImage(src, 0, 0);
      t.setTransform(1, 0, 0, 1, 0, 0);
      t.globalCompositeOperation = 'multiply';
      t.fillStyle = col;
      t.fillRect(0, 0, W, H);
      t.restore();
      g.drawImage(this.a, 0, 0);
    }
    g.restore();
  }

  /** Zoom blur toward the centre (rushes and impacts). */
  zoomBlur(g, src, amount, steps = 8, cx = W / 2, cy = H / 2) {
    if (amount <= 0.001) return;
    g.save();
    for (let i = 1; i <= steps; i++) {
      const s = 1 + (amount * i) / steps;
      g.globalAlpha = 0.3 * (1 - i / (steps + 1));
      g.setTransform(s, 0, 0, s, cx * (1 - s), cy * (1 - s));
      g.drawImage(src, 0, 0);
    }
    g.restore();
  }

  /** Soft glow: blurred copy screened on top. */
  bloom(g, src, amount, blur = 7, filter = 'brightness(0.92) contrast(1.7)') {
    if (amount <= 0.002) return;
    const s = this.gs;
    s.save();
    s.globalCompositeOperation = 'copy';
    s.filter = `${filter} blur(${blur}px)`;
    s.drawImage(src, 0, 0, MW, MH);
    s.restore();
    g.save();
    g.globalCompositeOperation = 'screen';
    g.globalAlpha = clamp(amount);
    g.drawImage(this.small, 0, 0, W, H);
    g.restore();
  }

  grain(g, t, amount, view = VIEW) {
    if (amount <= 0) return;
    const f = Math.floor(t * 30); // grain refreshes at film rate
    const tile = this.grainTiles[f % 4];
    const r = mulberry32(f * 7919 + 13);
    g.save();
    g.beginPath();
    g.rect(view.x, view.y, view.w, view.h);
    g.clip();
    g.globalCompositeOperation = 'overlay';
    g.globalAlpha = amount;
    const ox = Math.floor(r() * 256);
    const oy = Math.floor(r() * 256);
    for (let y = view.y - oy; y < view.y + view.h; y += 256) {
      for (let x = -ox; x < W; x += 256) g.drawImage(tile, x, y);
    }
    g.restore();
  }

  vignette(g, amount, view = VIEW, color = '20,14,12') {
    if (amount <= 0) return;
    const cx = view.x + view.w / 2;
    const cy = view.y + view.h / 2;
    const r = Math.hypot(view.w, view.h) / 2;
    const grd = g.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 1.02);
    grd.addColorStop(0, `rgba(${color},0)`);
    grd.addColorStop(1, `rgba(${color},${amount})`);
    g.save();
    g.fillStyle = grd;
    g.fillRect(view.x, view.y, view.w, view.h);
    g.restore();
  }

  flash(g, color, amount, view = VIEW, mode = 'source-over') {
    if (amount <= 0.002) return;
    g.save();
    g.globalCompositeOperation = mode;
    g.globalAlpha = clamp(amount);
    g.fillStyle = color;
    g.fillRect(view.x, view.y, view.w, view.h);
    g.restore();
  }

  /** Warm light leak drifting across the frame (screen blend). */
  lightLeak(g, t, amount, colors = ['255,120,60', '255,200,120'], seed = 0, view = VIEW) {
    if (amount <= 0.002) return;
    g.save();
    g.globalCompositeOperation = 'screen';
    for (let i = 0; i < colors.length; i++) {
      const ph = t * (0.07 + i * 0.03) + seed + i * 2.1;
      const x = view.x + view.w * (0.5 + 0.6 * Math.sin(ph));
      const y = view.y + view.h * (0.5 + 0.5 * Math.cos(ph * 1.3));
      const r = view.w * (0.45 + 0.15 * Math.sin(ph * 0.7));
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, `rgba(${colors[i]},${0.55 * amount})`);
      grd.addColorStop(1, `rgba(${colors[i]},0)`);
      g.fillStyle = grd;
      g.fillRect(view.x, view.y, view.w, view.h);
    }
    g.restore();
  }

  /** Anamorphic lens flare: a long horizontal streak with a hot core. */
  flare(g, x, y, amount, color = '150,190,255') {
    if (amount <= 0.003) return;
    g.save();
    g.globalCompositeOperation = 'screen';
    g.globalAlpha = clamp(amount);
    g.translate(x, y);
    g.save();
    g.scale(7, 0.16);
    const r = 300;
    const streak = g.createRadialGradient(0, 0, 0, 0, 0, r);
    streak.addColorStop(0, `rgba(${color},0.95)`);
    streak.addColorStop(0.2, `rgba(${color},0.45)`);
    streak.addColorStop(1, `rgba(${color},0)`);
    g.fillStyle = streak;
    g.fillRect(-r, -r, 2 * r, 2 * r);
    g.restore();
    const core = g.createRadialGradient(0, 0, 0, 0, 0, 160);
    core.addColorStop(0, 'rgba(255,255,255,0.9)');
    core.addColorStop(0.3, `rgba(${color},0.35)`);
    core.addColorStop(1, `rgba(${color},0)`);
    g.fillStyle = core;
    g.fillRect(-160, -160, 320, 320);
    g.restore();
  }

  /** Volumetric light rays from (x, y) in view space. */
  godRays(g, t, x, y, amount, color = '255,214,150', view = VIEW) {
    if (amount <= 0.002) return;
    const s = this.gs2;
    const sx = MW / view.w;
    s.save();
    s.setTransform(1, 0, 0, 1, 0, 0);
    s.clearRect(0, 0, MW, MH);
    s.translate(x * sx, y * sx);
    const r = mulberry32(5);
    for (let i = 0; i < 28; i++) {
      const a = r() * TAU + t * 0.04 * (r() < 0.5 ? 1 : -1);
      const wdt = r.range(0.015, 0.06);
      const len = MW * r.range(0.6, 1.3);
      const grd = s.createRadialGradient(0, 0, 0, 0, 0, len);
      const k = r.range(0.25, 0.7) * (0.75 + 0.25 * Math.sin(t * r.range(0.6, 1.6) + i));
      grd.addColorStop(0, `rgba(${color},${k})`);
      grd.addColorStop(1, `rgba(${color},0)`);
      s.fillStyle = grd;
      s.beginPath();
      s.moveTo(0, 0);
      s.arc(0, 0, len, a - wdt, a + wdt);
      s.closePath();
      s.fill();
    }
    s.restore();
    const b = this.gs;
    b.save();
    b.globalCompositeOperation = 'copy';
    b.filter = 'blur(2px)';
    b.drawImage(this.small2, 0, 0);
    b.restore();
    g.save();
    g.globalCompositeOperation = 'screen';
    g.globalAlpha = clamp(amount);
    g.drawImage(this.small, view.x, view.y, view.w, view.w * (MH / MW));
    g.restore();
  }
}

/** Ink-bleed envelope helper for a reveal starting at t0 lasting dur. */
export const inkProgress = (t, t0, dur) => smoothstep(0, 1, (t - t0) / dur);
