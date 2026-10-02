const G = {
  scene: null, sceneName: '', areaId: 'title', area: null, cp: -1, t: 0,
  freeze: 0, slow: 1, slowAcc: 0, slowT: 0, shakeT: 0, shakeP: 0, sx: 0, sy: 0,
  fade: 0, fadeState: '', fadeT: 0, fadeNext: null,
  cam: { x: 0, y: 0 }, lock: null, camTarget: null,
  lv: null, p: null, ky: null, ents: [], parts: [], texts: [],
  dlg: null, paused: false, pauseSel: 0, death: null, script: null,
  banner: null, toast: null, item: null, redFlash: 0, whiteFlash: 0, letter: 0, hideHud: false,
  debug: /debug/i.test(location.hash), god: false, boxes: false, swingId: 0, hp: PHYS.hp,
  st: { hasWeapon: false, hasHelmet: false, hasKylo: false, bossesBeaten: [], kibble: 0, deaths: 0, time: 0, got: new Set() },
  flags: {}, kibbleTotal: 0, lowBarked: false, bossHud: null
};

const TF = { S: 1, O: 2, HZ: 4, CUR: 8, WIND: 16, BOUNCE: 32 };
const SIDE_F = { '#': 1, '%': 1, '~': 1, 'A': 1, '=': 2, '^': 4, '<': 8, '>': 8, 'u': 8, 'd': 8, '{': 8, '}': 8, 'U': 8, 'V': 8, 'w': 16, 'O': 33 };
const TD_F = { '#': 1, 'W': 1, 'T': 1, 'F': 1, 'R': 1, 'B': 1, 'Q': 1 };
const CUR_V = { '<': [-60, 0], '>': [60, 0], 'u': [0, -60], 'd': [0, 60], '{': [-100, 0], '}': [100, 0], 'U': [0, -100], 'V': [0, 100] };

function tileAt(tx, ty) {
  const lv = G.lv; if (!lv) return '#';
  if (tx < 0 || tx >= lv.w || ty < 0) return '#';
  if (ty >= lv.h) return lv.td || lv.water ? '#' : '.';
  return lv.t[ty * lv.w + tx];
}
function flagsAt(tx, ty) {
  const lv = G.lv; if (!lv) return 1;
  if (tx >= 0 && ty >= 0 && tx < lv.w && ty < lv.h && lv.dyn[ty * lv.w + tx]) return 1;
  const ch = tileAt(tx, ty);
  return (lv.td ? TD_F[ch] : SIDE_F[ch]) || 0;
}
function solidT(tx, ty) { return flagsAt(tx, ty) & 1; }
function tileAtPx(x, y) { return tileAt(Math.floor(x / TS), Math.floor(y / TS)); }
function flagsAtPx(x, y) { return flagsAt(Math.floor(x / TS), Math.floor(y / TS)); }

function moveBody(e, dx, dy, opt) {
  const res = { l: 0, r: 0, u: 0, d: 0, df: 0, plat: null };
  const lv = G.lv; opt = opt || {};
  if (dx) {
    e.x += dx;
    const b = boxOf(e);
    const y0 = Math.floor(b.y / TS), y1 = Math.floor((b.y + b.h - 0.01) / TS);
    if (dx > 0) { const tx = Math.floor((b.x + b.w - 0.01) / TS); for (let ty = y0; ty <= y1; ty++) if (solidT(tx, ty)) { e.x = tx * TS - e.w / 2; res.r = 1; break; } }
    else { const tx = Math.floor(b.x / TS); for (let ty = y0; ty <= y1; ty++) if (solidT(tx, ty)) { e.x = (tx + 1) * TS + e.w / 2; res.l = 1; break; } }
    if (opt.solids !== false) for (const s of lv.solids) {
      const bb = boxOf(e); if (!overlap(bb, s)) continue;
      if (dx > 0) { e.x = s.x - e.w / 2; res.r = 1; } else { e.x = s.x + s.w + e.w / 2; res.l = 1; }
    }
  }
  if (dy) {
    const prev = e.y;
    e.y += dy;
    const b = boxOf(e);
    const x0 = Math.floor(b.x / TS), x1 = Math.floor((b.x + b.w - 0.01) / TS);
    if (dy > 0) {
      const ty = Math.floor((b.y + b.h - 0.01) / TS);
      for (let tx = x0; tx <= x1; tx++) {
        const f = flagsAt(tx, ty);
        if ((f & 1) || ((f & 2) && opt.oneway && !opt.drop && prev <= ty * TS + 0.01)) { e.y = ty * TS; res.d = 1; res.df |= f; }
      }
      if (opt.plats) for (const pl of lv.plats) {
        if (b.x + b.w > pl.x && b.x < pl.x + pl.w && prev <= pl.y + 0.5 && e.y >= pl.y) { e.y = pl.y; res.d = 1; res.plat = pl; }
      }
    } else {
      const ty = Math.floor(b.y / TS);
      for (let tx = x0; tx <= x1; tx++) if (solidT(tx, ty)) { e.y = (ty + 1) * TS + e.h; res.u = 1; break; }
    }
    if (opt.solids !== false) for (const s of lv.solids) {
      const bb = boxOf(e); if (!overlap(bb, s)) continue;
      if (dy > 0) { e.y = s.y; res.d = 1; } else { e.y = s.y + s.h + e.h; res.u = 1; }
    }
  }
  return res;
}
function boxFree(x, y, w, h) {
  const x0 = Math.floor(x / TS), x1 = Math.floor((x + w - 0.01) / TS), y0 = Math.floor(y / TS), y1 = Math.floor((y + h - 0.01) / TS);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (solidT(tx, ty)) return false;
  const b = { x, y, w, h };
  for (const s of G.lv.solids) if (overlap(b, s)) return false;
  return true;
}
function entFree(e, ox, oy) { return boxFree(e.x - e.w / 2 + (ox || 0), e.y - e.h + (oy || 0), e.w, e.h); }
function unstick(e) {
  if (entFree(e)) return;
  for (let r = 2; r <= 40; r += 2) for (const d of [[0, -1], [1, 0], [-1, 0], [0, 1], [1, -1], [-1, -1], [1, 1], [-1, 1]]) {
    if (entFree(e, d[0] * r, d[1] * r)) { e.x += d[0] * r; e.y += d[1] * r; return; }
  }
}
function hazardBoxes(b) {
  const out = [];
  const x0 = Math.floor(b.x / TS), x1 = Math.floor((b.x + b.w - 0.01) / TS), y0 = Math.floor(b.y / TS), y1 = Math.floor((b.y + b.h - 0.01) / TS);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (flagsAt(tx, ty) & TF.HZ) {
    const hb = G.lv.water ? { x: tx * TS + 3, y: ty * TS + 3, w: 10, h: 10 } : { x: tx * TS + 2, y: ty * TS + 8, w: 12, h: 8 };
    if (overlap(b, hb)) out.push(hb);
  }
  return out;
}

function spawn(type, x, y, props) {
  const T = TYPES[type]; if (!T) return null;
  const e = { type, x, y, vx: 0, vy: 0, face: -1, state: 'idle', t: 0, anim: Math.random() * 10, hp: T.hp || 1, w: T.w || 12, h: T.h || 12, flash: 0, inv: 0, dead: false, dying: 0, hitBy: -1, kbx: 0, contact: false, atkBox: null, ring: null, enemy: !!T.enemy, boss: !!T.boss };
  if (props) Object.assign(e, props);
  e.maxHp = e.hp;
  if (T.init) T.init(e);
  G.ents.push(e);
  return e;
}
function nearCam(e) { return Math.abs(e.x - (G.cam.x + W / 2)) < W * 1.5 && Math.abs(e.y - (G.cam.y + H / 2)) < H * 1.5; }
function onScreen(x, y, m) { m = m || 0; return x > G.cam.x - m && x < G.cam.x + W + m && y > G.cam.y - m && y < G.cam.y + H + m; }

