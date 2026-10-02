const TYPES = {};
function pCenter() { const p = G.p; if (!p) return { x: -9999, y: -9999 }; return { x: p.x, y: p.mode === 'td' ? p.y - 6 : p.y - p.h / 2 }; }
function canTele(e) {
  if (e.room) return true;
  let n = 0;
  for (const o of G.ents) if (o !== e && o.enemy && !o.room && !o.dead && (o.state === 'tele') && onScreen(o.x, o.y, 0)) n++;
  return n < 2;
}
function gravityStep(e, dt, g, max) {
  e.vy = Math.min((e.vy || 0) + g * dt, max);
  const r = moveBody(e, 0, e.vy * dt, { oneway: true, solids: false, plats: true });
  if (r.d) e.vy = 0;
  if (r.u && e.vy < 0) e.vy = 0;
  return r;
}
function edgeAhead(e, dir) {
  const ax = e.x + dir * (e.w / 2 + 1);
  const tx = Math.floor(ax / TS);
  if (solidT(tx, Math.floor((e.y - 2) / TS))) return true;
  if (!(flagsAt(tx, Math.floor((e.y + 2) / TS)) & 3)) return true;
  if (flagsAt(tx, Math.floor((e.y + 2) / TS)) & TF.HZ) return true;
  return false;
}
function setSize(e, w, h) { const cy = e.y - e.h / 2; e.w = w; e.h = h; e.y = cy + h / 2; }
function playerNear(e, r) { const pc = pCenter(); return dist(e.x, e.y - e.h / 2, pc.x, pc.y) < r; }

