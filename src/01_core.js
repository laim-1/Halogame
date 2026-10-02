'use strict';
const W = 384, H = 288, TS = 16, STEP = 1 / 60;
const KNIFE = 'THE BUTTER KNIFE';
const SAVE_KEY = 'halo_save_v1';

const PHYS = {
  td: { walk: 84, accT: 0.06, decT: 0.05, dashT: 0.16, dashV: 220, dashCd: 0.35 },
  land: { run: 96, acc: 900, dec: 1400, air: 700, gUp: 820, g: 1500, jump: -290, maxFall: 330, coyote: 0.10, buf: 0.12 },
  water: { acc: 420, max: 88, drag: 2.2, sink: 40, sinkMax: 36, bonk: 40 },
  dash: { land: { t: 0.16, v: 260, inv: 0.20, cd: 0.40 }, water: { t: 0.22, v: 230, inv: 0.24, cd: 0.45 } },
  hurt: { inv: 1.0, kb: 150, kbUp: -120, lock: 0.2, freeze: 6 },
  pogo: -260, pillow: -380, atkBuf: 0.10, combo: 0.25, hp: 5, safeT: 0.5
};

const ATK = {
  s1: { su: 3, ac: 4, re: 8, dmg: 2, w: 20, h: 14, kb: 80, snd: 'swipe' },
  s2: { su: 3, ac: 4, re: 8, dmg: 2, w: 20, h: 14, kb: 80, snd: 'swipe' },
  s3: { su: 5, ac: 5, re: 14, dmg: 3, w: 24, h: 18, kb: 170, snd: 'swipe3' },
  air: { su: 3, ac: 4, re: 8, dmg: 2, w: 20, h: 14, kb: 80, snd: 'swipe' },
  up: { su: 3, ac: 4, re: 8, dmg: 2, w: 16, h: 20, kb: 60, snd: 'swipe' },
  down: { su: 3, ac: 4, re: 8, dmg: 2, w: 14, h: 16, kb: 60, snd: 'swipe' },
  swat: { su: 2, ac: 4, re: 8, dmg: 0, w: 16, h: 14, kb: 0, snd: 'swipe' }
};

const KYLO_CFG = { ox: 18, oy: 16, lerp: 6, tele: 120, cd: 1.1, cdBoss: 1.6, range: 120, charge: 0.2, speed: 200, turn: 3, dmg: 1, life: 1.2 };