function part(o) { if (G.parts.length > 500) return; G.parts.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, g: 0, life: 0.5, t: 0, col: '#ffffff', sz: 1, k: 'dot', drag: 0 }, o)); }
function puff(x, y, n, col) { for (let i = 0; i < n; i++) { const a = rnd(0, Math.PI * 2), s = rnd(20, 70); part({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.25, 0.5), col: col || '#e8e0d0', sz: rndi(2, 4), k: 'puff', drag: 4 }); } }
function sparkle(x, y, n, col) { for (let i = 0; i < n; i++) { const a = rnd(0, Math.PI * 2), s = rnd(40, 120); part({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.15, 0.3), col: col || '#ffffff', sz: 1, k: 'spark', drag: 6 }); } }
function bubbleP(x, y, n) { for (let i = 0; i < n; i++) part({ x: x + rnd(-3, 3), y: y + rnd(-3, 3), vx: rnd(-8, 8), vy: rnd(-40, -20), life: rnd(0.6, 1.2), col: '#d8f4ff', sz: rndi(1, 2), k: 'bubble' }); }
function dust(x, y, n) { for (let i = 0; i < n; i++) part({ x: x + rnd(-4, 4), y, vx: rnd(-40, 40), vy: rnd(-30, -5), life: rnd(0.2, 0.4), col: G.lv && G.lv.water ? '#d8f4ff' : '#d8d0c0', sz: rndi(1, 2), k: 'puff', drag: 5 }); }
function floatText(s, x, y, col, sc, life) { G.texts.push({ s, x, y, t: 0, life: life || 1.4, col: col || PAL.uiLight, sc: sc || 1 }); }
function shake(px, s) { G.shakeP = Math.min(6, Math.max(G.shakeP, px)); G.shakeT = Math.min(0.5, Math.max(G.shakeT, s)); }
function hitstop(f) { G.freeze = Math.max(G.freeze, f); }
function updParts(dt) {
  for (const q of G.parts) {
    q.t += dt; q.vy += q.g * dt;
    if (q.drag) { const k = Math.max(0, 1 - q.drag * dt); q.vx *= k; q.vy *= k; }
    q.x += q.vx * dt; q.y += q.vy * dt;
    if (q.k === 'bubble') q.x += Math.sin(q.t * 8 + q.y) * 0.3;
  }
  G.parts = G.parts.filter(q => q.t < q.life);
  for (const t of G.texts) { t.t += dt; t.y -= 16 * dt; }
  G.texts = G.texts.filter(t => t.t < t.life);
}

function camBounds() {
  const lv = G.lv, mw = lv.w * TS, mh = lv.h * TS;
  return { x0: 0, y0: 0, x1: Math.max(0, mw - W), y1: Math.max(0, mh - H), mw, mh };
}
function camGoal() {
  const p = G.p, lv = G.lv, c = G.cam;
  if (G.camTarget) return { x: G.camTarget.x - W / 2, y: G.camTarget.y - H / 2, k: G.camTarget.k || 3 };
  if (G.lock) return { x: G.lock.x, y: G.lock.y, k: 10 };
  if (!p) return { x: c.x, y: c.y, k: 5 };
  if (lv.view === 'boss') return { x: 0, y: 0, k: 10 };
  if (lv.td) {
    let gx = c.x, gy = c.y;
    const dx = p.x - (c.x + W / 2), dy = p.y - 8 - (c.y + H / 2);
    if (dx > 12) gx = p.x - W / 2 - 12; else if (dx < -12) gx = p.x - W / 2 + 12;
    if (dy > 8) gy = p.y - 8 - H / 2 - 8; else if (dy < -8) gy = p.y - 8 - H / 2 + 8;
    return { x: gx, y: gy, k: 8 };
  }
  if (lv.water) {
    const la = p.face * 20;
    let gy = p.y - 6 - H / 2;
    if (lv.A.cam === 'down') gy = p.y - 6 - H * 0.35;
    return { x: p.x + la - W / 2, y: gy, k: 6 };
  }
  let gy = c.y;
  if (lv.A.cam === 'up') gy = p.y - H * 0.65;
  else { const py = p.y - 8 - (c.y + H * 0.55); if (py > 24) gy = p.y - 8 - H * 0.55 - 24; else if (py < -24) gy = p.y - 8 - H * 0.55 + 24; }
  return { x: p.x + p.face * 40 - W / 2, y: gy, k: 5, ky: lv.A.cam === 'up' ? 6 : 8 };
}
function camUpdate(dt, snap) {
  const g = camGoal(), b = camBounds(), c = G.cam;
  const gx = clamp(g.x, b.x0, b.x1), gy = clamp(g.y, b.y0, b.y1);
  if (snap) { c.x = gx; c.y = gy; }
  else { c.x = damp(c.x, gx, g.k, dt); c.y = damp(c.y, gy, g.ky || g.k, dt); }
  if (b.mw < W) c.x = -(W - b.mw) / 2;
  if (b.mh < H) c.y = -(H - b.mh) / 2;
}

function gotoArea(id, opts) {
  if (G.fadeState === 'out') return;
  G.fadeState = 'out'; G.fadeT = 0;
  G.fadeNext = () => loadArea(id, opts || {});
}
function nextArea() {
  const i = ORDER.indexOf(G.areaId);
  gotoArea(ORDER[Math.min(ORDER.length - 1, i + 1)]);
}
function updFade(dt) {
  if (!G.fadeState) return;
  G.fadeT += dt;
  if (G.fadeState === 'out') {
    G.fade = Math.min(1, G.fadeT / 0.25);
    if (G.fadeT >= 0.25) { const f = G.fadeNext; G.fadeNext = null; G.fadeState = 'in'; G.fadeT = 0; G.fade = 1; if (f) f(); }
  } else {
    G.fade = Math.max(0, 1 - G.fadeT / 0.25);
    if (G.fadeT >= 0.25) { G.fadeState = ''; G.fade = 0; }
  }
}

function resetWorldState() {
  G.ents = []; G.parts = []; G.texts = []; G.lock = null; G.camTarget = null; G.script = null; G.dlg = null; G.death = null;
  G.banner = null; G.item = null; G.freeze = 0; G.slow = 1; G.slowT = 0; G.slowAcc = 0; G.lowBarked = false; G.bossHud = null;
  G.letter = 0; G.hideHud = false; G.redFlash = 0; G.whiteFlash = 0; G.paused = false; G.p = null; G.ky = null; G.lv = null;
}
function loadArea(id, opts) {
  opts = opts || {};
  const A = AREAS[id];
  resetWorldState();
  G.areaId = id; G.area = A;
  G.cp = opts.cp !== undefined ? opts.cp : -1;
  if (A.view === 'title' || A.view === 'card' || A.view === 'cutscene' || A.view === 'end') {
    setScene(A.view, opts);
    if (A.music) music(A.music);
    if (A.view !== 'title' && A.view !== 'end') writeSave();
    return;
  }
  const data = areaData(id);
  const lv = G.lv = makeLevel(A, data, opts);
  const sp = (G.cp >= 0 && lv.cps[G.cp]) ? { x: lv.cps[G.cp].x, y: lv.cps[G.cp].y } : (lv.spawnP || { x: 64, y: 64 });
  const mode = lv.td ? 'td' : lv.water ? 'water' : 'land';
  G.p = makePlayer(sp.x, sp.y, mode);
  if (opts.retry || opts.fresh) G.hp = PHYS.hp;
  G.p.hp = clamp(G.hp, 1, PHYS.hp);
  if (G.cp >= 0 && lv.cps[G.cp]) lv.cps[G.cp].on = true;
  if (G.st.hasKylo && A.kylo !== false) G.ky = makeKylo(G.p);
  unstick(G.p);
  camUpdate(0, true);
  setScene(A.view === 'topdown' ? 'topdown' : A.view === 'boss' ? 'boss' : 'side', opts);
  music(A.music);
  writeSave();
  if (A.view !== 'boss' && A.name && !opts.retry) showBanner(A.name, A.sub, 2.0);
  if (A.boss) bossArenaStart(A, opts);
  if (A.onEnter && SCRIPTS[A.onEnter]) SCRIPTS[A.onEnter](opts);
}
function showBanner(name, sub, dur) { G.banner = { name, sub, t: 0, dur: dur || 2.0 }; }

