function bossPick(e, list) {
  const h = e.hist || (e.hist = []);
  const ok = list.filter(k => !(h.length >= 2 && h[h.length - 1] === k && h[h.length - 2] === k));
  const k = pick(ok.length ? ok : list);
  h.push(k); if (h.length > 4) h.shift();
  return k;
}
function bossGap(e) { return e.p2 ? rnd(0.4, 0.7) : rnd(0.6, 1.0); }
function bSet(e, s) { e.state = s; e.t = 0; }
function faceP(e) { if (G.p) e.face = G.p.x < e.x ? -1 : 1; }
function swimMove(e, dt, max) {
  const s = Math.hypot(e.vx, e.vy); if (s > max) { e.vx *= max / s; e.vy *= max / s; }
  const r1 = moveBody(e, e.vx * dt, 0, { solids: false }); if (r1.l || r1.r) e.vx = 0;
  const r2 = moveBody(e, 0, e.vy * dt, { solids: false }); if (r2.u || r2.d) e.vy = 0;
  return !!(r1.l || r1.r || r2.u || r2.d);
}
function killHostiles() { for (const o of G.ents) if (!o.dead && TYPES[o.type].hostile) { o.dead = true; puff(o.x, o.y - 4, 3, '#e8e0d0'); } }
function surfaceBelow(x, y) {
  const tx = Math.floor(x / TS);
  for (let ty = Math.max(0, Math.floor(y / TS)); ty < G.lv.h; ty++) if (flagsAt(tx, ty) & 3) return ty * TS;
  return G.lv.h * TS;
}
function bossCenter(e) { return { x: e.x, y: e.y - e.h / 2 }; }
function defBoss(name, T) {
  T.boss = 1;
  const ch = T.canHit, tg = T.targetable;
  T.canHit = (e, src) => { const B = G.lv.boss; if (!B || B.phase !== 'fight' || e.hidden) return false; return ch ? ch(e, src) : true; };
  T.targetable = e => { const B = G.lv.boss; return !!B && B.phase === 'fight' && !e.hidden && (tg ? tg(e) : true); };
  if (!T.hurt) T.hurt = e => e.hidden ? null : boxOf(e);
  T.update = (e, dt) => {
    const B = G.lv.boss; if (!B) return;
    if (B.phase === 'fight') T.fight(e, dt);
    else {
      e.contact = false; e.atkBox = null; e.ring = null;
      if (B.phase === 'defeat') { if (T.dead) T.dead(e, dt); }
      else if (T.wait) T.wait(e, dt);
    }
  };
  TYPES[name] = T;
}
function landWait(e, dt) {
  e.hidden = false;
  if (e.y < 60) { e.y = 256; e.x = clamp(e.x, 48, 336); }
  gravityStep(e, dt, 1400, 400); e.vx = 0;
}

function bossArenaStart(A, opts) {
  const lv = G.lv;
  if (A.boss === 'chicken') lv.cage = spawn('cage', 346, 2 * TS, { who: 'kylo', len: 40 });
  if (A.boss === 'dozer') {
    spawn('prop', 110, 256, { spr: 'snacks' }); spawn('prop', 270, 256, { spr: 'snacks' }); spawn('prop', 42, 256, { spr: 'throne' });
    lv.cage = spawn('cage', 344, 2 * TS, { who: 'bella', len: 36 }); spawn('label', 344, 58, { text: 'sign_snack' });
  }
  const e = spawn(A.boss, A.bx, A.by);
  lv.boss = { phase: 'banner', t: 0, e, A, retry: !!opts.retry };
  G.bossHud = { name: A.name, hp: e.hp, max: e.maxHp, ghost: e.hp, ghostT: 0, flash: 0, show: 0 };
  showBanner(A.name, A.sub, 1.6);
  if (G.p) G.p.face = 1;
}
function bossIntroSteps(A, e) {
  if (A.boss === 'chicken') return [
    ['do', () => { e.face = 1; if (G.lv.cage) sparkle(G.lv.cage.x, G.lv.cage.y + 50, 10, '#c0a0ff'); }], ['wait', 0.6],
    ['do', () => { sfx('grumble'); shake(2, 0.5); }], ['say', 'ck_intro_1'],
    ['do', () => { e.turnT = 0.8; }], ['wait', 0.8], ['do', () => { e.face = -1; e.turnT = 0; sfx('grumble'); }], ['say', 'ck_intro_2']
  ];
  if (A.boss === 'dozer') return [['do', () => { e.intro = 1; }], ['say', 'dz_intro'], ['do', () => { e.intro = 0; }]];
  return [['say', A.intro]];
}
function bossFrameworkUpdate(dt) {
  const lv = G.lv, B = lv.boss, e = B.e, A = B.A, T = TYPES[e.type], H = G.bossHud;
  B.t += dt;
  if (H) {
    H.flash = Math.max(0, H.flash - dt);
    const hp = Math.max(0, e.hp);
    if (hp < H.hp) H.ghostT = 0.4;
    H.hp = hp;
    if (H.ghostT > 0) H.ghostT -= dt; else H.ghost = approach(H.ghost, H.hp, e.maxHp * 0.6 * dt);
    if (H.ghost < H.hp) H.ghost = H.hp;
    H.show = B.phase === 'banner' ? 0 : Math.min(1, H.show + dt * 3);
  }
  if (B.phase === 'banner') {
    if (B.t >= 1.6) { B.t = 0; if (B.retry) B.phase = 'ready'; else { B.phase = 'intro'; play(bossIntroSteps(A, e)); } }
  } else if (B.phase === 'intro') {
    if (!G.script && !G.dlg) { B.phase = 'ready'; B.t = 0; }
  } else if (B.phase === 'ready') {
    if (B.t >= 0.5) { B.phase = 'fight'; B.t = 0; bSet(e, 'idle'); e.gap = 0.6; if (T.start) T.start(e); }
  } else if (B.phase === 'fight') {
    if (e.hp <= 0) bossDefeat(B);
    else if (!e.p2 && e.hp <= e.maxHp / 2) {
      B.phase = 'phasing'; B.t = 0; e.flash = 0.3; e.atkBox = null; e.ring = null; e.contact = false;
      if (T.phaseReset) T.phaseReset(e);
      sfx('bossRoar'); sfx('phase'); shake(3, 0.5);
      if (A.boss === 'dozer') sfx('burp');
      floatText(LINES[A.phase], clamp(e.x, 110, W - 110), clamp(e.y - e.h - 18, 40, 220), PAL.warn, 1, 2.4);
      if (A.boss === 'chicken' || A.boss === 'polly' || A.boss === 'dozer') spawn('heart', 192, 44, { perm: true, fall: true });
    }
  } else if (B.phase === 'phasing') {
    if (Math.floor(B.t * 12) % 2 === 0) e.flash = 0.05;
    if (B.t >= 1.0) { e.p2 = true; B.phase = 'fight'; B.t = 0; e.hidden = false; bSet(e, 'idle'); e.gap = 0.4; }
  }
}
function bossDefeat(B) {
  const e = B.e, T = TYPES[e.type];
  B.phase = 'defeat'; B.t = 0; e.hp = 0; e.contact = false; e.atkBox = null; e.ring = null; e.hidden = false; e.dstate = 'hit'; bSet(e, 'dead');
  hitstop(12); G.slow = 0.35; G.slowT = 0.5; G.whiteFlash = 0.35;
  killHostiles(); music(''); sfx('victory'); shake(4, 0.4);
  puff(e.x, e.y - e.h / 2, 10, '#ffffff');
  if (G.st.bossesBeaten.indexOf(B.A.id) < 0) G.st.bossesBeaten.push(B.A.id);
  G.hp = PHYS.hp;
  play(T.defeat(e, B));
}
function drawBossTop(B) { }

