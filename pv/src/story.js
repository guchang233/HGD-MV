// 《花骨朵》PV — full-song storyboard.
//
// The whole song (170.4 s, 120 BPM, downbeats at 0.055 + 2n) plays
// untouched.  Every lyric syllable is forced-aligned (assets/lyrics.json);
// drum hits come from the drum stem (assets/timing.json).  Illustrated shots
// show numbered picture slots (assets/slots.json, prompts in PROMPTS.md);
// everything else — camera, typography, particles, graphics, transitions —
// is generated here as a function of time.
import { W, H, TAU, clamp, ease, lerp, span, fbm1, mulberry32, makeCanvas } from './core.js';
import { events } from './timing.js';
import { FONTS } from './lyrics.js';
import { PlumTree, drawBlossom, BLOSSOM_WHITE } from './plum.js';
import { fallingPetals, petalBurst, snowfall, embers, motes, shedPetals } from './particles.js';
import { inkChar, softChar, font, horizontalLayout, LATIN } from './type.js';
import { D, layer, move, still, plus, makeGlobalCam, coverNeed } from './camera.js';
import { drawCard } from './slots.js';
import * as G from './graphics.js';

export const DURATION = 170.4;
const BAR = (n) => 0.055 + n * 2; // downbeat of bar n

// piecewise-linear keyframes [[t, v], ...]
export const keys = (list, t) => {
  if (t <= list[0][0]) return list[0][1];
  for (let i = 1; i < list.length; i++) {
    if (t <= list[i][0]) return lerp(list[i - 1][1], list[i][1], (t - list[i - 1][0]) / (list[i][0] - list[i - 1][0]));
  }
  return list[list.length - 1][1];
};

// ------------------------------------------------------------- look --
export const LOOK = {
  // how hard the picture reacts to the drums
  intensity: [[0, 0.15], [15.7, 0.15], [15.8, 0.55], [29.9, 0.55], [30, 0.35], [46.9, 0.35], [47, 0.5], [62.8, 0.5], [62.9, 0.8], [79.7, 0.85], [79.8, 1], [94.9, 1], [95, 0.3], [110.8, 0.3], [110.9, 0.85], [127.7, 0.85], [127.8, 1], [143.8, 1], [143.9, 0.35], [161, 0.2], [170.4, 0]],
  bloom: [[0, 0.12], [170.4, 0.12]],
  letterbox: [[0, 0], [2.0, 0], [2.6, 1], [12.0, 1], [12.06, 0], [94.95, 0], [95.4, 1], [110.85, 1], [110.93, 0], [156.9, 0], [157.6, 1], [161, 1], [161.4, 0]],
  hud: [[0, 0], [15.75, 0], [15.8, 0.45], [29.9, 0.45], [30, 0.3], [62.8, 0.3], [62.9, 0.6], [79.8, 0.85], [94.9, 0.85], [95, 0], [110.85, 0], [110.93, 0.8], [143.85, 0.8], [143.93, 0], [170.4, 0]],
  leak: [[0, 0], [170.4, 0]],
  section: [[0, 'PROLOGUE'], [15.8, 'VERSE I'], [30, 'WINTER'], [47, 'PRE-CHORUS'], [62.9, 'SPRING'], [79.8, 'CHORUS'], [95, 'VERSE II'], [110.9, 'BRIDGE'], [127.8, 'FINAL CHORUS'], [143.9, 'CODA'], [161, 'END']],
  // big hits that throw light from the subject: [t, amp, decay, x, y, rgb]
  rays: [],
  // anamorphic flares on the biggest hits: [t, amp, decay, x, y, rgb]
  flares: [],
};

// ------------------------------------------------------------ palette --
const C = {
  ink: '#151214',
  white: '#ffffff',
  red: '#e2483a',
  hot: '#ff3b30',
  crimson: '#b3121b',
  ice: '#d8ecff',
  gold: '#ffd88a',
  green: '#c9f5be',
};
const DARK_GLOW = 'rgba(0,0,0,0.35)';
const LIGHT_GLOW = 'rgba(255,255,255,0.45)';

// typographic presets (merged into each line's style)
const T = {
  serifW: { font: 'serif', weight: 800, color: C.white, glow: DARK_GLOW, glowBlur: 9 },
  serifInk: { font: 'serif', weight: 800, color: C.ink, glow: LIGHT_GLOW, glowBlur: 8 },
  sansW: { font: 'sans', weight: 900, color: C.white, glow: DARK_GLOW, glowBlur: 7 },
  sansInk: { font: 'sans', weight: 900, color: C.ink, glow: LIGHT_GLOW, glowBlur: 7 },
  brushRed: { font: 'brush', weight: 400, color: C.hot, glow: 'rgba(60,0,0,0.35)', glowBlur: 9 },
  brushW: { font: 'brush', weight: 400, color: C.white, glow: DARK_GLOW, glowBlur: 9 },
  brushInk: { font: 'brush', weight: 400, color: C.ink, glow: LIGHT_GLOW, glowBlur: 8 },
};
const red = (scale = 1, extra = {}) => ({ ...T.brushRed, scale, ...extra });
const ICE = { ...T.serifW, color: C.ice, glow: 'rgba(0,20,60,0.35)' };
const each = (idx, v) => Object.fromEntries(idx.map((i) => [i, v]));