function makeLevel(A, data, opts) {
  const rows = data.tiles, h = rows.length, w = rows[0].length;
  const lv = { A, w, h, t: new Array(w * h), dyn: new Uint8Array(w * h), water: !!A.water, view: A.view, td: A.view === 'topdown', rooms: [], plats: [], solids: [], cps: [], exits: [], trig: [], fired: {}, spawnP: null, wind: null, boss: null, retry: !!opts.retry, lt: 0, rumbleT: rnd(8, 12), curT: 0, name: A.id };
  G.lv = lv;
  const marks = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let ch = rows[y][x];
    if (isMark(ch, lv.td)) { marks.push([ch, x, y]); ch = lv.td ? tdUnder(rows, x, y) : '.'; }
    lv.t[y * w + x] = ch;
  }
  for (let i = 0; i < w * h; i++) {
    if (lv.t[i] === '+' && !G.flags.doorOpen) lv.dyn[i] = 1;
    if (lv.t[i] === 'G' && !G.flags.gateOpen) lv.dyn[i] = 1;
  }
  for (const [ch, x, y] of marks) {
    const px = x * TS + 8, py = y * TS + 16;
    if (ch === 'P') lv.spawnP = { x: px, y: py };
    else if (ch === 'C') { const e = spawn('check', px, py, { idx: lv.cps.length }); lv.cps.push(e); }
    else if (ch === 'o') { const key = A.id + ':' + x + ',' + y; if (!G.st.got.has(key)) spawn('kibble', px, py - 4, { key }); }
    else if (ch === 'H') spawn('treat', px, py - 2);
    else if (ch === 'D') lv.exits.push({ x: x * TS, y: y * TS, w: TS, h: TS, tx: x, ty: y });
    else if (ENEMY_CH[ch]) spawn(ENEMY_CH[ch], px, py);
  }
  if (lv.exits.length && !lv.td) {
    const e0 = lv.exits.reduce((a, b) => (b.ty > a.ty ? b : a), lv.exits[0]);
    spawn('exit', e0.x + 8 + (lv.water ? 0 : 8), e0.y + 16, { water: lv.water });
  }
  for (const s of (data.spawns || [])) spawnFromData(s, lv);
  for (const r of (data.rooms || [])) lv.rooms.push({ x: r.x, y: r.y, w: 24, h: 18, waves: r.waves, state: 'idle', wi: 0, ents: [], sealed: [], t: 0, gap: 0 });
  for (const tg of (data.trig || [])) lv.trig.push(Object.assign({}, tg));
  if (A.id === 'castle_2') lv.wind = { t: 0, ph: 'calm', dir: 1 };
  bakeLevel(lv);
  return lv;
}
function isMark(ch, td) { return ch === 'P' || ch === 'C' || ch === 'o' || ch === 'H' || ch === 'D' || (!td && !!ENEMY_CH[ch]); }
function tdUnder(rows, x, y) {
  for (const d of [[-1, 0], [1, 0], [0, -1], [0, 1], [-2, 0], [2, 0]]) { const r = rows[y + d[1]]; const c = r && r[x + d[0]]; if (c && !isMark(c, true) && !TD_F[c] && c !== '+' && c !== 'G') return c; }
  return '.';
}
function spawnFromData(s, lv) {
  const tx = s.x, ty = s.y;
  const px = lv.td ? tx : tx * TS + 8, py = lv.td ? ty : ty * TS + 16;
  if (s.t === 'sign') spawn('sign', px, py, { text: s.text });
  else if (s.t === 'prop') {
    const e = spawn('prop', px, py, { spr: s.spr, bob: s.bob, talk: s.talk, under: s.under, high: s.high, label: s.label });
    if (s.solid) lv.solids.push({ x: px - s.solid[0] / 2, y: py - s.solid[1], w: s.solid[0], h: s.solid[1] });
    if (s.talk) e.talkable = true;
  }
  else if (s.t === 'crab') spawn('crab', px, py, { chef: s.chef });
  else if (s.t === 'bowl' && !lv.td) { const pl = spawn('bowlplat', tx * TS, ty * TS, { x0: tx * TS, y0: ty * TS, dx: s.dx, dy: s.dy, pw: 32 }); lv.plats.push(pl); }
  else if (s.t === 'bowl') spawn('bowl', px, py, { spr: s.spr, id: s.id, full: true });
  else if (s.t === 'ledge') { const pl = spawn('ledge', tx * TS, ty * TS, { pw: s.w * TS }); lv.plats.push(pl); }
  else if (s.t === 'sugar') spawn('sugar', px, py, { id: 'sugar' });
  else if (s.t === 'moth') spawn('moth', px, py, { cx: px, cy: py });
  else if (s.t === 'door') spawn('door', px, py, { tx: s.tx, ty: s.ty });
  else if (s.t === 'npc') spawn('npc', px, py, { k: s.k, pup: s.pup, line: s.line, spin: s.spin, gate: s.gate, talkable: true });
  else if (s.t === 'parkball') spawn('parkball', px, py);
  else if (s.t === 'portcullis') spawn('portcullis', px, py);
  else if (s.t === 'label') spawn('label', px, py, { text: s.text });
  else if (s.t === 'rockgate') spawn('rockgate', tx * TS, ty * TS, { tw: s.w, th: s.h, tx, ty });
}
function tileVisId(lv, x, y) {
  const ch = lv.t[y * lv.w + x];
  const sol = (a, b) => { const c = (a < 0 || b < 0 || a >= lv.w || b >= lv.h) ? '#' : lv.t[b * lv.w + a]; return lv.td ? !!TD_F[c] : (c === '#' || c === '%' || c === '~' || c === 'A'); };
  if (lv.td) {
    const town = lv.A.pal === 'town';
    switch (ch) {
      case '.': return 'grass'; case 'f': return 'flower'; case ',': return town ? 'road' : 'path'; case '_': return 'floor'; case 'r': return 'rug';
      case '#': return (y + 1 < lv.h && lv.t[(y + 1) * lv.w + x] !== '#' && lv.t[(y + 1) * lv.w + x] !== '+') ? 'wallf' : 'wallt';
      case 'W': return (y > 0 && lv.t[(y - 1) * lv.w + x] !== 'W' && lv.t[(y - 1) * lv.w + x] !== 'k') ? 'water_t' : 'water';
      case 'T': return 'tree'; case 'F': return 'fence'; case '+': return 'floor'; case 'k': return 'dock'; case 's': return 'sand';
      case 'R': return 'roof'; case 'B': return 'bwall'; case 'Q': return (y === 3 || (y + 1 < lv.h && lv.t[(y + 1) * lv.w + x] !== 'Q' && lv.t[(y + 1) * lv.w + x] !== 'G')) ? 'cwallf' : 'cwallt'; case 'G': return 'road'; case 'p': return 'plaza';
    }
    return 'grass';
  }
  const castle = lv.A.pal === 'castle' || lv.A.pal === 'roof';
  if (ch === '#') { const t = !sol(x, y - 1), b = !sol(x, y + 1); return (castle ? 'stone' : 'rock') + (t ? '_t' : '') + (b ? '_b' : ''); }
  if (ch === '%') return 'wood';
  if (ch === '=') return castle ? (lv.A.pal === 'roof' ? 'hedge' : 'plank') : 'ledge';
  if (ch === '^') return castle ? 'spike' : null;
  if (ch === '~') return 'surf';
  if (ch === 'A') return 'sky';
  if (ch === 'O') return 'pillow';
  if (ch >= '1' && ch <= '9') return 'd' + ch;
  return null;
}
function bakeLevel(lv) {
  const pal = PAL.area[lv.A.pal];
  const pw = lv.w * TS, ph = lv.h * TS, nx = Math.ceil(pw / 512), ny = Math.ceil(ph / 512);
  lv.chunks = []; lv.fg = [];
  for (let cy = 0; cy < ny; cy++) for (let cx = 0; cx < nx; cx++) {
    const c = mkCanvas(Math.min(512, pw - cx * 512), Math.min(512, ph - cy * 512));
    let f = null;
    const tx0 = cx * 32, ty0 = cy * 32;
    for (let ty = ty0; ty < Math.min(lv.h, ty0 + 32); ty++) for (let tx = tx0; tx < Math.min(lv.w, tx0 + 32); tx++) {
      const id = tileVisId(lv, tx, ty);
      if (id) drawTile(c.g, id, tx * TS - cx * 512, ty * TS - cy * 512, pal, tx, ty);
      if (!lv.td && id && id.indexOf('_t') > 0 && hash2(tx, ty * 3) < 0.35 && ty > 0 && !SIDE_F[lv.t[(ty - 1) * lv.w + tx]]) {
        if (!f) f = mkCanvas(c.width, c.height);
        drawFgDeco(f.g, tx * TS - cx * 512, ty * TS - cy * 512, pal, lv.A.pal, tx, ty);
      }
    }
    lv.chunks.push({ c, x: cx * 512, y: cy * 512 });
    if (f) lv.fg.push({ c: f, x: cx * 512, y: cy * 512 });
  }
  lv.far = bakeFar(lv.A.bg || lv.A.pal, pal);
}

