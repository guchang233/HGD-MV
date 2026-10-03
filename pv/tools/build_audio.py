#!/usr/bin/env python3
"""Cut the PV soundtrack out of the original MV and analyse it.

The song runs at a steady 120 BPM (beat 0 at 0.05 s) and is built from
16-second phrases, so the edit only ever jumps between identical positions
in the bar.  That keeps the beat grid of the PV continuous:

    PV  0.00 - 15.99   intro                     (src  0.00 - 15.99)
    PV 15.99 - 33.45   "我想要死在春天里" pre-chorus (src 61.99 - 79.45)
    PV 33.45 - end     final chorus + coda        (src 127.45 - end)

Outputs
    pv/build/pv_audio.wav     44.1 kHz stereo soundtrack
    pv/assets/timing.json     beat grid, onsets and loudness envelope used
                              by the renderer for audio-reactive motion
"""
import json
import pathlib
import subprocess
import sys

import numpy as np
import scipy.io.wavfile as wavfile
import scipy.signal as signal

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT / "花骨朵.mp4"
BUILD = ROOT / "pv" / "build"
ASSETS = ROOT / "pv" / "assets"
SR = 44100
FPS = 60

# (src_start, src_end) in seconds; None = until the end of the file.
SEGMENTS = [(0.0, 15.99), (61.99, 79.45), (127.45, None)]
XFADE = 0.012  # equal-power crossfade at each splice


def load_audio():
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(SRC), "-vn", "-ac", "2", "-ar", str(SR),
         "-f", "f32le", "-"],
        check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def splice(x):
    n_fade = int(XFADE * SR)
    half = n_fade // 2
    out = None
    mapping = []  # (pv_start, src_start, duration)
    pv_t = 0.0
    for i, (a, b) in enumerate(SEGMENTS):
        b = len(x) / SR if b is None else b
        s0 = max(int(round(a * SR)) - half, 0)
        s1 = min(int(round(b * SR)) + half, len(x))
        seg = x[s0:s1].copy()
        fade = np.linspace(0, np.pi / 2, n_fade, dtype=np.float32)
        if i > 0:
            seg[:n_fade] *= np.sin(fade)[:, None]
        if i < len(SEGMENTS) - 1:
            seg[-n_fade:] *= np.cos(fade)[:, None]
        if out is None:
            out = seg
        else:
            # overlap the fade regions so the splice point stays on the grid
            tail = out[-n_fade:] + seg[:n_fade]
            out = np.concatenate([out[:-n_fade], tail, seg[n_fade:]])
        mapping.append({"pv": round(pv_t, 4), "src": a, "dur": round(b - a, 4)})
        pv_t += b - a
    return out, mapping


def onset_env(mono, lo, hi, hop=256, n_fft=2048):
    f, t, z = signal.stft(mono, fs=SR, nperseg=n_fft, noverlap=n_fft - hop,
                          boundary=None, padded=False)
    mag = np.log1p(1000 * np.abs(z[(f >= lo) & (f < hi)]))
    flux = np.maximum(0, np.diff(mag, axis=1)).sum(0)
    flux = np.concatenate([[0], flux])
    flux = np.maximum(flux - signal.medfilt(flux, 41), 0)
    flux /= np.percentile(flux, 99.7) + 1e-9
    return t, flux


def peaks(t, env, height, min_gap):
    fr = 1 / (t[1] - t[0])
    idx, _ = signal.find_peaks(env, height=height, distance=max(1, int(min_gap * fr)))
    return [[round(float(t[i]), 3), round(float(min(env[i], 2.0)), 3)] for i in idx]


def analyse(y):
    mono = y.mean(1)
    dur = len(mono) / SR
    t, low = onset_env(mono, 30, 150)
    _, mid = onset_env(mono, 150, 2500)
    _, high = onset_env(mono, 4000, 11000)
    # loudness envelope sampled at the video frame rate (0..1)
    win = int(SR / FPS)
    n = int(dur * FPS)
    rms = np.array([np.sqrt(np.mean(mono[i * win:(i + 1) * win] ** 2) + 1e-12) for i in range(n)])
    rms = signal.savgol_filter(rms, 9, 2)
    rms = np.clip(rms / np.percentile(rms, 99), 0, 1)
    # low-frequency energy (kick/bass "breathing") at the frame rate
    b, a = signal.butter(4, 140 / (SR / 2), "low")
    bass = signal.filtfilt(b, a, mono)
    bass_env = np.array([np.sqrt(np.mean(bass[i * win:(i + 1) * win] ** 2) + 1e-12) for i in range(n)])
    bass_env = np.clip(bass_env / np.percentile(bass_env, 99), 0, 1)
    return {
        "duration": round(dur, 3),
        "bpm": 120,
        "beat0": 0.05,
        "kicks": peaks(t, low, 0.45, 0.18),
        "hits": peaks(t, mid, 0.45, 0.12),
        "hats": peaks(t, high, 0.5, 0.12),
        "fps": FPS,
        "rms": [round(float(v), 3) for v in rms],
        "bass": [round(float(v), 3) for v in bass_env],
    }


def main():
    BUILD.mkdir(parents=True, exist_ok=True)
    x = load_audio()
    y, mapping = splice(x)
    y = np.clip(y, -1, 1)
    wavfile.write(BUILD / "pv_audio.wav", SR, (y * 32767).astype(np.int16))
    info = analyse(y)
    info["segments"] = mapping
    (ASSETS / "timing.json").write_text(json.dumps(info, separators=(",", ":")))
    print(f"pv_audio.wav  {info['duration']:.2f}s  segments={mapping}")
    print(f"kicks={len(info['kicks'])} hits={len(info['hits'])} hats={len(info['hats'])}")


if __name__ == "__main__":
    sys.exit(main())