// ---------------------------------------------------- lyric typography --
// One entry per line of assets/lyrics.json (same order).
//   ghost: oversized hollow type behind the line;  sub: subtitle placement
const LYRICS = [
  /* 0 健忘的症状 */ { ...T.serifInk, layout: 'v', x: 1560, y: 170, size: 118, in: 'stamp', out: 'blow' },
  /* 1 这种赶春的人 */ { ...T.sansInk, layout: 'h', y: 880, size: 92, in: 'mask', inDur: 0.35, out: 'mask', emph: { 3: red(1.5, { dy: -10, in: 'stamp' }) } },
  /* 2 该向左或向右 */ { ...T.sansW, layout: 'pos', size: 150, in: 'slide', out: 'zoom', pos: [[960, 170, 0.6], [520, 540], [520, 720, 1.4], [960, 540, 0.5], [1400, 540], [1400, 720, 1.4]], emph: { 1: { dir: 1 }, 2: { ...T.brushRed, dir: 1 }, 4: { dir: -1 }, 5: { ...T.brushRed, dir: -1 } } },
  /* 3 你看我这手里的胭脂虫 */ { ...T.serifInk, layout: 'pos', size: 64, in: 'type', out: 'shatter', pos: [[200, 230], [270, 230], [340, 230], [410, 230], [480, 230], [550, 230], [620, 230], [1210, 560, 4.2], [1500, 560, 4.2], [1790, 560, 4.2]], emph: each([7, 8, 9], { ...T.brushRed, in: 'stamp' }) },
  /* 4 像不像那晚春的花骨朵 */ { ...T.serifInk, layout: 'pos', size: 120, in: 'stamp', out: 'drift', pos: [[230, 300], [230, 430, 0.8], [230, 560], [700, 880, 0.6], [790, 880, 0.6], [880, 880, 0.6], [970, 880, 0.6], [1260, 300, 1.9], [1500, 300, 1.9], [1740, 300, 1.9]], emph: { 1: { color: C.red }, 7: red(), 8: red(), 9: red() }, sweep: { at: 29.82, dur: 0.42, color: '255,236,220' } },
  /* 5 去年的严冬太寒冷 */ { ...ICE, layout: 'v', x: 1700, y: 120, size: 96, breaks: [5], in: 'freeze', inDur: 0.6, out: 'fade', outDur: 0.6, emph: { 6: { scale: 1.6, color: '#ffffff' }, 7: { scale: 1.6, color: '#ffffff' } } },
  /* 6 天寒地冻日不升 */ { ...ICE, layout: 'pos', size: 190, in: 'freeze', inDur: 0.5, out: 'shatter', pos: [[300, 300], [520, 300], [300, 520], [520, 520], [1500, 820, 0.45], [1590, 820, 0.45], [1680, 820, 0.45]] },
  /* 7 去年的街道太冷清 */ { ...ICE, glow: 'rgba(0,10,40,0.35)', layout: 'pos', size: 80, in: 'soft', inDur: 0.5, out: 'drift', pos: [[300, 820, 0.7], [420, 780, 0.8], [560, 735, 0.9], [740, 680, 1.05], [960, 620, 1.2], [1220, 550, 1.4], [1500, 470, 1.6], [1800, 380, 1.85]] },
  /* 8 空巷孤影它伤人情 */ { ...T.serifW, layout: 'pos', size: 140, in: 'soft', inDur: 0.45, out: 'fade', outAt: 46.75, pos: [[260, 260], [260, 420], [1660, 260], [1660, 420], [960, 760, 0.45], [1180, 830, 1.1], [1340, 830, 1.1], [1500, 830, 1.1]], emph: each([5, 6, 7], red(1.1)) },
  /* 9 我想要一座房 */ { ...T.serifW, layout: 'pos', size: 70, in: 'rise', out: 'zoom', pos: [[820, 200], [900, 200], [980, 200], [760, 900, 2.0], [960, 900, 2.0], [1160, 900, 2.0]], sub: { y: 1040 } },
  /* 10 把我爱的人往里头装 */ { ...T.serifW, layout: 'h', y: 900, size: 76, in: 'scatter', inDur: 0.45, out: 'blow', emph: { 2: red(1.4) } },
  /* 11 银装素裹胭脂妆 */ { ...T.serifInk, layout: 'pos', size: 120, in: 'soft', out: 'blow', pos: [[300, 280], [300, 420], [300, 560], [300, 700], [1180, 560, 1.7], [1420, 560, 1.7], [1660, 560, 1.7]], emph: each([4, 5, 6], { ...T.brushW, in: 'stamp', glow: 'rgba(80,0,0,0.35)' }) },
  /* 12 花想容貌云想衣裳 */ { font: 'serif', weight: 600, color: '#2a2224', glow: LIGHT_GLOW, glowBlur: 9, layout: 'pos', size: 110, in: 'soft', inDur: 0.5, out: 'drift', pos: [[300, 300], [300, 440], [300, 580], [300, 720], [1620, 300], [1620, 440], [1620, 580], [1620, 720]] },
  /* 13 我想要死在春天里 */ { ...T.sansW, layout: 'pos', size: 84, in: 'stamp', out: 'cut', pos: [[240, 220], [340, 220], [440, 220], [960, 540, 5.0], [1480, 880], [1580, 880], [1680, 880], [1780, 880]], emph: { 3: { font: 'brush', weight: 400, color: '#0b0606', glow: 'rgba(255,60,40,0.35)', glowBlur: 14, in: 'zoom', inDur: 0.35, echo: false } }, sub: { x: 1630, y: 1000 } },
  /* 14 红花作衣绿地作席 */ { ...T.brushRed, layout: 'pos', size: 190, in: 'stamp', out: 'slash', pos: [[300, 330], [520, 330], [740, 330], [960, 330], [960, 760], [1180, 760], [1400, 760], [1620, 760]], emph: each([4, 5, 6, 7], { color: C.green, glow: 'rgba(0,40,10,0.35)' }) },
  /* 15 野蛮生长在春泥 */ { ...T.brushW, layout: 'pos', size: 120, in: 'grow', inDur: 0.4, out: 'shatter', pos: [[560, 420, 3.2], [1360, 420, 3.2], [520, 880, 1.2], [700, 880, 1.2], [1260, 880, 1.2], [1400, 880, 1.2], [1540, 880, 1.2]], emph: { 0: { ...T.brushRed, in: 'stamp' }, 1: { ...T.brushRed, in: 'stamp' } }, sub: { y: 1040 } },
  /* 16 养万物生我饲衣鱼 */ { ...T.serifW, layout: 'grid', cols: 4, x: 960, y: 520, size: 150, in: 'flip', out: 'shatter', emph: each([4, 5, 6, 7], { color: C.red }) },
  /* 17 健忘的症状 (chorus 1) */ { ...T.sansW, layout: 'h', y: 540, size: 250, track: 0.02, in: 'zoom', inDur: 0.22, out: 'cut', echo: false },
  /* 18 这种赶春的人 */ { ...T.serifW, layout: 'v', x: 360, y: 120, size: 132, in: 'flip', out: 'blow', emph: { 3: red(1.3) } },
  /* 19 该向左或向右 */ { ...T.sansW, layout: 'pos', size: 180, in: 'slide', out: 'cut', pos: [[960, 140, 0.5], [480, 520], [480, 760, 1.3], [960, 540, 0.5], [1440, 520], [1440, 760, 1.3]], emph: { 1: { dir: 1 }, 2: { ...T.brushRed, dir: 1 }, 4: { dir: -1 }, 5: { ...T.brushRed, dir: -1 } } },
  /* 20 你看我这手里的胭脂虫 */ { ...T.sansInk, layout: 'pos', size: 70, in: 'type', out: 'shatter', pos: [[180, 160], [260, 160], [340, 160], [420, 160], [500, 160], [580, 160], [660, 160], [560, 620, 4.6], [960, 620, 4.6], [1360, 620, 4.6]], emph: each([7, 8, 9], { ...T.brushRed, in: 'stamp' }) },
  /* 21 像不像那晚春的花骨朵 */ { ...T.serifInk, layout: 'pos', size: 130, in: 'stamp', out: 'cut', outAt: 93.0, pos: [[1500, 300], [1500, 440, 0.8], [1500, 580], [1760, 300, 0.7], [1760, 400, 0.7], [1760, 500, 0.7], [1760, 600, 0.7], [-999, -999], [-999, -999], [-999, -999]] },
  /* 22 我不想被你遗忘 */ { ...T.serifInk, layout: 'v', x: 1650, y: 190, size: 100, in: 'soft', inDur: 0.6, out: 'drift', outDur: 1.2, emph: { 5: { color: '#8a8380' }, 6: { color: '#b9b2ae' } } },
  /* 23 哪怕看清了这副皮囊 */ { ...T.serifW, layout: 'h', y: 880, size: 82, in: 'soft', inDur: 0.5, out: 'slash', emph: { 7: red(1.5, { dy: -12 }), 8: red(1.5, { dy: -12 }) } },
  /* 24 男女共枕暖一张床 */ { ...T.serifW, layout: 'pos', size: 120, in: 'slide', out: 'fade', pos: [[300, 540, 1.3], [1620, 540, 1.3], [880, 230], [1040, 230], [700, 860, 0.8], [840, 860, 0.8], [980, 860, 0.8], [1180, 860, 1.2]], emph: { 0: { dir: 1 }, 1: { dir: -1 }, 7: red(1, { in: 'stamp' }) } },
  /* 25 同床异梦迷一样 */ { ...T.serifW, layout: 'pos', size: 150, in: 'soft', out: 'cut', pos: [[420, 320], [620, 320], [1300, 760], [1500, 760], [840, 540, 0.7], [960, 540, 0.7], [1080, 540, 0.7]], emph: { 2: { rot: Math.PI, color: '#cfc8ff' }, 3: { rot: Math.PI, color: '#cfc8ff' } } },
  /* 26 我不要就这样 */ { ...T.sansW, layout: 'pos', size: 230, in: 'stamp', inDur: 0.3, out: 'cut', pos: [[420, 440], [960, 440], [1500, 440], [760, 840, 0.55], [960, 840, 0.55], [1160, 840, 0.55]], emph: { 1: { color: C.hot }, 2: { color: C.hot } } },
  /* 27 等到了惊蛰启 */ { ...T.serifW, layout: 'h', x: 960, y: 140, size: 64, in: 'mask', out: 'fade', emph: { 3: { color: C.hot, scale: 1.4 }, 4: { color: C.hot, scale: 1.4 } } },
  /* 28 盼霜降 */ { ...T.serifW, layout: 'h', x: 960, y: 900, size: 92, in: 'stamp', out: 'fade', emph: { 1: { color: '#9fd0ff' }, 2: { color: '#9fd0ff' } } },
  /* 29 成了没日没夜的工作狂 */ { ...T.sansW, layout: 'pos', size: 96, in: 'stamp', out: 'cut', pos: [[220, 200, 0.7], [300, 200, 0.7], [560, 520, 1.7], [760, 520, 1.7], [960, 520, 1.7], [1160, 520, 1.7], [1350, 520, 0.7], [1500, 840, 1.3], [1660, 840, 1.3], [1820, 840, 1.3]], emph: { 3: { color: C.hot }, 5: { color: C.hot }, 7: red(1.4), 8: red(1.4), 9: red(1.4) } },
  /* 30 负了我心里的少年郎 */ { ...T.serifW, layout: 'v', x: 1640, y: 150, size: 100, breaks: [6], in: 'soft', out: 'drift', outAt: 127.2, outDur: 0.45, emph: each([6, 7, 8], { scale: 1.3, color: C.gold }) },
  /* 31 健忘的症状 (final) */ { ...T.sansW, layout: 'h', y: 540, size: 270, track: 0.02, in: 'zoom', inDur: 0.2, out: 'cut', echo: false },
  /* 32 这种赶春的人 */ { ...T.serifW, layout: 'v', x: 1560, y: 150, size: 130, in: 'flip', out: 'blow', emph: { 3: red(1.3) } },
  /* 33 该向左或向右 */ { ...T.sansW, layout: 'pos', size: 190, in: 'slide', out: 'cut', pos: [[960, 140, 0.5], [480, 520], [480, 770, 1.3], [960, 540, 0.5], [1440, 520], [1440, 770, 1.3]], emph: { 1: { dir: 1 }, 2: { ...T.brushRed, dir: 1 }, 4: { dir: -1 }, 5: { ...T.brushRed, dir: -1 } } },
  /* 34 你看我这手里的胭脂虫 */ { ...T.sansW, layout: 'pos', size: 72, in: 'type', out: 'shatter', pos: [[1240, 170], [1320, 170], [1400, 170], [1480, 170], [1560, 170], [1640, 170], [1720, 170], [560, 640, 4.8], [960, 640, 4.8], [1360, 640, 4.8]], emph: each([7, 8, 9], { ...T.brushRed, in: 'stamp' }) },
  /* 35 像不像那晚春的花骨朵 */ { ...T.serifW, layout: 'pos', size: 130, in: 'stamp', out: 'blow', pos: [[300, 300], [300, 440, 0.8], [300, 580], [1600, 260, 0.7], [1600, 360, 0.7], [1600, 460, 0.7], [1600, 560, 0.7], [560, 780, 2.7], [960, 780, 2.7], [1360, 780, 2.7]], emph: { 7: red(), 8: red(), 9: red() }, sub: { y: 1050 }, sweep: { at: 141.95, dur: 0.5, color: '255,236,220' } },
  /* 36 错过的不肯罢休 */ { ...T.serifW, color: C.gold, glow: 'rgba(40,20,0,0.35)', layout: 'v', x: 1640, y: 160, size: 112, breaks: [3], in: 'soft', inDur: 0.5, out: 'drift' },
  /* 37 不由衷的痛有谁懂 */ { ...T.serifW, color: '#fff3d6', glow: 'rgba(60,30,0,0.35)', layout: 'h', y: 890, size: 76, in: 'soft', inDur: 0.6, out: 'fade', outDur: 0.8, emph: { 4: { color: C.hot, scale: 1.3 } } },
  /* 38 眼看着那缕胭脂红 */ { ...T.serifInk, layout: 'pos', size: 100, in: 'soft', out: 'drift', pos: [[250, 280], [250, 400], [250, 520], [1500, 300, 0.8], [1500, 400, 0.8], [1500, 620, 1.9], [1500, 830, 1.9], [1730, 720, 1.9]], emph: { 5: red(), 6: red(), 7: red() } },
  /* 39 玩笑一般地开在无人问津 */ { ...T.serifInk, layout: 'h', y: 880, size: 78, in: 'soft', inDur: 0.5, out: 'drift', outDur: 1.2, outStagger: 0.06, emph: each([7, 8, 9, 10], { color: '#7d7470' }) },
];

