// 《花骨朵》PV — shot list.
//
// PV time is on a 120 BPM grid (downbeats at 0.055 + 2n).  The soundtrack is
// cut from the MV (see tools/build_audio.py), so footage shots read the MV at
// src = t + 46 (pre-chorus) or src = t + 94 (final chorus) and stay in sync
// with the MV's own lettering.
import { VIEW, TAU, ease, lerp, span, noise1, fbm1, mulberry32, makeCanvas, ctx2d } from './core.js';
import { pulse, events } from './timing.js';
import { drawFootage } from './footage.js';
import { makePaper } from './paper.js';
import { PlumTree, drawBlossom, BLOSSOM_WHITE } from './plum.js';
import { fallingPetals, petalBurst, shedPetals, snowfall, embers, motes } from './particles.js';
import { inkChar, softChar, seal, font, SERIF, LATIN, verticalLayout, horizontalLayout } from './type.js';

const V0 = { x: 0, y: 0, w: VIEW.w, h: VIEW.h }; // view-space rect (1920x756)
const CX = V0.w / 2;
const CY = V0.h / 2;

export const DURATION = 74.5;
const PRE = 46; // src = t + PRE in the pre-chorus section
const FIN = 94; // src = t + FIN in the final chorus section
// PV time of the first frame of MV frame n (shot boundaries sit exactly on the
// MV's own cuts so a camera change never lands mid-shot).
const at = (n, offset) => n / 30 - offset;

// ------------------------------------------------------------------ events --
// Each event list holds [time, amplitude, decay].
const punches = []; // extra zoom
const shakes = [];
const abers = []; // chromatic aberration
const flashes = []; // [t, amp, decay, color, attack]
const blurs = []; // zoom blur
const rays = []; // [t, amp, decay, {x, y, color}]

const impulse = (list, t) => {
  let v = 0;
  for (const [t0, amp, decay, , attack = 0.02] of list) {
    if (t < t0 - attack || t > t0 + decay * 6) continue;
    v += t < t0 ? amp * ((t - (t0 - attack)) / attack) ** 2 : amp * Math.exp(-(t - t0) / decay);
  }
  return v;
};

const hit = (t0, { punch = 0.035, shake = 0, ab = 0, flash = 0, color = '#fff', decay = 0.22 } = {}) => {
  if (punch) punches.push([t0, punch, decay]);
  if (shake) shakes.push([t0, shake, decay * 0.9]);
  if (ab) abers.push([t0, ab, decay]);
  if (flash) flashes.push([t0, flash, decay * 0.8, color]);
};

export function shakeAt(t) {
  const a = impulse(shakes, t);
  if (a < 0.05) return { x: 0, y: 0 };
  return { x: a * noise1(t * 28, 1), y: a * noise1(t * 28, 2) };
}

// piecewise-linear keyframes [[t, v], ...]
const keys = (list, t) => {
  if (t <= list[0][0]) return list[0][1];
  for (let i = 1; i < list.length; i++) {
    if (t <= list[i][0]) return lerp(list[i - 1][1], list[i][1], (t - list[i - 1][0]) / (list[i][0] - list[i - 1][0]));
  }
  return list[list.length - 1][1];
};
const BLOOM = [[0, 0.1], [15.9, 0.1], [16.0, 0.18], [33.4, 0.18], [33.5, 0.3], [52.7, 0.3], [53.0, 0.55], [56.6, 0.55], [57.6, 0.22], [67.3, 0.22], [67.5, 0.3]];
const LEAK = [[15.9, 0], [16.0, 0.35], [33.3, 0.35], [33.45, 0], [52.7, 0], [53.1, 0.4], [56.6, 0.4], [57.4, 0]];

// gentle hand-held drift for the camera
const drift = (t, amt = 1, seed = 0) => ({ x: fbm1(t * 0.35, 40 + seed) * 0.012 * amt, y: fbm1(t * 0.3, 70 + seed) * 0.01 * amt });

