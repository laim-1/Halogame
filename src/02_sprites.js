const SPR = {}, RAW = {};
const SCR = mkCanvas(200, 200, true);
let S = SCR.g;
function R(x, y, w, h, c) { S.fillStyle = c; S.fillRect(x, y, w, h); }
function P(x, y, c) { S.fillStyle = c; S.fillRect(x, y, 1, 1); }
function E(cx, cy, rx, ry, c) {
  S.fillStyle = c;
  if (ry <= 0) { S.fillRect(cx - rx, cy, rx * 2 + 1, 1); return; }
  for (let dy = -ry; dy <= ry; dy++) {
    const k = 1 - (dy * dy) / ((ry + 0.5) * (ry + 0.5));
    const hw = Math.round(Math.sqrt(Math.max(0, k)) * (rx + 0.3));
    S.fillRect(cx - hw, cy + dy, hw * 2 + 1, 1);
  }
}
function Ln(x0, y0, x1, y1, c) {
  S.fillStyle = c;
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let e = dx + dy;
  for (let i = 0; i < 400; i++) {
    S.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * e;
    if (e2 >= dy) { e += dy; x0 += sx; }
    if (e2 <= dx) { e += dx; y0 += sy; }
  }
}
function ST(rows, pal, ox, oy) {
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
    const ch = rows[y][x]; if (ch !== '.' && ch !== ' ' && pal[ch]) P(ox + x, oy + y, pal[ch]);
  }
}
function finish(name, id, w, h, ax, ay, ol) {
  const d = id.data, n = w * h, m = new Uint8Array(n), isO = new Uint8Array(n);
  for (let i = 0; i < n; i++) m[i] = d[i * 4 + 3] > 0 ? 1 : 0;
  if (ol !== null) {
    const oc = hexRgb(ol || PAL.outline);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; if (m[i]) continue;
      if ((x > 0 && m[i - 1]) || (x < w - 1 && m[i + 1]) || (y > 0 && m[i - w]) || (y < h - 1 && m[i + w])) {
        d[i * 4] = oc[0]; d[i * 4 + 1] = oc[1]; d[i * 4 + 2] = oc[2]; d[i * 4 + 3] = 255; isO[i] = 1;
      }
    }
  }
  const c = mkCanvas(w, h); c.g.putImageData(id, 0, 0);
  const f = SCR.g.createImageData(w, h), fd = f.data;
  for (let i = 0; i < n; i++) {
    const a = d[i * 4 + 3]; if (!a) continue;
    if (isO[i]) { fd[i * 4] = d[i * 4]; fd[i * 4 + 1] = d[i * 4 + 1]; fd[i * 4 + 2] = d[i * 4 + 2]; fd[i * 4 + 3] = 255; }
    else { fd[i * 4] = 255; fd[i * 4 + 1] = 255; fd[i * 4 + 2] = 255; fd[i * 4 + 3] = Math.max(a, 200); }
  }
  const cw = mkCanvas(w, h); cw.g.putImageData(f, 0, 0);
  c.anc = [ax, ay]; cw.anc = [ax, ay];
  SPR[name] = c; SPR[name + '_w'] = cw;
  return c;
}
function bake(name, w, h, ax, ay, fn, ol, keep) {
  S = SCR.g; S.setTransform(1, 0, 0, 1, 0, 0); S.globalAlpha = 1; S.clearRect(0, 0, 200, 200);
  fn();
  const id = S.getImageData(0, 0, w, h);
  if (keep) RAW[name] = { w, h, d: new Uint8ClampedArray(id.data) };
  return finish(name, id, w, h, ax, ay, ol);
}
function bakeRot(name, src, ang, spx, spy, w, h, dpx, dpy, ax, ay, ol) {
  const r = RAW[src]; const id = SCR.g.createImageData(w, h), d = id.data;
  const cs = Math.cos(ang), sn = Math.sin(ang);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = x + 0.5 - dpx, dy = y + 0.5 - dpy;
    const sx = Math.floor(cs * dx + sn * dy + spx), sy = Math.floor(-sn * dx + cs * dy + spy);
    if (sx < 0 || sy < 0 || sx >= r.w || sy >= r.h) continue;
    const si = (sy * r.w + sx) * 4, di = (y * w + x) * 4;
    d[di] = r.d[si]; d[di + 1] = r.d[si + 1]; d[di + 2] = r.d[si + 2]; d[di + 3] = r.d[si + 3];
  }
  return finish(name, id, w, h, ax, ay, ol);
}
function spr(name, x, y, flip, fl, alpha) {
  const c = (fl && SPR[name + '_w']) || SPR[name]; if (!c) return;
  const a = c.anc; x = Math.round(x); y = Math.round(y);
  if (alpha !== undefined) ctx.globalAlpha = alpha;
  if (flip) { ctx.save(); ctx.translate(x, y); ctx.scale(-1, 1); ctx.drawImage(c, -a[0], -a[1]); ctx.restore(); }
  else ctx.drawImage(c, x - a[0], y - a[1]);
  if (alpha !== undefined) ctx.globalAlpha = 1;
}
function sprT(name, x, y, flipX, flipY, fl, alpha) {
  const c = (fl && SPR[name + '_w']) || SPR[name]; if (!c) return;
  const a = c.anc; x = Math.round(x); y = Math.round(y);
  const hh = c.height / 2;
  ctx.save();
  if (alpha !== undefined) ctx.globalAlpha = alpha;
  ctx.translate(x, Math.round(y - (a[1] - hh)));
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  ctx.drawImage(c, -a[0], -Math.round(hh));
  ctx.restore();
}
function sprR(name, x, y, ang, fl) {
  const c = (fl && SPR[name + '_w']) || SPR[name]; if (!c) return;
  const a = c.anc;
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(ang); ctx.drawImage(c, -a[0], -a[1]); ctx.restore();
}
function sprH(name) { const c = SPR[name]; return c ? c.height : 0; }