TYPES.cage = {
  w: 30, h: 38, z: -3,
  init(e) { e.open = 0; e.quipT = rnd(4, 7); },
  update(e, dt) {
    const B = G.lv.boss;
    if (B && B.phase === 'fight' && !e.open && e.who === 'kylo') { e.quipT -= dt; if (e.quipT <= 0) { e.quipT = rnd(6, 9); floatText(pick(LINES.kylo_cage), e.x, e.y + e.len + 2, '#c8b8ff', 1, 1.6); } }
  },
  draw: e => drawCage(e)
};
TYPES.actor = {
  w: 10, h: 10, z: 7,
  init(e) { e.bob = e.bob || 0; },
  update(e, dt) {
    if (e.mv) {
      const m = e.mv, dx = m.x - e.x, dy = m.y - e.y, d = Math.hypot(dx, dy);
      if (d <= m.s * dt) { e.x = m.x; e.y = m.y; e.mv = null; e.moving = false; }
      else { e.x += dx / d * m.s * dt; e.y += dy / d * m.s * dt; e.moving = true; if (Math.abs(dx) > 1) e.face = dx < 0 ? -1 : 1; }
    }
    if (e.vx || e.vy) { e.x += (e.vx || 0) * dt; e.y += (e.vy || 0) * dt; }
    if (e.carry) { e.x = e.carry.x; e.y = e.carry.y - 14; e.face = e.carry.face; }
    if (e.shrink) { e.sT = (e.sT || 0) + dt; e.sc = Math.max(0.25, 1 - Math.floor(e.sT * 1.5) * 0.25); }
    if (e.life !== undefined) { e.life -= dt; if (e.life <= 0) e.dead = true; }
  },
  draw: e => drawActor(e)
};

defBoss('babyboo', {
  hp: 44, w: 26, h: 18,
  init(e) { e.face = -1; e.vx = 0; e.vy = 0; e.gap = 1; },
  wait(e, dt) { e.vx *= 0.9; e.vy *= 0.9; e.y += Math.sin(e.anim * 2) * 0.1; },
  fight(e, dt) {
    const pc = pCenter(), c = bossCenter(e);
    e.contact = e.state !== 'dizzy'; e.ring = null;
    switch (e.state) {
      case 'idle': {
        const tx = clamp(pc.x + (e.x > pc.x ? 90 : -90), 40, 344), ty = clamp(pc.y - 8, 60, 236);
        e.vx = damp(e.vx, (tx - c.x) * 1.5, 3, dt); e.vy = damp(e.vy, (ty - c.y) * 1.5, 3, dt);
        swimMove(e, dt, 70); faceP(e);
        e.gap -= dt;
        if (e.gap <= 0) {
          const k = bossPick(e, e.p2 ? ['lunge', 'kiss', 'spin'] : ['lunge', 'kiss']);
          bSet(e, k === 'lunge' ? 'cute' : k === 'kiss' ? 'pucker' : 'angry'); e.lunges = e.p2 ? 2 : 1; e.spun = false;
        }
        break;
      }
      case 'cute':
        e.vx *= 0.92; e.vy *= 0.92; swimMove(e, dt, 30); faceP(e);
        if (Math.random() < dt * 4) part({ x: c.x + rnd(-8, 8), y: c.y - 10, vx: rnd(-10, 10), vy: -30, life: 0.8, col: '#ff7ab0', k: 'heart' });
        if (e.t >= (e.p2 ? 0.6 : 1.2)) { bSet(e, 'evil'); sfx('zap', 0.6); }
        break;
      case 'evil':
        e.vx = 0; e.vy = 0; faceP(e);
        if (e.t >= 0.45) { const a = Math.atan2(pc.y - c.y, pc.x - c.x); e.dx = Math.cos(a); e.dy = Math.sin(a); e.face = e.dx < 0 ? -1 : 1; bSet(e, 'lunge'); sfx('swipe'); }
        break;
      case 'lunge':
        e.vx = e.dx * 260; e.vy = e.dy * 260;
        if (swimMove(e, dt, 260) || e.t >= 0.4) { e.lunges--; e.vx = 0; e.vy = 0; bSet(e, e.lunges > 0 ? 'evil' : 'dizzy'); if (e.state === 'evil') sfx('zap', 0.6); }
        break;
      case 'dizzy':
        e.vx *= 0.9; e.vy *= 0.9; swimMove(e, dt, 40);
        if (e.t >= (e.spun ? 1.2 : 1.0)) { bSet(e, 'idle'); e.gap = bossGap(e); }
        break;
      case 'pucker':
        e.vx *= 0.9; e.vy *= 0.9; swimMove(e, dt, 30); faceP(e);
        if (e.t >= 0.5) {
          const n = e.p2 ? 5 : 3, a0 = Math.atan2(pc.y - c.y, pc.x - c.x);
          for (let i = 0; i < n; i++) { const a = a0 + (i - (n - 1) / 2) * 0.35; spawn('proj', c.x + e.face * 10, c.y, { vx: Math.cos(a) * 70, vy: Math.sin(a) * 70, spr: 'p_hbub', w: 10, h: 10, life: 3, pop: '#ff8ac0' }); }
          sfx('bubble'); bSet(e, 'krec');
        }
        break;
      case 'krec':
        if (e.t >= 0.7) { bSet(e, 'idle'); e.gap = bossGap(e); }
        break;
      case 'angry':
        e.vx = 0; e.vy = 0;
        if (Math.random() < dt * 10) part({ x: c.x + rnd(-10, 10), y: c.y - 10, vx: rnd(-10, 10), vy: -30, life: 0.5, col: '#ffffff', k: 'puff', sz: 3 });
        if (e.t >= 0.6) { bSet(e, 'spin'); sfx('swipe3'); }
        break;
      case 'spin': {
        const d = dist(c.x, c.y, pc.x, pc.y) || 1;
        e.vx = (pc.x - c.x) / d * 60; e.vy = (pc.y - c.y) / d * 60; swimMove(e, dt, 60);
        e.ring = { x: e.x, y: e.y - 9, r0: 0, r1: 30 };
        if (Math.random() < dt * 20) part({ x: c.x + rnd(-30, 30), y: c.y + rnd(-30, 30), vx: 0, vy: 0, life: 0.3, col: '#f8b0d8', k: 'dot', sz: 2 });
        if (e.t >= 0.8) { e.ring = null; e.spun = true; bSet(e, 'dizzy'); }
        break;
      }
    }
  },
  dead(e, dt) {
    if (e.dstate === 'leave') { e.x += 70 * dt; e.y -= 20 * dt; e.face = 1; if (Math.random() < dt * 12) bubbleP(e.x - 10, e.y - 12, 1); }
    else { e.vx *= 0.9; e.vy *= 0.9; }
  },
  defeat(e) { return [['wait', 1.0], ['say', 'bb_defeat'], ['do', () => { e.dstate = 'leave'; sfx('bubble'); }], ['wait', 1.8], ['next']]; },
  draw: e => drawBabyboo(e), drawTop: e => drawBossTel(e)
});