// --------------------------------------------------------------- builder --
export function buildTimeline() {
  const paper = makePaper(2300, 1000, 7);
  const shots = [];
  const S = (o) => (shots.push(o), o);

  // ---------------------------------------------------------- the plum --
  const tree = new PlumTree({
    seed: 21,
    root: { x: 2010, y: 900 },
    angle: -2.62,
    width: 46,
    tip: 6,
    length: 1500,
    speed: 430,
    start: 0.2,
    depthMax: 3,
    budRate: 0.24,
    whipRate: 0.2,
  });
  const hero = tree.hero(1150, 330, 3.4, 4.86);
  const introOnsets = events('hits', 1.9, 5.7, 0.4).map((e) => e[0]).filter((x) => Math.abs(x - 4.86) > 0.05);
  tree.assignBlooms(introOnsets, 4);
  tree.bloomRest(5.6, 13.2, 1, 6);
  const heroX = hero ? hero.x : 1150;
  const heroY = hero ? hero.y : 330;

  const paperAt = (g) => g.drawImage(paper, -190, -98);
  const treeLayer = makeCanvas(2300, 1000);
  const gTree = ctx2d(treeLayer);
  const treeAt = (g, t, alpha) => {
    gTree.setTransform(1, 0, 0, 1, 0, 0);
    gTree.clearRect(0, 0, treeLayer.width, treeLayer.height);
    gTree.translate(190, 98);
    tree.draw(gTree, t);
    g.save();
    g.globalAlpha *= alpha;
    g.drawImage(treeLayer, -190, -98);
    g.restore();
  };

  // ------------------------------------------------- S0 opening (0-6.05) --
  const inscription = verticalLayout('含苞待放', 310, 120, 54, 1.12);
  const inscTimes = [1.36, 1.55, 2.05, 2.54];
  const petalsIntro = fallingPetals({ seed: 3, t0: 3.5, t1: 16, rate: 5, wind: -50, size: [12, 22], zRange: [0.8, 2.2] });

  S({
    id: 'opening',
    t0: 0,
    t1: 6.05,
    draw(g, t) {
      const dive = span(t, 5.5, 6.05, ease.inExpo);
      const z = lerp(1, 1.06, span(t, 0, 5.5, ease.inOutSine)) * lerp(1, 9, dive);
      const fx = lerp(lerp(960, 1010, span(t, 0, 5.5)), heroX, span(t, 5.2, 5.9, ease.inOutCubic));
      const fy = lerp(lerp(402, 395, span(t, 0, 5.5)), heroY, span(t, 5.2, 5.9, ease.inOutCubic));
      const sh = shakeAt(t);
      g.save();
      g.translate(CX + sh.x, CY + sh.y);
      g.scale(z, z);
      g.translate(-fx, -fy);
      paperAt(g);
      tree.draw(g, t);
      // inscription + seal on the left, like a painting's colophon
      inscription.forEach((c, i) =>
        inkChar(g, c.ch, c.x, c.y, 54, span(t, inscTimes[i], inscTimes[i] + 0.9), { color: '#2b2522', weight: 500, bleed: 0.5, seed: 40 + i, settle: 0.05 }),
      );
      seal(g, '天依', 310, 470, 66, span(t, 3.55, 3.9), { seed: 4 });
      verticalLayout('洛天依 原创曲', 240, 132, 24).forEach((c, i) =>
        softChar(g, c.ch, c.x, c.y, 24, span(t, 2.87 + i * 0.07, 3.4 + i * 0.07), { color: '#5a4d47', weight: 500, blur: 3 }),
      );
      g.restore();
      petalsIntro.draw(g, t, { alpha: 0.9 });
    },
  });
  // drum-less intro: soft swells on the strongest onsets
  for (const [t0, s] of events('kicks', 0.5, 5.5, 0.9)) punches.push([t0, 0.006 * s, 0.4]);
  blurs.push([5.95, 0.45, 0.06, null, 0.4]);
  abers.push([5.95, 0.012, 0.08, null, 0.35]);
  flashes.push([6.05, 1, 0.22, '#fff', 0.12]);

  // ------------------------------------------ S1-S3 memories (6.05-12.05) --
  const footShot = (o) =>
    S({
      ...o,
      need: (t) => [o.src(t)],
      draw(g, t, [img]) {
        const c = o.cam(t);
        const sh = shakeAt(t);
        const p = 1 + impulse(punches, t) + (o.kick ?? 0) * pulse('kicks', t, 0.11, 0.5);
        drawFootage(g, img, { zoom: c.zoom * p, x: c.x, y: c.y, rot: c.rot ?? 0, dx: sh.x, dy: sh.y }, V0);
        o.over?.(g, t);
      },
    });

  footShot({
    id: 'girl',
    t0: 6.05,
    t1: 8.55,
    src: (t) => 4.2 + (t - 6.05) * 0.75, // gentle slow motion; MV cuts away at 6.13
    cam: (t) => ({ zoom: lerp(1.9, 1.08, span(t, 6.05, 7.0, ease.outExpo)) + 0.04 * span(t, 7, 8.55), x: 0.5, y: lerp(0.8, 0.55, span(t, 6.05, 7.3, ease.outCubic)) }),
    over(g, t) {
      petalsIntro.draw(g, t, { alpha: 0.8 });
    },
  });
  footShot({
    id: 'faces',
    t0: 8.05,
    t1: 10.55,
    enter: { type: 'ink', dur: 0.5, cx: 0.5, cy: 0.45 },
    src: (t) => 8.05 + (t - 8.05),
    cam: (t) => ({ zoom: lerp(1.04, 1.14, span(t, 8.05, 10.55, ease.inOutSine)), x: 0.5, y: 0.42 }),
    over(g, t) {
      petalsIntro.draw(g, t, { alpha: 0.7 });
    },
  });
  footShot({
    id: 'cradle',
    t0: 10.05,
    t1: 12.05,
    enter: { type: 'ink', dur: 0.5, cx: 0.55, cy: 0.35 },
    src: (t) => 11.55 + (t - 10.05),
    cam: (t) => ({ zoom: lerp(1.05, 1.2, span(t, 10.05, 12.05, ease.inOutSine)), x: 0.5, y: 0.45 }),
  });
  hit(12.05, { punch: 0, flash: 0.85, decay: 0.25 });

  // --------------------------------------------- S4 title card (12.05-16) --
  const titleTimes = [12.07, 12.56, 13.34];
  const thread = { t0: 14.56, t1: 15.5 };
  S({
    id: 'title',
    t0: 12.05,
    t1: 15.99,
    draw(g, t) {
      const rush = span(t, 15.55, 15.99, ease.inExpo);
      const z = lerp(0.94, 1.0, span(t, 12.05, 15.5, ease.outSine)) * lerp(1, 3.2, rush);
      const sh = shakeAt(t);
      g.save();
      g.translate(CX + sh.x, CY + sh.y);
      g.scale(z, z);
      g.translate(-lerp(1070, 760, rush), -lerp(410, 470, rush));
      paperAt(g);
      treeAt(g, Math.max(t, 14), 0.72);
      // title
      g.font = font(176, 900);
      const lay = horizontalLayout(g, '花骨朵', 760, 470, 176, 0.32);
      lay.forEach((c, i) => {
        const p = span(t, titleTimes[i], titleTimes[i] + 0.75);
        inkChar(g, c.ch, c.x, c.y, 176, p, { color: '#b3121b', weight: 900, bleed: 0.45, seed: 7 + i, settle: 0.12 });
      });
      // sub-lines
      g.font = font(30, 500, LATIN);
      horizontalLayout(g, 'HUA GU DUO', 760, 612, 30, 0.75).forEach((c, i) =>
        softChar(g, c.ch, c.x, c.y, 30, span(t, 14.08 + i * 0.03, 14.6 + i * 0.03), { color: '#7d2a22', family: LATIN, weight: 500, blur: 4 }),
      );
      g.font = font(26, 500);
      horizontalLayout(g, '洛天依 原创曲', 760, 330, 26, 0.6).forEach((c, i) =>
        softChar(g, c.ch, c.x, c.y, 26, span(t, 13.57 + i * 0.04, 14.1 + i * 0.04), { color: '#4a403a', weight: 500, blur: 4 }),
      );
      // the red thread drawn under the title
      const tp = span(t, thread.t0, thread.t1, ease.inOutCubic);
      if (tp > 0) {
        const x0 = 470;
        const x1 = 1050;
        const xe = lerp(x0, x1, tp);
        g.save();
        g.strokeStyle = '#c8102e';
        g.lineWidth = 2.4;
        g.shadowColor = 'rgba(220,30,40,0.6)';
        g.shadowBlur = 8;
        g.beginPath();
        g.moveTo(x0, 575);
        g.quadraticCurveTo((x0 + xe) / 2, 575 + 9 * tp, xe, 575);
        g.stroke();
        g.fillStyle = '#c8102e';
        g.beginPath();
        g.arc(xe, 575, 3.5, 0, TAU);
        g.fill();
        g.restore();
      }
      g.restore();
      petalsIntro.draw(g, t, { alpha: 0.9 });
    },
  });
  titleTimes.forEach((tt, i) => hit(tt, { punch: 0, shake: 4 + i * 2, decay: 0.2 }));
  blurs.push([15.97, 0.5, 0.05, null, 0.4]);
  abers.push([15.97, 0.018, 0.08, null, 0.4]);
  flashes.push([15.99, 1, 0.35, '#fff', 0.14]);

  // -------------------------------------- B: pre-chorus (15.99 - 33.45) --
  const petalsRed = fallingPetals({ seed: 9, t0: 16, t1: 33.5, rate: 6, wind: 70, deep: 0.6, size: [18, 34], zRange: [0.35, 1.6] });
  const sparks = embers({ seed: 12, t0: 28.4, t1: 33.5, rate: 55, x: [300, 1700], y: 820 });
  const warm = (g, t, a) => {
    g.save();
    g.globalCompositeOperation = 'soft-light';
    g.fillStyle = `rgba(255,90,60,${a})`;
    g.fillRect(0, 0, V0.w, V0.h);
    g.restore();
  };

  footShot({
    id: 'redroom1',
    t0: 15.99,
    t1: at(1987, PRE),
    kick: 0.012,
    src: (t) => Math.max(t + PRE, at(1864, 0) + 0.001), // the MV cuts in at 62.13
    cam: (t) => {
      const d = drift(t);
      return { zoom: lerp(1.45, 1.06, span(t, 15.99, 17.6, ease.outExpo)), x: lerp(0.34, 0.5, span(t, 15.99, 20.25, ease.inOutSine)) + d.x, y: lerp(0.36, 0.48, span(t, 15.99, 18, ease.outCubic)) + d.y };
    },
    over(g, t) {
      warm(g, t, 0.12);
      petalsRed.draw(g, t, { alpha: 0.85 });
    },
  });
  footShot({
    id: 'redroom2',
    t0: at(1987, PRE),
    t1: at(2113, PRE),
    kick: 0.012,
    src: (t) => t + PRE,
    cam: (t) => ({ zoom: 1.07, x: lerp(0.44, 0.58, span(t, 20.23, 24.43, ease.inOutSine)), y: 0.5, rot: lerp(-0.008, 0.008, span(t, 20.23, 24.43)) }),
    over(g, t) {
      warm(g, t, 0.1);
      petalsRed.draw(g, t, { alpha: 0.85 });
    },
  });
  hit(at(1987, PRE), { punch: 0.05, ab: 0.006, decay: 0.25 });
  footShot({
    id: 'bride',
    t0: at(2113, PRE),
    t1: at(2232, PRE),
    kick: 0.015,
    src: (t) => t + PRE,
    cam: (t) => ({ zoom: lerp(1.0, 1.04, span(t, 24.45, 28.41, ease.inOutSine)), x: 0.5, y: 0.45 }),
    over(g, t) {
      petalsRed.draw(g, t, { alpha: 0.7 });
    },
  });
  // "野蛮" "生长" "在春泥" land on the beat: punch them in
  for (const n of [2113, 2127, 2160, 2172, 2197]) hit(at(n, PRE), { punch: 0.06, shake: 7, ab: 0.008, decay: 0.24 });
  footShot({
    id: 'sedan',
    t0: at(2232, PRE),
    t1: at(3823, FIN),
    kick: 0.012,
    src: (t) => Math.min(t + PRE, at(2381, 0)), // the MV cuts away at 79.4
    cam: (t) => ({ zoom: lerp(1.02, 1.18, span(t, 28.9, 33.45, ease.inOutSine)), x: 0.5, y: 0.42 }),
    over(g, t) {
      g.save();
      g.globalCompositeOperation = 'lighter';
      sparks.draw(g, t, { alpha: 0.9 });
      g.restore();
      petalsRed.draw(g, t, { alpha: 0.6 });
    },
  });
  hit(at(2232, PRE), { punch: 0.08, shake: 10, ab: 0.012, flash: 0.5, color: '#ffb070', decay: 0.35 });
  // wind-up into the final chorus
  blurs.push([33.42, 0.35, 0.05, null, 0.5]);
  abers.push([33.42, 0.016, 0.1, null, 0.5]);
  flashes.push([33.45, 1, 0.45, '#ffffff', 0.35]);

  // ------------------------------------ C: final chorus (33.45 - 67.97) --
  const snow = snowfall({ seed: 31, t0: 33.4, t1: 56, rate: 70, wind: -55, bokeh: 0.07 });
  const cold = (g, a) => {
    g.save();
    g.globalCompositeOperation = 'soft-light';
    g.fillStyle = `rgba(80,120,255,${a})`;
    g.fillRect(0, 0, V0.w, V0.h);
    g.restore();
  };

  footShot({
    id: 'snow1',
    t0: at(3823, FIN),
    t1: at(4040, FIN),
    kick: 0.01,
    src: (t) => Math.max(t + FIN, at(3823, 0) + 0.001),
    cam: (t) => ({ zoom: lerp(1.16, 1.0, span(t, 33.45, 34.4, ease.outExpo)), x: 0.5, y: 0.5 }),
    over(g, t) {
      cold(g, 0.12);
      snow.draw(g, t, { alpha: 0.95 });
    },
  });
  // lyric pop-ins: white lines softly, the red 「向左」「向右」 harder
  for (const n of [3835, 3867, 3895, 3953]) hit(at(n, FIN), { punch: 0.025, ab: 0.004, decay: 0.3 });
  for (const n of [3961, 4002]) hit(at(n, FIN), { punch: 0.045, shake: 6, ab: 0.01, decay: 0.3 });
  footShot({
    id: 'snow2',
    t0: at(4040, FIN),
    t1: at(4220, FIN),
    kick: 0.014,
    src: (t) => t + FIN,
    cam: () => ({ zoom: 1.0, x: 0.5, y: 0.5 }),
    over(g, t) {
      cold(g, 0.08);
      snow.draw(g, t, { alpha: 0.75 });
    },
  });
  // the MV's own quick cuts: hit each one
  for (const n of [4040, 4058, 4077, 4087, 4100, 4119, 4128, 4148, 4157, 4161, 4173, 4184]) {
    hit(at(n, FIN), { punch: 0.045, shake: 5, ab: 0.006, decay: 0.2 });
  }
  hit(at(4169, FIN), { punch: 0.07, shake: 14, ab: 0.014, decay: 0.28 }); // 「不」
  const burst1 = petalBurst({ seed: 41, t0: 47.08, x: 960, y: 400, count: 420, power: 1.7, size: [22, 52], z: [0.9, 1.4] });
  const burst2 = petalBurst({ seed: 42, t0: 47.84, x: 960, y: 380, count: 220, power: 1.2, white: 0.3, size: [20, 44], z: [1.0, 1.5] });
  const burstNear = petalBurst({ seed: 43, t0: 47.1, x: 960, y: 400, count: 26, power: 1.4, size: [60, 120], z: [0.55, 0.8], toward: 0.5, life: 2.2 });
  const ring = (g, t, t0, x, y) => {
    const a = t - t0;
    if (a < 0 || a > 0.9) return;
    const k = ease.outCubic(a / 0.9);
    g.save();
    g.globalCompositeOperation = 'screen';
    g.strokeStyle = `rgba(255,70,60,${0.55 * (1 - k)})`;
    g.lineWidth = 28 * (1 - k) + 2;
    g.beginPath();
    g.ellipse(x, y, 60 + k * 1100, 40 + k * 700, 0, 0, TAU);
    g.stroke();
    g.restore();
  };
  footShot({
    id: 'hook',
    t0: at(4220, FIN),
    t1: at(4318, FIN),
    kick: 0.01,
    src: (t) => t + FIN,
    cam: (t) => ({ zoom: lerp(1.0, 1.03, span(t, 47.0, 49.9, ease.outCubic)), x: 0.5, y: 0.5 }),
    over(g, t) {
      cold(g, 0.06);
      snow.draw(g, t, { alpha: 0.7 });
      ring(g, t, 47.08, 960, 400);
      ring(g, t, 47.84, 960, 380);
      burst1.draw(g, t);
      burst2.draw(g, t);
      burstNear.draw(g, t, { alpha: 0.9 });
    },
  });
  hit(at(4220, FIN), { punch: 0.05, flash: 0.35, ab: 0.01, decay: 0.2 });
  hit(47.08, { punch: 0.09, shake: 18, ab: 0.02, flash: 0.28, color: '#ff4a3a', decay: 0.32 });
  rays.push([47.08, 0.9, 0.45, { x: 960, y: 400, color: '255,120,100' }]);
  rays.push([47.84, 0.5, 0.35, { x: 960, y: 380, color: '255,190,170' }]);
  hit(47.84, { punch: 0.06, shake: 12, ab: 0.014, decay: 0.3 });
  hit(at(4296, FIN), { punch: 0.06, shake: 10, ab: 0.012, flash: 0.3, decay: 0.22 });
  hit(at(4311, FIN), { punch: 0.06, shake: 10, ab: 0.012, flash: 0.3, decay: 0.22 });

  const petalsDrift = fallingPetals({ seed: 51, t0: 49.5, t1: 68, rate: 7, wind: -80, white: 0.25, size: [16, 30], zRange: [0.4, 2] });
  footShot({
    id: 'regret',
    t0: at(4318, FIN),
    t1: at(4404, FIN),
    src: (t) => t + FIN,
    cam: (t) => ({ zoom: lerp(1.0, 1.03, span(t, 49.93, 52.8, ease.inOutSine)), x: 0.5, y: 0.5 }),
    over(g, t) {
      cold(g, 0.08);
      snow.draw(g, t, { alpha: 0.6 });
      burst1.draw(g, t, { alpha: 0.8 });
      burst2.draw(g, t, { alpha: 0.8 });
      petalsDrift.draw(g, t, { alpha: 0.85 });
    },
  });
  hit(at(4318, FIN), { punch: 0.04, decay: 0.3 });
  const dust = motes({ seed: 61, t0: 52.8, t1: 57, count: 170 });
  footShot({
    id: 'sunrise',
    t0: at(4404, FIN),
    t1: at(4504, FIN),
    src: (t) => t + FIN,
    cam: (t) => ({ zoom: lerp(1.16, 1.0, span(t, 52.8, 56.13, ease.outSine)), x: 0.5, y: 0.4 }),
    over(g, t) {
      g.save();
      g.globalCompositeOperation = 'lighter';
      dust.draw(g, t, { alpha: 0.8 });
      g.restore();
      snow.draw(g, t, { alpha: 0.4 });
      petalsDrift.draw(g, t, { alpha: 0.7 });
    },
  });
  footShot({
    id: 'whiteout',
    t0: at(4504, FIN),
    t1: 57.0,
    src: (t) => t + FIN,
    cam: () => ({ zoom: 1.0, x: 0.5, y: 0.5 }),
    over(g, t) {
      petalsDrift.draw(g, t, { alpha: 0.8 });
    },
  });
  footShot({
    id: 'tree',
    t0: 57.0,
    t1: 60.0,
    src: (t) => t + FIN,
    cam: () => ({ zoom: 1.0, x: 0.5, y: 0.5 }),
    over(g, t) {
      petalsDrift.draw(g, t, { alpha: 0.9 });
    },
  });
  hit(57.0, { punch: 0.035, decay: 0.3 });
  footShot({
    id: 'closeup',
    t0: 60.0,
    t1: 63.0,
    src: (t) => t + FIN,
    cam: () => ({ zoom: 1.0, x: 0.5, y: 0.5 }),
    over(g, t) {
      petalsDrift.draw(g, t, { alpha: 0.9 });
    },
  });
  const windPetals = shedPetals({ seed: 71, t0: 63.3, t1: 67.2, rate: 70, path: [[560, 250], [1000, 420], [1400, 590], [1900, 740]] });
  footShot({
    id: 'branch',
    t0: 63.0,
    t1: 67.4,
    src: (t) => Math.min(t + FIN, 161.9),
    cam: (t) => ({ zoom: lerp(1.0, 1.08, span(t, 63, 67.4, ease.inOutSine)), x: 0.5, y: 0.5 }),
    over(g, t) {
      petalsDrift.draw(g, t, { alpha: 0.8 });
      windPetals.draw(g, t, { alpha: 0.95 });
    },
  });

  // --------------------------------------------- end card (67.4 - 74.5) --
  // a white plum over red ink pooling on black, echoing the MV's title card
  const blot = makeCanvas(1000, 460);
  {
    const b = ctx2d(blot);
    const r = mulberry32(77);
    for (let i = 0; i < 90; i++) {
      const x = 500 + r.gauss() * 140;
      const y = 150 + Math.abs(r.gauss()) * 55;
      const rad = r.range(18, 85);
      const grd = b.createRadialGradient(x, y, 0, x, y, rad);
      grd.addColorStop(0, 'rgba(160,4,14,0.5)');
      grd.addColorStop(0.7, 'rgba(140,0,12,0.22)');
      grd.addColorStop(1, 'rgba(140,0,12,0)');
      b.fillStyle = grd;
      b.fillRect(0, 0, 1000, 460);
    }
    for (let i = 0; i < 12; i++) {
      // drips running down from the pool
      const x = 500 + r.gauss() * 115;
      const len = r.range(30, 150);
      const w = r.range(2.5, 6);
      const grd = b.createLinearGradient(0, 190, 0, 190 + len);
      grd.addColorStop(0, 'rgba(150,0,12,0.85)');
      grd.addColorStop(1, 'rgba(150,0,12,0.45)');
      b.fillStyle = grd;
      b.fillRect(x - w / 2, 190, w, len);
      b.fillStyle = 'rgba(150,0,12,0.6)';
      b.beginPath();
      b.arc(x, 190 + len, w * 0.95, 0, TAU);
      b.fill();
    }
  }
  const credits = [
    ['演唱', '洛天依'],
    ['作词 · 作曲', '亚细亚旷世奇才'],
    ['调校', 'Creuzer'],
    ['混音', '歪歪'],
    ['动画制作', '刚炮'],
    ['特别感谢', 'AA'],
  ];
  const endPetals = fallingPetals({ seed: 81, t0: 67, t1: 75, rate: 4, wind: -30, white: 0.5, size: [14, 24], zRange: [0.8, 2.2] });
  S({
    id: 'end',
    t0: 67.4,
    t1: DURATION,
    draw(g, t) {
      g.fillStyle = '#0c0b0d';
      g.fillRect(0, 0, V0.w, V0.h);
      const fadeOut = 1 - span(t, 73.7, 74.45, ease.inOutSine);
      g.save();
      g.globalAlpha = fadeOut;
      const bp = span(t, 67.9, 70.8, ease.outCubic);
      g.save();
      g.globalAlpha *= bp * 0.92;
      g.translate(960, 410);
      g.scale(0.55 + 0.45 * bp, 0.4 + 0.6 * bp);
      g.drawImage(blot, -500, -150);
      g.restore();
      const open = span(t, 67.75, 69.2);
      drawBlossom(g, 960, 392, 84 * (0.85 + 0.15 * ease.outCubic(open)), -0.3, open, BLOSSOM_WHITE, 0.37, 1);
      g.font = font(136, 900);
      horizontalLayout(g, '花骨朵', 960, 150, 136, 0.3).forEach((c, i) =>
        inkChar(g, c.ch, c.x, c.y, 136, span(t, 68.2 + i * 0.28, 68.95 + i * 0.28), { color: '#b0060e', weight: 900, bleed: 0.6, seed: 20 + i }),
      );
      g.font = font(21, 500, LATIN);
      horizontalLayout(g, 'HUA GU DUO', 960, 246, 21, 0.8).forEach((c, i) =>
        softChar(g, c.ch, c.x, c.y, 21, span(t, 69.3 + i * 0.02, 69.9 + i * 0.02), { color: '#c9a6a0', family: LATIN, weight: 500 }),
      );
      credits.forEach(([role, name], i) => {
        const x = 960 + (i - 2.5) * 272;
        const p = span(t, 69.9 + i * 0.16, 70.6 + i * 0.16);
        softChar(g, role, x, 562, 17, p, { color: '#9b8f8c', weight: 500, rise: 6 });
        const latin = /^[A-Za-z]/.test(name);
        softChar(g, name, x, 596, latin ? 30 : 26, p, { color: '#efe9e4', weight: latin ? 500 : 600, family: latin ? LATIN : SERIF, rise: 6 });
      });
      const cta = span(t, 71.8, 72.6);
      if (cta > 0) {
        g.save();
        g.globalAlpha *= cta;
        g.strokeStyle = 'rgba(226,87,74,0.6)';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(960 - 140 - 160 * ease.outCubic(cta), 676);
        g.lineTo(960 - 140, 676);
        g.moveTo(960 + 140, 676);
        g.lineTo(960 + 140 + 160 * ease.outCubic(cta), 676);
        g.stroke();
        g.restore();
      }
      softChar(g, '完整版MV 现已上线', 960, 676, 22, cta, { color: '#e2574a', weight: 600, blur: 5 });
      g.restore();
      endPetals.draw(g, t, { alpha: 0.7 * fadeOut });
    },
  });

  // ---------------------------------------------------------- frame API --
  const sorted = shots.slice().sort((a, b) => a.t0 - b.t0);
  return {
    duration: DURATION,
    shotsAt(t) {
      return sorted.filter((s) => t >= s.t0 && t < s.t1);
    },
    post(t) {
      // dip to black between the branch and the end card
      const dip = span(t, 66.6, 67.4, ease.inOutSine) * (1 - span(t, 67.4, 67.5));
      const flash = [];
      for (const [t0, amp, decay, color, attack = 0.02] of flashes) {
        if (t < t0 - attack || t > t0 + decay * 6) continue;
        const v = t < t0 ? amp * ((t - (t0 - attack)) / attack) ** 2 : amp * Math.exp(-(t - t0) / decay);
        if (v > 0.002) flash.push([color, v]);
      }
      if (dip > 0) flash.push(['#000', dip]);
      const inChorus = t >= 33.45 && t < 67.4;
      return {
        ab: impulse(abers, t),
        blur: impulse(blurs, t),
        flash,
        bloom: keys(BLOOM, t),
        rays: [
          { x: 960, y: 30, color: '255,214,150', amount: t >= 52.8 && t < 56.3 ? span(t, 52.8, 53.6) * (1 - span(t, 55.6, 56.3)) * 0.75 : 0 },
          ...rays.map(([t0, amp, decay, o]) => ({ ...o, amount: impulse([[t0, amp, decay]], t) })),
        ].filter((r) => r.amount > 0.003),
        leak: keys(LEAK, t),
        grain: t < 15.99 ? 0.045 : inChorus ? 0.04 : 0.045,
        vignette: t < 15.99 ? 0.3 : 0.38,
        aperture: span(t, 0.06, 1.5, ease.inOutCubic) * (1 - span(t, 74.0, 74.5, ease.inCubic)),
      };
    },
  };
}