// chapter cards at the top of each section: [time, number, title, english]
const CHAPTERS = [
  [16.2, '01', '赶春的人', 'VERSE I'],
  [30.3, '02', '严冬', 'WINTER'],
  [47.4, '03', '一座房', 'PRE-CHORUS'],
  [63.3, '04', '死在春天里', 'SPRING'],
  [95.4, '05', '同床异梦', 'VERSE II'],
  [111.3, '06', '惊蛰 · 霜降', 'BRIDGE'],
  [144.3, '07', '无人问津', 'CODA'],
];

// opening credits over the prologue: [t0, t1, role, name, x, y, align]
const OPENING = [
  [2.6, 5.6, '演唱', '洛天依', 230, 470, 'left', false],
  [6.4, 7.85, '作词 · 作曲', '亚细亚旷世奇才', 230, 470, 'left', true],
  [8.4, 9.85, '调校 · 混音', 'Creuzer · 歪歪', 960, 860, 'center', true],
  [10.4, 11.85, '原版 MV 动画', '刚炮', 230, 470, 'left', true],
];

// one-frame flash inserts on chorus off-beats: [time, duration, slot]
const INSERTS = [];

// grade overlays (blend fills) per shot
export const GRADE = {
  cold: [['soft-light', 'rgba(60,110,255,0.35)']],
  night: [['multiply', 'rgba(70,90,160,0.3)'], ['soft-light', 'rgba(40,80,200,0.3)']],
  warm: [['soft-light', 'rgba(255,120,60,0.3)']],
  red: [['soft-light', 'rgba(255,40,30,0.35)']],
  gold: [['soft-light', 'rgba(255,190,90,0.4)']],
  dim: [['multiply', 'rgba(60,50,60,0.45)']],
  paper: [['soft-light', 'rgba(255,240,220,0.25)']],
};

