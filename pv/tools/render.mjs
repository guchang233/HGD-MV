#!/usr/bin/env node
// Render the PV frame by frame in headless Chromium and encode it with ffmpeg.
//
//   node pv/tools/render.mjs                      full render -> 花骨朵_PV.mp4
//   node pv/tools/render.mjs --stills 3,16.5,47.2 review stills -> pv/build/stills
//   node pv/tools/render.mjs --from 30 --to 40 --out draft.mp4
//   options: --fps 30  --samples 6 (motion-blur sub-frames)  --shutter 180
//            --workers 4  --bitrate 4M (two-pass) | --crf 21  --force
// The soundtrack is the original song, taken whole from 花骨朵.mp4.  Pictures
// are read from pv/assets/images (see pv/PROMPTS.md); empty slots render as
// placeholders.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync, execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PV_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(PV_DIR, '..');
const BUILD = path.join(PV_DIR, 'build');

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
    return acc;
  }, []),
);
const FPS = Number(args.fps ?? 30);
const SAMPLES = Number(args.samples ?? 6);
const SHUTTER = (Number(args.shutter ?? 180) / 360) / FPS; // exposure in seconds
const WORKERS = Number(args.workers ?? Math.max(1, Math.min(4, os.cpus().length)));
const QUALITY = Number(args.quality ?? 0.95);

// Map picture files to slot ids: 05.png, S05.jpg, 05_少女与孩子.webp ...
// plus depth layers from tools/ai/make_layers.py (layers/05_bg.webp, _fg).
function scanImages() {
  const dir = path.join(PV_DIR, 'assets', 'images');
  const files = {};
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir).sort()) {
    const m = /^[Ss]?(\d{2})(?:[ _\-.].*)?\.(png|jpe?g|webp)$/i.exec(name);
    if (m && !files[m[1]]) files[m[1]] = `assets/images/${encodeURIComponent(name)}`;
  }
  const layers = path.join(dir, 'layers');
  if (fs.existsSync(layers)) {
    for (const name of fs.readdirSync(layers)) {
      const m = /^(\d{2})_(bg|fg)\.(png|webp)$/.exec(name);
      if (m && files[m[1]]) files[`${m[1]}_${m[2]}`] = `assets/images/layers/${name}`;
    }
  }
  return files;
}

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    const root = execSync('npm root -g').toString().trim();
    return import(pathToFileURL(path.join(root, 'playwright', 'index.mjs')).href);
  }
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.wav': 'audio/wav' };
function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(PV_DIR, rel === '/' ? 'index.html' : rel);
    if (!file.startsWith(PV_DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'max-age=3600' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

async function openWorker(browser, url) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('[page error]', e.message));
  page.on('console', (m) => m.type() === 'error' && console.error('[console]', m.text()));
  await page.goto(url);
  await page.waitForFunction(() => window.PV_READY === true, null, { timeout: 120000 });
  return page;
}

async function renderTo(page, t, file, quality) {
  const data = await page.evaluate(
    async ([t, q, samples, shutter]) => {
      await window.PV.renderFrame(t, { samples, shutter });
      return window.PV.capture(q);
    },
    [t, quality, SAMPLES, SHUTTER],
  );
  fs.writeFileSync(file, Buffer.from(data.slice(data.indexOf(',') + 1), 'base64'));
}

