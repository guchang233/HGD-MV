// 《花骨朵》PV — full-song storyboard.
//
// The whole song (170.4 s, 120 BPM, downbeats at 0.055 + 2n) plays
// untouched.  Every lyric syllable is forced-aligned (assets/lyrics.json);
// drum hits come from the drum stem (assets/timing.json).  Shots are AI
// plates (assets/plates) re-drawn from the MV's key moments or generated
// for lyrics the MV never shows, animated as 2.5D parallax.
import { W, H, TAU, clamp, ease, lerp, span, noise1, mulberry32 } from './core.js';
import { events } from './timing.js';
import { drawPlate } from './plates.js';
import { FONTS } from './lyrics.js';
import { PlumTree, drawBlossom, BLOSSOM_WHITE } from './plum.js';
import { fallingPetals, petalBurst, snowfall, embers, motes, shedPetals } from './particles.js';
import { inkChar, softChar, font, horizontalLayout, LATIN } from './type.js';
import * as G from './graphics.js';

export const DURATION = 170.4;
const BAR = (n) => 0.055 + n * 2; // downbeat of bar n

// ------------------------------------------------------------ palette --
const C = {
  ink: '#151214',
  white: '#ffffff',
  red: '#e2483a',
  hot: '#ff3b30',
  crimson: '#b3121b',
  ice: '#d8ecff',
  gold: '#ffd88a',
  green: '#7fd6a0',
};
const DARK_GLOW = 'rgba(0,0,0,0.85)';
const LIGHT_GLOW = 'rgba(255,255,255,0.9)';

// typographic presets (merged into each line's style)
const T = {
  serifW: { font: 'serif', weight: 800, color: C.white, glow: DARK_GLOW, glowBlur: 26 },
  serifInk: { font: 'serif', weight: 800, color: C.ink, glow: LIGHT_GLOW, glowBlur: 24 },
  sansW: { font: 'sans', weight: 900, color: C.white, glow: DARK_GLOW, glowBlur: 22 },
  sansInk: { font: 'sans', weight: 900, color: C.ink, glow: LIGHT_GLOW, glowBlur: 20 },
  brushRed: { font: 'brush', weight: 400, color: C.hot, glow: 'rgba(60,0,0,0.9)', glowBlur: 26, stroke: 'rgba(28,0,0,0.9)', strokeW: 7 },
  brushW: { font: 'brush', weight: 400, color: C.white, glow: DARK_GLOW, glowBlur: 26 },
  brushInk: { font: 'brush', weight: 400, color: C.ink, glow: LIGHT_GLOW, glowBlur: 24 },
  cursiveRed: { font: 'cursive', weight: 400, color: C.hot, glow: 'rgba(40,0,0,0.85)', glowBlur: 20 },
};
const red = (scale = 1, extra = {}) => ({ ...T.brushRed, scale, ...extra });