export function applyGrade(g, list) {
  if (!list) return;
  for (const [mode, color] of list) {
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = mode;
    g.fillStyle = color;
    g.fillRect(0, 0, W, H);
    g.restore();
  }
}

export function buildStory(lyrics, env = {}) {
  const shots = [];
  const S = (t0, t1, slot, camFn, o = {}) => {
    const s = { t0, t1, slot, ...o };
    s.cam = camFn ?? o.cam ?? move.hold();
    s.p = (t) => clamp((t - s.t0) / (s.t1 - s.t0));
    if (typeof s.enter === 'string') s.enter = { type: s.enter };
    shots.push(s);
    return s;
  };
  const F = (t0, t1, draw, o = {}) => S(t0, t1, null, o.cam, { draw, ...o });

  const intensity = (t) => keys(LOOK.intensity, t);

  // --- particle systems -------------------------------------------------
  const snowIntro = snowfall({ seed: 1, t0: 1.5, t1: 16, rate: 45, wind: -30, bokeh: 0 });
  const petalsA = fallingPetals({ seed: 2, t0: 6, t1: 31, rate: 4, wind: 60, white: 0.3, size: [14, 26], zRange: [0.6, 2.2] });
  const snowWinter = snowfall({ seed: 3, t0: 30, t1: 47.5, rate: 110, wind: -90, bokeh: 0 });
  const snowPre = snowfall({ seed: 4, t0: 47, t1: 63, rate: 50, wind: -30, bokeh: 0 });
  const petalsRouge = fallingPetals({ seed: 12, t0: 55, t1: 59.5, rate: 14, wind: -50, deep: 0.3, size: [16, 30], zRange: [0.4, 2] });
  const petalsRed = fallingPetals({ seed: 5, t0: 62, t1: 80, rate: 9, wind: 90, deep: 0.6, size: [18, 36], zRange: [0.35, 1.8] });
  const sparks = embers({ seed: 6, t0: 71, t1: 80, rate: 60, x: [200, 1720], y: 1100 });
  const petalsV2 = fallingPetals({ seed: 7, t0: 94, t1: 111.5, rate: 5, wind: -40, white: 0.4, size: [14, 26], zRange: [0.7, 2.2] });
  const snowDial = snowfall({ seed: 13, t0: 117.2, t1: 119.5, rate: 150, wind: -60, bokeh: 0, preroll: 5 });
  const snowFinal = snowfall({ seed: 8, t0: 127, t1: 145, rate: 160, wind: -140, bokeh: 0 });
  const petalsCoda = fallingPetals({ seed: 10, t0: 150, t1: 162, rate: 7, wind: -70, white: 0.25, size: [16, 30], zRange: [0.5, 2] });
  const shed = shedPetals({ seed: 11, t0: 157.2, t1: 161, rate: 60, path: [[1900, 90], [1560, 260], [1220, 420], [900, 560]] });
  const bfly2 = new G.Butterflies(22, 40, { t0: 88.93, x: 960, y: 600, size: 44, speed: 1600, life: 3.5 });
  const bflySwarm = new G.Butterflies(24, 90, { t0: 89.2, x: 960, y: 560, size: 40, speed: 2600, life: 2.2, stagger: 0.3 });
  const bfly3 = new G.Butterflies(23, 46, { t0: 137.06, x: 960, y: 620, size: 46, speed: 1700, life: 3.5 });
  const burst1 = petalBurst({ seed: 31, t0: 141.06, x: 960, y: 480, count: 480, power: 1.8, size: [24, 56], z: [0.9, 1.4] });
  const burst2 = petalBurst({ seed: 32, t0: 141.81, x: 960, y: 460, count: 260, power: 1.3, white: 0.3, size: [20, 46] });
  const titleBurst = petalBurst({ seed: 34, t0: 93.06, x: 960, y: 560, count: 260, power: 1.3, white: 0.5, size: [18, 40] });

  // --- generative plum for the title and the ending -----------------------
  const plum = new PlumTree({ seed: 21, root: { x: 2010, y: 1180 }, angle: -2.62, width: 50, tip: 6, length: 1700, speed: 900, start: 12.05, depthMax: 3, budRate: 0.24, whipRate: 0.2 });
  plum.assignBlooms(events('kicks', 12.4, 15.6, 0.5).map((e) => e[0]), 4);
  plum.bloomRest(13.5, 15.5, 1, 6);
  const plumEnd = new PlumTree({ seed: 33, root: { x: -90, y: 1200 }, angle: -0.6, width: 46, tip: 5, length: 1500, speed: 700, start: 161.2, depthMax: 3, budRate: 0.22, whipRate: 0.2 });
  plumEnd.bloomRest(162.5, 166.5, 1, 9);

  // particles ride the continuous camera, so snow and petals carry across cuts
  const fall = (field, o = {}) => (g, t, cam, P, gcam) => field.draw(g, t, { cam: gcam, ...o });

  // ================================================================ PROLOGUE
  // The heroine only appears where she is the "I" of the lyric; everything
  // else is told with places and objects.  Cameras are slow pushes.
  F(0, BAR(1), (g, t, cam) => introThread(g, t, cam), { cam: move.push() });
  S(BAR(1), BAR(3), '01', move.push(), { grade: GRADE.night, enter: { type: 'ink', x: 1700, y: 540 }, over: fall(snowIntro) });
  S(BAR(3), BAR(4), '02', move.pull(), { enter: { type: 'light', x: 1300, y: 400 }, over: fall(petalsA, { alpha: 0.8 }) });
  S(BAR(4), BAR(5), '58', move.push(), { enter: { type: 'soft' }, over: fall(petalsA, { alpha: 0.6 }) });
  S(BAR(5), BAR(6), '59', move.push(), { enter: { type: 'thread' }, over: fall(snowIntro, { alpha: 0.7 }) });
  F(BAR(6), 15.8, (g, t, cam) => titleCard(g, t, cam, plum), { enter: { type: 'brush' }, cam: move.push() });

  // ================================================================ VERSE 1
  S(15.8, BAR(9) - 0.05, '60', move.push(), { grade: GRADE.cold, enter: { type: 'bars' }, over: fall(snowIntro, { alpha: 0.6 }) });
  S(BAR(9) - 0.05, 19.8, '35', move.push(), { enter: { type: 'focus', x: 960, y: 420 } });
  S(19.8, 22.8, '07', move.push(), { enter: { type: 'soft' } });
  S(22.8, 25.05, '08', move.push(), { enter: { type: 'paper' } });
  S(25.05, 26.55, '61', move.push(), { enter: { type: 'focus', x: 1050, y: 540 } });
  S(26.55, 30.0, '62', move.pull(), { enter: { type: 'soft' } });

  // ================================================================ WINTER
  S(30.0, BAR(16), '11', move.push(), { grade: GRADE.cold, enter: { type: 'light', color: '220,236,255' }, over: fall(snowWinter) });
  S(BAR(16), 35.05, '36', move.push(), { grade: GRADE.cold, enter: { type: 'soft' }, over: fall(snowWinter) });
  F(35.05, 38.3, (g, t, cam) => { paleSun(g, t, cam); snowWinter.draw(g, t, { cam }); }, { enter: 'dissolve', cam: move.push() });
  S(38.3, 41.05, '12', move.push(), { grade: GRADE.night, enter: { type: 'paper', dir: -1 }, over: fall(snowWinter) });
  S(41.05, 43.05, '37', move.push(), { grade: GRADE.night, enter: { type: 'soft' }, over: fall(snowWinter) });
  S(43.05, 47.05, '13', move.push(), {
    grade: GRADE.dim,
    enter: { type: 'ink', x: 760, y: 600 },
    over: (g, t, cam, P, gcam) => {
      // 伤人情: red ink bleeds through the picture on the words
      redBloom(g, t, env.fx);
      snowWinter.draw(g, t, { cam: gcam, alpha: 0.5 });
    },
  });

  // ================================================================ PRE-CHORUS
  S(47.05, 51.05, '38', move.push(), { grade: GRADE.warm, enter: { type: 'light', x: 960, y: 420, color: '255,200,140' }, over: fall(snowPre) });
  S(51.05, 53.05, '63', move.push(), { enter: { type: 'soft' } });
  S(53.05, 55.05, '64', move.pull(), { enter: { type: 'focus' }, over: fall(snowPre, { alpha: 0.6 }) });
  F(55.05, 59.05, (g, t, cam) => silverRouge(g, t, cam, petalsRouge), { enter: { type: 'brush', dir: -1 }, cam: move.push(), bright: true });
  S(59.05, 61.05, '15', move.push(), { grade: GRADE.paper, enter: { type: 'soft' } });
  S(61.05, 62.93, '40', move.push(), { grade: GRADE.paper, enter: { type: 'focus' } });

  // ================================================================ SPRING
  S(62.93, 67.06, '41', move.push(), { grade: GRADE.red, enter: 'drop', over: fall(petalsRed) });
  S(67.06, 69.06, '17', move.push(), { enter: { type: 'bars' }, over: fall(petalsRed) });
  S(69.06, 71.06, '66', move.pull(), { enter: { type: 'soft' }, over: fall(petalsRed, { alpha: 0.7 }) });
  S(71.06, 73.31, '67', move.push(), { enter: { type: 'paper' } });
  S(73.31, 75.06, '68', move.push(), { enter: { type: 'focus' } });
  S(75.06, 77.06, '46', move.push(), { grade: GRADE.red, enter: { type: 'light', color: '255,140,110' }, over: fall(petalsRed, { alpha: 0.6 }) });
  // build-up into the drop: a cut on every beat, then every eighth
  const montage = ['62', '55', '61', '17', '66', '01', '47'];
  const cuts = [77.06, 77.56, 78.06, 78.56, 79.06, 79.31, 79.56];
  cuts.forEach((c, i) => S(c, cuts[i + 1] ?? 79.81, montage[i], move.push()));

  // ================================================================ CHORUS 1
  S(79.81, 81.06, '60', move.pull(), { grade: GRADE.cold, enter: 'drop' });
  S(81.06, 82.31, '06', move.push(), { enter: { type: 'focus' } });
  S(82.31, 83.81, '48', move.push(), { enter: { type: 'bars' } });
  S(83.81, 86.81, '70', move.push(), { enter: { type: 'soft' }, over: fall(petalsV2, { alpha: 0.6 }) });
  S(86.81, 89.31, '08', move.push(), { enter: { type: 'paper' }, over: (g, t, cam, P, gcam) => { layer(g, cam, D.front); bfly2.draw(g, t); } });
  F(89.31, 90.43, (g, t, cam) => swarm(g, t, cam, bflySwarm), { enter: { type: 'light', color: '200,220,255' }, cam: move.push(), bright: true });
  S(90.43, 93.06, '62', move.push(), { enter: { type: 'iris', x: 760, y: 540 } });
  F(93.06, 95.06, (g, t, cam) => titleDrop(g, t, cam, 93.06, lyrics[21], titleBurst), { enter: 'drop', cam: move.pull() });

  // ================================================================ VERSE 2
  S(95.06, 97.06, '20', move.push(), { grade: GRADE.paper, enter: { type: 'light' }, over: fall(petalsV2) });
  S(97.06, 99.06, '50', move.push(), { grade: GRADE.paper, enter: { type: 'soft' }, over: fall(petalsV2) });
  S(99.06, 101.06, '71', move.push(), { enter: { type: 'ink', x: 960, y: 480 } });
  S(101.06, 103.06, '72', move.push(), { enter: { type: 'paper' } });
  S(103.06, 105.06, '22', move.push(), { grade: GRADE.warm, enter: { type: 'soft' } });
  S(105.06, 107.06, '73', move.push(), { grade: GRADE.warm, enter: { type: 'focus' } });
  F(107.06, 110.93, (g, t, cam, P) => mirrorDream(g, t, cam, P['22']), { uses: ['22'], enter: { type: 'soft' }, cam: move.push() });

  // ================================================================ BRIDGE
  S(110.93, BAR(56) + 1, '74', move.push(), { grade: GRADE.red, enter: 'drop' });
  S(BAR(56) + 1, 115.06, '75', move.push(), { enter: { type: 'focus' } });
  F(115.06, 118.93, (g, t, cam) => { dialPiece(g, t, cam); snowDial.draw(g, t, { cam, alpha: span(t, 117.2, 117.7) }); }, { enter: { type: 'light', color: '210,255,230' }, cam: move.push() });
  S(118.93, 121.06, '53', move.push(), { enter: { type: 'paper' } });
  S(121.06, 123.06, '76', move.push(), { enter: { type: 'soft' } });
  S(123.06, 125.06, '77', move.push(), { enter: { type: 'bars' } });
  S(125.06, 127.81, '78', move.pull(), { grade: GRADE.dim, enter: { type: 'soft' } });

  // ================================================================ FINAL CHORUS
  S(127.81, 129.81, '54', move.push(), { grade: GRADE.night, enter: 'drop', over: fall(snowFinal) });
  S(129.81, 131.81, '28', move.push(), { grade: GRADE.night, enter: { type: 'focus' }, over: fall(snowFinal) });
  S(131.81, 134.81, '07', move.pull(), { grade: GRADE.night, enter: { type: 'paper' }, over: fall(snowFinal) });
  S(134.81, 137.06, '55', move.push(), { grade: GRADE.night, enter: { type: 'brush' }, over: fall(snowFinal) });
  S(137.06, 138.56, '08', move.push(), { grade: GRADE.night, enter: { type: 'soft' }, over: (g, t, cam, P, gcam) => { snowFinal.draw(g, t, { cam: gcam }); layer(g, cam, D.front); bfly3.draw(g, t); } });
  S(138.56, 141.06, '56', move.push(), { grade: GRADE.night, enter: { type: 'soft' }, over: fall(snowFinal) });
  S(141.06, 143.93, '29', move.push(), {
    grade: GRADE.night,
    enter: 'drop',
    over: (g, t, cam, P, gcam) => {
      snowFinal.draw(g, t, { cam: gcam });
      burst1.draw(g, t, { cam: gcam });
      burst2.draw(g, t, { cam: gcam });
    },
  });

  // ================================================================ CODA
  S(143.93, 146.56, '80', move.push(), { enter: { type: 'light', color: '255,230,190' }, over: (g, t, cam, P, gcam) => { burst1.draw(g, t, { cam: gcam, alpha: 0.6 }); petalsCoda.draw(g, t, { cam: gcam }); } });
  S(146.56, 149.06, '31', move.pull(), { grade: GRADE.gold, enter: { type: 'light', color: '255,236,200', x: 960, y: 300 } });
  S(149.06, 151.06, '57', move.push(), { grade: GRADE.gold, enter: { type: 'soft' } });
  S(151.06, 154.31, '32', move.push(), { enter: { type: 'ink', x: 820, y: 540 }, over: fall(petalsCoda) });
  S(154.31, 157.06, '81', move.push(), { enter: { type: 'soft' }, over: fall(petalsCoda) });
  S(157.06, 161.0, '34', move.push(), { enter: { type: 'ink', x: 1500, y: 800 }, over: (g, t, cam, P, gcam) => { shed.draw(g, t, { cam: gcam }); petalsCoda.draw(g, t, { cam: gcam, alpha: 0.6 }); } });
  F(161.0, DURATION, (g, t, cam) => endCard(g, t, cam, plumEnd), { enter: 'fade', cam: move.push() });

  // ------------------------------------------------------ wiring --
  shots.sort((a, b) => a.t0 - b.t0);
  shots.forEach((s, i) => {
    s.index = i;
    s.prev = shots[i - 1] ?? null;
    s.next = shots[i + 1] ?? null;
    s.slots = s.slot ? [s.slot] : s.split ? [s.split.left, s.split.right] : s.uses ?? [];
  });

  const impacts = shots.filter((s) => s.enter?.type === 'drop').map((s) => [s.t0, 26, 0.2]);
  const globalCam = makeGlobalCam({ intensity, impacts });

  const indexAt = (t) => {
    let lo = 0;
    let hi = shots.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (shots[mid].t0 <= t) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  };

  // cover scale per shot: the card must hide its edges for every camera
  // state the shot goes through (shot move + hand-held + punch-ins)
  const coverOf = (s, d) => {
    s.cover ??= {};
    if (s.cover[d]) return s.cover[d];
    let need = 1;
    for (let t = s.t0; t <= s.t1 + 1e-6; t += 1 / 60) {
      const c = plus(globalCam(t), s.cam(t, s));
      need = Math.max(need, coverNeed(c, d), coverNeed(c, d * 0.8));
    }
    return (s.cover[d] = need * 1.015);
  };

  return {
    duration: DURATION,
    shots,
    indexAt,
    globalCam,
    coverOf,
    lyricStyles: LYRICS,
    chapters: CHAPTERS,
    opening: OPENING,
    inserts: INSERTS,
    intensity,
    // the picture slots each shot shows, with times (for PROMPTS.md)
    slotUses() {
      const uses = {};
      for (const s of shots) for (const id of s.slots) (uses[id] ??= []).push([s.t0, s.t1]);
      for (const [t0, d, id] of INSERTS) (uses[id] ??= []).push([t0, t0 + d]);
      return uses;
    },
  };
}