const PAL = {
  outline: '#101018', uiDark: '#0e0c16', uiLight: '#f4ecdc', gold: '#f0c860', heart: '#e8384a', warn: '#ff4050',
  white: '#ffffff', grey: '#7a7a8a', dim: '#5a566a', letter: '#07060c', blue: '#a8d8f8', ghost: '#f0d040', green: '#60e070',
  halo: { d: '#6a6a7a', m: '#8a8a9a', l: '#b0b0c0', e: '#c8e040', n: '#e890a0', k: '#101018', glass: 'rgba(200,240,255,0.4)', rim: '#d8f4ff', hi: '#ffffff', blade: '#dce0ec', bladeD: '#9098a8', handle: '#8a5a30' },
  sugar: { m: '#f4ead8', l: '#fffaf0', p: '#6a4a3a', pd: '#4a3028', e: '#60a8f0', ol: '#7a6a58', cush: '#a04060', cushL: '#c05a7a', cushD: '#782a48' },
  twin: { d: '#16161e', m: '#2a2a38', l: '#4a4a62', e: '#f0d040', ol: '#050508', bow: '#f07090', bowD: '#c04a6a', hat: '#5a48c0', hatL: '#7a68e0', hatD: '#3a2a90', star: '#f0e070', book: '#4a7ab0', bookD: '#2a4a78', page: '#e8e0c8', drip: '#80c8f0', wand: '#c89858' },
  crab: { m: '#e05a30', d: '#a83a20', l: '#f08a58', e: '#101018', w: '#ffffff', ol: '#5a1a0c', hat: '#ffffff', hatD: '#c8c8d0' },
  jelly: { m: '#f0a0e0', d: '#c070b8', l: '#ffd0f4', t: '#e080d0', ol: '#7a3a6e', glow: '#60f0d0', glowL: '#c0fff0' },
  puffer: { m: '#e0c040', d: '#a88a20', l: '#f8e080', b: '#fff0c0', s: '#7a5a10', ol: '#5a4008' },
  eel: { m: '#4a7a3a', d: '#2e5224', l: '#78a860', e: '#f0e040', ol: '#16280c', mouth: '#a03040' },
  minnow: { m: '#c0d0e0', d: '#8090a8', l: '#f0f8ff', ol: '#3a4458' },
  pdog: { m: '#8a5a30', d: '#6a4020', l: '#b08050', n: '#2a1a10', helm: '#a0a8b8', helmD: '#6a7080', ol: '#34200c', tongue: '#f07090' },
  soldier: { m: '#7a5a3a', d: '#5a3e24', l: '#a07a50', n: '#2a1a10', helm: '#c8a040', helmD: '#8a6a20', ol: '#2e1e0c', tongue: '#f07090' },
  puppy: { m: '#e0c090', d: '#b89060', l: '#f8e0b8', n: '#3a2a1a', ol: '#5a4428', tongue: '#f07090' },
  bdog: { m: '#d8d0c8', d: '#9a8a80', l: '#ffffff', n: '#2a2020', spot: '#6a5a50', ol: '#4a4038', tongue: '#f07090' },
  ball: { m: '#d0f040', d: '#98b820', l: '#f0ffa0', ol: '#3a4a08' },
  babyboo: { m: '#f8b0d8', d: '#e088b8', l: '#ffe0f0', f: '#c0a0f0', fd: '#9a78d8', fl: '#e0d0ff', e: '#301828', ev: '#ff2040', ol: '#8a4070', blush: '#ff80b0' },
  rover: { m: '#2050e0', d: '#1838a8', l: '#5a88ff', f: '#2a60f0', fd: '#1a40b0', fe: '#e82838', e: '#ffffff', p: '#101018', ol: '#0a1650', mouth: '#ff6070' },
  cherry: { m: '#c01828', d: '#8a1020', l: '#e03040', f: '#d02838', fd: '#901020', brow: '#3a0408', e: '#ffffff', ol: '#4a040a', mouth: '#300408' },
  chicken: { m: '#f4ece0', d: '#d8c8c0', l: '#ffffff', p: '#f0b0b8', e: '#f06080', st: '#6a4a50', ol: '#7a6060', mouth: '#a04858', teeth: '#ffffff' },
  polly: { m: '#18181e', d: '#0a0a0e', l: '#34344a', s: '#6a6a90', crown: '#f0c040', crownD: '#b08820', gem: '#e83848', tongue: '#f07090', e: '#f0f0f0', ol: '#000000' },
  lola: { m: '#f4ead8', t: '#d8b080', d: '#b08858', n: '#2a2020', inr: '#f0a0a8', ol: '#6a5038', tongue: '#f07090' },
  dozer: { m: '#9a6a38', d: '#7a4e24', l: '#b8844a', b: '#d0a068', cape: '#c02030', capeD: '#8a1420', crown: '#f0c040', crownD: '#b08820', gem: '#40a0f0', crumb: '#e0b060', n: '#2a1a10', ol: '#3e2410', drum: '#c87840', drumD: '#9a5428', bone: '#f4ecdc', tongue: '#f07090' },
  npc: [
    { m: '#c8a070', d: '#9a7448', l: '#e8c898', n: '#2a1a10', helm: '#a0a8b8', helmD: '#6a7080', ol: '#4a3418', tongue: '#f07090' },
    { m: '#9a9aa8', d: '#6a6a78', l: '#c8c8d8', n: '#1a1a20', ol: '#34343e', tongue: '#f07090' },
    { m: '#e8e0d0', d: '#b8ac98', l: '#ffffff', n: '#2a2020', ol: '#5a5044', tongue: '#f07090' },
    { m: '#d88040', d: '#a85a28', l: '#f0a868', n: '#2a1a10', ol: '#4a2410', tongue: '#f07090' },
    { m: '#a8a098', d: '#7a7068', l: '#d0c8c0', n: '#1a1a20', ol: '#3a342e', tongue: '#f07090' },
    { m: '#5a4a3a', d: '#3e3226', l: '#7e6a54', n: '#140e08', helm: '#c8a040', helmD: '#8a6a20', ol: '#1e160e', tongue: '#f07090' }
  ],
  area: {
    cat: { grass: ['#3e7a34', '#5a9a44', '#7ab85a'], wood: ['#7a4e34', '#9a6644', '#b88258'], path: '#c8a878', pathD: '#a88858', sky: ['#f09860', '#f8c080'], water: '#3a78b0', waterL: '#6aa0d0', waterD: '#2a5a90', wall: '#d8c0a0', wallD: '#a88870', wallT: '#7a4e34', rug: '#a04a4a', rugL: '#c86a5a', sand: '#e0c890', fence: '#e8dcc8', fenceD: '#a89880', tree: ['#2a5a2a', '#3e7a34', '#5a9a44'], trunk: '#5a3a24', flower: ['#f06080', '#f0d040', '#a080f0', '#ffffff'], tint: 'rgba(240,110,50,0.10)' },
    shallows: { top: '#58c8e0', bot: '#2a90b8', shaft: 'rgba(184,240,248,0.16)', sand: ['#f0d8a0', '#d8b880', '#b89860'], rock: ['#6a6a7a', '#8a8a9a', '#aaaabb'], weed: '#3aa05a', weedD: '#2a7a44', far: '#3aa8c8', farD: '#2c94b8', sky: '#bfefff' },
    reef: { top: '#2a78b0', bot: '#1a4a80', shaft: 'rgba(150,210,250,0.10)', coral: ['#f0608a', '#ff90b0', '#a050c0', '#f09040'], rock: ['#3a3a5a', '#5a4a7a', '#7a6a9a'], sand: ['#c8a8a0', '#a88880', '#886868'], far: '#22629a', farD: '#1c5890', wood: ['#5a3a24', '#7a5234', '#9a6a44'], weed: '#3a9a6a', weedD: '#2a7050', sky: '#9fd8ff' },
    trench: { top: '#0e2436', bot: '#04080e', shaft: 'rgba(80,160,200,0.05)', rock: ['#101c26', '#1a2c3a', '#2a4050'], glow: ['#60f0d0', '#b0ff70'], bone: '#d8d0c0', boneD: '#a09888', far: '#0a1a28', farD: '#081420', weed: '#2a6a5a', weedD: '#1a4a40', sky: '#0e2436' },
    lair: { top: '#0a1a28', bot: '#04080e', shaft: 'rgba(0,0,0,0)', rock: ['#141c24', '#1e2a36', '#2e3e4c'], glow: ['#60f0d0', '#b0ff70'], bone: '#d8d0c0', boneD: '#a09888', far: '#08121c', farD: '#060e16', weed: '#2a6a5a', weedD: '#1a4a40', sky: '#0a1a28' },
    town: { road: '#e0c080', roadD: '#c8a868', grass: ['#5aa03a', '#6ab84a', '#8ad060'], roof: '#c05a3a', roofD: '#983a24', roofL: '#d87a58', wall: '#f0e0c0', wallD: '#c8b898', sand: '#f0d8a0', sandD: '#d8b880', water: '#48a8d8', waterL: '#88d0f0', waterD: '#2a7ab0', stone: ['#6a6a80', '#8a8aa0', '#a8a8c0'], fence: '#f0e8d8', fenceD: '#b0a490', tree: ['#2e6a2e', '#4a9a3a', '#6ab84a'], trunk: '#6a4428', flower: ['#f06080', '#f0d040', '#ffffff', '#80a0ff'], plaza: '#d8c8a8', plazaD: '#b8a888', tint: 'rgba(255,240,180,0.05)' },
    castle: { stone: ['#4a4a66', '#5a5a7a', '#7a7a98', '#9a9ab8'], mortar: '#343448', banner: '#c03040', bannerD: '#8a2030', gold: '#f0c040', bg: ['#22223a', '#2a2a44', '#34344e'], wood: ['#5a3a22', '#7a5030', '#9a6a40'], spike: '#c8ccd8', spikeD: '#7a7e8e', pillow: ['#a04070', '#d06090', '#f090b8'], sky: '#80c8f0', jar: ['#80a0c0', '#a0c0e0'], frame: '#c89830' },
    roof: { sky: '#80c8f0', skyL: '#b0e0f8', cloud: '#f0f8ff', stone: ['#4a4a66', '#5a5a7a', '#7a7a98', '#9a9ab8'], mortar: '#343448', tile: ['#7a3030', '#9a4040', '#b85850'], hedge: ['#24562a', '#347a34', '#4e9a44'], wood: ['#5a3a22', '#7a5030', '#9a6a40'], banner: '#c03040', bannerD: '#8a2030', gold: '#f0c040', spike: '#c8ccd8', spikeD: '#7a7e8e', pillow: ['#a04070', '#d06090', '#f090b8'], far: '#a8c8e0', farD: '#88a8c8' },
    sea: { top: '#f8a868', bot: '#80c8f0', water: '#3a88c8', waterD: '#2a68a8', waterL: '#88c8f0' }
  }
};

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const approach = (v, t, d) => v < t ? Math.min(v + d, t) : Math.max(v - d, t);
const rnd = (a, b) => a + Math.random() * (b - a);
const rndi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const sgn = v => v < 0 ? -1 : v > 0 ? 1 : 0;
const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
const ease = t => t * t * (3 - 2 * t);
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function boxOf(e) { return { x: e.x - e.w / 2, y: e.y - e.h, w: e.w, h: e.h }; }
function circRect(cx, cy, r, b) { const nx = clamp(cx, b.x, b.x + b.w), ny = clamp(cy, b.y, b.y + b.h); return (nx - cx) * (nx - cx) + (ny - cy) * (ny - cy) < r * r; }
function ringRect(cx, cy, r0, r1, b) {
  if (!circRect(cx, cy, r1, b)) return false;
  if (r0 <= 0) return true;
  const fx = Math.max(Math.abs(b.x - cx), Math.abs(b.x + b.w - cx)), fy = Math.max(Math.abs(b.y - cy), Math.abs(b.y + b.h - cy));
  return fx * fx + fy * fy > r0 * r0;
}
function hash2(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mkCanvas(w, h, read) {
  const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0);
  const g = c.getContext('2d', read ? { willReadFrequently: true } : { alpha: true });
  g.imageSmoothingEnabled = false; c.g = g; return c;
}
const RGBC = {};
function hexRgb(h) {
  if (RGBC[h]) return RGBC[h];
  let r = 0, g = 0, b = 0;
  if (h[0] === '#') { r = parseInt(h.substr(1, 2), 16); g = parseInt(h.substr(3, 2), 16); b = parseInt(h.substr(5, 2), 16); }
  return (RGBC[h] = [r, g, b]);
}
function shade(h, f) { const c = hexRgb(h); const k = v => clamp(Math.round(v * f), 0, 255).toString(16).padStart(2, '0'); return '#' + k(c[0]) + k(c[1]) + k(c[2]); }
function mixHex(a, b, t) { const x = hexRgb(a), y = hexRgb(b); const k = i => clamp(Math.round(lerp(x[i], y[i], t)), 0, 255).toString(16).padStart(2, '0'); return '#' + k(0) + k(1) + k(2); }

