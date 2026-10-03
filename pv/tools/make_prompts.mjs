#!/usr/bin/env node
// Write pv/PROMPTS.md: the image-generation brief for every picture slot,
// with the shared style, the heroine, where each slot appears in the PV
// (taken from the storyboard itself) and ready-to-paste prompts.
//
//   node pv/tools/make_prompts.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PV = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => JSON.parse(fs.readFileSync(path.join(PV, f), 'utf8'));
const { setTiming } = await import(pathToFileURL(path.join(PV, 'src', 'timing.js')).href);
setTiming(read('assets/timing.json'));
const { buildStory } = await import(pathToFileURL(path.join(PV, 'src', 'story.js')).href);

const lyrics = read('assets/lyrics.json');
const { style, heroine, slots } = read('assets/slots.json');
const uses = buildStory(lyrics).slotUses();

const SECTIONS = [[0, '序'], [15.8, '主歌 I'], [30, '严冬'], [47, '预副歌'], [62.9, '春天里'], [79.8, '副歌'], [95, '主歌 II'], [110.9, '桥段'], [127.8, '最终副歌'], [143.9, '尾声'], [161, '片尾']];
const MOOD = { night: '夜色深蓝', snow: '雪天灰蓝', paper: '宣纸白（高调）', red: '朱红 / 胭脂红', dark: '近乎全黑', gold: '金色晨光', green: '青绿' };

const clock = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
const section = (t) => SECTIONS.filter(([t0]) => t >= t0 - 1e-6).pop()[1];
const sung = (a, b) => lyrics.filter((l) => l.chars[0][1] < b && l.end > a).map((l) => l.text);
const where = ([fx]) => (fx < 0.42 ? '画面左侧' : fx > 0.58 ? '画面右侧' : '画面中央');

const merge = (list) => {
  const out = [];
  for (const [a, b] of [...list].sort((x, y) => x[0] - y[0])) {
    const last = out[out.length - 1];
    if (last && a <= last[1] + 0.01) last[1] = Math.max(last[1], b);
    else out.push([a, b]);
  }
  return out;
};

const promptCN = (s) => [s.cn, s.heroine ? heroine.cn : '', style.cn].filter(Boolean).join('\n');
const promptEN = (s) => [s.en, s.heroine ? heroine.en : '', style.en].filter(Boolean).join('\n');