function makePlayer(x, y, mode) {
  return {
    type: 'halo', x, y, vx: 0, vy: 0, w: 10, h: mode === 'td' ? 6 : 13, face: 1, mode, hp: PHYS.hp, inv: 0, flash: 0, hurtT: 0, lock: 0,
    dashT: 0, dashCd: 0, dashInv: 0, dashDx: 1, dashDy: 0, airDash: 1, grounded: false, coyote: 0, jumpBuf: 0, atkBuf: 0,
    atk: null, comboT: 0, comboN: 0, anim: 0, safe: { x, y }, safeT: 0, dropT: 0, ride: null, tdDir: 'd',
    tilt: 0, bubT: 0.3, dead: false, deadT: 0, ghosts: [], ghostT: 0, helmet: mode === 'water', ctrl: true, walkTo: null, trail: [], moving: false, blinkT: 3, slash: null
  };
}
function bossLock() { const B = G.lv && G.lv.boss; return !!B && B.phase !== 'fight' && B.phase !== 'phasing'; }
function playerCtrl(p) { return p.ctrl && !G.script && !G.dlg && G.fadeState !== 'out' && !bossLock(); }
function updatePlayer(p, dt) {
  p.inv = Math.max(0, p.inv - dt); p.flash = Math.max(0, p.flash - dt); p.hurtT = Math.max(0, p.hurtT - dt); p.lock = Math.max(0, p.lock - dt);
  p.dashCd = Math.max(0, p.dashCd - dt); p.dashInv = Math.max(0, p.dashInv - dt); p.comboT = Math.max(0, p.comboT - dt);
  p.jumpBuf = Math.max(0, p.jumpBuf - dt); p.atkBuf = Math.max(0, p.atkBuf - dt); p.blinkT -= dt; if (p.blinkT < -0.12) p.blinkT = rnd(3, 5);
  for (const gh of p.ghosts) gh.t += dt;
  p.ghosts = p.ghosts.filter(gh => gh.t < 0.18);
  if (p.slash) { p.slash.t += dt; if (p.slash.t > 0.12) p.slash = null; }
  if (p.dead) { p.deadT += dt; if (p.mode !== 'td' && !p.grounded && p.mode === 'land') { p.vy = Math.min(p.vy + 900 * dt, 300); const r = moveBody(p, 0, p.vy * dt, { oneway: true }); if (r.d) { p.vy = 0; p.grounded = true; } } return; }
  const ctrl = playerCtrl(p);
  if (ctrl) { if (tapped('jump')) p.jumpBuf = PHYS.land.buf; if (tapped('attack')) p.atkBuf = PHYS.atkBuf; }
  let ix = 0, iy = 0;
  if (ctrl) { ix = (held('right') ? 1 : 0) - (held('left') ? 1 : 0); iy = (held('down') ? 1 : 0) - (held('up') ? 1 : 0); if (p.mode === 'water' && keys.Space) iy = -1; }
  if (p.autoX !== undefined && p.autoX !== null) { const dx = p.autoX - p.x; if (Math.abs(dx) < 3) { p.autoX = null; p.vx = 0; } else ix = sgn(dx); }
  if (p.mode === 'td') updTD(p, dt, ix, iy, ctrl);
  else if (p.mode === 'land') updLand(p, dt, ix, iy, ctrl);
  else updWater(p, dt, ix, iy, ctrl);
  if (ctrl || p.atk) { if (ctrl) tryAttack(p); stepAttack(p); }
  const b = camBounds();
  p.x = clamp(p.x, p.w / 2, b.mw - p.w / 2);
  if (p.mode !== 'land') p.y = clamp(p.y, p.h, b.mh);
  if (p.hp === 1 && !G.lowBarked && !p.dead) { G.lowBarked = true; floatText(LINES.bark_low, p.x, p.y - 30, PAL.gold, 1, 2); }
  p.anim += dt;
  p.trail.push([p.x, p.y, p.tdDir, p.face, p.moving]);
  if (p.trail.length > 20) p.trail.shift();
}
function canCancel(p) { return !p.atk || p.atk.f >= p.atk.d.su + p.atk.d.ac; }
function startDash(p, dx, dy, cfg) {
  if (!dx && !dy) dx = p.face;
  const m = Math.hypot(dx, dy); p.dashDx = dx / m; p.dashDy = dy / m;
  p.dashT = cfg.t; p.dashCd = cfg.cd; p.dashInv = cfg.inv || 0; p.atk = null;
  if (dx) p.face = sgn(dx);
  sfx('dash');
}
function addGhost(p) { p.ghostT -= STEP; if (p.ghostT <= 0) { p.ghostT = 0.045; p.ghosts.push({ x: p.x, y: p.y, name: haloFrame(p), flip: p.face < 0, t: 0 }); } }
function updTD(p, dt, ix, iy, ctrl) {
  const T = PHYS.td;
  let mx = ix, my = iy;
  if (p.walkTo) {
    const dx = p.walkTo.x - p.x, dy = p.walkTo.y - p.y, d = Math.hypot(dx, dy);
    if (d < 2) { p.x = p.walkTo.x; p.y = p.walkTo.y; p.walkTo = null; mx = my = 0; if (p.faceTo) { applyFace(p, p.faceTo); p.faceTo = null; } }
    else { mx = dx / d; my = dy / d; }
  }
  const m = Math.hypot(mx, my); if (m > 0) { mx /= m; my /= m; }
  if (ctrl && tapped('dash') && p.dashCd <= 0 && !p.atk) { p.dashT = T.dashT; p.dashCd = T.dashCd; const dd = m > 0 ? [mx, my] : (p.tdDir === 'd' ? [0, 1] : p.tdDir === 'u' ? [0, -1] : [p.face, 0]); p.dashDx = dd[0]; p.dashDy = dd[1]; sfx('dash'); }
  if (p.dashT > 0) { p.dashT -= dt; p.vx = p.dashDx * T.dashV; p.vy = p.dashDy * T.dashV; addGhost(p); }
  else {
    const sp = p.walkTo ? (p.walkTo.s || T.walk) : T.walk;
    const tx = mx * sp, ty = my * sp;
    const acc = m > 0 ? T.walk / T.accT : T.walk / T.decT;
    p.vx = approach(p.vx, tx, acc * dt); p.vy = approach(p.vy, ty, acc * dt);
    if (p.atk) { p.vx *= 0.5; p.vy *= 0.5; }
  }
  const r1 = moveBody(p, p.vx * dt, 0, {});
  if ((r1.l || r1.r) && Math.abs(my) < 0.1) {
    const s = r1.r ? 1 : -1;
    for (const o of [-4, 4]) if (entFree(p, s, o)) { p.y += sgn(o) * Math.min(1.5, Math.abs(o)); break; }
  }
  const r2 = moveBody(p, 0, p.vy * dt, {});
  if ((r2.u || r2.d) && Math.abs(mx) < 0.1) {
    const s = r2.d ? 1 : -1;
    for (const o of [-4, 4]) if (entFree(p, o, s)) { p.x += sgn(o) * Math.min(1.5, Math.abs(o)); break; }
  }
  p.moving = Math.hypot(p.vx, p.vy) > 12;
  if (m > 0 && !p.atk) {
    if (Math.abs(my) > Math.abs(mx) + 0.01) p.tdDir = my > 0 ? 'd' : 'u';
    else { p.tdDir = 's'; p.face = mx > 0 ? 1 : -1; }
  }
}
function applyFace(p, f) { if (f === 'l') { p.tdDir = 's'; p.face = -1; } else if (f === 'r') { p.tdDir = 's'; p.face = 1; } else p.tdDir = f; }
function standingOnOneway(p) {
  const ty = Math.floor((p.y + 1) / TS), x0 = Math.floor((p.x - p.w / 2) / TS), x1 = Math.floor((p.x + p.w / 2 - 0.01) / TS);
  let one = false;
  for (let tx = x0; tx <= x1; tx++) { const f = flagsAt(tx, ty); if (f & 1) return false; if (f & 2) one = true; }
  return one;
}
function updLand(p, dt, ix, iy, ctrl) {
  const L = PHYS.land, D = PHYS.dash.land;
  if (p.ride) { p.x += p.ride.ddx || 0; p.y = p.ride.y; }
  if (ctrl && tapped('dash') && p.dashCd <= 0 && (p.grounded || p.airDash > 0) && canCancel(p)) { startDash(p, ix || p.face, 0, D); if (!p.grounded) p.airDash--; }
  let wx = 0;
  const lv = G.lv;
  if (lv.wind && lv.wind.ph === 'gust' && (flagsAtPx(p.x, p.y - 6) & TF.WIND)) wx = lv.wind.dir * 40;
  if (p.dashT > 0) {
    p.dashT -= dt; p.vx = p.dashDx * D.v; p.vy = 0; addGhost(p);
    if (p.dashT <= 0) p.vx *= 0.4;
  } else {
    const slow = p.atk && p.grounded && p.atk.f < p.atk.d.su + p.atk.d.ac ? 0.35 : 1;
    const target = ix * L.run * slow;
    const acc = p.grounded ? (ix ? L.acc : L.dec) : L.air;
    if (p.lock <= 0) p.vx = approach(p.vx, target, acc * dt); else p.vx = approach(p.vx, 0, 250 * dt);
    if (ix && !p.atk && p.lock <= 0) p.face = ix;
    const g = (p.vy < 0 && held('jump') && ctrl) ? L.gUp : L.g;
    p.vy = Math.min(p.vy + g * dt, L.maxFall);
    if (ctrl && p.jumpBuf > 0) {
      if (held('down') && p.grounded && standingOnOneway(p)) { p.dropT = 0.22; p.jumpBuf = 0; p.grounded = false; p.ride = null; p.y += 2; }
      else if (p.grounded || p.coyote > 0) { p.vy = L.jump; p.jumpBuf = 0; p.coyote = 0; p.grounded = false; p.ride = null; sfx('jump'); }
    }
  }
  p.dropT -= dt;
  const r = moveBody(p, (p.vx + wx) * dt, p.vy * dt, { oneway: true, drop: p.dropT > 0, plats: true });
  if ((r.l || r.r) && p.dashT <= 0) p.vx = 0;
  if (r.u && p.vy < 0) p.vy = 0;
  const wasG = p.grounded;
  p.grounded = !!r.d;
  p.ride = r.plat || null;
  if (r.d) {
    if (r.df & TF.BOUNCE) { p.vy = PHYS.pillow; p.grounded = false; p.airDash = 1; sfx('bonk'); dust(p.x, p.y, 4); }
    else p.vy = 0;
  }
  if (p.grounded) { p.coyote = L.coyote; p.airDash = 1; if (!wasG) { sfx('land'); dust(p.x, p.y, 3); } }
  else p.coyote = Math.max(0, p.coyote - dt);
  p.moving = Math.abs(p.vx) > 10;
  p.safeT -= dt;
  if (p.grounded && !p.ride && p.safeT <= 0) {
    const bb = { x: p.x - 16, y: p.y - 16, w: 32, h: 20 };
    const sx = Math.floor(p.x / TS), sy = Math.floor((p.y + 2) / TS);
    if (!hazardBoxes(bb).length && (flagsAt(sx, sy) & 3)) { p.safe = { x: p.x, y: p.y }; p.safeT = PHYS.safeT; }
  }
  const hz = hazardBoxes(boxOf(p));
  if (hz.length) { hurtPlayer(p.x, p.y + 8); if (!p.dead) { p.vy = -240; p.grounded = false; } }
  if (p.y > lv.h * TS + 24) pitFall(p);
}
function updWater(p, dt, ix, iy, ctrl) {
  const Wt = PHYS.water, D = PHYS.dash.water;
  if (ctrl && tapped('dash') && p.dashCd <= 0 && canCancel(p)) startDash(p, ix, iy, D);
  if (p.dashT > 0) { p.dashT -= dt; p.vx = p.dashDx * D.v; p.vy = p.dashDy * D.v; addGhost(p); if (p.dashT <= 0) { p.vx *= 0.5; p.vy *= 0.5; } }
  else {
    let ax = ix, ay = iy; const m = Math.hypot(ax, ay); if (m > 0) { ax /= m; ay /= m; }
    if (p.lock > 0) { ax = 0; ay = 0; }
    p.vx += ax * Wt.acc * dt; p.vy += ay * Wt.acc * dt;
    const k = 1 - Wt.drag * dt; p.vx *= k; p.vy *= k;
    if (ay === 0 && p.vy < Wt.sinkMax) p.vy = Math.min(p.vy + Wt.sink * dt, Wt.sinkMax);
    const sp = Math.hypot(p.vx, p.vy);
    if (sp > Wt.max && p.lock <= 0) { const f = approach(sp, Wt.max, 600 * dt) / sp; p.vx *= f; p.vy *= f; }
    if (ix && !p.atk && p.lock <= 0) p.face = ix;
    if (m > 0 && Math.random() < dt * 3) sfx('swim');
  }
  const cv = CUR_V[tileAtPx(p.x, p.y - p.h / 2)] || [0, 0];
  const r = moveBody(p, (p.vx + cv[0]) * dt, (p.vy + cv[1]) * dt, {});
  if (r.u) {
    if (tileAtPx(p.x, p.y - p.h - 2) === '~') { if (p.vy < -10) { sfx('bonk'); bubbleP(p.x, p.y - p.h, 3); } p.vy = Wt.bonk; }
    else if (p.vy < 0) p.vy = 0;
  }
  if (r.d && p.vy > 0) p.vy = 0;
  if ((r.l || r.r) && p.dashT <= 0) p.vx = 0;
  const sp = Math.hypot(p.vx, p.vy);
  let tt = 0;
  if (sp > 25 && !p.atk) { const a = Math.atan2(p.vy, Math.abs(p.vx)); tt = clamp(Math.round(a / 0.4), -2, 2); }
  p.tilt = tt;
  p.moving = sp > 15;
  p.bubT -= dt; if (p.bubT <= 0) { p.bubT = 0.3; bubbleP(p.x + p.face * 5, p.y - 16, 1); }
  const hz = hazardBoxes(boxOf(p));
  if (hz.length) { const h0 = hz[0]; hurtPlayer(h0.x + h0.w / 2, h0.y + h0.h / 2); }
}
function pitFall(p) {
  if (!G.god) p.hp -= 1;
  sfx('hurt'); G.redFlash = 0.25; shake(3, 0.15);
  p.x = p.safe.x; p.y = p.safe.y; p.vx = 0; p.vy = 0; p.inv = PHYS.hurt.inv; p.atk = null; p.dashT = 0;
  if (p.hp <= 0) killPlayer(); else floatText(pick(LINES.bark_hurt), p.x, p.y - 26, PAL.warn);
}
function tryAttack(p) {
  if (p.atkBuf <= 0 || p.dashT > 0 || p.lock > 0) return;
  if (p.mode === 'td' && talkCheck(p)) { p.atkBuf = 0; p.atk = null; return; }
  if (p.atk && p.atk.f < p.atk.d.su + p.atk.d.ac) return;
  let k;
  if (p.mode === 'td') k = 'swat';
  else if (held('up')) k = 'up';
  else if (held('down') && (p.mode === 'water' || !p.grounded)) k = 'down';
  else if (p.mode === 'land' && !p.grounded) k = 'air';
  else {
    const chain = (p.atk && (p.atk.k === 's1' || p.atk.k === 's2')) || (p.comboT > 0 && p.comboN > 0);
    k = chain ? (p.comboN === 1 ? 's2' : p.comboN === 2 ? 's3' : 's1') : 's1';
  }
  p.atkBuf = 0;
  p.atk = { k, d: ATK[k], f: 0, id: ++G.swingId, hit: false, pogo: false };
  p.comboN = k === 's1' ? 1 : k === 's2' ? 2 : 0;
  p.comboT = 0;
}
function atkBox(p, a) {
  const d = a.d;
  if (p.mode === 'td') {
    if (p.tdDir === 'd') return { x: p.x - 8, y: p.y - 4, w: 16, h: 14 };
    if (p.tdDir === 'u') return { x: p.x - 8, y: p.y - 26, w: 16, h: 14 };
    return { x: p.face > 0 ? p.x + 2 : p.x - 18, y: p.y - 14, w: 16, h: 14 };
  }
  if (a.k === 'up') return { x: p.x - d.w / 2, y: p.y - p.h - d.h + 4, w: d.w, h: d.h };
  if (a.k === 'down') return { x: p.x - d.w / 2, y: p.y - 4, w: d.w, h: d.h };
  const cy = p.y - p.h / 2;
  return { x: p.face > 0 ? p.x + 2 : p.x - 2 - d.w, y: cy - d.h / 2, w: d.w, h: d.h };
}
function stepAttack(p) {
  const a = p.atk; if (!a) return;
  const d = a.d;
  if (a.f === d.su) { sfx(d.snd); p.slash = { k: a.k, t: 0, x: p.x, y: p.y, face: p.face, mode: p.mode, dir: p.tdDir }; }
  if (a.f >= d.su && a.f < d.su + d.ac) doHits(p, a, atkBox(p, a));
  a.f++;
  if (a.f >= d.su + d.ac + d.re) { p.atk = null; p.comboT = (a.k === 's1' || a.k === 's2') ? PHYS.combo : 0; if (a.k !== 's1' && a.k !== 's2') p.comboN = 0; }
}
function doHits(p, a, box) {
  let con = false;
  for (const e of G.ents) {
    if (e.dead || e.dying) continue;
    const T = TYPES[e.type];
    if (T.bladeHit) { if (e.hitBy !== a.id && T.bladeHit(e, box, a, p)) { con = true; } continue; }
    if (!(T.enemy || T.boss) || e.hitBy === a.id) continue;
    const hb = T.hurt ? T.hurt(e) : boxOf(e);
    if (!hb || !overlap(box, hb)) continue;
    e.hitBy = a.id;
    const r = damageEnemy(e, a.d.dmg, p.x < e.x ? 1 : -1, a.k === 's3' ? 'fin' : 'blade');
    if (r !== 'none') { con = true; sparkle((box.x + box.w / 2 + hb.x + hb.w / 2) / 2, (box.y + box.h / 2 + hb.y + hb.h / 2) / 2, 6, '#ffffff'); }
  }
  if (a.k === 'down' && p.mode === 'land' && !a.pogo && (con || hazardBoxes(box).length)) { a.pogo = true; p.vy = PHYS.pogo; p.airDash = 1; p.grounded = false; }
  if (con && !a.hit) { a.hit = true; if (p.mode === 'water') { const dx = a.k === 'up' ? 0 : a.k === 'down' ? 0 : -p.face, dy = a.k === 'up' ? 1 : a.k === 'down' ? -1 : 0; p.vx += dx * 30; p.vy += dy * 30; } }
}
function damageEnemy(e, dmg, dir, src) {
  const T = TYPES[e.type];
  if (T.canHit && !T.canHit(e, src)) return 'none';
  if (T.deflect && T.deflect(e, src)) {
    sfx(e.boss ? 'bonk' : 'tink'); sparkle(e.x, e.y - e.h / 2, 5, '#ffffff');
    if (src === 'blade' || src === 'fin') { const p = G.p; const d = p.x < e.x ? -1 : 1; p.vx = d * 160; if (p.mode === 'water') p.vy = (p.y < e.y - e.h / 2 ? -1 : 1) * 60; }
    return 'tink';
  }
  const mul = T.dmgMul ? T.dmgMul(e) : 1;
  e.hp -= dmg * mul; e.flash = 0.08;
  if (e.boss) { sfx('hitBoss'); if (e.hp > 0) hitstop(6); if (G.bossHud) G.bossHud.flash = 0.1; }
  else { sfx('hit'); hitstop(src === 'fin' ? 5 : 3); if (!T.noKb) e.kbx = dir * (src === 'fin' ? 170 : 80); }
  if (T.onHit) T.onHit(e, dmg, dir, src);
  if (e.hp <= 0 && !e.boss) killEnemy(e);
  return 'hit';
}
function killEnemy(e) {
  const T = TYPES[e.type];
  e.dying = 0.3; e.contact = false; e.atkBox = null; e.ring = null;
  sfx('enemyDie'); puff(e.x, e.y - e.h / 2, rndi(6, 8), '#f0e8e0');
  if (T.onDeath) T.onDeath(e);
  const dr = T.drops;
  if (dr && dr.heart && Math.random() < dr.heart) spawn('heart', e.x, e.y - e.h / 2, { vy: G.lv.water ? 0 : -120 });
}
function hurtPlayer(sx, sy) {
  const p = G.p;
  if (!p || p.dead || p.inv > 0 || p.dashInv > 0 || G.god || G.script || G.fadeState) return false;
  if (bossLock()) return false;
  p.hp -= 1; p.inv = PHYS.hurt.inv; p.hurtT = 0.2; p.lock = PHYS.hurt.lock; p.flash = 0.1;
  if (sx === undefined) { sx = p.x - p.face; sy = p.y - 6; }
  if (p.mode === 'water') { let dx = p.x - sx, dy = p.y - 6 - sy; const m = Math.hypot(dx, dy) || 1; p.vx = dx / m * PHYS.hurt.kb; p.vy = dy / m * PHYS.hurt.kb; }
  else { const d = p.x < sx ? -1 : 1; p.vx = d * PHYS.hurt.kb; if (p.mode === 'land') { p.vy = PHYS.hurt.kbUp; p.grounded = false; p.ride = null; } }
  p.atk = null; p.dashT = 0;
  hitstop(PHYS.hurt.freeze); shake(3, 0.15); G.redFlash = 0.3; sfx('hurt');
  if (p.hp <= 0) killPlayer();
  else floatText(pick(LINES.bark_hurt), p.x, p.y - 26, PAL.warn);
  return true;
}
function killPlayer() {
  const p = G.p; p.hp = 0; p.dead = true; p.deadT = 0; p.atk = null; p.dashT = 0; p.vx = 0;
  G.death = { t: 0, quip: pick(LINES.quips) };
  G.lock = G.lock;
}
function respawn() {
  G.st.deaths++;
  const id = G.areaId, cp = G.cp;
  G.death = null;
  gotoArea(id, { cp, retry: true });
}

