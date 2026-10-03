// Ink plum (墨梅): a procedurally grown branch painted with brush-like
// strokes, plus buds and blossoms that open on musical onsets.
import { TAU, clamp, ease, lerp, mulberry32, rgba } from './core.js';

export const BLOSSOM_RED = {
  edge: '#f39377',
  mid: '#e4583f',
  core: '#a3151b',
  line: 'rgba(105,14,14,0.55)',
  stamen: 'rgba(60,22,14,0.85)',
  pollen: '#f6c752',
  bud: '#b42a24',
};

export const BLOSSOM_WHITE = {
  edge: '#ffffff',
  mid: '#f4f1ec',
  core: '#d9cfc4',
  line: 'rgba(40,36,34,0.9)',
  stamen: 'rgba(40,30,28,0.9)',
  pollen: '#c8102e',
  bud: '#efe9e1',
};

export class PlumTree {
  constructor(o) {
    this.rnd = mulberry32(o.seed ?? 1);
    this.speed = o.speed ?? 420;
    this.depthMax = o.depthMax ?? 3;
    this.budRate = o.budRate ?? 0.35;
    this.whipRate = o.whipRate ?? 0.2;
    this.branchRate = o.branchRate ?? [0.42, 0.34, 0.2];
    this.segs = [];
    this.buds = [];
    this.knots = [];
    this.limb(o.root, o.angle, o.width, o.tip ?? 5, o.length, 0, o.start ?? 0, o.angle);
    this.segs.sort((a, b) => a.depth - b.depth);
    this.end = Math.max(...this.segs.map((s) => s.t1));
  }

  // One limb: kinked like a real plum branch, tapering from w0 to wEnd.
  limb(p, ang, w0, wEnd, len, depth, birth, heading) {
    const r = this.rnd;
    const step = [64, 42, 30, 24][Math.min(depth, 3)];
    const n = Math.max(3, Math.round(len / step));
    const kink = [0.26, 0.4, 0.5, 0.5][Math.min(depth, 3)];
    const phase = r() * 10;
    const width = (f) => lerp(w0, wEnd, Math.pow(f, 0.75)) * (1 + 0.1 * Math.sin(f * 11 + phase));
    let { x, y } = p;
    let a = ang;
    let b = birth;
    for (let i = 0; i < n; i++) {
      a += r.range(-1, 1) * kink;
      a += (heading - a) * (depth === 0 ? 0.35 : 0.18); // keep the overall gesture
      if (depth >= 2) a += (-Math.PI / 2 - a) * 0.08; // young shoots reach up
      const l = (len / n) * r.range(0.75, 1.25);
      const nx = x + Math.cos(a) * l;
      const ny = y + Math.sin(a) * l;
      const f0 = i / n;
      const f1 = (i + 1) / n;
      const dur = l / (this.speed * Math.pow(0.8, depth));
      this.segs.push({ x0: x, y0: y, x1: nx, y1: ny, w0: width(f0), w1: width(f1), t0: b, t1: b + dur, depth, s: r() });
      if (width(f0) > 9 && r() < 0.25) this.knots.push({ x, y, r: width(f0) * r.range(0.45, 0.6), t: b, a });
      if (depth < this.depthMax && i < n - 1 && i > 0 && r() < this.branchRate[depth]) {
        const side = r.sign();
        const ca = a + side * r.range(0.55, 1.05);
        const rest = len * (1 - f1);
        this.limb({ x: nx, y: ny }, ca, Math.max(1.6, width(f1) * r.range(0.45, 0.62)), 1.1, Math.max(70, rest * r.range(0.45, 0.8)), depth + 1, b + dur, ca);
      }
      if (depth >= 1 && depth < 3 && i > 0 && r() < this.whipRate) {
        const wa = -Math.PI / 2 + r.range(-0.5, 0.5);
        this.limb({ x: nx, y: ny }, wa, Math.min(3.2, width(f1) * 0.5), 0.8, r.range(60, 150), 3, b + dur, wa);
      }
      if (depth >= 1 && r() < this.budRate) this.addBud(nx, ny, a, b + dur);
      x = nx;
      y = ny;
      b += dur;
    }
    if (depth >= 1) this.addBud(x, y, a, b);
  }

  addBud(x, y, a, t) {
    const r = this.rnd;
    const side = r.sign();
    const off = r.range(2, 6);
    this.buds.push({
      x: x + Math.cos(a + (side * Math.PI) / 2) * off,
      y: y + Math.sin(a + (side * Math.PI) / 2) * off,
      t,
      size: r.range(0.7, 1.1),
      rot: r() * TAU,
      tilt: r() < 0.3 ? r.range(0.45, 0.7) : 1, // side-on blossoms are squashed
      tiltA: r() * TAU,
      bloom: Infinity,
      seed: r(),
    });
  }

  /** Make the bud nearest to (x, y) a hero blossom of radius scale `size`. */
  hero(x, y, size, bloomAt) {
    let best = null;
    let bd = Infinity;
    for (const b of this.buds) {
      const d = Math.hypot(b.x - x, b.y - y);
      if (d < bd && b.bloom === Infinity) {
        bd = d;
        best = b;
      }
    }
    if (best) Object.assign(best, { size, tilt: 1, bloom: bloomAt, hero: true });
    return best;
  }

