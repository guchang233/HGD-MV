// Frame compositor: plate shot -> set pieces -> kinetic lyrics -> film post.
import { W, H, makeCanvas, ctx2d, lerp, ease, span, noise1 } from './core.js';
import { loadTiming, pulse } from './timing.js';
import { loadFonts, inkChar } from './type.js';
import { initSprites } from './particles.js';
import { FX } from './fx.js';
import { Plates, drawPlate } from './plates.js';
import { drawLine, FONTS } from './lyrics.js';
import { buildStory, applyGrade, DURATION } from './story.js';
import { hud, glitchSlices, chapter } from './graphics.js';

// piecewise-linear keyframes [[t, v], ...]
const keys = (list, t) => {
  if (t <= list[0][0]) return list[0][1];
  for (let i = 1; i < list.length; i++) {
    if (t <= list[i][0]) return lerp(list[i - 1][1], list[i][1], (t - list[i - 1][0]) / (list[i][0] - list[i - 1][0]));
  }
  return list[list.length - 1][1];
};

// how hard the picture reacts to the drums, section by section
const INTENSITY = [[0, 0.15], [15.7, 0.15], [15.8, 0.55], [29.9, 0.55], [30, 0.35], [46.9, 0.35], [47, 0.5], [62.8, 0.5], [62.9, 0.8], [79.7, 0.85], [79.8, 1], [94.9, 1], [95, 0.3], [110.8, 0.3], [110.9, 0.85], [127.7, 0.85], [127.8, 1], [143.8, 1], [143.9, 0.35], [161, 0.2], [170.4, 0]];
const BLOOM = [[0, 0.25], [15.8, 0.2], [30, 0.3], [47, 0.25], [62.9, 0.22], [79.8, 0.3], [95, 0.2], [110.9, 0.22], [127.8, 0.35], [143.9, 0.4], [146.5, 0.55], [151, 0.3], [161, 0.25]];
const LETTERBOX = [[0, 0], [2.0, 0], [2.6, 1], [12.0, 1], [12.06, 0], [94.95, 0], [95.4, 1], [110.85, 1], [110.93, 0], [156.9, 0], [157.6, 1], [161, 1], [161.4, 0]];
const HUD_ALPHA = [[0, 0], [15.75, 0], [15.8, 0.45], [29.9, 0.45], [30, 0.3], [62.8, 0.3], [62.9, 0.6], [79.8, 0.85], [94.9, 0.85], [95, 0], [110.85, 0], [110.93, 0.8], [143.85, 0.8], [143.93, 0], [170.4, 0]];
const LEAK = [[0, 0], [47, 0], [47.6, 0.35], [62.7, 0.35], [62.9, 0], [143.9, 0], [144.6, 0.4], [156.5, 0.4], [157.5, 0]];
const SECTION = [[0, 'PROLOGUE'], [15.8, 'VERSE I'], [30, 'WINTER'], [47, 'PRE-CHORUS'], [62.9, 'SPRING'], [79.8, 'CHORUS'], [95, 'VERSE II'], [110.9, 'BRIDGE'], [127.8, 'FINAL CHORUS'], [143.9, 'CODA'], [161, 'END']];
// big hits that also throw light rays from the subject: [t, amp, decay, x, y, rgb]
const RAYS = [[93.06, 0.9, 0.5, 960, 600, '255,90,80'], [141.06, 1.0, 0.55, 960, 480, '255,110,90'], [141.81, 0.6, 0.4, 960, 460, '255,220,200']];