function haloTail(x, y, s, col) {
  const T = [
    [[0, 0], [-1, -1], [-2, -2], [-2, -3], [-2, -4], [-1, -5], [0, -6]],
    [[0, 0], [-1, -1], [-1, -2], [-2, -3], [-2, -4], [-3, -5], [-3, -6]],
    [[0, 0], [-1, 0], [-2, -1], [-3, -1], [-4, -2], [-5, -2], [-6, -3]],
    [[0, 0], [-1, 1], [-2, 1], [-3, 2], [-4, 2], [-5, 3]],
    [[0, 0], [-1, -1], [-2, -1], [-3, -2], [-4, -3], [-4, -4], [-3, -5]]
  ][s];
  for (const p of T) { P(x + p[0], y + p[1], col); P(x + p[0] + 1, y + p[1], col); }
}
function haloHelmet(hx, hy) {
  const c = PAL.halo;
  E(hx + 1, hy - 1, 6, 6, c.glass);
  P(hx - 3, hy - 4, c.hi); P(hx - 2, hy - 5, c.hi); P(hx - 1, hy - 6, c.hi); P(hx - 4, hy - 2, c.hi);
  R(hx - 3, hy + 5, 9, 1, c.rim);
}
function haloArm(a, bx, by, hx, hy) {
  const c = PAL.halo;
  if (a === 'fwd' || a === 'paw') {
    R(hx - 2, hy + 3, 6, 2, c.m); P(hx + 4, hy + 3, c.l); P(hx + 4, hy + 4, c.l);
    if (a === 'fwd') { R(hx + 5, hy + 3, 2, 2, c.handle); R(hx + 7, hy + 3, 6, 1, c.blade); R(hx + 7, hy + 4, 5, 1, c.bladeD); P(hx + 13, hy + 3, c.blade); }
  } else if (a === 'hi') {
    R(hx - 1, hy + 2, 4, 2, c.m); P(hx + 3, hy + 1, c.l); P(hx + 3, hy + 2, c.l);
    P(hx + 4, hy, c.handle); P(hx + 4, hy + 1, c.handle); P(hx + 5, hy, c.handle);
    for (let i = 0; i < 6; i++) { P(hx + 5 + i, hy - 1 - i, c.blade); P(hx + 6 + i, hy - 1 - i, c.bladeD); }
  } else if (a === 'up') {
    R(hx + 2, hy - 3, 2, 6, c.m); R(hx + 2, hy - 4, 2, 1, c.l);
    R(hx + 2, hy - 6, 2, 2, c.handle); R(hx + 2, hy - 12, 1, 6, c.blade); R(hx + 3, hy - 11, 1, 5, c.bladeD);
  } else if (a === 'down') {
    R(bx + 3, by + 1, 2, 3, c.m); R(bx + 3, by + 4, 2, 1, c.l);
    R(bx + 3, by + 5, 2, 1, c.handle); R(bx + 3, by + 6, 1, 4, c.blade); R(bx + 4, by + 6, 1, 3, c.bladeD);
  }
}
function figHalo(o) {
  const c = PAL.halo;
  const bx = 13 + (o.bx || 0), by = 19 + (o.by || 0);
  const brx = o.brx || 6, bry = o.bry || 3;
  const hx = bx + 6 + (o.hx || 0), hy = by - 5 + (o.hy || 0);
  const lg = o.legs || [-4, -3, 2, 3], lf = o.lift || [0, 0, 0, 0], ll = o.ll || (5 - (o.by || 0));
  if (o.tail >= 0) haloTail(bx - brx + 1, by - 1, o.tail, c.m);
  R(bx + lg[0], by + 1, 2, ll - lf[0], c.d);
  R(bx + lg[2], by + 1, 2, ll - lf[2], c.d);
  E(bx, by, brx, bry, c.m);
  R(bx - brx + 2, by + bry - 1, brx * 2 - 3, 1, c.l);
  P(bx - 3, by - bry, c.d); P(bx, by - bry, c.d); P(bx + 3, by - bry, c.d); P(bx - 2, by - bry + 1, c.d); P(bx + 1, by - bry + 1, c.d);
  R(bx + lg[1], by + 1, 2, ll - lf[1], c.m);
  R(bx + lg[3], by + 1, 2, ll - lf[3], c.m);
  P(bx + lg[1], by + ll - lf[1], c.l); P(bx + lg[1] + 1, by + ll - lf[1], c.l);
  P(bx + lg[3], by + ll - lf[3], c.l); P(bx + lg[3] + 1, by + ll - lf[3], c.l);
  E(hx, hy, 4, 3, c.m);
  if (o.ears === 'flat') { R(hx - 4, hy - 3, 3, 1, c.m); R(hx - 5, hy - 2, 2, 1, c.m); P(hx - 3, hy - 3, c.n); }
  else {
    R(hx - 3, hy - 4, 2, 2, c.m); P(hx - 3, hy - 5, c.m); P(hx - 2, hy - 3, c.n);
    R(hx + 1, hy - 4, 2, 2, c.m); P(hx + 2, hy - 5, c.m); P(hx + 1, hy - 3, c.n);
  }
  R(hx + 1, hy + 1, 3, 2, c.l);
  P(hx - 2, hy - 1, c.d); P(hx - 3, hy, c.d);
  const e = o.eye || 'o';
  if (e === 'o') { P(hx + 1, hy - 1, c.e); P(hx + 2, hy - 1, c.k); }
  else if (e === 'angry') { P(hx + 1, hy - 1, c.e); P(hx + 2, hy - 1, c.k); P(hx + 1, hy - 2, c.k); P(hx + 2, hy - 2, c.d); }
  else if (e === 'shut') { R(hx + 1, hy - 1, 2, 1, c.k); }
  else if (e === 'hurt') { P(hx + 1, hy - 2, c.k); P(hx + 2, hy - 1, c.k); P(hx + 1, hy, c.k); }
  else if (e === 'x') { P(hx, hy - 2, c.k); P(hx + 2, hy - 2, c.k); P(hx + 1, hy - 1, c.k); P(hx, hy, c.k); P(hx + 2, hy, c.k); }
  P(hx + 4, hy, c.n);
  if (o.mouth) { P(hx + 3, hy + 2, c.k); P(hx + 2, hy + 2, c.n); }
  if (o.helmet) haloHelmet(hx, hy);
  if (o.arm) haloArm(o.arm, bx, by, hx, hy);
}
function figHaloFaint(helmet) {
  const c = PAL.halo, bx = 13, by = 21;
  haloTail(bx - 6, by + 1, 2, c.m);
  R(bx - 4, by - 5, 2, 4, c.d); R(bx + 2, by - 5, 2, 4, c.d);
  E(bx, by, 7, 3, c.m);
  R(bx - 5, by - 3, 11, 1, c.l);
  R(bx - 2, by - 6, 2, 4, c.m); R(bx + 4, by - 6, 2, 4, c.m);
  R(bx - 2, by - 6, 2, 1, c.l); R(bx + 4, by - 6, 2, 1, c.l);
  const hx = bx + 8, hy = by;
  E(hx, hy, 4, 3, c.m);
  R(hx - 3, hy + 3, 2, 2, c.m); R(hx + 1, hy + 3, 2, 2, c.m);
  P(hx - 1, hy - 2, c.k); P(hx + 1, hy - 2, c.k); P(hx, hy - 1, c.k); P(hx - 1, hy, c.k); P(hx + 1, hy, c.k);
  P(hx + 3, hy - 2, c.k); P(hx + 4, hy - 1, c.n);
  if (helmet) { E(hx, hy, 6, 6, c.glass); P(hx - 3, hy - 4, c.hi); P(hx - 2, hy - 5, c.hi); }
}
function figHaloTD(dir, f, swat) {
  const c = PAL.halo, cx = 10, bob = (f % 2) ? -1 : 0;
  const hy = 9 + bob, by = 16 + bob;
  if (dir === 'd') {
    [[14, 17], [15, 16], [16, 15], [16, 14], [15, 13]].forEach(p => { P(p[0], p[1] + bob, c.m); P(p[0], p[1] + bob + 1, c.m); });
    E(cx, by, 4, 3, c.m); E(cx, by + 1, 2, 2, c.l);
    const l1 = f === 1 ? 1 : 0, l2 = f === 3 ? 1 : 0;
    R(cx - 3, by + 2, 2, 3 - l1, c.m); R(cx + 2, by + 2, 2, 3 - l2, c.m);
    R(cx - 3, by + 4 - l1, 2, 1, c.l); R(cx + 2, by + 4 - l2, 2, 1, c.l);
    if (swat) { R(cx + 4, by - 3, 2, 4, c.m); R(cx + 4, by - 4, 2, 1, c.l); }
    E(cx, hy, 5, 4, c.m);
    R(cx - 5, hy - 5, 2, 3, c.m); P(cx - 5, hy - 6, c.m); P(cx - 4, hy - 4, c.n);
    R(cx + 4, hy - 5, 2, 3, c.m); P(cx + 5, hy - 6, c.m); P(cx + 4, hy - 4, c.n);
    P(cx - 3, hy, c.e); P(cx - 2, hy, c.k); P(cx + 2, hy, c.k); P(cx + 3, hy, c.e);
    R(cx - 1, hy + 2, 3, 2, c.l); P(cx, hy + 2, c.n);
    P(cx - 1, hy - 3, c.d); P(cx + 1, hy - 3, c.d); P(cx, hy - 4, c.d);
  } else {
    E(cx, by, 4, 3, c.m);
    const l1 = f === 1 ? 1 : 0, l2 = f === 3 ? 1 : 0;
    R(cx - 3, by + 2, 2, 3 - l1, c.d); R(cx + 2, by + 2, 2, 3 - l2, c.d);
    [[10, 19], [10, 20], [11, 21], [12, 21]].forEach(p => P(p[0] + (f % 2), p[1] + bob, c.m));
    if (swat) { R(cx + 4, by - 5, 2, 4, c.m); R(cx + 4, by - 6, 2, 1, c.l); }
    E(cx, hy, 5, 4, c.m);
    R(cx - 5, hy - 5, 2, 3, c.m); P(cx - 5, hy - 6, c.m);
    R(cx + 4, hy - 5, 2, 3, c.m); P(cx + 5, hy - 6, c.m);
    P(cx - 2, hy - 2, c.d); P(cx, hy - 3, c.d); P(cx + 2, hy - 2, c.d); P(cx, hy - 1, c.d); P(cx - 1, hy + 1, c.d); P(cx + 1, hy + 1, c.d);
  }
}
function buildHaloFrames() {
  const sets = [['halo_', false], ['haloh_', true]];
  const P0 = {
    idle_0: { tail: 0 }, idle_1: { tail: 4, by: -1, eye: 'o' },
    blink: { tail: 0, eye: 'shut' },
    run_0: { legs: [-6, -4, 3, 5], tail: 2 }, run_1: { legs: [-3, -2, 1, 2], lift: [1, 1, 1, 1], by: -1, tail: 1 },
    run_2: { legs: [-4, -6, 5, 3], tail: 2 }, run_3: { legs: [-2, -3, 2, 1], lift: [1, 1, 1, 1], by: -1, tail: 1 },
    jump: { by: -2, legs: [-5, -3, 2, 4], ll: 4, tail: 1 }, fall: { by: -1, legs: [-5, -4, 3, 4], ll: 6, tail: 0 },
    atk1: { bx: 1, arm: 'fwd', legs: [-6, -4, 3, 5], tail: 2, eye: 'angry' },
    atk2: { arm: 'hi', legs: [-4, -3, 2, 4], tail: 1, eye: 'angry' },
    atk3: { bx: 2, brx: 7, bry: 2, arm: 'fwd', legs: [-7, -5, 4, 6], tail: 2, eye: 'angry', hy: 1 },
    atkup: { arm: 'up', tail: 0, eye: 'angry' },
    atkdown: { by: -3, legs: [-4, -2, 1, 3], ll: 3, arm: 'down', tail: 1, eye: 'angry' },
    dash: { brx: 7, bry: 2, hx: 1, legs: [-8, -7, 4, 5], lift: [2, 2, 2, 2], tail: 2, ears: 'flat' },
    hurt: { brx: 5, bry: 4, eye: 'hurt', mouth: 1, tail: 3, legs: [-3, -2, 1, 2] },
    swim_0: { by: -2, legs: [-6, -3, 4, 6], lift: [0, 1, 1, 0], ll: 5, tail: 2 },
    swim_1: { by: -2, legs: [-5, -4, 3, 5], lift: [1, 0, 0, 1], ll: 5, tail: 4 },
    swim_2: { by: -2, legs: [-4, -5, 5, 3], lift: [0, 1, 1, 0], ll: 5, tail: 2 },
    swim_3: { by: -2, legs: [-5, -4, 3, 5], lift: [1, 1, 1, 1], ll: 5, tail: 4 },
    swat: { bx: 1, arm: 'paw', legs: [-5, -3, 2, 4], tail: 2 }
  };
  for (const [pre, hel] of sets) {
    for (const k in P0) {
      const o = Object.assign({ helmet: hel }, P0[k]);
      bake(pre + k, 34, 26, 14, 25, () => figHalo(o), PAL.outline, k.startsWith('swim'));
    }
    bake(pre + 'faint', 34, 26, 14, 25, () => figHaloFaint(hel), PAL.outline);
  }
  for (let i = 0; i < 4; i++) for (const t of [-2, -1, 1, 2]) {
    bakeRot('haloh_swim_' + i + '_' + t, 'haloh_swim_' + i, t * 0.32, 15, 16, 40, 38, 20, 19, 20, 27, PAL.outline);
  }
  for (const d of ['d', 'u']) {
    for (let f = 0; f < 4; f++) bake('halo_td_' + d + '_' + f, 22, 24, 10, 23, () => figHaloTD(d, f, false), PAL.outline);
    bake('halo_td_' + d + '_swat', 22, 24, 10, 23, () => figHaloTD(d, 0, true), PAL.outline);
  }
}

function figKitten(o) {
  const c = PAL.twin;
  const bx = 8 + (o.bx || 0), by = 12 + (o.by || 0), hx = bx + 5 + (o.hx || 0), hy = by - 3 + (o.hy || 0);
  const lg = o.legs || [-3, -2, 2, 3], lf = o.lift || [0, 0, 0, 0], ll = o.ll || (3 - (o.by || 0));
  if (!o.notail) [[0, 0], [-1, -1], [-1, -2], [-1, -3], [0, -4]].forEach((p, i) => P(bx - 4 + p[0] + (o.tw && i > 2 ? 1 : 0), by - 1 + p[1], c.m));
  R(bx + lg[0], by + 1, 1, ll - lf[0], c.d); R(bx + lg[2], by + 1, 1, ll - lf[2], c.d);
  E(bx, by, 4, 2, c.m);
  P(bx - 1, by - 2, c.l); P(bx + 1, by - 2, c.l);
  R(bx + lg[1], by + 1, 1, ll - lf[1], c.m); R(bx + lg[3], by + 1, 1, ll - lf[3], c.m);
  if (o.book) { R(bx - 1, by - 2, 4, 3, c.book); R(bx, by - 2, 3, 1, c.page); P(bx - 1, by + 1, c.bookD); P(bx + (o.drip ? 2 : 0), by + 2, c.drip); }
  E(hx, hy, 3, 3, c.m);
  P(hx - 1, hy - 2, c.l);
  P(hx - 2, hy - 3, c.m); P(hx - 2, hy - 4, c.m); P(hx - 1, hy - 3, c.m);
  P(hx + 1, hy - 3, c.m); P(hx + 2, hy - 3, c.m); P(hx + 2, hy - 4, c.m);
  if (o.eye === 'shut') { P(hx, hy, c.l); P(hx + 2, hy, c.l); }
  else if (o.eye === 'angry') { P(hx, hy, c.e); P(hx + 2, hy, c.e); P(hx, hy - 1, c.d); P(hx + 1, hy - 1, c.l); }
  else { R(hx, hy - 1, 1, 2, c.e); R(hx + 2, hy - 1, 1, 2, c.e); }
  P(hx + 3, hy + 1, '#e890a0');
  if (o.mouth) P(hx + 2, hy + 2, '#e890a0');
  if (o.bow) { P(hx - 2, hy - 5, c.bow); P(hx - 1, hy - 4, c.bowD); P(hx, hy - 5, c.bow); P(hx - 2, hy - 4, c.bow); P(hx, hy - 4, c.bow); }
  if (o.hat) {
    R(hx - 3, hy - 3, 7, 1, c.hatD); R(hx - 2, hy - 4, 5, 1, c.hat); R(hx - 1, hy - 5, 4, 1, c.hat);
    R(hx, hy - 6, 3, 1, c.hat); P(hx + 1, hy - 7, c.hat); P(hx + 2, hy - 8, c.hatL); P(hx + 3, hy - 8, c.hatL); P(hx, hy - 5, c.star);
  }
  if (o.wand) { Ln(hx + 2, hy + 3, hx + 5, hy - 1, c.wand); P(hx + 6, hy - 2, c.star); P(hx + 5, hy - 3, c.star); P(hx + 7, hy - 1, c.star); }
}
function buildTwinFrames() {
  const ol = PAL.twin.ol;
  const K = {
    idle_0: {}, idle_1: { by: -1, tw: 1 }, walk_0: { legs: [-4, -2, 1, 3] }, walk_1: { legs: [-2, -3, 3, 2], by: -1 },
    eat_0: { hy: 2, hx: 1, eye: 'shut', mouth: 1 }, eat_1: { hy: 3, hx: 1, eye: 'shut' }, yell: { mouth: 1, eye: 'angry' }, happy: { eye: 'shut', by: -1, tw: 1 }
  };
  for (const k in K) {
    bake('bella_' + k, 20, 17, 10, 16, () => figKitten(Object.assign({ bow: 1 }, K[k])), ol);
    bake('kylop_' + k, 20, 17, 10, 16, () => figKitten(Object.assign({}, K[k])), ol);
    bake('kylo_' + k, 20, 17, 10, 16, () => figKitten(Object.assign({ hat: 1, book: 1, drip: k.endsWith('1') }, K[k])), ol);
  }
  bake('kylo_cast', 22, 17, 10, 16, () => figKitten({ hat: 1, book: 1, wand: 1, eye: 'shut' }), ol);
  bake('kylo_float_0', 20, 17, 10, 16, () => figKitten({ hat: 1, book: 1, legs: [-3, -2, 2, 3], lift: [1, 0, 1, 0] }), ol);
  bake('kylo_float_1', 20, 17, 10, 16, () => figKitten({ hat: 1, book: 1, drip: 1, legs: [-3, -2, 2, 3], lift: [0, 1, 0, 1], tw: 1 }), ol);
}

