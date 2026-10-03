#!/usr/bin/env python3
"""Syllable timing for every lyric character.

1. Demucs isolates the vocal:  python -m demucs -n htdemucs -o <dir> song.wav
2. A Chinese wav2vec2 CTC model force-aligns the known lyrics to the vocal,
   section by section (characters missing from its vocabulary are aligned
   through a homophone).
3. Each syllable is snapped to the song's 16th-note grid (120 BPM, beat 0 at
   0.055 s) when it lies within 70 ms of a grid point: the vocal was
   sequenced, so syllables sit on the grid.

Writes pv/assets/lyrics.json: [{text, end, chars: [[char, time], ...]}].
"""
import json
import pathlib
import sys

import librosa
import numpy as np
import torch
import torchaudio
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

ROOT = pathlib.Path(__file__).resolve().parents[3]
VOCALS = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/claude-0/ai/sep/htdemucs/song/vocals.wav")
MODEL = "jonatasgrosman/wav2vec2-large-xlsr-53-chinese-zh-cn"
HOMOPHONE = {"胭": "烟", "蛰": "哲", "裳": "商"}
BEAT0, STEP = 0.055, 0.125

# (window start, window end, lines) — windows follow the song's sections
SECTIONS = [
    (15.4, 30.6, ["健忘的症状", "这种赶春的人", "该向左或向右", "你看我这手里的胭脂虫", "像不像那晚春的花骨朵"]),
    (30.6, 46.8, ["去年的严冬太寒冷", "天寒地冻日不升", "去年的街道太冷清", "空巷孤影它伤人情"]),
    (46.6, 62.8, ["我想要一座房", "把我爱的人往里头装", "银装素裹胭脂妆", "花想容貌云想衣裳"]),
    (62.6, 79.6, ["我想要死在春天里", "红花作衣绿地作席", "野蛮生长在春泥", "养万物生我饲衣鱼"]),
    (79.4, 95.0, ["健忘的症状", "这种赶春的人", "该向左或向右", "你看我这手里的胭脂虫", "像不像那晚春的花骨朵"]),
    (94.9, 110.9, ["我不想被你遗忘", "哪怕看清了这副皮囊", "男女共枕暖一张床", "同床异梦迷一样"]),
    (110.7, 127.6, ["我不要就这样", "等到了惊蛰启", "盼霜降", "成了没日没夜的工作狂", "负了我心里的少年郎"]),
    (127.4, 144.0, ["健忘的症状", "这种赶春的人", "该向左或向右", "你看我这手里的胭脂虫", "像不像那晚春的花骨朵"]),
    (143.8, 160.5, ["错过的不肯罢休", "言不由衷的痛有谁懂", "眼看着那缕胭脂红", "玩笑一般地开在无人问津"]),
]


def main():
    torch.set_num_threads(4)
    proc = Wav2Vec2Processor.from_pretrained(MODEL)
    model = Wav2Vec2ForCTC.from_pretrained(MODEL).eval()
    vocab = proc.tokenizer.get_vocab()
    blank = vocab["<pad>"]
    y, sr = librosa.load(VOCALS, sr=16000, mono=True)
    rms = librosa.feature.rms(y=y, frame_length=640, hop_length=160)[0]  # 10 ms frames
    quiet = max(np.percentile(rms, 60) * 0.5, 0.006)

    lines = []
    for a, b, texts in SECTIONS:
        seg = y[int(a * sr):int(b * sr)]
        with torch.inference_mode():
            logp = torch.log_softmax(model(proc(seg, sampling_rate=16000, return_tensors="pt").input_values).logits, -1)
        frame = (b - a) / logp.shape[1]
        ids = torch.tensor([[vocab[HOMOPHONE.get(c, c)] for c in "".join(texts)]], dtype=torch.int32)
        path, scores = torchaudio.functional.forced_align(logp, ids, blank=blank)
        spans = iter(torchaudio.functional.merge_tokens(path[0], scores[0].exp()))
        for text in texts:
            lines.append({"text": text, "raw": [a + next(spans).start * frame for _ in text]})

    for i, line in enumerate(lines):
        prev = -1.0
        chars = []
        for c, t in zip(line["text"], line["raw"]):
            t -= 0.03  # CTC spikes trail the onset slightly
            grid = BEAT0 + round((t - BEAT0) / STEP) * STEP
            t = grid if abs(grid - t) <= 0.07 else t
            t = max(t, prev + 0.125) if t <= prev + 0.06 else t
            chars.append([c, round(t, 3)])
            prev = t
        nxt = lines[i + 1]["raw"][0] if i + 1 < len(lines) else line["raw"][-1] + 2.5
        lo, hi = int(chars[-1][1] * 100), int(nxt * 100)
        loud = np.where(rms[lo:hi] > quiet)[0]
        end = chars[-1][1] + (loud[-1] + 1) / 100 if len(loud) else nxt
        line.update(chars=chars, end=round(min(end, nxt), 3))
        del line["raw"]

    out = ROOT / "pv" / "assets" / "lyrics.json"
    out.write_text(json.dumps([{"text": l["text"], "end": l["end"], "chars": l["chars"]} for l in lines], ensure_ascii=False, separators=(",", ":")))
    print(f"{len(lines)} lines -> {out}")


if __name__ == "__main__":
    main()