function makeKylo(p) { return { type: 'kylo', x: p.x - 18, y: p.y - 16, face: 1, cd: 1.2, charge: 0, quipT: rnd(8, 15), anim: 0, target: null, tdDir: 's', moving: false }; }
function kyloTargets() {
  const out = [];
  for (const e of G.ents) {
    if (e.dead || e.dying) continue;
    const T = TYPES[e.type]; if (!(T.enemy || T.boss)) continue;
    if (T.targetable && !T.targetable(e)) continue;
    const tp = T.aim ? T.aim(e) : { x: e.x, y: e.y - e.h / 2 };
    out.push({ e, x: tp.x, y: tp.y });
  }
  return out;
}
function updKylo(k, dt) {
  const p = G.p; if (!p) return;
  k.anim += dt;
  if (G.lv.td) {
    const tr = p.trail[Math.max(0, p.trail.length - 13)] || [p.x, p.y, 'd', 1, false];
    k.x = tr[0] - (tr[2] === 's' ? tr[3] * 4 : 0); k.y = tr[1] - (tr[2] === 'd' ? 2 : 0); k.tdDir = tr[2]; k.face = tr[3]; k.moving = tr[4];
    return;
  }
  const tx = p.x - KYLO_CFG.ox * p.face, ty = p.y - KYLO_CFG.oy + Math.sin(k.anim * 3) * 2;
  if (dist(k.x, k.y, tx, ty) > KYLO_CFG.tele) { puff(k.x, k.y - 6, 5, '#c0a0ff'); k.x = tx; k.y = ty; puff(k.x, k.y - 6, 5, '#c0a0ff'); }
  k.x = damp(k.x, tx, KYLO_CFG.lerp, dt); k.y = damp(k.y, ty, KYLO_CFG.lerp, dt);
  k.face = p.face;
  if (G.script || bossLock()) { k.charge = 0; return; }
  k.quipT -= dt;
  if (k.quipT <= 0) { k.quipT = rnd(8, 15); floatText(pick(LINES.kylo_quips), k.x, k.y - 20, '#c8b8ff', 1, 1.8); }
  if (k.charge > 0) {
    k.charge -= dt;
    if (Math.random() < 0.6) part({ x: k.x + k.face * 6 + rnd(-6, 6), y: k.y - 14 + rnd(-6, 6), vx: 0, vy: 0, life: 0.2, col: pick(['#f0e070', '#c0a0ff', '#ffffff']), k: 'spark', sz: 1, home: 1, hx: k.x + k.face * 6, hy: k.y - 14 });
    if (k.charge <= 0) {
      const t = k.target;
      if (t && !t.dead && !t.dying) {
        const T = TYPES[t.type], tp = T.aim ? T.aim(t) : { x: t.x, y: t.y - t.h / 2 };
        const a = Math.atan2(tp.y - (k.y - 12), tp.x - (k.x + k.face * 6));
        spawn('bolt', k.x + k.face * 6, k.y - 8, { vx: Math.cos(a) * KYLO_CFG.speed, vy: Math.sin(a) * KYLO_CFG.speed, tgt: t });
        sfx('sparkle');
      }
    }
    return;
  }
  k.cd -= dt;
  if (k.cd <= 0) {
    let best = null, bd = KYLO_CFG.range;
    for (const c of kyloTargets()) { if (!onScreen(c.x, c.y, -4)) continue; const d = dist(k.x, k.y, c.x, c.y); if (d < bd) { bd = d; best = c.e; } }
    if (best) { k.target = best; k.charge = KYLO_CFG.charge; k.cd = G.lv.view === 'boss' ? KYLO_CFG.cdBoss : KYLO_CFG.cd; }
    else k.cd = 0.2;
  }
}

