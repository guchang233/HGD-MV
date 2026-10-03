// Shared constants and small deterministic helpers.  Everything the PV draws
// is a pure function of time, so frames can be rendered in any order and in
// parallel workers and still come out identical.

export const W = 1920;
export const H = 1080;
export const BAR = 0; // full 16:9 frame; letterboxing is an animated effect
export const VIEW = { x: 0, y: BAR, w: W, h: H - 2 * BAR };

export const PALETTE = {
  paper: '#e7e6e1',
  ink: '#1c1917',
  vermilion: '#e26a5e',
  coral: '#f0866a',
  scarlet: '#d34e4a',
  crimson: '#a8050b',
  blood: '#86000a',
  night: '#131319',
  gold: '#ffcf7a',
};

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const invlerp = (a, b, x) => clamp((x - a) / (b - a));
export const smoothstep = (a, b, x) => {
  const t = invlerp(a, b, x);
  return t * t * (3 - 2 * t);
};
export const fract = (x) => x - Math.floor(x);
export const TAU = Math.PI * 2;

export const ease = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inQuart: (t) => t * t * t * t,
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
  inOutQuart: (t) => (t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2),
  inExpo: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutExpo: (t) =>
    t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  outSine: (t) => Math.sin((t * Math.PI) / 2),
  outBack: (t, k = 1.70158) => 1 + (k + 1) * Math.pow(t - 1, 3) + k * Math.pow(t - 1, 2),
  // damped spring settling at 1 (used for blooms and stamps)
  spring: (t, freq = 4.5, damp = 5.5) => (t <= 0 ? 0 : 1 - Math.exp(-damp * t) * Math.cos(freq * TAU * t * 0.5)),
};

// Time-window helper: progress of t through [a, b] with an easing curve.
export const span = (t, a, b, fn = ease.linear) => fn(invlerp(a, b, t));

export function mulberry32(seed) {
  let s = seed >>> 0;
  const rnd = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
  rnd.range = (a, b) => a + (b - a) * rnd();
  rnd.int = (a, b) => Math.floor(a + (b - a + 1) * rnd());
  rnd.pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  rnd.sign = () => (rnd() < 0.5 ? -1 : 1);
  rnd.gauss = () => {
    let u = 0;
    for (let i = 0; i < 4; i++) u += rnd();
    return (u - 2) / 0.577;
  };
  return rnd;
}

// Integer hash -> [0,1): stateless randomness keyed by numbers.
export function hash(...v) {
  let h = 2166136261 >>> 0;
  for (const x of v) {
    h = Math.imul(h ^ (Math.floor(x * 1000) | 0), 16777619);
    h ^= h >>> 13;
    h = Math.imul(h, 0x5bd1e995);
    h ^= h >>> 15;
  }
  return (h >>> 0) / 4294967296;
}

// Smooth 1D noise in [-1,1] (for camera drift and shake).
export function noise1(x, seed = 0) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = hash(i, seed) * 2 - 1;
  const b = hash(i + 1, seed) * 2 - 1;
  return lerp(a, b, u);
}

export function fbm1(x, seed = 0, oct = 3) {
  let v = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    v += amp * noise1(x * f, seed + i * 17);
    f *= 2.03;
    amp *= 0.5;
  }
  return v;
}

// Value-noise field sampled into a Float32Array (w*h), values in [0,1].
export function noiseField(w, h, seed, scale = 0.02, octaves = 5) {
  const rnd = mulberry32(seed);
  const G = 256;
  const grid = new Float32Array(G * G);
  for (let i = 0; i < grid.length; i++) grid[i] = rnd();
  const sample = (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const i00 = ((yi & 255) * G) + (xi & 255);
    const i10 = ((yi & 255) * G) + ((xi + 1) & 255);
    const i01 = (((yi + 1) & 255) * G) + (xi & 255);
    const i11 = (((yi + 1) & 255) * G) + ((xi + 1) & 255);
    return lerp(lerp(grid[i00], grid[i10], u), lerp(grid[i01], grid[i11], u), v);
  };
  const out = new Float32Array(w * h);
  let norm = 0;
  for (let o = 0, a = 1; o < octaves; o++, a *= 0.5) norm += a;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0;
      let amp = 1;
      let f = scale;
      for (let o = 0; o < octaves; o++) {
        s += amp * sample(x * f + o * 31.7, y * f + o * 17.3);
        amp *= 0.5;
        f *= 2;
      }
      out[y * w + x] = s / norm;
    }
  }
  return out;
}

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export function ctx2d(c) {
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  return g;
}

export function rgba(hex, a = 1) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function mixHex(h1, h2, t) {
  const a = parseInt(h1.slice(1), 16);
  const b = parseInt(h2.slice(1), 16);
  const ch = (s) => Math.round(lerp((a >> s) & 255, (b >> s) & 255, t));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

// Binary search: index of last element with list[i][0] <= t (or -1).
export function lastBefore(list, t) {
  let lo = 0;
  let hi = list.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (list[mid][0] <= t) {
      ans = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return ans;
}