const cv = document.getElementById('c');
const ctx = cv.getContext('2d', { alpha: false });
ctx.imageSmoothingEnabled = false;
function resize() {
  const s = Math.max(1, Math.floor(Math.min(innerWidth / W, innerHeight / H)));
  cv.style.width = (W * s) + 'px'; cv.style.height = (H * s) + 'px';
}
addEventListener('resize', resize);
resize();

const GLYPHS = {
  A: '.##./#..#/#..#/####/#..#/#..#/#..#', B: '###./#..#/#..#/###./#..#/#..#/###.', C: '.###/#.../#.../#.../#.../#.../.###',
  D: '###./#..#/#..#/#..#/#..#/#..#/###.', E: '####/#.../#.../###./#.../#.../####', F: '####/#.../#.../###./#.../#.../#...',
  G: '.###/#.../#.../#.##/#..#/#..#/.###', H: '#..#/#..#/#..#/####/#..#/#..#/#..#', I: '###/.#./.#./.#./.#./.#./###',
  J: '..##/...#/...#/...#/...#/#..#/.##.', K: '#..#/#..#/#.#./##../#.#./#..#/#..#', L: '#.../#.../#.../#.../#.../#.../####',
  M: '#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#', N: '#...#/##..#/#.#.#/#.#.#/#..##/#...#/#...#', O: '.##./#..#/#..#/#..#/#..#/#..#/.##.',
  P: '###./#..#/#..#/###./#.../#.../#...', Q: '.##../#..#./#..#./#..#./#.##./#..#./.##.#', R: '###./#..#/#..#/###./#.#./#..#/#..#',
  S: '.###/#.../#.../.##./...#/...#/###.', T: '#####/..#../..#../..#../..#../..#../..#..', U: '#..#/#..#/#..#/#..#/#..#/#..#/.##.',
  V: '#...#/#...#/#...#/#...#/.#.#./.#.#./..#..', W: '#...#/#...#/#...#/#.#.#/#.#.#/##.##/#...#', X: '#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
  Y: '#...#/#...#/.#.#./..#../..#../..#../..#..', Z: '####/...#/..#./.#../#.../#.../####',
  '0': '.##./#..#/#.##/##.#/#..#/#..#/.##.', '1': '.#./##./.#./.#./.#./.#./###', '2': '.##./#..#/...#/..#./.#../#.../####',
  '3': '###./...#/...#/.##./...#/...#/###.', '4': '#..#/#..#/#..#/####/...#/...#/...#', '5': '####/#.../#.../###./...#/...#/###.',
  '6': '.##./#.../#.../###./#..#/#..#/.##.', '7': '####/...#/...#/..#./.#../.#../.#..', '8': '.##./#..#/#..#/.##./#..#/#..#/.##.',
  '9': '.##./#..#/#..#/.###/...#/...#/.##.',
  '.': '//////#', ',': '/////.#/#.', '!': '#/#/#/#/#//#', '?': '.##./#..#/...#/..#./.#..//.#..', "'": '#/#', '"': '#.#/#.#',
  '-': '///###', ':': '/#////#', '/': '...#/...#/..#./..#./.#../#.../#...', '(': '.#/#./#./#./#./#./.#', ')': '#./.#/.#/.#/.#/.#/#.',
  '*': '/#.#.#/.###./#####/.###./#.#.#', '+': '//.#./###/.#.', '\u2665': '/.#.#./#####/#####/.###./..#..', '>': '/#.../.#../..#./.#../#...',
  '<': '/...#/..#./.#../..#./...#', '=': '//###//###', '_': '//////####', '%': '#..#/...#/..#./.#../#.../#..#'
};
const FONT = {};
for (const k in GLYPHS) {
  const rows = GLYPHS[k].split('/'); let w = 0; const px = [];
  rows.forEach((r, y) => { w = Math.max(w, r.length); for (let x = 0; x < r.length; x++) if (r[x] === '#') px.push(x, y); });
  FONT[k] = { w, px };
}
function textWidth(s) {
  s = String(s).toUpperCase(); let w = 0;
  for (const ch of s) { if (ch === ' ') w += 3; else { const g = FONT[ch] || FONT['?']; w += g.w + 1; } }
  return Math.max(0, w - 1);
}
const OFF8 = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
const TXC = new Map();
function textCanvas(s, col, ol) {
  const key = s + '|' + col + '|' + ol;
  let c = TXC.get(key); if (c) return c;
  if (TXC.size > 600) TXC.clear();
  c = mkCanvas(textWidth(s) + 2, 9); const g = c.g;
  const draw = (color, offs) => {
    g.fillStyle = color; let x = 1;
    for (const ch of s) {
      if (ch === ' ') { x += 3; continue; }
      const gl = FONT[ch] || FONT['?'];
      for (let i = 0; i < gl.px.length; i += 2) for (const o of offs) g.fillRect(x + gl.px[i] + o[0], 1 + gl.px[i + 1] + o[1], 1, 1);
      x += gl.w + 1;
    }
  };
  if (ol) draw(ol === true ? PAL.outline : ol, OFF8);
  draw(col, [[0, 0]]);
  TXC.set(key, c); return c;
}
function text(s, x, y, col, sc, ol, al) {
  s = String(s).toUpperCase(); sc = sc || 1; if (ol === undefined) ol = true;
  const c = textCanvas(s, col || PAL.uiLight, ol);
  const w = c.width * sc;
  let dx = x - sc;
  if (al === 'c') dx = x - Math.round(w / 2); else if (al === 'r') dx = x - w + sc;
  ctx.drawImage(c, Math.round(dx), Math.round(y - sc), w, c.height * sc);
}
function wrap(s, maxW) {
  const out = [];
  for (const seg of String(s).split('|')) {
    const words = seg.split(' '); let line = '';
    for (const wd of words) {
      const t = line ? line + ' ' + wd : wd;
      if (textWidth(t) > maxW && line) { out.push(line); line = wd; } else line = t;
    }
    out.push(line);
  }
  return out;
}