// ------------------------------------------------------- set pieces ----
function fillV(g, top, bottom) {
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  const grd = g.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, top);
  grd.addColorStop(1, bottom);
  g.fillStyle = grd;
  g.fillRect(0, 0, W, H);
  g.restore();
}

function redThread(g, t, x0, y0, x1, y1) {
  g.save();
  g.strokeStyle = '#ff3b30';
  g.lineWidth = 3;
  g.shadowColor = 'rgba(255,40,30,0.3)';
  g.shadowBlur = 16;
  g.beginPath();
  g.moveTo(x0, y0);
  g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 30 * Math.sin(t * 1.3), x1, y1);
  g.stroke();
  g.restore();
}

function introThread(g, t, cam) {
  fillV(g, '#040304', '#0b0809');
  layer(g, cam, D.text);
  // the red thread pulled across the dark, a ring on every kick
  const p = span(t, 0.06, 1.9, ease.inOutCubic);
  redThread(g, t, -40, 540, lerp(-40, W + 40, p), 540 + 6 * Math.sin(t * 2));
}

function titleCard(g, t, cam, plum) {
  fillV(g, '#070506', '#100b0c');
  layer(g, cam, D.image);
  g.globalAlpha = 0.85;
  plum.draw(g, t, { inverse: true });
  g.globalAlpha = 1;
  layer(g, cam, D.text);
  const times = [12.07, 12.56, 13.34];
  ['花', '骨', '朵'].forEach((ch, i) => {
    const p = span(t, times[i], times[i] + 0.45);
    if (p <= 0) return;
    G.inkSplash(g, 960 + (i - 1) * 300, 470, 120, span(t, times[i], times[i] + 0.25), { color: '#b3121b', seed: 7 + i, alpha: 0.85 });
    inkChar(g, ch, 960 + (i - 1) * 300, 460, 300, p, { color: '#ffffff', weight: 900, bleed: 0.3, seed: 30 + i, family: FONTS.brush });
  });
  g.font = font(30, 500, LATIN);
  horizontalLayout(g, 'HUA GU DUO', 960, 700, 30, 0.9).forEach((c, i) => softChar(g, c.ch, c.x, c.y, 30, span(t, 14.06 + i * 0.03, 14.5 + i * 0.03), { color: '#ff8a7a', family: LATIN, weight: 500 }));
  g.font = font(26, 500, FONTS.sans);
  horizontalLayout(g, '洛天依 原创曲', 960, 240, 26, 0.6).forEach((c, i) => softChar(g, c.ch, c.x, c.y, 26, span(t, 13.6 + i * 0.04, 14.1 + i * 0.04), { color: '#ffffff', family: FONTS.sans, weight: 500 }));
}