TYPES.check = {
  w: 16, h: 20, z: -2,
  update(e, dt) {
    e.glow = Math.max(0, (e.glow || 0) - dt);
    const p = G.p; if (!p || p.dead || e.on) return;
    if (overlap(boxOf(p), boxOf(e))) {
      for (const c of G.lv.cps) c.on = false;
      e.on = true; e.glow = 1; G.cp = e.idx; G.hp = p.hp; writeSave(); sfx('checkpoint');
      sparkle(e.x, e.y - 12, 12, G.lv.water ? '#f8f0ff' : PAL.gold);
      floatText('CHECKPOINT', e.x, e.y - 30, PAL.gold);
    }
  },
  draw: e => drawCheckpoint(e)
};
TYPES.kibble = {
  w: 8, h: 8, z: 1,
  update(e) {
    const pc = pCenter();
    if (dist(e.x, e.y - 4, pc.x, pc.y) < 13) {
      e.dead = true; G.st.got.add(e.key); G.st.kibble++; sfx('pickup'); sparkle(e.x, e.y - 4, 5, '#f0c860');
    }
  },
  draw: e => drawKibble(e)
};
TYPES.bonuskibble = {
  w: 8, h: 8, z: 1,
  update(e, dt) {
    if (!G.lv.water && !G.lv.td) { const r = gravityStep(e, dt, 700, 300); if (r.d) e.vx = 0; moveBody(e, (e.vx || 0) * dt, 0, { solids: false }); }
    else { e.x += (e.vx || 0) * dt; e.y += (e.vy || 0) * dt; e.vx = (e.vx || 0) * (1 - 3 * dt); e.vy = (e.vy || 0) * (1 - 3 * dt); }
    const pc = pCenter();
    if (e.t > 0.3 && dist(e.x, e.y - 4, pc.x, pc.y) < 14) { e.dead = true; G.st.kibble++; sfx('pickup'); sparkle(e.x, e.y - 4, 5, '#f0c860'); }
  },
  draw: e => drawKibble(e)
};
TYPES.heart = {
  w: 10, h: 10, z: 2,
  update(e, dt) {
    if (!e.perm && e.t > 8) { e.dead = true; return; }
    if (G.lv.water) { if (e.fall) { e.y += 50 * dt; if (!entFree(e, 0, 2)) e.fall = false; } }
    else { const r = gravityStep(e, dt, 700, 250); }
    const pc = pCenter();
    if (dist(e.x, e.y - 5, pc.x, pc.y) < 14 && G.p && !G.p.dead) {
      e.dead = true; G.p.hp = Math.min(PHYS.hp, G.p.hp + 1); sfx('heart'); sparkle(e.x, e.y - 5, 8, PAL.heart); floatText('+1', e.x, e.y - 16, PAL.heart);
    }
  },
  draw: e => drawHeartPickup(e)
};
TYPES.treat = {
  w: 16, h: 12, z: 2,
  update(e) {
    const pc = pCenter();
    if (dist(e.x, e.y - 6, pc.x, pc.y) < 15 && G.p && !G.p.dead) {
      e.dead = true; G.p.hp = PHYS.hp; sfx('bigTreat'); sparkle(e.x, e.y - 6, 14, '#f8b870'); floatText(LINES.bark_treat, G.p.x, G.p.y - 28, PAL.gold);
    }
  },
  draw: e => drawTreat(e)
};
TYPES.sign = {
  w: 16, h: 16, z: -3,
  update(e) { const pc = pCenter(); e.show = Math.abs(pc.x - e.x) < 28 && Math.abs(pc.y - (e.y - 10)) < 30; },
  draw: e => drawSign(e), drawTop: e => drawSignText(e)
};
TYPES.prop = { w: 16, h: 8, z: -4, update(e, dt) { }, draw: e => drawProp(e), drawTop: e => drawPropTop(e) };
TYPES.label = { w: 8, h: 8, z: -4, draw: e => { }, drawTop: e => drawLabel(e) };
TYPES.exit = { w: 16, h: 16, z: -5, draw: e => drawExit(e) };
TYPES.bowlplat = {
  plat: 1, w: 32, h: 8,
  init(e) { e.plat = true; e.w = e.pw; e.pt = 0; },
  update(e, dt) {
    e.pt += dt;
    const range = Math.max(Math.abs(e.dx), Math.abs(e.dy)), ph = (e.pt * 40) % (2 * range), off = ph < range ? ph : 2 * range - ph;
    const nx = e.x0 + sgn(e.dx) * off, ny = e.y0 + sgn(e.dy) * off;
    e.ddx = nx - e.x; e.ddy = ny - e.y; e.x = nx; e.y = ny;
  },
  draw: e => drawBowlPlat(e)
};
TYPES.ledge = { plat: 1, w: 32, h: 8, init(e) { e.plat = true; e.w = e.pw; e.ddx = 0; }, update() { }, draw: e => drawLedge(e) };
TYPES.bowl = { w: 12, h: 6, z: -1, draw: e => drawBowlProp(e) };
TYPES.sugar = { w: 20, h: 8, init(e) { e.talkable = true; e.talkR = 16; e.awakeT = 0; }, update(e, dt) { e.awakeT = Math.max(0, e.awakeT - dt); if (Math.random() < dt * 0.5 && e.awakeT <= 0) part({ x: e.x + 10, y: e.y - 16, vx: 6, vy: -10, life: 1.4, col: '#e8e8ff', k: 'z' }); }, draw: e => drawSugar(e), drawTop: e => drawTalkMark(e, 22) };
TYPES.moth = { w: 4, h: 4, high: 1, init(e) { e.talkable = true; e.high = 1; e.talkR = 10; }, update(e, dt) { e.x = e.cx + Math.cos(e.t * 3.2) * 9; e.y = e.cy + Math.sin(e.t * 5.1) * 4; }, draw: e => drawMoth(e), drawTop: e => drawTalkMark(e, 8) };
TYPES.door = { w: 32, h: 8, draw: e => drawHouseDoor(e) };
TYPES.npc = {
  w: 12, h: 8,
  init(e) { e.face = e.x > (G.p ? G.p.x : 0) ? -1 : 1; e.sp = 0; },
  update(e, dt) {
    if (e.spin) { e.sp += dt; if (e.sp > 0.22) { e.sp = 0; e.face *= -1; } }
    else if (G.p && e.t > 0.2 && !e.lockFace) e.face = G.p.x < e.x ? -1 : 1;
  },
  draw: e => drawNpc(e), drawTop: e => drawTalkMark(e, e.pup !== undefined ? 16 : 28)
};
TYPES.parkball = {
  w: 8, h: 6,
  init(e) { e.vx = 0; e.vy = 0; },
  update(e, dt) {
    const r1 = moveBody(e, e.vx * dt, 0, {}); if (r1.l || r1.r) { e.vx = -e.vx * 0.7; sfx('bonk', 1.5); }
    const r2 = moveBody(e, 0, e.vy * dt, {}); if (r2.u || r2.d) { e.vy = -e.vy * 0.7; sfx('bonk', 1.5); }
    const k = Math.max(0, 1 - 1.5 * dt); e.vx *= k; e.vy *= k;
  },
  bladeHit(e, box, a, p) {
    if (!overlap(box, { x: e.x - 5, y: e.y - 8, w: 10, h: 10 })) return false;
    e.hitBy = a.id;
    const d = p.tdDir === 'd' ? [0, 1] : p.tdDir === 'u' ? [0, -1] : [p.face, 0];
    e.vx = d[0] * 200 + rnd(-20, 20); e.vy = d[1] * 200 + rnd(-20, 20); sfx('bonk'); floatText('BOING', e.x, e.y - 14, PAL.gold);
    return true;
  },
  draw: e => drawParkBall(e)
};
TYPES.portcullis = {
  w: 64, h: 8, under: 1,
  init(e) { e.open = G.flags.gateOpen ? 1 : 0; e.under = 1; },
  update(e, dt) { if (G.flags.gateOpen) e.open = Math.min(1, e.open + dt * 0.8); },
  draw: e => drawPortcullis(e)
};
TYPES.rockgate = {
  w: 8, h: 8, z: 3,
  init(e) {
    e.open = 0; e.state = 'shut';
    for (let y = e.ty; y < e.ty + e.th; y++) for (let x = e.tx; x < e.tx + e.tw; x++) G.lv.dyn[y * G.lv.w + x] = 1;
  },
  update(e, dt) {
    const cx = (e.tx + e.tw / 2) * TS, cy = (e.ty + e.th / 2) * TS;
    if (e.state === 'shut' && playerNear({ x: cx, y: cy + 8, h: 0 }, 110)) { e.state = 'opening'; sfx('gateOpen'); sfx('groan'); shake(2, 1.0); floatText('GRRRNNNN...', cx, cy - 30, '#8ab0c0'); }
    if (e.state === 'opening') {
      e.open = Math.min(1, e.open + dt / 1.2);
      if (Math.random() < 0.3) bubbleP(cx + rnd(-60, 60), cy + rnd(-20, 20), 1);
      if (e.open >= 1) { e.state = 'open'; for (let y = e.ty; y < e.ty + e.th; y++) for (let x = e.tx; x < e.tx + e.tw; x++) G.lv.dyn[y * G.lv.w + x] = 0; }
    }
  },
  draw: e => drawRockGate(e)
};