// ---------------------------------------------------- lyric typography --
// One entry per line of assets/lyrics.json (same order).
const LYRICS = [
  /* 0 健忘的症状 */ { ...T.serifInk, layout: 'v', x: 1560, y: 170, size: 118, in: 'stamp', out: 'blow' },
  /* 1 这种赶春的人 */ { ...T.sansInk, layout: 'h', y: 900, size: 92, in: 'drop', out: 'blow', emph: { 3: red(1.5, { dy: -10 }) } },
  /* 2 该向左或向右 */ { ...T.sansW, layout: 'pos', size: 150, in: 'slide', out: 'zoom', pos: [[960, 170, 0.6], [520, 540], [520, 720, 1.4], [960, 540, 0.5], [1400, 540], [1400, 720, 1.4]], emph: { 1: { dir: 1 }, 2: { ...T.brushRed, dir: 1 }, 4: { dir: -1 }, 5: { ...T.brushRed, dir: -1 } } },
  /* 3 你看我这手里的胭脂虫 */ { ...T.serifInk, layout: 'pos', size: 64, in: 'type', out: 'shatter', pos: [[200, 230], [270, 230], [340, 230], [410, 230], [480, 230], [550, 230], [620, 230], [1210, 560, 4.2], [1500, 560, 4.2], [1790, 560, 4.2]], emph: { 7: { ...T.brushRed, in: 'stamp' }, 8: { ...T.brushRed, in: 'stamp' }, 9: { ...T.brushRed, in: 'stamp' } } },
  /* 4 像不像那晚春的花骨朵 */ { ...T.serifInk, layout: 'pos', size: 120, in: 'stamp', out: 'drift', pos: [[230, 300], [230, 430, 0.8], [230, 560], [700, 880, 0.6], [790, 880, 0.6], [880, 880, 0.6], [970, 880, 0.6], [1260, 300, 1.9], [1500, 300, 1.9], [1740, 300, 1.9]], emph: { 1: { color: C.red }, 7: red(), 8: red(), 9: red() } },
  /* 5 去年的严冬太寒冷 */ { ...T.serifW, color: C.ice, glow: 'rgba(0,20,60,0.9)', layout: 'v', x: 1700, y: 120, size: 96, breaks: [5], in: 'freeze', inDur: 0.6, out: 'fade', outDur: 0.6, emph: { 6: { scale: 1.6, color: '#ffffff' }, 7: { scale: 1.6, color: '#ffffff' } } },
  /* 6 天寒地冻日不升 */ { ...T.serifW, color: C.ice, glow: 'rgba(0,20,60,0.9)', layout: 'pos', size: 190, in: 'freeze', inDur: 0.5, out: 'shatter', pos: [[300, 300], [520, 300], [300, 520], [520, 520], [1500, 820, 0.45], [1590, 820, 0.45], [1680, 820, 0.45]] },
  /* 7 去年的街道太冷清 */ { ...T.serifW, color: C.ice, glow: 'rgba(0,10,40,0.9)', layout: 'pos', size: 80, in: 'soft', inDur: 0.5, out: 'drift', pos: [[300, 820, 0.7], [420, 780, 0.8], [560, 735, 0.9], [740, 680, 1.05], [960, 620, 1.2], [1220, 550, 1.4], [1500, 470, 1.6], [1800, 380, 1.85]] },
  /* 8 空巷孤影它伤人情 */ { ...T.serifInk, layout: 'pos', size: 140, in: 'soft', inDur: 0.45, out: 'fade', outAt: 46.75, pos: [[260, 260], [260, 420], [1660, 260], [1660, 420], [960, 760, 0.45], [1180, 830, 1.1], [1340, 830, 1.1], [1500, 830, 1.1]], emph: { 5: red(1.1), 6: red(1.1), 7: red(1.1) } },
  /* 9 我想要一座房 */ { ...T.serifW, layout: 'pos', size: 70, in: 'rise', out: 'zoom', pos: [[820, 200], [900, 200], [980, 200], [760, 900, 2.0], [960, 900, 2.0], [1160, 900, 2.0]] },
  /* 10 把我爱的人往里头装 */ { ...T.serifW, layout: 'h', y: 940, size: 76, in: 'scatter', inDur: 0.45, out: 'blow', emph: { 2: red(1.4) } },
  /* 11 银装素裹胭脂妆 */ { ...T.serifW, layout: 'pos', size: 120, in: 'soft', out: 'blow', pos: [[300, 280], [300, 420], [300, 560], [300, 700], [1180, 560, 1.7], [1420, 560, 1.7], [1660, 560, 1.7]], emph: { 4: { ...T.brushW }, 5: { ...T.brushW }, 6: { ...T.brushW } } },
  /* 12 花想容貌云想衣裳 */ { font: 'latin', weight: 500, color: C.white, glow: DARK_GLOW, glowBlur: 24, layout: 'pos', size: 110, in: 'soft', inDur: 0.5, out: 'drift', pos: [[300, 300], [300, 440], [300, 580], [300, 720], [1620, 300], [1620, 440], [1620, 580], [1620, 720]], emph: Object.fromEntries([0, 1, 2, 3, 4, 5, 6, 7].map((i) => [i, { font: 'serif', weight: 600 }])) },
  /* 13 我想要死在春天里 */ { ...T.sansW, layout: 'pos', size: 84, in: 'stamp', out: 'glitch', pos: [[240, 220], [340, 220], [440, 220], [960, 540, 5.0], [1480, 880], [1580, 880], [1680, 880], [1780, 880]], emph: { 3: { font: 'brush', weight: 400, color: '#0b0606', glow: 'rgba(255,60,40,0.95)', glowBlur: 40, in: 'zoom', inDur: 0.35 } } },
  /* 14 红花作衣绿地作席 */ { ...T.brushRed, layout: 'pos', size: 190, in: 'stamp', out: 'slash', pos: [[300, 330], [520, 330], [740, 330], [960, 330], [960, 760], [1180, 760], [1400, 760], [1620, 760]], emph: { 4: { color: C.green, glow: 'rgba(0,40,10,0.9)' }, 5: { color: C.green, glow: 'rgba(0,40,10,0.9)' }, 6: { color: C.green, glow: 'rgba(0,40,10,0.9)' }, 7: { color: C.green, glow: 'rgba(0,40,10,0.9)' } } },
  /* 15 野蛮生长在春泥 */ { ...T.brushW, layout: 'pos', size: 120, in: 'grow', inDur: 0.4, out: 'shatter', pos: [[560, 420, 3.2], [1360, 420, 3.2], [520, 880, 1.2], [700, 880, 1.2], [1260, 880, 0.9], [1400, 880, 0.9], [1540, 880, 0.9]], emph: { 0: { ...T.brushRed, in: 'stamp' }, 1: { ...T.brushRed, in: 'stamp' } } },
  /* 16 养万物生我饲衣鱼 */ { ...T.serifW, layout: 'grid', cols: 4, x: 960, y: 520, size: 150, in: 'flip', out: 'shatter', emph: { 4: { color: C.red }, 5: { color: C.red }, 6: { color: C.red }, 7: { color: C.red } } },
  /* 17 健忘的症状 (chorus 1) */ { ...T.sansW, layout: 'h', y: 540, size: 250, track: 0.02, in: 'zoom', inDur: 0.22, out: 'cut', echo: true },
  /* 18 这种赶春的人 */ { ...T.serifW, layout: 'v', x: 360, y: 120, size: 132, in: 'flip', out: 'blow', emph: { 3: red(1.3) } },
  /* 19 该向左或向右 */ { ...T.sansW, layout: 'pos', size: 180, in: 'slide', out: 'glitch', pos: [[960, 140, 0.5], [480, 520], [480, 760, 1.3], [960, 540, 0.5], [1440, 520], [1440, 760, 1.3]], emph: { 1: { dir: 1 }, 2: { ...T.brushRed, dir: 1 }, 4: { dir: -1 }, 5: { ...T.brushRed, dir: -1 } } },
  /* 20 你看我这手里的胭脂虫 */ { ...T.sansW, layout: 'pos', size: 70, in: 'type', out: 'shatter', pos: [[180, 160], [260, 160], [340, 160], [420, 160], [500, 160], [580, 160], [660, 160], [560, 620, 4.6], [960, 620, 4.6], [1360, 620, 4.6]], emph: { 7: { ...T.brushRed, in: 'stamp' }, 8: { ...T.brushRed, in: 'stamp' }, 9: { ...T.brushRed, in: 'stamp' } } },
  /* 21 像不像那晚春的花骨朵 */ { ...T.serifW, layout: 'pos', size: 130, in: 'stamp', out: 'cut', outAt: 93.0, pos: [[300, 300], [300, 440, 0.8], [300, 580], [1500, 300, 0.7], [1500, 400, 0.7], [1500, 500, 0.7], [1500, 600, 0.7], [-999, -999], [-999, -999], [-999, -999]] },
  /* 22 我不想被你遗忘 */ { ...T.serifInk, layout: 'v', x: 1650, y: 190, size: 100, in: 'soft', inDur: 0.6, out: 'drift', outDur: 1.2, emph: { 5: { color: '#8a8380' }, 6: { color: '#b9b2ae' } } },
  /* 23 哪怕看清了这副皮囊 */ { ...T.serifInk, layout: 'h', y: 900, size: 82, in: 'soft', inDur: 0.5, out: 'slash', emph: { 7: red(1.5, { dy: -12 }), 8: red(1.5, { dy: -12 }) } },
  /* 24 男女共枕暖一张床 */ { ...T.serifW, layout: 'pos', size: 120, in: 'slide', out: 'fade', pos: [[300, 540, 1.3], [1620, 540, 1.3], [880, 230], [1040, 230], [700, 880, 0.8], [840, 880, 0.8], [980, 880, 0.8], [1180, 880, 1.2]], emph: { 0: { dir: 1 }, 1: { dir: -1 }, 7: red(1, { in: 'stamp' }) } },
  /* 25 同床异梦迷一样 */ { ...T.serifW, layout: 'pos', size: 150, in: 'soft', out: 'glitch', pos: [[420, 320], [620, 320], [1300, 760], [1500, 760], [960, 540, 0.7], [1080, 540, 0.7], [1200, 540, 0.7]], emph: { 2: { rot: Math.PI, color: '#cfc8ff' }, 3: { rot: Math.PI, color: '#cfc8ff' } } },
  /* 26 我不要就这样 */ { ...T.sansW, layout: 'pos', size: 230, in: 'glitch', inDur: 0.3, out: 'glitch', pos: [[420, 440], [960, 440], [1500, 440], [760, 840, 0.55], [960, 840, 0.55], [1160, 840, 0.55]], emph: { 1: { color: C.hot }, 2: { color: C.hot } } },
  /* 27 等到了惊蛰启 */ { ...T.serifW, layout: 'h', x: 960, y: 140, size: 64, in: 'type', out: 'fade', emph: { 3: { color: C.hot, scale: 1.4 }, 4: { color: C.hot, scale: 1.4 } } },
  /* 28 盼霜降 */ { ...T.serifW, layout: 'h', x: 960, y: 960, size: 92, in: 'stamp', out: 'fade', emph: { 1: { color: '#9fd0ff' }, 2: { color: '#9fd0ff' } } },
  /* 29 成了没日没夜的工作狂 */ { ...T.sansW, layout: 'pos', size: 96, in: 'stamp', out: 'glitch', pos: [[220, 200, 0.7], [300, 200, 0.7], [560, 520, 1.7], [760, 520, 1.7], [960, 520, 1.7], [1160, 520, 1.7], [1350, 520, 0.7], [1500, 860, 1.3], [1660, 860, 1.3], [1820, 860, 1.3]], emph: { 3: { color: C.hot }, 5: { color: C.hot }, 7: red(1.4), 8: red(1.4), 9: red(1.4) } },
  /* 30 负了我心里的少年郎 */ { ...T.serifW, layout: 'v', x: 1640, y: 150, size: 100, breaks: [6], in: 'soft', out: 'drift', outDur: 1.4, emph: { 6: { scale: 1.3, color: C.gold }, 7: { scale: 1.3, color: C.gold }, 8: { scale: 1.3, color: C.gold } } },
  /* 31 健忘的症状 (final) */ { ...T.sansW, layout: 'h', y: 540, size: 270, track: 0.02, in: 'zoom', inDur: 0.2, out: 'cut', echo: true },
  /* 32 这种赶春的人 */ { ...T.serifW, layout: 'v', x: 1560, y: 150, size: 130, in: 'flip', out: 'blow', emph: { 3: red(1.3) } },
  /* 33 该向左或向右 */ { ...T.sansW, layout: 'pos', size: 190, in: 'slide', out: 'glitch', pos: [[960, 140, 0.5], [480, 520], [480, 770, 1.3], [960, 540, 0.5], [1440, 520], [1440, 770, 1.3]], emph: { 1: { dir: 1 }, 2: { ...T.brushRed, dir: 1 }, 4: { dir: -1 }, 5: { ...T.brushRed, dir: -1 } } },
  /* 34 你看我这手里的胭脂虫 */ { ...T.sansW, layout: 'pos', size: 72, in: 'type', out: 'shatter', pos: [[1240, 170], [1320, 170], [1400, 170], [1480, 170], [1560, 170], [1640, 170], [1720, 170], [560, 640, 4.8], [960, 640, 4.8], [1360, 640, 4.8]], emph: { 7: { ...T.brushRed, in: 'stamp' }, 8: { ...T.brushRed, in: 'stamp' }, 9: { ...T.brushRed, in: 'stamp' } } },
  /* 35 像不像那晚春的花骨朵 */ { ...T.serifW, layout: 'pos', size: 130, in: 'stamp', out: 'blow', pos: [[300, 300], [300, 440, 0.8], [300, 580], [1600, 260, 0.7], [1600, 360, 0.7], [1600, 460, 0.7], [1600, 560, 0.7], [560, 780, 2.7], [960, 780, 2.7], [1360, 780, 2.7]], emph: { 7: red(), 8: red(), 9: red() } },
  /* 36 错过的不肯罢休 */ { ...T.serifW, color: C.gold, glow: 'rgba(40,20,0,0.9)', layout: 'v', x: 1640, y: 160, size: 112, breaks: [3], in: 'soft', inDur: 0.5, out: 'drift' },
  /* 37 不由衷的痛有谁懂 */ { ...T.serifW, color: '#fff3d6', glow: 'rgba(60,30,0,0.85)', layout: 'h', y: 930, size: 76, in: 'soft', inDur: 0.6, out: 'fade', outDur: 0.8, emph: { 4: { color: C.hot, scale: 1.3 } } },
  /* 38 眼看着那缕胭脂红 */ { ...T.serifInk, layout: 'pos', size: 100, in: 'soft', out: 'drift', pos: [[250, 280], [250, 400], [250, 520], [1500, 300, 0.8], [1500, 400, 0.8], [1500, 620, 1.9], [1500, 830, 1.9], [1730, 720, 1.9]], emph: { 5: red(), 6: red(), 7: red() } },
  /* 39 玩笑一般地开在无人问津 */ { ...T.serifInk, layout: 'h', y: 920, size: 78, in: 'soft', inDur: 0.5, out: 'drift', outDur: 2.5, outStagger: 0.12, emph: { 7: { color: '#7d7470' }, 8: { color: '#7d7470' }, 9: { color: '#7d7470' }, 10: { color: '#7d7470' } } },
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

// flash-frame inserts on chorus off-beats: [time, duration, plate]
const INSERTS = [
  [82.3, 0.1, 'faces'], [85.3, 0.08, 'cradle'], [87.8, 0.1, 'girl_flower'], [91.8, 0.1, 'bride_crown'],
  [130.3, 0.1, 'kids'], [133.3, 0.08, 'redroom'], [136.3, 0.1, 'plum_arch'], [140.3, 0.1, 'bride_cry'],
];

// -------------------------------------------------------------- shots --
// cam presets return { zoom, x, y, rot }
const cam = {
  push: (a = 1.0, b = 1.12, x = 0.5, y = 0.5) => (t, s) => ({ zoom: lerp(a, b, ease.inOutSine(s.p(t))), x, y }),
  pull: (a = 1.2, b = 1.02, x = 0.5, y = 0.5) => (t, s) => ({ zoom: lerp(a, b, ease.outCubic(s.p(t))), x, y }),
  snap: (a = 1.3, b = 1.04, x = 0.5, y = 0.5) => (t, s) => ({ zoom: lerp(a, b, ease.outExpo(clamp((t - s.t0) / 0.7))) + 0.03 * s.p(t), x, y }),
  pan: (x0 = 0.38, x1 = 0.62, z = 1.14, y = 0.5) => (t, s) => ({ zoom: z, x: lerp(x0, x1, ease.inOutSine(s.p(t))), y }),
  tilt: (y0 = 0.35, y1 = 0.65, z = 1.16, x = 0.5) => (t, s) => ({ zoom: z, x, y: lerp(y0, y1, ease.inOutSine(s.p(t))) }),
  roll: (r0 = -0.03, r1 = 0.03, z = 1.15) => (t, s) => ({ zoom: z, x: 0.5, y: 0.5, rot: lerp(r0, r1, ease.inOutSine(s.p(t))) }),
};

// grade overlays (soft-light tints + contrast) per shot
const grade = {
  cold: [['soft-light', 'rgba(60,110,255,0.35)']],
  night: [['multiply', 'rgba(70,90,160,0.35)'], ['soft-light', 'rgba(40,80,200,0.3)']],
  warm: [['soft-light', 'rgba(255,120,60,0.3)']],
  red: [['soft-light', 'rgba(255,40,30,0.35)']],
  gold: [['soft-light', 'rgba(255,190,90,0.4)']],
  dim: [['multiply', 'rgba(60,50,60,0.45)']],
  paper: [['soft-light', 'rgba(255,240,220,0.25)']],
};

export function buildStory(lyrics) {
  const shots = [];
  const S = (t0, t1, plate, camFn, o = {}) => {
    const s = { t0, t1, plate, cam: camFn, ...o };
    s.p = (t) => clamp((t - s.t0) / (s.t1 - s.t0));
    shots.push(s);
    return s;
  };
  const F = (t0, t1, draw, o = {}) => S(t0, t1, null, null, { draw, ...o });

  // --- particle systems -------------------------------------------------
  const snowIntro = snowfall({ seed: 1, t0: 1.5, t1: 16, rate: 45, wind: -30, bokeh: 0.06 });
  const petalsA = fallingPetals({ seed: 2, t0: 6, t1: 31, rate: 4, wind: 60, white: 0.3, size: [14, 26], zRange: [0.6, 2.2] });
  const snowWinter = snowfall({ seed: 3, t0: 30, t1: 47.5, rate: 110, wind: -90, bokeh: 0.08 });
  const snowPre = snowfall({ seed: 4, t0: 51, t1: 63, rate: 50, wind: -30, bokeh: 0.05 });
  const petalsRed = fallingPetals({ seed: 5, t0: 62, t1: 80, rate: 9, wind: 90, deep: 0.6, size: [18, 36], zRange: [0.35, 1.8] });
  const sparks = embers({ seed: 6, t0: 71, t1: 80, rate: 60, x: [200, 1720], y: 1100 });
  const petalsV2 = fallingPetals({ seed: 7, t0: 94, t1: 111.5, rate: 5, wind: -40, white: 0.4, size: [14, 26], zRange: [0.7, 2.2] });
  const snowFinal = snowfall({ seed: 8, t0: 127, t1: 145, rate: 160, wind: -140, bokeh: 0.09 });
  const dust = motes({ seed: 9, t0: 146, t1: 152, count: 180 });
  const petalsCoda = fallingPetals({ seed: 10, t0: 150, t1: 162, rate: 7, wind: -70, white: 0.25, size: [16, 30], zRange: [0.5, 2] });
  const shed = shedPetals({ seed: 11, t0: 157.2, t1: 161, rate: 60, path: [[560, 330], [1000, 520], [1400, 700], [1900, 980]] });
  const bfly1 = new G.Butterflies(21, 16, { t0: 25.05, x: 1500, y: 560, size: 34, speed: 1100, life: 3 });
  const bfly2 = new G.Butterflies(22, 40, { t0: 88.93, x: 960, y: 600, size: 44, speed: 1600, life: 3.5 });
  const bfly3 = new G.Butterflies(23, 46, { t0: 137.06, x: 960, y: 620, size: 46, speed: 1700, life: 3.5 });
  const burst1 = petalBurst({ seed: 31, t0: 141.06, x: 960, y: 480, count: 480, power: 1.8, size: [24, 56], z: [0.9, 1.4] });
  const burst2 = petalBurst({ seed: 32, t0: 141.81, x: 960, y: 460, count: 260, power: 1.3, white: 0.3, size: [20, 46] });
  const burstNear = petalBurst({ seed: 33, t0: 141.08, x: 960, y: 480, count: 30, power: 1.4, size: [70, 130], z: [0.55, 0.8], toward: 0.5, life: 2.2 });
  const titleBurst = petalBurst({ seed: 34, t0: 93.06, x: 960, y: 560, count: 260, power: 1.3, white: 0.5, size: [18, 40] });

  // --- generative plum for the title and the ending -----------------------
  const plum = new PlumTree({ seed: 21, root: { x: 2010, y: 1180 }, angle: -2.62, width: 50, tip: 6, length: 1700, speed: 900, start: 12.05, depthMax: 3, budRate: 0.24, whipRate: 0.2 });
  plum.assignBlooms(events('kicks', 12.4, 15.6, 0.5).map((e) => e[0]), 4);
  plum.bloomRest(13.5, 15.5, 1, 6);

  // ================================================================ INTRO
  F(0, BAR(1), (g, t) => {
    g.fillStyle = '#050405';
    g.fillRect(0, 0, W, H);
    // the red thread pulled across the dark
    const p = span(t, 0.06, 1.9, ease.inOutCubic);
    redThread(g, t, -40, 540, lerp(-40, W + 40, p), 540 + 6 * Math.sin(t * 2));
    for (const [ti] of events('kicks', 0, 2.1, 0.3)) G.ring(g, t, ti, lerp(-40, W + 40, span(ti, 0.06, 1.9, ease.inOutCubic)), 540, { color: '#ff4b3e', r1: 120, width: 6, dur: 0.7 });
  });
  S(BAR(1), BAR(3), 's_snow_plum', cam.push(1.02, 1.16, 0.5, 0.45), { grade: grade.night, over: (g, t) => snowIntro.draw(g, t) });
  S(BAR(3), BAR(4), 'girl_flower', cam.pull(1.25, 1.04, 0.5, 0.42), { over: (g, t) => petalsA.draw(g, t, { alpha: 0.8 }), enter: 'flash' });
  S(BAR(4), BAR(5), 'faces', cam.push(1.04, 1.14), { over: (g, t) => petalsA.draw(g, t, { alpha: 0.8 }), enter: 'whip' });
  S(BAR(5), BAR(6), 'cradle', cam.push(1.05, 1.2, 0.5, 0.45), { enter: 'whip' });
  F(BAR(6), 15.8, (g, t) => titleCard(g, t, plum), { enter: 'flash' });

  // ================================================================ VERSE 1
  S(15.8, BAR(9) - 0.05, 'kids', cam.snap(1.3, 1.05), { enter: 'flash', kick: 0.012 });
  S(BAR(9) - 0.05, 19.8, 'flying', cam.pan(0.36, 0.6, 1.12), { kick: 0.012, enter: 'whip' });
  F(19.8, 22.8, (g, t, P) => G.splitScreen(g, (gg) => drawPlate(gg, P.armsout, { zoom: 1.12, x: 0.42, par: 0.8, z0: 1.12, x0: 0.42 }), (gg) => drawPlate(gg, P.s_crossroads, { zoom: 1.1 + 0.05 * span(t, 19.8, 22.8), x: 0.5, par: 0.8, z0: 1.1, x0: 0.5 }), t, lerp(W, W / 2, span(t, 19.8, 20.3, ease.outExpo)) + 60 * Math.sin(t * 2)), { plates: ['armsout', 's_crossroads'], kick: 0.015 });
  S(22.8, 25.05, 'butterfly_hand', cam.push(1.02, 1.18, 0.55, 0.45), { enter: 'whip', kick: 0.012 });
  S(25.05, 26.55, 'face_butterfly', cam.snap(1.35, 1.06, 0.6, 0.45), { enter: 'flash', kick: 0.015, over: (g, t) => bfly1.draw(g, t) });
  S(26.55, 30.0, 'pointing', cam.pan(0.4, 0.62, 1.12, 0.45), { kick: 0.012, over: (g, t) => budBloom(g, t, 1520, 610) });

  // ================================================================ WINTER
  S(30.0, BAR(16) + 1, 's_frozen_town', cam.push(1.04, 1.18), { grade: grade.cold, enter: 'flash', over: (g, t) => snowWinter.draw(g, t) });
  S(BAR(16) + 1, 35.05, 'sleepers', cam.roll(-0.02, 0.02, 1.16), { grade: grade.cold, over: (g, t) => snowWinter.draw(g, t, { alpha: 0.7 }), enter: 'whip' });
  S(35.05, 38.3, 's_pale_sun', cam.push(1.06, 1.16, 0.5, 0.42), { grade: grade.cold, over: (g, t) => { paleSun(g, t); snowWinter.draw(g, t); } });
  S(38.3, 39.05, 'lookback', cam.snap(1.3, 1.08), { grade: grade.cold, enter: 'whip' });
  S(39.05, 41.05, 's_empty_alley', cam.push(1.02, 1.2, 0.5, 0.55), { grade: grade.night, over: (g, t) => snowWinter.draw(g, t), enter: 'flash' });
  S(41.05, 45.05, 'chair', cam.pan(0.35, 0.55, 1.12), { grade: grade.dim, over: (g, t) => snowWinter.draw(g, t, { alpha: 0.5 }), enter: 'whip' });
  S(45.05, 47.05, 'pile', cam.pull(1.25, 1.04), { grade: grade.dim, enter: 'flash' });

  // ================================================================ PRE-CHORUS
  F(47.05, 49.8, (g, t) => {
    g.fillStyle = '#07070a';
    g.fillRect(0, 0, W, H);
    const k = clamp((t - 47.05) / 2.6);
    G.house(g, 960, 520, 300, k, { glow: span(t, 49.6, 49.8) });
    snowPre.draw(g, t, { alpha: 0.6 });
  });
  S(49.8, 51.05, 's_snow_house', cam.pull(1.25, 1.06), { enter: 'flash', grade: grade.warm, over: (g, t) => { G.house(g, 960, 520, 300 * lerp(1, 1.3, span(t, 49.8, 51)), 1, { glow: 1, color: 'rgba(255,255,255,' + (1 - span(t, 49.8, 50.6)) + ')' }); snowPre.draw(g, t); } });
  S(51.05, 55.05, 'flowertree', cam.push(1.02, 1.14, 0.5, 0.45), { enter: 'whip', kick: 0.01, over: (g, t) => { G.lattice(g, 430, 180, 1060, 640, span(t, 51.05, 54.2), { color: 'rgba(255,90,70,0.9)', cell: 90, width: 3 }); snowPre.draw(g, t, { alpha: 0.5 }); } });
  S(55.05, 57.3, 'bride_close', cam.pan(0.42, 0.58, 1.1), { enter: 'flash', grade: grade.paper, over: (g, t) => snowPre.draw(g, t) });
  S(57.3, 59.05, 'bride_crown', cam.snap(1.3, 1.05), { over: (g, t) => G.brushSwipe(g, 980, 300, 1900, 820, 340, span(t, 57.3, 57.75), { seed: 4 }) });
  S(59.05, 61.05, 'girls_row', cam.pan(0.35, 0.6, 1.12), { enter: 'whip', grade: grade.dim });
  S(61.05, 62.93, 's_silk_clouds', cam.push(1.02, 1.3), { enter: 'whip', grade: grade.paper, over: (g, t) => G.speedLines(g, t, 960, 540, span(t, 62.0, 62.93)) });

  // ================================================================ SPRING DEATH
  S(62.93, 64.43, 'redroom', cam.push(1.06, 1.16, 0.4, 0.4), { enter: 'flash', grade: grade.red, kick: 0.015, over: (g, t) => petalsRed.draw(g, t) });
  S(64.43, 67.06, 'redroom', cam.snap(1.35, 1.08, 0.4, 0.4), { grade: grade.red, kick: 0.018, over: (g, t) => { G.ring(g, t, 64.43, 960, 540, { color: '#ff3b30', r1: 1200, width: 40 }); petalsRed.draw(g, t); } });
  S(67.06, 69.06, 's_red_field', cam.roll(-0.04, 0.04, 1.18), { enter: 'whip', kick: 0.015, over: (g, t) => petalsRed.draw(g, t) });
  S(69.06, 71.06, 'redroom_wide', cam.pan(0.38, 0.6, 1.12), { enter: 'whip', grade: grade.red, kick: 0.015, over: (g, t) => petalsRed.draw(g, t) });
  F(71.06, 73.31, (g, t, P) => { drawPlate(g, P.bride_crown, { zoom: lerp(1.05, 1.2, span(t, 71.06, 73.3)), par: 1, z0: 1.05 }); wildVines(g, t, 71.06); sparks.draw(g, t); }, { plates: ['bride_crown'], enter: 'flash', kick: 0.02 });
  S(73.31, 75.06, 's_wild_growth', cam.push(1.04, 1.2, 0.5, 0.6), { enter: 'whip', kick: 0.02, over: (g, t) => sparks.draw(g, t) });
  S(75.06, 77.06, 'camellia', cam.roll(0.03, -0.03, 1.15), { enter: 'flash', grade: grade.red, kick: 0.02, over: (g, t) => sparks.draw(g, t) });
  // build-up montage into the drop: a cut on every beat, then every half beat
  const montage = ['redroom', 'bride_crown', 's_red_field', 'redroom_wide', 'face_butterfly', 'cradle', 'faces', 'bride_close', 'redroom', 's_wild_growth'];
  const cuts = [];
  for (let k = 0; k < 4; k++) cuts.push(77.06 + k * 0.5);
  for (let k = 0; k < 2; k++) cuts.push(79.06 + k * 0.25);
  cuts.push(79.56);
  cuts.forEach((c, i) => S(c, cuts[i + 1] ?? 79.81, montage[i % montage.length], cam.snap(1.3, 1.1), { enter: 'flash', grade: grade.red, kick: 0.03 }));

  // ================================================================ CHORUS 1
  S(79.81, 81.06, 'black_girl', cam.snap(1.4, 1.06), { enter: 'drop', kick: 0.03, over: (g, t) => { for (const c of lyrics[17].chars) G.ring(g, t, c[1], 960, 540, { r1: 1100, width: 26 }); } });
  S(81.06, 83.81, 'face_front', cam.push(1.06, 1.2), { enter: 'whip', kick: 0.03 });
  F(83.81, 86.81, (g, t, P) => G.splitScreen(g, (gg) => drawPlate(gg, P.armsout, { zoom: 1.15, x: 0.42, par: 0.8, z0: 1.15, x0: 0.42 }), (gg) => drawPlate(gg, P.snow_wind, { zoom: 1.12, x: 0.6, par: 0.8, z0: 1.12, x0: 0.6 }), t, W / 2 + whipSplit(t, [84.06, 84.56, 84.81, 85.56, 85.81])), { plates: ['armsout', 'snow_wind'], enter: 'whip', kick: 0.03 });
  S(86.81, 88.81, 'silhouettes', cam.pan(0.35, 0.62, 1.12), { enter: 'whip', kick: 0.03 });
  S(88.81, 89.31, 'butterfly_hand', cam.snap(1.35, 1.08), { enter: 'flash', kick: 0.03, over: (g, t) => bfly2.draw(g, t) });
  S(89.31, 90.43, 's_blue_butterfly', cam.pull(1.3, 1.06), { enter: 'whip', kick: 0.03, over: (g, t) => bfly2.draw(g, t) });
  S(90.43, 93.06, 'face_butterfly', cam.push(1.06, 1.25, 0.6, 0.45), { enter: 'whip', kick: 0.03, over: (g, t) => bfly2.draw(g, t) });
  F(93.06, 95.06, (g, t) => titleDrop(g, t, 93.06, lyrics[21], titleBurst), { enter: 'drop' });

  // ================================================================ VERSE 2
  S(95.06, 99.06, 'plum_arch', cam.push(1.02, 1.12, 0.45, 0.45), { enter: 'flash', grade: grade.paper, letterbox: 1, over: (g, t) => petalsV2.draw(g, t) });
  S(99.06, 103.06, 'bride_cry', cam.pan(0.4, 0.58, 1.1, 0.45), { enter: 'whip', letterbox: 1, over: (g, t) => petalsV2.draw(g, t, { alpha: 0.7 }) });
  S(103.06, 105.06, 's_wedding_bed', cam.push(1.04, 1.16), { enter: 'whip', grade: grade.warm, letterbox: 1 });
  S(105.06, 107.06, 'head_hands', cam.pull(1.22, 1.04), { enter: 'whip', letterbox: 1 });
  F(107.06, 110.93, (g, t, P) => mirrorDream(g, t, P.dark_room), { plates: ['dark_room'], enter: 'flash', letterbox: 1 });

  // ================================================================ BRIDGE
  S(110.93, 115.06, 'arms_crossed', cam.snap(1.35, 1.08), { enter: 'drop', grade: grade.red, kick: 0.02, glitch: 0.6 });
  F(115.06, 118.93, (g, t, P) => {
    // 惊蛰 (insects wake) on the camellias, then 霜降 (first frost)
    if (t < 117.06) drawPlate(g, P.camellia, { zoom: lerp(1.05, 1.18, span(t, 115.06, 118.9)), par: 0.9, z0: 1.05 });
    else drawPlate(g, P.s_frost_leaves, { zoom: lerp(1.25, 1.06, span(t, 117.06, 118.9, ease.outCubic)), par: 0.9, z0: 1.25 });
    applyGrade(g, grade.dim);
    const idx = lerp(2, 17, ease.inOutCubic(span(t, 115.5, 117.81)));
    G.solarDial(g, 960, 1080 + 120, 860, idx, { hi: t < 117 ? [2] : [17] });
  }, { plates: ['camellia', 's_frost_leaves'], enter: 'flash', kick: 0.015 });
  F(118.93, 123.06, (g, t, P) => dayNight(g, t, P.red_hands), { plates: ['red_hands'], enter: 'whip', kick: 0.025, glitch: 0.5 });
  S(123.06, 125.06, 'brides_row', cam.pan(0.35, 0.6, 1.12), { enter: 'whip', kick: 0.015 });
  S(125.06, 127.81, 's_youth_tree', cam.push(1.04, 1.35), { enter: 'flash', grade: grade.dim, over: (g, t) => G.speedLines(g, t, 960, 540, span(t, 126.6, 127.81)) });

  // ================================================================ FINAL CHORUS
  S(127.81, 131.81, 'snow_girl', cam.snap(1.45, 1.06), { enter: 'drop', grade: grade.night, kick: 0.035, over: (g, t) => { snowFinal.draw(g, t); for (const c of lyrics[31].chars) G.ring(g, t, c[1], 960, 540, { r1: 1100, width: 26, color: '#cfe4ff' }); } });
  F(131.81, 134.81, (g, t, P) => G.splitScreen(g, (gg) => drawPlate(gg, P.snow_wind, { zoom: 1.14, x: 0.55, par: 0.8, z0: 1.14, x0: 0.55 }), (gg) => drawPlate(gg, P.s_crossroads, { zoom: 1.12, x: 0.5, par: 0.8, z0: 1.12, x0: 0.5 }), t, W / 2 + whipSplit(t, [132.06, 132.43, 132.81, 133.56, 133.93])), { plates: ['snow_wind', 's_crossroads'], enter: 'whip', grade: grade.night, kick: 0.035, over: (g, t) => snowFinal.draw(g, t) });
  S(134.81, 137.06, 'closeup_eyes', cam.push(1.06, 1.22), { enter: 'whip', grade: grade.night, kick: 0.035, over: (g, t) => snowFinal.draw(g, t) });
  S(137.06, 138.56, 'red_hand_snow', cam.snap(1.4, 1.08), { enter: 'flash', grade: grade.night, kick: 0.035, over: (g, t) => { bfly3.draw(g, t); snowFinal.draw(g, t); } });
  S(138.56, 141.06, 'back', cam.push(1.04, 1.12), { enter: 'whip', grade: grade.night, kick: 0.035, over: (g, t) => snowFinal.draw(g, t) });
  S(141.06, 143.93, 'back', cam.snap(1.3, 1.1), { grade: grade.night, kick: 0.035, over: (g, t) => {
    G.ring(g, t, 141.06, 960, 480, { color: '#ff4b3e', r1: 1400, width: 50, dur: 0.9 });
    G.ring(g, t, 141.81, 960, 460, { color: '#ffffff', r1: 1300, width: 30, dur: 0.8 });
    snowFinal.draw(g, t);
    burst1.draw(g, t);
    burst2.draw(g, t);
    burstNear.draw(g, t, { alpha: 0.9 });
  } });

  // ================================================================ CODA
  S(143.93, 146.56, 'flower_face', cam.push(1.04, 1.14, 0.45, 0.45), { enter: 'flash', grade: grade.gold, over: (g, t) => { burst1.draw(g, t, { alpha: 0.6 }); petalsCoda.draw(g, t); } });
  S(146.56, 149.06, 'sunrise', cam.pull(1.25, 1.04, 0.5, 0.4), { enter: 'flash', grade: grade.gold, rays: [960, 120], over: (g, t) => { g.save(); g.globalCompositeOperation = 'lighter'; dust.draw(g, t); g.restore(); } });
  S(149.06, 151.06, 's_golden_peaks', cam.push(1.02, 1.14), { enter: 'whip', grade: grade.gold, rays: [960, 260], over: (g, t) => { g.save(); g.globalCompositeOperation = 'lighter'; dust.draw(g, t); g.restore(); } });
  S(151.06, 154.31, 'plum_tree_girl', cam.pan(0.4, 0.58, 1.1), { enter: 'flash', over: (g, t) => { petalsCoda.draw(g, t); redThread(g, t, 1500 - 400 * span(t, 153.06, 154.0, ease.outCubic), 860, 1900, 700); } });
  S(154.31, 157.06, 'closeup_blossom', cam.push(1.02, 1.12, 0.45, 0.45), { enter: 'whip', over: (g, t) => petalsCoda.draw(g, t) });
  S(157.06, 161.0, 'branch', cam.push(1.0, 1.1, 0.55, 0.5), { enter: 'flash', letterbox: 1, over: (g, t) => { shed.draw(g, t); petalsCoda.draw(g, t, { alpha: 0.6 }); } });
  const plumEnd = new PlumTree({ seed: 33, root: { x: -90, y: 1200 }, angle: -0.6, width: 46, tip: 5, length: 1500, speed: 700, start: 161.2, depthMax: 3, budRate: 0.22, whipRate: 0.2 });
  plumEnd.bloomRest(162.5, 166.5, 1, 9);
  F(161.0, DURATION, (g, t) => endCard(g, t, plumEnd), { enter: 'fade' });

  // ---------------------------------------------------- per-frame queries --
  const sorted = shots.sort((a, b) => a.t0 - b.t0);
  return {
    duration: DURATION,
    shotAt: (t) => {
      let cur = sorted[0];
      for (const s of sorted) if (t >= s.t0) cur = s;
      return cur;
    },
    lyricStyles: LYRICS,
    chapters: CHAPTERS,
    inserts: INSERTS,
  };
}

// ------------------------------------------------------- set pieces ----
export function applyGrade(g, list) {
  if (!list) return;
  for (const [mode, color] of list) {
    g.save();
    g.globalCompositeOperation = mode;
    g.fillStyle = color;
    g.fillRect(0, 0, W, H);
    g.restore();
  }
}

function redThread(g, t, x0, y0, x1, y1) {
  g.save();
  g.strokeStyle = '#ff3b30';
  g.lineWidth = 3;
  g.shadowColor = 'rgba(255,40,30,0.9)';
  g.shadowBlur = 16;
  g.beginPath();
  g.moveTo(x0, y0);
  g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 30 * Math.sin(t * 1.3), x1, y1);
  g.stroke();
  g.restore();
}