function startRoom(r) {
  const lv = G.lv;
  r.state = 'fight'; r.t = 0; r.wi = 0; r.gap = 0.35; r.pending = true;
  G.lock = { x: r.x * TS, y: r.y * TS };
  r.sealed = [];
  for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) {
    if (x !== r.x && x !== r.x + r.w - 1 && y !== r.y && y !== r.y + r.h - 1) continue;
    if (x < 0 || y < 0 || x >= lv.w || y >= lv.h) continue;
    if (!solidT(x, y)) { lv.dyn[y * lv.w + x] = 1; r.sealed.push(y * lv.w + x); }
  }
  lv.sealT = 0; lv.sealKind = lv.water ? 'bubble' : 'bars';
  sfx('seal'); unstick(G.p);
}
function spawnWave(r) {
  r.ents = [];
  for (const [ch, rx, ry] of r.waves[r.wi]) {
    const type = ENEMY_CH[ch], x = (r.x + rx) * TS + 8, y = (r.y + ry) * TS + 16;
    puff(x, y - 8, 6, G.lv.water ? '#d8f4ff' : '#e8e0d0');
    const e = spawn(type, x, y, { room: r, spawnT: 0.3 });
    if (e) r.ents.push(e);
  }
}
function endRoom(r) {
  const lv = G.lv;
  r.state = 'done';
  for (const i of r.sealed) { lv.dyn[i] = 0; const x = (i % lv.w) * TS + 8, y = Math.floor(i / lv.w) * TS + 8; if (lv.water) bubbleP(x, y, 3); else puff(x, y, 2, '#8a8a9a'); }
  r.sealed = [];
  G.lock = null; sfx('jingle');
}
function updRooms(dt) {
  const lv = G.lv, p = G.p; if (!p) return;
  if (lv.sealT !== undefined) lv.sealT += dt;
  for (const r of lv.rooms) {
    if (r.state === 'idle') {
      if (p.dead) continue;
      const b = boxOf(p), R = { x: (r.x + 1) * TS, y: (r.y + 1) * TS, w: (r.w - 2) * TS, h: (r.h - 2) * TS };
      if (b.x >= R.x && b.x + b.w <= R.x + R.w && b.y >= R.y && b.y + b.h <= R.y + R.h) startRoom(r);
    } else if (r.state === 'fight') {
      r.t += dt;
      if (r.pending) { r.gap -= dt; if (r.gap <= 0) { r.pending = false; spawnWave(r); } continue; }
      if (r.ents.every(e => e.dead)) {
        if (r.wi < r.waves.length - 1) { r.wi++; r.pending = true; r.gap = 0.6; }
        else endRoom(r);
      }
    }
  }
}
function winRoom() {
  for (const r of G.lv.rooms) if (r.state === 'fight') { for (const e of G.ents) if (e.room === r && !e.dead) { e.dead = true; } r.wi = r.waves.length - 1; r.pending = false; r.ents = []; endRoom(r); return true; }
  return false;
}

