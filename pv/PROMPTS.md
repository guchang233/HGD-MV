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
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

```text
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## 女主角

```text
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
```

```text
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
```

## 槽位一览

| 编号 | 画面 | 出现时间 | 段落 | 色调 | 女主角 |
|---|---|---|---|---|---|
| [S00](#s00) | 角色设定图 | （参考图，不出现在成片里） | — | 宣纸白（高调） | ✓ |
| [S01](#s01) | 雪夜红梅 | 0:02.1–0:06.1 | 序 | 夜色深蓝 |  |
| [S02](#s02) | 捧花的少女 | 0:06.1–0:08.1<br>1:26.8–1:28.8 | 序、副歌 | 宣纸白（高调） | ✓ |
| [S03](#s03) | 对镜的双生 | 0:08.1–0:10.1<br>1:19.3–1:19.6<br>1:22.3–1:22.4 | 序、春天里、副歌 | 宣纸白（高调） | ✓ |
| [S04](#s04) | 红线翻花绳 | 0:10.1–0:12.1<br>1:25.3–1:25.4 | 序、副歌 | 宣纸白（高调） |  |
| [S05](#s05) | 少女与孩子 | 0:15.8–0:19.8<br>1:19.1–1:19.3<br>1:27.8–1:27.9<br>2:10.3–2:10.4 | 主歌 I、春天里、副歌、最终副歌 | 宣纸白（高调） | ✓ |
| [S06](#s06) | 张开双臂 | 0:19.8–0:22.8<br>1:23.8–1:26.8 | 主歌 I、副歌 | 宣纸白（高调） | ✓ |
| [S07](#s07) | 雪中岔路 | 0:19.8–0:22.8<br>1:23.8–1:26.8<br>2:11.8–2:14.8 | 主歌 I、副歌、最终副歌 | 雪天灰蓝 |  |
| [S08](#s08) | 红手蓝蝶 | 0:22.8–0:25.1<br>1:28.8–1:29.3<br>2:17.1–2:18.6 | 主歌 I、副歌、最终副歌 | 宣纸白（高调） |  |
| [S09](#s09) | 眼眸与蓝蝶 | 0:25.1–0:26.6<br>1:18.6–1:19.1<br>1:30.4–1:33.1 | 主歌 I、春天里、副歌 | 宣纸白（高调） | ✓ |
| [S10](#s10) | 指向远方 | 0:26.6–0:30.0 | 主歌 I | 宣纸白（高调） | ✓ |
| [S11](#s11) | 冰封古镇 | 0:30.0–0:35.0 | 严冬 | 雪天灰蓝 |  |
| [S12](#s12) | 空巷红灯 | 0:38.3–0:41.0 | 严冬 | 夜色深蓝 |  |
| [S13](#s13) | 独坐红椅 | 0:41.0–0:47.0 | 严冬 | 夜色深蓝 | ✓ |
| [S14](#s14) | 花树里的少女 | 0:51.0–0:55.0<br>1:19.6–1:21.1 | 预副歌、春天里 | 近乎全黑 | ✓ |
| [S15](#s15) | 云想衣裳 | 0:59.0–1:02.9 | 预副歌 | 宣纸白（高调） |  |
| [S16](#s16) | 红房少女 | 1:02.9–1:07.1<br>1:17.1–1:17.6<br>2:13.3–2:13.4 | 春天里、最终副歌 | 朱红 / 胭脂红 | ✓ |
| [S17](#s17) | 红花绿地 | 1:07.1–1:11.1<br>1:18.1–1:18.6 | 春天里 | 青绿 | ✓ |
| [S18](#s18) | 凤冠山茶 | 1:11.1–1:15.1<br>1:17.6–1:18.1<br>1:31.8–1:31.9 | 春天里、副歌 | 朱红 / 胭脂红 |  |
| [S19](#s19) | 黑暗中的正脸 | 1:21.1–1:23.8<br>2:14.8–2:17.1 | 副歌、最终副歌 | 近乎全黑 | ✓ |
| [S20](#s20) | 梅枝拱门 | 1:35.1–1:39.1<br>2:16.3–2:16.4 | 主歌 II、最终副歌 | 宣纸白（高调） | ✓ |
| [S21](#s21) | 哭泣的新娘 | 1:39.1–1:43.1<br>2:20.3–2:20.4 | 主歌 II、最终副歌 | 朱红 / 胭脂红 | ✓ |
| [S22](#s22) | 红帐古床 | 1:43.1–1:45.1<br>1:47.1–1:50.9 | 主歌 II | 夜色深蓝 |  |
| [S23](#s23) | 交叉的红臂 | 1:45.1–1:47.1<br>1:50.9–1:55.1 | 主歌 II、桥段 | 近乎全黑 | ✓ |
| [S24](#s24) | 红手白花 | 1:58.9–2:03.1 | 桥段 | 近乎全黑 |  |
| [S25](#s25) | 一排新娘 | 2:03.1–2:05.1 | 桥段 | 近乎全黑 | ✓ |
| [S26](#s26) | 少年郎 | 2:05.1–2:07.8 | 桥段 | 雪天灰蓝 |  |
| [S27](#s27) | 风雪中的少女 | 2:07.8–2:11.8 | 最终副歌 | 雪天灰蓝 | ✓ |
| [S28](#s28) | 逆风 | 2:11.8–2:14.8 | 最终副歌 | 雪天灰蓝 | ✓ |
| [S29](#s29) | 雪夜背影 | 2:18.6–2:23.9 | 最终副歌 | 雪天灰蓝 | ✓ |
| [S30](#s30) | 白花遮面 | 2:23.9–2:26.6 | 尾声 | 夜色深蓝 | ✓ |
| [S31](#s31) | 金色日出 | 2:26.6–2:31.1 | 尾声 | 金色晨光 |  |
| [S32](#s32) | 梅树中的少女 | 2:31.1–2:34.3 | 尾声 | 宣纸白（高调） | ✓ |
| [S33](#s33) | 山茶入梦 | 2:34.3–2:37.1 | 尾声 | 宣纸白（高调） | ✓ |
| [S34](#s34) | 水墨梅枝 | 2:37.1–2:41.0 | 尾声 | 宣纸白（高调） |  |

## S00

**角色设定图** · 角色参考图（第一个生成）

完整提示词（中文）：

```text
女主角的角色设定图：正面全身、侧面全身和面部特写三视图并排，纯白背景，干净的线稿与平涂上色，用来保持后续画面中角色一致。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
Character reference sheet of the heroine: front full body, side full body and a face close-up side by side on a pure white background, clean line art with flat colors, to keep the character consistent in later images.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S01