const md = [];
md.push('# 《花骨朵》PV 画面提示词');
md.push('');
md.push('PV 里所有插画镜头都是编号的「画面槽位」。图片还没放进来之前，渲染器会用标着编号的占位画面代替（画面中央写着 `S05 少女与孩子` 之类的标签），镜头运动、歌词、转场、特效都已经按最终效果做好。用下面的提示词生成图片，放进 `pv/assets/images/`，重新渲染即可。');
md.push('');
md.push('> 本文件由 `node pv/tools/make_prompts.mjs` 根据 `pv/assets/slots.json` 和分镜自动生成，使用时间与成片一致。改提示词请改 `slots.json` 后重新生成。');
md.push('');
md.push('## 使用方法');
md.push('');
md.push('1. **先生成 S00 角色设定图**，确定女主角的长相。之后每张带女主角的图（标有「女主角」的槽位）都把 S00 作为参考图一起发给 GPT，并说明「保持与参考图中的角色一致」。');
md.push('2. 每个槽位复制下面的**完整提示词**（中文或英文任选一种，英文通常更稳定）。尺寸选横版 **1536×1024**（或任何 16:9 / 3:2 横版）。');
md.push('3. 保存为 `pv/assets/images/<编号>.png`，例如 `05.png`。`S05.png`、`05_少女与孩子.jpg` 这类名字也能识别；支持 png / jpg / webp。');
md.push('4. 重新渲染：`node pv/tools/render.mjs`（只看几帧：`node pv/tools/render.mjs --stills 16,20.5`）。只放了一部分图也可以渲染，其余槽位继续显示占位画面。');
md.push('5. 可选：`python pv/tools/ai/make_layers.py` 会用景深模型把图片拆成前景 / 背景两层，镜头运动时就有真实的 2.5D 视差。');
md.push('');
md.push('**注意**');
md.push('');
md.push('- 画面会被裁成 16:9，镜头还会推拉、平移，四周约 10% 可能被裁掉：主体不要贴边。');
md.push('- 每个槽位都写了**主体位置**和**留白**要求，那是歌词出现的地方。主体尽量放在指定的一侧，另一侧保持干净。');
md.push('- 画面里不能有任何文字、字母、数字、印章或水印；如果生成了，请重新生成或擦掉。');
md.push('- 画面整体的明暗要符合槽位标注的色调（例如「宣纸白」的槽位上歌词是深色字，换成暗色图片会看不清）。');
md.push('- 同一个槽位可能在不同时间出现多次（例如副歌里的闪回），一张图即可。');
md.push('');
md.push('## 统一画风');
md.push('');
md.push('```text');
md.push(style.cn);
md.push('```');
md.push('');
md.push('```text');
md.push(style.en);
md.push('```');
md.push('');
md.push('## 女主角');
md.push('');
md.push('```text');
md.push(heroine.cn);
md.push('```');
md.push('');
md.push('```text');
md.push(heroine.en);
md.push('```');
md.push('');
md.push('## 槽位一览');
md.push('');
md.push('| 编号 | 画面 | 出现时间 | 段落 | 色调 | 女主角 |');
md.push('|---|---|---|---|---|---|');
for (const s of slots) {
  const u = merge(uses[s.id] ?? []);
  const times = s.reference ? '（参考图，不出现在成片里）' : u.map(([a, b]) => `${clock(a)}–${clock(b)}`).join('<br>');
  const secs = [...new Set(u.map(([a]) => section(a)))].join('、');
  md.push(`| [S${s.id}](#s${s.id}) | ${s.name} | ${times} | ${secs || '—'} | ${MOOD[s.mood]} | ${s.heroine ? '✓' : ''} |`);
}
md.push('');
for (const s of slots) {
  const u = merge(uses[s.id] ?? []);
  md.push(`## S${s.id}`);
  md.push('');
  md.push(`**${s.name}**${s.reference ? ' · 角色参考图（第一个生成）' : s.heroine ? ' · 女主角（附上 S00 参考图）' : ''}`);
  md.push('');
  if (!s.reference) {
    for (const [a, b] of u) {
      const words = sung(a, b);
      md.push(`- ${clock(a)}–${clock(b)}（${section(a)}）${words.length ? `：「${words.join(' / ')}」` : ''}`);
    }
    md.push(`- 色调：${MOOD[s.mood]}；主体位置：${where(s.focus)}（约 ${Math.round(s.focus[0] * 100)}%, ${Math.round(s.focus[1] * 100)}%）${s.split ? '；用于左右分屏，只显示中间一半' : ''}`);
    md.push('');
  }
  md.push('完整提示词（中文）：');
  md.push('');
  md.push('```text');
  md.push(promptCN(s));
  md.push('```');
  md.push('');
  md.push('Full prompt (English):');
  md.push('');
  md.push('```text');
  md.push(promptEN(s));
  md.push('```');
  md.push('');
}

fs.writeFileSync(path.join(PV, 'PROMPTS.md'), md.join('\n'));
const used = slots.filter((s) => uses[s.id]).length;
console.log(`wrote pv/PROMPTS.md (${slots.length} slots, ${used} used in the PV)`);
const unused = slots.filter((s) => !s.reference && !uses[s.id]).map((s) => s.id);
if (unused.length) console.warn(`unused slots: ${unused.join(', ')}`);
const unknown = Object.keys(uses).filter((id) => !slots.some((s) => s.id === id));
if (unknown.length) console.warn(`storyboard uses undefined slots: ${unknown.join(', ')}`);