function titleCard(g, t, plum) {
  g.fillStyle = '#0a0809';
  g.fillRect(0, 0, W, H);
  g.save();
  g.globalAlpha = 0.85;
  plum.draw(g, t, { inverse: true });
  g.restore();
  const shake = span(t, 14.6, 15.8, ease.inCubic) * 10;
  const z = lerp(1, 1.18, span(t, 14.8, 15.8, ease.inExpo));
  g.save();
  g.translate(960 + shake * noise1(t * 40, 1), 470 + shake * noise1(t * 40, 2));
  g.scale(z, z);
  const times = [12.07, 12.56, 13.34];
  ['花', '骨', '朵'].forEach((ch, i) => {
    const p = span(t, times[i], times[i] + 0.45);
    if (p <= 0) return;
    G.inkSplash(g, (i - 1) * 300, 0, 120, span(t, times[i], times[i] + 0.25), { color: '#b3121b', seed: 7 + i, alpha: 0.85 });
    inkChar(g, ch, (i - 1) * 300, -10, 300, p, { color: '#ffffff', weight: 900, bleed: 0.3, seed: 30 + i, family: FONTS.brush });
  });
  g.font = font(30, 500, LATIN);
  horizontalLayout(g, 'HUA GU DUO', 0, 230, 30, 0.9).forEach((c, i) => softChar(g, c.ch, c.x, c.y, 30, span(t, 14.06 + i * 0.03, 14.5 + i * 0.03), { color: '#ff8a7a', family: LATIN, weight: 500 }));
  g.font = font(26, 500, FONTS.sans);
  horizontalLayout(g, '洛天依 原创曲', 0, -230, 26, 0.6).forEach((c, i) => softChar(g, c.ch, c.x, c.y, 26, span(t, 13.6 + i * 0.04, 14.1 + i * 0.04), { color: '#ffffff', family: FONTS.sans, weight: 500 }));
  g.restore();
}