defBoss('rover', {
  hp: 52, w: 28, h: 18,
  init(e) { e.face = -1; e.vx = 0; e.vy = 0; e.haT = 1; e.wx = e.x; e.wy = e.y; e.wT = 0; },
  wait(e, dt) { e.vx *= 0.9; e.vy *= 0.9; },
  phaseReset(e) { e.ghost = []; },
  fight(e, dt) {
    const pc = pCenter(), c = bossCenter(e), d = dist(c.x, c.y, pc.x, pc.y);
    e.contact = e.state !== 'laugh'; e.ring = null;
    e.haT -= dt;
    if (e.haT <= 0 && e.state !== 'laugh') { e.haT = rnd(0.8, 1.6); floatText('HA', e.x + rnd(-10, 10), e.y - 26, '#9ad0ff', 1, 0.8); if (Math.random() < 0.4) sfx('laugh', 1.2); }
    if (e.state === 'dash' && e.p2 && Math.random() < 0.6) (e.ghost = e.ghost || []).push({ x: e.x, y: e.y, t: 0, face: e.face });
    if (e.ghost) { for (const g of e.ghost) g.t += dt; e.ghost = e.ghost.filter(g => g.t < 0.2); }
    switch (e.state) {
      case 'idle':
        e.wT -= dt;
        if (e.wT <= 0) { e.wT = rnd(0.5, 0.9); e.wx = clamp(pc.x + rnd(-120, 120), 40, 344); e.wy = clamp(pc.y + rnd(-60, 60), 60, 236); }
        e.vx = damp(e.vx, (e.wx - c.x) * 2, 4, dt); e.vy = damp(e.vy, (e.wy - c.y) * 2, 4, dt);
        swimMove(e, dt, 110); e.face = e.vx < -5 ? -1 : e.vx > 5 ? 1 : e.face;
        e.gap -= dt;
        if (e.gap <= 0) {
          const list = ['dash', 'ha']; if (d < 50) list.push('whip', 'whip');
          const k = bossPick(e, list);
          e.vx = 0; e.vy = 0;
          if (k === 'dash') { e.dashes = e.p2 ? 4 : 3; e.fake = e.p2; rvAim(e); }
          else if (k === 'ha') { bSet(e, 'haha'); e.vol = e.p2 ? 2 : 1; }
          else { bSet(e, 'coil'); sfx('zap', 0.5); }
        }
        break;
      case 'aim':
        e.vx *= 0.8; e.vy *= 0.8;
        if (e.fake && e.t >= 0.3) { e.fake = false; bSet(e, 'blank'); break; }
        if (e.t >= 0.45) { bSet(e, 'dash'); sfx('swipe'); }
        break;
      case 'blank':
        if (e.t >= 0.12) rvAim(e);
        break;
      case 'dash':
        e.vx = e.dx * 320; e.vy = e.dy * 320;
        if (swimMove(e, dt, 320) || e.t >= 0.35) {
          e.vx = 0; e.vy = 0; e.dashes--;
          if (e.t < 0.35) { bubbleP(e.x, e.y - 9, 4); sfx('bonk'); }
          if (e.dashes > 0) rvAim(e); else { bSet(e, 'laugh'); sfx('laugh'); floatText('HAHAHA', e.x, e.y - 28, '#9ad0ff', 1, 1.2); }
        }
        break;
      case 'laugh':
        e.vx *= 0.9; e.vy *= 0.9; swimMove(e, dt, 30);
        if (Math.random() < dt * 3) sfx('laugh', 1.3);
        if (e.t >= (e.p2 ? 1.0 : 1.2)) { bSet(e, 'idle'); e.gap = bossGap(e); }
        break;
      case 'coil':
        faceP(e);
        if (e.t >= 0.45) { bSet(e, 'whip'); sfx('swipe3'); }
        break;
      case 'whip':
        e.ring = { x: e.x, y: e.y - 9, r0: 0, r1: 36 };
        if (e.t >= 0.3) { e.ring = null; bSet(e, 'wrec'); }
        break;
      case 'wrec':
        if (e.t >= 0.6) { bSet(e, 'idle'); e.gap = bossGap(e); }
        break;
      case 'haha':
        faceP(e);
        if (e.t >= 0.5) {
          const a0 = Math.atan2(pc.y - c.y, pc.x - c.x) + (e.vol === 1 && e.p2 ? 0.15 : 0);
          for (let i = 0; i < 5; i++) { const a = a0 + (i - 2) * 0.3; spawn('proj', c.x, c.y, { vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, txt: 'HA', w: 10, h: 8, life: 3.5, pop: '#9ad0ff' }); }
          sfx('laugh'); e.vol--;
          if (e.vol > 0) e.t = 0.1; else bSet(e, 'hrec');
        }
        break;
      case 'hrec':
        if (e.t >= 0.6) { bSet(e, 'idle'); e.gap = bossGap(e); }
        break;
    }
  },
  dead(e, dt) {
    if (e.dstate === 'leave') { e.y -= 30 * dt; if (Math.random() < dt * 4) floatText('HA', e.x + rnd(-8, 8), e.y - 20, '#9ad0ff', 1, 0.8); }
  },
  defeat(e) { return [['wait', 0.8], ['say', 'rv_defeat'], ['do', () => { e.dstate = 'leave'; sfx('laugh'); }], ['wait', 1.6], ['next']]; },
  draw: e => drawRover(e), drawTop: e => drawBossTel(e)
});
function rvAim(e) {
  const pc = pCenter(), c = bossCenter(e), a = Math.atan2(pc.y - c.y, pc.x - c.x);
  e.dx = Math.cos(a); e.dy = Math.sin(a); e.face = e.dx < 0 ? -1 : 1; bSet(e, 'aim'); sfx('menuMove', 0.7);
}

