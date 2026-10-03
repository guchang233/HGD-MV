// Frame compositor.  A frame at time t is the average of several sub-frames
// spread across the shutter interval (motion blur).  Each sub-frame renders
// the shot — or both shots inside a transition — under the 2.5D camera, then
// the lyrics; film post (soft glow, flashes, grain, subtitles, letterbox)
// is applied once to the blended frame.
import { W, H, clamp, ease, span, makeCanvas, ctx2d } from './core.js';
import { loadTiming } from './timing.js';
import { loadFonts, inkChar } from './type.js';
import { initSprites, setStreaks } from './particles.js';
import { FX } from './fx.js';
import { Slots, drawCard, lumaUnder } from './slots.js';
import { drawLine, drawGhost, drawSubtitle, layoutLine, lineBox, lineLive, exitAt, FONTS } from './lyrics.js';
import { buildStory, applyGrade, drawSplit, drawCredit, keys, LOOK, DURATION } from './story.js';
import { D, layer, plus } from './camera.js';
import { TRANSITIONS } from './transitions.js';
import { chapter } from './graphics.js';

// Picture files: render.mjs writes build/images.json (it accepts names like
// 05.png or S05_雪夜.jpg); without it, probe <id>.png|jpg|jpeg|webp.
async function findImages(base, defs) {
  try {
    const r = await fetch(`${base}/build/images.json`, { cache: 'no-store' });
    if (r.ok) return await r.json();
  } catch {}
  const files = {};
  await Promise.all(
    defs.map(async (d) => {
      for (const ext of ['png', 'jpg', 'jpeg', 'webp']) {
        const url = `${base}/assets/images/${d.id}.${ext}`;
        try {
          if ((await fetch(url, { method: 'HEAD' })).ok) {
            files[d.id] = url;
            return;
          }
        } catch {}
      }
    }),
  );
  return files;
}

const hexLum = (hex) => {
  const n = parseInt((hex ?? '#ffffff').slice(1, 7), 16);
  return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
};