**雪夜红梅**

- 0:02.1–0:06.1（序）
- 色调：夜色深蓝；主体位置：画面右侧（约 66%, 55%）

完整提示词（中文）：

```text
深夜大雪中，一枝苍劲的老梅枝从画面右下角斜伸向左上，枝头开着朱红色的梅花和花苞，枝干带水墨笔触；背景是近乎全黑的深蓝夜空，大片雪花缓缓飘落，有虚化的雪花光斑。画面左半部分保持干净的暗色留白。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
Deep in a snowy night, an old gnarled plum branch reaches diagonally from the lower right toward the upper left, carrying vermilion blossoms and buds, its bark painted with ink-brush texture; near-black deep navy sky, large snowflakes drifting with soft bokeh. Keep the left half clean and dark as negative space.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S02

**捧花的少女** · 女主角（附上 S00 参考图）

- 0:06.1–0:08.1（序）
- 1:26.8–1:28.8（副歌）：「你看我这手里的胭脂虫」
- 色调：宣纸白（高调）；主体位置：画面右侧（约 66%, 45%）

完整提示词（中文）：

```text
女主角半身正面像，位于画面右侧三分之一，红色的双手在胸前轻轻捧着一朵盛开的白花，低垂眼帘，嘴角微微上扬；纯白背景，两条白色飘带向身后两侧舒展。画面左侧大面积留白。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
Half-length front view of the heroine in the right third of the frame, gently cupping a blooming white flower at her chest with her red hands, eyes lowered, a faint smile; pure white background, two white ribbons spreading out behind her. Large empty space on the left.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
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
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
Two identical heroines in profile facing each other, noses almost touching, eyes closed, mirror-symmetric; the left one in cool grey tones, the right one in vermilion tones, their buns and hair merging in the middle; white background, the figures fill the upper two thirds and the bottom is left clean and empty.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S04

**红线翻花绳**

- 0:10.1–0:12.1（序）
- 1:25.3–1:25.4（副歌）：「该向左或向右」
- 色调：宣纸白（高调）；主体位置：画面中央（约 58%, 50%）

完整提示词（中文）：

