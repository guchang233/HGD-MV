// Audio-derived timing: beat grid, onset lists and loudness envelopes
// produced by tools/build_audio.py (assets/timing.json).
import { clamp, lastBefore } from './core.js';

export const BPM = 120;
export const BEAT = 60 / BPM;
export const BEAT0 = 0.055; // first downbeat of the PV soundtrack
export const BARLEN = BEAT * 4;

let data = null;

export async function loadTiming(url) {
  data = await (await fetch(url)).json();
  return data;
}

export const timing = () => data;

/** Install timing data directly (Node tools). */
export function setTiming(d) {
  data = d;
}

/** Time of beat k (k may be fractional). */
export const beatAt = (k) => BEAT0 + k * BEAT;
/** Time of the downbeat starting bar n. */
export const barAt = (n) => BEAT0 + n * BARLEN;

/**
 * Decaying impulse train: sum of strength * exp(-(t - ti) / decay) over the
 * events of `kind` ('kicks' | 'hits' | 'hats') that happened before t.
 */
export function pulse(kind, t, decay = 0.12, minStrength = 0, window = [-Infinity, Infinity]) {
  const list = data[kind];
  let i = lastBefore(list, t);
  let v = 0;
  for (; i >= 0; i--) {
    const [ti, s] = list[i];
    const age = t - ti;
    if (age > decay * 6) break;
    if (s < minStrength || ti < window[0] || ti > window[1]) continue;
    v += Math.min(s, 1.5) * Math.exp(-age / decay);
  }
  return v;
}

/** Events of a kind inside [a, b). */
export function events(kind, a, b, minStrength = 0) {
  return data[kind].filter(([ti, s]) => ti >= a && ti < b && s >= minStrength);
}

function envAt(arr, t) {
  const f = t * data.fps;
  const i = Math.floor(f);
  const a = arr[clamp(i, 0, arr.length - 1)];
  const b = arr[clamp(i + 1, 0, arr.length - 1)];
  return a + (b - a) * (f - i);
}

export const loudness = (t) => envAt(data.rms, t);
export const bass = (t) => envAt(data.bass, t);