function figSugar(o) {
  const c = PAL.sugar, by = 12 + (o.by || 0);
  R(6, 15, 15, 2, c.p); P(5, 15, c.pd); P(5, 14, c.p);
  E(15, by, 10, 4 + (o.by ? 0 : 0), c.m); E(14, by - 2, 7, 1, c.l);
  R(20, 14, 3, 2, c.p); R(23, 14, 3, 2, c.p);
  const hx = 24, hy = 8 + (o.hy || 0);
  E(hx, hy, 4, 4, c.m);
  E(hx + 1, hy + 1, 3, 2, c.p);
  R(hx - 3, hy - 5, 2, 2, c.p); P(hx - 3, hy - 6, c.p); R(hx + 2, hy - 5, 2, 2, c.p); P(hx + 3, hy - 6, c.p);
  if (o.eye === 'open') { P(hx - 1, hy, c.e); P(hx + 2, hy, c.e); P(hx - 1, hy - 1, c.pd); P(hx + 2, hy - 1, c.pd); }
  else if (o.eye === 'half') { P(hx - 1, hy, c.e); P(hx + 2, hy, c.e); R(hx - 1, hy - 1, 1, 1, c.pd); R(hx + 2, hy - 1, 1, 1, c.pd); }
  else { R(hx - 2, hy, 2, 1, c.pd); R(hx + 2, hy, 2, 1, c.pd); }
  P(hx + 1, hy + 2, c.pd);
}
function buildSugarFrames() {
  bake('sugar_sleep_0', 32, 19, 16, 18, () => figSugar({}), PAL.sugar.ol);
  bake('sugar_sleep_1', 32, 19, 16, 18, () => figSugar({ by: -1, hy: 0 }), PAL.sugar.ol);
  bake('sugar_awake', 32, 19, 16, 18, () => figSugar({ eye: 'half' }), PAL.sugar.ol);
  bake('sugar_open', 32, 19, 16, 18, () => figSugar({ eye: 'open' }), PAL.sugar.ol);
  bake('cushion', 38, 12, 19, 10, () => { const c = PAL.sugar; E(19, 6, 17, 4, c.cush); R(4, 3, 30, 1, c.cushL); R(5, 8, 28, 1, c.cushD); P(2, 4, c.cushL); P(35, 4, c.cushL); }, '#4a1a2e');
}

