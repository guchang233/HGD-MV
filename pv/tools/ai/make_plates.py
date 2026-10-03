#!/usr/bin/env python3
"""AI image plates for the full-song PV.

* restyle: key moments of the original MV, cropped to 16:9 (away from the
  MV's lettering), lightly inpainted where text remains, then re-drawn with
  LCM-Dreamshaper img2img at low strength so the heroine stays recognisable.
* scene:   new txt2img plates for lyrics the MV never shows.

Every plate is upscaled 4x with Real-ESRGAN (animevideov3, ONNX) and stored
at 2400x1350.  Run inside an environment with torch, diffusers, onnxruntime,
opencv-python-headless (see pv/README.md).  Deterministic seeds per plate.
"""
import hashlib
import pathlib
import subprocess
import sys
import time

import cv2
import numpy as np
import onnxruntime as ort
import torch
from diffusers import AutoPipelineForImage2Image, DiffusionPipeline
from huggingface_hub import hf_hub_download
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[3]
MV = ROOT / "花骨朵.mp4"
OUT = ROOT / "pv" / "build" / "plates"
W, H = 1024, 576
FINAL = (2400, 1350)

STYLE = "anime illustration, cel shading, clean line art, cinematic lighting, highly detailed, masterpiece, best quality"
GIRL = "girl with grey hair in round buns and green eyes"

