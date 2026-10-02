
function play(steps, onEnd) { G.script = { steps, i: 0, t: 0, begun: false, onEnd }; G.skipT = 0; }
function actorOf(r) { return typeof r === 'function' ? r() : r; }
function beginStep(st, S) {
  const k = st[0];
  if (k === 'say') sayLines(st[1]);
  else if (k === 'do') st[1]();
  else if (k === 'item') showItem(st[1]);
  else if (k === 'goto') gotoArea(st[1], st[2]);
  else if (k === 'next') nextArea();
  else if (k === 'music') music(st[1]);
  else if (k === 'sfx') sfx(st[1]);
  else if (k === 'shake') shake(st[1], st[2]);
  else if (k === 'cam') G.camTarget = st[1] === null ? null : { x: st[1], y: st[2], k: st[3] || 3 };
  else if (k === 'move') { const a = actorOf(st[1]); if (a) a.mv = { x: st[2], y: st[3], s: st[4] || 80 }; }
  else if (k === 'walk') { const p = G.p; if (p) { if (p.mode === 'td') p.walkTo = { x: st[2], y: st[3], s: st[4] || 70 }; else p.autoX = st[2]; } }
}
function stepDone(st, S) {
  const k = st[0];
  if (k === 'say') return !G.dlg;
  if (k === 'wait') return S.t >= st[1];
  if (k === 'until') return st[1]() || S.t > 8;
  if (k === 'item') { if (S.t >= 2.2 || (S.t > 0.6 && (tapped('attack') || tapped('confirm')))) { G.item = null; eat('attack'); eat('confirm'); return true; } return false; }
  if (k === 'goto' || k === 'next') return false;
  if (k === 'move') { const a = actorOf(st[1]); return !a || !a.mv || a.dead || S.t > 8; }
  if (k === 'walk') { const p = G.p; return !p || S.t > 6 || (p.mode === 'td' ? !p.walkTo : (p.autoX === null || p.autoX === undefined)); }
  if (k === 'fadeout') { G.fade = Math.min(1, S.t / 0.3); return S.t >= 0.3; }
  if (k === 'fadein') { G.fade = Math.max(0, 1 - S.t / 0.3); return S.t >= 0.3; }
  return true;
}
function endScript(S) { if (G.script === S) G.script = null; G.skipT = 0; if (S.onEnd) S.onEnd(); }
function runScript(dt) {
  const S = G.script; if (!S) return;
  S.t += dt;
  for (let guard = 0; guard < 80; guard++) {
    if (G.script !== S) return;
    if (S.i >= S.steps.length) { endScript(S); return; }
    const st = S.steps[S.i];
    if (!S.begun) { S.begun = true; S.t = 0; beginStep(st, S); if (G.script !== S) return; }
    if (!stepDone(st, S)) return;
    S.i++; S.begun = false;
  }
}
function finishInstant(st) {
  if (st[0] === 'move') { const a = actorOf(st[1]); if (a && a.mv) { a.x = a.mv.x; a.y = a.mv.y; a.mv = null; a.moving = false; } }
  else if (st[0] === 'walk' && G.p) { const p = G.p; if (p.mode === 'td') { p.x = st[2]; p.y = st[3]; p.walkTo = null; } else { p.x = st[2]; p.autoX = null; p.vx = 0; } }
}
function skipScript() {
  const S = G.script; if (!S) return;
  G.dlg = null; G.item = null;
  if (S.begun) finishInstant(S.steps[S.i]);
  for (let i = S.begun ? S.i + 1 : S.i; i < S.steps.length; i++) {
    const st = S.steps[i], k = st[0];
    if (k === 'do') st[1]();
    else if (k === 'move' || k === 'walk') { beginStep(st, S); finishInstant(st); }
    else if (k === 'music') music(st[1]);
    else if (k === 'goto' || k === 'next') { G.script = null; G.dlg = null; G.item = null; G.fade = 0; G.camTarget = null; beginStep(st, S); return; }
    if (G.script !== S) return;
  }
  G.dlg = null; G.item = null; G.camTarget = null; G.fade = 0;
  endScript(S);
}
function updSkip(dt) {
  if (G.script && keys.Enter) { G.skipT = (G.skipT || 0) + dt; if (G.skipT >= 0.8) { G.skipT = 0; skipScript(); } }
  else G.skipT = 0;
}

function sayLines(id) {
  const L = typeof id === 'string' ? LINES[id] : id; if (!L || !L.length) return;
  G.dlg = { lines: L, i: 0, n: 0, acc: 0, hold: 0.1, ls: dlgLines(L[0][1]) };
}
function dlgLines(s) { return wrap(s, 300).slice(0, 2); }
function dlgLen(d) { let n = 0; for (const l of d.ls) n += l.length; return n; }
function updDialogue(dt) {
  const d = G.dlg; if (!d) return;
  d.hold -= dt;
  const spk = d.lines[d.i][0], len = dlgLen(d);
  if (d.n < len) {
    d.acc += dt * 45;
    while (d.acc >= 1 && d.n < len) { d.acc -= 1; d.n++; if (d.n % 2 === 0) sfx('talkBlip', (SPEAKERS[spk] || {}).pitch || 1); }
  }
  if (d.hold <= 0 && (tapped('attack') || tapped('confirm'))) {
    eat('attack'); eat('confirm');
    if (d.n < len) d.n = len;
    else {
      d.i++; d.n = 0; d.acc = 0; d.hold = 0.08;
      if (d.i >= d.lines.length) G.dlg = null; else d.ls = dlgLines(d.lines[d.i][1]);
    }
  }
}
function panel(x, y, w, h, fill) {
  ctx.fillStyle = PAL.uiLight; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = PAL.outline; ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  ctx.fillStyle = fill || PAL.uiDark; ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
}
function drawPortrait(name, cx, cy, box) {
  const c = SPR[name]; if (!c) return;
  const m = Math.max(c.width, c.height), s = m > box + 12 ? 1 / Math.ceil(m / (box + 8)) : 1;
  const w = Math.round(c.width * s), h = Math.round(c.height * s);
  ctx.drawImage(c, Math.round(cx - w / 2), Math.round(cy - h / 2), w, h);
}
function drawDialogue() {
  const d = G.dlg; if (!d) return;
  const spk = d.lines[d.i][0], S = SPEAKERS[spk] || { col: PAL.gold, spr: '' };
  const low = G.p && G.lv && !G.lv.td && G.p.y - G.cam.y > 190;
  const bx = 8, by = low ? 34 : 226, bw = 368, bh = 54;
  panel(bx, by, bw, bh);
  const nw = textWidth(spk) + 10;
  ctx.fillStyle = PAL.outline; ctx.fillRect(bx + 5, by - 10, nw + 2, 12);
  ctx.fillStyle = S.col; ctx.fillRect(bx + 6, by - 9, nw, 10);
  text(spk, bx + 11, by - 7, PAL.uiDark, 1, false);
  ctx.fillStyle = '#1c2438'; ctx.fillRect(bx + 8, by + 11, 32, 32);
  ctx.fillStyle = '#2a3450'; ctx.fillRect(bx + 8, by + 11, 32, 1);
  ctx.save(); ctx.beginPath(); ctx.rect(bx + 8, by + 11, 32, 32); ctx.clip();
  drawPortrait(S.spr, bx + 24, by + 27, 32);
  ctx.restore();
  let left = d.n;
  d.ls.forEach((l, i) => { const t = l.slice(0, Math.max(0, left)); left -= l.length; if (t) text(t, bx + 50, by + 15 + i * 13, PAL.uiLight, 1, false); });
  if (d.n >= dlgLen(d) && blink(3)) { ctx.fillStyle = PAL.gold; const x = bx + bw - 14, y = by + bh - 11; ctx.fillRect(x, y, 7, 1); ctx.fillRect(x + 1, y + 1, 5, 1); ctx.fillRect(x + 2, y + 2, 3, 1); ctx.fillRect(x + 3, y + 3, 1, 1); }
}

