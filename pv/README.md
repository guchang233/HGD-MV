# 《花骨朵》PV（全曲重制版）

以完整原曲作为背景音乐，画面全部重做的动态 PV，成片为 `../花骨朵_PV.mp4`（1920×1080，60 fps，170 秒）。

制作思路是 AI 重绘 + AE 式动态设计 + 剪辑调色：

- **AI 重绘**：原版 MV 的 40 个关键画面先裁成 16:9 并避开原字幕，用 LCM-Dreamshaper 低强度 img2img 重绘，女主角的发髻、红手套、白旗袍都保留；MV 里没有、但歌词写到的场景（冰封古镇、空巷红灯笼、雪中小屋、红花绿地、霜叶、远处的少年……）另外文生图 14 张。所有图都用 Real-ESRGAN 放大 4 倍。
- **2.5D 视差**：Depth-Anything-V2 估算景深，把主体抠成前景层，背景补全；镜头推拉时前后景分离运动。
- **逐字动态歌词**：Demucs 分离人声，wav2vec2 强制对齐每一个字（302 个音节），再吸附到 120 BPM 的十六分音符网格。每句歌词都有单独的排版与动画（砸入、下落、翻转、拉伸、故障、打字机、冰冻抖动、墨迹洇开……）。
- **鼓点驱动**：Demucs 分离出鼓轨，检测底鼓/军鼓/镲。底鼓驱动镜头推进与震动，军鼓驱动闪白、色散与故障切片，副歌里歌词也随底鼓跳动。
- **动效与转场**：闪白、甩镜拖影、冲击下坠、冲击波、速度线、窗棂线框、自绘小屋、二十四节气转盘、日夜交替、毛笔扫痕、泼墨、蓝蝶群、花瓣爆发、体积光、HUD、宽银幕遮幅。

## 段落

| 时间 | 段落 | 画面 |
|---|---|---|
| 0–15.8 | 序 | 红线划过黑场，雪夜红梅；AI 重绘的手捧白莲、对镜双脸、翻花绳；标题「花骨朵」泼墨落款，白墨梅枝在黑底生长 |
| 15.8–30 | 主歌 I | 健忘的症状……「向左 / 向右」左右分屏甩动；「胭脂虫」红色毛笔字放出蓝蝶；「花骨朵」三朵花随唱开放 |
| 30–47 | 严冬 | 冰封古镇、冷色调与风雪；文字冰冻抖动；「日不升」的太阳升起又落下；空巷孤影 |
| 47–63 | 预副歌 | 线框小屋随拍自己画出、窗灯亮起；窗棂框住「把我爱的人往里头装」；毛笔扫出「胭脂妆」 |
| 63–79.8 | 春天里 | 红色房间，「死」字冲屏；红花作衣、绿地作席；野蛮生长的藤蔓与火星；逐拍加速的闪切蒙太奇 |
| 79.8–95 | 副歌 | 冲击下坠；分屏甩镜；蓝蝶群爆发；「花骨朵」标题砸入，白梅渗出血红 |
| 95–111 | 主歌 II | 宽银幕，花瓣飘落；「同床异梦」上下镜像、异色梦境 |
| 111–128 | 桥段 | 「我不要」故障字；二十四节气转盘从惊蛰转到霜降；日夜交替闪烁与飞转的钟；少年郎渐渐远去 |
| 128–144 | 最终副歌 | 暴风雪；冲击波随字扩散；「花骨朵」红光爆开，几百片花瓣冲向镜头 |
| 144–161 | 尾声 | 金色日出与体积光；「胭脂红」红线；「无人问津」逐字飘散；梅枝落花 |
| 161–170.4 | 片尾 | 标题、制作人员名单 |

## 渲染

成片只依赖已提交的素材（`pv/assets/`：AI 图层、歌词对齐、鼓点数据、字体）：

```bash
node pv/tools/render.mjs                       # 输出 花骨朵_PV.mp4
node pv/tools/render.mjs --stills 16.6,47.5    # 渲染指定时间点的静帧到 pv/build/stills
node pv/tools/render.mjs --from 79 --to 95 --fps 30 --out chorus.mp4   # 快速渲染某一段
```

需要 Node 18+、Playwright 的 Chromium 和 ffmpeg。实时预览：用静态服务器托管 `pv/`（例如 `npx http-server pv`），打开 `index.html` 拖动或播放。

### 重新生成 AI 素材（可选）

需要 Python 环境：`torch`、`torchaudio`、`diffusers`、`transformers`、`onnxruntime`、`opencv-python-headless`、`librosa`、`demucs`。全部在 CPU 上运行。

```bash
ffmpeg -i 花骨朵.mp4 -vn song.wav
python -m demucs -n htdemucs -o sep song.wav             # 分离人声 / 鼓 / 贝斯 / 其他
python pv/tools/ai/align_lyrics.py sep/htdemucs/song/vocals.wav   # → pv/assets/lyrics.json
python pv/tools/ai/analyze_song.py sep/htdemucs/song      # → pv/assets/timing.json
python pv/tools/ai/make_plates.py                         # AI 重绘 + 场景图 → pv/build/plates（约 1 小时）
python pv/tools/ai/make_layers.py                         # 景深分层 → pv/assets/plates
```

随机种子按图名固定。

## 代码结构

| 文件 | 作用 |
|---|---|
| `src/story.js` | 全曲分镜：镜头、镜头运动、调色、40 句歌词的排版与动画、特效段落 |
| `src/main.js` | 合成器：镜头 → 特效 → 歌词 → 鼓点反应 → 后期（色散、辉光、体积光、HUD、遮幅） |
| `src/lyrics.js` | 逐字动态排版引擎（布局、入场与出场动画） |
| `src/graphics.js` | 动效图形库（HUD、冲击波、窗棂、小屋、节气转盘、日月、毛笔、泼墨、蝴蝶、故障、分屏） |
| `src/plates.js` | AI 图层加载与 2.5D 视差 |
| `src/particles.js` | 花瓣、雪、火星、尘埃（每个粒子都是关于时间的解析函数） |
| `src/plum.js` | 程序化水墨梅枝（标题与片尾） |
| `src/fx.js` | 色散、辉光、体积光、颗粒、暗角等后期效果 |
| `tools/render.mjs` | 无头 Chromium 逐帧渲染并编码 |
| `tools/ai/*` | AI 素材流水线 |

所有元素都是时间的确定性函数，帧可以任意顺序、并行渲染。

## 制作人员与许可

原曲：演唱 洛天依 · 作词/作曲 亚细亚旷世奇才 · 调校 Creuzer · 混音 歪歪；原版 MV 动画 刚炮 · 特别感谢 AA。音乐与原版画面版权归原作者所有，AI 重绘画面以原版 MV 为底稿。

模型：LCM-Dreamshaper v7（MIT）、Real-ESRGAN animevideov3（BSD-3-Clause）、Depth-Anything-V2-Small（Apache-2.0）、wav2vec2-large-xlsr-53-chinese-zh-cn（Apache-2.0）、Demucs（MIT）。

字体：Noto Serif SC、Noto Sans SC、志莽行书、刘建毛草、Cormorant Garamond（均为 SIL OFL 1.1，仅保留用到的字形），见 `assets/fonts/OFL.txt`。