TYPES.crab = {
  enemy: 1, hp: 4, w: 14, h: 10, drops: { heart: 0.15 },
  init(e) { e.state = 'walk'; e.face = Math.random() < 0.5 ? -1 : 1; e.vy = 0; },
  update(e, dt) {
    const p = G.p, wat = G.lv.water;
    const r = gravityStep(e, dt, wat ? 400 : 900, wat ? 120 : 300);
    e.contact = e.state !== 'rec'; e.atkBox = null;
    if (e.state === 'walk') {
      if (r.d) { if (edgeAhead(e, e.face)) e.face *= -1; else moveBody(e, e.face * 30 * dt, 0, { solids: false }); }
      if (p && !p.dead && Math.abs(p.x - e.x) < 28 && Math.abs((p.y - p.h / 2) - (e.y - 5)) < 22 && canTele(e)) { e.state = 'tele'; e.t = 0; e.face = p.x < e.x ? -1 : 1; }
    } else if (e.state === 'tele') { if (e.t >= 0.45) { e.state = 'atk'; e.t = 0; sfx('swipe', 1.4); } }
    else if (e.state === 'atk') { e.atkBox = { x: e.face > 0 ? e.x + 2 : e.x - 22, y: e.y - 12, w: 20, h: 12 }; if (e.t >= 0.15) { e.state = 'rec'; e.t = 0; e.atkBox = null; } }
    else if (e.state === 'rec') { if (e.t >= 0.6) { e.state = 'walk'; e.t = 0; } }
  },
  draw: e => drawCrab(e)
};
TYPES.jelly = {
  enemy: 1, hp: 3, w: 12, h: 14, drops: { heart: 0.10 },
  init(e) { e.y0 = e.y; e.zt = 0.8 + hash2(e.x | 0, e.y | 0) * 2.2; e.state = 'idle'; e.glowy = G.lv.A.pal === 'trench'; e.anim = hash2(e.y | 0, e.x | 0) * 3; },
  update(e, dt) {
    e.y = e.y0 + Math.sin(e.anim * Math.PI * 2 / 3) * 12;
    e.contact = false;
    e.atkBox = e.state === 'rec' ? null : { x: e.x - 6, y: e.y - 7, w: 12, h: 7 };
    e.ring = null;
    if (e.state === 'idle') { e.zt -= dt; if (e.zt <= 0) { if (onScreen(e.x, e.y, 0) && canTele(e)) { e.state = 'tele'; e.t = 0; } else e.zt = 0.4; } }
    else if (e.state === 'tele') { if (e.t >= 0.6) { e.state = 'zap'; e.t = 0; sfx('zap'); } }
    else if (e.state === 'zap') { e.ring = { x: e.x, y: e.y - 7, r0: 0, r1: 26 }; if (e.t >= 0.25) { e.state = 'idle'; e.zt = 2.15; e.ring = null; } }
  },
  draw: e => drawJelly(e), drawTop: e => drawJellyWarn(e)
};
TYPES.puffer = {
  enemy: 1, hp: 6, w: 14, h: 14, drops: { heart: 0.20 },
  init(e) { e.state = 'drift'; e.vx = 0; e.vy = 0; },
  deflect(e) { return e.state === 'big'; },
  dmgMul(e) { return e.state === 'dizzy' ? 1.5 : 1; },
  update(e, dt) {
    const pc = pCenter(), cx = e.x, cy = e.y - e.h / 2, d = dist(cx, cy, pc.x, pc.y);
    e.contact = e.state !== 'dizzy';
    if (e.state !== 'dizzy' && e.state !== 'big') e.face = pc.x < e.x ? -1 : 1;
    if (e.state === 'drift') {
      if (d < 140 && d > 1) { moveBody(e, (pc.x - cx) / d * 24 * dt, (pc.y - cy) / d * 24 * dt, { solids: false }); }
      if (d < 48 && canTele(e)) { e.state = 'tele'; e.t = 0; }
    } else if (e.state === 'tele') { if (e.t >= 0.5) { e.state = 'big'; e.t = 0; setSize(e, 24, 24); unstick(e); sfx('pop'); } }
    else if (e.state === 'big') { if (e.t >= 1.5) { e.state = 'dizzy'; e.t = 0; setSize(e, 14, 14); } }
    else if (e.state === 'dizzy') { if (e.t >= 1.0) { e.state = 'drift'; e.t = 0; } }
    if (e.kbx) e.kbx *= 0.9;
  },
  draw: e => drawPuffer(e)
};
TYPES.eel = {
  enemy: 1, hp: 6, w: 10, h: 10, drops: { heart: 0.2 }, noKb: 1,
  init(e) {
    const tx = Math.floor(e.x / TS), ty = Math.floor((e.y - 1) / TS);
    if (solidT(tx, ty + 1)) { e.dx = 0; e.dy = -1; e.bx = tx * TS + 8; e.by = (ty + 1) * TS; }
    else if (solidT(tx, ty - 1)) { e.dx = 0; e.dy = 1; e.bx = tx * TS + 8; e.by = ty * TS; }
    else if (solidT(tx - 1, ty)) { e.dx = 1; e.dy = 0; e.bx = tx * TS; e.by = ty * TS + 8; }
    else { e.dx = -1; e.dy = 0; e.bx = (tx + 1) * TS; e.by = ty * TS + 8; }
    e.ext = 0; e.state = 'hide'; e.cd = rnd(0.2, 1.0); eelPos(e);
  },
  canHit(e) { return e.state === 'lunge' || e.state === 'out' || e.state === 'retract'; },
  targetable(e) { return e.state === 'out' || e.state === 'retract'; },
  hurt(e) {
    if (e.ext < 4) return null;
    const hx = e.bx + e.dx * e.ext, hy = e.by + e.dy * e.ext;
    if (e.dx === 0) return { x: e.bx - 5, y: Math.min(e.by, hy) - (e.dy < 0 ? 5 : -5) * 0 - 5, w: 10, h: Math.abs(hy - e.by) + 10 };
    return { x: Math.min(e.bx, hx) - 5, y: e.by - 5, w: Math.abs(hx - e.bx) + 10, h: 10 };
  },
  aim(e) { return { x: e.bx + e.dx * e.ext, y: e.by + e.dy * e.ext }; },
  update(e, dt) {
    const pc = pCenter();
    const along = (pc.x - e.bx) * e.dx + (pc.y - e.by) * e.dy, perp = Math.abs((pc.x - e.bx) * e.dy - (pc.y - e.by) * e.dx);
    const near = along > -8 && along < 64 && perp < 22;
    if (e.state === 'hide') { e.cd -= dt; if (near && e.cd <= 0 && canTele(e)) { e.state = 'tele'; e.t = 0; } }
    else if (e.state === 'tele') { if (Math.random() < 0.4) bubbleP(e.bx + e.dx * 4, e.by + e.dy * 4, 1); if (e.t >= 0.6) { e.state = 'lunge'; e.t = 0; sfx('swipe', 0.7); } }
    else if (e.state === 'lunge') { e.ext = Math.min(40, e.t / 0.12 * 40); if (e.t >= 0.12) { e.state = 'out'; e.t = 0; e.ext = 40; } }
    else if (e.state === 'out') { if (e.t >= 0.9) { e.state = 'retract'; e.t = 0; } }
    else if (e.state === 'retract') { e.ext = Math.max(0, 40 * (1 - e.t / 0.4)); if (e.t >= 0.4) { e.state = 'hide'; e.t = 0; e.ext = 0; e.cd = 1.2; } }
    eelPos(e);
  },
  touch(e, p, pb) {
    if (e.state !== 'lunge' && e.state !== 'out') return;
    const hx = e.bx + e.dx * e.ext, hy = e.by + e.dy * e.ext;
    if (overlap(pb, { x: hx - 6, y: hy - 6, w: 12, h: 12 })) hurtPlayer(hx, hy);
  },
  draw: e => drawEel(e)
};
function eelPos(e) { e.x = e.bx + e.dx * e.ext; e.y = e.by + e.dy * e.ext + 5; }
TYPES.swarm = {
  enemy: 1, hp: 5, w: 30, h: 24, noKb: 1,
  init(e) {
    e.cx = e.x; e.cy = e.y - 12; e.fish = [];
    for (let i = 0; i < 5; i++) e.fish.push({ x: e.cx + rnd(-10, 10), y: e.cy + rnd(-8, 8), vx: 0, vy: 0, dead: false, dart: 0, tele: 0, ph: rnd(0, 6) });
    e.dartT = rnd(1.5, 2.5); e.key = G.areaId + ':m:' + Math.round(e.x) + ',' + Math.round(e.y);
  },
  canHit() { return false; },
  targetable(e) { return e.fish.some(f => !f.dead); },
  aim(e) { const f = e.fish.find(f => !f.dead); return f ? { x: f.x, y: f.y } : { x: e.cx, y: e.cy }; },
  bladeHit(e, box, a) {
    let hit = false;
    for (const f of e.fish) if (!f.dead && overlap(box, { x: f.x - 4, y: f.y - 3, w: 8, h: 6 })) { f.dead = true; hit = true; sparkle(f.x, f.y, 4, '#ffffff'); puff(f.x, f.y, 2, '#d8f4ff'); }
    if (hit) { sfx('hit'); hitstop(3); swarmCheck(e); }
    return hit;
  },
  boltHit(e, b) {
    for (const f of e.fish) if (!f.dead && overlap(b, { x: f.x - 4, y: f.y - 3, w: 8, h: 6 })) { f.dead = true; sparkle(f.x, f.y, 4, '#ffffff'); sfx('hit'); swarmCheck(e); return true; }
    return false;
  },
  update(e, dt) {
    const pc = pCenter();
    const dx = pc.x - e.cx, dy = pc.y - e.cy, d = Math.hypot(dx, dy) || 1;
    if (d < 220) {
      const nx = e.cx + dx / d * 40 * dt, ny = e.cy + dy / d * 40 * dt;
      if (!solidT(Math.floor(nx / TS), Math.floor(e.cy / TS))) e.cx = nx;
      if (!solidT(Math.floor(e.cx / TS), Math.floor(ny / TS)) && tileAtPx(e.cx, ny) !== '~') e.cy = ny;
    }
    e.dartT -= dt;
    const alive = e.fish.filter(f => !f.dead);
    if (e.dartT <= 0 && alive.length && d < 200) {
      e.dartT = 2.5; const f = pick(alive.filter(f => !f.dart && !f.tele) || alive); if (f) f.tele = 0.4;
    }
    for (const f of alive) {
      f.ph += dt;
      if (f.tele > 0) { f.tele -= dt; f.vx *= 0.8; f.vy *= 0.8; if (f.tele <= 0) { const a = Math.atan2(pc.y - f.y, pc.x - f.x); f.vx = Math.cos(a) * 150; f.vy = Math.sin(a) * 150; f.dart = 0.5; sfx('swim'); } }
      else if (f.dart > 0) { f.dart -= dt; }
      else {
        const tx = e.cx + Math.cos(f.ph * 2.3) * 9, ty = e.cy + Math.sin(f.ph * 3.1) * 6;
        f.vx += (tx - f.x) * 6 * dt; f.vy += (ty - f.y) * 6 * dt; f.vx *= 1 - 2 * dt; f.vy *= 1 - 2 * dt;
      }
      f.x += f.vx * dt; f.y += f.vy * dt;
      if (solidT(Math.floor(f.x / TS), Math.floor(f.y / TS))) { f.x -= f.vx * dt; f.y -= f.vy * dt; f.vx *= -0.5; f.vy *= -0.5; }
    }
    e.x = e.cx; e.y = e.cy + 12;
    e.state = alive.some(f => f.tele > 0) ? 'tele' : 'idle';
  },
  touch(e, p, pb) { for (const f of e.fish) if (!f.dead && f.dart > 0 && overlap(pb, { x: f.x - 3, y: f.y - 2, w: 6, h: 4 })) { hurtPlayer(f.x, f.y); return; } },
  draw: e => drawSwarm(e)
};
function swarmCheck(e) {
  if (e.fish.every(f => f.dead)) {
    e.dead = true; e.hp = 0;
    if (!G.st.got.has(e.key)) { G.st.got.add(e.key); for (let i = 0; i < 3; i++) spawn('bonuskibble', e.cx + rnd(-8, 8), e.cy + rnd(-4, 4), { vx: rnd(-60, 60), vy: rnd(-80, -20) }); }
  }
}
TYPES.pdog = {
  enemy: 1, hp: 6, w: 14, h: 14, drops: { heart: 0.15 },
  init(e) { e.state = 'patrol'; e.face = -1; e.vy = 0; },
  update(e, dt) {
    const p = G.p;
    const r = gravityStep(e, dt, 1200, 330);
    e.contact = e.state !== 'pant'; e.atkBox = null;
    if (e.state === 'patrol') {
      if (r.d) { if (edgeAhead(e, e.face)) e.face *= -1; else moveBody(e, e.face * 36 * dt, 0, { solids: false }); }
      if (p && !p.dead && Math.abs(p.x - e.x) < 64 && Math.abs(p.y - e.y) < 14 && canTele(e)) { e.state = 'tele'; e.t = 0; e.face = p.x < e.x ? -1 : 1; sfx('bark'); }
    } else if (e.state === 'tele') { if (e.t >= 0.5) { e.state = 'lunge'; e.t = 0; } }
    else if (e.state === 'lunge') {
      if (!edgeAhead(e, e.face)) { const m = moveBody(e, e.face * 224 * dt, 0, { solids: false }); if (m.l || m.r) e.t = 1; }
      if (e.t >= 0.25) { e.state = 'pant'; e.t = 0; }
    } else if (e.state === 'pant') { if (e.t >= 0.7) { e.state = 'patrol'; e.t = 0; } }
  },
  draw: e => drawPatrolDog(e), drawTop: e => drawBang(e)
};
TYPES.puppy = {
  enemy: 1, hp: 2, w: 10, h: 9, drops: { heart: 0.08 },
  init(e) { e.state = 'idle'; e.hopT = rnd(0.3, 1.0); e.vx = 0; e.vy = 0; },
  update(e, dt) {
    const r = gravityStep(e, dt, 1100, 330);
    if (e.vx) { const m = moveBody(e, e.vx * dt, 0, { solids: false }); if (m.l || m.r) e.vx = -e.vx * 0.5; }
    e.contact = true;
    if (e.state === 'idle') { if (r.d) { e.vx = 0; e.hopT -= dt; if (e.hopT <= 0) { e.state = 'squish'; e.t = 0; } } }
    else if (e.state === 'squish') {
      if (e.t >= 0.35) {
        const p = G.p; const dir = p && Math.abs(p.x - e.x) < 220 ? (p.x < e.x ? -1 : 1) : (Math.random() < 0.5 ? -1 : 1);
        e.face = dir; e.vx = 70 * dir; e.vy = -240; e.state = 'hop'; e.t = 0; sfx('yip', 1.3);
      }
    } else if (e.state === 'hop') { if (r.d && e.t > 0.05) { e.state = 'idle'; e.hopT = 0.65; e.vx = 0; } }
  },
  draw: e => drawPuppy(e)
};
TYPES.bdog = {
  enemy: 1, hp: 6, w: 14, h: 14, drops: { heart: 0.2 },
  init(e) { e.state = 'idle'; e.cd = rnd(0.8, 2.0); e.vy = 0; },
  update(e, dt) {
    gravityStep(e, dt, 1200, 330);
    const p = G.p; e.contact = true;
    if (p && e.state !== 'throw') e.face = p.x < e.x ? -1 : 1;
    if (e.state === 'idle') {
      e.cd -= dt;
      if (e.cd <= 0 && p && !p.dead && Math.abs(p.x - e.x) < 230 && Math.abs(p.y - e.y) < 200 && onScreen(e.x, e.y, -8) && canTele(e)) { e.state = 'tele'; e.t = 0; }
    } else if (e.state === 'tele') {
      if (e.t >= 0.5) { e.state = 'throw'; e.t = 0; spawn('ball', e.x + e.face * 8, e.y - 14, { vx: 110 * e.face, vy: -200 }); sfx('bark', 1.3); }
    } else if (e.state === 'throw') { if (e.t >= 0.3) { e.state = 'idle'; e.cd = 1.4; } }
  },
  draw: e => drawBallDog(e)
};
TYPES.ball = {
  hostile: 1, w: 6, h: 6, z: 5,
  init(e) { e.bounces = 0; e.life = 4; },
  update(e, dt) {
    e.life -= dt; if (e.life <= 0) { e.dead = true; return; }
    e.vy += 600 * dt;
    const r1 = moveBody(e, e.vx * dt, 0, { solids: false }); if (r1.l || r1.r) e.vx = -e.vx * 0.6;
    const r2 = moveBody(e, 0, e.vy * dt, { oneway: true, solids: false, plats: true });
    if (r2.d) { if (e.bounces < 2) { e.vy = -Math.abs(e.vy) * 0.6; e.bounces++; sfx('bonk', 2); } else { e.dead = true; puff(e.x, e.y - 3, 3, '#d0f040'); return; } }
    if (r2.u) e.vy = Math.abs(e.vy) * 0.5;
    e.contact = !e.friendly;
    if (e.friendly) {
      const b = boxOf(e);
      for (const o of G.ents) {
        if (o.dead || o.dying || !(TYPES[o.type].enemy || TYPES[o.type].boss) || o === e) continue;
        const hb = TYPES[o.type].hurt ? TYPES[o.type].hurt(o) : boxOf(o);
        if (hb && overlap(b, hb)) { damageEnemy(o, 3, sgn(e.vx), 'ball'); e.dead = true; sparkle(e.x, e.y, 8, '#d0f040'); return; }
      }
    }
  },
  bladeHit(e, box, a, p) {
    if (e.friendly || !overlap(box, boxOf(e))) return false;
    e.friendly = true; e.contact = false; e.vx = p.face * 230; e.vy = -150; e.bounces = 0; e.life = 3;
    sfx('tink'); sparkle(e.x, e.y - 3, 6, '#ffffff'); hitstop(3); e.hitBy = a.id;
    return true;
  },
  draw: e => drawTennisBall(e)
};
TYPES.bolt = {
  w: 6, h: 6, z: 6,
  init(e) { e.life = KYLO_CFG.life; },
  update(e, dt) {
    e.life -= dt; if (e.life <= 0) { e.dead = true; sparkle(e.x, e.y, 3, '#c0a0ff'); return; }
    const t = e.tgt;
    if (t && !t.dead && !t.dying) {
      const T = TYPES[t.type], tp = T.aim ? T.aim(t) : { x: t.x, y: t.y - t.h / 2 };
      const want = Math.atan2(tp.y - e.y, tp.x - e.x), cur = Math.atan2(e.vy, e.vx);
      let da = want - cur; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
      const na = cur + clamp(da, -KYLO_CFG.turn * dt, KYLO_CFG.turn * dt);
      e.vx = Math.cos(na) * KYLO_CFG.speed; e.vy = Math.sin(na) * KYLO_CFG.speed;
    }
    e.x += e.vx * dt; e.y += e.vy * dt;
    if (Math.random() < 0.5) part({ x: e.x, y: e.y, vx: 0, vy: 0, life: 0.2, col: '#c0a0ff', k: 'dot', sz: 1 });
    if (solidT(Math.floor(e.x / TS), Math.floor(e.y / TS))) { e.dead = true; sparkle(e.x, e.y, 4, '#c0a0ff'); return; }
    const b = { x: e.x - 3, y: e.y - 3, w: 6, h: 6 };
    for (const o of G.ents) {
      if (o.dead || o.dying) continue;
      const T = TYPES[o.type];
      if (T.boltHit) { if (T.boltHit(o, b)) { e.dead = true; return; } continue; }
      if (!(T.enemy || T.boss)) continue;
      if (T.targetable && !T.targetable(o)) continue;
      const hb = T.hurt ? T.hurt(o) : boxOf(o);
      if (hb && overlap(b, hb)) { damageEnemy(o, KYLO_CFG.dmg, sgn(e.vx), 'bolt'); e.dead = true; sparkle(e.x, e.y, 6, '#f0e070'); return; }
    }
  },
  draw: e => drawBolt(e)
};
TYPES.frock = {
  hostile: 1, w: 10, h: 10, z: 4,
  init(e) { e.state = 'warn'; e.t = 0; e.floorY = findFloor(e.x, e.y); },
  update(e, dt) {
    e.contact = false;
    if (e.state === 'warn') { if (Math.random() < 0.3) dust(e.x, e.y0 || e.y, 1); if (e.t >= 0.8) { e.state = 'fall'; e.t = 0; e.vy = 60; } }
    else if (e.state === 'fall') {
      e.vy = Math.min(e.vy + 700 * dt, 320); e.y += e.vy * dt; e.contact = true;
      if (e.y >= e.floorY) { e.dead = true; puff(e.x, e.floorY - 4, 5, '#8a8a9a'); sfx('land'); for (let i = 0; i < 3; i++) part({ x: e.x, y: e.floorY - 4, vx: rnd(-60, 60), vy: rnd(-120, -40), g: 500, life: 0.5, col: '#6a6a7a', sz: 2, k: 'dot' }); }
    }
  },
  draw: e => drawFallRock(e), drawTop: e => drawFallRockWarn(e)
};
function findFloor(x, y) {
  const tx = Math.floor(x / TS);
  for (let ty = Math.max(0, Math.floor(y / TS)); ty < G.lv.h; ty++) if (solidT(tx, ty)) return ty * TS;
  return G.lv.h * TS;
}
function dropRock(x) {
  const lv = G.lv, top = 2 * TS + 2;
  spawn('frock', x, top + 10, { y0: top });
}
TYPES.proj = {
  hostile: 1, w: 8, h: 8, z: 5,
  init(e) { e.life = e.life || 3; e.g = e.g || 0; },
  update(e, dt) {
    e.life -= dt; if (e.life <= 0) { e.dead = true; if (e.pop) { sparkle(e.x, e.y, 5, e.pop); sfx('pop'); } return; }
    e.vy += e.g * dt;
    if (e.drag) { e.vx *= 1 - e.drag * dt; e.vy *= 1 - e.drag * dt; }
    e.x += e.vx * dt; e.y += e.vy * dt;
    e.contact = true;
    if (e.solid !== false && solidT(Math.floor(e.x / TS), Math.floor((e.y - e.h / 2) / TS))) {
      if (e.bounce && (e.bounces || 0) < e.bounce) { e.bounces = (e.bounces || 0) + 1; e.y -= e.vy * dt; e.vy = -Math.abs(e.vy) * 0.6; }
      else { e.dead = true; puff(e.x, e.y - 4, 3, e.pcol || '#e0d0c0'); }
    }
  },
  draw: e => drawProj(e)
};
TYPES.ring = {
  hostile: 1, w: 4, h: 4, z: 3,
  init(e) { e.r = 0; },
  update(e, dt) {
    e.r = e.rmax * Math.min(1, e.t / e.dur);
    e.ring = { x: e.x, y: e.y, r0: Math.max(0, e.r - (e.thick || 10)), r1: e.r, push: e.push };
    if (e.t >= e.dur) e.dead = true;
  },
  draw: e => drawRingFx(e)
};
TYPES.wave = {
  hostile: 1, w: 12, h: 16, z: 3,
  update(e, dt) {
    e.x += e.vx * dt; e.contact = true; e.h = e.hh || 16;
    if (e.dist !== undefined) { e.dist -= Math.abs(e.vx) * dt; if (e.dist <= 0) e.dead = true; }
    if (solidT(Math.floor((e.x + sgn(e.vx) * 6) / TS), Math.floor((e.y - 4) / TS))) e.dead = true;
  },
  draw: e => drawWaveFx(e)
};