// distant ridges at three depths, so the camera move shows parallax
function ridges(g, cam, cols, base = 600) {
  [[4200, base, 110, cols[0]], [3200, base + 130, 150, cols[1]], [2300, base + 270, 190, cols[2]]].forEach(([d, y0, amp, col], i) => {
    layer(g, cam, d);
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(-900, H + 700);
    for (let x = -900; x <= W + 900; x += 16) g.lineTo(x, y0 - amp * (0.5 + 0.5 * fbm1(x * 0.0021 + i * 7.3, 50 + i, 4)));
    g.lineTo(W + 900, H + 700);
    g.closePath();
    g.fill();
  });
}

function paleSun(g, t, cam) {
  // the sun tries to rise and sinks back: 日不升
  fillV(g, '#0d1426', '#5b6c88');
  const rise = span(t, 35.3, 37.3, ease.outCubic);
  const fall = span(t, 37.6, 38.3, ease.inCubic);
  layer(g, cam, 5200);
  G.sunMoon(g, 960, 760 - 260 * rise + 560 * fall, 70, 0, { alpha: 0.8 * (1 - fall) });
  ridges(g, cam, ['#3a4762', '#27324a', '#151c2e'], 660);
}

function silverRouge(g, t, cam, petals) {
  // 银装素裹 in ink on snow-white paper, then a wet red stroke for 胭脂妆
  fillV(g, '#f6f3ed', '#e2dcd0');
  ridges(g, cam, ['rgba(120,128,140,0.18)', 'rgba(100,108,122,0.22)', 'rgba(70,76,90,0.2)'], 700);
  layer(g, cam, D.back);
  G.brushSwipe(g, 980, 300, 1900, 820, 360, span(t, 57.25, 57.7), { seed: 4 });
  petals.draw(g, t, { cam });
}