```text
两双手玩翻花绳的特写，一根红线在指间交错成几何图形，红线微微发光；柔和的米白背景，浅景深，手部位于画面中央偏右。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
Close-up of two pairs of hands playing cat's cradle, a single red string crossing between the fingers in a geometric pattern, the string faintly glowing; soft off-white background, shallow depth of field, hands just right of center.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S05

**少女与孩子** · 女主角（附上 S00 参考图）

- 0:15.8–0:19.8（主歌 I）：「健忘的症状 / 这种赶春的人」
- 1:19.1–1:19.3（春天里）：「养万物生我饲衣鱼」
- 1:27.8–1:27.9（副歌）：「你看我这手里的胭脂虫」
- 2:10.3–2:10.4（最终副歌）：「这种赶春的人」
- 色调：宣纸白（高调）；主体位置：画面左侧（约 36%, 60%）

完整提示词（中文）：

```text
雪后的白色世界里，女主角弯下腰，伸手和两个穿冬衣的小孩说话（一个穿黄色棉服背着书包，一个穿红色棉袄），白色飘带在风中扬起；人物整体位于画面左侧到中部，右侧三分之一留白。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
In a white world after snowfall, the heroine bends down and reaches out to two small children in winter coats (one in a yellow parka with a backpack, one in a red padded jacket), her white ribbons lifting in the wind; the figures sit from the left to the center, with the right third left empty.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S06

**张开双臂** · 女主角（附上 S00 参考图）

- 0:19.8–0:22.8（主歌 I）：「这种赶春的人 / 该向左或向右」
- 1:23.8–1:26.8（副歌）：「这种赶春的人 / 该向左或向右 / 你看我这手里的胭脂虫」
- 色调：宣纸白（高调）；主体位置：画面中央（约 50%, 50%）；用于左右分屏，只显示中间一半

完整提示词（中文）：

```text
女主角面向画面左侧，张开红色的双臂迎风而立，白色飘带和裙摆被风吹向右侧，全身像，纯白背景；人物居中，身形紧凑（画面会被裁成左右分屏的一半）。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
The heroine stands facing left with her red arms spread wide into the wind, white ribbons and skirt blown to the right, full body, pure white background; figure centered and compact (the image will be cropped to one half of a split screen).
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
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
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
A snowy field at dusk where a single path splits in the center into two branches, one going left and one going right; a few bare trees in the distance, grey-blue sky, lonely; the fork sits dead center (the image will be cropped to one half of a split screen).
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
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
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
Macro close-up: a vermilion hand (as if in a red glove) with slightly curled fingers, a vivid blue morpho butterfly resting on the knuckles with its wings half open; white background, subject in the lower left, upper right left empty.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S09

**眼眸与蓝蝶** · 女主角（附上 S00 参考图）

- 0:25.1–0:26.6（主歌 I）：「你看我这手里的胭脂虫」
- 1:18.6–1:19.1（春天里）：「养万物生我饲衣鱼」
- 1:30.4–1:33.1（副歌）：「像不像那晚春的花骨朵」
- 色调：宣纸白（高调）；主体位置：画面左侧（约 38%, 50%）

完整提示词（中文）：

```text
女主角面部的极近特写：一只翠绿色的眼睛、眼尾一抹红，脸颊旁是她红色的手，一只蓝色蝴蝶停在手上；主体在画面左侧到中部，右侧留出放大字的空间。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
Extreme close-up of the heroine's face: one emerald eye with red at its corner, her red hand beside her cheek with a blue butterfly on it; subject from the left to the center, the right side left open for large lettering.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S10

**指向远方** · 女主角（附上 S00 参考图）

- 0:26.6–0:30.0（主歌 I）：「像不像那晚春的花骨朵」
- 色调：宣纸白（高调）；主体位置：画面左侧（约 30%, 55%）

完整提示词（中文）：

```text
女主角侧身，抬起红色的手臂指向远处一只越飞越远的小蓝蝶，白色背景；人物在画面左侧，右侧是开阔的留白天空。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
The heroine in side view raises her red arm and points at a tiny blue butterfly flying away into the distance, white background; figure on the left, open empty sky on the right.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S11

**冰封古镇**

- 0:30.0–0:35.0（严冬）：「像不像那晚春的花骨朵 / 去年的严冬太寒冷」
- 色调：雪天灰蓝；主体位置：画面中央（约 42%, 55%）

完整提示词（中文）：

```text
暴风雪中的中国古镇夜景，屋檐挂满冰凌，街道空无一人，几盏被雪覆盖的红灯笼发出微弱的光，整体深蓝色调，广角；画面右侧较暗。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
An ancient Chinese town at night in a blizzard, icicles hanging from the eaves, empty streets, a few snow-covered red lanterns glowing faintly, deep blue tones, wide angle; the right side kept darker.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S12