const keys = {}, pressed = {};
const ACT = {
  left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'], up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'],
  jump: ['Space', 'KeyW', 'ArrowUp'], attack: ['KeyJ', 'KeyZ'], dash: ['KeyK', 'KeyX'], confirm: ['Enter', 'NumpadEnter'],
  pause: ['Escape', 'KeyP'], mute: ['KeyM']
};
function held(a) { for (const k of ACT[a]) if (keys[k]) return true; return false; }
function tapped(a) { for (const k of ACT[a]) if (pressed[k]) return true; return false; }
function eat(a) { for (const k of ACT[a]) pressed[k] = false; }
function clearPressed() { for (const k in pressed) pressed[k] = false; }
const PREVENT = { ArrowUp: 1, ArrowDown: 1, ArrowLeft: 1, ArrowRight: 1, Space: 1, F1: 1 };
addEventListener('keydown', e => {
  if (PREVENT[e.code]) e.preventDefault();
  if (!e.repeat) pressed[e.code] = true;
  keys[e.code] = true;
  AU.init();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; if (typeof autoPause === 'function') autoPause(); });

const SFX = {
  swipe: [{ n: 1, f0: 3200, f1: 900, d: 0.08, v: 0.10, q: 0.9 }, { o: 'square', f0: 600, f1: 300, d: 0.07, v: 0.04 }],
  swipe3: [{ n: 1, f0: 2200, f1: 400, d: 0.15, v: 0.13, q: 0.8 }, { o: 'square', f0: 420, f1: 140, d: 0.14, v: 0.05 }],
  hit: [{ o: 'square', f0: 220, f1: 80, d: 0.09, v: 0.10 }, { n: 1, f0: 1400, d: 0.05, v: 0.09 }],
  hitBoss: [{ o: 'square', f0: 220, f1: 80, d: 0.1, v: 0.10 }, { o: 'sine', f0: 60, f1: 40, d: 0.16, v: 0.3 }],
  tink: [{ o: 'sine', f0: 1800, d: 0.06, v: 0.12 }, { o: 'sine', f0: 2700, d: 0.04, v: 0.05 }],
  hurt: [{ n: 1, f0: 3000, d: 0.28, v: 0.22, q: 2 }, { o: 'sawtooth', f0: 520, f1: 200, d: 0.16, v: 0.035 }],
  enemyDie: [{ o: 'square', f0: 500, f1: 100, d: 0.18, v: 0.08 }, { n: 1, f0: 900, f1: 200, d: 0.2, v: 0.11, ft: 'lowpass' }],
  jump: [{ o: 'square', f0: 300, f1: 600, d: 0.08, v: 0.045 }],
  land: [{ n: 1, f0: 420, d: 0.05, v: 0.07, ft: 'lowpass' }],
  dash: [{ n: 1, f0: 1200, f1: 4200, d: 0.12, v: 0.11, q: 1.5 }],
  swim: [{ n: 1, f0: 600, f1: 300, d: 0.1, v: 0.04, ft: 'lowpass' }],
  bubble: [{ o: 'sine', f0: 700, f1: 1200, d: 0.07, v: 0.04 }],
  splash: [{ n: 1, f0: 1600, f1: 300, d: 0.45, v: 0.22, ft: 'lowpass' }, { o: 'sine', f0: 300, f1: 900, d: 0.12, v: 0.05 }],
  bonk: [{ o: 'triangle', f0: 200, f1: 520, d: 0.08, v: 0.14 }, { o: 'triangle', f0: 520, f1: 240, d: 0.1, v: 0.11, t: 0.08 }],
  pickup: [{ o: 'square', f0: 880, d: 0.05, v: 0.05 }, { o: 'square', f0: 1108, d: 0.05, v: 0.05, t: 0.05 }, { o: 'square', f0: 1318, d: 0.08, v: 0.05, t: 0.1 }],
  heart: [{ o: 'triangle', f0: 660, d: 0.08, v: 0.12 }, { o: 'triangle', f0: 880, d: 0.08, v: 0.12, t: 0.08 }, { o: 'triangle', f0: 1320, d: 0.16, v: 0.12, t: 0.16 }],
  bigTreat: [{ o: 'square', f0: 523, d: 0.08, v: 0.05 }, { o: 'square', f0: 659, d: 0.08, v: 0.05, t: 0.08 }, { o: 'square', f0: 784, d: 0.08, v: 0.05, t: 0.16 }, { o: 'square', f0: 1046, d: 0.25, v: 0.05, t: 0.24 }, { o: 'triangle', f0: 523, d: 0.4, v: 0.1, t: 0.24 }],
  itemGet: [{ o: 'square', f0: 523, d: 0.1, v: 0.05 }, { o: 'square', f0: 587, d: 0.1, v: 0.05, t: 0.1 }, { o: 'square', f0: 659, d: 0.1, v: 0.05, t: 0.2 }, { o: 'square', f0: 784, d: 0.1, v: 0.05, t: 0.3 }, { o: 'square', f0: 988, d: 0.1, v: 0.05, t: 0.4 }, { o: 'square', f0: 1046, d: 0.45, v: 0.06, t: 0.5 }, { o: 'triangle', f0: 262, d: 0.7, v: 0.12, t: 0.5 }],
  checkpoint: [{ o: 'sine', f0: 1320, d: 0.7, v: 0.13 }, { o: 'sine', f0: 1980, d: 0.5, v: 0.05 }, { o: 'sine', f0: 1760, d: 0.6, v: 0.08, t: 0.12 }],
  talkBlip: [{ o: 'square', f0: 440, d: 0.03, v: 0.025 }],
  menuMove: [{ o: 'square', f0: 660, d: 0.04, v: 0.04 }],
  menuSelect: [{ o: 'square', f0: 660, d: 0.05, v: 0.05 }, { o: 'square', f0: 990, d: 0.09, v: 0.05, t: 0.05 }],
  bossRoar: [{ o: 'sawtooth', f0: 110, f1: 60, d: 0.8, v: 0.13, lfo: [11, 18], lp: 900 }],
  grumble: [{ o: 'sawtooth', f0: 70, f1: 48, d: 0.7, v: 0.18, lp: 280, lfo: [7, 10] }],
  laugh: [{ o: 'square', f0: 500, d: 0.05, v: 0.05 }, { o: 'square', f0: 610, d: 0.05, v: 0.05, t: 0.08 }, { o: 'square', f0: 740, d: 0.06, v: 0.05, t: 0.16 }],
  bark: [{ o: 'sawtooth', f0: 420, f1: 180, d: 0.1, v: 0.08, lp: 1400 }, { n: 1, f0: 900, d: 0.06, v: 0.06 }],
  yip: [{ o: 'square', f0: 1300, f1: 700, d: 0.08, v: 0.06 }],
  roll: [{ n: 1, f0: 160, d: 0.32, v: 0.25, ft: 'lowpass' }, { o: 'sine', f0: 50, f1: 44, d: 0.32, v: 0.12 }],
  slam: [{ o: 'sine', f0: 50, f1: 30, d: 0.35, v: 0.4 }, { n: 1, f0: 300, d: 0.25, v: 0.2, ft: 'lowpass' }],
  crunch: [{ n: 1, f0: 2500, d: 0.06, v: 0.11, q: 3 }, { n: 1, f0: 1800, d: 0.05, v: 0.09, q: 3, t: 0.07 }],
  zap: [{ o: 'square', f0: 1200, f1: 400, d: 0.15, v: 0.06 }],
  gateOpen: [{ o: 'sawtooth', f0: 60, f1: 90, d: 0.8, v: 0.12, lp: 400 }, { n: 1, f0: 220, d: 0.8, v: 0.14, ft: 'lowpass' }],
  phase: [{ o: 'square', f0: 330, d: 0.12, v: 0.07 }, { o: 'square', f0: 311, d: 0.12, v: 0.07, t: 0.12 }, { o: 'square', f0: 440, d: 0.3, v: 0.07, t: 0.24 }],
  victory: [{ o: 'square', f0: 523, d: 0.12, v: 0.05 }, { o: 'square', f0: 659, d: 0.12, v: 0.05, t: 0.15 }, { o: 'square', f0: 784, d: 0.12, v: 0.05, t: 0.3 }, { o: 'square', f0: 1046, d: 0.2, v: 0.05, t: 0.45 }, { o: 'square', f0: 784, d: 0.12, v: 0.05, t: 0.7 }, { o: 'square', f0: 1046, d: 0.6, v: 0.06, t: 0.85 }, { o: 'triangle', f0: 262, d: 1.2, v: 0.12, t: 0.3 }],
  jingle: [{ o: 'square', f0: 784, d: 0.07, v: 0.05 }, { o: 'square', f0: 988, d: 0.07, v: 0.05, t: 0.08 }, { o: 'square', f0: 1318, d: 0.16, v: 0.05, t: 0.16 }],
  seal: [{ n: 1, f0: 700, f1: 2200, d: 0.25, v: 0.09, q: 1 }, { o: 'triangle', f0: 200, f1: 120, d: 0.2, v: 0.08 }],
  pop: [{ o: 'sine', f0: 400, f1: 1600, d: 0.06, v: 0.08 }],
  wind: [{ n: 1, f0: 500, f1: 1100, d: 0.9, v: 0.05, q: 0.6 }],
  wake: [{ o: 'sine', f0: 300, f1: 200, d: 0.4, v: 0.08 }],
  groan: [{ o: 'sawtooth', f0: 90, f1: 55, d: 1.0, v: 0.14, lp: 320, lfo: [5, 8] }],
  burp: [{ o: 'sawtooth', f0: 90, f1: 60, d: 0.4, v: 0.12, lp: 500, lfo: [25, 12] }],
  snore: [{ n: 1, f0: 300, d: 0.5, v: 0.06, ft: 'lowpass' }],
  cheer: [{ o: 'square', f0: 900, f1: 1300, d: 0.08, v: 0.04 }, { o: 'square', f0: 1100, f1: 1500, d: 0.08, v: 0.04, t: 0.1 }],
  sparkle: [{ o: 'sine', f0: 1500, f1: 2400, d: 0.1, v: 0.04 }, { o: 'sine', f0: 2000, f1: 3000, d: 0.08, v: 0.03, t: 0.06 }]
};