const DOGP = {
  med: { bx: 11, by: 14, brx: 6, bry: 3, hrx: 3, hry: 3, hdx: 6, hdy: -4, ll: 6, sn: 3 },
  small: { bx: 8, by: 10, brx: 4, bry: 2, hrx: 3, hry: 3, hdx: 4, hdy: -3, ll: 4, sn: 2 },
  big: { bx: 15, by: 17, brx: 9, bry: 4, hrx: 4, hry: 4, hdx: 9, hdy: -5, ll: 7, sn: 4 },
  tiny: { bx: 9, by: 14, brx: 4, bry: 2, hrx: 3, hry: 3, hdx: 4, hdy: -3, ll: 4, sn: 2 }
};
function dogTail(x, y, s, col) {
  const T = [[[0, 0], [-1, -1], [-2, -2], [-2, -3]], [[0, 0], [-1, 0], [-2, -1], [-3, -1]], [[0, 0], [-1, 1], [-2, 2], [-2, 3]], [[0, 0], [-1, -1], [-1, -2], [0, -3]]][s];
  for (const p of T) { P(x + p[0], y + p[1], col); P(x + p[0], y + p[1] + 1, col); }
}
function figDog(pr, p, o) {
  const bx = pr.bx + (o.bx || 0), by = pr.by + (o.by || 0), brx = pr.brx + (o.brx || 0), bry = pr.bry + (o.bry || 0);
  const hx = bx + pr.hdx + (o.hx || 0), hy = by + pr.hdy + (o.hy || 0);
  const lg = o.legs || [-brx + 1, -brx + 3, brx - 4, brx - 2], lf = o.lift || [0, 0, 0, 0], ll = (o.ll || pr.ll) - (o.by || 0);
  if (o.cape) { E(bx - 2, by - 1, brx - 1, bry + 2, p.capeD || '#8a1420'); E(bx - 3, by, brx - 2, bry + 1, p.cape || '#c02030'); }
  if (o.tail !== -1) dogTail(bx - brx, by - 1, o.tail || 0, p.m);
  R(bx + lg[0], by + 1, 2, ll - lf[0], p.d); R(bx + lg[2], by + 1, 2, ll - lf[2], p.d);
  E(bx, by, brx, bry, p.m);
  R(bx - brx + 2, by + bry - 1, 2 * brx - 3, 1, p.l);
  if (o.shine) { R(bx - 3, by - bry + 1, 4, 1, p.s); P(bx + 2, by - bry + 1, p.s); }
  if (o.spots) { P(bx - 2, by - 1, p.spot); P(bx - 3, by - 1, p.spot); P(bx + 2, by, p.spot); P(bx + 3, by, p.spot); P(bx - 1, by + 1, p.spot); }
  if (o.apron) { R(bx + 1, by - 1, 4, 4, '#ffffff'); P(bx + 2, by - 2, '#ffffff'); }
  R(bx + lg[1], by + 1, 2, ll - lf[1], p.m); R(bx + lg[3], by + 1, 2, ll - lf[3], p.m);
  E(hx, hy, pr.hrx, pr.hry, p.m);
  if (o.shine) P(hx - 1, hy - pr.hry + 1, p.s);
  R(hx + pr.hrx - 1, hy, pr.sn, 2, p.l);
  P(hx + pr.hrx + pr.sn - 2, hy, p.n);
  const ear = o.ear || 'flop';
  if (ear === 'flop') R(hx - pr.hrx + 1, hy - pr.hry + 1, 2, pr.hry + 1, p.d);
  else if (ear === 'up') { R(hx - 2, hy - pr.hry - 1, 2, 2, p.d); P(hx - 2, hy - pr.hry - 2, p.d); }
  else if (ear === 'long') R(hx - pr.hrx, hy - 1, 2, pr.hry + 4, p.d);
  else if (ear === 'huge') {
    E(hx - 3, hy - pr.hry - 3, 2, 4, p.t); P(hx - 3, hy - pr.hry - 3, p.inr); P(hx - 3, hy - pr.hry - 2, p.inr);
    E(hx + 1, hy - pr.hry - 3, 2, 4, p.t); P(hx + 1, hy - pr.hry - 3, p.inr); P(hx + 1, hy - pr.hry - 2, p.inr);
  } else if (ear === 'perk') { E(hx - 2, hy - pr.hry - 3, 2, 4, p.t); E(hx + 1, hy - pr.hry - 4, 2, 4, p.t); P(hx - 2, hy - pr.hry - 3, p.inr); P(hx + 1, hy - pr.hry - 4, p.inr); }
  if (o.patch) { E(hx, hy - 1, 2, 1, p.t); }
  const ek = '#101018', e = o.eye || 'o';
  if (e === 'o') { P(hx + 1, hy - 1, ek); }
  else if (e === 'angry') { P(hx + 1, hy - 1, ek); P(hx, hy - 2, ek); P(hx + 1, hy - 2, ek); }
  else if (e === 'shut') { R(hx, hy - 1, 2, 1, ek); }
  else if (e === 'happy') { P(hx, hy - 1, ek); P(hx + 1, hy - 2, ek); P(hx + 2, hy - 1, ek); }
  else if (e === 'x') { P(hx, hy - 2, ek); P(hx + 2, hy - 2, ek); P(hx + 1, hy - 1, ek); P(hx, hy, ek); P(hx + 2, hy, ek); }
  else if (e === 'wide') { P(hx + 1, hy - 1, '#ffffff'); P(hx + 2, hy - 1, ek); P(hx + 1, hy - 2, '#ffffff'); }
  const mx = hx + pr.hrx - 1;
  if (o.mouth === 'open') R(mx, hy + 2, pr.sn - 1, 1, p.n);
  else if (o.mouth === 'tongue') { R(mx, hy + 2, pr.sn - 1, 1, p.n); R(mx + 1, hy + 2, 1, 3, p.tongue); }
  else if (o.mouth === 'growl') { R(mx, hy + 2, pr.sn, 1, p.n); P(mx + 1, hy + 2, '#ffffff'); P(mx + 3 > mx + pr.sn - 1 ? mx : mx + 3, hy + 2, '#ffffff'); }
  else if (o.mouth === 'bark') { R(mx, hy + 2, pr.sn, 2, p.n); P(mx + 1, hy + 3, p.tongue); }
  if (o.helm) { E(hx, hy - pr.hry, pr.hrx, 1, p.helm); R(hx - pr.hrx, hy - pr.hry + 1, 2 * pr.hrx + 1, 1, p.helmD); P(hx, hy - pr.hry - 2, p.helmD); P(hx, hy - pr.hry - 3, p.helmD); }
  if (o.crown) {
    const cy = hy - pr.hry - 1 + (o.cdy || 0);
    R(hx - 2, cy - 1, 5, 2, p.crown); P(hx - 2, cy - 2, p.crown); P(hx, cy - 2, p.crown); P(hx + 2, cy - 2, p.crown); P(hx, cy - 1, p.gem || '#e83848'); R(hx - 2, cy, 5, 1, p.crownD);
  }
  if (o.bino) { R(hx + 1, hy - 2, 3, 2, '#303040'); P(hx + 3, hy - 2, '#80c0f0'); }
  if (o.spear) { R(hx + 4, hy - 8, 1, 14, '#8a5a30'); P(hx + 4, hy - 9, '#c8ccd8'); P(hx + 3, hy - 8, '#c8ccd8'); P(hx + 5, hy - 8, '#c8ccd8'); P(hx + 4, hy - 10, '#c8ccd8'); }
}
function bakeDog(name, pr, p, o, w, h, ax, ay) { bake(name, w, h, ax, ay, () => figDog(DOGP[pr], p, o), p.ol); }
function buildDogFrames() {
  const pd = PAL.pdog;
  bakeDog('pdog_walk_0', 'med', pd, { helm: 1, legs: [-6, -3, 2, 4], tail: 0 }, 26, 22, 12, 21);
  bakeDog('pdog_walk_1', 'med', pd, { helm: 1, legs: [-4, -5, 4, 2], tail: 1, by: -1 }, 26, 22, 12, 21);
  bakeDog('pdog_tele', 'med', pd, { helm: 1, legs: [-7, -5, 3, 5], hy: 2, eye: 'angry', mouth: 'growl', tail: 2 }, 26, 22, 12, 21);
  bakeDog('pdog_lunge', 'med', pd, { helm: 1, brx: 1, legs: [-9, -8, 5, 6], lift: [2, 2, 2, 2], eye: 'angry', mouth: 'bark', tail: 1 }, 26, 22, 12, 21);
  bakeDog('pdog_pant_0', 'med', pd, { helm: 1, mouth: 'tongue', eye: 'shut', tail: 0 }, 26, 22, 12, 21);
  bakeDog('pdog_pant_1', 'med', pd, { helm: 1, mouth: 'tongue', eye: 'shut', tail: 3, by: -1 }, 26, 22, 12, 21);
  const so = PAL.soldier;
  bakeDog('soldier_walk_0', 'med', so, { helm: 1, legs: [-6, -3, 2, 4], tail: 0 }, 26, 22, 12, 21);
  bakeDog('soldier_walk_1', 'med', so, { helm: 1, legs: [-4, -5, 4, 2], tail: 1, by: -1 }, 26, 22, 12, 21);
  bakeDog('soldier_bark', 'med', so, { helm: 1, mouth: 'bark', eye: 'angry', tail: 0 }, 26, 22, 12, 21);
  const pu = PAL.puppy;
  bakeDog('puppy_idle_0', 'small', pu, { ear: 'flop', tail: 0 }, 20, 16, 9, 15);
  bakeDog('puppy_idle_1', 'small', pu, { ear: 'flop', tail: 3, by: -1 }, 20, 16, 9, 15);
  bakeDog('puppy_squish', 'small', pu, { ear: 'flop', by: 2, brx: 1, bry: -1, ll: 4, eye: 'shut', tail: 2 }, 20, 16, 9, 15);
  bakeDog('puppy_hop', 'small', pu, { ear: 'flop', by: -2, legs: [-5, -4, 2, 3], lift: [1, 1, 1, 1], mouth: 'open', eye: 'happy', tail: 0 }, 20, 16, 9, 15);
  const bd = PAL.bdog;
  bakeDog('bdog_idle_0', 'med', bd, { spots: 1, ear: 'flop', tail: 0 }, 26, 22, 12, 21);
  bakeDog('bdog_idle_1', 'med', bd, { spots: 1, ear: 'flop', tail: 3, by: -1 }, 26, 22, 12, 21);
  bakeDog('bdog_wind_0', 'med', bd, { spots: 1, ear: 'flop', hx: -1, hy: -1, eye: 'angry', tail: 1 }, 26, 22, 12, 21);
  bakeDog('bdog_wind_1', 'med', bd, { spots: 1, ear: 'flop', hx: 1, hy: 1, eye: 'angry', tail: 2 }, 26, 22, 12, 21);
  bakeDog('bdog_throw', 'med', bd, { spots: 1, ear: 'flop', hx: 2, mouth: 'bark', tail: 0 }, 26, 22, 12, 21);
  const NP = [
    { helm: 1 }, { bino: 1, ear: 'up' }, { apron: 1 }, { ear: 'up' }, { ear: 'long' }, { helm: 1, spear: 1 }
  ];
  NP.forEach((o, i) => {
    const p = PAL.npc[i];
    bakeDog('npc' + i + '_idle_0', 'med', p, Object.assign({ tail: 0 }, o), 26, 30, 12, 29);
    bakeDog('npc' + i + '_idle_1', 'med', p, Object.assign({ tail: 3, by: -1 }, o), 26, 30, 12, 29);
    bakeDog('npc' + i + '_walk_0', 'med', p, Object.assign({ tail: 0, legs: [-6, -3, 2, 4] }, o), 26, 30, 12, 29);
    bakeDog('npc' + i + '_walk_1', 'med', p, Object.assign({ tail: 1, by: -1, legs: [-4, -5, 4, 2] }, o), 26, 30, 12, 29);
  });
  const PUPS = [PAL.puppy, { m: '#b88a5a', d: '#8a6438', l: '#d8b088', n: '#2a1a10', ol: '#4a3018', tongue: '#f07090' }, { m: '#f0ece4', d: '#c0b8a8', l: '#ffffff', n: '#2a2020', ol: '#5a544a', tongue: '#f07090' }];
  PUPS.forEach((p, i) => {
    bakeDog('pup' + i + '_idle_0', 'small', p, { ear: i === 1 ? 'up' : 'flop', tail: 0, mouth: i === 2 ? 'tongue' : 0 }, 20, 16, 9, 15);
    bakeDog('pup' + i + '_idle_1', 'small', p, { ear: i === 1 ? 'up' : 'flop', tail: 3, by: -1, mouth: i === 2 ? 'tongue' : 0 }, 20, 16, 9, 15);
  });
}
function buildPollyFrames() {
  const p = PAL.polly, B = (n, o) => bakeDog(n, 'big', p, Object.assign({ crown: 1, shine: 1, ear: 'flop' }, o), 38, 30, 18, 29);
  B('polly_run_0', { legs: [-10, -8, 6, 8], tail: 1, mouth: 'tongue', eye: 'happy' });
  B('polly_run_1', { legs: [-5, -4, 2, 4], lift: [2, 2, 2, 2], by: -2, tail: 0, mouth: 'tongue', eye: 'happy', cdy: -1 });
  B('polly_idle_0', { tail: 0, eye: 'o', mouth: 'tongue' });
  B('polly_idle_1', { tail: 3, eye: 'o', by: -1, mouth: 'tongue' });
  B('polly_crouch_0', { by: 3, legs: [-9, -7, 4, 6], ll: 7, hy: 2, tail: 0, eye: 'angry' });
  B('polly_crouch_1', { by: 3, bx: -1, legs: [-9, -7, 4, 6], ll: 7, hy: 2, tail: 3, eye: 'angry' });
  B('polly_charge', { brx: 1, bry: 1, legs: [-6, -5, 3, 4], lift: [3, 3, 3, 3], tail: 1, eye: 'angry', mouth: 'bark' });
  B('polly_pant_0', { mouth: 'tongue', eye: 'shut', tail: 2 });
  B('polly_pant_1', { mouth: 'tongue', eye: 'shut', tail: 2, by: -1 });
  B('polly_bark', { mouth: 'bark', eye: 'angry', tail: 0, hy: -1 });
  B('polly_flop_0', { mouth: 'tongue', eye: 'shut', tail: 2, legs: [-9, -6, 4, 7] });
  B('polly_flop_1', { mouth: 'tongue', eye: 'shut', tail: 2, legs: [-6, -9, 7, 4] });
}
function buildLolaFrames() {
  const p = PAL.lola, B = (n, o) => bakeDog(n, 'tiny', p, Object.assign({ ear: 'huge', patch: 1 }, o), 22, 22, 10, 21);
  B('lola_idle_0', { tail: 0 });
  B('lola_idle_1', { tail: 3, by: -1 });
  B('lola_crouch', { by: 2, bry: -1, brx: 1, ll: 4, tail: 1, eye: 'angry' });
  B('lola_hop', { by: -2, legs: [-5, -4, 2, 3], lift: [1, 1, 1, 1], mouth: 'open', eye: 'happy', tail: 0 });
  B('lola_dive', { legs: [-3, -2, 1, 2], lift: [2, 2, 2, 2], eye: 'angry', mouth: 'bark', tail: 0 });
  B('lola_stuck_0', { legs: [-4, -2, 1, 3], tail: 0, eye: 'x' });
  B('lola_stuck_1', { legs: [-3, -1, 2, 4], lift: [1, 0, 1, 0], tail: 3, eye: 'x' });
  B('lola_yip', { mouth: 'bark', eye: 'angry', ear: 'perk', tail: 0 });
  B('lola_sit', { eye: 'shut', mouth: 'open', tail: 2 });
}

