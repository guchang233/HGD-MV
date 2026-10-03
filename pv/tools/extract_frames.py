#!/usr/bin/env python3
"""Extract the MV shots the PV uses as an upscaled JPEG sequence.

The MV is 1280x720 @ 30 fps with the picture letterboxed to 1280x504
(rows 110-613).  Frames are cropped to the picture, lightly denoised,
upscaled 1.6x to 2048x806 and written as pv/build/frames/f_<n>.jpg where
<n> is the source frame index (n = round(t * 30)).
"""
import pathlib
import shutil
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT / "花骨朵.mp4"
OUT = ROOT / "pv" / "build" / "frames"
FPS = 30

# Source time ranges (seconds) that the timeline draws from.
RANGES = [
    (3.9, 6.2),      # girl holding the white flower
    (7.9, 10.6),     # mirrored faces, "演唱 洛天依"
    (10.9, 15.6),    # cat's cradle with the red string
    (49.9, 53.9),    # white flower tree on black
    (61.9, 79.6),    # "我想要死在春天里" … sedan chair
    (93.0, 95.2),    # MV title card (flower bleeding red)
    (114.8, 117.8),  # sleeping girls among red camellias
    (127.3, 162.1),  # final chorus, sunrise, plum tree, branch
]


def main():
    frames = sorted({n for a, b in RANGES for n in range(round(a * FPS), round(b * FPS) + 1)})
    have = {int(p.stem[2:]) for p in OUT.glob("f_*.jpg")} if OUT.exists() else set()
    if set(frames) <= have:
        print(f"{len(frames)} frames already extracted")
        return
    tmp = OUT.parent / "frames_tmp"
    shutil.rmtree(tmp, ignore_errors=True)
    tmp.mkdir(parents=True)
    OUT.mkdir(parents=True, exist_ok=True)
    sel = "+".join(f"between(n\\,{round(a * FPS)}\\,{round(b * FPS)})" for a, b in RANGES)
    vf = (f"select='{sel}',crop=1280:504:0:110,hqdn3d=2:1.5:0:0,"
          "scale=2048:806:flags=lanczos,unsharp=5:5:0.7:5:5:0")
    subprocess.run(["ffmpeg", "-v", "error", "-i", str(SRC), "-vf", vf, "-fps_mode", "passthrough",
                    "-q:v", "2", str(tmp / "%05d.jpg")], check=True)
    written = sorted(tmp.glob("*.jpg"))
    assert len(written) == len(frames), (len(written), len(frames))
    for n, path in zip(frames, written):
        path.replace(OUT / f"f_{n:05d}.jpg")
    shutil.rmtree(tmp)
    print(f"extracted {len(frames)} frames to {OUT}")


if __name__ == "__main__":
    main()