const TRACKS = {
  title: { tempo: 132, bass: [45, 0, 52, 0, 45, 0, 52, 0, 43, 0, 50, 0, 43, 0, 50, 0, 41, 0, 48, 0, 41, 0, 48, 0, 40, 0, 47, 0, 44, 0, 47, 0], lead: [69, 0, 72, 74, 76, 0, 74, 72, 71, 0, 67, 0, 69, 71, 72, 0, 69, 0, 65, 0, 72, 0, 69, 0, 68, 0, 71, 0, 76, 74, 71, 68] },
  home: { tempo: 96, bass: [41, 0, 48, 0, 45, 0, 48, 0, 46, 0, 53, 0, 50, 0, 53, 0, 43, 0, 50, 0, 46, 0, 50, 0, 48, 0, 55, 0, 52, 0, 48, 0], lead: [72, 0, 69, 0, 72, 74, 72, 0, 70, 0, 74, 0, 77, 0, 74, 0, 70, 0, 67, 0, 70, 72, 74, 0, 72, 0, 0, 0, 69, 0, 0, 0] },
  ocean: { tempo: 140, bass: [48, 0, 55, 0, 48, 55, 52, 0, 53, 0, 60, 0, 53, 60, 57, 0, 55, 0, 62, 0, 55, 62, 59, 0, 48, 0, 55, 0, 52, 55, 48, 0], lead: [72, 76, 79, 0, 76, 0, 72, 0, 77, 0, 81, 0, 77, 76, 74, 0, 79, 0, 77, 76, 74, 0, 71, 74, 72, 0, 76, 0, 72, 0, 0, 0] },
  trench: { tempo: 100, bass: [38, 0, 0, 0, 45, 0, 0, 0, 38, 0, 0, 0, 44, 0, 43, 0, 38, 0, 0, 0, 45, 0, 0, 0, 41, 0, 40, 0, 39, 0, 38, 0], lead: [0, 0, 74, 0, 0, 0, 73, 0, 0, 0, 0, 0, 69, 0, 0, 0, 0, 0, 74, 0, 77, 0, 76, 0, 73, 0, 0, 0, 0, 0, 0, 0] },
  boss_fish: { tempo: 168, bass: [40, 40, 52, 40, 40, 52, 40, 52, 36, 36, 48, 36, 36, 48, 36, 48, 38, 38, 50, 38, 38, 50, 38, 50, 35, 35, 47, 35, 39, 39, 47, 39], lead: [76, 0, 79, 76, 0, 74, 76, 0, 72, 0, 76, 72, 0, 71, 72, 0, 74, 0, 78, 74, 0, 72, 74, 0, 71, 0, 75, 0, 78, 0, 83, 0] },
  chicken: { tempo: 80, bass: [33, 0, 33, 0, 0, 0, 36, 0, 33, 0, 33, 0, 0, 0, 32, 0, 33, 0, 33, 0, 0, 0, 36, 0, 38, 0, 37, 0, 36, 0, 32, 0], lead: [0, 0, 0, 0, 57, 0, 0, 0, 0, 0, 0, 0, 56, 0, 0, 0, 0, 0, 0, 0, 57, 0, 60, 0, 63, 0, 62, 0, 60, 0, 56, 0] },
  dogtown: { tempo: 120, bass: [43, 0, 50, 0, 43, 0, 50, 0, 48, 0, 55, 0, 48, 0, 55, 0, 50, 0, 57, 0, 50, 0, 57, 0, 43, 0, 50, 0, 47, 0, 43, 0], lead: [67, 67, 71, 0, 74, 0, 71, 0, 72, 72, 76, 0, 79, 0, 76, 0, 74, 0, 72, 0, 71, 0, 69, 0, 67, 0, 71, 0, 67, 0, 0, 0] },
  castle: { tempo: 108, bass: [46, 0, 46, 0, 53, 0, 46, 0, 51, 0, 51, 0, 58, 0, 51, 0, 53, 0, 53, 0, 48, 0, 53, 0, 46, 0, 53, 0, 46, 0, 0, 0], lead: [70, 0, 74, 0, 77, 0, 82, 0, 79, 0, 75, 0, 79, 0, 82, 0, 81, 0, 77, 0, 72, 0, 77, 0, 82, 0, 81, 0, 82, 0, 0, 0] },
  boss_dog: { tempo: 180, bass: [45, 57, 45, 57, 45, 57, 45, 57, 41, 53, 41, 53, 41, 53, 41, 53, 43, 55, 43, 55, 43, 55, 43, 55, 40, 52, 40, 52, 44, 56, 44, 56], lead: [81, 79, 76, 79, 81, 0, 84, 0, 77, 76, 72, 76, 77, 0, 81, 0, 79, 77, 74, 77, 79, 0, 83, 0, 76, 0, 80, 0, 83, 0, 88, 0] },
  dozer: { tempo: 96, bass: [36, 0, 43, 0, 36, 0, 43, 0, 41, 0, 48, 0, 41, 0, 48, 0, 43, 0, 50, 0, 43, 0, 50, 0, 36, 0, 43, 0, 31, 0, 36, 0], lead: [72, 0, 0, 72, 76, 0, 79, 0, 77, 0, 0, 77, 81, 0, 77, 0, 79, 0, 77, 0, 76, 0, 74, 0, 72, 0, 67, 0, 72, 0, 0, 0] },
  end: { tempo: 120, bass: [48, 0, 55, 0, 52, 0, 55, 0, 53, 0, 57, 0, 60, 0, 57, 0, 55, 0, 59, 0, 62, 0, 59, 0, 48, 0, 52, 0, 55, 0, 60, 0], lead: [76, 0, 79, 0, 84, 0, 79, 0, 81, 0, 77, 0, 72, 0, 77, 0, 79, 0, 83, 0, 86, 0, 83, 0, 84, 0, 0, 0, 72, 0, 0, 0] }
};

