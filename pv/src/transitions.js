// Two-shot transitions.  The outgoing frame A and the incoming frame B are
// fully rendered canvases; each transition composites them at progress p
// (0..1 over [cut - pre, cut + post]).  Fast ones smear their own motion
// across the shutter interval `o.dp` (in units of p) so whips read as a
// real camera whip rather than a hard slide.
import { W, H, TAU, clamp, ease, lerp, mulberry32, makeCanvas } from './core.js';
import { brushSwipe } from './graphics.js';

// low-resolution copies stand in for a gaussian blur (cheap in software)
const soft = [];
function blurred(src, level) {
  const k = level > 0.66 ? 2 : level > 0.33 ? 1 : 0;
  const w = [480, 320, 192][k];
  soft[k] ??= makeCanvas(w, Math.round((w * 9) / 16));
  const c = soft[k];
  const g = c.getContext('2d');
  g.filter = 'blur(1.5px)';
  g.drawImage(src, 0, 0, c.width, c.height);
  g.filter = 'none';
  return c;
}
// draw src with a defocus amount 0..1
function defocus(g, src, amount, alpha = 1) {
  g.globalAlpha = alpha;
  g.drawImage(src, 0, 0);
  if (amount > 0.02) {
    g.globalAlpha = alpha * clamp(amount * 1.4);
    g.drawImage(blurred(src, amount), 0, 0, W, H);
  }
  g.globalAlpha = 1;
}

// rgba helper for a "#rrggbb" + alpha
const tint = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

// vertical band of light at x
function softEdge(g, x, color, a, w) {
  const grd = g.createLinearGradient(x - w, 0, x + w, 0);
  grd.addColorStop(0, tint(color, 0));
  grd.addColorStop(0.5, tint(color, a));
  grd.addColorStop(1, tint(color, 0));
  g.fillStyle = grd;
  g.fillRect(x - w, 0, 2 * w, H);
}

// Average m copies drawn by paint(g, q) for q across [p - dp/2, p + dp/2].
function smear(g, tmp, p, dp, pixelsPerP, paint) {
  const m = clamp(Math.ceil((Math.abs(pixelsPerP) * dp) / 10), 1, 18);
  if (m === 1) {
    paint(g, p);
    return;
  }
  const gt = tmp.getContext('2d');
  for (let j = 0; j < m; j++) {
    const q = p + dp * ((j + 0.5) / m - 0.5);
    gt.setTransform(1, 0, 0, 1, 0, 0);
    gt.globalAlpha = 1;
    gt.globalCompositeOperation = 'source-over';
    gt.fillStyle = '#000';
    gt.fillRect(0, 0, W, H);
    paint(gt, q);
    g.globalAlpha = 1 / (j + 1);
    g.drawImage(tmp, 0, 0);
  }
  g.globalAlpha = 1;
}

// offset curve: slow start, fastest exactly at the cut (pc), slow landing
function whipCurve(p, pc) {
  if (p < pc) return 0.5 * ease.inCubic(clamp(p / pc));
  return 0.5 + 0.5 * ease.outCubic(clamp((p - pc) / (1 - pc)));
}

