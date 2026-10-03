#!/usr/bin/env python3
"""Add pinyin (per character) and an English line to pv/assets/lyrics.json.

    pip install pypinyin && python3 pv/tools/annotate_lyrics.py
"""
import json
import pathlib

from pypinyin import Style, pinyin

ROOT = pathlib.Path(__file__).resolve().parents[2]
PATH = ROOT / "pv" / "assets" / "lyrics.json"

ENGLISH = {
    "健忘的症状": "A symptom of forgetting",
    "这种赶春的人": "we who chase the spring",
    "该向左或向右": "should we turn left, or right?",
    "你看我这手里的胭脂虫": "Look at the cochineal in my hand",
    "像不像那晚春的花骨朵": "isn't it like a bud of late spring?",
    "去年的严冬太寒冷": "Last winter was far too cold",
    "天寒地冻日不升": "frozen ground, a sun that would not rise",
    "去年的街道太冷清": "Last year the streets were far too empty",
    "空巷孤影它伤人情": "a lone shadow in a hollow lane, it hurts",
    "我想要一座房": "I want a house",
    "把我爱的人往里头装": "to keep the one I love inside",
    "银装素裹胭脂妆": "dressed in silver snow, painted in rouge",
    "花想容貌云想衣裳": "flowers dream of her face, clouds of her gown",
    "我想要死在春天里": "I want to die in the spring",
    "红花作衣绿地作席": "red blossoms for clothes, green earth for a bed",
    "野蛮生长在春泥": "growing wild in the spring mud",
    "养万物生我饲衣鱼": "all things grow, and I feed the silverfish",
    "我不想被你遗忘": "I don't want you to forget me",
    "哪怕看清了这副皮囊": "even once you've seen through this skin",
    "男女共枕暖一张床": "two on one pillow, warming one bed",
    "同床异梦迷一样": "one bed, two dreams, a riddle",
    "我不要就这样": "I won't let it end like this",
    "等到了惊蛰启": "waiting for the insects to wake",
    "盼霜降": "longing for the first frost",
    "成了没日没夜的工作狂": "I worked myself away, day and night",
    "负了我心里的少年郎": "and failed the boy in my heart",
    "错过的不肯罢休": "What I missed will not let go",
    "言不由衷的痛有谁懂": "who knows the pain I cannot put into words?",
    "眼看着那缕胭脂红": "I watch that wisp of rouge",
    "玩笑一般地开在无人问津": "bloom like a joke where no one comes",
}

# dictionary tones for display (no 一/不 sandhi); context fixes
FIX = {("玩笑一般地开在无人问津", 4): "de"}


def main():
    lines = json.loads(PATH.read_text())
    for line in lines:
        text = line["text"]
        py = [p[0] for p in pinyin(text, style=Style.TONE)]
        for i, ch in enumerate(text):
            if ch == "一":
                py[i] = "yī"
            elif ch == "不":
                py[i] = "bù"
            py[i] = FIX.get((text, i), py[i])
        line["py"] = py
        line["en"] = ENGLISH[text]
    PATH.write_text(json.dumps(lines, ensure_ascii=False, separators=(",", ":")))
    print(f"annotated {len(lines)} lines")


if __name__ == "__main__":
    main()