export async function boot(out, { base = '.' } = {}) {
  const [, , lyrics, manifest] = await Promise.all([
    loadTiming(`${base}/assets/timing.json`),
    loadFonts(`${base}/assets/fonts`),
    fetch(`${base}/assets/lyrics.json`).then((r) => r.json()),
    fetch(`${base}/assets/plates/manifest.json`).then((r) => r.json()),
  ]);
  initSprites();
  const fx = new FX();
  const plates = new Plates(`${base}/assets/plates`, manifest);
  const story = buildStory(lyrics);

  const gOut = ctx2d(out);
  const scene = makeCanvas(W, H);
  const gScene = ctx2d(scene);
  const post = makeCanvas(W, H);
  const gPost = ctx2d(post);

  const reset = (g) => {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    g.filter = 'none';
  };
  const inkGlyph = (g, c, p) => inkChar(g, c.ch, c.x, c.y, c.size, p, { color: c.st.color, weight: c.st.weight ?? 800, family: FONTS[c.st.font] ?? FONTS.serif, seed: c.i + 3 });

  async function renderFrame(t) {
    const shot = story.shotAt(t);
    const insert = story.inserts.find(([t0, d]) => t >= t0 && t < t0 + d);
    const names = [...(shot.plate ? [shot.plate] : shot.plates ?? []), ...(insert ? [insert[2]] : [])];
    const P = await plates.get(names);
    const k = keys(INTENSITY, t);
    const age = t - shot.t0;

    // ---- shot
    reset(gScene);
    gScene.fillStyle = '#000';
    gScene.fillRect(0, 0, W, H);
    if (shot.plate) {
      const c = shot.cam(t, shot);
      const c0 = shot.cam(shot.t0, shot);
      const kick = 1 + (shot.kick ?? 0) * pulse('kicks', t, 0.12, 0.4);
      drawPlate(gScene, P[shot.plate], { ...c, zoom: c.zoom * kick, z0: c0.zoom, x0: c0.x, y0: c0.y, par: shot.par ?? 0.9 });
    } else {
      shot.draw(gScene, t, P);
    }
    reset(gScene);
    applyGrade(gScene, shot.grade);
    if (shot.over) {
      shot.over(gScene, t);
      reset(gScene);
    }
    if (insert) {
      // a couple of frames of another moment, inverted and blood-tinted
      drawPlate(gScene, P[insert[2]], { zoom: 1.15, par: 0 });
      reset(gScene);
      applyGrade(gScene, [['difference', '#ffffff'], ['multiply', 'rgba(255,70,60,1)']]);
      reset(gScene);
    }

    // ---- kinetic lyrics
    const textPulse = k >= 0.7 ? 0.035 * k * pulse('kicks', t, 0.1, 0.5) : 0;
    story.lyricStyles.forEach((st, i) => drawLine(gScene, lyrics[i], st, t, { inkChar: inkGlyph, pulse: textPulse }));
    reset(gScene);

    // ---- transitions and drum reactions
    let flash = 0;
    let flashColor = '#ffffff';
    let ab = 0.0012 * k + 0.006 * k * pulse('snares', t, 0.1, 0.5);
    let blur = 0;
    let shake = 9 * k * k * pulse('kicks', t, 0.08, 0.6);
    let whip = 0;
    if (shot.enter === 'flash' && age < 0.6) flash = Math.max(flash, 0.85 * Math.exp(-age / 0.1));
    if (shot.enter === 'drop' && age < 0.8) {
      flash = Math.max(flash, Math.exp(-age / 0.16));
      blur += 0.3 * Math.exp(-age / 0.12);
      ab += 0.016 * Math.exp(-age / 0.2);
      shake += 22 * Math.exp(-age / 0.22);
    }
    if (shot.enter === 'whip' && age < 0.3) {
      whip = Math.exp(-age / 0.06);
      ab += 0.006 * whip;
    }
    if (shot.enter === 'fade' && age < 1) {
      flash = 1 - span(age, 0, 0.9, ease.inOutSine);
      flashColor = '#000000';
    }
    if (k >= 0.7) flash = Math.max(flash, 0.09 * k * pulse('snares', t, 0.06, 0.6));

    // ---- film post
    reset(gPost);
    gPost.fillStyle = '#000';
    gPost.fillRect(0, 0, W, H);
    const sx = shake * noise1(t * 31, 1);
    const sy = shake * noise1(t * 31, 2);
    const pad = Math.ceil(Math.abs(sx) + Math.abs(sy));
    if (ab > 0.0006) fx.chromatic(gPost, scene, ab);
    else gPost.drawImage(scene, 0, 0);
    if (pad > 0 || whip > 0) {
      // camera shake / whip smear: re-place the frame, enlarged so no edge shows
      const gt = fx.ga;
      reset(gt);
      gt.drawImage(post, 0, 0);
      reset(gPost);
      gPost.drawImage(fx.a, sx - pad, sy - pad, W + 2 * pad, H + 2 * pad);
      if (whip > 0.01) {
        for (let i = 1; i <= 6; i++) {
          gPost.globalAlpha = 0.22 * whip;
          gPost.drawImage(fx.a, i * 38 * whip - pad, -pad, W + 2 * pad, H + 2 * pad);
          gPost.drawImage(fx.a, -(i * 38 * whip) - pad, -pad, W + 2 * pad, H + 2 * pad);
        }
        gPost.globalAlpha = 1;
      }
    }
    if (blur > 0.002) fx.zoomBlur(gPost, scene, blur);
    reset(gPost);
    if (shot.glitch) glitchSlices(gPost, scene, t, shot.glitch * pulse('snares', t, 0.12, 0.4) * 1.5);
    fx.bloom(gPost, post, keys(BLOOM, t));
    if (shot.rays) fx.godRays(gPost, t, shot.rays[0], shot.rays[1], 0.7, '255,214,150');
    for (const [t0, amp, decay, x, y, col] of RAYS) {
      const a = t - t0;
      if (a >= 0 && a < decay * 5) fx.godRays(gPost, t, x, y, amp * Math.exp(-a / decay), col);
    }
    fx.lightLeak(gPost, t, keys(LEAK, t));
    fx.flash(gPost, flashColor, flash);
    fx.vignette(gPost, 0.32);
    fx.grain(gPost, t, 0.035);
    const ha = keys(HUD_ALPHA, t);
    if (ha > 0.01) {
      let sec = SECTION[0][1];
      for (const [t0, name] of SECTION) if (t >= t0) sec = name;
      let line = 0;
      lyrics.forEach((l, i) => {
        if (t >= l.chars[0][1] - 0.05) line = i + 1;
      });
      const bright = shot.bright ?? (shot.plate ? (P[shot.plate]?.lum ?? 0) > 0.62 : false);
      hud(gPost, t, { alpha: ha, color: bright ? '30,24,24' : '255,255,255', tl: '花骨朵  /  HUA GU DUO', tr: `LYRIC  ${String(line).padStart(2, '0')} / ${lyrics.length}`, bl: `${sec}   ·   BPM 120` });
    }

    for (const [t0, num, cn, en] of story.chapters) chapter(gPost, t, t0, num, cn, en);

    // ---- letterbox + output
    reset(gOut);
    gOut.drawImage(post, 0, 0);
    const lb = keys(LETTERBOX, t) * 120;
    if (lb > 0.5) {
      gOut.fillStyle = '#000';
      gOut.fillRect(0, 0, W, lb);
      gOut.fillRect(0, H - lb, W, lb);
    }
  }

  return {
    duration: DURATION,
    renderFrame,
    capture: (q = 0.94) => out.toDataURL('image/jpeg', q),
  };
}
