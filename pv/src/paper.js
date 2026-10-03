// Procedural rice-paper texture: soft mottling, long fibres and specks on a
// warm grey ground, generated once and reused as the painting surface.
import { makeCanvas, ctx2d, mulberry32, noiseField } from './core.js';

export function makePaper(w, h, seed = 7, base = [231, 230, 225]) {
  const c = makeCanvas(w, h);
  const g = ctx2d(c);
  const img = g.createImageData(w, h);
  const lw = Math.ceil(w / 4);
  const lh = Math.ceil(h / 4);
  const low = noiseField(lw, lh, seed, 0.012, 5); // cloudy mottling (quarter res)
  const rnd = mulberry32(seed * 31 + 1);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    const ly = Math.min(lh - 1, y >> 2);
    for (let x = 0; x < w; x++) {
      const m = low[ly * lw + Math.min(lw - 1, x >> 2)];
      const grain = (rnd() - 0.5) * 5;
      const v = (m - 0.5) * 16 + grain;
      const i = (y * w + x) * 4;
      d[i] = base[0] + v;
      d[i + 1] = base[1] + v;
      d[i + 2] = base[2] + v * 1.15;
      d[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  // fibres
  g.lineCap = 'round';
  for (let i = 0; i < (w * h) / 900; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const len = 8 + rnd() * 50;
    const a = rnd() * Math.PI * 2;
    const dark = rnd() < 0.5;
    g.strokeStyle = dark ? `rgba(120,112,100,${0.03 + rnd() * 0.05})` : `rgba(255,255,250,${0.05 + rnd() * 0.08})`;
    g.lineWidth = 0.6 + rnd() * 1.2;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(
      x + Math.cos(a) * len * 0.5 + (rnd() - 0.5) * 10,
      y + Math.sin(a) * len * 0.5 + (rnd() - 0.5) * 10,
      x + Math.cos(a) * len,
      y + Math.sin(a) * len,
    );
    g.stroke();
  }
  // specks
  for (let i = 0; i < (w * h) / 6000; i++) {
    g.fillStyle = `rgba(70,60,50,${0.05 + rnd() * 0.12})`;
    g.beginPath();
    g.arc(rnd() * w, rnd() * h, 0.4 + rnd() * 1.1, 0, Math.PI * 2);
    g.fill();
  }
  return c;
}

/** Soft vignette multiplied over the paper (cheap radial gradient). */
export function paperVignette(g, x, y, w, h, strength = 0.22) {
  const r = Math.hypot(w, h) / 2;
  const grd = g.createRadialGradient(x + w / 2, y + h / 2, r * 0.35, x + w / 2, y + h / 2, r * 1.05);
  grd.addColorStop(0, 'rgba(0,0,0,0)');
  grd.addColorStop(1, `rgba(60,52,44,${strength})`);
  g.fillStyle = grd;
  g.fillRect(x, y, w, h);
}