defBoss('cherry', {
  hp: 56, w: 30, h: 20,
  init(e) { e.face = -1; e.vx = 0; e.vy = 0; },
  wait(e, dt) { e.vx *= 0.9; e.vy *= 0.9; },
  dmgMul(e) { return e.state === 'stun' ? 1.25 : 1; },
  fight(e, dt) {
    const pc = pCenter(), c = bossCenter(e), d = dist(c.x, c.y, pc.x, pc.y);
    e.contact = e.state !== 'stun'; e.ring = null; e.atkBox = null;
    switch (e.state) {
      case 'idle': {
        const tx = clamp(pc.x + (e.x > pc.x ? 100 : -100), 60, 324);
        e.vx = damp(e.vx, (tx - c.x) * 1.2, 3, dt); e.vy = damp(e.vy, (pc.y - c.y) * 1.2, 3, dt);
        swimMove(e, dt, 50); faceP(e);
        e.gap -= dt;
        if (e.gap <= 0) {
          const list = ['charge', 'charge', 'plum']; if (d < 44) list.push('slap', 'slap');
          const k = bossPick(e, list); e.vx = 0; e.vy = 0; e.rico = false;
          if (k === 'charge') { bSet(e, 'snort'); sfx('grumble', 1.6); floatText('PLUM!', e.x, e.y - 30, PAL.warn, 1, 0.9); }
          else if (k === 'plum') { bSet(e, 'puff'); floatText('P...', e.x, e.y - 30, PAL.warn, 1, 0.6); }
          else bSet(e, 'back');
        }
        break;
      }
      case 'snort':
        faceP(e); e.vx = 0; e.vy = clamp((pc.y - c.y) * 4, -90, 90); swimMove(e, dt, 90);
        if (Math.random() < dt * 10) bubbleP(e.x + e.face * 14, e.y - 12, 1);
        if (e.t >= 0.6) { e.cdir = e.face; bSet(e, 'charge'); sfx('dash'); }
        break;
      case 'reflash':
        if (e.t >= 0.45) { e.cdir = -e.cdir; e.face = e.cdir; bSet(e, 'charge'); sfx('dash'); }
        break;
      case 'charge': {
        e.face = e.cdir;
        const r = moveBody(e, e.cdir * 280 * dt, 0, { solids: false });
        if (Math.random() < 0.5) bubbleP(e.x - e.cdir * 14, e.y - 10, 1);
        if (r.l || r.r) {
          shake(4, 0.3); sfx('slam'); puff(e.x + e.cdir * 15, e.y - 10, 8, '#d8f4ff');
          if (e.p2) { dropRock(clamp(pc.x + rnd(-30, 30), 40, 344)); dropRock(rnd(40, 344)); }
          if (e.p2 && !e.rico) { e.rico = true; bSet(e, 'reflash'); }
          else { bSet(e, 'stun'); floatText('OW', e.x, e.y - 28, '#ffffff', 1, 0.8); }
        }
        break;
      }
      case 'stun':
        if (e.t >= (e.p2 ? 1.6 : 2.0)) { bSet(e, 'idle'); e.gap = bossGap(e); }
        break;
      case 'puff':
        if (e.t >= 0.5) { spawn('ring', c.x, c.y, { rmax: 90, dur: 0.5, thick: 12, col: '#ff8090' }); floatText('PLUM!!!', e.x, e.y - 30, PAL.warn, 2, 1); sfx('bossRoar', 1.4); shake(2, 0.3); bSet(e, 'shout'); }
        break;
      case 'shout':
        if (e.t >= 0.6) { bSet(e, 'idle'); e.gap = bossGap(e); }
        break;
      case 'back':
        e.face = pc.x < e.x ? 1 : -1;
        if (e.t >= 0.45) { bSet(e, 'slap'); sfx('swipe'); }
        break;
      case 'slap':
        e.atkBox = { x: e.face > 0 ? e.x - 15 - 30 : e.x + 15, y: c.y - 10, w: 30, h: 20 };
        if (e.t >= 0.15) { e.atkBox = null; bSet(e, 'srec'); }
        break;
      case 'srec':
        if (e.t >= 0.5) { bSet(e, 'idle'); e.gap = bossGap(e); }
        break;
    }
  },
  dead(e, dt) {
    if (e.dstate === 'leave') { e.y += 40 * dt; e.x += e.face * 30 * dt; e.fade = Math.min(1, (e.fade || 0) + dt * 0.8); }
  },
  defeat(e) { return [['wait', 0.8], ['say', 'ch_defeat'], ['do', () => { e.dstate = 'leave'; sfx('grumble', 1.5); }], ['wait', 1.4], ['next']]; },
  draw: e => drawCherry(e), drawTop: e => drawBossTel(e)
});