**空巷红灯**

- 0:38.3–0:41.0（严冬）：「去年的街道太冷清」
- 色调：夜色深蓝；主体位置：画面右侧（约 62%, 45%）

完整提示词（中文）：

```text
深夜下雪的狭长古巷，单点透视延伸向画面右上方的远处，一盏红灯笼挂在墙上，女主角长长的影子投在雪地和墙面上（人物本身不在画面里），冷清孤寂。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
A long, narrow old alley at night in falling snow, one-point perspective receding toward the upper right, a single red lantern on the wall, the heroine's long shadow cast across the snow and the wall (she herself is out of frame), cold and lonely.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S13

**独坐红椅** · 女主角（附上 S00 参考图）

- 0:41.0–0:47.0（严冬）：「去年的街道太冷清 / 空巷孤影它伤人情」
- 色调：夜色深蓝；主体位置：画面左侧（约 40%, 55%）

完整提示词（中文）：

```text
昏暗的房间里，冷蓝色的月光透过白色纱帘照进来，女主角独自坐在一把红色雕花古椅上，低着头，双手放在膝上，白色飘带垂落在地；整体偏暗，人物在左侧到中部，右侧是暗色的留白。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
A dim room where cold blue moonlight falls through pale white curtains; the heroine sits alone on a red carved antique chair, head lowered, hands on her knees, white ribbons trailing to the floor; mostly dark, figure from the left to the center, dark empty space on the right.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S14

**花树里的少女** · 女主角（附上 S00 参考图）

- 0:51.0–0:55.0（预副歌）：「把我爱的人往里头装」
- 1:19.6–1:21.1（春天里）：「健忘的症状 / 这种赶春的人」
- 色调：近乎全黑；主体位置：画面中央（约 50%, 50%）

完整提示词（中文）：

```text
纯黑背景中，一棵由无数白色花朵组成的巨大花树，花心是红色，女主角闭着眼站在花树的中心，像被花朵包裹；对称构图，居中。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
Against pure black, a giant tree made of countless white flowers with red centers; the heroine stands with closed eyes at its heart, wrapped in blossoms; symmetrical, centered.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S15

**云想衣裳**

- 0:59.0–1:02.9（预副歌）：「银装素裹胭脂妆 / 花想容貌云想衣裳」
- 色调：宣纸白（高调）；主体位置：画面中央（约 50%, 45%）

完整提示词（中文）：

```text
苍白明亮的天空中，云朵像一件白色丝绸长裙般舒展流动，零星的花瓣在空中飘散，梦幻、柔和、高调。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
In a pale, bright sky, clouds unfurl and flow like a long white silk gown, a few petals drifting through the air; dreamy, soft, high-key.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S16

**红房少女** · 女主角（附上 S00 参考图）

- 1:02.9–1:07.1（春天里）：「花想容貌云想衣裳 / 我想要死在春天里 / 红花作衣绿地作席」
- 1:17.1–1:17.6（春天里）：「养万物生我饲衣鱼」
- 2:13.3–2:13.4（最终副歌）：「该向左或向右」
- 色调：朱红 / 胭脂红；主体位置：画面左侧（约 38%, 45%）

完整提示词（中文）：

```text
俯视镜头：女主角闭着眼安详地躺在一间华丽的红色房间里，身下是红色丝绸，周围散落着中式首饰、梳子、手镯、团扇和红花；人物位于画面左侧到中部，右侧留空。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
Top-down shot: the heroine lies peacefully with closed eyes in a lavish red room on red silk, surrounded by scattered Chinese jewelry, combs, bracelets, round fans and red flowers; figure from the left to the center, right side open.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S17

**红花绿地** · 女主角（附上 S00 参考图）

- 1:07.1–1:11.1（春天里）：「红花作衣绿地作席 / 野蛮生长在春泥」
- 1:18.1–1:18.6（春天里）：「养万物生我饲衣鱼」
- 色调：青绿；主体位置：画面中央（约 50%, 50%）

完整提示词（中文）：

```text
俯视镜头：女主角躺在一大片开满红花的青绿色草地上，红色花瓣被风吹起，春天，明亮。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
Top-down shot: the heroine lies in a vast green meadow full of red flowers, red petals lifted by the wind, spring, bright.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S18