  /** Each onset opens a small cluster of buds that already exist. */
  assignBlooms(times, seed = 3, cluster = 3) {
    const r = mulberry32(seed);
    for (const t of times) {
      const ready = this.buds.filter((b) => b.bloom === Infinity && !b.hero && b.t < t - 0.15);
      if (!ready.length) continue;
      const seedBud = ready[Math.floor(r() * ready.length)];
      const near = ready
        .map((b) => [Math.hypot(b.x - seedBud.x, b.y - seedBud.y), b])
        .sort((m, n) => m[0] - n[0])
        .slice(0, cluster);
      near.forEach(([, b], i) => {
        b.bloom = t + i * 0.06;
        b.size *= 1.2;
      });
    }
  }

  /** Every remaining bud opens at a random time in [a, b]. */
  bloomRest(a, b, frac = 1, seed = 5) {
    const r = mulberry32(seed);
    for (const bud of this.buds) {
      if (bud.bloom === Infinity && r() < frac) bud.bloom = Math.max(lerp(a, b, r()), bud.t + 0.2);
    }
  }

  draw(g, t, o = {}) {
    const inkA = o.alpha ?? 1;
    const grownT = o.grownT ?? t;
    // 1. brush body (dark ink) + a paler core that gives the wood volume
    for (const s of this.segs) {
      const k = clamp((grownT - s.t0) / (s.t1 - s.t0));
      if (k <= 0) continue;
      const x1 = lerp(s.x0, s.x1, k);
      const y1 = lerp(s.y0, s.y1, k);
      const w1 = lerp(s.w0, s.w1, k);
      const dx = x1 - s.x0;
      const dy = y1 - s.y0;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const tone = s.depth === 0 ? 24 : s.depth === 1 ? 30 : 40;
      g.fillStyle = `rgba(${tone},${tone - 3},${tone - 6},${(s.depth >= 3 ? 0.88 : 0.95) * inkA})`;
      g.beginPath();
      g.moveTo(s.x0 + (nx * s.w0) / 2, s.y0 + (ny * s.w0) / 2);
      g.lineTo(x1 + (nx * w1) / 2, y1 + (ny * w1) / 2);
      g.lineTo(x1 - (nx * w1) / 2, y1 - (ny * w1) / 2);
      g.lineTo(s.x0 - (nx * s.w0) / 2, s.y0 - (ny * s.w0) / 2);
      g.closePath();
      g.fill();
      g.beginPath();
      g.arc(s.x0, s.y0, s.w0 / 2, 0, TAU);
      g.arc(x1, y1, w1 / 2, 0, TAU);
      g.fill();
      if (s.w0 > 7) {
        // lighter, broken core stroke (墨分五色): volume + dry-brush feel
        const off = 0.18 + 0.1 * Math.sin(s.s * 20);
        const a0 = 0.05 + 0.3 * ((s.s * 7.3) % 1);
        const a1 = Math.min(1, a0 + 0.35 + 0.5 * ((s.s * 3.1) % 1)) * k;
        if (a1 > a0) {
          g.strokeStyle = `rgba(118,112,104,${0.42 * inkA})`;
          g.lineWidth = s.w0 * 0.22;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(lerp(s.x0, x1, a0) + nx * off * s.w0, lerp(s.y0, y1, a0) + ny * off * s.w0);
          g.lineTo(lerp(s.x0, x1, a1) + nx * off * w1, lerp(s.y0, y1, a1) + ny * off * w1);
          g.stroke();
        }
        if (((s.s * 13.7) % 1) < 0.45) {
          // a scratchy dry streak near the edge
          const e = -0.32;
          g.strokeStyle = `rgba(222,220,212,${0.45 * inkA})`;
          g.lineWidth = Math.max(0.8, s.w0 * 0.06);
          g.beginPath();
          g.moveTo(lerp(s.x0, x1, 0.15) + nx * e * s.w0, lerp(s.y0, y1, 0.15) + ny * e * s.w0);
          g.lineTo(lerp(s.x0, x1, 0.15 + 0.5 * k) + nx * e * w1, lerp(s.y0, y1, 0.15 + 0.5 * k) + ny * e * w1);
          g.stroke();
        }
      }
    }
    // 2. knots / moss dots
    for (const kn of this.knots) {
      if (grownT < kn.t + 0.05) continue;
      g.fillStyle = `rgba(10,9,8,${0.9 * inkA})`;
      g.beginPath();
      g.ellipse(kn.x, kn.y, kn.r, kn.r * 0.55, kn.a, 0, TAU);
      g.fill();
    }
    // 3. buds and blossoms
    const scale = o.blossomScale ?? 1;
    for (const b of this.buds) {
      if (grownT < b.t) continue;
      const appear = ease.outBack(clamp((grownT - b.t) / 0.35));
      const open = clamp((t - b.bloom) / (b.hero ? 0.7 : 0.5));
      const R = 15 * b.size * scale * (open > 0 ? 1 : 0.8);
      g.save();
      g.translate(b.x, b.y);
      if (b.tilt < 1) {
        g.rotate(b.tiltA);
        g.scale(1, b.tilt);
        g.rotate(-b.tiltA);
      }
      drawBlossom(g, 0, 0, R * appear, b.rot, open, o.palette ?? BLOSSOM_RED, b.seed, inkA);
      g.restore();
    }
  }