function updTriggers() {
  const lv = G.lv, p = G.p; if (!p || p.dead || G.script) return;
  const b = boxOf(p);
  for (const tg of lv.trig) {
    if (tg.once && lv.fired[tg.id]) continue;
    if (tg.cd > 0) continue;
    const R = { x: tg.x * TS, y: tg.y * TS, w: tg.w * TS, h: tg.h * TS };
    if (overlap(b, R)) { if (tg.once) lv.fired[tg.id] = 1; if (SCRIPTS['trig_' + tg.id]) SCRIPTS['trig_' + tg.id](tg); }
  }
}
function updExits() {
  const lv = G.lv, p = G.p; if (!p || p.dead || lv.exiting || G.script) return;
  const b = boxOf(p);
  for (const x of lv.exits) if (overlap(b, x)) { lv.exiting = true; G.hp = p.hp; nextArea(); return; }
}
function updAmbient(dt) {
  const lv = G.lv;
  lv.lt += dt;
  if (!lv.td) {
    lv.curT -= dt;
    if (lv.curT <= 0) {
      lv.curT = 0.05;
      const x0 = Math.max(0, Math.floor(G.cam.x / TS)), y0 = Math.max(0, Math.floor(G.cam.y / TS));
      for (let i = 0; i < 3; i++) {
        const tx = x0 + rndi(0, 24), ty = y0 + rndi(0, 18);
        const cv = CUR_V[tileAt(tx, ty)];
        if (cv) part({ x: tx * TS + rnd(0, 16), y: ty * TS + rnd(0, 16), vx: cv[0] * 1.6, vy: cv[1] * 1.6, life: 0.5, col: 'rgba(230,250,255,0.7)', k: 'streak', sz: 1 });
      }
    }
  }
  if (lv.wind) {
    const w = lv.wind; w.t += dt;
    if (w.ph === 'calm' && w.t > 1.9) { w.ph = 'warn'; w.t = 0; w.dir = Math.random() < 0.5 ? -1 : 1; }
    else if (w.ph === 'warn' && w.t > 0.6) { w.ph = 'gust'; w.t = 0; sfx('wind'); }
    else if (w.ph === 'gust' && w.t > 1.5) { w.ph = 'calm'; w.t = 0; }
    if (w.ph !== 'calm' && Math.random() < (w.ph === 'warn' ? 0.5 : 1)) {
      const y = G.cam.y + rnd(0, H), x = w.dir > 0 ? G.cam.x - 8 : G.cam.x + W + 8;
      if (flagsAtPx(clamp(G.cam.x + W / 2, 0, lv.w * TS - 1), y) & TF.WIND) part({ x, y, vx: w.dir * rnd(260, 360), vy: 0, life: 1.4, col: 'rgba(255,255,255,0.8)', k: 'streak', sz: 1, len: w.ph === 'warn' ? 6 : 14 });
    }
  }
  if (lv.A.rumble) {
    lv.rumbleT -= dt;
    if (lv.rumbleT <= 0) { lv.rumbleT = rnd(8, 12); sfx('grumble'); shake(2, 0.4); if (G.p) floatText('GRRRMMBL', G.cam.x + W / 2 + rnd(-80, 80), G.cam.y + H - 30, '#6a8a9a', 1, 1.5); }
  }
}