**凤冠山茶**

- 1:11.1–1:15.1（春天里）：「野蛮生长在春泥 / 养万物生我饲衣鱼」
- 1:17.6–1:18.1（春天里）：「养万物生我饲衣鱼」
- 1:31.8–1:31.9（副歌）：「像不像那晚春的花骨朵」
- 色调：朱红 / 胭脂红；主体位置：画面中央（约 50%, 45%）

完整提示词（中文）：

```text
新娘凤冠的特写：由硕大的红山茶花组成，金色发钗和珠帘垂下遮住了半张脸，只露出下巴和红唇；戏剧性的侧光，深色背景。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
Close-up of a bride's phoenix crown made of huge red camellias, gold hairpins and beaded tassels hanging down to veil half her face so only her chin and red lips show; dramatic side light, dark background.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S19

**黑暗中的正脸** · 女主角（附上 S00 参考图）

- 1:21.1–1:23.8（副歌）：「这种赶春的人 / 该向左或向右」
- 2:14.8–2:17.1（最终副歌）：「你看我这手里的胭脂虫」
- 色调：近乎全黑；主体位置：画面中央（约 50%, 45%）

完整提示词（中文）：

```text
黑暗中女主角的正脸特写，翠绿色的眼睛直视镜头，皮肤上有细微的裂纹（像瓷器），一缕冷光照亮半边脸；居中。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
Front close-up of the heroine's face in darkness, emerald eyes looking straight into the lens, faint cracks on her skin like porcelain, a thin cold light catching half her face; centered.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S20

**梅枝拱门** · 女主角（附上 S00 参考图）

- 1:35.1–1:39.1（主歌 II）：「我不想被你遗忘 / 哪怕看清了这副皮囊」
- 2:16.3–2:16.4（最终副歌）：「你看我这手里的胭脂虫」
- 色调：宣纸白（高调）；主体位置：画面中央（约 42%, 55%）

完整提示词（中文）：

```text
白色背景上，深色的老梅枝从两侧向上合拢成一道拱门，枝头开满红梅，女主角小小地站在拱门下回头；水墨质感，人物在画面中部偏左，右侧留白。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
On a white background, dark old plum branches curve up from both sides to form an arch covered in red blossoms; the heroine stands small beneath it, looking back; ink-painting texture, figure just left of center, right side open.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S21

**哭泣的新娘** · 女主角（附上 S00 参考图）

- 1:39.1–1:43.1（主歌 II）：「哪怕看清了这副皮囊 / 男女共枕暖一张床」
- 2:20.3–2:20.4（最终副歌）：「像不像那晚春的花骨朵」
- 色调：朱红 / 胭脂红；主体位置：画面左侧（约 40%, 45%）

完整提示词（中文）：

```text
哭泣的新娘特写，戴着由红山茶组成的凤冠，珠帘半遮双眼，泪水从脸颊滑落；红与白，主体在左侧，下方和右侧留白。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
Close-up of a crying bride wearing a phoenix crown of red camellias, a bead curtain half veiling her eyes, tears running down her cheeks; red and white, subject on the left, space left open below and on the right.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S22

**红帐古床**

- 1:43.1–1:45.1（主歌 II）：「男女共枕暖一张床」
- 1:47.1–1:50.9（主歌 II）：「同床异梦迷一样」
- 色调：夜色深蓝；主体位置：画面中央（约 50%, 50%）

完整提示词（中文）：

```text
昏暗的古代卧室里，一张挂着红色帐幔的雕花木床，床上并排两个枕头，烛光摇曳，暖色与深影，居中对称。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
In a dim old bedroom, a carved wooden canopy bed hung with red curtains, two pillows side by side, flickering candlelight, warm tones and deep shadows, centered and symmetrical.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S23

**交叉的红臂** · 女主角（附上 S00 参考图）

- 1:45.1–1:47.1（主歌 II）：「男女共枕暖一张床 / 同床异梦迷一样」
- 1:50.9–1:55.1（桥段）：「同床异梦迷一样 / 我不要就这样 / 等到了惊蛰启」
- 色调：近乎全黑；主体位置：画面中央（约 50%, 45%）

完整提示词（中文）：

```text
深色背景中，女主角用交叉的红色双臂遮住嘴，只露出一双直视镜头的眼睛，眼神倔强；一束硬光从上方打下，近景居中。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
Against a dark background, the heroine hides her mouth behind her crossed red arms, only her stubborn eyes visible, staring into the lens; a hard light from above, centered close-up.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S24