  /** Positions of buds that open within [a, b) (for petal/pollen bursts). */
  bloomsBetween(a, b) {
    return this.buds.filter((bud) => bud.bloom >= a && bud.bloom < b);
  }
}

/**
 * A five-petal plum blossom.  open: 0 = closed bud, 1 = fully open.
 */
export function drawBlossom(g, x, y, R, rot, open, pal = BLOSSOM_RED, seed = 0.5, alpha = 1) {
  if (R <= 0.3) return;
  g.save();
  g.globalAlpha *= alpha;
  if (open <= 0.001) {
    // closed bud: teardrop with a dark calyx
    g.fillStyle = 'rgba(38,24,18,0.92)';
    g.beginPath();
    g.ellipse(x - R * 0.12, y + R * 0.2, R * 0.16, R * 0.1, -0.5, 0, TAU);
    g.ellipse(x + R * 0.12, y + R * 0.2, R * 0.16, R * 0.1, 0.5, 0, TAU);
    g.fill();
    const bg = g.createRadialGradient(x - R * 0.08, y - R * 0.12, R * 0.02, x, y, R * 0.34);
    bg.addColorStop(0, pal.edge);
    bg.addColorStop(0.55, pal.bud);
    bg.addColorStop(1, pal.core);
    g.fillStyle = bg;
    g.beginPath();
    g.moveTo(x, y - R * 0.36);
    g.bezierCurveTo(x + R * 0.3, y - R * 0.2, x + R * 0.26, y + R * 0.16, x, y + R * 0.18);
    g.bezierCurveTo(x - R * 0.26, y + R * 0.16, x - R * 0.3, y - R * 0.2, x, y - R * 0.36);
    g.fill();
    g.restore();
    return;
  }
  const o = ease.outBack(open, 1.9);
  const grd = g.createRadialGradient(x, y, R * 0.05, x, y, R * 1.05);
  grd.addColorStop(0, pal.core);
  grd.addColorStop(0.45, pal.mid);
  grd.addColorStop(1, pal.edge);
  g.fillStyle = grd;
  g.strokeStyle = pal.line;
  g.lineWidth = Math.max(0.6, R * 0.05);
  const unfurl = (1 - clamp(open * 1.4)) * 0.6;
  for (let i = 0; i < 5; i++) {
    const j = ((seed * 7.31 + i * 0.137) % 1) - 0.5;
    const a = rot + (i * TAU) / 5 + j * 0.25 + unfurl;
    const pr = R * 0.5 * (0.88 + 0.2 * j) * o;
    const pd = R * 0.46 * o;
    g.beginPath();
    g.ellipse(x + Math.cos(a) * pd, y + Math.sin(a) * pd, pr, pr * 0.9, a, 0, TAU);
    g.fill();
    g.stroke();
  }
  // core
  g.fillStyle = pal.core;
  g.beginPath();
  g.arc(x, y, R * 0.16 * o, 0, TAU);
  g.fill();
  // stamens
  const st = clamp((open - 0.35) / 0.65);
  if (st > 0) {
    g.strokeStyle = pal.stamen;
    g.lineWidth = Math.max(0.5, R * 0.035);
    g.fillStyle = pal.pollen;
    for (let i = 0; i < 9; i++) {
      const a = rot + i * 0.698 + ((seed * 3.7 + i * 0.31) % 1) * 0.3;
      const l = R * (0.42 + ((seed * 5.3 + i * 0.29) % 1) * 0.2) * st;
      const ex = x + Math.cos(a) * l;
      const ey = y + Math.sin(a) * l;
      g.beginPath();
      g.moveTo(x + Math.cos(a) * R * 0.1, y + Math.sin(a) * R * 0.1);
      g.lineTo(ex, ey);
      g.stroke();
      g.beginPath();
      g.arc(ex, ey, Math.max(0.6, R * 0.055), 0, TAU);
      g.fill();
    }
  }
  g.restore();
}

/** A single petal shape (teardrop/heart), centred on 0,0, length L. */
export function petalPath(g, L) {
  const w = L * 0.62;
  g.beginPath();
  g.moveTo(0, L * 0.5);
  g.bezierCurveTo(w * 0.9, L * 0.2, w * 0.8, -L * 0.45, w * 0.12, -L * 0.5);
  g.quadraticCurveTo(0, -L * 0.38, -w * 0.12, -L * 0.5);
  g.bezierCurveTo(-w * 0.8, -L * 0.45, -w * 0.9, L * 0.2, 0, L * 0.5);
  g.closePath();
}

export { rgba };