async function main() {
  fs.mkdirSync(BUILD, { recursive: true });
  const images = scanImages();
  fs.writeFileSync(path.join(BUILD, 'images.json'), JSON.stringify(images, null, 1));
  const filled = Object.keys(images).filter((k) => /^\d{2}$/.test(k));
  console.log(`pictures: ${filled.length ? filled.map((k) => `S${k}`).join(' ') : 'none yet'} (empty slots render as placeholders)`);
  const audio = path.join(BUILD, 'song.wav');
  if (!fs.existsSync(audio)) {
    spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(ROOT, '花骨朵.mp4'), '-vn', '-c:a', 'pcm_s16le', '-ar', '44100', audio], { stdio: 'inherit' });
  }
  const { chromium } = await loadPlaywright();
  const server = await serve();
  const url = `http://127.0.0.1:${server.address().port}/index.html?render`;
  const browser = await chromium.launch({ args: ['--disable-gpu', '--force-color-profile=srgb', '--font-render-hinting=none'] });

  if (args.stills) {
    const dir = path.join(BUILD, 'stills');
    fs.mkdirSync(dir, { recursive: true });
    const page = await openWorker(browser, url);
    for (const s of String(args.stills).split(',')) {
      const t = Number(s);
      const file = path.join(dir, `t${t.toFixed(2).padStart(6, '0')}.jpg`);
      const t0 = Date.now();
      await renderTo(page, t, file, 0.92);
      console.log(`${file}  (${Date.now() - t0} ms)`);
    }
    await browser.close();
    server.close();
    return;
  }

  const probe = await openWorker(browser, url);
  const duration = await probe.evaluate(() => window.PV.duration);
  await probe.close();
  const from = Number(args.from ?? 0);
  const to = Math.min(Number(args.to ?? duration), duration);
  const first = Math.round(from * FPS);
  const last = Math.round(to * FPS); // exclusive
  const frameDir = path.join(BUILD, `out_${FPS}_${SAMPLES}`);
  fs.mkdirSync(frameDir, { recursive: true });
  const total = last - first;
  console.log(`rendering ${total} frames @ ${FPS} fps, ${SAMPLES} motion-blur samples, ${WORKERS} workers`);

  let done = 0;
  const started = Date.now();
  const chunk = Math.ceil(total / WORKERS);
  await Promise.all(
    Array.from({ length: WORKERS }, async (_, w) => {
      const a = first + w * chunk;
      const b = Math.min(last, a + chunk);
      if (a >= b) return;
      const page = await openWorker(browser, url);
      for (let i = a; i < b; i++) {
        const file = path.join(frameDir, `${String(i).padStart(5, '0')}.jpg`);
        if (!args.force && fs.existsSync(file)) {
          done++;
          continue;
        }
        await renderTo(page, (i + 0.5) / FPS, file, QUALITY);
        done++;
        if (done % 30 === 0) {
          const el = (Date.now() - started) / 1000;
          console.log(`  ${done}/${total}  ${(done / el).toFixed(1)} fps  eta ${((total - done) / (done / el)).toFixed(0)}s`);
        }
      }
      await page.close();
    }),
  );
  await browser.close();
  server.close();

  const outFile = path.resolve(ROOT, args.out ?? '花骨朵_PV.mp4');
  const input = ['-framerate', String(FPS), '-start_number', String(first), '-i', path.join(frameDir, '%05d.jpg')];
  const video = ['-frames:v', String(total), '-c:v', 'libx264', '-preset', args.preset ?? 'slow',
    '-x264-params', 'aq-mode=3:aq-strength=0.9', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-tune', 'film',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709'];
  const sound = ['-c:a', 'aac', '-b:a', '256k', '-af', `afade=t=out:st=${Math.max(0, to - from - 0.6)}:d=0.6`];
  const run = (argv) => {
    const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...argv], { stdio: 'inherit', cwd: BUILD });
    if (r.status !== 0) process.exit(r.status ?? 1);
  };
  if (args.bitrate) {
    // two-pass ABR: hits a predictable file size (GitHub caps files at 100 MB)
    const rate = String(args.bitrate);
    run([...input, ...video, '-b:v', rate, '-maxrate', '14M', '-bufsize', '28M', '-pass', '1', '-an', '-f', 'null', '/dev/null']);
    run([...input, '-ss', String(from), '-t', String(to - from), '-i', audio, ...video, '-b:v', rate, '-maxrate', '14M', '-bufsize', '28M', '-pass', '2', ...sound,
      '-movflags', '+faststart', '-metadata', 'title=花骨朵 PV', outFile]);
  } else {
    run([...input, '-ss', String(from), '-t', String(to - from), '-i', audio, ...video, '-crf', String(args.crf ?? 21), '-maxrate', '18M', '-bufsize', '36M', ...sound,
      '-movflags', '+faststart', '-metadata', 'title=花骨朵 PV', outFile]);
  }
  console.log(`wrote ${outFile}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