let redSheet = null;
function redBloom(g, t, fx) {
  const p = 0.6 * span(t, 45.05, 46.9, ease.outCubic) + 0.05 * span(t, 45.3, 45.45) + 0.05 * span(t, 45.8, 45.95);
  if (p <= 0 || !fx) return;
  if (!redSheet) {
    redSheet = makeCanvas(W, H);
    const x = redSheet.getContext('2d');
    x.fillStyle = '#9c0b17';
    x.fillRect(0, 0, W, H);
  }
  const mask = fx.inkMask(p, 0.4, 0.58, { rough: 0.75, soft: 0.14, fine: 0.3 });
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'color';
  g.globalAlpha = 0.85;
  fx.masked(g, redSheet, mask);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 0.4;
  fx.masked(g, redSheet, mask);
  g.restore();
}

function swarm(g, t, cam, flies) {
  fillV(g, '#f5f2ec', '#e3ddd2');
  layer(g, cam, D.back);
  
  layer(g, cam, D.front);
  flies.draw(g, t);
}

/** Split screen: two slots side by side, divider at div(t). */
export function drawSplit(g, shot, t, cam, P, cover) {
  const x = shot.split.div(t);
  drawCard(g, P[shot.split.left], cam, D.image, cover * 1.12, { anchor: [W / 4, H / 2], clip: [0, 0, x, H], t });
  drawCard(g, P[shot.split.right], cam, D.image, cover * 1.12, { anchor: [(3 * W) / 4, H / 2], clip: [x, 0, W - x, H], t });
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = '#ffffff';
  g.fillRect(x - 2, 0, 4, H);
}

function titleDrop(g, t, cam, t0, line, burst) {
  fillV(g, '#060506', '#0c0809');
  layer(g, cam, D.back);
  drawBlossom(g, 960, 600, 150 * (0.8 + 0.2 * ease.outBack(span(t, t0, t0 + 0.8))), 0.4, span(t, t0, t0 + 1.0), BLOSSOM_WHITE, 0.37, 1);
  layer(g, cam, D.text);
  line.chars.slice(7).forEach(([ch, ct], i) => {
    const p = span(t, ct - 0.03, ct + 0.25);
    if (p <= 0) return;
    const s = lerp(2.4, 1, ease.outExpo(p));
    g.save();
    g.translate(960 + (i - 1) * 330, 300);
    g.scale(s, s);
    g.globalAlpha = clamp(p * 3);
    g.font = font(300, 400, FONTS.brush);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = '#e8121e';
    g.fillText(ch, 0, 0);
    g.restore();
    
  });
  g.font = font(26, 500, LATIN);
  horizontalLayout(g, 'HUA  GU  DUO', 960, 500, 26, 1.2).forEach((c, i) => softChar(g, c.ch, c.x, c.y, 26, span(t, 94.0 + i * 0.03, 94.4 + i * 0.03), { color: '#ff9a8a', family: LATIN, weight: 500 }));
  burst.draw(g, t, { cam });
}