const ITEM_SPR = { item_knife: 'knife', item_helmet: 'fishbowl', item_kylo: 'wizhat', item_key: 'key' };
function showItem(id) { G.item = { id, t: 0 }; sfx('itemGet'); }
function drawItemBanner() {
  const it = G.item; if (!it) return;
  const L = LINES[it.id] || ['', ''];
  const w = Math.max(textWidth(L[0]) * 2, textWidth(L[1])) + 28, h = 58, x = Math.round((W - w) / 2), y = 64;
  const k = Math.min(1, it.t / 0.15);
  ctx.save(); ctx.globalAlpha = k;
  panel(x, y, w, h);
  const s = ITEM_SPR[it.id];
  if (s) { ctx.save(); ctx.translate(W / 2, y + 22 + Math.round(Math.sin(G.t * 4))); ctx.scale(2, 2); spr(s, 0, 0); ctx.restore(); }
  text(L[0], W / 2, y + 28, PAL.gold, 2, true, 'c');
  text(L[1], W / 2, y + 46, PAL.uiLight, 1, true, 'c');
  ctx.restore();
  if (it.t < 0.5) sparkleUI(W / 2, y + 12);
}
function sparkleUI(x, y) { ctx.fillStyle = '#fff8c0'; for (let i = 0; i < 6; i++) { const a = G.t * 6 + i * 1.05, r = 20 + (G.t * 40) % 14; ctx.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r * 0.5), 1, 1); } }

function talkTarget(p) {
  if (!p || !G.lv || !G.lv.td) return null;
  const fx = p.x + (p.tdDir === 's' ? p.face * 6 : 0), fy = p.y - 3 + (p.tdDir === 'd' ? 6 : p.tdDir === 'u' ? -8 : 0);
  let best = null, bd = 1e9;
  for (const e of G.ents) {
    if (!e.talkable || e.dead) continue;
    const d = dist(fx, fy, e.x, e.y - 4);
    if (d < 22 + (e.talkR || 0) && d < bd) { bd = d; best = e; }
  }
  return best;
}
function talkCheck(p) {
  const e = talkTarget(p); if (!e) return false;
  if (e.x < p.x - 4) applyFace(p, 'l'); else if (e.x > p.x + 4) applyFace(p, 'r'); else applyFace(p, e.y < p.y ? 'u' : 'd');
  p.vx = 0; p.vy = 0;
  doTalk(e);
  return true;
}
function doTalk(e) {
  if (e.type === 'sugar') return SCRIPTS.sugar_talk(e);
  if (e.type === 'npc') {
    if (e.gate && !G.flags.gateOpen) return SCRIPTS.gate_talk(e);
    if (e.gate) return sayLines('npc_gate2');
    return sayLines(e.line);
  }
  if (e.type === 'moth') return sayLines('moth');
  if (e.type === 'bowl') return sayLines('bowl_empty');
  if (e.talk) return sayLines(e.talk);
}
function openTiles(ch) { const lv = G.lv; if (!lv) return; for (let i = 0; i < lv.w * lv.h; i++) if (lv.t[i] === ch) lv.dyn[i] = 0; }