defBoss('chicken', {
  hp: 84, w: 64, h: 40,
  init(e) { e.face = -1; e.vx = 0; e.floorY = e.y; },
  wait(e, dt) { e.y = approach(e.y, e.floorY, 200 * dt); },
  hurt(e) { return { x: e.x - 32, y: e.y - 40, w: 64, h: 40 }; },
  fight(e, dt) {
    const pc = pCenter(), dx = pc.x - e.x, spd = e.p2 ? 55 : 40;
    e.contact = !(e.state === 'stuck' || e.state === 'floor'); e.atkBox = null;
    switch (e.state) {
      case 'idle':
        faceP(e); moveBody(e, sgn(dx) * Math.min(20, Math.abs(dx)) * dt, 0, { solids: false });
        e.gap -= dt;
        if (e.gap <= 0) {
          const list = ['slam', 'lumber']; if (Math.abs(dx) < 110) list.push('bite', 'bite'); if (e.p2) list.push('groan');
          const k = bossPick(e, list);
          if (k === 'bite') { bSet(e, 'open'); sfx('grumble'); }
          else if (k === 'slam') { bSet(e, 'rise'); e.slams = e.p2 ? 2 : 1; e.riseT = 0.8; sfx('groan'); }
          else if (k === 'lumber') { bSet(e, 'lumber'); e.step = 0; }
          else { bSet(e, 'inhale'); sfx('groan', 1.3); }
        }
        break;
      case 'open':
        if (e.t >= 0.7) { bSet(e, 'bite'); sfx('crunch'); }
        break;
      case 'bite':
        moveBody(e, e.face * 300 * dt, 0, { solids: false });
        e.atkBox = { x: e.face > 0 ? e.x + 20 : e.x - 56, y: e.y - 36, w: 36, h: 30 };
        if (e.t >= 0.2) { e.atkBox = null; bSet(e, 'stuck'); }
        break;
      case 'stuck':
        if (e.t >= 1.2) { bSet(e, 'idle'); e.gap = bossGap(e); }
        break;
      case 'rise':
        e.y = e.floorY - 60 * ease(Math.min(1, e.t / e.riseT));
        if (Math.random() < dt * 14) part({ x: rnd(24, 360), y: 34, vx: 0, vy: rnd(30, 60), life: 1.2, col: '#8a9aa8', k: 'dot', sz: rndi(1, 2) });
        if (e.t >= e.riseT) bSet(e, 'drop');
        break;
      case 'drop':
        e.y = Math.min(e.floorY, e.y + 500 * dt);
        if (e.y >= e.floorY) {
          shake(4, 0.35); sfx('slam'); puff(e.x, e.floorY - 4, 10, '#8a9aa8');
          spawn('wave', e.x - 34, e.floorY, { vx: -150, hh: 16 }); spawn('wave', e.x + 34, e.floorY, { vx: 150, hh: 16 });
          const n = e.p2 ? 4 : 2; for (let i = 0; i < n; i++) dropRock(i === 0 ? clamp(pc.x, 40, 344) : rnd(40, 344));
          e.slams--;
          if (e.slams > 0) { e.riseT = 0.6; bSet(e, 'rise'); sfx('groan'); } else bSet(e, 'floor');
        }
        break;
      case 'floor':
        if (Math.random() < dt * 2) sfx('groan', 0.8);
        if (e.t >= 1.5) { bSet(e, 'idle'); e.gap = bossGap(e); }
        break;
      case 'lumber':
        faceP(e); moveBody(e, e.face * spd * dt, 0, { solids: false });
        e.step += dt; if (e.step >= 0.5) { e.step = 0; shake(1, 0.1); sfx('land'); dust(e.x + rnd(-20, 20), e.floorY, 3); }
        if (e.t >= 2) { bSet(e, 'idle'); e.gap = bossGap(e); }
        break;
      case 'inhale':
        if (e.t >= 0.6) { spawn('ring', e.x + e.face * 20, e.y - 24, { rmax: 110, dur: 1.0, thick: 14, push: 180, col: '#d8f4ff' }); sfx('grumble'); bSet(e, 'grec'); }
        break;
      case 'grec':
        if (e.t >= 0.5) { bSet(e, 'idle'); e.gap = bossGap(e); }
        break;
    }
  },
  dead(e, dt) {
    if (e.dstate === 'topple') { e.rot = Math.min(Math.PI, (e.rot || 0) + dt * 1.4 * (0.4 + (e.rot || 0))); if (e.rot >= Math.PI && !e.thud) { e.thud = 1; shake(4, 0.4); sfx('slam'); puff(e.x, e.y - 6, 12, '#d8f4ff'); } if (e.thud) e.sink = Math.min(10, (e.sink || 0) + dt * 6); }
  },
  defeat(e) {
    const lv = G.lv, cg = lv.cage;
    let ky = null, peb = null;
    return [
      ['wait', 0.3], ['do', () => { e.dstate = 'topple'; sfx('groan'); }], ['wait', 1.8],
      ['do', () => { sfx('burp'); bubbleP(e.x + e.face * 20, e.y - 20, 8); }], ['wait', 0.5], ['say', 'ck_defeat'],
      ['do', () => { if (cg) { cg.open = 1; sfx('gateOpen'); shake(2, 0.3); } ky = spawn('actor', cg ? cg.x : 300, cg ? cg.y + cg.len + 36 : 120, { spr: 'kylo_float', frames: 2, face: -1, bob: 1 }); ky.mv = { x: 250, y: 236, s: 50 }; }],
      ['until', () => ky && !ky.mv], ['do', () => { ky.spr = 'kylo_idle'; ky.frames = 2; ky.bob = 0; }],
      ['say', 'kylo_join_1'],
      ['do', () => { ky.spr = 'kylo_cast'; ky.frames = 0; peb = spawn('actor', 222, 254, { spr: 'p_pebble' }); sparkle(222, 250, 10, '#c0a0ff'); sfx('sparkle'); }], ['wait', 0.6],
      ['do', () => { peb.spr = 'minnow'; peb.frames = 2; peb.vx = -60; peb.vy = -20; peb.face = -1; peb.life = 4; sparkle(222, 250, 8, '#f0e070'); sfx('bubble'); ky.spr = 'kylo_idle'; ky.frames = 2; }], ['wait', 1.0],
      ['say', 'kylo_join_2'],
      ['do', () => { G.st.hasKylo = true; writeSave(); }], ['item', 'item_kylo'], ['next']
    ];
  },
  draw: e => drawChicken(e), drawTop: e => drawBossTel(e)
});