const AU = { ac: null, master: null, noise: null, muted: false, last: {}, track: null, trackName: '', step: 0, next: 0 };
AU.init = function () {
  if (AU.ac) { if (AU.ac.state === 'suspended') AU.ac.resume().catch(() => {}); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  try { AU.ac = new AC(); } catch (e) { AU.ac = null; return; }
  AU.master = AU.ac.createGain(); AU.master.gain.value = AU.muted ? 0 : 1; AU.master.connect(AU.ac.destination);
  const len = AU.ac.sampleRate; AU.noise = AU.ac.createBuffer(1, len, AU.ac.sampleRate);
  const d = AU.noise.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  AU.next = AU.ac.currentTime + 0.05;
};
function tone(p, t0, mul) {
  const c = AU.ac, t = t0 + (p.t || 0), d = p.d;
  const g = c.createGain();
  g.gain.setValueAtTime(p.v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  g.connect(AU.master);
  let src, out;
  if (p.n) {
    src = c.createBufferSource(); src.buffer = AU.noise;
    const f = c.createBiquadFilter(); f.type = p.ft || 'bandpass'; f.Q.value = p.q || 1;
    f.frequency.setValueAtTime(p.f0 * mul, t); if (p.f1) f.frequency.exponentialRampToValueAtTime(p.f1 * mul, t + d);
    src.connect(f); f.connect(g);
    src.start(t, Math.random() * 0.5); src.stop(t + d + 0.03);
  } else {
    src = c.createOscillator(); src.type = p.o || 'square';
    src.frequency.setValueAtTime(p.f0 * mul, t); if (p.f1) src.frequency.exponentialRampToValueAtTime(p.f1 * mul, t + d);
    out = src;
    if (p.lp) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = p.lp; src.connect(f); out = f; }
    out.connect(g);
    if (p.lfo) {
      const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = p.lfo[0]; lg.gain.value = p.lfo[1];
      l.connect(lg); lg.connect(src.frequency); l.start(t); l.stop(t + d + 0.03);
    }
    src.start(t); src.stop(t + d + 0.03);
  }
  src.onended = () => { try { g.disconnect(); } catch (e) { } };
}
function sfx(name, mul) {
  if (!AU.ac || AU.ac.state !== 'running') return;
  const r = SFX[name]; if (!r) return;
  const now = AU.ac.currentTime;
  const l = AU.last[name] || (AU.last[name] = []);
  while (l.length && now - l[0] > 0.05) l.shift();
  if (l.length >= 4) return;
  l.push(now);
  for (const p of r) tone(p, now, mul || 1);
}
function music(name) {
  if (AU.trackName === name) return;
  AU.trackName = name || ''; AU.track = name ? TRACKS[name] : null; AU.step = 0;
  if (AU.ac) AU.next = AU.ac.currentTime + 0.08;
}
function midiF(m) { return 440 * Math.pow(2, (m - 69) / 12); }
function musicNote(m, t, d, type, v) {
  const c = AU.ac, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(midiF(m), t);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(AU.master); o.start(t); o.stop(t + d + 0.02);
  o.onended = () => { try { g.disconnect(); } catch (e) { } };
}
function musicTick() {
  if (!AU.ac || AU.ac.state !== 'running' || !AU.track) return;
  const tr = AU.track, sd = 60 / tr.tempo / 2, now = AU.ac.currentTime;
  if (AU.next < now - 0.25) AU.next = now + 0.02;
  const n = Math.max(tr.bass.length, tr.lead.length);
  while (AU.next < now + 0.15) {
    const b = tr.bass[AU.step % tr.bass.length], l = tr.lead[AU.step % tr.lead.length];
    if (b) musicNote(b, AU.next, sd * 0.9, 'triangle', 0.05);
    if (l) musicNote(l, AU.next, sd * 0.8, 'square', 0.012);
    AU.step = (AU.step + 1) % n; AU.next += sd;
  }
}
function toggleMute() {
  AU.muted = !AU.muted;
  if (AU.master) AU.master.gain.setValueAtTime(AU.muted ? 0 : 1, AU.ac.currentTime);
  G.toast = { s: AU.muted ? 'MUTED' : 'SOUND ON', t: 1 };
}

function loadSave() {
  try { const s = window.localStorage.getItem(SAVE_KEY); if (!s) return null; const o = JSON.parse(s); return o && o.area ? o : null; } catch (e) { return null; }
}
function writeSave() {
  const s = G.st;
  const o = { area: G.areaId, checkpoint: G.cp, hasWeapon: s.hasWeapon, hasHelmet: s.hasHelmet, hasKylo: s.hasKylo, bossesBeaten: s.bossesBeaten.slice(), kibble: s.kibble, deaths: s.deaths, time: Math.floor(s.time), got: Array.from(s.got), flags: G.flags };
  try { window.localStorage.setItem(SAVE_KEY, JSON.stringify(o)); } catch (e) { }
}
function clearSave() { try { window.localStorage.removeItem(SAVE_KEY); } catch (e) { } }