const SCRIPTS = {
  cat_enter(opts) {
    const p = G.p, bowls = G.ents.filter(e => e.type === 'bowl');
    for (const b of bowls) b.talkable = true;
    if (G.flags.introDone) {
      for (const b of bowls) b.full = false;
      if (G.flags.doorOpen && G.cp < 0) { p.x = 144; p.y = 244; applyFace(p, 'd'); camUpdate(0, true); }
      return;
    }
    p.x = 176; p.y = 176; applyFace(p, 'u'); camUpdate(0, true);
    let bella = null, kylo = null, raft = null;
    const sold = [];
    const allStill = () => sold.every(s => !s.mv);
    play([
      ['wait', 0.9],
      ['walk', 'p', 64, 100, 60], ['do', () => applyFace(p, 'u')],
      ['say', 'dinner_1'],
      ['do', () => { bella = spawn('actor', 250, 150, { spr: 'bella_walk', frames: 2, face: -1 }); kylo = spawn('actor', 262, 164, { spr: 'kylop_walk', frames: 2, face: -1 }); sfx('dash'); }],
      ['move', () => bella, 70, 98, 240],
      ['do', () => { p.walkTo = { x: 38, y: 122, s: 170 }; sfx('bonk'); puff(64, 96, 4); kylo.mv = { x: 94, y: 99, s: 240 }; }], ['wait', 0.55],
      ['do', () => { bella.spr = 'bella_idle'; kylo.spr = 'kylop_idle'; bella.face = -1; kylo.face = -1; applyFace(p, 'r'); }],
      ['say', 'dinner_2'],
      ['do', () => { bella.spr = 'bella_eat'; kylo.spr = 'kylop_eat'; sfx('crunch'); }], ['wait', 0.45],
      ['do', () => sfx('crunch')], ['wait', 0.45], ['do', () => sfx('crunch')], ['wait', 0.45],
      ['do', () => { for (const b of bowls) b.full = false; sfx('burp'); bella.spr = 'bella_happy'; bella.frames = 0; kylo.spr = 'kylop_happy'; kylo.frames = 0; floatText('*BURP*', 82, 76, PAL.uiLight); }], ['wait', 0.7],
      ['say', 'dinner_3'],
      ['do', () => { sfx('bark'); shake(1, 0.2); floatText('WOOF! WOOF!', 140, 190, PAL.warn); }], ['wait', 0.45], ['do', () => sfx('bark')], ['wait', 0.3],
      ['cam', 470, 420, 2.5], ['wait', 0.9],
      ['do', () => { raft = spawn('actor', 700, 472, { spr: 'raft', face: -1 }); raft.mv = { x: 566, y: 472, s: 100 }; }],
      ['until', () => raft && !raft.mv],
      ['do', () => { sfx('bark'); for (let i = 0; i < 3; i++) sold.push(spawn('actor', 540 + i * 12, 450 - i * 10, { spr: 'soldier_walk', frames: 2, face: -1 })); }], ['wait', 0.4],
      ['say', 'kidnap_1'],
      ['do', () => { G.flags.doorAjar = 1; sold.forEach((s, i) => { s.mv = { x: 490 + i * 6, y: 330, s: 190 }; }); }],
      ['cam', 300, 250, 2.5], ['until', allStill],
      ['do', () => sold.forEach((s, i) => { s.mv = { x: 136 + i * 8, y: 236, s: 200 }; })], ['until', allStill],
      ['do', () => { sold[0].mv = { x: 72, y: 112, s: 180 }; sold[1].mv = { x: 96, y: 114, s: 180 }; sold[2].mv = { x: 116, y: 124, s: 180 }; }], ['cam', 150, 150, 3], ['until', allStill],
      ['do', () => { bella.carry = sold[0]; kylo.carry = sold[1]; bella.high = 1; kylo.high = 1; bella.spr = 'bella_yell'; kylo.spr = 'kylop_happy'; sfx('yip'); }], ['wait', 0.3],
      ['say', 'kidnap_2'],
      ['do', () => sold.forEach((s, i) => { s.mv = { x: 136 + i * 8, y: 240, s: 200 }; })], ['until', allStill],
      ['do', () => { G.flags.doorAjar = 0; sold.forEach((s, i) => { s.mv = { x: 490 + i * 6, y: 330, s: 200 }; }); }], ['cam', 360, 300, 2.5], ['until', allStill],
      ['do', () => sold.forEach((s, i) => { s.mv = { x: 540 + i * 12, y: 450 - i * 10, s: 200 }; })], ['cam', 470, 420, 2.5], ['until', allStill],
      ['do', () => { sold.forEach(s => { s.dead = true; }); bella.dead = true; kylo.dead = true; raft.riders = ['soldier_walk_0', 'bella_yell', 'soldier_walk_1', 'kylop_happy', 'soldier_walk_0']; raft.mv = { x: 740, y: 520, s: 55 }; raft.shrink = 1; sfx('splash'); }],
      ['wait', 2.4],
      ['cam', null], ['wait', 0.8],
      ['say', 'kidnap_3'],
      ['do', () => { if (raft) raft.dead = true; G.flags.doorAjar = 0; G.flags.introDone = true; for (const b of bowls) b.full = false; writeSave(); }]
    ]);
  },
  water_enter(opts) {
    if (opts.retry || !G.p) return;
    floatText(LINES.bark_water, G.p.x, G.p.y - 30, PAL.gold, 1, 2.2);
  },
  town_enter(opts) {
    if (G.flags.townArrived || opts.retry) return;
    play([['wait', 0.6], ['say', 'town_arrive'], ['do', () => { G.flags.townArrived = true; }]]);
  },
  trig_dock() {
    const p = G.p;
    play([
      ['do', () => { applyFace(p, 'd'); p.vx = 0; p.vy = 0; }], ['wait', 0.3],
      ['do', () => { p.helmet = true; sfx('pop'); sparkle(p.x, p.y - 14, 8, '#d8f4ff'); }], ['wait', 0.5],
      ['say', 'dock'],
      ['do', () => { p.hide = true; sfx('splash'); for (let i = 0; i < 14; i++) part({ x: p.x + rnd(-8, 8), y: p.y + 4, vx: rnd(-60, 60), vy: rnd(-170, -60), g: 420, life: 0.7, col: '#d8f4ff', k: 'dot', sz: 2 }); }],
      ['wait', 0.8],
      ['next']
    ]);
  },
  trig_plum() {
    let ch = null;
    play([
      ['do', () => { ch = spawn('actor', 236, 1650, { spr: 'ch_idle', frames: 2, face: -1 }); bubbleP(236, 1650, 6); }],
      ['move', () => ch, 188, 1664, 70],
      ['do', () => { ch.spr = 'ch_sad'; ch.frames = 0; }], ['wait', 0.4],
      ['say', 'plum'],
      ['do', () => { ch.spr = 'ch_idle'; ch.frames = 2; ch.face = -1; }]
    ]);
  },
  trig_gate_exit() {
    const lv = G.lv;
    if (!G.flags.gateOpen || lv.exiting) return;
    lv.exiting = true; G.hp = G.p.hp; nextArea();
  },
  sugar_talk(e) {
    const p = G.p;
    if (G.st.hasWeapon && G.flags.doorOpen) {
      const i = (G.flags.sugarIdx || 0) % 3; G.flags.sugarIdx = i + 1;
      if (i < 2) e.awakeT = 1.6;
      sayLines('sugar_idle_' + i);
      return;
    }
    let it = null;
    play([
      ['do', () => { e.awakeT = 99; sfx('wake'); }], ['wait', 0.3],
      ['say', 'sugar_gift_1'],
      ['do', () => { it = spawn('actor', p.x, p.y - 22, { spr: 'knife', high: 1, vy: -8 }); sfx('jingle'); sparkle(p.x, p.y - 26, 10, PAL.gold); }], ['wait', 0.7],
      ['do', () => { G.st.hasWeapon = true; }], ['item', 'item_knife'], ['do', () => { if (it) it.dead = true; }],
      ['say', 'sugar_gift_2'],
      ['do', () => { it = spawn('actor', p.x, p.y - 20, { spr: 'fishbowl', high: 1, vy: -8 }); sfx('jingle'); sparkle(p.x, p.y - 26, 10, '#d8f4ff'); }], ['wait', 0.7],
      ['do', () => { G.st.hasHelmet = true; }], ['item', 'item_helmet'], ['do', () => { if (it) it.dead = true; }],
      ['say', 'sugar_gift_3'],
      ['do', () => { e.awakeT = 0; G.flags.doorOpen = true; openTiles('+'); sfx('gateOpen'); writeSave(); }]
    ]);
  },
  gate_talk(e) {
    play([
      ['say', 'npc_gate'],
      ['do', () => { G.flags.gateOpen = true; openTiles('G'); sfx('gateOpen'); shake(2, 0.5); writeSave(); }],
      ['cam', 24 * 16, 5 * 16, 3], ['wait', 1.4], ['cam', null], ['wait', 0.3]
    ]);
  }
};