# name, MV time, crop x (896x504 window in the 1280x504 picture), inpaint rects, strength, description
RESTYLE = [
    ("girl_flower", 4.6, 192, [], 0.45, f"a {GIRL} in a white qipao holding a white flower in red hands, long ribbons, white background"),
    ("faces", 7.8, 192, [], 0.45, "two girls face to face with eyes closed, one grey one vermilion, mirrored, white background"),
    ("cradle", 12.6, 192, [], 0.42, "two hands playing cat's cradle with a red string, white background"),
    ("kids", 16.4, 0, [], 0.45, f"a {GIRL} in a white qipao bending towards two small children in winter coats"),
    ("flying", 18.6, 100, [], 0.45, "a girl in a white dress flying through the air with long white ribbons, two children watching"),
    ("armsout", 20.2, 60, [], 0.45, f"a {GIRL} in a white qipao spreading her arms, red gloves, wind, ribbons"),
    ("butterfly_hand", 23.4, 384, [], 0.42, "a red hand with a blue butterfly resting on it, close-up, white background"),
    ("face_butterfly", 25.3, 384, [], 0.42, "close-up of a girl's face with green eyes, a blue butterfly on a red hand"),
    ("pointing", 26.6, 120, [], 0.45, f"a {GIRL} pointing at a tiny butterfly flying away, side view, white background"),
    ("sleepers", 30.4, 192, [], 0.45, "many sleeping girls lying together among red flowers, top view"),
    ("pile", 37.6, 384, [], 0.45, "a girl sitting on top of a pile of sleeping girls, wide shot, white background"),
    ("lookback", 39.4, 120, [], 0.42, f"a {GIRL} looking back over her shoulder, close-up, white background"),
    ("chair", 41.4, 140, [], 0.45, "a girl sitting on a red antique chair between white curtains"),
    ("flowertree", 50.5, 192, [], 0.45, "a girl standing inside a giant tree of white flowers with red centers on a black background"),
    ("bride_close", 54.4, 0, [], 0.45, "two girls, one wearing a phoenix crown of red flowers, close-up, black background"),
    ("girls_row", 58.6, 0, [], 0.45, "a row of girls in white qipao standing in the dark next to an antique chair"),
    ("redroom", 62.6, 0, [], 0.45, f"a {GIRL} lying peacefully in a red room full of chinese ornaments, top view"),
    ("redroom_wide", 66.4, 0, [(820, 0, 76, 230, "box")], 0.45, "a girl lying on red silk among chinese furniture, top-down wide shot, red and green"),
    ("bride_crown", 70.55, 192, [], 0.42, "a bride's phoenix crown with big red camellias and beaded tassels covering her face"),
    ("black_girl", 79.6, 100, [], 0.45, f"a {GIRL} in a white qipao standing in the dark among giant grey flowers"),
    ("face_front", 84.3, 192, [], 0.42, f"front close-up of a {GIRL}, dark background"),
    ("silhouettes", 86.4, 0, [], 0.45, "a girl in white walking past a crowd of dark silhouettes of girls"),
    ("plum_arch", 95.6, 0, [], 0.45, "a girl under an arch of dark plum tree branches with red blossoms, white background"),
    ("bride_cry", 99.6, 0, [], 0.42, "a crying bride in a phoenix crown of red camellias with bead curtains, tears"),
    ("head_hands", 104.0, 0, [(830, 40, 66, 330, "box")], 0.45, f"a {GIRL} holding her head with red hands, eyes closed, white background"),
    ("dark_room", 107.3, 384, [(0, 0, 110, 300, "text")], 0.45, "top-down view of a dark cluttered antique room, a small girl sitting alone on the floor"),
    ("arms_crossed", 111.2, 120, [(840, 0, 56, 90, "text")], 0.42, f"a {GIRL} hiding her mouth behind crossed red arms, staring, close-up"),
    ("camellia", 115.0, 384, [], 0.45, "sleeping girls among red camellias, dark background, top view"),
    ("red_hands", 118.6, 384, [], 0.42, "red hands holding a white flower, white background"),
    ("brides_row", 123.3, 0, [(600, 0, 160, 330, "text")], 0.45, "a row of brides in red embroidered wedding dresses with red flowers for heads, a small girl in white among them, black background"),
    ("snow_girl", 127.6, 192, [], 0.45, f"a {GIRL} hugging herself in a blizzard, snowy ground, ribbons, cold blue light"),
    ("snow_wind", 132.0, 384, [(740, 0, 156, 110, "text")], 0.45, "a girl bending against the snowy wind at night, starry dark sky"),
    ("closeup_eyes", 134.75, 0, [], 0.42, "extreme close-up of a girl's face with cracks, tired eyes, cold blue light"),
    ("red_hand_snow", 136.85, 0, [], 0.45, "a red hand and a white sleeve with red flowers, night snow"),
    ("back", 141.0, 192, [], 0.45, "a girl seen from behind in the snowy night, red stains, wind"),
    ("flower_face", 144.05, 0, [], 0.45, "a girl whose face is covered by a large white flower with a red center, night"),
    ("sunrise", 147.3, 192, [(420, 0, 90, 120, "text")], 0.5, "a golden sunrise bursting through dark clouds over a lonely bare tree, god rays"),
    ("plum_tree_girl", 151.2, 0, [], 0.45, "a girl lying in the branches of a plum tree full of red blossoms, white background"),
    ("closeup_blossom", 154.6, 192, [], 0.42, "a sleeping girl with a big red camellia in her hair among plum branches"),
    ("branch", 158.0, 300, [], 0.45, "a plum branch with red blossoms on a white background, ink painting"),
]

SCENE_STYLE = "anime background art, cinematic composition, dramatic lighting, highly detailed, masterpiece"
SCENES = [
    ("s_snow_plum", "red plum blossoms on a dark gnarled branch in heavy snowfall at night, deep navy sky, chinese ink painting"),
    ("s_frozen_town", "frozen ancient chinese town at night in a blizzard, blue tones, empty streets, red lanterns covered in snow"),
    ("s_empty_alley", "an empty narrow ancient chinese alley at night covered in snow, a single red lantern, a long lonely shadow on the wall"),
    ("s_pale_sun", "a pale cold sun hidden behind heavy grey winter clouds over a frozen river, ink wash painting, desolate"),
    ("s_snow_house", "a small traditional chinese house covered in snow with a warm glowing window at night"),
    ("s_red_field", "a vast field of red flowers on green grass seen from above, spring breeze, flying petals"),
    ("s_wild_growth", "red camellias and twisting vines growing wildly out of dark wet earth, dramatic rim light, macro"),
    ("s_silk_clouds", "clouds flowing like a white silk dress across a pale sky, soft light, chinese painting"),
    ("s_wedding_bed", "an antique chinese wooden canopy bed with red curtains and candlelight in a dark room"),
    ("s_frost_leaves", "white frost on red maple leaves at dawn, first frost of autumn, cold light, macro"),
    ("s_youth_tree", "silhouette of a young man standing under a bare tree in the distance at dusk, falling snow, ink wash"),
    ("s_golden_peaks", "golden sunrise over snowy mountains with god rays and drifting mist"),
    ("s_blue_butterfly", "a blue morpho butterfly resting on red camellia petals, macro, black background"),
    ("s_crossroads", "a lonely crossroads splitting into two paths across a snowy field at dusk, one left one right"),
]


