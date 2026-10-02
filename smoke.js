const vm = require('vm'), fs = require('fs');
const code = fs.readFileSync(__dirname + '/check.js', 'utf8');
const logs = [];
function noop() { }
function mkCtx(cv) {
  const t = {
    canvas: cv, globalAlpha: 1, fillStyle: '#000', imageSmoothingEnabled: true,
    getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h }),
    createImageData: (w, h) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h }),
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
    drawImage(img) { if (!img || !(img.width > 0)) throw new Error('drawImage bad image'); for (let i = 1; i < arguments.length; i++) if (!isFinite(arguments[i])) throw new Error('drawImage non-finite arg ' + i); },
    fillRect(x, y, w, h) { if (!isFinite(x) || !isFinite(y) || !isFinite(w) || !isFinite(h)) throw new Error('fillRect non-finite ' + [x, y, w, h]); }
  };
  return new Proxy(t, { get(o, k) { if (k in o) return o[k]; return noop; }, set(o, k, v) { o[k] = v; return true; } });
}
function mkCanvas() { const cv = { width: 300, height: 150, style: {}, getContext() { return cv._c || (cv._c = mkCtx(cv)); }, addEventListener: noop }; return cv; }
const mainCv = mkCanvas();
const listeners = {};
const store = {};
let rafCb = null;
const audioNode = () => new Proxy({ gain: { value: 1, setValueAtTime: noop, linearRampToValueAtTime: noop, exponentialRampToValueAtTime: noop, cancelScheduledValues: noop }, frequency: { value: 1, setValueAtTime: noop, linearRampToValueAtTime: noop, exponentialRampToValueAtTime: noop }, Q: { value: 1, setValueAtTime: noop }, detune: { value: 0, setValueAtTime: noop }, connect() { return audioNode(); } }, { get(o, k) { if (k in o) return o[k]; return noop; }, set(o, k, v) { o[k] = v; return true; } });
class AC { constructor() { this.currentTime = 0; this.sampleRate = 44100; this.destination = audioNode(); this.state = 'running'; } createGain() { return audioNode(); } createOscillator() { return audioNode(); } createBiquadFilter() { return audioNode(); } createBufferSource() { return audioNode(); } createBuffer(c, n) { return { getChannelData: () => new Float32Array(n) }; } resume() { return Promise.resolve(); } }
const sandbox = {
  console: { log: (...a) => logs.push(['log', a.join(' ')]), warn: (...a) => logs.push(['warn', a.join(' ')]), error: (...a) => logs.push(['error', a.join(' ')]), info: noop },
  document: { getElementById: () => mainCv, createElement: () => mkCanvas(), body: {} },
  location: { hash: '#debug' },
  innerWidth: 1280, innerHeight: 900,
  addEventListener: (n, f) => { (listeners[n] = listeners[n] || []).push(f); },
  requestAnimationFrame: f => { rafCb = f; return 1; },
  performance: { now: () => 0 },
  localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
  AudioContext: AC, webkitAudioContext: AC,
  Math, Date, JSON, Set, Map, Array, Object, String, Number, Uint8Array, Uint8ClampedArray, Float32Array, Proxy, Promise, Error, isFinite
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: 'check.js' });
const R = s => vm.runInContext(s, sandbox);
R(`var __miss = new Set();
for (const fn of ['spr', 'sprT', 'sprC', 'sprR']) { }
const __spr = spr; spr = function (n, ...a) { if (!SPR[n]) __miss.add(n); return __spr(n, ...a); };
const __sprT = sprT; sprT = function (n, ...a) { if (!SPR[n]) __miss.add(n); return __sprT(n, ...a); };
const __sprC = sprC; sprC = function (n, ...a) { if (!SPR[n]) __miss.add(n); return __sprC(n, ...a); };
const __sprR = sprR; sprR = function (n, ...a) { if (!SPR[n]) __miss.add(n); return __sprR(n, ...a); };`);
for (const k in R('SPEAKERS')) { const s = R('SPEAKERS')[k].spr; if (!R('SPR')[s]) console.log('MISSING PORTRAIT', k, s); }
for (const k in R('ITEM_SPR')) { const s = R('ITEM_SPR')[k]; if (!R('SPR')[s]) console.log('MISSING ITEM SPR', s); }