function resetRun() {
  G.st = { hasWeapon: false, hasHelmet: false, hasKylo: false, bossesBeaten: [], kibble: 0, deaths: 0, time: 0, got: new Set() };
  G.flags = {}; G.cp = -1; G.hp = PHYS.hp; G.god = false;
}
function newGame() { resetRun(); gotoArea('cat_country', { fresh: true }); }
function continueGame(s) {
  resetRun();
  G.st.hasWeapon = !!s.hasWeapon; G.st.hasHelmet = !!s.hasHelmet; G.st.hasKylo = !!s.hasKylo;
  G.st.bossesBeaten = Array.isArray(s.bossesBeaten) ? s.bossesBeaten.slice() : [];
  G.st.kibble = s.kibble | 0; G.st.deaths = s.deaths | 0; G.st.time = +s.time || 0;
  G.st.got = new Set(Array.isArray(s.got) ? s.got : []);
  G.flags = Object.assign({}, s.flags && typeof s.flags === 'object' ? s.flags : {});
  const id = AREAS[s.area] && s.area !== 'title' && s.area !== 'end' ? s.area : 'cat_country';
  gotoArea(id, { cp: typeof s.checkpoint === 'number' ? s.checkpoint : -1, fresh: true });
}
const JUMP_KEYS = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'];
const JUMP_A = ['cat_country', 'shallows', 'boss_babyboo', 'reef', 'boss_rover', 'boss_cherry', 'trench', 'boss_chicken', 'dog_town', 'castle_1'];
const JUMP_B = ['boss_polly', 'castle_2', 'boss_lola', 'boss_dozer', 'ending', 'end'];
function debugJump(id) {
  resetRun();
  const idx = ORDER.indexOf(id);
  G.st.hasWeapon = true; G.st.hasHelmet = true; G.st.hasKylo = idx > ORDER.indexOf('boss_chicken');
  G.flags.doorOpen = true;
  if (idx > 0) G.flags.introDone = true;
  if (idx > ORDER.indexOf('dog_town')) { G.flags.gateOpen = true; G.flags.townArrived = true; }
  G.hp = PHYS.hp;
  sfx('menuSelect');
  gotoArea(id, { fresh: true });
}
function titleDebugKeys() {
  const sh = keys.ShiftLeft || keys.ShiftRight;
  for (let i = 0; i < JUMP_KEYS.length; i++) {
    if (!pressed[JUMP_KEYS[i]]) continue;
    if (sh) { if (i < JUMP_B.length) debugJump(JUMP_B[i]); }
    else debugJump(JUMP_A[i]);
    return;
  }
}
function gameDebugKeys() {
  if (!G.debug || !G.lv) return;
  if (pressed.KeyG) { G.god = !G.god; G.toast = { s: G.god ? 'GOD MODE ON' : 'GOD MODE OFF', t: 1 }; }
  const B = G.lv.boss;
  if (pressed.KeyH && B && (B.phase === 'fight' || B.phase === 'phasing') && B.e.hp > B.e.maxHp / 2) { B.e.hp = Math.ceil(B.e.maxHp / 2); }
  if (pressed.KeyN) {
    if (B && (B.phase === 'fight' || B.phase === 'phasing')) { B.phase = 'fight'; B.e.p2 = true; B.e.hp = 0; }
    else if (!B) winRoom();
  }
}

