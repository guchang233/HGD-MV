# 《花骨朵》PV 画面提示词

PV 里所有插画镜头都是编号的「画面槽位」。图片还没放进来之前，渲染器会用标着编号的占位画面代替（画面中央写着 `S05 少女与孩子` 之类的标签），镜头运动、歌词、转场、特效都已经按最终效果做好。用下面的提示词生成图片，放进 `pv/assets/images/`，重新渲染即可。

> 本文件由 `node pv/tools/make_prompts.mjs` 根据 `pv/assets/slots.json` 和分镜自动生成，使用时间与成片一致。改提示词请改 `slots.json` 后重新生成。

## 使用方法

1. **先生成 S00 角色设定图**，确定女主角的长相。之后每张带女主角的图（标有「女主角」的槽位）都把 S00 作为参考图一起发给 GPT，并说明「保持与参考图中的角色一致」。
2. 每个槽位复制下面的**完整提示词**（中文或英文任选一种，英文通常更稳定）。尺寸选横版 **1536×1024**（或任何 16:9 / 3:2 横版）。
3. 保存为 `pv/assets/images/<编号>.png`，例如 `05.png`。`S05.png`、`05_少女与孩子.jpg` 这类名字也能识别；支持 png / jpg / webp。
4. 重新渲染：`node pv/tools/render.mjs`（只看几帧：`node pv/tools/render.mjs --stills 16,20.5`）。只放了一部分图也可以渲染，其余槽位继续显示占位画面。
5. 可选：`python pv/tools/ai/make_layers.py` 会用景深模型把图片拆成前景 / 背景两层，镜头运动时就有真实的 2.5D 视差。

**注意**

- 画面会被裁成 16:9，镜头还会推拉、平移，四周约 10% 可能被裁掉：主体不要贴边。
- 每个槽位都写了**主体位置**和**留白**要求，那是歌词出现的地方。主体尽量放在指定的一侧，另一侧保持干净。
- 画面里不能有任何文字、字母、数字、印章或水印；如果生成了，请重新生成或擦掉。
- 画面整体的明暗要符合槽位标注的色调（例如「宣纸白」的槽位上歌词是深色字，换成暗色图片会看不清）。
- 同一个槽位可能在不同时间出现多次（例如副歌里的闪回），一张图即可。

## 统一画风

```text
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

```text
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## 女主角

```text
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
```

```text
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
```

## 槽位一览