function budBloom(g, t, x, y) {
  const times = [29.05, 29.3, 29.8];
  times.forEach((t0, i) => {
    const p = span(t, t0, t0 + 0.45);
    if (p <= 0) return;
    drawBlossom(g, x + (i - 1) * 240, y - 300, 60, i, p, undefined, 0.3 + i * 0.2, 1);
  });
}

function paleSun(g, t) {
  // the sun tries to rise and sinks back: 日不升
  const rise = span(t, 35.3, 37.3, ease.outCubic);
  const fall = span(t, 37.8, 38.3, ease.inCubic);
  const y = 700 - 240 * rise + 520 * fall;
  G.sunMoon(g, 960, y, 70, 0, { alpha: 0.75 * (1 - fall) });
}

function wildVines(g, t, t0) {
  // dark red stems lashing up from the bottom of the frame
  const r = mulberry32(9);
  g.save();
  g.lineCap = 'round';
  for (let i = 0; i < 22; i++) {
    const x = r() * W;
    const delay = r() * 1.2;
    const p = clamp((t - t0 - delay) / 0.9);
    if (p <= 0) continue;
    const len = (300 + r() * 600) * ease.outCubic(p);
    const sway = (r() - 0.5) * 400;
    g.strokeStyle = r() < 0.5 ? 'rgba(120,6,12,0.92)' : 'rgba(20,10,10,0.92)';
    g.lineWidth = 6 + r() * 18;
    g.beginPath();
    g.moveTo(x, H + 20);
    g.quadraticCurveTo(x + sway * 0.5, H - len * 0.5, x + sway * p, H - len);
    g.stroke();
    if (p > 0.6) drawBlossom(g, x + sway * p, H - len, 18 + r() * 22, r() * 6, clamp((p - 0.6) / 0.4), undefined, r(), 1);
  }
  g.restore();
}