let now = 1000, frames = 0;
function key(code, down) { for (const f of (listeners[down ? 'keydown' : 'keyup'] || [])) f({ code, repeat: false, preventDefault: noop }); }
function tap(code) { key(code, true); key(code, false); }
function step(n, each) {
  for (let i = 0; i < n; i++) {
    if (each) each(i);
    now += 1000 / 60; frames++;
    const cb = rafCb; rafCb = null;
    try { cb(now); } catch (e) { console.log('ERROR at frame', frames, 'area', R('G.areaId'), R('G.sceneName'), '\n', e.stack); process.exit(1); }
    const bad = logs.filter(l => l[0] !== 'log'); if (bad.length) { console.log('CONSOLE', bad); process.exit(1); }
  }
}
function until(fn, max, each) { for (let i = 0; i < max; i++) { if (fn()) return i; step(1, each); } return -1; }
const area = () => R('G.areaId');
const monkey = i => {
  const r = Math.random();
  if (i % 7 === 0) tap(r < 0.5 ? 'KeyJ' : 'KeyZ');
  if (i % 23 === 0) tap('KeyK');
  if (i % 11 === 0) tap('Space');
  if (i % 90 === 0) { key('KeyD', r < 0.6); key('KeyA', r >= 0.6 && r < 0.8); key('KeyW', r < 0.3); key('KeyS', r > 0.85); }
};
function releaseAll() { for (const k of ['KeyD', 'KeyA', 'KeyW', 'KeyS', 'Enter', 'ShiftLeft', 'Space']) key(k, false); }
function toTitle() { releaseAll(); R(`loadArea('title')`); step(20); }
function jump(i, shift) {
  toTitle();
  if (shift) key('ShiftLeft', true);
  tap(i === 9 ? 'Digit0' : 'Digit' + (i + 1));
  step(2);
  if (shift) key('ShiftLeft', false);
  step(30);
}

step(30);
console.log('title ok, scene', R('G.sceneName'));
tap('Enter'); step(5);
step(40);
console.log('new game ->', area());

let t0 = until(() => !R('G.script'), 60 * 60, i => { if (i % 10 === 0) tap('KeyJ'); });
console.log('intro done in', t0, 'frames; introDone', R('G.flags.introDone'));
R(`G.p.x = 200; G.p.y = 104; applyFace(G.p, 'r')`);
step(2);
console.log('pre-talk', R(`JSON.stringify({ ctrl: playerCtrl(G.p), tt: talkTarget(G.p) && talkTarget(G.p).type, lock: G.p.lock, walkTo: G.p.walkTo, dlg: !!G.dlg, fade: G.fadeState, x: G.p.x, y: G.p.y })`));
tap('KeyJ');
console.log('pressed', R('JSON.stringify(pressed)'), R('tapped("attack")'));
step(1);
console.log('after 1', R(`JSON.stringify({ atk: G.p.atk && G.p.atk.k, buf: G.p.atkBuf, script: !!G.script, dlg: !!G.dlg, sc: G.sceneName, paused: G.paused })`));
step(1);
console.log('sugar talk script', !!R('G.script'));
until(() => !R('G.script'), 60 * 60, i => { if (i % 10 === 0) tap('KeyJ'); });
until(() => !R('G.dlg'), 600, i => { if (i % 10 === 0) tap('KeyJ'); });
console.log('weapon', R('G.st.hasWeapon'), 'helmet', R('G.st.hasHelmet'), 'door', R('G.flags.doorOpen'), 'dyn', R(`(() => { let n = 0; for (let i = 0; i < G.lv.dyn.length; i++) n += G.lv.dyn[i]; return n; })()`));
R(`G.p.x = 144; G.p.y = 200`); step(1); key('KeyS', true); step(60); key('KeyS', false);
console.log('walked through door y', R('G.p.y'), R(`JSON.stringify({ ctrl: playerCtrl(G.p), script: !!G.script, dlg: !!G.dlg, walkTo: G.p.walkTo, keys: keys.KeyS, vy: G.p.vy, fl: [flagsAt(8, 12), flagsAt(9, 12), flagsAt(8, 13), flagsAt(9, 13), flagsAt(8, 14)] })`));
R(`G.p.x = 30 * 16 + 8; G.p.y = 27 * 16 + 10`);
until(() => area() !== 'cat_country', 60 * 30, i => { if (i % 10 === 0) tap('KeyJ'); });
console.log('dock ->', area());

