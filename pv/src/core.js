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
  inBack: (t, k = 1.70158) => (k + 1) * t * t * t - k * t * t,
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

// ------------------------------------------------------ output scale --
// Everything is composed in 1920x1080 units.  With ?scale=2 in the page URL
// every drawing surface gets twice the pixels (3840x2160) while still
// reporting its 1080p size, and each 2D context folds the factor into its
// transform, so text, strokes and pictures are drawn natively at 4K.
// Surfaces used for per-pixel work (masks, noise, luma maps) pass raw = true
// and keep their pixel size.
export const SCALE =
  (typeof location !== 'undefined' && Number(new URLSearchParams(location.search).get('scale'))) || 1;

/** Give canvas c a w x h logical size backed by SCALE times the pixels. */
export function scaleCanvas(c, w, h) {
  c.width = Math.round(w * SCALE);
  c.height = Math.round(h * SCALE);
  if (SCALE === 1) return c;
  c.__s = SCALE;
  Object.defineProperty(c, 'width', { get: () => w, configurable: true });
  Object.defineProperty(c, 'height', { get: () => h, configurable: true });
  return c;
}

export function makeCanvas(w, h, raw = false) {
  const c = document.createElement('canvas');
  if (!raw) return scaleCanvas(c, w, h);
  c.width = w;
  c.height = h;
  return c;
}

if (SCALE !== 1 && typeof CanvasRenderingContext2D !== 'undefined') {
  const P = CanvasRenderingContext2D.prototype;
  const k = (g) => g.canvas.__s ?? 1;
  const setT = P.setTransform;
  P.setTransform = function (a, b, c, d, e, f) {
    const s = k(this);
    if (typeof a === 'object') ({ a, b, c, d, e, f } = a);
    return setT.call(this, s * a, s * b, s * c, s * d, s * e, s * f);
  };
  P.resetTransform = function () {
    this.setTransform(1, 0, 0, 1, 0, 0);
  };
  const draw = P.drawImage;
  P.drawImage = function (img, ...a) {
    const s = img?.__s;
    if (s && a.length === 2) return draw.call(this, img, a[0], a[1], img.width, img.height);
    if (s && a.length === 8) return draw.call(this, img, a[0] * s, a[1] * s, a[2] * s, a[3] * s, a[4], a[5], a[6], a[7]);
    return draw.call(this, img, ...a);
  };
  // pixel-unit properties that the transform does not reach
  const px = (name, fix) => {
    const d = Object.getOwnPropertyDescriptor(P, name);
    Object.defineProperty(P, name, {
      configurable: true,
      get() {
        return d.get.call(this);
      },
      set(v) {
        d.set.call(this, k(this) === 1 ? v : fix(v, k(this)));
      },
    });
  };
  px('shadowBlur', (v, s) => v * s);
  px('shadowOffsetX', (v, s) => v * s);
  px('shadowOffsetY', (v, s) => v * s);
  px('filter', (v, s) => (typeof v === 'string' ? v.replace(/(-?[\d.]+)px/g, (m, n) => `${n * s}px`) : v));
  // a fresh context on a scaled canvas starts at the scaled identity
  const getCtx = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, opts) {
    const g = getCtx.call(this, type, opts);
    if (this.__s && g && !g.__scaled) {
      g.__scaled = true;
      g.setTransform(1, 0, 0, 1, 0, 0);
    }
    return g;
  };
}

// Bilinear filtering: in software rendering it is ~6x faster than 'high'
// for the full-frame transformed draws every sub-frame makes, and nearly
// indistinguishable at the 1-1.5x magnifications used.  Small sprites switch
// to 'medium' (mipmapped) where they are drawn much smaller than stored.
export function ctx2d(c) {
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'low';
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