function autoPause() {
  if (G.p && !G.death && !G.paused && (G.sceneName === 'topdown' || G.sceneName === 'side' || G.sceneName === 'boss')) { G.paused = true; G.pauseSel = 0; }
}
const PAUSE_N = 4;
function pauseLabels() { return ['RESUME', 'RESTART CHECKPOINT', 'MUTE: ' + (AU.muted ? 'ON' : 'OFF'), 'QUIT TO TITLE']; }
function updPause() {
  if (tapped('pause')) { G.paused = false; sfx('menuMove'); return; }
  if (tapped('up')) { G.pauseSel = (G.pauseSel + PAUSE_N - 1) % PAUSE_N; sfx('menuMove'); }
  if (tapped('down')) { G.pauseSel = (G.pauseSel + 1) % PAUSE_N; sfx('menuMove'); }
  if (tapped('confirm') || tapped('attack')) {
    eat('attack'); eat('confirm');
    const o = G.pauseSel;
    if (o === 0) { G.paused = false; sfx('menuSelect'); }
    else if (o === 1) { G.paused = false; sfx('menuSelect'); gotoArea(G.areaId, { cp: G.cp, retry: true }); }
    else if (o === 2) toggleMute();
    else { G.paused = false; sfx('menuSelect'); writeSave(); gotoArea('title'); }
  }
}
function controlsHint() {
  const p = G.p; if (!p) return '';
  if (p.mode === 'td') return 'MOVE: WASD/ARROWS  TALK/SWAT: J  DASH: K';
  if (p.mode === 'water') return 'SWIM: WASD  ATTACK: J  BURST: K';
  return 'RUN: A/D  JUMP: SPACE  ATTACK: J  DASH: K';
}
function drawPause() {
  ctx.fillStyle = 'rgba(7,6,12,0.6)'; ctx.fillRect(0, 0, W, H);
  const w = 220, h = 118, x = (W - w) / 2, y = 70;
  panel(x, y, w, h);
  text('PAUSED', W / 2, y + 10, PAL.gold, 2, true, 'c');
  pauseLabels().forEach((l, i) => {
    const sel = i === G.pauseSel, ty = y + 36 + i * 14;
    text(l, W / 2, ty, sel ? PAL.gold : PAL.uiLight, 1, true, 'c');
    if (sel) { const hw = textWidth(l) / 2; text('>', W / 2 - hw - 10, ty, PAL.gold, 1, true); text('<', W / 2 + hw + 6, ty, PAL.gold, 1, true); }
  });
  text(controlsHint(), W / 2, y + h - 14, PAL.grey, 1, true, 'c');
}
function drawDeath() {
  const d = G.death, a = Math.min(0.7, d.t / 0.4 * 0.7);
  ctx.fillStyle = 'rgba(7,6,12,' + a.toFixed(3) + ')'; ctx.fillRect(0, 0, W, H);
  if (d.t < 0.35) return;
  text('YOU DIED', W / 2, 96, PAL.warn, 2, true, 'c');
  text(d.quip, W / 2, 126, PAL.uiLight, 1, true, 'c');
  if (d.t > 0.8 && blink(2.5)) text('J: TRY AGAIN', W / 2, 160, PAL.gold, 1, true, 'c');
}

function drawHud() {
  const p = G.p;
  const hp = Math.max(0, p.hp), low = hp === 1;
  for (let i = 0; i < PHYS.hp; i++) {
    const full = i < hp;
    let y = 6;
    if (full && low) y += Math.sin(G.t * 10) > 0.3 ? -1 : 0;
    spr(full ? 'hudheart' : 'hudheart_e', 6 + i * 11, y);
    if (full && low && Math.sin(G.t * 10) > 0.3) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(7 + i * 11, y + 2, 7, 3); }
  }
  if (G.st.hasKylo) spr('wizhat', 6 + PHYS.hp * 11 + 8, 17);
  const s = String(G.st.kibble);
  text(s, W - 8, 7, PAL.uiLight, 1, true, 'r');
  spr('pk_kibble', W - 14 - textWidth(s), 14);
  if (G.god) text('GOD', 6, 20, PAL.green, 1, true);
}
function drawBanner() {
  const b = G.banner; if (!b) return;
  const tin = Math.min(1, b.t / 0.25), tout = clamp((b.t - b.dur) / 0.25, 0, 1);
  const k = ease(tin) * (1 - ease(tout));
  if (k <= 0) return;
  const y = Math.round(-40 + k * 64);
  ctx.fillStyle = 'rgba(14,12,22,0.78)'; ctx.fillRect(0, y, W, 36);
  ctx.fillStyle = PAL.gold; ctx.fillRect(48, y + 3, W - 96, 1); ctx.fillRect(48, y + 32, W - 96, 1);
  text(b.name, W / 2, y + 8, PAL.gold, 2, true, 'c');
  if (b.sub) text(b.sub, W / 2, y + 23, PAL.uiLight, 1, true, 'c');
}
function drawBossBar() {
  const h = G.bossHud; if (!h || h.show <= 0) return;
  const w = 240, x = (W - w) / 2, y = H - 12 + Math.round((1 - h.show) * 20);
  text(h.name, W / 2, y - 11, PAL.gold, 1, true, 'c');
  ctx.fillStyle = PAL.outline; ctx.fillRect(x - 2, y - 2, w + 4, 10);
  ctx.fillStyle = '#4a4658'; ctx.fillRect(x - 1, y - 1, w + 2, 8);
  ctx.fillStyle = '#2a1018'; ctx.fillRect(x, y, w, 6);
  const f = clamp(h.hp / h.max, 0, 1), gf = clamp(h.ghost / h.max, 0, 1);
  ctx.fillStyle = PAL.ghost; ctx.fillRect(x, y, Math.round(w * gf), 6);
  ctx.fillStyle = h.flash > 0 ? '#ffffff' : PAL.heart; ctx.fillRect(x, y, Math.round(w * f), 6);
  if (h.flash <= 0) { ctx.fillStyle = '#ff7080'; ctx.fillRect(x, y, Math.round(w * f), 1); }
  ctx.fillStyle = PAL.uiLight; ctx.fillRect(x + w / 2, y - 2, 1, 10);
}
function updUI(dt) {
  const want = (G.script && G.sceneName !== 'title') ? 1 : 0;
  G.letter = approach(G.letter, want, dt * 4);
  if (G.banner) { G.banner.t += dt; if (G.banner.t > G.banner.dur + 0.3) G.banner = null; }
  if (G.toast) { G.toast.t -= dt; if (G.toast.t <= 0) G.toast = null; }
  if (G.item) G.item.t += dt;
  G.redFlash = Math.max(0, G.redFlash - dt);
  G.whiteFlash = Math.max(0, G.whiteFlash - dt);
  if (G.shakeT > 0) { G.shakeT -= dt; G.sx = rndi(-G.shakeP, G.shakeP); G.sy = rndi(-G.shakeP, G.shakeP); if (G.shakeT <= 0) { G.shakeP = 0; G.sx = 0; G.sy = 0; } }
}
function drawUI() {
  const game = G.p && (G.sceneName === 'topdown' || G.sceneName === 'side' || G.sceneName === 'boss');
  if (G.letter > 0) { const h = Math.round(20 * G.letter); ctx.fillStyle = PAL.letter; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h); }
  if (game && !G.hideHud && G.letter < 0.3) {
    drawHud();
    if (G.lv && G.lv.boss) drawBossBar();
  }
  if (G.lv && G.lv.boss && G.lv.boss.phase === 'ready') { const k = G.lv.boss.t; text(LINES.ready, W / 2, 120 - Math.round(Math.max(0, 0.1 - k) * 80), PAL.gold, 3, true, 'c'); }
  if (G.banner) drawBanner();
  if (G.redFlash > 0) {
    const a = (G.redFlash / 0.3 * 0.5).toFixed(3);
    ctx.fillStyle = 'rgba(232,56,74,' + a + ')'; ctx.fillRect(0, 0, W, 6); ctx.fillRect(0, H - 6, W, 6); ctx.fillRect(0, 6, 6, H - 12); ctx.fillRect(W - 6, 6, 6, H - 12);
  }
  if (G.whiteFlash > 0) { ctx.fillStyle = 'rgba(255,255,255,' + Math.min(0.8, G.whiteFlash / 0.35 * 0.8).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
  if (G.item) drawItemBanner();
  if (G.dlg) drawDialogue();
  if (G.death) drawDeath();
  if (G.paused) drawPause();
  if (G.script && G.skipT > 0.05) {
    const w = 60, x = W - w - 8, y = H - 14;
    text('HOLD ENTER: SKIP', x + w, y - 10, PAL.grey, 1, true, 'r');
    ctx.fillStyle = PAL.outline; ctx.fillRect(x - 1, y - 1, w + 2, 4); ctx.fillStyle = PAL.gold; ctx.fillRect(x, y, Math.round(w * Math.min(1, G.skipT / 0.8)), 2);
  }
  if (G.toast) text(G.toast.s, W / 2, 30, PAL.uiLight, 1, true, 'c');
  if (G.fade > 0) { ctx.fillStyle = 'rgba(7,6,12,' + G.fade.toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
}

function tdChecks() {
  const p = G.p; if (!p || G.script || G.dlg) return;
  if (G.areaId === 'cat_country' && !G.flags.doorOpen && Math.abs(p.x - 144) < 18 && p.y > 200 && held('down')) {
    if (!G.doorCd || G.t > G.doorCd) { G.doorCd = G.t + 2.5; sayLines('door_locked'); }
  }
}
function gameUpdate(dt) {
  if (G.paused) { updPause(); return; }
  if (G.death) {
    G.death.t += dt;
    if (G.death.t < 0.9) { worldUpdate(dt); updParts(dt); }
    if (G.death && G.death.t > 0.8 && (tapped('attack') || tapped('confirm'))) respawn();
    return;
  }
  if (tapped('pause') && !G.script && !G.dlg && !G.fadeState) { G.paused = true; G.pauseSel = 0; sfx('menuSelect'); return; }
  updSkip(dt);
  if (G.dlg) { updDialogue(dt); updParts(dt); return; }
  gameDebugKeys();
  if (G.sceneName === 'topdown') tdChecks();
  worldUpdate(dt);
  updParts(dt);
}
function gameDraw() { worldDraw(); }

function titleState() {
  const s = loadSave();
  const bub = [];
  for (let i = 0; i < 26; i++) bub.push({ x: rnd(0, W), y: rnd(0, H), r: rndi(1, 4), v: rnd(10, 30), ph: rnd(0, 6) });
  return { t: 0, sel: 0, save: s && s.area ? s : null, bub };
}
function drawBubbles(list) {
  for (const b of list) {
    const x = Math.round(b.x + Math.sin(G.t * 1.5 + b.ph) * 3), y = Math.round(b.y);
    if (b.r <= 1) { ctx.fillStyle = 'rgba(216,244,255,0.6)'; ctx.fillRect(x, y, 1, 1); }
    else { pixRing(x, y, b.r, 'rgba(216,244,255,0.55)', 1, false); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(x - 1, y - 1, 1, 1); }
  }
}
function updBubbles(list, dt) { for (const b of list) { b.y -= b.v * dt; if (b.y < -6) { b.y = H + 6; b.x = rnd(0, W); } } }
function drawBig(name, x, y, sc, flip) { ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(sc, sc); spr(name, 0, 0, flip); ctx.restore(); }
function gradient(c0, c1, y0, y1) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0); }