defBoss('polly', {
  hp: 70, w: 28, h: 20,
  init(e) { e.face = -1; e.vx = 0; e.vy = 0; },
  wait(e, dt) { landWait(e, dt); e.climb = 0; },
  phaseReset(e) { e.climb = 0; },
  fight(e, dt) {
    const p = G.p, pc = pCenter(), zs = e.p2 ? 180 : 140;
    e.contact = e.state !== 'pant'; e.climb = e.state === 'climb' || e.state === 'bark' ? e.climb : 0;
    switch (e.state) {
      case 'idle': {
        gravityStep(e, dt, 1400, 400);
        const r = moveBody(e, e.face * zs * dt, 0, { solids: false });
        if (r.l || r.r) e.face *= -1;
        if (Math.random() < dt * 14) dust(e.x - e.face * 10, e.y, 1);
        e.gap -= dt;
        if (e.gap <= 0) {
          const k = bossPick(e, e.p2 ? ['charge', 'pounce', 'twister'] : ['charge', 'pounce']);
          if (k === 'charge') { bSet(e, 'crouch'); faceP(e); sfx('bark'); }
          else if (k === 'pounce') { bSet(e, 'toWall'); e.wdir = e.x < 192 ? -1 : 1; e.face = e.wdir; }
          else { bSet(e, 'spin'); sfx('wind'); }
        }
        break;
      }
      case 'crouch':
        faceP(e); gravityStep(e, dt, 1400, 400);
        if (e.t >= 0.6) {
          const a = 0.6; e.vx = e.face * Math.cos(a) * 300; e.vy = -Math.sin(a) * 300; e.bounces = 0; bSet(e, 'pin'); sfx('dash');
        }
        break;
      case 'pin': {
        const r1 = moveBody(e, e.vx * dt, 0, { solids: false }); if (r1.l || r1.r) { e.vx = -e.vx; e.bounces++; sfx('bonk'); shake(1, 0.1); }
        const r2 = moveBody(e, 0, e.vy * dt, { solids: false }); if (r2.u || r2.d) { e.vy = -e.vy; e.bounces++; sfx('bonk'); dust(e.x, e.y, 3); }
        e.face = e.vx < 0 ? -1 : 1;
        if (Math.random() < 0.5) part({ x: e.x, y: e.y - 10, vx: 0, vy: 0, life: 0.2, col: '#3a3a4a', k: 'puff', sz: 3 });
        if (e.bounces >= (e.p2 ? 5 : 3)) { e.vx *= 0.3; e.vy = Math.max(0, e.vy); bSet(e, 'fall'); }
        break;
      }
      case 'fall': {
        const r = gravityStep(e, dt, 1400, 400); moveBody(e, e.vx * dt, 0, { solids: false });
        if (r.d) { e.vx = 0; bSet(e, 'pant'); dust(e.x, e.y, 4); }
        break;
      }
      case 'pant':
        gravityStep(e, dt, 1400, 400);
        if (e.t >= (e.p2 ? 1.1 : 1.4)) { bSet(e, 'idle'); e.gap = bossGap(e); e.face = pc.x < e.x ? 1 : -1; }
        break;
      case 'toWall': {
        gravityStep(e, dt, 1400, 400);
        const r = moveBody(e, e.wdir * zs * 1.2 * dt, 0, { solids: false });
        if (Math.random() < dt * 14) dust(e.x - e.face * 10, e.y, 1);
        if (r.l || r.r) { bSet(e, 'climb'); e.climb = e.wdir; }
        break;
      }
      case 'climb':
        e.y -= 240 * dt; e.climb = e.wdir;
        if (e.y <= 104) { e.y = 104; bSet(e, 'bark'); sfx('bark'); floatText('WOOF!', e.x, e.y - 30, PAL.warn, 1, 0.6); }
        break;
      case 'bark':
        e.climb = e.wdir;
        if (e.t >= 0.5) {
          const T = 0.75, g = 1200, tx = clamp(p.x, 40, 344), ty = p.y;
          e.x -= e.wdir * 4; e.vx = (tx - e.x) / T; e.vy = (ty - e.y - 0.5 * g * T * T) / T; e.climb = 0; e.face = e.vx < 0 ? -1 : 1; bSet(e, 'leap'); sfx('jump');
        }
        break;
      case 'leap': {
        e.vy = Math.min(e.vy + 1200 * dt, 500);
        const r1 = moveBody(e, e.vx * dt, 0, { solids: false }); if (r1.l || r1.r) e.vx = 0;
        const r2 = moveBody(e, 0, e.vy * dt, { oneway: true, solids: false }); if (r2.u) e.vy = 0;
        if (r2.d && e.vy > 0) { e.vy = 0; e.vx = 0; puff(e.x, e.y - 2, 6, '#e8e0d0'); sfx('land'); shake(1, 0.1); bSet(e, 'prec'); }
        break;
      }
      case 'prec':
        gravityStep(e, dt, 1400, 400);
        if (e.t >= 0.8) { bSet(e, 'idle'); e.gap = bossGap(e); }
        break;
      case 'spin':
        gravityStep(e, dt, 1400, 400);
        if (e.t >= 0.5) { faceP(e); spawn('wave', e.x + e.face * 16, e.y, { vx: e.face * 200, hh: 20, kind: 'twister' }); sfx('wind'); bSet(e, 'trec'); }
        break;
      case 'trec':
        gravityStep(e, dt, 1400, 400);
        if (e.t >= 0.8) { bSet(e, 'idle'); e.gap = bossGap(e); }
        break;
    }
  },
  dead(e, dt) { gravityStep(e, dt, 1400, 400); e.climb = 0; if (e.dstate === 'flop' && Math.random() < dt * 1.2) floatText('Z', e.x + 8, e.y - 20, '#e8e8ff', 1, 1); },
  defeat(e) { return [['wait', 0.8], ['do', () => { e.dstate = 'flop'; sfx('snore'); }], ['say', 'po_defeat'], ['wait', 1.4], ['next']]; },
  draw: e => drawPolly(e), drawTop: e => drawBossTel(e)
});