**红手白花**

- 1:58.9–2:03.1（桥段）：「盼霜降 / 成了没日没夜的工作狂 / 负了我心里的少年郎」
- 色调：近乎全黑；主体位置：画面中央（约 58%, 55%）

完整提示词（中文）：

```text
一双红色的手从画面右侧伸入，捧着一朵白花，几片花瓣散落；纯黑背景，柔和的顶光，主体在中部偏右。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
A pair of red hands reaching in from the right, cupping a white flower, a few petals falling; pure black background, soft top light, subject just right of center.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S25

**一排新娘** · 女主角（附上 S00 参考图）

- 2:03.1–2:05.1（桥段）：「负了我心里的少年郎」
- 色调：近乎全黑；主体位置：画面中央（约 50%, 50%）

完整提示词（中文）：

```text
纯黑背景前，一排穿着红色刺绣嫁衣的新娘并排站立，她们的头是一朵朵巨大的红花；在她们中间站着小小的、穿白衣的女主角；超现实，对称。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
Against pure black, a row of brides in red embroidered wedding robes stands side by side, their heads replaced by enormous red flowers; among them stands the small heroine in white; surreal, symmetrical.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S26

**少年郎**

- 2:05.1–2:07.8（桥段）：「负了我心里的少年郎 / 健忘的症状」
- 色调：雪天灰蓝；主体位置：画面左侧（约 40%, 60%）

完整提示词（中文）：

```text
黄昏的雪中，远处一棵枯树下站着一个少年的剪影，背对镜头，水墨般淡远的意境，大面积留白。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
Dusk in falling snow: the silhouette of a young man stands under a bare tree in the distance with his back to us; faint ink-wash mood, lots of empty space.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S27

**风雪中的少女** · 女主角（附上 S00 参考图）

- 2:07.8–2:11.8（最终副歌）：「健忘的症状 / 这种赶春的人 / 该向左或向右」
- 色调：雪天灰蓝；主体位置：画面中央（约 50%, 50%）

完整提示词（中文）：

```text
夜晚的暴风雪中，女主角双手抱紧自己，白色飘带被风狂乱地吹起，冷蓝色光线，雪地；人物居中。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
In a blizzard at night, the heroine hugs herself tightly, white ribbons whipped wildly by the wind, cold blue light, snowy ground; figure centered.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S28

**逆风** · 女主角（附上 S00 参考图）

- 2:11.8–2:14.8（最终副歌）：「该向左或向右 / 你看我这手里的胭脂虫」
- 色调：雪天灰蓝；主体位置：画面中央（约 50%, 50%）；用于左右分屏，只显示中间一半

完整提示词（中文）：

```text
星空下的风雪夜，女主角弯腰顶着风前行，衣摆和飘带被吹向后方；人物居中，身形紧凑（画面会被裁成分屏的一半）。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
A snowy, windy night under the stars: the heroine bends forward, pushing into the wind, her hem and ribbons blown back; figure centered and compact (the image will be cropped to one half of a split screen).
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S29

**雪夜背影** · 女主角（附上 S00 参考图）

- 2:18.6–2:23.9（最终副歌）：「像不像那晚春的花骨朵」
- 色调：雪天灰蓝；主体位置：画面中央（约 50%, 60%）

完整提示词（中文）：

```text
雪夜中女主角的背影，仰望夜空，衣服上有红色的痕迹，风吹起发丝和飘带；人物居中略偏下，上方是飘雪的夜空。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
The heroine seen from behind in the snowy night, looking up at the sky, red stains on her dress, wind lifting her hair and ribbons; figure centered and slightly low, snowy night sky above.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S30

**白花遮面** · 女主角（附上 S00 参考图）

- 2:23.9–2:26.6（尾声）：「像不像那晚春的花骨朵 / 错过的不肯罢休 / 不由衷的痛有谁懂」
- 色调：夜色深蓝；主体位置：画面左侧（约 40%, 50%）

完整提示词（中文）：