function figDozer(o) {
  const p = PAL.dozer, cx = 40 + (o.bx || 0), cy = 44 + (o.by || 0), rx = 28 + (o.rx || 0), ry = 21 + (o.ry || 0);
  E(cx - 14, cy - 4, 14, 20, p.capeD); E(cx - 15, cy - 2, 12, 18, p.cape);
  const fy = cy + ry;
  if (!o.nolegs) {
    const lf = o.lift || 0;
    R(cx - 20, fy - 4, 8, 6 - lf, p.d); R(cx + 10, fy - 4, 8, 6 - lf, p.d);
  }
  E(cx, cy, rx, ry, p.m);
  E(cx + 5, cy + 5, rx - 9, ry - 7, p.b);
  E(cx - 6, cy - ry + 5, 10, 2, p.l);
  if (!o.nolegs) { const lf = o.lift || 0; R(cx - 14, fy - 3, 8, 5 - lf, p.m); R(cx + 16, fy - 3, 8, 5 - lf, p.m); R(cx - 14, fy + 1 - lf, 8, 1, p.l); R(cx + 16, fy + 1 - lf, 8, 1, p.l); }
  [[4, 8], [12, 2], [-2, 12], [8, 14], [16, 9]].forEach(q => P(cx + q[0], cy + q[1], p.crumb));
  const hx = cx + 20 + (o.hx || 0), hy = cy - 18 + (o.hy || 0);
  E(hx - 2, hy + 6, 12, 5, p.m);
  E(hx, hy, 11, 9, p.m);
  E(hx + 8, hy + 3, 6, 4, p.b);
  R(hx + 12, hy, 3, 2, p.n);
  R(hx - 9, hy - 6, 4, 10, p.d); R(hx - 10, hy - 3, 3, 7, p.d);
  const ek = '#101018';
  if (o.eye === 'shut') { R(hx + 1, hy - 3, 4, 1, ek); }
  else if (o.eye === 'x') { P(hx + 1, hy - 4, ek); P(hx + 3, hy - 4, ek); P(hx + 2, hy - 3, ek); P(hx + 1, hy - 2, ek); P(hx + 3, hy - 2, ek); }
  else if (o.eye === 'wide') { R(hx + 1, hy - 4, 3, 3, '#ffffff'); P(hx + 3, hy - 3, ek); }
  else { R(hx + 1, hy - 3, 3, 1, ek); R(hx + 1, hy - 4, 3, 1, p.d); P(hx + 2, hy - 2, ek); }
  if (o.mouth === 'open') { R(hx + 5, hy + 6, 8, 3, '#3a1010'); R(hx + 7, hy + 8, 4, 1, p.tongue); }
  else if (o.mouth === 'chew') { R(hx + 6, hy + 6, 6, 2, '#3a1010'); P(hx + 8, hy + 5, p.crumb); }
  else { Ln(hx + 5, hy + 6, hx + 12, hy + 5, '#3a1010'); P(hx + 4, hy + 5, '#3a1010'); }
  const cyy = hy - 9 + (o.cdy || 0);
  R(hx - 5, cyy, 11, 4, p.crown); P(hx - 5, cyy - 1, p.crown); P(hx - 5, cyy - 2, p.crown); P(hx, cyy - 1, p.crown); P(hx, cyy - 2, p.crown); P(hx + 5, cyy - 1, p.crown); P(hx + 5, cyy - 2, p.crown);
  R(hx - 5, cyy + 3, 11, 1, p.crownD); P(hx, cyy + 1, p.gem); P(hx - 3, cyy + 1, '#e83848'); P(hx + 3, cyy + 1, '#e83848');
  if (o.drum) { const dx = hx + 12, dy = hy + 4; E(dx, dy, 5, 4, p.drum); E(dx - 1, dy - 1, 3, 2, '#e09858'); R(dx + 4, dy + 2, 5, 2, p.bone); P(dx + 9, dy + 1, p.bone); P(dx + 9, dy + 4, p.bone); }
  if (o.paw === 'lick') { E(hx + 12, hy + 8, 4, 3, p.m); R(hx + 9, hy + 7, 2, 2, p.tongue); }
  if (o.paw === 'up') { E(cx - 26, cy - 22, 5, 4, p.m); E(cx + 26, cy - 22, 5, 4, p.m); R(cx - 26, cy - 18, 5, 10, p.m); R(cx + 22, cy - 18, 5, 10, p.m); }
}
function figDozerBall() {
  const p = PAL.dozer;
  E(26, 26, 23, 23, p.m);
  E(26, 26, 15, 15, p.b);
  E(26, 26, 23, 23, 'rgba(0,0,0,0)');
  R(24, 3, 5, 46, p.cape); R(25, 3, 3, 46, p.capeD);
  R(8, 12, 7, 4, p.crown); P(8, 11, p.crown); P(11, 11, p.crown); P(14, 11, p.crown);
  R(36, 34, 4, 2, '#101018'); R(40, 30, 3, 3, p.n);
  E(14, 38, 4, 3, p.l); E(38, 16, 4, 3, p.d);
  P(18, 22, p.crumb); P(32, 40, p.crumb); P(20, 36, p.crumb);
}
function buildDozerFrames() {
  const ol = PAL.dozer.ol, B = (n, o) => bake(n, 84, 72, 42, 71, () => figDozer(o), ol);
  B('dozer_idle_0', {}); B('dozer_idle_1', { ry: 1, by: -1, cdy: -1 });
  B('dozer_sit', { eye: 'o', mouth: 'open', drum: 1, lift: 3 });
  B('dozer_munch_0', { eye: 'shut', mouth: 'chew', drum: 1, lift: 3 });
  B('dozer_munch_1', { eye: 'shut', mouth: 'open', drum: 1, lift: 3, hy: 1 });
  B('dozer_wind', { paw: 'lick', eye: 'shut' });
  B('dozer_jump', { paw: 'up', eye: 'wide', mouth: 'open', lift: 3, by: -2 });
  B('dozer_squash', { rx: 4, ry: -4, by: 4, hy: 6, eye: 'shut', mouth: 'open' });
  B('dozer_stuck_0', { rx: 3, ry: -3, by: 3, hy: 6, eye: 'shut', mouth: 'open' });
  B('dozer_stuck_1', { rx: 3, ry: -2, by: 2, hy: 5, eye: 'shut', mouth: 'chew' });
  B('dozer_dizzy', { eye: 'x', mouth: 'open' });
  B('dozer_flop', { eye: 'x', mouth: 'open', rx: 2, ry: -2, by: 2 });
  B('dozer_happy', { eye: 'shut', mouth: 'open' });
  bake('dozer_ball', 52, 52, 26, 50, figDozerBall, ol, true);
  for (let i = 0; i < 8; i++) bakeRot('dozer_roll_' + i, 'dozer_ball', i * Math.PI / 4, 26, 26, 52, 52, 26, 26, 26, 50, ol);
}

function figBetta(p, o) {
  const cx = o.cx || 24, cy = o.cy || 17, rx = o.rx || 9, ry = o.ry || 6, ph = o.ph || 0, tl = o.tl || 9;
  const tx = cx - rx - Math.floor(tl / 2) + 2;
  E(tx, cy + (ph ? 1 : 0), Math.floor(tl / 2) + 1, ry + 4 - (o.sleek ? 3 : 0), p.f);
  for (let i = -ry - 2; i <= ry + 2; i += 3) P(tx - Math.floor(tl / 2), cy + i + (ph ? 1 : 0), p.fd);
  if (p.fe) { for (let i = -ry - 3; i <= ry + 3; i += 2) P(tx - Math.floor(tl / 2) - 1, cy + i + (ph ? 1 : 0), p.fe); }
  E(cx - 2, cy - ry - 1 + (ph ? 1 : 0), rx - 2, o.sleek ? 1 : 3, p.f);
  E(cx - 1, cy + ry + 1 - (ph ? 1 : 0), rx - 3, o.sleek ? 1 : 3, p.f);
  if (p.fe) { R(cx - rx + 2, cy - ry - 4 + (ph ? 1 : 0), 2 * rx - 7, 1, p.fe); R(cx - rx + 3, cy + ry + 4 - (ph ? 1 : 0), 2 * rx - 9, 1, p.fe); }
  E(cx, cy, rx, ry, p.m);
  E(cx + 1, cy + 2, rx - 3, Math.max(1, ry - 3), p.l);
  E(cx - 1, cy - ry + 1, rx - 3, 0, p.d);
  E(cx + 1, cy + 2, 2, 1, p.fd);
  const ex = cx + rx - 4, ey = cy - 2, e = o.eye || 'cute';
  if (e === 'cute') { R(ex, ey, 2, 2, p.e); P(ex, ey, '#ffffff'); if (p.blush) { P(ex - 1, ey + 3, p.blush); P(ex, ey + 3, p.blush); } }
  else if (e === 'evil') { R(ex, ey, 2, 2, p.ev); P(ex - 1, ey - 2, p.e); P(ex, ey - 1, p.e); P(ex + 1, ey - 1, p.e); P(ex + 2, ey - 2, p.e); }
  else if (e === 'wild') { E(ex, ey, 2, 2, '#ffffff'); P(ex + 1, ey - 1, p.p); P(ex - 2, ey - 4, p.d); P(ex - 1, ey - 4, p.d); P(ex, ey - 5, p.d); }
  else if (e === 'wild2') { E(ex, ey, 2, 2, '#ffffff'); P(ex - 1, ey + 1, p.p); P(ex - 2, ey - 4, p.d); P(ex, ey - 4, p.d); }
  else if (e === 'brow') { R(ex, ey, 2, 2, '#ffffff'); P(ex + 1, ey + 1, '#101018'); R(ex - 2, ey - 2, 6, 1, p.brow); R(ex - 2, ey - 3, 3, 1, p.brow); }
  else if (e === 'x') { P(ex - 1, ey - 1, '#101018'); P(ex + 1, ey - 1, '#101018'); P(ex, ey, '#101018'); P(ex - 1, ey + 1, '#101018'); P(ex + 1, ey + 1, '#101018'); }
  else if (e === 'shut') { R(ex - 1, ey + 1, 3, 1, '#101018'); P(ex - 2, ey, '#101018'); }
  else if (e === 'sad') { R(ex, ey, 2, 2, '#ffffff'); P(ex, ey + 1, '#101018'); R(ex - 1, ey - 2, 2, 1, p.brow || p.d); P(ex + 1, ey - 3, p.brow || p.d); }
  const mx = cx + rx;
  if (o.mouth === 'o') { R(mx - 1, cy - 1, 2, 3, p.mouth || '#301828'); }
  else if (o.mouth === 'open') { R(mx - 3, cy, 3, 3, p.mouth || '#301828'); P(mx - 2, cy + 3, '#ffffff'); }
  else if (o.mouth === 'frown') { Ln(mx - 3, cy + 2, mx - 1, cy + 1, p.mouth || '#301828'); }
  else { P(mx - 1, cy + 1, p.mouth || '#301828'); }
  if (o.tear) { P(ex, ey + 3, '#80c8ff'); P(ex, ey + 4, '#80c8ff'); }
}
function buildFishBossFrames() {
  const bb = PAL.babyboo, B = (n, o) => bake(n, 46, 36, 23, 18, () => figBetta(bb, Object.assign({ cx: 25, cy: 18 }, o)), bb.ol);
  B('bb_idle_0', {}); B('bb_idle_1', { ph: 1 });
  B('bb_evil', { eye: 'evil', mouth: 'open' }); B('bb_pucker', { mouth: 'o' }); B('bb_lunge', { eye: 'evil', sleek: 1, tl: 12, mouth: 'open' });
  B('bb_dizzy', { eye: 'x', ph: 1, mouth: 'frown' }); B('bb_angry', { eye: 'evil', mouth: 'frown', ph: 1 }); B('bb_cry', { eye: 'shut', mouth: 'frown', tear: 1 });
  const rv = PAL.rover, V = (n, o) => bake(n, 48, 34, 24, 17, () => figBetta(rv, Object.assign({ cx: 26, cy: 17, rx: 10, ry: 5, eye: 'wild' }, o)), rv.ol);
  V('rv_idle_0', { mouth: 'open' }); V('rv_idle_1', { ph: 1, eye: 'wild2' }); V('rv_aim', { eye: 'wild', sleek: 1 });
  V('rv_dash', { sleek: 1, tl: 13, mouth: 'open' }); V('rv_laugh_0', { eye: 'shut', mouth: 'open' }); V('rv_laugh_1', { eye: 'shut', mouth: 'open', ph: 1 });
  V('rv_coil', { rx: 8, ry: 6, eye: 'wild2', ph: 1 }); V('rv_haha', { eye: 'shut', mouth: 'open', cy: 15 });
  const ch = PAL.cherry, C = (n, o) => bake(n, 50, 38, 25, 19, () => figBetta(ch, Object.assign({ cx: 27, cy: 19, rx: 11, ry: 7, eye: 'brow', mouth: 'frown' }, o)), ch.ol);
  C('ch_idle_0', {}); C('ch_idle_1', { ph: 1 }); C('ch_snort_0', { mouth: 'open' }); C('ch_snort_1', { mouth: 'open', ph: 1 });
  C('ch_charge', { sleek: 1, tl: 12, mouth: 'open' }); C('ch_stun', { eye: 'x', mouth: 'open', ph: 1 });
  C('ch_puff', { rx: 13, ry: 9, mouth: 'o' }); C('ch_shout', { rx: 12, ry: 8, mouth: 'open' }); C('ch_sad', { eye: 'sad', mouth: 'frown', ph: 1 });
  bake('ch_back', 50, 38, 25, 19, () => figBetta(ch, { cx: 27, cy: 19, rx: 11, ry: 7, eye: 'shut', tl: 12 }), ch.ol);
}