defBoss('lola', {
  hp: 66, w: 12, h: 11,
  init(e) { e.face = -1; e.vx = 0; e.vy = 0; e.hopT = 0.5; },
  wait(e, dt) { landWait(e, dt); },
  fight(e, dt) {
    const p = G.p, pc = pCenter(), d = dist(e.x, e.y, pc.x, pc.y);
    e.contact = !(e.state === 'stuck' || e.hidden); e.atkBox = null; e.ring = null;
    switch (e.state) {
      case 'idle': {
        const r = gravityStep(e, dt, 1500, 500); faceP(e);
        if (r.d) { e.hopT -= dt; if (e.hopT <= 0) { e.hopT = 0.6; e.vy = -150; } }
        e.gap -= dt;
        if (e.gap <= 0 && r.d) {
          const list = ['pounce', 'pounce', 'hops']; if (d < 110) list.push('yip');
          const k = bossPick(e, list);
          if (k === 'pounce') { e.pounces = e.p2 ? 2 : 1; e.trackDur = 0.8; bSet(e, 'jumpup'); e.vy = -620; sfx('jump'); floatText('BOING!', e.x, e.y - 22, PAL.gold, 1, 0.8); }
          else if (k === 'hops') { bSet(e, 'crouch'); e.hops = e.p2 ? 4 : 3; }
          else { bSet(e, 'ears'); sfx('grumble', 2.5); }
        }
        break;
      }
      case 'jumpup':
        e.y += e.vy * dt;
        if (e.y < -40) { e.hidden = true; bSet(e, 'track'); e.sx = clamp(p.x, 24, 360); e.sy = surfaceBelow(e.sx, p.y - 2); }
        break;
      case 'track':
        e.hidden = true; e.sx = clamp(p.x, 24, 360); e.sy = surfaceBelow(e.sx, p.y - 2);
        if (e.t >= e.trackDur) { bSet(e, 'lock'); sfx('zap', 0.7); }
        break;
      case 'lock':
        e.hidden = true;
        if (e.t >= 0.4) { e.x = e.sx; e.y = -20; e.hidden = false; bSet(e, 'slam'); sfx('swipe3'); }
        break;
      case 'slam':
        e.y += 500 * dt;
        if (e.y >= e.sy) {
          e.y = e.sy; shake(3, 0.2); sfx('slam'); puff(e.x, e.y - 3, 10, '#e8e0d0');
          e.atkBox = { x: e.x - 20, y: e.y - 12, w: 40, h: 12 };
          if (e.p2) for (const s of [-1, 1]) spawn('proj', e.x + s * 6, e.y - 6, { vx: s * rnd(60, 100), vy: -rnd(200, 260), g: 900, spr: 'p_pebble', w: 6, h: 6, life: 2.2, bounce: 2 });
          e.pounces--;
          if (e.pounces > 0) { e.trackDur = 0.6; bSet(e, 'rehop'); }
          else bSet(e, 'stuck');
        }
        break;
      case 'rehop':
        e.atkBox = e.t < 0.1 ? { x: e.x - 20, y: e.y - 12, w: 40, h: 12 } : null;
        if (e.t >= 0.25) { bSet(e, 'jumpup'); e.vy = -620; sfx('jump'); floatText('BOING!', e.x, e.y - 22, PAL.gold, 1, 0.8); }
        break;
      case 'stuck':
        e.atkBox = e.t < 0.1 ? { x: e.x - 20, y: e.y - 12, w: 40, h: 12 } : null;
        if (e.t >= (e.p2 ? 1.0 : 1.2)) { bSet(e, 'idle'); e.gap = bossGap(e); e.vy = -200; }
        break;
      case 'crouch':
        gravityStep(e, dt, 1500, 500); faceP(e);
        if (e.t >= 0.45) { bSet(e, 'hop'); e.vy = -260; e.face = p.x < e.x ? -1 : 1; e.vx = e.face * 170; sfx('yip'); }
        break;
      case 'hop': {
        const r = gravityStep(e, dt, 1500, 500);
        const m = moveBody(e, e.vx * dt, 0, { solids: false }); if (m.l || m.r) e.vx = -e.vx;
        if (r.d && e.t > 0.05) {
          dust(e.x, e.y, 2); e.hops--;
          if (e.hops > 0) { e.t = 0; e.vy = -260; e.face = p.x < e.x ? -1 : 1; e.vx = e.face * 170; sfx('yip', 1.2); }
          else { e.vx = 0; bSet(e, 'hrec'); }
        }
        break;
      }
      case 'hrec':
        gravityStep(e, dt, 1500, 500);
        if (e.t >= 0.6) { bSet(e, 'idle'); e.gap = bossGap(e); }
        break;
      case 'ears':
        gravityStep(e, dt, 1500, 500);
        if (e.t >= 0.5) { spawn('ring', e.x, e.y - 6, { rmax: 60, dur: 0.3, thick: 14, col: '#fff0a0' }); floatText('YIP!', e.x, e.y - 22, PAL.gold, 1, 0.8); sfx('yip'); bSet(e, 'yrec'); }
        break;
      case 'yrec':
        gravityStep(e, dt, 1500, 500);
        if (e.t >= 0.5) { bSet(e, 'idle'); e.gap = bossGap(e); }
        break;
    }
  },
  dead(e, dt) { landWait(e, dt); },
  defeat(e) { return [['wait', 0.9], ['do', () => { e.dstate = 'sit'; }], ['say', 'lo_defeat'], ['wait', 0.3], ['say', 'reveal'], ['next']]; },
  draw: e => drawLola(e), drawTop: e => drawBossTel(e)
});