```text
夜色中，一朵巨大的白色花朵挡住了女主角的半张脸，花心是红色，露出一只翠绿的眼睛，柔和的月光；主体在画面左侧到中部，右侧留白。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
At night, a huge white flower with a red center covers half of the heroine's face, one emerald eye visible, soft moonlight; subject from the left to the center, right side open.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S31

**金色日出**

- 2:26.6–2:31.1（尾声）：「错过的不肯罢休 / 不由衷的痛有谁懂 / 眼看着那缕胭脂红」
- 色调：金色晨光；主体位置：画面中央（约 50%, 35%）

完整提示词（中文）：

```text
金色的朝阳从厚重的云层后迸发，照亮积雪的群山，前景有一棵孤零零的枯树，强烈的丁达尔光束；太阳在画面中上方，下方三分之一较暗。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
A golden sunrise bursts through heavy clouds, lighting snow-covered mountains, a lone bare tree in the foreground, strong god rays; the sun sits in the upper center, the lower third darker.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S32

**梅树中的少女** · 女主角（附上 S00 参考图）

- 2:31.1–2:34.3（尾声）：「眼看着那缕胭脂红 / 玩笑一般地开在无人问津」
- 色调：宣纸白（高调）；主体位置：画面中央（约 42%, 50%）

完整提示词（中文）：

```text
白色背景中，女主角安静地躺在一棵开满红梅的老梅树枝杈间，闭着眼，裙摆垂落；人物在画面中部偏左，左右两侧留白。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
On a white background, the heroine lies quietly among the branches of an old plum tree full of red blossoms, eyes closed, her skirt hanging down; figure just left of center, both sides left open.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S33

**山茶入梦** · 女主角（附上 S00 参考图）

- 2:34.3–2:37.1（尾声）：「眼看着那缕胭脂红 / 玩笑一般地开在无人问津」
- 色调：宣纸白（高调）；主体位置：画面中央（约 45%, 42%）

完整提示词（中文）：

```text
近景：熟睡的女主角，发间插着一朵很大的红山茶花，周围是梅枝和零星的白花，嘴角带着平静的微笑；人物在画面中部偏左，下方留白。
女主角：约十六岁的少女，灰白色短发（带一点青灰），头部两侧各盘一个圆润蓬松的发髻，像两团棉花；翠绿色眼睛，眼尾一抹红；无袖白色立领短旗袍，盘扣；双臂从手肘到指尖渐变成朱红色，像戴着红手套；身后常飘着两条长长的白色飘带。安静，略带忧伤。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
Close-up: the heroine asleep with a large red camellia in her hair, surrounded by plum branches and a few white blossoms, a calm smile; subject just left of center, space left open below.
Heroine: a girl of about sixteen with short silver-grey hair (a faint green-grey tint) and two round, fluffy buns on the sides of her head like balls of cotton; emerald green eyes with a touch of red at the outer corners; a sleeveless white mandarin-collar qipao with knot buttons; her arms fade from the elbows to the fingertips into vermilion, like red gloves; two long white ribbons often trail behind her. Quiet, slightly melancholic.
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```

## S34

**水墨梅枝**

- 2:37.1–2:41.0（尾声）：「玩笑一般地开在无人问津」
- 色调：宣纸白（高调）；主体位置：画面右侧（约 62%, 35%）

完整提示词（中文）：

```text
宣纸白背景上，一枝水墨画风格的梅枝从画面右上角斜伸向左下，枝头点缀着小小的朱红色梅花，大面积留白，下方尤其空旷，极简、安静（和开场呼应）。
电影级日系动画插画，中国风，细腻的光影与空气感，干净的线条，柔和的赛璐璐上色带少量水彩质感，轻微胶片颗粒。主色：宣纸白、墨黑、朱红与胭脂红（冬季场景用深蓝与冷白，尾声用金色晨光）。画面中不能出现任何文字、字母、数字、印章、标志或水印。16:9 横版构图。
```

Full prompt (English):

```text
On white rice paper, a single ink-painted plum branch reaches in from the upper right corner and slants down toward the left, dotted with small vermilion blossoms; lots of empty space, especially along the bottom; minimal and quiet (echoing the opening).
Cinematic Japanese-anime film illustration with a Chinese aesthetic: delicate light and atmosphere, clean line art, soft cel shading with a touch of watercolor texture, subtle film grain. Palette: rice-paper white, ink black, vermilion and rouge red (deep navy and cold white for winter scenes, golden dawn light for the ending). Absolutely no text, letters, numbers, seals, logos or watermarks. 16:9 landscape.
```