function runSide(id) {
  const lv = R('G.lv');
  const rooms = R('G.lv.rooms.length');
  for (let r = 0; r < rooms; r++) {
    R(`(() => { const r = G.lv.rooms[${r}]; G.p.x = r.x * 16 + 12 * 16; G.p.y = r.y * 16 + 9 * 16; G.p.vx = 0; G.p.vy = 0; unstick(G.p); })()`);
    step(90, monkey);
    let st = R(`G.lv.rooms[${r}].state`);
    let guard = 0;
    while (st === 'fight' && guard++ < 20) { tap('KeyN'); step(30); st = R(`G.lv.rooms[${r}].state`); }
    if (R('G.death')) { step(60); tap('KeyJ'); step(40); }
  }
  step(200, monkey);
  if (R('G.death')) { step(60); tap('KeyJ'); step(40); }
  step(30);
  if (area() !== id) { console.log(id, 'exited early ->', area()); return; }
  const before = area();
  R(`(() => { const x = G.lv.exits[0]; G.p.x = x.x + 8; G.p.y = x.y + 14; G.p.vx = 0; G.p.vy = 0; })()`);
  const n = until(() => area() !== before, 600, i => { if (i % 10 === 0) tap('KeyJ'); if (i % 30 === 0 && area() === before && R('G.p') && R('G.lv.exits.length')) R(`(() => { const x = G.lv.exits[0]; G.p.x = x.x + 8; G.p.y = x.y + 14; })()`); });
  console.log(id, 'rooms', rooms, 'kibble', R('G.st.kibble'), '->', area(), n < 0 ? 'STUCK' : '');
}
function runBoss(id) {
  let n = until(() => R('G.lv && G.lv.boss && G.lv.boss.phase') === 'fight', 60 * 40, i => { if (i % 8 === 0) tap('KeyJ'); });
  if (n < 0) { console.log(id, 'NEVER REACHED FIGHT', R('G.lv.boss.phase')); process.exit(1); }
  R('G.god = true');
  step(60 * 8, monkey);
  tap('KeyH'); step(60 * 5, monkey);
  const p2 = R('G.lv.boss.e.p2');
  step(60 * 5, monkey);
  tap('KeyN');
  const before = area();
  n = until(() => area() !== before, 60 * 60, i => { if (i % 10 === 0) tap('KeyJ'); });
  R('G.god = false');
  console.log(id, 'p2', p2, 'beaten ->', area(), n < 0 ? 'STUCK phase=' + R('G.lv && G.lv.boss && G.lv.boss.phase') + ' script=' + !!R('G.script') : '');
}
function runArea() {
  const id = area(), A = R(`AREAS['${id}']`);
  if (A.view === 'side') runSide(id);
  else if (A.view === 'boss') runBoss(id);
  else if (id === 'card_crossing') { until(() => area() !== id, 60 * 8); console.log('card ->', area()); }
  else if (id === 'dog_town') {
    until(() => !R('G.script'), 60 * 20, i => { if (i % 10 === 0) tap('KeyJ'); });
    R(`(() => { const g = G.ents.find(e => e.gate); G.p.x = g.x - 18; G.p.y = g.y; applyFace(G.p, 'r'); })()`);
    step(2); tap('KeyJ'); step(2);
    until(() => !R('G.script') && !R('G.dlg'), 60 * 20, i => { if (i % 10 === 0) tap('KeyJ'); });
    console.log('gate open', R('G.flags.gateOpen'));
    R(`G.p.x = 24 * 16; G.p.y = 5 * 16`); key('KeyW', true);
    until(() => area() !== 'dog_town', 60 * 10);
    key('KeyW', false);
    console.log('town ->', area());
  } else if (id === 'ending') {
    const n = until(() => area() !== 'ending', 60 * 90, i => { if (i % 12 === 0) tap('KeyJ'); });
    console.log('ending ->', area(), n);
  }
}
let guard = 0;
while (area() !== 'end' && guard++ < 30) runArea();
step(120);
console.log('END time', R('G.st.time|0'), 'deaths', R('G.st.deaths'), 'kibble', R('G.st.kibble'), '/', R('G.kibbleTotal'));
tap('Enter'); step(60);
console.log('back to', area(), 'save', !!store.halo_save_v1);

R(`loadArea('title')`); step(40);
console.log('title save', !!R('G.ti.save'), R('G.ti.save && G.ti.save.area'));
tap('Enter'); step(60);
console.log('continue ->', area());

for (let i = 0; i < 10; i++) { jump(i, false); step(60 * 6, monkey); console.log('jump', i, area(), R('G.sceneName')); }
for (let i = 0; i < 6; i++) { jump(i, true); step(60 * 6, monkey); console.log('jump shift', i, area(), R('G.sceneName')); }

jump(3, false); step(60 * 3);
R('G.p.hp = 1'); R('G.p.inv = 0; G.p.dashInv = 0'); R('hurtPlayer(G.p.x + 5, G.p.y)');
step(60);
console.log('death', !!R('G.death'));
tap('KeyJ'); step(60);
console.log('respawn', area(), 'hp', R('G.p.hp'), 'deaths', R('G.st.deaths'));
tap('Escape'); step(5); console.log('paused', R('G.paused'));
tap('KeyS'); step(2); tap('KeyS'); step(2); tap('Enter'); step(5); console.log('muted', R('AU.muted'), R('G.toast && G.toast.s'));
tap('Enter'); step(5); console.log('unmuted', R('AU.muted')); tap('KeyW'); step(2); tap('Enter'); step(60); console.log('after restart paused', R('G.paused'), area());
tap('Escape'); step(3); tap('KeyW'); step(2); tap('Enter'); step(60); console.log('quit ->', area());
tap('KeyM'); step(3);
tap('F1'); step(3);

jump(0, false);
key('Enter', true); step(60); key('Enter', false); step(20);
console.log('skip intro, script', !!R('G.script'), 'introDone', R('G.flags.introDone'));
jump(4, true);
key('Enter', true); step(80); key('Enter', false); step(20);
console.log('skip ending ->', area());
jump(7, false);
until(() => R('G.lv.boss.phase') === 'intro', 200);
key('Enter', true); step(70); key('Enter', false);
console.log('skip chicken intro phase', R('G.lv.boss.phase'));
until(() => R('G.lv.boss.phase') === 'fight', 200);
tap('KeyN'); step(40); key('Enter', true); step(70); key('Enter', false); step(60);
console.log('skip chicken defeat ->', area(), 'kylo', R('G.st.hasKylo'));

const miss = [...R('__miss')];
console.log('missing sprites', miss.length ? miss : 'none');
console.log('frames', frames, 'logs', logs.length ? logs.slice(0, 5) : 'none');