function figChicken(o) {
  const p = PAL.chicken, cx = 42, cy = 40 + (o.by || 0), rx = 30 + (o.rx || 0), ry = 16 + (o.ry || 0);
  const fin = o.fin || 0;
  E(cx - rx - 4, cy - 2, 7, 12 + fin, p.d);
  for (let i = 0; i < 8; i++) { const fx = cx - 22 + i * 6, fy = cy - ry - 2 - fin; R(fx, fy, 3, 4 + fin, p.d); P(fx + 1, fy - 1, p.d); }
  E(cx, cy, rx, ry, p.m);
  E(cx + 4, cy + 7, rx - 8, ry - 9, p.l);
  E(cx - 6, cy - ry + 4, rx - 12, 1, p.p);
  const st = (x, y) => { P(x - 1, y - 1, p.st); P(x + 1, y - 1, p.st); P(x, y, p.st); P(x - 1, y + 1, p.st); P(x + 1, y + 1, p.st); };
  Ln(cx - 18, cy - 6, cx - 4, cy - 2, p.st); for (let i = 0; i < 4; i++) { P(cx - 16 + i * 4, cy - 7 + i, p.st); P(cx - 16 + i * 4, cy - 4 + i, p.st); }
  st(cx - 8, cy + 6); st(cx + 6, cy - 9);
  Ln(cx - 22, cy + 4, cx - 14, cy + 9, p.p);
  const hx = cx + 22 + (o.hx || 0), hy = cy - 3 + (o.hy || 0);
  E(hx, hy, 13, 11, p.m);
  E(hx + 3, hy + 4, 9, 5, p.l);
  st(hx - 4, hy - 6);
  if (o.jaw) {
    const j = o.jaw;
    R(hx + 1, hy + 1, 13, 4 + j, p.mouth);
    for (let i = 0; i < 6; i++) { P(hx + 2 + i * 2, hy + 1, p.teeth); P(hx + 3 + i * 2, hy + 4 + j, p.teeth); }
    E(hx + 5, hy + 7 + j, 8, 2, p.m);
  } else {
    Ln(hx + 4, hy + 3, hx + 13, hy + 2, p.mouth); P(hx + 3, hy + 2, p.mouth);
    P(hx + 7, hy + 4, p.teeth); P(hx + 10, hy + 3, p.teeth);
  }
  const ek = '#301018';
  if (o.eye === 'shut') { R(hx + 3, hy - 4, 4, 1, ek); }
  else if (o.eye === 'x') { P(hx + 3, hy - 5, ek); P(hx + 5, hy - 5, ek); P(hx + 4, hy - 4, ek); P(hx + 3, hy - 3, ek); P(hx + 5, hy - 3, ek); }
  else if (o.eye === 'flash') { E(hx + 4, hy - 4, 3, 2, '#ffffff'); P(hx + 5, hy - 4, p.e); }
  else { E(hx + 4, hy - 4, 2, 2, p.e); P(hx + 5, hy - 4, ek); P(hx + 3, hy - 5, '#ffe0e8'); }
  R(hx + 1, hy - 8, 6, 1, p.st);
  E(cx + 6, cy + 9, 6, 3 + (o.pec || 0), p.p);
  E(cx - 10, cy + ry, 5, 2, p.p);
}
function buildChickenFrames() {
  const ol = PAL.chicken.ol, B = (n, o) => bake(n, 90, 62, 44, 61, () => figChicken(o), ol);
  B('ck_idle_0', {}); B('ck_idle_1', { by: -1, pec: 1 });
  B('ck_open', { jaw: 5, eye: 'flash' }); B('ck_bite', { jaw: 1, hx: 3 }); B('ck_stuck', { jaw: 6, eye: 'shut' });
  B('ck_rise', { fin: 2, eye: 'flash', pec: 2 }); B('ck_slam', { rx: 3, ry: -3, by: 3, eye: 'shut', jaw: 2 });
  B('ck_inhale', { rx: 2, ry: 3, by: -2, eye: 'shut' }); B('ck_walk_0', { by: -1 }); B('ck_walk_1', { by: 1, pec: 1 });
  B('ck_dead', { eye: 'x', jaw: 3 });
}

function figCrab(o) {
  const c = PAL.crab, cy = 9 + (o.by || 0);
  const lp = o.leg || 0;
  for (let i = 0; i < 3; i++) { P(4 + i * 2 + (lp && i % 2 ? 1 : 0), cy + 3, c.d); P(3 + i * 2, cy + 4 - (lp && i % 2 ? 1 : 0), c.d); P(11 + i * 2 - (lp && i % 2 ? 1 : 0), cy + 3, c.d); P(12 + i * 2, cy + 4 - (lp && !(i % 2) ? 1 : 0), c.d); }
  E(9, cy, 5, 3, c.m); R(6, cy - 2, 6, 1, c.l);
  P(7, cy - 3, c.d); P(7, cy - 4, c.e); P(11, cy - 3, c.d); P(11, cy - 4, c.e); P(7, cy - 5, c.w); P(11, cy - 5, c.w);
  P(8, cy + 1, c.e); P(10, cy + 1, c.e);
  const cl = o.claw || 'n';
  if (cl === 'n') { E(3, cy - 2, 2, 2, c.m); P(2, cy - 4, c.m); E(15, cy - 2, 2, 2, c.m); P(16, cy - 4, c.m); P(3, cy - 2, c.d); P(15, cy - 2, c.d); }
  else if (cl === 'up') { E(3, cy - 5, 2, 2, c.l); P(2, cy - 8, c.l); P(4, cy - 8, c.l); E(15, cy - 5, 2, 2, c.l); P(14, cy - 8, c.l); P(16, cy - 8, c.l); R(4, cy - 3, 1, 2, c.m); R(14, cy - 3, 1, 2, c.m); }
  else if (cl === 'pinch') { E(3, cy - 2, 2, 2, c.m); E(17, cy - 1, 3, 2, c.l); P(20, cy - 3, c.l); P(20, cy + 1, c.l); R(14, cy - 1, 2, 1, c.m); }
  if (o.hat) { R(5, cy - 9, 8, 3, c.hat); E(9, cy - 10, 4, 2, c.hat); R(5, cy - 6, 8, 1, c.hatD); }
}
function figJelly(o) {
  const c = PAL.jelly, g = o.glow, ph = o.ph || 0;
  const m = g ? c.glow : c.m, l = g ? c.glowL : c.l;
  for (let i = 0; i < 4; i++) {
    const x = 4 + i * 3;
    for (let y = 0; y < 8; y++) P(x + ((y + i + ph) % 4 < 2 ? 0 : 1), 11 + y, g ? c.glow : c.t);
  }
  E(8, 7, 6, 4, m);
  R(2, 9, 13, 2, g ? c.glow : c.d);
  E(7, 5, 3, 1, l); P(5, 4, '#ffffff');
  P(6, 8, '#402040'); P(10, 8, '#402040');
}
function figPuffer(o) {
  const c = PAL.puffer, cx = o.cx, cy = o.cy, r = o.r, ry = o.ry || r;
  if (o.spikes) {
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, x = Math.round(cx + Math.cos(a) * (r + 2)), y = Math.round(cy + Math.sin(a) * (ry + 2)); P(x, y, c.s); P(Math.round(cx + Math.cos(a) * (r + 1)), Math.round(cy + Math.sin(a) * (ry + 1)), c.s); }
  }
  E(cx - r - 1, cy, 2, 3, c.d);
  E(cx, cy, r, ry, c.m);
  E(cx + 1, cy + Math.ceil(ry / 2), r - 2, Math.max(1, Math.floor(ry / 2) - 1), c.b);
  E(cx - 1, cy - ry + 2, Math.max(1, r - 3), 0, c.l);
  for (let i = 0; i < 3; i++) P(cx - 2 + i * 2, cy - 1, c.d);
  const ex = cx + r - 3, ey = cy - 2;
  if (o.eye === 'x') { P(ex - 1, ey - 1, '#101018'); P(ex + 1, ey - 1, '#101018'); P(ex, ey, '#101018'); P(ex - 1, ey + 1, '#101018'); P(ex + 1, ey + 1, '#101018'); }
  else { R(ex, ey, 2, 2, '#ffffff'); P(ex + 1, ey + 1, '#101018'); if (o.angry) { P(ex - 1, ey - 1, '#101018'); P(ex, ey - 1, '#101018'); } }
  if (o.mouth) R(cx + r - 1, cy + 1, 2, 2, '#6a3010'); else P(cx + r, cy + 1, '#6a3010');
  E(cx + 1, cy + 1, 2, 1, c.d);
}
function figEelHead(o) {
  const c = PAL.eel;
  E(6, 5, 6, 3, c.m); E(6, 7, 5, 1, c.l);
  R(0, 3, 3, 5, c.m);
  if (o.open) { R(8, 5, 5, 3, c.mouth); P(9, 5, '#ffffff'); P(11, 7, '#ffffff'); R(8, 8, 4, 1, c.m); }
  else { Ln(7, 6, 12, 6, c.d); }
  P(9, 3, c.e); P(10, 3, c.e); P(10, 4, '#101018');
  P(3, 2, c.d); P(5, 2, c.d);
}
function buildEnemyFrames() {
  const cr = PAL.crab.ol;
  bake('crab_walk_0', 22, 18, 9, 17, () => figCrab({ by: 4 }), cr);
  bake('crab_walk_1', 22, 18, 9, 17, () => figCrab({ by: 4, leg: 1 }), cr);
  bake('crab_tele', 22, 18, 9, 17, () => figCrab({ by: 4, claw: 'up' }), cr);
  bake('crab_pinch', 22, 18, 9, 17, () => figCrab({ by: 4, claw: 'pinch' }), cr);
  bake('crabc_walk_0', 22, 22, 9, 21, () => figCrab({ by: 8, hat: 1 }), cr);
  bake('crabc_walk_1', 22, 22, 9, 21, () => figCrab({ by: 8, hat: 1, leg: 1 }), cr);
  bake('crabc_tele', 22, 22, 9, 21, () => figCrab({ by: 8, hat: 1, claw: 'up' }), cr);
  bake('crabc_pinch', 22, 22, 9, 21, () => figCrab({ by: 8, hat: 1, claw: 'pinch' }), cr);
  const jo = PAL.jelly.ol;
  bake('jelly_0', 17, 21, 8, 20, () => figJelly({ ph: 0 }), jo);
  bake('jelly_1', 17, 21, 8, 20, () => figJelly({ ph: 2 }), jo);
  bake('jelly_glow', 17, 21, 8, 20, () => figJelly({ ph: 1, glow: 1 }), '#207060');
  const po = PAL.puffer.ol;
  bake('puffer_0', 20, 18, 9, 16, () => figPuffer({ cx: 10, cy: 9, r: 6, ry: 5 }), po);
  bake('puffer_1', 20, 18, 9, 16, () => figPuffer({ cx: 10, cy: 8, r: 6, ry: 5, mouth: 1 }), po);
  bake('puffer_half', 24, 22, 11, 19, () => figPuffer({ cx: 12, cy: 10, r: 8, ry: 7, angry: 1, mouth: 1 }), po);
  bake('puffer_big', 32, 32, 15, 28, () => figPuffer({ cx: 16, cy: 16, r: 11, ry: 11, spikes: 1, angry: 1 }), po);
  bake('puffer_dizzy', 20, 18, 9, 16, () => figPuffer({ cx: 10, cy: 9, r: 6, ry: 4, eye: 'x', mouth: 1 }), po);
  bake('eel_head', 15, 11, 1, 5, () => figEelHead({}), PAL.eel.ol);
  bake('eel_open', 15, 11, 1, 5, () => figEelHead({ open: 1 }), PAL.eel.ol);
  const mn = PAL.minnow;
  bake('minnow_0', 10, 7, 5, 4, () => { E(5, 3, 3, 1, mn.m); P(1, 2, mn.d); P(1, 4, mn.d); P(2, 3, mn.d); P(7, 2, '#101018'); P(4, 2, mn.l); }, mn.ol);
  bake('minnow_1', 10, 7, 5, 4, () => { E(5, 3, 3, 1, mn.m); P(1, 3, mn.d); P(2, 3, mn.d); P(1, 2, mn.d); P(7, 2, '#101018'); P(4, 2, mn.l); }, mn.ol);
  bake('minnow_f', 10, 7, 5, 4, () => { E(5, 3, 3, 1, '#ff6070'); P(1, 2, '#c03040'); P(1, 4, '#c03040'); P(7, 2, '#ffffff'); }, mn.ol);
}