export const TRANSITIONS = {
  // camera whip: A flies out, B flies in, both heavily smeared
  whip: {
    pre: 0.1,
    post: 0.16,
    draw(g, A, B, p, o) {
      const pc = this.pre / (this.pre + this.post);
      const dir = o.dir ?? 1;
      const vert = o.axis === 'y';
      const span = vert ? H : W;
      const speed = (whipCurve(Math.min(1, p + 0.01), pc) - whipCurve(Math.max(0, p - 0.01), pc)) / 0.02;
      smear(g, o.tmp, p, o.dp, speed * span, (gg, q) => {
        const u = whipCurve(clamp(q), pc) * span;
        if (vert) {
          gg.drawImage(A, 0, -dir * u);
          gg.drawImage(B, 0, dir * (span - u));
        } else {
          gg.drawImage(A, -dir * u, 0);
          gg.drawImage(B, dir * (span - u), 0);
        }
      });
    },
  },
  // zoom through: A rushes toward the lens, B lands from too close
  zoom: {
    pre: 0.14,
    post: 0.24,
    draw(g, A, B, p, o) {
      const pc = this.pre / (this.pre + this.post);
      const cx = o.x ?? W / 2;
      const cy = o.y ?? H / 2;
      const scaleAt = (q) => (q < pc ? 1 + 3.5 * ease.inExpo(q / pc) : 2.6 - 1.6 * ease.outExpo((q - pc) / (1 - pc)));
      const rate = Math.abs(scaleAt(Math.min(1, p + 0.01)) - scaleAt(Math.max(0, p - 0.01))) / 0.02;
      smear(g, o.tmp, p, o.dp, rate * 900, (gg, q) => {
        q = clamp(q);
        const s = scaleAt(q);
        gg.setTransform(s, 0, 0, s, cx * (1 - s), cy * (1 - s));
        gg.drawImage(q < pc ? A : B, 0, 0);
        gg.setTransform(1, 0, 0, 1, 0, 0);
        const white = q < pc ? ease.inCubic(q / pc) : 1 - ease.outCubic((q - pc) / (1 - pc));
        gg.fillStyle = `rgba(255,255,255,${0.35 * white})`;
        gg.fillRect(0, 0, W, H);
      });
    },
  },
  // slower push, both frames visible
  push: {
    pre: 0.18,
    post: 0.22,
    draw(g, A, B, p, o) {
      const dir = o.dir ?? 1;
      const pc = this.pre / (this.pre + this.post);
      const speed = (whipCurve(Math.min(1, p + 0.01), pc) - whipCurve(Math.max(0, p - 0.01), pc)) / 0.02;
      smear(g, o.tmp, p, o.dp, speed * W, (gg, q) => {
        const u = whipCurve(clamp(q), pc) * W;
        gg.drawImage(A, -dir * u, 0);
        gg.drawImage(B, dir * (W - u), 0);
        softEdge(gg, dir > 0 ? W - u : u, '#ffffff', 0.8, 26);
      });
    },
  },
  // circle opening from a point, red rim
  iris: {
    pre: 0,
    post: 0.42,
    draw(g, A, B, p, o) {
      const x = o.x ?? W / 2;
      const y = o.y ?? H / 2;
      const R = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) + 40;
      smear(g, o.tmp, p, o.dp, R * 1.5, (gg, q) => {
        q = clamp(q);
        const r = Math.max(0.1, R * ease.inOutCubic(q));
        gg.drawImage(A, 0, 0);
        gg.save();
        gg.beginPath();
        gg.arc(x, y, r, 0, TAU);
        gg.clip();
        gg.drawImage(B, 0, 0);
        gg.restore();
        gg.strokeStyle = tint(o.color ?? '#e2483a', 1 - q * 0.6);
        gg.lineWidth = 3 + 14 * (1 - q);
        gg.beginPath();
        gg.arc(x, y, r, 0, TAU);
        gg.stroke();
      });
    },
  },
  // diagonal blade wipe with a band of light on the edge
  slash: {
    pre: 0,
    post: 0.34,
    draw(g, A, B, p, o) {
      const dir = o.dir ?? 1;
      const slope = 0.42 * H;
      const c = o.color ?? '#ffffff';
      smear(g, o.tmp, p, o.dp, (W + 2 * slope) * 1.5, (gg, q) => {
        const e = ease.inOutCubic(clamp(q));
        const x = lerp(-slope - 40, W + slope + 40, e);
        gg.drawImage(A, 0, 0);
        gg.save();
        gg.beginPath();
        if (dir > 0) {
          gg.moveTo(-10, -10);
          gg.lineTo(x + slope, -10);
          gg.lineTo(x - slope, H + 10);
          gg.lineTo(-10, H + 10);
        } else {
          gg.moveTo(W + 10, -10);
          gg.lineTo(W - x - slope, -10);
          gg.lineTo(W - x + slope, H + 10);
          gg.lineTo(W + 10, H + 10);
        }
        gg.closePath();
        gg.clip();
        gg.drawImage(B, 0, 0);
        gg.restore();
        gg.save();
        gg.translate(dir > 0 ? x : W - x, H / 2);
        gg.rotate(Math.atan2(2 * slope, H) * (dir > 0 ? 1 : -1));
        const band = gg.createLinearGradient(-40, 0, 40, 0);
        band.addColorStop(0, tint(c, 0));
        band.addColorStop(0.5, tint(c, 0.9 * (1 - e * 0.4)));
        band.addColorStop(1, tint(c, 0));
        gg.globalCompositeOperation = 'screen';
        gg.fillStyle = band;
        gg.fillRect(-40, -H, 80, 2 * H);
        gg.restore();
      });
    },
  },
  // staggered horizontal blinds
  slats: {
    pre: 0,
    post: 0.42,
    draw(g, A, B, p, o) {
      const n = o.n ?? 9;
      const h = H / n;
      const col = o.color ?? '#e2483a';
      smear(g, o.tmp, p, o.dp, W * 2.6, (gg, q) => {
        gg.drawImage(A, 0, 0);
        for (let i = 0; i < n; i++) {
          const order = (o.dir ?? 1) > 0 ? i : n - 1 - i;
          const k = ease.inOutCubic(clamp(q * 1.7 - (order / n) * 0.7));
          if (k <= 0) continue;
          const w = W * k;
          const x = i % 2 ? W - w : 0;
          gg.drawImage(B, x, i * h, w, h, x, i * h, w, h);
          if (k < 1) {
            const ex = i % 2 ? x : x + w;
            const back = i % 2 ? 1 : -1;
            const trail = gg.createLinearGradient(ex, 0, ex + back * 160, 0);
            trail.addColorStop(0, tint(col, 0.85));
            trail.addColorStop(1, tint(col, 0));
            gg.fillStyle = trail;
            gg.fillRect(Math.min(ex, ex + back * 160), i * h, 160, h);
          }
        }
      });
    },
  },
  // ink bleeding across the frame
  ink: {
    pre: 0,
    post: 0.9,
    draw(g, A, B, p, o) {
      g.drawImage(A, 0, 0);
      o.fx.inkTransition(g, B, ease.inOutSine(p), o.x != null ? o.x / W : 0.5, o.y != null ? o.y / H : 0.5);
    },
  },
  dissolve: {
    pre: 0,
    post: 0.7,
    draw(g, A, B, p) {
      const e = ease.inOutSine(p);
      g.drawImage(A, 0, 0);
      const s = lerp(1.05, 1, e);
      g.globalAlpha = e;
      g.setTransform(s, 0, 0, s, (W / 2) * (1 - s), (H / 2) * (1 - s));
      g.drawImage(B, 0, 0);
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalAlpha = 1;
    },
  },
  // torn slices of both shots
  glitch: {
    pre: 0.06,
    post: 0.18,
    draw(g, A, B, p, o) {
      const pc = this.pre / (this.pre + this.post);
      g.drawImage(p < pc ? A : B, 0, 0);
      const r = mulberry32(Math.floor(p * 9) + 17 * (o.seed ?? 1));
      const amt = 1 - Math.abs(p - pc) / Math.max(pc, 1 - pc);
      const n = 6 + Math.floor(r() * 8);
      for (let i = 0; i < n; i++) {
        const y = r() * H;
        const h = 8 + r() * 90;
        const dx = (r() - 0.5) * 300 * amt;
        g.drawImage(r() < 0.5 ? A : B, 0, y, W, h, dx, y, W, h);
        if (r() < 0.4) {
          g.save();
          g.globalCompositeOperation = 'screen';
          g.fillStyle = r() < 0.5 ? 'rgba(255,40,60,0.45)' : 'rgba(40,200,255,0.4)';
          g.fillRect(dx, y, W, h);
          g.restore();
        }
      }
    },
  },

  // soft focus: A drifts out of focus, B comes into focus through it
  soft: {
    pre: 0.3,
    post: 0.5,
    draw(g, A, B, p) {
      const e = ease.inOutSine(p);
      const sA = 1 + 0.05 * e;
      const sB = 1.05 - 0.05 * e;
      g.setTransform(sA, 0, 0, sA, (W / 2) * (1 - sA), (H / 2) * (1 - sA));
      defocus(g, A, clamp(e * 1.6));
      g.setTransform(sB, 0, 0, sB, (W / 2) * (1 - sB), (H / 2) * (1 - sB));
      g.globalAlpha = ease.inOutSine(clamp((p - 0.2) / 0.6));
      const tmpA = g.globalAlpha;
      defocus(g, B, clamp((1 - e) * 1.6), tmpA);
      g.setTransform(1, 0, 0, 1, 0, 0);
    },
  },
  // warm light blooms from a point, peaks on the cut and lets B through
  light: {
    pre: 0.35,
    post: 0.6,
    draw(g, A, B, p, o) {
      const pc = this.pre / (this.pre + this.post);
      const up = p < pc ? ease.inCubic(p / pc) : 1 - ease.outCubic((p - pc) / (1 - pc));
      defocus(g, p < pc ? A : B, up * 0.8);
      const x = o.x ?? W * 0.5;
      const y = o.y ?? H * 0.4;
      const col = o.color ?? '255,236,214';
      g.globalCompositeOperation = 'screen';
      const r = W * (0.4 + 0.8 * up);
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, `rgba(${col},${0.7 * up})`);
      grd.addColorStop(0.5, `rgba(${col},${0.3 * up})`);
      grd.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = grd;
      g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'source-over';
    },
  },
  // three loaded brush strokes sweep across; B is painted in behind them
  brush: {
    pre: 0,
    post: 0.7,
    draw(g, A, B, p, o) {
      g.drawImage(A, 0, 0);
      const dir = o.dir ?? 1;
      const ang = -0.32;
      const dx = Math.cos(ang) * dir;
      const dy = Math.sin(ang) * dir;
      const nx = -Math.sin(ang);
      const ny = Math.cos(ang);
      const band = H * 0.62;
      const L = W * 1.6;
      for (let i = 0; i < 2; i++) {
        const q = clamp((p - i * 0.12) / 0.55);
        if (q <= 0) continue;
        const k = ease.inOutCubic(q);
        const cx = W / 2 + (i - 0.5) * band * 1.1 * nx;
        const cy = H / 2 + (i - 0.5) * band * 1.1 * ny;
        const sx = cx - (dx * L) / 2;
        const sy = cy - (dy * L) / 2;
        const ex = sx + dx * L * k;
        const ey = sy + dy * L * k;
        const h = band / 2 + 4;
        g.save();
        g.beginPath();
        g.moveTo(sx + nx * h, sy + ny * h);
        g.lineTo(ex + nx * h, ey + ny * h);
        g.lineTo(ex - nx * h, ey - ny * h);
        g.lineTo(sx - nx * h, sy - ny * h);
        g.closePath();
        g.clip();
        g.drawImage(B, 0, 0);
        g.restore();
        // the stroke itself, fading once the brush has passed
        const fade = 1 - ease.inQuad(clamp((p - 0.3 - i * 0.08) / 0.35));
        if (fade > 0.01) {
          g.globalAlpha = 0.75 * fade;
          brushSwipe(g, sx, sy, sx + dx * L, sy + dy * L, band * 0.35, q, { seed: 11 + i, color: o.color ?? '#c8141e' });
          g.globalAlpha = 1;
        }
      }
    },
  },
  // red and paper-white bars rise to cover the frame, then lift away
  bars: {
    pre: 0.3,
    post: 0.35,
    draw(g, A, B, p, o) {
      const pc = this.pre / (this.pre + this.post);
      g.drawImage(p < pc ? A : B, 0, 0);
      const n = 5;
      const w = W / n;
      const cols = o.colors ?? ['#151113'];
      for (let i = 0; i < n; i++) {
        const d = i * 0.06;
        let top;
        let bot;
        if (p < pc) {
          const q = ease.inOutCubic(clamp((p / pc) * 1.3 - d));
          top = H * (1 - q);
          bot = H;
        } else {
          const q = ease.inOutCubic(clamp(((p - pc) / (1 - pc)) * 1.3 - d));
          top = 0;
          bot = H * (1 - q);
        }
        if (bot - top < 0.5) continue;
        g.fillStyle = cols[i % cols.length];
        g.fillRect(i * w - 1, top, w + 2, bot - top);
        g.fillStyle = o.edge ?? '#d8262b';
        const ey = p < pc ? top : bot - 3;
        if (ey > 0 && ey < H - 1) g.fillRect(i * w - 1, ey, w + 2, 3);
      }
    },
  },
  // a red thread is drawn across the frame; B follows behind it
  thread: {
    pre: 0,
    post: 0.75,
    draw(g, A, B, p, o) {
      g.drawImage(A, 0, 0);
      const e = ease.inOutCubic(p);
      const X = lerp(-200, W + 200, e);
      const curve = (y) => X + 140 * Math.sin(y / H * Math.PI * 1.6 + 0.6);
      g.save();
      g.beginPath();
      g.moveTo(-10, -10);
      for (let y = -10; y <= H + 10; y += 20) g.lineTo(curve(y), y);
      g.lineTo(-10, H + 10);
      g.closePath();
      g.clip();
      g.drawImage(B, 0, 0);
      g.restore();
      // soft shadow ahead of the thread and the thread itself
      g.save();
      g.strokeStyle = 'rgba(0,0,0,0.18)';
      g.lineWidth = 26;
      g.filter = 'blur(10px)';
      g.beginPath();
      for (let y = -10; y <= H + 10; y += 20) g.lineTo(curve(y) + 6, y);
      g.stroke();
      g.filter = 'none';
      g.strokeStyle = o.color ?? '#e0262b';
      g.lineWidth = 3.5;
      g.shadowColor = 'rgba(255,40,30,0.8)';
      g.shadowBlur = 14;
      g.beginPath();
      for (let y = -10; y <= H + 10; y += 20) g.lineTo(curve(y), y);
      g.stroke();
      g.restore();
    },
  },
  // focus pull through the subject of A into B
  focus: {
    pre: 0.25,
    post: 0.45,
    draw(g, A, B, p, o) {
      const pc = this.pre / (this.pre + this.post);
      const cx = o.x ?? W / 2;
      const cy = o.y ?? H / 2;
      const e = ease.inOutCubic(p);
      const sA = 1 + 0.45 * e;
      const sB = 1.25 - 0.25 * e;
      g.setTransform(sA, 0, 0, sA, cx * (1 - sA), cy * (1 - sA));
      defocus(g, A, clamp(p / pc));
      g.setTransform(sB, 0, 0, sB, cx * (1 - sB), cy * (1 - sB));
      defocus(g, B, clamp((1 - p) / (1 - pc) - 0.15), ease.inOutSine(clamp((p - pc * 0.6) / (1 - pc * 0.6) * 1.6)));
      g.setTransform(1, 0, 0, 1, 0, 0);
    },
  },
  // B slides up over A like a new sheet of paper; A sinks back
  paper: {
    pre: 0,
    post: 0.6,
    draw(g, A, B, p, o) {
      const e = ease.inOutCubic(p);
      const s = 1 - 0.06 * e;
      g.setTransform(s, 0, 0, s, (W / 2) * (1 - s), (H / 2) * (1 - s));
      g.drawImage(A, 0, 0);
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = `rgba(10,8,8,${0.45 * e})`;
      g.fillRect(0, 0, W, H);
      const dir = o.dir ?? 1;
      const y = dir > 0 ? H * (1 - e) : -H * (1 - e);
      const grd = g.createLinearGradient(0, y - 60 * dir, 0, y);
      grd.addColorStop(0, 'rgba(0,0,0,0)');
      grd.addColorStop(1, `rgba(0,0,0,${0.35 * (1 - e * 0.5)})`);
      g.fillStyle = grd;
      g.fillRect(0, dir > 0 ? y - 60 : y + H, W, 60);
      g.drawImage(B, 0, y);
    },
  },
};
