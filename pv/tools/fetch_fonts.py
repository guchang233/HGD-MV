#!/usr/bin/env python3
"""Download the PV's web fonts as subsets holding only the glyphs it draws.

Every character in pv/src/*.js, the lyrics (with pinyin and English) and
the slot names is collected, and Google Fonts serves a woff2 subset of each
family for exactly that text.  All families are SIL OFL 1.1.

    python3 pv/tools/fetch_fonts.py
"""
import json
import pathlib
import re
import string
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
PV = ROOT / "pv"
OUT = PV / "assets" / "fonts"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36"

FAMILIES = [
    # (css2 family spec, [output files in @font-face order])
    ("Noto Serif SC:wght@200..900", ["NotoSerifSC-VF.woff2"]),
    ("Noto Sans SC:wght@100..900", ["NotoSansSC-VF.woff2"]),
    ("Cormorant Garamond:ital,wght@0,300..700;1,400", ["CormorantGaramond-VF.woff2", "CormorantGaramond-Italic.woff2"]),
    ("Zhi Mang Xing", ["ZhiMangXing.woff2"]),
    ("Liu Jian Mao Cao", ["LiuJianMaoCao.woff2"]),
]


def text_used():
    chars = set(string.ascii_letters + string.digits + string.punctuation + " ")
    for f in sorted((PV / "src").glob("*.js")):
        chars.update(c for c in f.read_text() if ord(c) > 0x7F)
    for line in json.loads((PV / "assets" / "lyrics.json").read_text()):
        chars.update(line["text"] + "".join(line.get("py", [])) + line.get("en", ""))
    for slot in json.loads((PV / "assets" / "slots.json").read_text())["slots"]:
        chars.update(slot["name"])
    chars.update("·—–’“”…、，。")
    return "".join(sorted(c for c in chars if c.isprintable()))


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def main():
    text = text_used()
    print(f"{len(text)} characters")
    for family, files in FAMILIES:
        q = urllib.parse.urlencode({"family": family, "text": text, "display": "swap"})
        css = get(f"https://fonts.googleapis.com/css2?{q}").decode()
        urls = re.findall(r"src: url\((https://[^)]+)\)", css)
        if len(urls) != len(files):
            raise SystemExit(f"{family}: expected {len(files)} faces, got {len(urls)}")
        for url, name in zip(urls, files):
            data = get(url)
            (OUT / name).write_bytes(data)
            print(f"  {name:34s} {len(data) / 1024:7.1f} KB")


if __name__ == "__main__":
    main()
