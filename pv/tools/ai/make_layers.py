#!/usr/bin/env python3
"""Optional: split the slot pictures into 2.5D parallax layers.

Depth-Anything-V2 (small) estimates relative depth; the nearest region
becomes a feathered foreground layer, and the hole it leaves in the
background is inpainted so the layers can slide apart under the camera.
Pictures with no clear subject stay single-layer.  Reads
pv/assets/images/<id>*.(png|jpg|webp), writes
pv/assets/images/layers/<id>_bg.webp and <id>_fg.webp, which render.mjs
picks up automatically.

    pip install torch transformers opencv-python-headless pillow
    python pv/tools/ai/make_layers.py [--force]
"""
import pathlib
import re
import sys

import cv2
import numpy as np
import torch
from PIL import Image
from transformers import pipeline

ROOT = pathlib.Path(__file__).resolve().parents[3]
SRC = ROOT / "pv" / "assets" / "images"
OUT = SRC / "layers"
NAME = re.compile(r"^[Ss]?(\d{2})(?:[ _\-.].*)?\.(png|jpe?g|webp)$", re.I)
WIDTH = 2400


def layers(depth_model, img):
    SIZE = img.size
    small = img.resize((960, round(960 * SIZE[1] / SIZE[0])), Image.BICUBIC)
    with torch.inference_mode():
        d = depth_model(small)["predicted_depth"].squeeze().float().numpy()
    d = cv2.resize(d, SIZE, interpolation=cv2.INTER_CUBIC)
    lo, hi = np.percentile(d, 2), np.percentile(d, 98)
    d8 = (np.clip((d - lo) / (hi - lo + 1e-6), 0, 1) * 255).astype(np.uint8)
    thr, mask = cv2.threshold(d8, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    # flat paper-white areas connected to the frame edge are background
    # (floors, skies), even when the depth model calls them near
    gray = cv2.cvtColor(np.asarray(img), cv2.COLOR_RGB2GRAY).astype(np.float32)
    std = np.sqrt(np.maximum(cv2.blur(gray * gray, (9, 9)) - cv2.blur(gray, (9, 9)) ** 2, 0))
    flat = ((std < 4) & (gray > 200)).astype(np.uint8)
    nf, flab = cv2.connectedComponents(flat)
    edge = set(np.unique(np.concatenate([flab[0], flab[-1], flab[:, 0], flab[:, -1]]))) - {0}
    if edge:
        mask[np.isin(flab, list(edge))] = 0
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(mask)
    keep = np.zeros_like(mask)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] > 0.02 * mask.size:
            keep[lab == i] = 255
    frac = keep.mean() / 255
    if frac < 0.04 or frac > 0.62:
        return None, None, frac
    alpha = cv2.GaussianBlur(keep, (0, 0), 4)
    rgb = np.asarray(img)
    fg = np.dstack([rgb, alpha])
    hole = cv2.dilate(keep, np.ones((41, 41), np.uint8))
    half = cv2.resize(rgb, (SIZE[0] // 2, SIZE[1] // 2), interpolation=cv2.INTER_AREA)
    hole_half = cv2.resize(hole, (SIZE[0] // 2, SIZE[1] // 2), interpolation=cv2.INTER_NEAREST)
    filled = cv2.inpaint(half, hole_half, 11, cv2.INPAINT_TELEA)
    filled = cv2.resize(filled, SIZE, interpolation=cv2.INTER_CUBIC)
    m = (cv2.GaussianBlur(hole, (0, 0), 6).astype(np.float32) / 255)[..., None]
    bg = (rgb * (1 - m) + filled * m).astype(np.uint8)
    return Image.fromarray(bg), Image.fromarray(fg, "RGBA"), frac


def main():
    force = "--force" in sys.argv
    OUT.mkdir(parents=True, exist_ok=True)
    pictures = {}
    for f in sorted(SRC.iterdir()):
        m = NAME.match(f.name)
        if m and m.group(1) not in pictures:
            pictures[m.group(1)] = f
    torch.set_num_threads(4)
    depth = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf", device="cpu")
    for sid, f in pictures.items():
        if (OUT / f"{sid}_bg.webp").exists() and not force:
            continue
        img = Image.open(f).convert("RGB")
        img = img.resize((WIDTH, round(WIDTH * img.height / img.width)), Image.LANCZOS)
        bg, fg, frac = layers(depth, img)
        if bg is None:
            for old in OUT.glob(f"{sid}_*.webp"):
                old.unlink()
            print(f"S{sid}: single layer (subject {frac:.2f})", flush=True)
            continue
        bg.save(OUT / f"{sid}_bg.webp", quality=88, method=5)
        fg.save(OUT / f"{sid}_fg.webp", quality=90, method=5)
        print(f"S{sid}: 2 layers (subject {frac:.2f})", flush=True)


if __name__ == "__main__":
    main()