export async function boot(out, { base = '.' } = {}) {
  const [, , lyrics, slotData] = await Promise.all([
    loadTiming(`${base}/assets/timing.json`),
    loadFonts(`${base}/assets/fonts`),
    fetch(`${base}/assets/lyrics.json`).then((r) => r.json()),
    fetch(`${base}/assets/slots.json`).then((r) => r.json()),
  ]);
  const files = await findImages(base, slotData.slots);
  initSprites();
  const fx = new FX();
  const slots = new Slots(slotData.slots, files);
  const story = buildStory(lyrics, { fx });
  const { shots } = story;

  const canvas = () => {
    const c = makeCanvas(W, H);
    return [c, ctx2d(c)];
  };
  const gOut = ctx2d(out);
  const [scene, gScene] = canvas();
  const [ca, gA] = canvas();
  const [cb, gB] = canvas();
  const [tmp] = canvas();
  const [acc, gAcc] = canvas();
  const [post, gPost] = canvas();
  const [fxCanvas, gFx] = canvas();

  const reset = (g) => {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    g.filter = 'none';
    g.shadowBlur = 0;
  };
  const inkGlyph = (g, c, p) => inkChar(g, c.ch, c.x, c.y, c.size, p, { color: c.st.color, weight: c.st.weight ?? 800, family: FONTS[c.st.font] ?? FONTS.serif, seed: c.i + 3 });

  // A two-shot transition straddling t, if any: {A, B, T, p, opts}
  const transitionAt = (t) => {
    const cur = shots[story.indexAt(t)];
    const T1 = TRANSITIONS[cur.enter?.type];
    if (T1 && cur.prev && t < cur.t0 + T1.post) return { A: cur.prev, B: cur, T: T1, p: (t - cur.t0 + T1.pre) / (T1.pre + T1.post), opts: cur.enter };
    const nx = cur.next;
    const T2 = TRANSITIONS[nx?.enter?.type];
    if (T2 && T2.pre > 0 && t >= nx.t0 - T2.pre) return { A: cur, B: nx, T: T2, p: (t - nx.t0 + T2.pre) / (T2.pre + T2.post), opts: nx.enter };
    return null;
  };

  function renderShot(g, shot, t, gcam, P) {
    reset(g);
    g.fillStyle = '#000';
    g.fillRect(0, 0, W, H);
    const cam = plus(gcam, shot.cam(t, shot));
    const cover = story.coverOf(shot, D.image);
    if (shot.slot) drawCard(g, P[shot.slot], cam, D.image, cover, { t });
    else if (shot.split) drawSplit(g, shot, t, cam, P, cover);
    if (shot.draw) {
      reset(g);
      shot.draw(g, t, cam, P);
    }
    reset(g);
    applyGrade(g, shot.grade);
    if (shot.over) {
      reset(g);
      shot.over(g, t, cam, P, gcam);
    }
    reset(g);
  }

  function renderSample(g, t, shot, P, dp) {
    const gcam = story.globalCam(t);
    const tr = transitionAt(t);
    if (tr) {
      renderShot(gA, tr.A, t, gcam, P);
      renderShot(gB, tr.B, t, gcam, P);
      reset(g);
      g.fillStyle = '#000';
      g.fillRect(0, 0, W, H);
      tr.T.draw(g, ca, cb, clamp(tr.p), { ...tr.opts, tmp, fx, dp: dp / (tr.T.pre + tr.T.post) });
      reset(g);
    } else renderShot(g, shot, t, gcam, P);

    // one-frame inserts: another moment, inverted and blood-tinted
    const ins = story.inserts.find(([t0, d]) => t >= t0 && t < t0 + d);
    if (ins && P[ins[2]]) {
      drawCard(g, P[ins[2]], gcam, D.image, 1.15, { t });
      reset(g);
      applyGrade(g, [['difference', '#ffffff'], ['multiply', 'rgba(255,70,60,1)']]);
      reset(g);
    }

    // ---- kinetic lyrics, under the continuous global camera
    const slot = shot.slot ? P[shot.slot] : null;
    layer(g, gcam, D.back);
    story.lyricStyles.forEach((st, i) => st.ghost && drawGhost(g, lyrics[i], st, t));
    layer(g, gcam, D.text);
    story.lyricStyles.forEach((st, i) => {
      const line = lyrics[i];
      if (!lineLive(line, st, t)) return;
      const sl = slot ? inkOver(line, st, slot) : st;
      if (slot) scrim(g, line, sl, t, slot);
      drawLine(g, line, sl, t, { inkChar: inkGlyph });
      if (st.sweep) sweep(g, line, st, t, gcam);
    });
    for (const c of story.opening) drawCredit(g, t, c);
    reset(g);
  }

  // white type over a pale picture turns to ink (and the reverse), so the
  // words never need a smudge of shadow behind them
  const inkCache = new Map();
  function inkOver(line, st, slot) {
    const key = `${line.chars[0][1]}|${slot.id}`;
    if (inkCache.has(key)) return inkCache.get(key);
    const light = hexLum(st.color) > 0.5;
    const lum = lumaUnder(slot, ...lineBox(layoutLine(line, st)));
    let out = st;
    if (light && lum > 0.62) out = { ...st, color: '#1d1a1c', glow: 'rgba(255,255,255,0.35)' };
    else if (!light && lum < 0.35) out = { ...st, color: '#ffffff', glow: 'rgba(0,0,0,0.35)' };
    inkCache.set(key, out);
    return out;
  }

  // a band of light gliding across a hero line once it has landed
  function sweep(g, line, st, t, gcam) {
    const sw = st.sweep;
    const p = (t - sw.at) / (sw.dur ?? 0.45);
    if (p <= 0 || p >= 1) return;
    reset(gFx);
    gFx.clearRect(0, 0, W, H);
    layer(gFx, gcam, D.text);
    drawLine(gFx, line, st, t, { inkChar: inkGlyph });
    const [x, y, w, h] = lineBox(layoutLine(line, st));
    const cx = x - 260 + (w + 520) * ease.inOutSine(p);
    gFx.globalCompositeOperation = 'source-in';
    gFx.translate(cx, y + h / 2);
    gFx.rotate(0.38);
    const band = gFx.createLinearGradient(-110, 0, 110, 0);
    band.addColorStop(0, 'rgba(255,255,255,0)');
    band.addColorStop(0.5, `rgba(${sw.color ?? '255,250,240'},0.95)`);
    band.addColorStop(1, 'rgba(255,255,255,0)');
    gFx.fillStyle = band;
    gFx.fillRect(-110, -h * 2, 220, h * 4);
    reset(gFx);
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'lighter';
    g.drawImage(fxCanvas, 0, 0);
    g.restore();
  }

  // soft shadow (or glow) behind a line when the picture under it fights the
  // text colour — keeps lyrics legible whatever the final image looks like
  function scrim(g, line, st, t, slot) {
    const light = hexLum(st.color) > 0.5;
    const [x, y, w, h] = lineBox(layoutLine(line, st));
    const lum = lumaUnder(slot, x, y, w, h);
    const need = light ? lum - 0.45 : 0.5 - lum;
    if (need <= 0.02) return;
    const first = line.chars[0][1];
    const env = clamp((t - first + 0.1) / 0.3) * (1 - clamp((t - exitAt(line, st)) / (st.outDur ?? 0.35)));
    const a = Math.min(0.3, need) * env;
    if (a <= 0.01) return;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.max(w, h) * 0.75;
    g.save();
    g.translate(cx, cy);
    g.scale((w * 0.75 + 80) / r, (h * 0.85 + 80) / r);
    const grd = g.createRadialGradient(0, 0, 0, 0, 0, r);
    const col = light ? '0,0,0' : '255,255,255';
    grd.addColorStop(0, `rgba(${col},${a})`);
    grd.addColorStop(0.6, `rgba(${col},${a * 0.6})`);
    grd.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = grd;
    g.fillRect(-r, -r, 2 * r, 2 * r);
    g.restore();
  }

  /**
   * Render the frame centred on t.  samples > 1 averages sub-frames across
   * the shutter interval `shutter` (seconds).
   */
  async function renderFrame(t, { samples = 1, shutter = 0 } = {}) {
    const shot = shots[story.indexAt(t)];
    const trC = transitionAt(t);
    const ids = new Set(shot.slots);
    for (const s of [shot.prev, shot.next, trC?.A, trC?.B]) s?.slots.forEach((id) => ids.add(id));
    for (const [t0, d, id] of story.inserts) if (t + shutter >= t0 && t - shutter < t0 + d) ids.add(id);
    const P = await slots.get([...ids]);
    setStreaks(samples < 3);

    const n = Math.max(1, samples);
    const dp = shutter / n;
    for (let k = 0; k < n; k++) {
      let ts = n > 1 ? t + shutter * ((k + 0.5) / n - 0.5) : t;
      // never blend across a hard cut
      if (!trC) ts = clamp(ts, shot.t0, shot.t1 - 1e-4);
      renderSample(gScene, ts, shot, P, dp);
      gAcc.globalAlpha = 1 / (k + 1);
      gAcc.drawImage(scene, 0, 0);
    }
    gAcc.globalAlpha = 1;
    composite(t, shot, P);
  }

  function composite(t, shot, P) {
    const k = story.intensity(t);
    const age = t - shot.t0;
    const enter = shot.enter?.type;
    let flash = 0;
    let flashColor = shot.enter?.color ?? '#ffffff';
    let ab = 0;
    let blur = 0;
    // soft light rather than a hard white-out
    if (enter === 'flash' && age < 0.9) flash = 0.35 * Math.exp(-age / 0.22);
    if (enter === 'drop' && age < 0.9) {
      flash = Math.max(flash, 0.55 * Math.exp(-age / 0.14));
      blur += 0.08 * Math.exp(-age / 0.15);
    }
    if (enter === 'fade' && age < 1) {
      flash = 1 - span(age, 0, 0.9, ease.inOutSine);
      flashColor = '#000000';
    }

    reset(gPost);
    gPost.fillStyle = '#000';
    gPost.fillRect(0, 0, W, H);
    if (ab > 0.0006) fx.chromatic(gPost, acc, ab);
    else gPost.drawImage(acc, 0, 0);
    
    reset(gPost);
    fx.bloom(gPost, post, keys(LOOK.bloom, t));
    if (shot.rays) fx.godRays(gPost, t, shot.rays[0], shot.rays[1], 0.7, '255,214,150');
    for (const [t0, amp, decay, x, y, col] of LOOK.rays) {
      const a = t - t0;
      if (a >= 0 && a < decay * 5) fx.godRays(gPost, t, x, y, amp * Math.exp(-a / decay), col);
    }
    for (const [t0, amp, decay, x, y, col] of LOOK.flares) {
      const a = t - t0;
      if (a >= -0.02 && a < decay * 5) fx.flare(gPost, x, y, amp * Math.exp(-Math.max(0, a) / decay), col);
    }
    fx.lightLeak(gPost, t, keys(LOOK.leak, t));
    fx.flash(gPost, flashColor, flash);
    fx.vignette(gPost, 0.18);
    fx.grain(gPost, t, 0.045);

    // ---- typography that stays locked to the screen
    const slot = shot.slot ? P[shot.slot] : null;
    const lb = keys(LOOK.letterbox, t);
    const bright = shot.bright ?? (slot ? slot.mean > 0.6 : false);
    const subDark = shot.bright ?? (slot ? lumaUnder(slot, 560, 940, 800, 90) > 0.62 : false);
    const subs = (g, y, dark) => story.lyricStyles.forEach((st, i) => drawSubtitle(g, lyrics[i], st, t, { y, dark, until: lyrics[i + 1] ? lyrics[i + 1].chars[0][1] - 0.2 : Infinity }));
    if (lb <= 0.5) subs(gPost, 1000, subDark);
    for (const [t0, num, cn, en] of story.chapters) chapter(gPost, t, t0, num, cn, en, { color: bright ? '30,24,24' : '255,255,255' });

    // ---- letterbox + output
    reset(gOut);
    gOut.drawImage(post, 0, 0);
    if (lb > 0.004) {
      const h = lb * 120;
      gOut.fillStyle = '#000';
      gOut.fillRect(0, 0, W, h);
      gOut.fillRect(0, H - h, W, h);
      // subtitles sit inside the lower bar while it is closed
      if (lb > 0.5) subs(gOut, 1036, false);
    }
  }

  return {
    duration: DURATION,
    renderFrame,
    capture: (q = 0.94) => out.toDataURL('image/jpeg', q),
    slotUses: () => story.slotUses(),
    images: files,
  };
}