def seed_of(name):
    return int(hashlib.sha1(name.encode()).hexdigest()[:8], 16)


def mv_frame(t, x):
    raw = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-ss", f"{t}", "-i", str(MV), "-frames:v", "1",
                          "-vf", f"crop=896:504:{x}:110", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(504, 896, 3).copy()


def scrub_text(img, rects):
    """Inpaint leftover MV lettering inside the given rectangles."""
    if not rects:
        return img
    mask = np.zeros(img.shape[:2], np.uint8)
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY).astype(np.int16)
    for x, y, w, h, mode in rects:
        if mode == "box":
            mask[y:y + h, x:x + w] = 255
            continue
        roi = img[y:y + h, x:x + w].astype(np.int16)
        bg = cv2.medianBlur(img[y:y + h, x:x + w], 21).astype(np.int16)
        diff = np.abs(roi - bg).max(axis=2)
        mask[y:y + h, x:x + w] = np.where(diff > 38, 255, 0).astype(np.uint8)
    mask = cv2.dilate(mask, np.ones((5, 5), np.uint8), iterations=2)
    return cv2.inpaint(img, mask, 7, cv2.INPAINT_TELEA)


class Upscaler:
    def __init__(self):
        path = hf_hub_download("skillsafe-ai/realesr-animevideov3", "model.onnx")
        so = ort.SessionOptions()
        so.intra_op_num_threads = 4
        self.s = ort.InferenceSession(path, so, providers=["CPUExecutionProvider"])

    def __call__(self, img):
        x = (np.asarray(img.convert("RGB"), np.float32) / 255).transpose(2, 0, 1)[None]
        y = self.s.run(None, {"input": x})[0][0].transpose(1, 2, 0)
        return Image.fromarray((np.clip(y, 0, 1) * 255 + 0.5).astype(np.uint8))


def main():
    only = set(sys.argv[1:])
    OUT.mkdir(parents=True, exist_ok=True)
    torch.set_num_threads(4)
    t2i = DiffusionPipeline.from_pretrained("SimianLuo/LCM_Dreamshaper_v7", torch_dtype=torch.float32, safety_checker=None)
    t2i.set_progress_bar_config(disable=True)
    i2i = AutoPipelineForImage2Image.from_pipe(t2i)
    sr = Upscaler()

    def finish(name, img):
        big = sr(img).resize(FINAL, Image.LANCZOS)
        big.save(OUT / f"{name}.jpg", quality=93)

    for name, t, x, rects, strength, desc in RESTYLE:
        if (only and name not in only) or (not only and (OUT / f"{name}.jpg").exists()):
            continue
        t0 = time.time()
        src = scrub_text(mv_frame(t, x), rects)
        Image.fromarray(src).save(OUT / f"{name}_src.png")
        init = Image.fromarray(src).resize((W, H), Image.LANCZOS)
        img = i2i(prompt=f"{desc}, {STYLE}", image=init, strength=strength, num_inference_steps=6,
                  guidance_scale=8.0, generator=torch.Generator().manual_seed(seed_of(name))).images[0]
        finish(name, img)
        print(f"restyle {name:16s} {time.time() - t0:5.1f}s", flush=True)

    for name, desc in SCENES:
        if (only and name not in only) or (not only and (OUT / f"{name}.jpg").exists()):
            continue
        t0 = time.time()
        img = t2i(prompt=f"{desc}, {SCENE_STYLE}", num_inference_steps=4, guidance_scale=8.0, width=W, height=H,
                  generator=torch.Generator().manual_seed(seed_of(name))).images[0]
        finish(name, img)
        print(f"scene   {name:16s} {time.time() - t0:5.1f}s", flush=True)


if __name__ == "__main__":
    main()
