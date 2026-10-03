#!/usr/bin/env python3
"""Beat-sync data for the full-song PV, from Demucs stems.

Reads the stems written by `python -m demucs -n htdemucs` (drums/bass/
other/vocals) and writes pv/assets/timing.json:
    kicks/snares/hats  [time, strength] drum hits from the drum stem
    rms/bass/vocal     loudness envelopes at 60 fps (0..1)
The song is 120 BPM with its first downbeat at 0.055 s.
"""
import json
import pathlib
import sys

import numpy as np
import scipy.io.wavfile as wavfile
import scipy.signal as signal

ROOT = pathlib.Path(__file__).resolve().parents[3]
STEMS = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/claude-0/ai/sep4/htdemucs/song")
FPS = 60


def load(name):
    sr, x = wavfile.read(STEMS / f"{name}.wav")
    x = x.astype(np.float32)
    if x.dtype != np.float32 or np.abs(x).max() > 2:
        x /= 32768.0
    return sr, x.mean(1) if x.ndim > 1 else x


def band_onsets(x, sr, lo, hi, height, gap, hop=256, n_fft=2048):
    f, t, z = signal.stft(x, fs=sr, nperseg=n_fft, noverlap=n_fft - hop, boundary=None, padded=False)
    mag = np.log1p(200 * np.abs(z[(f >= lo) & (f < hi)]))
    flux = np.maximum(0, np.diff(mag, axis=1)).sum(0)
    flux = np.concatenate([[0], flux])
    flux = np.maximum(flux - signal.medfilt(flux, 31), 0)
    flux /= np.percentile(flux, 99.5) + 1e-9
    idx, _ = signal.find_peaks(flux, height=height, distance=max(1, int(gap * sr / hop)))
    # STFT frames are window-centred; shift back by ~half a window of attack
    return [[round(float(t[i] - 0.012), 3), round(float(min(flux[i], 1.5)), 3)] for i in idx]


def envelope(x, sr, n):
    win = int(sr / FPS)
    e = np.array([np.sqrt(np.mean(x[i * win:(i + 1) * win] ** 2) + 1e-12) for i in range(n)])
    e = signal.savgol_filter(e, 9, 2)
    return [round(float(v), 3) for v in np.clip(e / np.percentile(e, 99), 0, 1)]


def main():
    sr, drums = load("drums")
    _, bass = load("bass")
    _, vocals = load("vocals")
    _, other = load("other")
    mix = drums + bass + vocals + other
    dur = len(mix) / sr
    n = int(dur * FPS)
    b, a = signal.butter(4, 160 / (sr / 2), "low")
    low = signal.filtfilt(b, a, bass + drums)
    data = {
        "duration": round(dur, 3),
        "bpm": 120,
        "beat0": 0.055,
        "fps": FPS,
        "kicks": band_onsets(drums, sr, 30, 140, 0.35, 0.16),
        "snares": band_onsets(drums, sr, 180, 3000, 0.45, 0.16),
        "hats": band_onsets(drums, sr, 6000, 16000, 0.4, 0.09),
        "rms": envelope(mix, sr, n),
        "bass": envelope(low, sr, n),
        "vocal": envelope(vocals, sr, n),
    }
    out = ROOT / "pv" / "assets" / "timing.json"
    out.write_text(json.dumps(data, separators=(",", ":")))
    print(f"{dur:.1f}s  kicks={len(data['kicks'])} snares={len(data['snares'])} hats={len(data['hats'])} -> {out}")


if __name__ == "__main__":
    main()