defBoss('dozer', {
  hp: 110, w: 64, h: 52,
  init(e) { e.face = -1; e.vx = 0; e.vy = 0; e.since = 0; e.sinceRoll = 0; },
  wait(e, dt) { if (e.rolling) dzUnroll(e); landWait(e, dt); },
  deflect(e) { return !!e.rolling; },
  dmgMul(e) { return e.state === 'snack' ? 1.5 : 1; },
  onHit(e, dmg, dir, src) { if (e.rolling) floatText('BOING', e.x, e.y - 40, '#ffffff', 1, 0.6); },
  fight(e, dt) {
    const p = G.p, pc = pCenter();
    e.contact = !(e.state === 'dizzy' || e.state === 'wheeze' || e.state === 'snack' || e.state === 'sit' || e.hidden); e.atkBox = null;
    switch (e.state) {
      case 'idle': {
        gravityStep(e, dt, 1400, 400); faceP(e);
        const dx = pc.x - e.x; if (Math.abs(dx) > 70) moveBody(e, sgn(dx) * 22 * dt, 0, { solids: false });
        e.gap -= dt;
        if (e.gap <= 0) {
          let k;
          if (e.since >= 3) k = 'snack';
          else if (e.sinceRoll >= 3) k = 'roll';
          else k = bossPick(e, ['roll', 'slam', 'crumbs']);
          if (k !== 'snack') { e.since++; if (k === 'roll') e.sinceRoll = 0; else e.sinceRoll++; }
          if (k === 'roll') { e.rdir = e.x < 192 ? 1 : -1; e.back = false; bSet(e, 'tuck'); e.tuckT = 1.0; dzRoll(e); sfx('roll'); }
          else if (k === 'slam') { bSet(e, 'jump'); e.vy = -720; sfx('groan'); }
          else if (k === 'crumbs') { bSet(e, 'lick'); }
          else { bSet(e, 'sit'); e.since = 0; floatText(LINES.snack_time, e.x, e.y - 70, PAL.gold, 1, 1.4); sfx('pop'); }
        }
        break;
      }
      case 'tuck':
        e.face = e.rdir;
        if (Math.random() < dt * 20) dust(e.x + rnd(-20, 20), e.y, 1);
        if (Math.floor(e.t * 10) !== Math.floor((e.t - dt) * 10)) sfx('roll', 0.8);
        if (e.t >= e.tuckT) { bSet(e, 'roll'); sfx('roll'); }
        break;
      case 'roll': {
        const r = moveBody(e, e.rdir * 240 * dt, 0, { solids: false });
        e.rot = (e.rot || 0) + e.rdir * 240 * dt / 24;
        if (Math.random() < dt * 20) dust(e.x - e.rdir * 20, e.y, 1);
        if (r.l || r.r) {
          shake(5, 0.4); sfx('slam'); puff(e.x + e.rdir * 24, e.y - 16, 8, '#e8e0d0');
          if (e.p2 && !e.back) { e.back = true; e.rdir = -e.rdir; bSet(e, 'tuck'); e.tuckT = 0.5; sfx('roll'); }
          else { dzUnroll(e); bSet(e, 'dizzy'); floatText('@#%!', e.x, e.y - 60, '#ffffff', 1, 0.8); }
        }
        break;
      }
      case 'dizzy':
        gravityStep(e, dt, 1400, 400);
        if (e.t >= 1.2) { bSet(e, 'idle'); e.gap = bossGap(e); }
        break;
      case 'jump':
        e.y += e.vy * dt;
        if (e.y < -90) { e.hidden = true; bSet(e, 'strack'); e.sx = clamp(p.x, 48, 336); }
        break;
      case 'strack':
        e.hidden = true; e.sx = clamp(p.x, 48, 336);
        if (e.t >= (e.p2 ? 0.8 : 1.0)) { bSet(e, 'slock'); sfx('zap', 0.5); }
        break;
      case 'slock':
        e.hidden = true;
        if (e.t >= 0.4) { e.x = e.sx; e.y = -60; e.hidden = false; e.vy = 700; bSet(e, 'fall'); }
        break;
      case 'fall':
        e.y += e.vy * dt;
        if (e.y >= 256) {
          e.y = 256; shake(5, 0.35); sfx('slam'); puff(e.x, e.y - 4, 12, '#e8e0d0');
          spawn('wave', e.x - 36, 256, { vx: -150, hh: 12, dist: 80 }); spawn('wave', e.x + 36, 256, { vx: 150, hh: 12, dist: 80 });
          bSet(e, 'wheeze');
        }
        break;
      case 'wheeze':
        gravityStep(e, dt, 1400, 400);
        if (Math.random() < dt * 2) sfx('groan', 1.2);
        if (e.t >= 1.4) { bSet(e, 'idle'); e.gap = bossGap(e); }
        break;
      case 'sit':
        gravityStep(e, dt, 1400, 400);
        if (e.t >= 0.5) bSet(e, 'snack');
        break;
      case 'snack':
        gravityStep(e, dt, 1400, 400);
        if (Math.floor(e.t / 0.35) !== Math.floor((e.t - dt) / 0.35)) { sfx('crunch'); part({ x: e.x + e.face * 18, y: e.y - 36, vx: rnd(-40, 40), vy: rnd(-60, -20), g: 300, life: 0.6, col: PAL.dozer.crumb, k: 'dot', sz: 2 }); }
        if (e.t >= (e.p2 ? 2.2 : 3.0)) { bSet(e, 'idle'); e.gap = bossGap(e); sfx('burp'); }
        break;
      case 'lick':
        gravityStep(e, dt, 1400, 400); faceP(e);
        if (e.t >= 0.5) {
          const n = e.p2 ? 5 : 3, T = 0.9, sx = e.x + e.face * 20, sy = e.y - 44;
          for (let i = 0; i < n; i++) {
            const tx = clamp(p.x + (i - (n - 1) / 2) * 36, 24, 360);
            spawn('proj', sx, sy, { vx: (tx - sx) / T, vy: (p.y - 4 - sy - 0.5 * 600 * T * T) / T, g: 600, spr: 'p_crumb', w: 6, h: 6, life: 3, pcol: '#d8a860' });
          }
          sfx('swipe'); bSet(e, 'crec');
        }
        break;
      case 'crec':
        gravityStep(e, dt, 1400, 400);
        if (e.t >= 0.6) { bSet(e, 'idle'); e.gap = bossGap(e); }
        break;
    }
  },
  dead(e, dt) {
    if (e.dstate === 'hit') { if (e.rolling) dzUnroll(e); gravityStep(e, dt, 1400, 400); }
    else if (e.dstate === 'roll') {
      if (!e.rolling) dzRoll(e);
      const r = moveBody(e, -60 * dt, 0, { solids: false }); e.rot = (e.rot || 0) - 60 * dt / 24; e.face = -1;
      if (r.l || e.x <= 86) { e.dstate = 'flopped'; dzUnroll(e); e.x = Math.max(e.x, 86); shake(2, 0.2); sfx('bonk'); }
    } else gravityStep(e, dt, 1400, 400);
  },
  defeat(e) {
    return [
      ['wait', 0.8], ['do', () => { e.dstate = 'roll'; sfx('roll'); }], ['until', () => e.dstate === 'flopped'], ['wait', 0.5],
      ['do', () => { spawn('actor', e.x - 6, e.y - 58, { spr: 'key', vy: -40, life: 1.2 }); sfx('pop'); sparkle(e.x - 6, e.y - 58, 10, PAL.gold); }], ['wait', 0.8],
      ['say', 'dz_defeat'], ['item', 'item_key'], ['next']
    ];
  },
  draw: e => drawDozer(e), drawTop: e => drawBossTel(e)
});
function dzRoll(e) { e.rolling = true; e.w = 48; e.h = 32; e.rot = 0; }
function dzUnroll(e) { e.rolling = false; e.w = 64; e.h = 52; unstick(e); }