function buildPropFrames() {
  const o = PAL.outline;
  bake('p_hbub', 14, 14, 7, 7, () => { E(7, 7, 5, 5, 'rgba(255,200,230,0.45)'); P(4, 4, '#ffffff'); P(5, 3, '#ffffff'); ST(['.#.#.', '#####', '.###.', '..#..'], { '#': '#ff5a9a' }, 5, 6); }, '#a03a6a');
  bake('p_crumb', 8, 8, 4, 4, () => { E(4, 4, 2, 2, PAL.dozer.crumb); P(3, 3, '#f8d890'); P(5, 5, '#a07030'); }, '#5a3a14');
  bake('p_ball', 10, 10, 5, 5, () => { const c = PAL.ball; E(5, 5, 3, 3, c.m); P(3, 3, c.l); Ln(3, 7, 7, 3, '#ffffff'); P(6, 7, c.d); }, PAL.ball.ol);
  bake('p_bolt_0', 10, 10, 5, 5, () => { E(5, 5, 2, 2, '#c0a0ff'); P(5, 5, '#ffffff'); P(5, 1, '#f0e070'); P(5, 9, '#f0e070'); P(1, 5, '#f0e070'); P(9, 5, '#f0e070'); P(5, 2, '#c0a0ff'); P(5, 8, '#c0a0ff'); P(2, 5, '#c0a0ff'); P(8, 5, '#c0a0ff'); }, '#3a2a90');
  bake('p_bolt_1', 10, 10, 5, 5, () => { E(5, 5, 2, 2, '#e0d0ff'); P(5, 5, '#ffffff'); P(2, 2, '#f0e070'); P(8, 8, '#f0e070'); P(2, 8, '#f0e070'); P(8, 2, '#f0e070'); P(3, 3, '#c0a0ff'); P(7, 7, '#c0a0ff'); P(3, 7, '#c0a0ff'); P(7, 3, '#c0a0ff'); }, '#3a2a90');
  bake('p_rock', 14, 14, 7, 7, () => { E(7, 7, 5, 4, '#6a6a7a'); E(6, 5, 3, 2, '#8a8a9a'); P(5, 4, '#aaaabb'); P(9, 9, '#4a4a5a'); }, '#202028');
  bake('p_pebble', 8, 8, 4, 4, () => { E(4, 4, 2, 2, '#9a9ab0'); P(3, 3, '#c8c8d8'); }, '#303040');
  bake('pk_heart', 13, 12, 6, 11, () => { ST(['.rr.rr.', 'rWrrrrr', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'], { r: PAL.heart, W: '#ffffff' }, 3, 2); }, '#5a0a14');
  bake('pk_kibble', 10, 9, 5, 8, () => { ST(['.bbb..', 'bLbbbb', 'bbbbbb', '.bbbb.', '..b...'], { b: '#b87838', L: '#e8b070' }, 2, 2); }, '#4a2a10');
  bake('pk_treat', 22, 14, 11, 13, () => { E(11, 7, 7, 4, '#f08a40'); E(11, 5, 5, 1, '#f8b870'); ST(['o...', 'oo..', 'ooo.', 'oo..', 'o...'], { o: '#e06a28' }, 1, 5); P(16, 5, '#101018'); R(8, 7, 1, 3, '#c85a20'); R(11, 7, 1, 3, '#c85a20'); P(18, 3, '#ffffff'); P(19, 2, '#ffffff'); }, '#6a2a08');
  bake('sign', 22, 22, 11, 21, () => { R(10, 12, 3, 9, '#7a5234'); R(2, 3, 18, 10, '#b88a58'); R(2, 3, 18, 1, '#d8aa78'); R(2, 12, 18, 1, '#8a5a34'); R(5, 6, 12, 1, '#6a4428'); R(5, 9, 9, 1, '#6a4428'); }, '#2a1a0c');
  bake('clam_0', 22, 14, 11, 13, () => { E(11, 9, 9, 3, '#b890c8'); E(11, 7, 8, 3, '#d8b8e8'); for (let i = 0; i < 5; i++) Ln(11, 10, 4 + i * 3, 5, '#a878b8'); }, '#3a2048');
  bake('clam_1', 22, 20, 11, 19, () => { E(11, 16, 9, 2, '#b890c8'); E(11, 5, 8, 4, '#d8b8e8'); for (let i = 0; i < 5; i++) Ln(11, 9, 4 + i * 3, 2, '#a878b8'); E(11, 13, 3, 3, '#f8f0ff'); P(10, 12, '#ffffff'); E(11, 16, 6, 1, '#e8a8c8'); }, '#3a2048');
  bake('flag_0', 16, 30, 3, 29, () => { R(2, 2, 2, 27, '#8a8a9a'); P(2, 1, PAL.gold); P(3, 1, PAL.gold); R(4, 20, 9, 6, '#8a4a3a'); R(6, 22, 5, 2, '#f4ecdc'); }, o);
  bake('flag_1', 16, 30, 3, 29, () => { R(2, 2, 2, 27, '#8a8a9a'); P(2, 1, PAL.gold); P(3, 1, PAL.gold); R(4, 3, 10, 7, '#c03040'); R(6, 5, 6, 3, '#f4ecdc'); P(5, 5, '#f4ecdc'); P(5, 7, '#f4ecdc'); P(12, 5, '#f4ecdc'); P(12, 7, '#f4ecdc'); }, o);
  bake('bowl_full', 16, 9, 8, 8, () => { E(8, 5, 6, 2, '#c03838'); R(3, 3, 11, 1, '#e05858'); E(8, 3, 5, 1, '#b87838'); P(6, 2, '#d89858'); P(9, 2, '#d89858'); P(11, 3, '#d89858'); }, '#3a1010');
  bake('bowl_empty', 16, 9, 8, 8, () => { E(8, 5, 6, 2, '#c03838'); R(3, 3, 11, 1, '#e05858'); E(8, 3, 5, 1, '#5a2020'); }, '#3a1010');
  bake('bowl_blue', 16, 9, 8, 8, () => { E(8, 5, 6, 2, '#3858c0'); R(3, 3, 11, 1, '#5878e0'); E(8, 3, 5, 1, '#b87838'); P(6, 2, '#d89858'); P(9, 2, '#d89858'); }, '#101a3a');
  bake('bowl_pink', 16, 9, 8, 8, () => { E(8, 5, 6, 2, '#d05890'); R(3, 3, 11, 1, '#f078b0'); E(8, 3, 5, 1, '#b87838'); P(7, 2, '#d89858'); P(10, 2, '#d89858'); }, '#3a1028');
  bake('plat_bowl', 36, 14, 18, 2, () => { E(18, 6, 16, 5, '#a03838'); R(2, 2, 32, 2, '#d05858'); R(4, 1, 28, 1, '#e87878'); E(18, 3, 13, 1, '#5a2020'); R(10, 7, 16, 2, '#f4ecdc'); P(12, 7, '#a03838'); P(23, 8, '#a03838'); }, '#2a0808');
  bake('heater', 22, 24, 11, 23, () => { R(2, 4, 18, 18, '#c8c8d0'); for (let i = 0; i < 5; i++) R(3 + i * 4, 5, 2, 16, '#a0a0b0'); R(2, 4, 18, 1, '#e8e8f0'); R(3, 22, 2, 1, '#6a6a7a'); R(17, 22, 2, 1, '#6a6a7a'); P(18, 2, '#e05030'); P(18, 3, '#6a6a7a'); }, o);
  bake('cattree', 28, 44, 14, 43, () => { R(11, 8, 5, 34, '#d8c8a0'); for (let y = 10; y < 40; y += 3) R(11, y, 5, 1, '#b8a880'); R(2, 38, 24, 5, '#8a5a8a'); R(4, 20, 14, 4, '#8a5a8a'); R(10, 4, 16, 5, '#8a5a8a'); R(10, 4, 16, 1, '#aa7aaa'); R(4, 20, 14, 1, '#aa7aaa'); R(2, 38, 24, 1, '#aa7aaa'); P(6, 24, '#f0d040'); P(6, 25, '#f0d040'); P(6, 26, '#f0d040'); E(6, 28, 1, 1, '#f06080'); }, o);
  bake('gnome', 14, 20, 7, 19, () => { R(3, 12, 8, 7, '#3858c0'); E(7, 10, 3, 3, '#f0c8a8'); E(7, 13, 4, 3, '#f4f4f4'); R(3, 6, 8, 3, '#e03838'); R(4, 4, 6, 2, '#e03838'); R(5, 2, 4, 2, '#e03838'); P(6, 1, '#e03838'); P(5, 10, '#101018'); P(9, 10, '#101018'); P(7, 11, '#f09080'); R(3, 18, 3, 1, '#5a3a24'); R(8, 18, 3, 1, '#5a3a24'); }, o);
  bake('hose', 22, 14, 11, 13, () => { E(11, 8, 9, 4, '#3aa05a'); E(11, 8, 6, 2, '#5ac07a'); E(11, 8, 3, 1, '#3aa05a'); R(18, 3, 2, 5, '#3aa05a'); R(17, 2, 4, 2, '#c8c8d0'); }, o);
  bake('moth_0', 9, 7, 4, 3, () => { R(3, 2, 3, 3, '#d8c8a0'); R(0, 0, 3, 3, '#f0e8d0'); R(6, 0, 3, 3, '#f0e8d0'); }, null);
  bake('moth_1', 9, 7, 4, 3, () => { R(3, 2, 3, 3, '#d8c8a0'); R(1, 3, 2, 3, '#f0e8d0'); R(6, 3, 2, 3, '#f0e8d0'); }, null);
  bake('plight', 10, 12, 5, 11, () => { R(3, 2, 4, 7, '#f8f0a0'); R(2, 1, 6, 1, '#5a5a6a'); R(2, 9, 6, 2, '#5a5a6a'); P(4, 3, '#ffffff'); }, o);
  bake('raft', 72, 50, 36, 45, () => {
    R(35, 2, 2, 30, '#6a4428');
    R(37, 4, 16, 12, '#f4ecdc'); R(37, 4, 16, 1, '#ffffff'); ST(['.##....##.', '##########', '.##....##.'], { '#': '#c89858' }, 40, 8);
    E(36, 38, 32, 8, '#8a4a3a'); E(36, 36, 30, 6, '#b86a4a'); E(36, 36, 23, 4, '#e0a878'); E(36, 35, 20, 2, '#f0c898');
    for (let i = 0; i < 8; i++) P(10 + i * 7, 40, '#6a3a2a');
  }, '#2a1208');
  bake('bcage', 28, 36, 14, 35, () => {
    const g = '#c8a040', gd = '#8a6a20';
    E(14, 6, 11, 4, g); E(14, 7, 9, 3, 'rgba(0,0,0,0)');
    for (let x = 4; x <= 24; x += 4) R(x, 6, 1, 26, x % 8 === 0 ? g : gd);
    R(3, 31, 23, 3, g); R(3, 16, 23, 1, gd); R(13, 0, 2, 3, g); P(14, 1, gd);
  }, '#2a1a08');
  bake('gcage', 30, 38, 15, 37, () => {
    const g = '#f0c040', gd = '#b08820';
    E(15, 6, 12, 5, g);
    for (let x = 4; x <= 26; x += 4) R(x, 6, 1, 28, x % 8 === 0 ? g : gd);
    R(3, 33, 25, 3, g); R(3, 18, 25, 1, gd); R(14, 0, 2, 3, g); P(14, 34, '#e83848'); P(15, 34, '#40a0f0');
  }, '#3a2a08');
  bake('bcage_open', 28, 36, 14, 35, () => {
    const g = '#c8a040', gd = '#8a6a20';
    E(14, 6, 11, 4, g);
    for (let x = 4; x <= 24; x += 4) if (x < 12 || x > 16) R(x, 6, 1, 26, x % 8 === 0 ? g : gd);
    R(3, 31, 23, 3, g); R(13, 0, 2, 3, g);
  }, '#2a1a08');
  bake('gcage_open', 30, 38, 15, 37, () => {
    const g = '#f0c040', gd = '#b08820';
    E(15, 6, 12, 5, g);
    for (let x = 4; x <= 26; x += 4) if (x < 12 || x > 18) R(x, 6, 1, 28, x % 8 === 0 ? g : gd);
    R(3, 33, 25, 3, g); R(14, 0, 2, 3, g);
  }, '#3a2a08');
  bake('throne', 44, 58, 22, 57, () => {
    R(6, 2, 32, 40, '#8a1c2c'); R(8, 4, 28, 36, '#b02838'); R(4, 36, 36, 8, '#f0c040'); R(4, 44, 6, 12, '#f0c040'); R(34, 44, 6, 12, '#f0c040');
    R(2, 30, 6, 16, '#f0c040'); R(36, 30, 6, 16, '#f0c040'); P(22, 1, '#f0c040'); R(20, 0, 5, 3, '#f0c040'); P(22, 1, '#e83848');
    R(10, 38, 24, 2, '#c89830');
  }, '#2a0a10');
  bake('snacks', 44, 26, 22, 25, () => {
    E(22, 20, 20, 6, '#c89048'); E(14, 14, 7, 5, '#e0b060'); E(28, 12, 8, 6, '#d07040'); E(22, 6, 5, 4, '#f0d080');
    R(30, 8, 8, 2, '#f4ecdc'); E(8, 18, 4, 3, '#b86a30'); P(20, 4, '#ffffff'); P(12, 12, '#fff0c0');
  }, '#3a2008');
  bake('shell', 14, 12, 7, 11, () => { E(7, 6, 5, 5, '#c89868'); E(7, 6, 3, 3, '#a87848'); E(7, 6, 1, 1, '#886038'); R(1, 10, 12, 1, '#a87848'); P(5, 3, '#f0c898'); }, '#3a2410');
  bake('drum', 18, 12, 9, 6, () => { const p = PAL.dozer; E(6, 6, 5, 4, p.drum); E(5, 5, 3, 2, '#e09858'); R(10, 5, 5, 2, p.bone); P(15, 4, p.bone); P(15, 7, p.bone); }, '#3a1a08');
  bake('key', 14, 8, 7, 4, () => { E(3, 4, 2, 2, '#f0c040'); P(3, 4, 'rgba(0,0,0,0)'); R(5, 3, 7, 2, '#f0c040'); R(9, 5, 1, 2, '#f0c040'); R(11, 5, 1, 2, '#f0c040'); }, '#3a2a08');
  bake('heartrock', 36, 30, 18, 29, () => { E(11, 10, 8, 8, '#8a6a7a'); E(24, 10, 8, 8, '#8a6a7a'); for (let y = 0; y < 12; y++) R(4 + y, 13 + y, 28 - y * 2, 1, '#8a6a7a'); E(10, 8, 4, 3, '#b08aa0'); P(8, 6, '#d0aac0'); }, '#302030');
  bake('pot', 14, 14, 7, 13, () => { E(7, 8, 5, 4, '#9a9aa8'); R(3, 3, 9, 2, '#6a6a78'); R(6, 1, 3, 2, '#3a3a48'); P(5, 7, '#c8c8d8'); }, o);
  bake('snailrock', 34, 24, 17, 23, () => { E(20, 11, 10, 10, '#5a5060'); E(20, 11, 6, 6, '#6e6474'); E(20, 11, 2, 2, '#5a5060'); E(8, 19, 8, 3, '#5a5060'); R(3, 12, 2, 6, '#5a5060'); R(7, 12, 2, 6, '#5a5060'); P(3, 11, '#8a8090'); P(7, 11, '#8a8090'); }, '#1a1620');
  bake('fountain', 44, 36, 22, 35, () => {
    E(22, 28, 20, 6, '#8a8aa0'); E(22, 27, 17, 4, '#48a8d8'); E(22, 26, 12, 2, '#88d0f0');
    R(18, 10, 9, 16, '#d83838'); R(16, 12, 13, 3, '#d83838'); R(18, 8, 9, 3, '#e85858'); R(20, 6, 5, 2, '#d83838'); R(20, 10, 2, 14, '#f07070');
    for (let i = 0; i < 4; i++) { P(12 - i, 8 + i * 2, '#a8e0ff'); P(32 + i, 8 + i * 2, '#a8e0ff'); } P(22, 3, '#a8e0ff'); P(21, 1, '#a8e0ff'); P(23, 1, '#a8e0ff');
  }, '#1a1a28');
  bake('stall', 44, 40, 22, 39, () => {
    R(4, 4, 36, 8, '#e05858'); for (let i = 0; i < 6; i++) R(4 + i * 6, 4, 3, 8, '#f4ecdc');
    R(6, 12, 2, 26, '#7a5234'); R(36, 12, 2, 26, '#7a5234'); R(4, 26, 36, 10, '#b88a58'); R(4, 26, 36, 1, '#d8aa78'); R(8, 28, 28, 5, '#8a6440');
  }, '#2a1208');
  bake('tower', 44, 90, 22, 89, () => {
    R(10, 20, 24, 68, '#b88a58'); for (let y = 24; y < 88; y += 6) R(10, y, 24, 1, '#8a6440');
    R(4, 8, 36, 14, '#c05a3a'); R(8, 2, 28, 7, '#983a24'); R(4, 20, 36, 2, '#7a5234'); R(16, 11, 12, 6, '#302018'); R(18, 72, 8, 16, '#5a3a24');
  }, '#2a1208');
  bake('door_house', 34, 26, 17, 25, () => { R(1, 1, 32, 24, '#7a4e34'); R(3, 3, 13, 20, '#9a6644'); R(18, 3, 13, 20, '#9a6644'); P(15, 13, PAL.gold); P(18, 13, PAL.gold); R(1, 1, 32, 1, '#b88258'); }, o);
  bake('portcullis', 66, 36, 33, 35, () => { for (let x = 2; x < 64; x += 6) R(x, 1, 3, 32, '#5a5a6a'); for (let y = 4; y < 34; y += 8) R(1, y, 64, 2, '#4a4a58'); for (let x = 2; x < 64; x += 6) P(x + 1, 33, '#8a8a9a'); }, '#16161e');
  bake('bossdoor', 36, 52, 18, 51, () => { R(2, 6, 32, 45, '#5a3a22'); E(18, 8, 16, 7, '#5a3a22'); R(4, 8, 28, 43, '#7a5030'); R(17, 6, 2, 45, '#4a2e18'); R(6, 20, 24, 2, '#3a3a48'); R(6, 38, 24, 2, '#3a3a48'); E(18, 14, 4, 3, PAL.gold); P(17, 14, '#8a2030'); P(19, 14, '#8a2030'); }, '#1a0e06');
  bake('fishbowl', 24, 22, 12, 21, () => { E(12, 11, 10, 9, 'rgba(200,240,255,0.45)'); E(12, 14, 9, 5, 'rgba(90,170,230,0.55)'); R(6, 1, 12, 2, '#d8f4ff'); P(6, 7, '#ffffff'); P(5, 9, '#ffffff'); P(7, 5, '#ffffff'); R(6, 20, 12, 1, '#a8c8d8'); }, PAL.outline);
  bake('knife', 20, 8, 10, 4, () => { const c = PAL.halo; R(2, 3, 4, 2, c.handle); R(6, 3, 10, 1, c.blade); R(6, 4, 9, 1, c.bladeD); P(16, 3, c.blade); R(6, 2, 1, 4, '#c8c8d0'); }, PAL.outline);
  bake('gate_l', 68, 52, 0, 52, () => {
    R(0, 0, 68, 52, '#2a3a48'); R(0, 0, 68, 4, '#3a5060'); for (let i = 0; i < 6; i++) R(0, 8 + i * 8, 68, 1, '#1e2c38');
    R(30, 12, 18, 6, '#101820'); R(26, 10, 20, 2, '#0a1016'); E(42, 17, 4, 3, '#60f0d0'); R(46, 34, 22, 4, '#101820'); R(56, 30, 12, 4, '#101820');
  }, '#0a1016');
  bake('gate_r', 68, 52, 68, 52, () => {
    R(0, 0, 68, 52, '#2a3a48'); R(0, 0, 68, 4, '#3a5060'); for (let i = 0; i < 6; i++) R(0, 8 + i * 8, 68, 1, '#1e2c38');
    R(20, 12, 18, 6, '#101820'); R(22, 10, 20, 2, '#0a1016'); E(26, 17, 4, 3, '#60f0d0'); R(0, 34, 22, 4, '#101820'); R(0, 30, 12, 4, '#101820');
  }, '#0a1016');
  bake('chefhat', 12, 9, 6, 8, () => { R(2, 4, 8, 3, '#ffffff'); E(6, 3, 4, 2, '#ffffff'); R(2, 7, 8, 1, '#c8c8d0'); }, PAL.outline);
  bake('wizhat', 12, 12, 6, 11, () => { const c = PAL.twin; R(1, 9, 10, 2, c.hatD); R(3, 6, 6, 3, c.hat); R(4, 4, 4, 2, c.hat); R(5, 2, 3, 2, c.hat); P(8, 1, c.hatL); P(5, 7, c.star); }, PAL.outline);
  bake('hudheart', 11, 10, 0, 0, () => { ST(['.rr.rr.', 'rWrrrrr', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'], { r: PAL.heart, W: '#ffb0b8' }, 2, 1); }, PAL.outline);
  bake('hudheart_e', 11, 10, 0, 0, () => { ST(['.gg.gg.', 'ggggggg', 'ggggggg', 'ggggggg', '.ggggg.', '..ggg..', '...g...'], { g: '#4a4658' }, 2, 1); }, PAL.outline);
}

function buildAllSprites() {
  buildHaloFrames(); buildTwinFrames(); buildSugarFrames(); buildDogFrames(); buildPollyFrames(); buildLolaFrames();
  buildDozerFrames(); buildFishBossFrames(); buildChickenFrames(); buildEnemyFrames(); buildPropFrames();
}
