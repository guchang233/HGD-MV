// Frame compositor: shots -> scene -> film post -> letterboxed output.
import { W, H, VIEW, makeCanvas, ctx2d } from './core.js';
import { loadTiming } from './timing.js';
import { loadFonts } from './type.js';
import { initSprites } from './particles.js';
import { FX } from './fx.js';
import { Footage } from './footage.js';
import { buildTimeline } from './timeline.js';

export async function boot(out, { base = '.' } = {}) {
  await Promise.all([loadTiming(`${base}/assets/timing.json`), loadFonts(`${base}/assets/fonts`)]);
  initSprites();
  const fx = new FX();
  const footage = new Footage(`${base}/build/frames`);
  const tl = buildTimeline();

  const gOut = ctx2d(out);
  const scene = makeCanvas(W, H);
  const gScene = ctx2d(scene);
  const layer = makeCanvas(W, H);
  const gLayer = ctx2d(layer);
  const post = makeCanvas(W, H);
  const gPost = ctx2d(post);

  const reset = (g) => {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    g.filter = 'none';
  };

  async function renderFrame(t) {
    const shots = tl.shotsAt(t);
    const imgs = await Promise.all(shots.map((s) => (s.need ? footage.frames(s.need(t)) : [])));

    // ---- shots
    reset(gScene);
    gScene.fillStyle = '#000';
    gScene.fillRect(0, 0, W, H);
    shots.forEach((s, i) => {
      const entering = i > 0 && s.enter && t < s.t0 + s.enter.dur;
      const g = entering ? gLayer : gScene;
      if (entering) {
        reset(gLayer);
        gLayer.clearRect(0, 0, W, H);
      }
      g.save();
      g.beginPath();
      g.rect(VIEW.x, VIEW.y, VIEW.w, VIEW.h);
      g.clip();
      g.translate(VIEW.x, VIEW.y);
      s.draw(g, t, imgs[i]);
      g.restore();
      reset(g);
      if (entering) {
        const p = (t - s.t0) / s.enter.dur;
        if (s.enter.type === 'ink') fx.inkTransition(gScene, layer, p, s.enter.cx, s.enter.cy);
        else {
          gScene.globalAlpha = p;
          gScene.drawImage(layer, 0, 0);
          gScene.globalAlpha = 1;
        }
      }
    });

    // ---- film post
    const P = tl.post(t);
    reset(gPost);
    gPost.fillStyle = '#000';
    gPost.fillRect(0, 0, W, H);
    if (P.ab > 0.0005) fx.chromatic(gPost, scene, P.ab);
    else gPost.drawImage(scene, 0, 0);
    reset(gPost);
    fx.zoomBlur(gPost, scene, P.blur);
    reset(gPost);
    gPost.save();
    gPost.beginPath();
    gPost.rect(VIEW.x, VIEW.y, VIEW.w, VIEW.h);
    gPost.clip();
    fx.bloom(gPost, post, P.bloom);
    for (const r of P.rays) fx.godRays(gPost, t, r.x, r.y, r.amount, r.color);
    fx.lightLeak(gPost, t, P.leak);
    for (const [color, v] of P.flash) fx.flash(gPost, color, v);
    fx.vignette(gPost, P.vignette);
    fx.grain(gPost, t, P.grain);
    gPost.restore();

    // ---- letterbox / aperture
    reset(gOut);
    gOut.fillStyle = '#000';
    gOut.fillRect(0, 0, W, H);
    const vh = Math.round(VIEW.h * P.aperture);
    if (vh > 0) {
      const y0 = Math.round(H / 2 - vh / 2);
      gOut.drawImage(post, 0, y0, W, vh, 0, y0, W, vh);
    }
  }

  return {
    duration: tl.duration,
    renderFrame,
    capture: (q = 0.94) => out.toDataURL('image/jpeg', q),
  };
}