let mirrorTmp = null;
function mirrorDream(g, t, cam, slot) {
  // 同床异梦: the same room reflected upside down and tinted another colour
  drawCard(g, slot, cam, D.image, 1.12, { anchor: [W / 2, H * 0.25], t });
  mirrorTmp ??= makeCanvas(W, H / 2);
  const m = mirrorTmp.getContext('2d');
  m.drawImage(g.canvas, 0, 0, W, H / 2, 0, 0, W, H / 2);
  g.save();
  g.setTransform(1, 0, 0, -1, 0, H);
  g.drawImage(mirrorTmp, 0, 0);
  g.restore();
  g.save();
  g.beginPath();
  g.rect(0, H / 2, W, H / 2);
  g.clip();
  applyGrade(g, [['color', 'rgba(90,60,255,0.45)']]);
  g.restore();
  g.fillStyle = 'rgba(255,255,255,0.85)';
  g.fillRect(0, H / 2 - 1, W, 2);
}

function dialPiece(g, t, cam) {
  // 惊蛰 (thunder wakes the insects) turning to 霜降 (first frost)
  const frost = span(t, 116.9, 117.4, ease.inOutSine);
  fillV(g, frost < 1 ? '#081410' : '#070b16', frost < 1 ? '#1d3a2a' : '#22324e');
  if (frost > 0 && frost < 1) {
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = frost;
    fillV(g, '#070b16', '#22324e');
    g.restore();
  }
  ridges(g, cam, ['rgba(40,70,60,0.5)', 'rgba(25,45,40,0.7)', 'rgba(12,22,20,0.9)'], 760);
  layer(g, cam, D.back);
  const idx = lerp(2, 17, ease.inOutCubic(span(t, 115.5, 117.81)));
  G.solarDial(g, 960, 1080 + 120, 860, idx, { hi: t < 117 ? [2] : [17] });
  // thunder on 惊
  const bolt = Math.exp(-Math.max(0, t - 116.06) / 0.06) * (t >= 116.06 ? 1 : 0);
  if (bolt > 0.02) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = `rgba(220,255,235,${0.6 * bolt})`;
    g.fillRect(0, 0, W, H);
  }
  // frost creeping in from the edges on 霜
  const ice = span(t, 117.31, 118.4, ease.outCubic);
  if (ice > 0) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    const grd = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62);
    grd.addColorStop(0, 'rgba(220,240,255,0)');
    grd.addColorStop(1, `rgba(220,240,255,${0.55 * ice})`);
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);
  }
}

function endCard(g, t, cam, plum) {
  fillV(g, '#060506', '#0c090a');
  const fade = 1 - span(t, 169.4, 170.3);
  layer(g, cam, D.image);
  g.globalAlpha = 0.35 * fade;
  plum.draw(g, t, { inverse: true });
  g.globalAlpha = fade;
  layer(g, cam, D.text);
  ['花', '骨', '朵'].forEach((ch, i) => inkChar(g, ch, 960 + (i - 1) * 190, 380, 170, span(t, 161.3 + i * 0.25, 162.0 + i * 0.25), { color: '#d4121c', weight: 900, bleed: 0.5, seed: 60 + i, family: FONTS.brush }));
  g.font = font(24, 500, LATIN);
  horizontalLayout(g, 'HUA GU DUO', 960, 500, 24, 0.9).forEach((c, i) => softChar(g, c.ch, c.x, c.y, 24, span(t, 162.4 + i * 0.02, 162.9 + i * 0.02), { color: '#d8b2aa', family: LATIN, weight: 500 }));
  const credits = [['演唱', '洛天依'], ['作词 · 作曲', '亚细亚旷世奇才'], ['调校', 'Creuzer'], ['混音', '歪歪'], ['原版MV动画', '刚炮'], ['特别感谢', 'AA']];
  credits.forEach(([role, name], i) => {
    const x = 960 + (i - 2.5) * 280;
    const p = span(t, 163.0 + i * 0.15, 163.7 + i * 0.15);
    softChar(g, role, x, 660, 19, p, { color: '#9b8f8c', family: FONTS.sans, weight: 400, rise: 8 });
    const latin = /^[A-Za-z]/.test(name);
    softChar(g, name, x, 698, latin ? 34 : 30, p, { color: '#f2ece7', family: latin ? LATIN : FONTS.serif, weight: latin ? 500 : 700, rise: 8 });
  });
  softChar(g, '动态 PV · 重制版', 960, 860, 20, span(t, 164.6, 165.3), { color: '#e2574a', family: FONTS.sans, weight: 500 });
  g.globalAlpha = 1;
}

/** Opening credit lockup: small role line over a serif name. */
export function drawCredit(g, t, [t0, t1, role, name, x, y, align, dark]) {
  if (t < t0 - 0.05 || t > t1 + 0.6) return;
  const pin = ease.outExpo(clamp((t - t0) / 0.6));
  const pout = ease.inCubic(clamp((t - t1) / 0.5));
  const a = pin * (1 - pout);
  if (a <= 0.003) return;
  g.save();
  g.globalAlpha = a;
  g.textAlign = align;
  g.textBaseline = 'alphabetic';
  const ink = dark ? '30,24,24' : '255,255,255';
  g.shadowColor = dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)';
  g.shadowBlur = 14;
  g.font = font(20, 500, FONTS.sans);
  g.letterSpacing = '6px';
  g.fillStyle = `rgba(${ink},0.75)`;
  g.fillText(role, x, y - 58 + 10 * (1 - pin));
  g.letterSpacing = '4px';
  const latin = /^[A-Za-z]/.test(name);
  g.font = font(latin ? 60 : 54, latin ? 500 : 700, latin ? LATIN : FONTS.serif);
  g.fillStyle = `rgb(${ink})`;
  g.fillText(name, x, y + 16 * (1 - pin));
  // red rule drawing out under the name
  const w = 260 * ease.outExpo(clamp((t - t0 - 0.15) / 0.7));
  g.fillStyle = '#e2483a';
  const rx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  g.fillRect(rx, y + 26, w, 3);
  g.restore();
}