function whipSplit(t, hits) {
  // the divider lurches left on 向左 and right on 向右
  let off = 0;
  hits.forEach((h, i) => {
    const dir = i < 2 ? -1 : i === 2 ? 0 : 1;
    off += dir * 260 * ease.outExpo(span(t, h, h + 0.25)) * (1 - span(t, h + 0.25, h + 0.9, ease.inOutSine));
  });
  return off;
}

function titleDrop(g, t, t0, line, burst) {
  g.fillStyle = '#060506';
  g.fillRect(0, 0, W, H);
  const bp = span(t, t0, t0 + 1.4, ease.outCubic);
  g.save();
  g.globalAlpha = bp * 0.95;
  g.translate(960, 640);
  g.scale(0.5 + 0.6 * bp, 0.4 + 0.6 * bp);
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * TAU;
    const r0 = 40 + 120 * Math.abs(Math.sin(a * 3.1 + 1));
    g.fillStyle = 'rgba(170,0,12,0.18)';
    g.beginPath();
    g.ellipse(Math.cos(a) * r0 * 0.6, Math.sin(a) * r0 * 0.25 + 40, 200, 70, 0, 0, TAU);
    g.fill();
  }
  g.restore();
  drawBlossom(g, 960, 600, 150 * (0.8 + 0.2 * ease.outBack(span(t, t0, t0 + 0.8))), 0.4, span(t, t0, t0 + 1.0), BLOSSOM_WHITE, 0.37, 1);
  const chars = line.chars.slice(7);
  chars.forEach(([ch, ct], i) => {
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
    g.shadowColor = 'rgba(255,40,30,0.8)';
    g.shadowBlur = 40;
    g.fillStyle = '#e8121e';
    g.fillText(ch, 0, 0);
    g.restore();
    G.ring(g, t, ct, 960 + (i - 1) * 330, 300, { color: '#ff3b30', r1: 600, width: 20 });
  });
  burst.draw(g, t);
}