| 编号 | 画面 | 出现时间 | 段落 | 色调 | 女主角 |
|---|---|---|---|---|---|
| [S00](#s00) | 角色设定图 | （参考图，不出现在成片里） | — | 宣纸白（高调） | ✓ |
| [S01](#s01) | 雪夜红梅 | 0:02.1–0:06.1 | 序 | 夜色深蓝 |  |
| [S02](#s02) | 捧花的少女 | 0:06.1–0:08.1 | 序 | 宣纸白（高调） | ✓ |
| [S03](#s03) | 对镜的双生 | 0:08.1–0:10.1<br>1:19.3–1:19.6<br>1:22.3–1:22.4 | 序、春天里、副歌 | 宣纸白（高调） | ✓ |
| [S04](#s04) | 红线翻花绳 | 0:10.1–0:12.1<br>1:25.3–1:25.4 | 序、副歌 | 宣纸白（高调） |  |
| [S05](#s05) | 少女与孩子 | 0:15.8–0:18.0<br>1:19.1–1:19.3<br>1:27.8–1:27.9<br>2:10.3–2:10.4 | 主歌 I、春天里、副歌、最终副歌 | 宣纸白（高调） | ✓ |
| [S06](#s06) | 张开双臂 | 0:19.8–0:22.8<br>1:23.8–1:26.8 | 主歌 I、副歌 | 宣纸白（高调） | ✓ |
| [S07](#s07) | 雪中岔路 | 0:19.8–0:22.8<br>1:23.8–1:26.8<br>2:11.8–2:14.8 | 主歌 I、副歌、最终副歌 | 雪天灰蓝 |  |
| [S08](#s08) | 红手蓝蝶 | 0:22.8–0:25.1<br>1:28.8–1:29.3<br>2:17.1–2:18.6 | 主歌 I、副歌、最终副歌 | 宣纸白（高调） |  |
| [S09](#s09) | 眼眸与蓝蝶 | 0:25.1–0:26.6<br>1:30.4–1:33.1 | 主歌 I、副歌 | 宣纸白（高调） | ✓ |
| [S10](#s10) | 指向远方 | 0:26.6–0:30.0 | 主歌 I | 宣纸白（高调） | ✓ |
| [S11](#s11) | 冰封古镇 | 0:30.0–0:32.1 | 严冬 | 雪天灰蓝 |  |
| [S12](#s12) | 空巷红灯 | 0:38.3–0:41.0 | 严冬 | 夜色深蓝 |  |
| [S13](#s13) | 空椅 | 0:43.0–0:47.0 | 严冬 | 夜色深蓝 |  |
| [S14](#s14) | 花树里的少女 | 0:51.0–0:53.0<br>1:19.6–1:21.1 | 预副歌、春天里 | 近乎全黑 | ✓ |
| [S15](#s15) | 云想衣裳 | 0:59.0–1:01.0 | 预副歌 | 宣纸白（高调） |  |
| [S16](#s16) | 红房少女 | 1:02.9–1:04.4<br>2:13.3–2:13.4 | 春天里、最终副歌 | 朱红 / 胭脂红 | ✓ |
| [S17](#s17) | 红花绿地 | 1:07.1–1:09.1 | 春天里 | 青绿 |  |
| [S18](#s18) | 凤冠山茶 | 1:11.1–1:13.3<br>1:31.8–1:31.9 | 春天里、副歌 | 朱红 / 胭脂红 |  |
| [S19](#s19) | 黑暗中的正脸 | 1:21.1–1:22.3 | 副歌 | 近乎全黑 | ✓ |
| [S20](#s20) | 梅枝拱门 | 1:35.1–1:37.1<br>2:16.3–2:16.4 | 主歌 II、最终副歌 | 宣纸白（高调） |  |
| [S21](#s21) | 哭泣的新娘 | 1:39.1–1:41.1<br>2:20.3–2:20.4 | 主歌 II、最终副歌 | 朱红 / 胭脂红 | ✓ |
| [S22](#s22) | 红帐古床 | 1:43.1–1:45.1<br>1:47.1–1:50.9 | 主歌 II | 夜色深蓝 |  |
| [S23](#s23) | 交叉的红臂 | 1:45.1–1:47.1<br>1:50.9–1:53.1 | 主歌 II、桥段 | 近乎全黑 | ✓ |
| [S24](#s24) | 红手白花 | 1:58.9–2:01.1 | 桥段 | 近乎全黑 |  |
| [S25](#s25) | 一排新娘 | 2:03.1–2:05.1 | 桥段 | 近乎全黑 | ✓ |
| [S26](#s26) | 少年郎 | 2:05.1–2:07.8 | 桥段 | 雪天灰蓝 |  |
| [S27](#s27) | 风雪中的少女 | 2:07.8–2:09.8 | 最终副歌 | 雪天灰蓝 | ✓ |
| [S28](#s28) | 逆风 | 2:11.8–2:14.8 | 最终副歌 | 雪天灰蓝 | ✓ |
| [S29](#s29) | 雪夜背影 | 2:21.1–2:23.9 | 最终副歌 | 雪天灰蓝 | ✓ |
| [S30](#s30) | 白花遮面 | 2:23.9–2:26.6 | 尾声 | 夜色深蓝 | ✓ |
| [S31](#s31) | 金色日出 | 2:26.6–2:29.1 | 尾声 | 金色晨光 |  |
| [S32](#s32) | 梅树中的少女 | 2:31.1–2:34.3 | 尾声 | 宣纸白（高调） | ✓ |
| [S33](#s33) | 山茶入梦 | 2:34.3–2:37.1 | 尾声 | 宣纸白（高调） | ✓ |
| [S34](#s34) | 水墨梅枝 | 2:37.1–2:41.0 | 尾声 | 宣纸白（高调） |  |
| [S35](#s35) | 伸手接雪 | 0:18.0–0:19.8 | 主歌 I | 宣纸白（高调） | ✓ |
| [S36](#s36) | 雪中脚印 | 0:32.1–0:35.0 | 严冬 | 雪天灰蓝 |  |
| [S37](#s37) | 空巷红灯 | 0:41.0–0:43.0 | 严冬 | 夜色深蓝 |  |
| [S38](#s38) | 雪夜亮灯的小屋 | 0:49.8–0:51.0 | 预副歌 | 夜色深蓝 |  |
| [S39](#s39) | 窗里的少女 | 0:53.0–0:55.0 | 预副歌 | 近乎全黑 | ✓ |
| [S40](#s40) | 云做的裙子 | 1:01.0–1:02.9 | 预副歌 | 宣纸白（高调） |  |
| [S41](#s41) | 红绸上的花瓣 | 1:04.4–1:07.1 | 春天里 | 朱红 / 胭脂红 |  |
| [S42](#s42) | 红手与红花 | 1:09.1–1:11.1 | 春天里 | 青绿 |  |
| [S43](#s43) | 藤蔓缠臂 | 1:13.3–1:15.1 | 春天里 | 朱红 / 胭脂红 |  |
| [S44](#s44) | 缠指的红线 | 1:17.1–1:17.6 | 春天里 | 朱红 / 胭脂红 |  |
| [S45](#s45) | 眼眸特写 | 1:17.6–1:18.1 | 春天里 | 朱红 / 胭脂红 | ✓ |
| [S46](#s46) | 盛开的山茶 | 1:18.1–1:18.6 | 春天里 | 朱红 / 胭脂红 |  |
| [S47](#s47) | 飞散的花瓣 | 1:18.6–1:19.1 | 春天里 | 朱红 / 胭脂红 |  |
| [S48](#s48) | 飞扬的飘带 | 1:22.3–1:23.8 | 副歌 | 近乎全黑 |  |
| [S49](#s49) | 掌心的蓝蝶 | 1:26.8–1:28.8 | 副歌 | 宣纸白（高调） | ✓ |
| [S50](#s50) | 落梅小径 | 1:37.1–1:39.1 | 主歌 II | 宣纸白（高调） |  |
| [S51](#s51) | 红盖头 | 1:41.1–1:43.1 | 主歌 II | 朱红 / 胭脂红 | ✓ |
| [S52](#s52) | 捂住耳朵 | 1:53.1–1:55.1 | 桥段 | 近乎全黑 | ✓ |
| [S53](#s53) | 深夜书桌 | 2:01.1–2:03.1 | 桥段 | 近乎全黑 |  |
| [S54](#s54) | 风雪中的飘带 | 2:09.8–2:11.8 | 最终副歌 | 雪天灰蓝 |  |
| [S55](#s55) | 雪里的红花 | 2:14.8–2:17.1 | 最终副歌 | 雪天灰蓝 |  |
| [S56](#s56) | 雪夜脚印 | 2:18.6–2:21.1 | 最终副歌 | 雪天灰蓝 |  |
| [S57](#s57) | 晨光侧脸 | 2:29.1–2:31.1 | 尾声 | 金色晨光 | ✓ |

## S00

**角色设定图** · 角色参考图（第一个生成）

完整提示词（中文）：

```text
女主角的简单角色设定：正面全身、侧面全身、面部特写并排，纯白背景，手绘黑线稿加平涂，用来保持后续画面中角色一致。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Simple character sheet of the heroine: front full body, side full body and a face close-up side by side on a plain white background, hand-drawn black outlines with flat colors, to keep the character consistent in later images.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S01

**雪夜红梅**

- 0:02.1–0:06.1（序）
- 色调：夜色深蓝；主体位置：画面右侧（约 66%, 55%）

完整提示词（中文）：

```text
深夜大雪中，一枝苍劲的老梅枝从画面右下角斜伸向左上，枝头开着朱红色的梅花和花苞，枝干带水墨笔触；背景是近乎全黑的深蓝夜空，大片雪花缓缓飘落，有虚化的雪花光斑。画面左半部分保持干净的暗色留白。
版面：深夜蓝的纯色背景；主体放在画面右侧，另一侧保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Deep in a snowy night, an old gnarled plum branch reaches diagonally from the lower right toward the upper left, carrying vermilion blossoms and buds, its bark painted with ink-brush texture; near-black deep navy sky, large snowflakes drifting with soft bokeh. Keep the left half clean and dark as negative space.
Layout: a solid deep night-blue background; put the subject in the right of the frame, keep the other side empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S02

**捧花的少女** · 女主角（附上 S00 参考图）

- 0:06.1–0:08.1（序）
- 色调：宣纸白（高调）；主体位置：画面右侧（约 66%, 45%）

完整提示词（中文）：

```text
女主角半身正面像，位于画面右侧三分之一，红色的双手在胸前轻轻捧着一朵盛开的白花，低垂眼帘，嘴角微微上扬；纯白背景，两条白色飘带向身后两侧舒展。画面左侧大面积留白。
版面：纯白背景；主体放在画面右侧，另一侧保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Half-length front view of the heroine in the right third of the frame, gently cupping a blooming white flower at her chest with her red hands, eyes lowered, a faint smile; pure white background, two white ribbons spreading out behind her. Large empty space on the left.
Layout: a plain white background; put the subject in the right of the frame, keep the other side empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S03

**对镜的双生** · 女主角（附上 S00 参考图）

- 0:08.1–0:10.1（序）
- 1:19.3–1:19.6（春天里）
- 1:22.3–1:22.4（副歌）：「这种赶春的人」
- 色调：宣纸白（高调）；主体位置：画面中央（约 50%, 42%）

完整提示词（中文）：

```text
两个相同的女主角侧脸相对，鼻尖几乎相触，闭着眼睛，构成镜像对称；左边一位是冷灰色调，右边一位是朱红色调，两人的发髻和发丝在画面中间交融；白色背景，人物在画面上方三分之二，下方留出干净的空白。
版面：纯白背景；主体放在画面中央，四周保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Two identical heroines in profile facing each other, noses almost touching, eyes closed, mirror-symmetric; the left one in cool grey tones, the right one in vermilion tones, their buns and hair merging in the middle; white background, the figures fill the upper two thirds and the bottom is left clean and empty.
Layout: a plain white background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S04

**红线翻花绳**

- 0:10.1–0:12.1（序）
- 1:25.3–1:25.4（副歌）：「该向左或向右」
- 色调：宣纸白（高调）；主体位置：画面中央（约 58%, 50%）

完整提示词（中文）：

```text
两双手玩翻花绳的特写，一根红线在指间交错成几何图形，红线微微发光；柔和的米白背景，浅景深，手部位于画面中央偏右。
版面：纯白背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Close-up of two pairs of hands playing cat's cradle, a single red string crossing between the fingers in a geometric pattern, the string faintly glowing; soft off-white background, shallow depth of field, hands just right of center.
Layout: a plain white background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S05

**少女与孩子** · 女主角（附上 S00 参考图）

- 0:15.8–0:18.0（主歌 I）：「健忘的症状 / 这种赶春的人」
- 1:19.1–1:19.3（春天里）：「养万物生我饲衣鱼」
- 1:27.8–1:27.9（副歌）：「你看我这手里的胭脂虫」
- 2:10.3–2:10.4（最终副歌）：「这种赶春的人」
- 色调：宣纸白（高调）；主体位置：画面左侧（约 36%, 60%）

完整提示词（中文）：

```text
雪后的白色世界里，女主角弯下腰，伸手和两个穿冬衣的小孩说话（一个穿黄色棉服背着书包，一个穿红色棉袄），白色飘带在风中扬起；人物整体位于画面左侧到中部，右侧三分之一留白。
版面：纯白背景；主体放在画面左侧，另一侧保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
In a white world after snowfall, the heroine bends down and reaches out to two small children in winter coats (one in a yellow parka with a backpack, one in a red padded jacket), her white ribbons lifting in the wind; the figures sit from the left to the center, with the right third left empty.
Layout: a plain white background; put the subject in the left of the frame, keep the other side empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S06

**张开双臂** · 女主角（附上 S00 参考图）

- 0:19.8–0:22.8（主歌 I）：「这种赶春的人 / 该向左或向右」
- 1:23.8–1:26.8（副歌）：「这种赶春的人 / 该向左或向右 / 你看我这手里的胭脂虫」
- 色调：宣纸白（高调）；主体位置：画面中央（约 50%, 38%）；用于左右分屏，只显示中间一半

完整提示词（中文）：

```text
女主角面向画面左侧，张开红色的双臂迎风而立，白色飘带和裙摆被风吹向右侧，全身像，纯白背景；人物居中，身形紧凑（画面会被裁成左右分屏的一半）。
版面：纯白背景；主体放在画面中央，四周保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
The heroine stands facing left with her red arms spread wide into the wind, white ribbons and skirt blown to the right, full body, pure white background; figure centered and compact (the image will be cropped to one half of a split screen).
Layout: a plain white background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S07

**雪中岔路**

- 0:19.8–0:22.8（主歌 I）：「这种赶春的人 / 该向左或向右」
- 1:23.8–1:26.8（副歌）：「这种赶春的人 / 该向左或向右 / 你看我这手里的胭脂虫」
- 2:11.8–2:14.8（最终副歌）：「该向左或向右 / 你看我这手里的胭脂虫」
- 色调：雪天灰蓝；主体位置：画面中央（约 50%, 55%）；用于左右分屏，只显示中间一半

完整提示词（中文）：

```text
黄昏时分的雪原，一条小路在画面中央分成向左和向右的两条岔路，远处有几棵枯树，天空灰蓝，孤寂；岔路口位于画面正中（会被裁成分屏的一半）。
版面：中等灰蓝色的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
A snowy field at dusk where a single path splits in the center into two branches, one going left and one going right; a few bare trees in the distance, grey-blue sky, lonely; the fork sits dead center (the image will be cropped to one half of a split screen).
Layout: a solid medium blue-grey background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S08

**红手蓝蝶**

- 0:22.8–0:25.1（主歌 I）：「该向左或向右 / 你看我这手里的胭脂虫」
- 1:28.8–1:29.3（副歌）：「你看我这手里的胭脂虫」
- 2:17.1–2:18.6（最终副歌）：「你看我这手里的胭脂虫 / 像不像那晚春的花骨朵」
- 色调：宣纸白（高调）；主体位置：画面左侧（约 35%, 62%）

完整提示词（中文）：

```text
微距特写：一只朱红色的手（像戴着红手套）微微弯曲手指，一只宝蓝色的大闪蝶停在指节上，翅膀半张；白色背景，主体在画面左下，右上方留白。
版面：纯白背景；主体放在画面左侧，另一侧保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Macro close-up: a vermilion hand (as if in a red glove) with slightly curled fingers, a vivid blue morpho butterfly resting on the knuckles with its wings half open; white background, subject in the lower left, upper right left empty.
Layout: a plain white background; put the subject in the left of the frame, keep the other side empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S09

**眼眸与蓝蝶** · 女主角（附上 S00 参考图）

- 0:25.1–0:26.6（主歌 I）：「你看我这手里的胭脂虫」
- 1:30.4–1:33.1（副歌）：「像不像那晚春的花骨朵」
- 色调：宣纸白（高调）；主体位置：画面左侧（约 38%, 50%）

完整提示词（中文）：

```text
女主角面部的极近特写：一只翠绿色的眼睛、眼尾一抹红，脸颊旁是她红色的手，一只蓝色蝴蝶停在手上；主体在画面左侧到中部，右侧留出放大字的空间。
版面：纯白背景；主体放在画面左侧，另一侧保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Extreme close-up of the heroine's face: one emerald eye with red at its corner, her red hand beside her cheek with a blue butterfly on it; subject from the left to the center, the right side left open for large lettering.
Layout: a plain white background; put the subject in the left of the frame, keep the other side empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S10

**指向远方** · 女主角（附上 S00 参考图）

- 0:26.6–0:30.0（主歌 I）：「像不像那晚春的花骨朵」
- 色调：宣纸白（高调）；主体位置：画面左侧（约 30%, 55%）

完整提示词（中文）：

```text
女主角侧身，抬起红色的手臂指向远处一只越飞越远的小蓝蝶，白色背景；人物在画面左侧，右侧是开阔的留白天空。
版面：纯白背景；主体放在画面左侧，另一侧保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
The heroine in side view raises her red arm and points at a tiny blue butterfly flying away into the distance, white background; figure on the left, open empty sky on the right.
Layout: a plain white background; put the subject in the left of the frame, keep the other side empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S11

**冰封古镇**

- 0:30.0–0:32.1（严冬）：「像不像那晚春的花骨朵 / 去年的严冬太寒冷」
- 色调：雪天灰蓝；主体位置：画面中央（约 42%, 55%）

完整提示词（中文）：

```text
暴风雪中的中国古镇夜景，屋檐挂满冰凌，街道空无一人，几盏被雪覆盖的红灯笼发出微弱的光，整体深蓝色调，广角；画面右侧较暗。
版面：中等灰蓝色的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
An ancient Chinese town at night in a blizzard, icicles hanging from the eaves, empty streets, a few snow-covered red lanterns glowing faintly, deep blue tones, wide angle; the right side kept darker.
Layout: a solid medium blue-grey background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S12

**空巷红灯**

- 0:38.3–0:41.0（严冬）：「去年的街道太冷清」
- 色调：夜色深蓝；主体位置：画面右侧（约 62%, 45%）

完整提示词（中文）：

```text
深夜下雪的狭长古巷，单点透视延伸向画面右上方的远处，一盏红灯笼挂在墙上，女主角长长的影子投在雪地和墙面上（人物本身不在画面里），冷清孤寂。
版面：深夜蓝的纯色背景；主体放在画面右侧，另一侧保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
A long, narrow old alley at night in falling snow, one-point perspective receding toward the upper right, a single red lantern on the wall, the heroine's long shadow cast across the snow and the wall (she herself is out of frame), cold and lonely.
Layout: a solid deep night-blue background; put the subject in the right of the frame, keep the other side empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S13

**空椅**

- 0:43.0–0:47.0（严冬）：「去年的街道太冷清 / 空巷孤影它伤人情」
- 色调：夜色深蓝；主体位置：画面左侧（约 40%, 55%）

完整提示词（中文）：

```text
昏暗的房间里，冷蓝色的月光透过白色纱帘照在一把空着的红色雕花木椅上，椅背上搭着一条白色飘带；椅子在画面左侧，右侧是暗色留白。
版面：深夜蓝的纯色背景；主体放在画面左侧，另一侧保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
In a dim room, cold blue moonlight falls through pale curtains onto an empty red carved wooden chair, a white ribbon draped over its back; chair on the left, dark empty space on the right.
Layout: a solid deep night-blue background; put the subject in the left of the frame, keep the other side empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S14

**花树里的少女** · 女主角（附上 S00 参考图）

- 0:51.0–0:53.0（预副歌）：「把我爱的人往里头装」
- 1:19.6–1:21.1（春天里）：「健忘的症状 / 这种赶春的人」
- 色调：近乎全黑；主体位置：画面中央（约 50%, 50%）

完整提示词（中文）：

```text
纯黑背景中，一棵由无数白色花朵组成的巨大花树，花心是红色，女主角闭着眼站在花树的中心，像被花朵包裹；对称构图，居中。
版面：纯黑背景；主体放在画面中央，四周保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Against pure black, a giant tree made of countless white flowers with red centers; the heroine stands with closed eyes at its heart, wrapped in blossoms; symmetrical, centered.
Layout: a plain black background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S15

**云想衣裳**

- 0:59.0–1:01.0（预副歌）：「银装素裹胭脂妆 / 花想容貌云想衣裳」
- 色调：宣纸白（高调）；主体位置：画面中央（约 50%, 45%）

完整提示词（中文）：

```text
苍白明亮的天空中，云朵像一件白色丝绸长裙般舒展流动，零星的花瓣在空中飘散，梦幻、柔和、高调。
版面：纯白背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
In a pale, bright sky, clouds unfurl and flow like a long white silk gown, a few petals drifting through the air; dreamy, soft, high-key.
Layout: a plain white background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S16

**红房少女** · 女主角（附上 S00 参考图）

- 1:02.9–1:04.4（春天里）：「花想容貌云想衣裳 / 我想要死在春天里」
- 2:13.3–2:13.4（最终副歌）：「该向左或向右」
- 色调：朱红 / 胭脂红；主体位置：画面左侧（约 38%, 45%）

完整提示词（中文）：

```text
俯视镜头：女主角闭着眼安详地躺在一间华丽的红色房间里，身下是红色丝绸，周围散落着中式首饰、梳子、手镯、团扇和红花；人物位于画面左侧到中部，右侧留空。
版面：朱红色的纯色背景；主体放在画面左侧，另一侧保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Top-down shot: the heroine lies peacefully with closed eyes in a lavish red room on red silk, surrounded by scattered Chinese jewelry, combs, bracelets, round fans and red flowers; figure from the left to the center, right side open.
Layout: a solid vermilion red background; put the subject in the left of the frame, keep the other side empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S17

**红花绿地**

- 1:07.1–1:09.1（春天里）：「红花作衣绿地作席」
- 色调：青绿；主体位置：画面中央（约 50%, 50%）

完整提示词（中文）：

```text
俯视：青绿色的草地上开满一朵朵红花，几片红色花瓣被风吹起，中间空出一块草地。
版面：柔和青绿色的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Top-down: a green meadow dotted with red flowers, a few red petals lifted by the wind, an empty patch of grass in the middle.
Layout: a solid soft green background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S18

**凤冠山茶**

- 1:11.1–1:13.3（春天里）：「野蛮生长在春泥」
- 1:31.8–1:31.9（副歌）：「像不像那晚春的花骨朵」
- 色调：朱红 / 胭脂红；主体位置：画面中央（约 50%, 45%）

完整提示词（中文）：

```text
新娘凤冠的特写：由硕大的红山茶花组成，金色发钗和珠帘垂下遮住了半张脸，只露出下巴和红唇；戏剧性的侧光，深色背景。
版面：朱红色的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Close-up of a bride's phoenix crown made of huge red camellias, gold hairpins and beaded tassels hanging down to veil half her face so only her chin and red lips show; dramatic side light, dark background.
Layout: a solid vermilion red background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S19

**黑暗中的正脸** · 女主角（附上 S00 参考图）

- 1:21.1–1:22.3（副歌）：「这种赶春的人」
- 色调：近乎全黑；主体位置：画面中央（约 50%, 45%）

完整提示词（中文）：

```text
黑暗中女主角的正脸特写，翠绿色的眼睛直视镜头，皮肤上有细微的裂纹（像瓷器），一缕冷光照亮半边脸；居中。
版面：纯黑背景；主体放在画面中央，四周保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Front close-up of the heroine's face in darkness, emerald eyes looking straight into the lens, faint cracks on her skin like porcelain, a thin cold light catching half her face; centered.
Layout: a plain black background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S20

**梅枝拱门**

- 1:35.1–1:37.1（主歌 II）：「我不想被你遗忘」
- 2:16.3–2:16.4（最终副歌）：「你看我这手里的胭脂虫」
- 色调：宣纸白（高调）；主体位置：画面中央（约 42%, 55%）

完整提示词（中文）：

```text
白色背景上，两根老梅枝从两侧向上合拢成一道拱门，枝头开着红梅，拱门下是一条空空的小路；拱门在画面中部偏左，右侧留白。
版面：纯白背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
On white, two old plum branches curve up from both sides into an arch covered in red blossoms, an empty path beneath it; arch just left of center, right side empty.
Layout: a plain white background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S21

**哭泣的新娘** · 女主角（附上 S00 参考图）

- 1:39.1–1:41.1（主歌 II）：「哪怕看清了这副皮囊」
- 2:20.3–2:20.4（最终副歌）：「像不像那晚春的花骨朵」
- 色调：朱红 / 胭脂红；主体位置：画面左侧（约 40%, 45%）

完整提示词（中文）：

```text
哭泣的新娘特写，戴着由红山茶组成的凤冠，珠帘半遮双眼，泪水从脸颊滑落；红与白，主体在左侧，下方和右侧留白。
版面：朱红色的纯色背景；主体放在画面左侧，另一侧保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Close-up of a crying bride wearing a phoenix crown of red camellias, a bead curtain half veiling her eyes, tears running down her cheeks; red and white, subject on the left, space left open below and on the right.
Layout: a solid vermilion red background; put the subject in the left of the frame, keep the other side empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S22

**红帐古床**

- 1:43.1–1:45.1（主歌 II）：「男女共枕暖一张床」
- 1:47.1–1:50.9（主歌 II）：「同床异梦迷一样」
- 色调：夜色深蓝；主体位置：画面中央（约 50%, 50%）

完整提示词（中文）：

```text
昏暗的古代卧室里，一张挂着红色帐幔的雕花木床，床上并排两个枕头，烛光摇曳，暖色与深影，居中对称。
版面：深夜蓝的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
In a dim old bedroom, a carved wooden canopy bed hung with red curtains, two pillows side by side, flickering candlelight, warm tones and deep shadows, centered and symmetrical.
Layout: a solid deep night-blue background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S23

**交叉的红臂** · 女主角（附上 S00 参考图）

- 1:45.1–1:47.1（主歌 II）：「男女共枕暖一张床 / 同床异梦迷一样」
- 1:50.9–1:53.1（桥段）：「同床异梦迷一样 / 我不要就这样」
- 色调：近乎全黑；主体位置：画面中央（约 50%, 45%）

完整提示词（中文）：

```text
深色背景中，女主角用交叉的红色双臂遮住嘴，只露出一双直视镜头的眼睛，眼神倔强；一束硬光从上方打下，近景居中。
版面：纯黑背景；主体放在画面中央，四周保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Against a dark background, the heroine hides her mouth behind her crossed red arms, only her stubborn eyes visible, staring into the lens; a hard light from above, centered close-up.
Layout: a plain black background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S24

**红手白花**

- 1:58.9–2:01.1（桥段）：「盼霜降 / 成了没日没夜的工作狂」
- 色调：近乎全黑；主体位置：画面中央（约 58%, 55%）

完整提示词（中文）：

```text
一双红色的手从画面右侧伸入，捧着一朵白花，几片花瓣散落；纯黑背景，柔和的顶光，主体在中部偏右。
版面：纯黑背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
A pair of red hands reaching in from the right, cupping a white flower, a few petals falling; pure black background, soft top light, subject just right of center.
Layout: a plain black background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S25

**一排新娘** · 女主角（附上 S00 参考图）

- 2:03.1–2:05.1（桥段）：「负了我心里的少年郎」
- 色调：近乎全黑；主体位置：画面中央（约 50%, 50%）

完整提示词（中文）：

```text
纯黑背景前，一排穿着红色刺绣嫁衣的新娘并排站立，她们的头是一朵朵巨大的红花；在她们中间站着小小的、穿白衣的女主角；超现实，对称。
版面：纯黑背景；主体放在画面中央，四周保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Against pure black, a row of brides in red embroidered wedding robes stands side by side, their heads replaced by enormous red flowers; among them stands the small heroine in white; surreal, symmetrical.
Layout: a plain black background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S26

**少年郎**

- 2:05.1–2:07.8（桥段）：「负了我心里的少年郎 / 健忘的症状」
- 色调：雪天灰蓝；主体位置：画面左侧（约 40%, 60%）

完整提示词（中文）：

```text
黄昏的雪中，远处一棵枯树下站着一个少年的剪影，背对镜头，水墨般淡远的意境，大面积留白。
版面：中等灰蓝色的纯色背景；主体放在画面左侧，另一侧保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Dusk in falling snow: the silhouette of a young man stands under a bare tree in the distance with his back to us; faint ink-wash mood, lots of empty space.
Layout: a solid medium blue-grey background; put the subject in the left of the frame, keep the other side empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S27

**风雪中的少女** · 女主角（附上 S00 参考图）

- 2:07.8–2:09.8（最终副歌）：「健忘的症状 / 这种赶春的人」
- 色调：雪天灰蓝；主体位置：画面中央（约 50%, 50%）

完整提示词（中文）：

```text
夜晚的暴风雪中，女主角双手抱紧自己，白色飘带被风狂乱地吹起，冷蓝色光线，雪地；人物居中。
版面：中等灰蓝色的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
In a blizzard at night, the heroine hugs herself tightly, white ribbons whipped wildly by the wind, cold blue light, snowy ground; figure centered.
Layout: a solid medium blue-grey background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S28

**逆风** · 女主角（附上 S00 参考图）

- 2:11.8–2:14.8（最终副歌）：「该向左或向右 / 你看我这手里的胭脂虫」
- 色调：雪天灰蓝；主体位置：画面中央（约 50%, 40%）；用于左右分屏，只显示中间一半

完整提示词（中文）：

```text
星空下的风雪夜，女主角弯腰顶着风前行，衣摆和飘带被吹向后方；人物居中，身形紧凑（画面会被裁成分屏的一半）。
版面：中等灰蓝色的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
A snowy, windy night under the stars: the heroine bends forward, pushing into the wind, her hem and ribbons blown back; figure centered and compact (the image will be cropped to one half of a split screen).
Layout: a solid medium blue-grey background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S29

**雪夜背影** · 女主角（附上 S00 参考图）

- 2:21.1–2:23.9（最终副歌）：「像不像那晚春的花骨朵」
- 色调：雪天灰蓝；主体位置：画面中央（约 50%, 60%）

完整提示词（中文）：

```text
雪夜中女主角的背影，仰望夜空，衣服上有红色的痕迹，风吹起发丝和飘带；人物居中略偏下，上方是飘雪的夜空。
版面：中等灰蓝色的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
The heroine seen from behind in the snowy night, looking up at the sky, red stains on her dress, wind lifting her hair and ribbons; figure centered and slightly low, snowy night sky above.
Layout: a solid medium blue-grey background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S30

**白花遮面** · 女主角（附上 S00 参考图）

- 2:23.9–2:26.6（尾声）：「像不像那晚春的花骨朵 / 错过的不肯罢休 / 不由衷的痛有谁懂」
- 色调：夜色深蓝；主体位置：画面左侧（约 40%, 50%）

完整提示词（中文）：

```text
夜色中，一朵巨大的白色花朵挡住了女主角的半张脸，花心是红色，露出一只翠绿的眼睛，柔和的月光；主体在画面左侧到中部，右侧留白。
版面：深夜蓝的纯色背景；主体放在画面左侧，另一侧保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
At night, a huge white flower with a red center covers half of the heroine's face, one emerald eye visible, soft moonlight; subject from the left to the center, right side open.
Layout: a solid deep night-blue background; put the subject in the left of the frame, keep the other side empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S31

**金色日出**

- 2:26.6–2:29.1（尾声）：「错过的不肯罢休 / 不由衷的痛有谁懂」
- 色调：金色晨光；主体位置：画面中央（约 50%, 35%）

完整提示词（中文）：

```text
金色的朝阳从厚重的云层后迸发，照亮积雪的群山，前景有一棵孤零零的枯树，强烈的丁达尔光束；太阳在画面中上方，下方三分之一较暗。
版面：暖金色的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
A golden sunrise bursts through heavy clouds, lighting snow-covered mountains, a lone bare tree in the foreground, strong god rays; the sun sits in the upper center, the lower third darker.
Layout: a solid warm gold background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S32

**梅树中的少女** · 女主角（附上 S00 参考图）

- 2:31.1–2:34.3（尾声）：「眼看着那缕胭脂红 / 玩笑一般地开在无人问津」
- 色调：宣纸白（高调）；主体位置：画面中央（约 42%, 50%）

完整提示词（中文）：

```text
白色背景中，女主角安静地躺在一棵开满红梅的老梅树枝杈间，闭着眼，裙摆垂落；人物在画面中部偏左，左右两侧留白。
版面：纯白背景；主体放在画面中央，四周保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
On a white background, the heroine lies quietly among the branches of an old plum tree full of red blossoms, eyes closed, her skirt hanging down; figure just left of center, both sides left open.
Layout: a plain white background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S33

**山茶入梦** · 女主角（附上 S00 参考图）

- 2:34.3–2:37.1（尾声）：「眼看着那缕胭脂红 / 玩笑一般地开在无人问津」
- 色调：宣纸白（高调）；主体位置：画面中央（约 45%, 42%）

完整提示词（中文）：

```text
近景：熟睡的女主角，发间插着一朵很大的红山茶花，周围是梅枝和零星的白花，嘴角带着平静的微笑；人物在画面中部偏左，下方留白。
版面：纯白背景；主体放在画面中央，四周保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Close-up: the heroine asleep with a large red camellia in her hair, surrounded by plum branches and a few white blossoms, a calm smile; subject just left of center, space left open below.
Layout: a plain white background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S34

**水墨梅枝**

- 2:37.1–2:41.0（尾声）：「玩笑一般地开在无人问津」
- 色调：宣纸白（高调）；主体位置：画面右侧（约 62%, 35%）

完整提示词（中文）：

```text
宣纸白背景上，一枝水墨画风格的梅枝从画面右上角斜伸向左下，枝头点缀着小小的朱红色梅花，大面积留白，下方尤其空旷，极简、安静（和开场呼应）。
版面：纯白背景；主体放在画面右侧，另一侧保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
On white rice paper, a single ink-painted plum branch reaches in from the upper right corner and slants down toward the left, dotted with small vermilion blossoms; lots of empty space, especially along the bottom; minimal and quiet (echoing the opening).
Layout: a plain white background; put the subject in the right of the frame, keep the other side empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S35

**伸手接雪** · 女主角（附上 S00 参考图）

- 0:18.0–0:19.8（主歌 I）：「这种赶春的人」
- 色调：宣纸白（高调）；主体位置：画面中央（约 50%, 40%）

完整提示词（中文）：

```text
雪后，女主角仰起头，伸出红色的手接住飘落的雪花，白色飘带轻轻扬起；人物在画面中部偏上，下方留空。
版面：纯白背景；主体放在画面中央，四周保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
After the snowfall, the heroine tilts her head up and reaches out a red hand to catch a falling snowflake, white ribbons lifting gently; figure in the upper middle, the bottom left empty.
Layout: a plain white background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S36

**雪中脚印**

- 0:32.1–0:35.0（严冬）：「去年的严冬太寒冷」
- 色调：雪天灰蓝；主体位置：画面左侧（约 35%, 55%）

完整提示词（中文）：

```text
雪地上一串小小的脚印弯弯曲曲地伸向远方，尽头是一座被雪压低的小屋轮廓；主体在画面左侧，右侧留空。
版面：中等灰蓝色的纯色背景；主体放在画面左侧，另一侧保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
A trail of small footprints winds across the snow into the distance, ending at the outline of a little snow-laden house; subject on the left, right side empty.
Layout: a solid medium blue-grey background; put the subject in the left of the frame, keep the other side empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S37

**空巷红灯**

- 0:41.0–0:43.0（严冬）：「去年的街道太冷清」
- 色调：夜色深蓝；主体位置：画面中央（约 50%, 50%）

完整提示词（中文）：

```text
深夜下雪的空巷，地上一串浅浅的脚印，墙上挂着一盏红灯笼，没有人。
版面：深夜蓝的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
An empty snowy lane at night, a faint trail of footprints on the ground, a single red lantern on the wall, nobody there.
Layout: a solid deep night-blue background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S38

**雪夜亮灯的小屋**

- 0:49.8–0:51.0（预副歌）：「我想要一座房」
- 色调：夜色深蓝；主体位置：画面中央（约 50%, 40%）

完整提示词（中文）：

```text
雪夜里一座小小的木屋，两扇窗户透出温暖的橘黄色灯光，屋顶积着厚雪；小屋在画面中部偏上，下方留空。
版面：深夜蓝的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
A tiny wooden house on a snowy night, two windows glowing warm orange, thick snow on the roof; house in the upper middle, the bottom left empty.
Layout: a solid deep night-blue background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S39

**窗里的少女** · 女主角（附上 S00 参考图）

- 0:53.0–0:55.0（预副歌）：「把我爱的人往里头装」
- 色调：近乎全黑；主体位置：画面中央（约 50%, 45%）

完整提示词（中文）：

```text
黑暗中一扇方格木窗，女主角在窗里把红色的双手贴在玻璃上，静静向外看。
版面：纯黑背景；主体放在画面中央，四周保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
In the dark, a wooden lattice window; inside it the heroine presses her red hands against the glass and quietly looks out.
Layout: a plain black background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S40

**云做的裙子**

- 1:01.0–1:02.9（预副歌）：「花想容貌云想衣裳」
- 色调：宣纸白（高调）；主体位置：画面中央（约 50%, 50%）

完整提示词（中文）：

```text
苍白的天空中，一件由云朵组成的白色长裙飘浮着，零星的红色花瓣飘散；居中，左右两侧留空。
版面：纯白背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
In a pale sky, a long white dress made of clouds floats on its own, a few red petals drifting; centered, both sides empty.
Layout: a plain white background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S41

**红绸上的花瓣**

- 1:04.4–1:07.1（春天里）：「我想要死在春天里 / 红花作衣绿地作席」
- 色调：朱红 / 胭脂红；主体位置：画面中央（约 45%, 45%）

完整提示词（中文）：

```text
俯视特写：红色丝绸的褶皱上散落着几片红色花瓣和一根白色发带。
版面：朱红色的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Top-down close-up: a few red petals and a white hair ribbon scattered on folds of red silk.
Layout: a solid vermilion red background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S42

**红手与红花**

- 1:09.1–1:11.1（春天里）：「红花作衣绿地作席 / 野蛮生长在春泥」
- 色调：青绿；主体位置：画面中央（约 50%, 50%）

完整提示词（中文）：

```text
青绿色的草地上，一只红色的手轻轻握着一朵红花，周围散落着红色花瓣。
版面：柔和青绿色的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
On green grass, a red hand gently holds a single red flower, red petals scattered around it.
Layout: a solid soft green background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S43

**藤蔓缠臂**

- 1:13.3–1:15.1（春天里）：「野蛮生长在春泥 / 养万物生我饲衣鱼」
- 色调：朱红 / 胭脂红；主体位置：画面中央（约 50%, 55%）

完整提示词（中文）：

```text
深红色背景中，几根暗红和黑色的藤蔓从画面下方生长，缠绕住一只向上伸出的红色手臂，藤蔓上开着小红花。
版面：朱红色的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
On deep red, a few dark red and black vines grow up from the bottom and wind around a red arm reaching upward, small red flowers on the vines.
Layout: a solid vermilion red background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S44

**缠指的红线**

- 1:17.1–1:17.6（春天里）：「养万物生我饲衣鱼」
- 色调：朱红 / 胭脂红；主体位置：画面中央（约 50%, 50%）

完整提示词（中文）：

```text
近景：一根红线缠绕在几根手指上，红色背景，构图简单。
版面：朱红色的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Close-up: a single red string wound around a few fingers, red background, simple composition.
Layout: a solid vermilion red background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S45

**眼眸特写** · 女主角（附上 S00 参考图）

- 1:17.6–1:18.1（春天里）：「养万物生我饲衣鱼」
- 色调：朱红 / 胭脂红；主体位置：画面中央（约 50%, 50%）

完整提示词（中文）：

```text
女主角一只眼睛的特写：绿色的瞳孔，眼尾一笔红色眼线，几缕灰色发丝。
版面：朱红色的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Close-up of one of the heroine's eyes: green iris, a red eyeliner flick at the corner, a few strands of grey hair.
Layout: a solid vermilion red background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S46

**盛开的山茶**

- 1:18.1–1:18.6（春天里）：「养万物生我饲衣鱼」
- 色调：朱红 / 胭脂红；主体位置：画面中央（约 50%, 50%）

完整提示词（中文）：

```text
一朵大红山茶花正在盛开的特写，花瓣一层层展开。
版面：朱红色的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Close-up of a big red camellia in full bloom, its petals opening layer by layer.
Layout: a solid vermilion red background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S47

**飞散的花瓣**

- 1:18.6–1:19.1（春天里）：「养万物生我饲衣鱼」
- 色调：朱红 / 胭脂红；主体位置：画面中央（约 50%, 50%）

完整提示词（中文）：

```text
红色背景中，一大团红白花瓣从中心向四周炸开飞散。
版面：朱红色的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
On red, a burst of red and white petals explodes outward from the center.
Layout: a solid vermilion red background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S48

**飞扬的飘带**

- 1:22.3–1:23.8（副歌）：「这种赶春的人 / 该向左或向右」
- 色调：近乎全黑；主体位置：画面右侧（约 62%, 50%）

完整提示词（中文）：

```text
黑色背景中，一条长长的白色飘带被风吹着向画面右侧飞扬；飘带在画面右侧，左侧留空。
版面：纯黑背景；主体放在画面右侧，另一侧保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Against black, one long white ribbon streams toward the right in the wind; ribbon on the right, left side empty.
Layout: a plain black background; put the subject in the right of the frame, keep the other side empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S49

**掌心的蓝蝶** · 女主角（附上 S00 参考图）

- 1:26.8–1:28.8（副歌）：「你看我这手里的胭脂虫」
- 色调：宣纸白（高调）；主体位置：画面右侧（约 62%, 50%）

完整提示词（中文）：

```text
女主角向镜头摊开红色的手掌，掌心里停着一只小小的蓝色蝴蝶；人物在画面右侧，左侧留空。
版面：纯白背景；主体放在画面右侧，另一侧保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
The heroine opens her red palm toward the viewer, a tiny blue butterfly resting in it; figure on the right, left side empty.
Layout: a plain white background; put the subject in the right of the frame, keep the other side empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S50

**落梅小径**

- 1:37.1–1:39.1（主歌 II）：「我不想被你遗忘 / 哪怕看清了这副皮囊」
- 色调：宣纸白（高调）；主体位置：画面左侧（约 40%, 55%）

完整提示词（中文）：

```text
白色背景中，一根垂下的红梅枝，花瓣落在下面的小路上；主体在画面左侧，右侧留空。
版面：纯白背景；主体放在画面左侧，另一侧保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
On white, a hanging branch of red plum blossoms, petals falling onto the path below; subject on the left, right side empty.
Layout: a plain white background; put the subject in the left of the frame, keep the other side empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S51

**红盖头** · 女主角（附上 S00 参考图）

- 1:41.1–1:43.1（主歌 II）：「哪怕看清了这副皮囊 / 男女共枕暖一张床」
- 色调：朱红 / 胭脂红；主体位置：画面左侧（约 40%, 45%）

完整提示词（中文）：

```text
女主角头上蒙着半掀起的红盖头，只露出下巴和脸颊上的一滴眼泪；主体在画面左侧，下方留空。
版面：朱红色的纯色背景；主体放在画面左侧，另一侧保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
The heroine wears a half-lifted red bridal veil, only her chin and a single tear on her cheek visible; subject on the left, bottom empty.
Layout: a solid vermilion red background; put the subject in the left of the frame, keep the other side empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S52

**捂住耳朵** · 女主角（附上 S00 参考图）

- 1:53.1–1:55.1（桥段）：「我不要就这样 / 等到了惊蛰启」
- 色调：近乎全黑；主体位置：画面中央（约 50%, 45%）

完整提示词（中文）：

```text
黑暗中，女主角用红色的双手紧紧捂住耳朵，闭着眼睛。
版面：纯黑背景；主体放在画面中央，四周保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
In the dark, the heroine presses her red hands tightly over her ears, eyes shut.
Layout: a plain black background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S53

**深夜书桌**

- 2:01.1–2:03.1（桥段）：「成了没日没夜的工作狂 / 负了我心里的少年郎」
- 色调：近乎全黑；主体位置：画面中央（约 42%, 55%）

完整提示词（中文）：

```text
深夜，一张堆满纸张的书桌，一盏小台灯亮着，椅子空着，墙上的钟指向三点。
版面：纯黑背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
Late at night, a desk piled with paper, one small desk lamp on, the chair empty, a clock on the wall at three.
Layout: a plain black background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S54

**风雪中的飘带**

- 2:09.8–2:11.8（最终副歌）：「这种赶春的人 / 该向左或向右」
- 色调：雪天灰蓝；主体位置：画面中央（约 50%, 45%）

完整提示词（中文）：

```text
暴风雪中，一条白色飘带被风吹得笔直，挂在一根枯枝上。
版面：中等灰蓝色的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
In a blizzard, a white ribbon blown straight out by the wind, caught on a bare branch.
Layout: a solid medium blue-grey background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S55

**雪里的红花**

- 2:14.8–2:17.1（最终副歌）：「你看我这手里的胭脂虫」
- 色调：雪天灰蓝；主体位置：画面中央（约 50%, 55%）

完整提示词（中文）：

```text
白茫茫的雪地上，一朵小小的红花从雪里钻出来，雪还在下。
版面：中等灰蓝色的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
On a white field of snow, a tiny red flower pokes up through the snow while snow keeps falling.
Layout: a solid medium blue-grey background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S56

**雪夜脚印**

- 2:18.6–2:21.1（最终副歌）：「像不像那晚春的花骨朵」
- 色调：雪天灰蓝；主体位置：画面中央（约 50%, 50%）

完整提示词（中文）：

```text
雪夜里，一串脚印从画面近处延伸向远方，渐渐被新雪盖住。
版面：中等灰蓝色的纯色背景；主体放在画面中央，四周保持空白，主体不要贴边。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
On a snowy night, a trail of footprints runs from the foreground into the distance, slowly covered by new snow.
Layout: a solid medium blue-grey background; put the subject in the center of the frame, keep the surroundings empty, nothing touching the edges.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S57

**晨光侧脸** · 女主角（附上 S00 参考图）

- 2:29.1–2:31.1（尾声）：「不由衷的痛有谁懂 / 眼看着那缕胭脂红」
- 色调：金色晨光；主体位置：画面左侧（约 40%, 45%）

完整提示词（中文）：

```text
金色晨光里女主角的侧脸，闭着眼，发丝被风吹起；主体在画面左侧，下方留空。
版面：暖金色的纯色背景；主体放在画面左侧，另一侧保持空白，主体不要贴边。
女主角：少女，浅灰色短发，头顶两个白色大圆发髻，绿色眼睛，眼尾一笔红色眼线，白色无袖短旗袍，双臂从手肘到指尖是朱红色（像红手套）。用细淡的铅笔线条画，造型简单。
随性的手绘草图风格，像彩色铅笔或数位铅笔画的插画：细而轻的线条，略带毛糙的铅笔笔触，线条有时重复、断开，用柔和的深墨色而不是粗重的黑色描边；人物描边要淡；简单的平涂上色，大量留白，几乎没有阴影和细节；背景是一整块纯色（颜色按版面要求），最多几笔简单线条暗示环境；整体轻盈、安静，像独立动画 MV 的手绘画面。配色：白、浅灰、朱红点缀，偶尔一点蓝。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版。
```

Full prompt (English):

```text
The heroine's profile in golden morning light, eyes closed, hair lifted by the wind; subject on the left, bottom empty.
Layout: a solid warm gold background; put the subject in the left of the frame, keep the other side empty, nothing touching the edges.
Heroine: a girl with short light-grey hair and two big round white buns on top of her head, green eyes with a red eyeliner flick, a sleeveless white short qipao, arms vermilion red from the elbows to the fingertips like red gloves. Drawn with thin faint pencil lines, a simple design.
Loose hand-drawn sketch style, like a colored-pencil or digital-pencil illustration: thin, light, slightly rough pencil lines, sometimes doubled or broken, drawn in a soft dark ink tone rather than heavy black outlines; the outlines on the characters are faint and delicate; simple flat fills, lots of white, almost no shading or detail; the background is one solid flat color (the one given in the layout line) with at most a few simple sketched lines to suggest the setting; light, quiet and gentle, like a hand-drawn indie animated music video. Palette: white, light grey, vermilion red accents, rarely a touch of blue. Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```