function worldStep(dt) {
  const lv = G.lv;
  for (const pl of lv.plats) { const T = TYPES[pl.type]; if (T.update) T.update(pl, dt); }
  if (G.p) updatePlayer(G.p, dt);
  if (G.ky) updKylo(G.ky, dt);
  const n = G.ents.length;
  for (let i = 0; i < n; i++) {
    const e = G.ents[i];
    if (e.dead || e.plat) continue;
    const T = TYPES[e.type];
    if (e.flash > 0) e.flash -= dt;
    if (e.dying > 0) { e.dying -= dt; if (e.dying <= 0) { e.dead = true; puff(e.x, e.y - e.h / 2, 4, '#f0e8e0'); } continue; }
    if (T.enemy && !e.room && !nearCam(e)) continue;
    if (e.spawnT > 0) { e.spawnT -= dt; continue; }
    e.t += dt; e.anim += dt;
    if (T.update) T.update(e, dt);
    if (e.kbx) { moveBody(e, e.kbx * dt, 0, { solids: false }); e.kbx = approach(e.kbx, 0, 700 * dt); }
    if ((T.enemy || T.hostile || T.boss) && G.p && !G.p.dead) touchPlayer(e);
  }
  G.ents = G.ents.filter(e => !e.dead || e.keep);
  if (lv.boss) bossFrameworkUpdate(dt);
  updRooms(dt);
  updTriggers();
  updExits();
  updAmbient(dt);
}
function touchPlayer(e) {
  const p = G.p, pb = boxOf(p);
  const T = TYPES[e.type];
  if (e.contact) { const hb = T.hurt ? T.hurt(e) : boxOf(e); if (hb && overlap(pb, hb)) { hurtPlayer(e.x, e.y - e.h / 2); return; } }
  if (e.atkBox && overlap(pb, e.atkBox)) { hurtPlayer(e.atkBox.x + e.atkBox.w / 2, e.atkBox.y + e.atkBox.h / 2); return; }
  if (e.ring && ringRect(e.ring.x, e.ring.y, e.ring.r0, e.ring.r1, pb)) { if (e.ring.push) { const dx = p.x - e.ring.x, dy = p.y - 6 - e.ring.y, m = Math.hypot(dx, dy) || 1; p.vx = dx / m * e.ring.push; p.vy = dy / m * e.ring.push; } else hurtPlayer(e.ring.x, e.ring.y); }
  if (T.touch) T.touch(e, p, pb);
}
function worldUpdate(dt) {
  if (!G.lv) return;
  G.st.time += dt;
  if (G.script) runScript(dt);
  if (!G.lv) return;
  if (G.slowT > 0) { G.slowT -= dt; if (G.slowT <= 0) G.slow = 1; }
  let run = true;
  if (G.freeze > 0) { G.freeze--; run = false; }
  else if (G.slow < 1) { G.slowAcc += G.slow; if (G.slowAcc >= 1) G.slowAcc -= 1; else run = false; }
  if (run) worldStep(dt);
  camUpdate(dt);
}
function worldDraw() {
  const lv = G.lv; if (!lv) return;
  const cx = Math.round(G.cam.x + G.sx), cy = Math.round(G.cam.y + G.sy);
  drawFar(lv, cx, cy);
  ctx.save(); ctx.translate(-cx, -cy);
  for (const ch of lv.chunks) if (ch.x < cx + W && ch.x + ch.c.width > cx && ch.y < cy + H && ch.y + ch.c.height > cy) ctx.drawImage(ch.c, ch.x, ch.y);
  drawDynTiles(lv, cx, cy);
  const list = [];
  for (const e of G.ents) if (!e.dead && TYPES[e.type].draw) list.push(e);
  if (lv.td) {
    if (G.p) list.push(G.p);
    if (G.ky) list.push(G.ky);
    list.sort((a, b) => ((a.under ? -1000 : 0) + (a.high ? 1000 : 0) + a.y) - ((b.under ? -1000 : 0) + (b.high ? 1000 : 0) + b.y));
    for (const e of list) drawEnt(e);
  } else {
    list.sort((a, b) => (TYPES[a.type].z || 0) - (TYPES[b.type].z || 0));
    for (const e of list) drawEnt(e);
    if (G.ky) drawKylo(G.ky);
    if (G.p) drawHalo(G.p);
  }
  for (const f of lv.fg) if (f.x < cx + W && f.x + f.c.width > cx && f.y < cy + H && f.y + f.c.height > cy) ctx.drawImage(f.c, f.x, f.y);
  ctx.restore();
  drawOverlayTint(lv, cx, cy);
  ctx.save(); ctx.translate(-cx, -cy);
  for (const e of list) { if (e === G.p || e === G.ky) continue; const T = TYPES[e.type]; if (T.drawTop && !e.dying) T.drawTop(e); }
  if (G.p) drawHaloTop(G.p);
  if (lv.boss) drawBossTop(lv.boss);
  drawParts();
  if (G.boxes) drawDebugBoxes();
  ctx.restore();
}
function drawEnt(e) {
  if (e === G.p) return drawHalo(e);
  if (e === G.ky) return drawKylo(e);
  const T = TYPES[e.type];
  if (e.dying > 0) { drawDying(e); return; }
  if (e.spawnT > 0 && Math.floor(e.spawnT * 20) % 2) return;
  T.draw(e);
}