function mirrorDream(g, t, plate) {
  // 同床异梦: the same room reflected upside down and tinted another colour
  const z = lerp(1.05, 1.15, span(t, 107.06, 110.9));
  g.save();
  g.beginPath();
  g.rect(0, 0, W, H / 2);
  g.clip();
  drawPlate(g, plate, { zoom: z, x: 0.5, y: 0.45, par: 0.8, z0: 1.05 });
  g.restore();
  g.save();
  g.beginPath();
  g.rect(0, H / 2, W, H / 2);
  g.clip();
  g.translate(0, H);
  g.scale(1, -1);
  drawPlate(g, plate, { zoom: z, x: 0.5, y: 0.45, par: 0.8, z0: 1.05 });
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

function dayNight(g, t, plate) {
  drawPlate(g, plate, { zoom: lerp(1.05, 1.2, span(t, 118.93, 123)), par: 0.9, z0: 1.05 });
  const beat = Math.floor((t - 0.055) * 2);
  const night = beat % 2 === 1;
  applyGrade(g, night ? [['multiply', 'rgba(20,30,90,0.7)']] : [['soft-light', 'rgba(255,200,120,0.45)']]);
  G.sunMoon(g, 1660, 230, 80, night ? 1 : 0, { alpha: 0.95 });
  // clock hands spinning
  g.save();
  g.translate(1660, 230);
  g.strokeStyle = 'rgba(255,255,255,0.85)';
  g.lineWidth = 6;
  g.lineCap = 'round';
  const a = (t - 118.93) * 9;
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(Math.cos(a) * 120, Math.sin(a) * 120);
  g.moveTo(0, 0);
  g.lineTo(Math.cos(a / 12) * 80, Math.sin(a / 12) * 80);
  g.stroke();
  g.restore();
}

function endCard(g, t, plum) {
  g.fillStyle = '#070607';
  g.fillRect(0, 0, W, H);
  const fade = 1 - span(t, 169.4, 170.3);
  g.save();
  g.globalAlpha = 0.35 * fade;
  plum.draw(g, t, { inverse: true });
  g.restore();
  g.save();
  g.globalAlpha = fade;
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
  softChar(g, 'AI 重绘 · 动态 PV', 960, 860, 20, span(t, 164.6, 165.3), { color: '#e2574a', family: FONTS.sans, weight: 500 });
  g.restore();
}