const SCENES = {
  title: {
    enter() { G.ti = titleState(); G.p = null; G.lv = null; G.letter = 0; },
    update(dt) {
      const T = G.ti; T.t += dt;
      updBubbles(T.bub, dt);
      if (G.fadeState) return;
      const opts = T.save ? ['CONTINUE', 'NEW GAME'] : ['NEW GAME'];
      if (tapped('up') || tapped('down')) { T.sel = (T.sel + 1) % opts.length; sfx('menuMove'); }
      if (T.t > 0.3 && (tapped('confirm') || tapped('attack'))) {
        sfx('menuSelect');
        if (opts[T.sel] === 'NEW GAME') newGame(); else continueGame(T.save);
        return;
      }
      titleDebugKeys();
    },
    draw() {
      const T = G.ti;
      gradient('#08122c', '#16305c', 0, H);
      ctx.fillStyle = 'rgba(120,200,255,0.06)';
      for (let i = 0; i < 4; i++) { const x = 40 + i * 96 + Math.round(Math.sin(G.t * 0.4 + i) * 10); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 26, 0); ctx.lineTo(x + 70, H); ctx.lineTo(x + 30, H); ctx.fill(); }
      drawBubbles(T.bub);
      ctx.fillStyle = '#c8a878'; ctx.fillRect(0, 226, W, H - 226);
      ctx.fillStyle = '#a88858'; for (let x = 0; x < W; x += 12) ctx.fillRect(x + ((x / 12) % 2) * 5, 232 + ((x / 12) % 3) * 6, 3, 1);
      ctx.fillStyle = '#e0c898'; ctx.fillRect(0, 226, W, 1);
      text('HALO', W / 2 + 4, 36 + 4, '#050510', 5, false, 'c');
      text('HALO', W / 2, 36, PAL.gold, 5, true, 'c');
      drawBig('halo_idle_' + (Math.floor(T.t * 2) % 2), 160, 226, 2, false);
      drawBig('fishbowl', 226, 226, 2, false);
      const opts = T.save ? ['CONTINUE', 'NEW GAME'] : ['NEW GAME'];
      opts.forEach((o, i) => {
        const sel = i === T.sel, y = 92 + i * 16;
        text(o, W / 2, y, sel ? PAL.gold : PAL.uiLight, 1, true, 'c');
        if (sel) { const hw = textWidth(o) / 2; text('>', W / 2 - hw - 10, y, PAL.gold, 1, true); }
      });
      if (blink(1.6)) text('PRESS ENTER', W / 2, 136, PAL.uiLight, 1, true, 'c');
      text(LINES.title_hint, W / 2, 256, PAL.uiLight, 1, true, 'c');
      text(LINES.debug_hint, W / 2, 272, PAL.grey, 1, true, 'c');
    }
  },
  topdown: { update: gameUpdate, draw: gameDraw },
  side: { update: gameUpdate, draw: gameDraw },
  boss: { update: gameUpdate, draw: gameDraw },
  card: {
    enter() { G.card = { t: 0, done: false }; },
    update(dt) {
      const c = G.card; c.t += dt;
      if (!c.done && (c.t >= 4.5 || (c.t > 0.3 && (tapped('attack') || tapped('confirm'))))) { c.done = true; nextArea(); }
    },
    draw() {
      const c = G.card, S = PAL.area.sea;
      gradient(S.top, S.bot, 0, 150);
      ctx.fillStyle = '#fff0b0'; ctx.beginPath(); ctx.arc(300, 110, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = S.water; ctx.fillRect(0, 150, W, H - 150);
      for (let r = 0; r < 6; r++) {
        const y = 150 + r * 24, off = (c.t * (40 + r * 12)) % 32;
        ctx.fillStyle = r % 2 ? S.waterD : S.waterL;
        for (let x = -32; x < W + 32; x += 32) ctx.fillRect(Math.round(x + off), y + Math.round(Math.sin(c.t * 2 + x) * 2), 14, 2);
      }
      const bx = 150, by = 176 + Math.round(Math.sin(c.t * 3) * 3);
      drawBig('kylo_float_' + (Math.floor(c.t * 3) % 2), bx - 40, by - 10, 2, true);
      drawBig('haloh_swim_' + (Math.floor(c.t * 8) % 4), bx + 40, by, 2, true);
      ctx.fillStyle = 'rgba(58,136,200,0.55)'; ctx.fillRect(0, by - 4, W, 14);
      const L = LINES.crossing;
      [0.5, 1.8, 3.0].forEach((t0, i) => { if (c.t >= t0) text(L[i], W / 2, 30 + i * 16, i === 2 ? PAL.gold : PAL.uiLight, 1, true, 'c'); });
    }
  },
  cutscene: {
    enter() { G.hideHud = true; buildEnding(); },
    update(dt) {
      updSkip(dt);
      if (G.dlg) { updDialogue(dt); updParts(dt); return; }
      if (G.lv) worldUpdate(dt); else { runScript(dt); G.seaT = (G.seaT || 0) + dt; }
      updParts(dt);
    },
    draw() { if (G.cutStage === 'sea' || !G.lv) drawSeaRide(); else worldDraw(); }
  },
  end: {
    enter() { G.endT = 0; G.p = null; G.lv = null; },
    update(dt) {
      G.endT += dt;
      if (G.endT > 1.2 && !G.fadeState && (tapped('confirm') || tapped('attack'))) { sfx('menuSelect'); gotoArea('title'); }
    },
    draw() {
      gradient('#2a2050', '#f0a060', 0, 190);
      gradient('#f0a060', '#f8d090', 190, H);
      ctx.fillStyle = '#fff4c0'; ctx.beginPath(); ctx.arc(W / 2, 196, 30, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#7a4e34'; ctx.fillRect(0, 196, W, H - 196);
      ctx.fillStyle = '#9a6644'; for (let x = 0; x < W; x += 32) ctx.fillRect(x, 196, 1, H - 196);
      spr('cushion', W / 2 + 6, 244); spr('sugar_sleep_' + (Math.floor(G.t * 0.8) % 2), W / 2 + 6, 242);
      spr('halo_idle_' + (Math.floor(G.t * 2) % 2), W / 2 - 60, 250);
      spr('bella_idle_' + (Math.floor(G.t * 2 + 1) % 2), W / 2 + 60, 250, true);
      spr('kylo_idle_' + (Math.floor(G.t * 2) % 2), W / 2 + 84, 252, true);
      text('THE END', W / 2, 24, PAL.gold, 3, true, 'c');
      wrap(LINES.endcard, 360).forEach((l, i) => text(l, W / 2, 62 + i * 12, PAL.uiLight, 1, true, 'c'));
      const t = Math.floor(G.st.time), mm = Math.floor(t / 60), ss = t % 60;
      text('TIME ' + mm + ':' + (ss < 10 ? '0' : '') + ss, W / 2, 104, PAL.uiLight, 1, true, 'c');
      text('DEATHS ' + G.st.deaths, W / 2, 118, PAL.uiLight, 1, true, 'c');
      text('KIBBLE ' + G.st.kibble + '/' + G.kibbleTotal, W / 2, 132, PAL.uiLight, 1, true, 'c');
      if (G.endT > 1.2 && blink(1.6)) text('PRESS ENTER', W / 2, 160, PAL.gold, 1, true, 'c');
    }
  }
};
function setScene(name, opts) {
  G.sceneName = name; G.scene = SCENES[name];
  if (G.scene.enter) G.scene.enter(opts || {});
}

function cutStage(name) {
  G.ents = []; G.parts = []; G.texts = []; G.lock = null; G.camTarget = null; G.cutStage = name; G.lv = null; G.p = null; G.ky = null;
  if (name === 'throne') {
    const A = { id: 'ending_throne', pal: 'castle', bg: 'throne', view: 'side' };
    G.lv = makeLevel(A, areaData('boss_dozer'), {});
    G.ents = G.ents.filter(e => e.type !== 'kibble' && e.type !== 'treat' && e.type !== 'check');
    spawn('prop', 110, 256, { spr: 'snacks' }); spawn('prop', 270, 256, { spr: 'snacks' }); spawn('prop', 42, 256, { spr: 'throne' });
    G.cutCage = spawn('cage', 344, 2 * TS, { who: 'bella', len: 36 });
    spawn('actor', 90, 256, { spr: 'dozer_flop' });
    G.p = makePlayer(150, 256, 'land'); G.p.ctrl = false; G.p.grounded = true;
    G.ky = makeKylo(G.p);
    camUpdate(0, true);
  } else if (name === 'sea') {
    G.seaT = 0;
  } else if (name === 'home') {
    G.lv = makeLevel(AREAS.cat_country, areaData('cat_country'), {});
    G.ents = G.ents.filter(e => e.type !== 'kibble');
    for (const e of G.ents) if (e.type === 'bowl') e.full = true;
    openTiles('+');
    G.p = makePlayer(144, 206, 'td'); G.p.ctrl = false; applyFace(G.p, 'u');
    camUpdate(0, true);
  }
}
function drawSeaRide() {
  const t = G.seaT || 0, S = PAL.area.sea;
  gradient(S.top, S.bot, 0, 160);
  ctx.fillStyle = '#fff0b0'; ctx.beginPath(); ctx.arc(80, 120, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let i = 0; i < 4; i++) { const x = ((i * 120 + t * 14) % (W + 80)) - 40; ctx.fillRect(Math.round(x), 30 + i * 18, 34, 5); ctx.fillRect(Math.round(x) + 6, 26 + i * 18, 20, 4); }
  ctx.fillStyle = S.water; ctx.fillRect(0, 160, W, H - 160);
  for (let r = 0; r < 6; r++) {
    const y = 164 + r * 22, off = (t * (30 + r * 14)) % 32;
    ctx.fillStyle = r % 2 ? S.waterD : S.waterL;
    for (let x = -32; x < W + 32; x += 32) ctx.fillRect(Math.round(x + off), y + Math.round(Math.sin(t * 2 + x) * 2), 14, 2);
  }
  const rx = 190, ry = 184 + Math.round(Math.sin(t * 2.2) * 2);
  spr('raft', rx, ry, true);
  spr('kylo_idle_' + (Math.floor(t * 2 + 1) % 2), rx - 22, ry - 19, true);
  spr('bella_idle_' + (Math.floor(t * 2) % 2), rx - 6, ry - 20, true);
  spr('halo_idle_' + (Math.floor(t * 2) % 2), rx + 16, ry - 20, true);
  const cy = 206 + Math.round(Math.sin(t * 3 + 1) * 3);
  spr('ch_idle_' + (Math.floor(t * 3) % 2), rx + 76, cy, true);
  spr('shell', rx + 58, cy - 2);
  ctx.fillStyle = 'rgba(58,136,200,0.5)'; ctx.fillRect(0, ry - 2, W, 6);
  drawParts();
}
function buildEnding() {
  cutStage('throne');
  let bella = null, kylo = null, twA = null, twB = null;
  const cage = () => G.cutCage;
  play([
    ['wait', 0.7],
    ['walk', 'p', 322, 256],
    ['do', () => { G.p.face = 1; G.p.slash = { k: 's1', t: 0 }; sfx('swipe'); }], ['wait', 0.2],
    ['do', () => { const c = cage(); c.open = 1; sfx('gateOpen'); sparkle(c.x, c.y + c.len + 20, 12, PAL.gold); bella = spawn('actor', c.x, c.y + c.len + 32, { spr: 'bella_idle', frames: 2, face: -1 }); bella.mv = { x: 342, y: 256, s: 150 }; }],
    ['until', () => bella && !bella.mv],
    ['say', 'end_1'],
    ['do', () => { const k = G.ky; kylo = spawn('actor', k ? k.x : 260, k ? k.y : 240, { spr: 'kylo_walk', frames: 2, face: 1 }); G.ky = null; kylo.mv = { x: 330, y: 256, s: 120 }; }],
    ['until', () => kylo && !kylo.mv],
    ['do', () => { kylo.spr = 'kylo_happy'; kylo.frames = 0; bella.spr = 'bella_happy'; bella.frames = 0; part({ x: 336, y: 234, vy: -20, life: 1.2, col: '#ff7ab0', k: 'heart' }); sfx('heart'); }], ['wait', 0.7],
    ['say', 'end_2'],
    ['do', () => { kylo.spr = 'kylo_cast'; sparkle(bella.x + 3, bella.y - 14, 14, '#f07090'); sfx('sparkle'); }], ['wait', 0.7],
    ['do', () => { kylo.spr = 'kylo_idle'; kylo.frames = 2; bella.spr = 'bella_idle'; bella.frames = 2; }],
    ['say', 'end_3'],
    ['fadeout'], ['do', () => cutStage('sea')], ['fadein'],
    ['wait', 1.2], ['say', 'end_4'], ['wait', 0.8],
    ['fadeout'],
    ['do', () => { cutStage('home'); twA = spawn('actor', 130, 214, { spr: 'bella_idle', frames: 2 }); twB = spawn('actor', 158, 214, { spr: 'kylo_idle', frames: 2 }); }],
    ['fadein'],
    ['walk', 'p', 196, 120, 60], ['do', () => applyFace(G.p, 'r')], ['wait', 0.4],
    ['say', 'end_5'],
    ['do', () => { twA.spr = 'bella_walk'; twB.spr = 'kylo_walk'; twA.mv = { x: 64, y: 98, s: 150 }; twB.mv = { x: 96, y: 98, s: 150 }; sfx('dash'); }],
    ['until', () => twA && twB && !twA.mv && !twB.mv],
    ['do', () => { twA.spr = 'bella_eat'; twB.spr = 'kylo_eat'; twA.face = -1; twB.face = -1; sfx('crunch'); }], ['wait', 0.5], ['do', () => sfx('crunch')], ['wait', 0.9],
    ['goto', 'end']
  ]);
}

let lastT = 0, acc = 0;
function update(dt) {
  G.t += dt;
  if (tapped('mute')) toggleMute();
  if (G.debug && pressed.F1) G.boxes = !G.boxes;
  updFade(dt);
  updUI(dt);
  if (G.scene) G.scene.update(dt);
  musicTick();
}
function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = PAL.letter; ctx.fillRect(0, 0, W, H);
  if (G.scene) G.scene.draw();
  drawUI();
}
function frame(now) {
  requestAnimationFrame(frame);
  let d = (now - lastT) / 1000; lastT = now;
  if (!(d > 0)) d = 0; if (d > 0.1) d = 0.1;
  acc += d;
  let n = 0;
  while (acc >= STEP && n < 5) { acc -= STEP; update(STEP); clearPressed(); n++; }
  if (n >= 5) acc = 0;
  render();
}
function boot() {
  buildAllSprites();
  buildFxSprites();
  G.kibbleTotal = countKibble();
  loadArea('title');
  requestAnimationFrame(t => { lastT = t; frame(t); });
}
boot();
