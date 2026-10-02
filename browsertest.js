const { spawn } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9333;
const outDir = path.join(__dirname, 'shots');
fs.mkdirSync(outDir, { recursive: true });
const udd = fs.mkdtempSync(path.join(os.tmpdir(), 'halo_edge_'));
const url = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/') + (process.argv[2] === 'nodebug' ? '' : '#debug');
const edge = spawn(EDGE, ['--headless=new', '--remote-debugging-port=' + PORT, '--user-data-dir=' + udd, '--window-size=1152,864', '--autoplay-policy=no-user-gesture-required', '--no-first-run', '--disable-extensions', url], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const msgs = [];
let ws, id = 0; const pend = {};
function send(method, params) { return new Promise((res, rej) => { const i = ++id; pend[i] = { res, rej }; ws.send(JSON.stringify({ id: i, method, params: params || {} })); }); }
async function ev(expr) { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true }); if (r.exceptionDetails) throw new Error('eval: ' + expr + ' ' + JSON.stringify(r.exceptionDetails).slice(0, 400)); return r.result.value; }
const VK = { Enter: 13, Escape: 27, Space: 32, ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39, ShiftLeft: 16, F1: 112 };
function keyInfo(code) {
  if (code.startsWith('Key')) return { key: code.slice(3).toLowerCase(), vk: code.charCodeAt(3) };
  if (code.startsWith('Digit')) return { key: code.slice(5), vk: code.charCodeAt(5) };
  return { key: code === 'Space' ? ' ' : code, vk: VK[code] || 0 };
}
async function key(code, down, mods) { const k = keyInfo(code); await send('Input.dispatchKeyEvent', { type: down ? 'keyDown' : 'keyUp', code, key: k.key, windowsVirtualKeyCode: k.vk, modifiers: mods || 0 }); }
async function tap(code, mods) { await key(code, true, mods); await sleep(40); await key(code, false, mods); await sleep(40); }
async function shot(name) { const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(outDir, name + '.png'), Buffer.from(r.data, 'base64')); }
async function waitFor(expr, ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await ev(expr)) return true; } catch (e) { } await sleep(100); } return false; }
async function jump(code, shift) {
  await ev(`loadArea('title')`); await sleep(400);
  if (shift) await key('ShiftLeft', true, 8);
  await tap(code, shift ? 8 : 0);
  if (shift) await key('ShiftLeft', false);
  await sleep(700);
}
async function fps() { return ev(`new Promise(r => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r(Math.round(n / ((performance.now() - t0) / 1000))); }; requestAnimationFrame(f); })`).catch(() => -1); }
async function fpsA() { const r = await send('Runtime.evaluate', { expression: `new Promise(r => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r(Math.round(n / ((performance.now() - t0) / 1000))); }; requestAnimationFrame(f); })`, awaitPromise: true, returnByValue: true }); return r.result.value; }
async function hold(code, ms) { await key(code, true); await sleep(ms); await key(code, false); }

async function quick() {
  await tap('Enter'); await sleep(1500);
  for (let i = 0; i < 40 && !(await ev(`!!G.ents.find(e => e.carry)`)); i++) { await tap('KeyJ'); await sleep(300); }
  await sleep(300); await shot('q01_carry');
  for (let i = 0; i < 80 && (await ev('!!G.script')); i++) { await tap('KeyJ'); await sleep(250); }
  await ev(`(() => { G.p.x = 200; G.p.y = 104; applyFace(G.p, 'r'); })()`); await sleep(200); await tap('KeyJ');
  for (let i = 0; i < 40 && !(await ev('!!G.item')); i++) { await tap('KeyJ'); await sleep(300); }
  await sleep(500); await shot('q02_item');
  for (let i = 0; i < 80 && (await ev('!!G.script')); i++) { await tap('KeyJ'); await sleep(250); }
  await sleep(300);
  await ev(`(() => { G.p.x = 144; G.p.y = 205; })()`); await hold('KeyS', 900); await shot('q03_outside');
  await jump('Digit3'); await waitFor(`G.dlg`, 6000); await sleep(900); await shot('q04_boss_dialog_top');
  await jump('Digit8'); await waitFor(`G.lv.boss.phase === 'intro'`, 6000); await key('Enter', true); await sleep(1000); await key('Enter', false);
  await waitFor(`G.lv.boss.phase === 'fight'`, 4000); await ev(`G.lv.boss.e.hp = 0`); await sleep(2600); await shot('q05_chicken_topple');
  for (let i = 0; i < 12; i++) { await tap('KeyJ'); await sleep(450); } await shot('q06_kylo');
  await jump('Digit4', true); await sleep(2500); await shot('q07_dozer_label');
  await jump('Digit5', true); await key('Enter', true); await sleep(200); await key('Enter', false);
  await waitFor(`G.cutStage === 'sea'`, 30000).catch(() => { });
  for (let i = 0; i < 30 && !(await ev(`G.cutStage === 'sea'`)); i++) { await tap('KeyJ'); await sleep(400); }
  await sleep(1300); await shot('q08_raft');
  console.log('messages:', msgs.length ? msgs : 'none');
}
(async () => {
  let list = null;
  for (let i = 0; i < 50 && !list; i++) { await sleep(200); try { const r = await fetch('http://127.0.0.1:' + PORT + '/json/list'); const j = await r.json(); const pg = j.find(t => t.type === 'page'); if (pg) list = pg; } catch (e) { } }
  if (!list) { console.log('no page'); edge.kill(); process.exit(1); }
  ws = new WebSocket(list.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', m => {
    const d = JSON.parse(m.data);
    if (d.id && pend[d.id]) { pend[d.id].res(d.result || {}); delete pend[d.id]; return; }
    if (d.method === 'Runtime.consoleAPICalled') msgs.push(['console.' + d.params.type, d.params.args.map(a => a.value || a.description).join(' ')]);
    if (d.method === 'Runtime.exceptionThrown') msgs.push(['exception', JSON.stringify(d.params.exceptionDetails).slice(0, 600)]);
    if (d.method === 'Log.entryAdded') msgs.push(['log.' + d.params.entry.level, d.params.entry.text + ' ' + (d.params.entry.url || '')]);
  });
  await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
  await send('Page.reload', { ignoreCache: true });
  await sleep(1500);
  if (process.argv[2] === 'quick') { await quick(); ws.close(); edge.kill(); setTimeout(() => process.exit(0), 300); return; }
  console.log('scene', await ev('G.sceneName'), 'canvas css', await ev('document.getElementById("c").style.width'), 'kibbleTotal', await ev('G.kibbleTotal'));
  await shot('01_title');
  console.log('fps title', await fpsA());
  await tap('Enter'); await sleep(1600);
  await shot('02_cat_intro');
  await sleep(1500); await shot('03_cat_dialog');
  for (let i = 0; i < 16; i++) { await tap('KeyJ'); await sleep(400); }
  await shot('04_cat_kidnap');
  await waitFor('!G.script', 30000);
  await sleep(300);
  await ev(`(() => { G.p.x = 200; G.p.y = 104; applyFace(G.p, 'r'); })()`);
  await sleep(200); await tap('KeyJ'); await sleep(1200); await shot('05_sugar');
  for (let i = 0; i < 8; i++) { await tap('KeyJ'); await sleep(350); }
  await sleep(700); await shot('06_item');
  await waitFor('!G.script && !G.dlg', 20000);
  await ev(`(() => { G.p.x = 150; G.p.y = 300; })()`); await sleep(500); await shot('07_yard');
  await jump('Digit2'); await sleep(1000); await shot('08_shallows');
  await hold('KeyD', 1500); await tap('KeyJ'); await sleep(60); await shot('09_shallows_swim');
  console.log('fps shallows', await fpsA());
  await jump('Digit3'); await sleep(2000); await shot('10_babyboo_banner');
  await waitFor(`G.dlg`, 5000); await sleep(1200); await shot('11_babyboo_intro');
  for (let i = 0; i < 6; i++) { await tap('KeyJ'); await sleep(300); }
  await waitFor(`G.lv.boss.phase === 'fight'`, 6000); await sleep(2500); await shot('12_babyboo_fight');
  await jump('Digit4'); await ev(`(() => { const r = G.lv.rooms[0]; G.p.x = r.x * 16 + 12 * 16; G.p.y = r.y * 16 + 9 * 16; unstick(G.p); })()`); await sleep(2200); await shot('13_reef_room');
  await jump('Digit5'); await waitFor(`G.lv.boss.phase === 'intro'`, 5000); await tap('KeyJ'); await sleep(200); await key('Enter', true); await sleep(1000); await key('Enter', false); await sleep(3000); await shot('14_rover');
  await jump('Digit6'); await waitFor(`G.lv.boss.phase === 'intro'`, 5000); await key('Enter', true); await sleep(1000); await key('Enter', false); await sleep(3000); await shot('15_cherry');
  await jump('Digit7'); await sleep(1500); await shot('16_trench');
  await ev(`(() => { G.p.y += 700; unstick(G.p); })()`); await sleep(1500); await shot('17_trench_deep');
  console.log('fps trench', await fpsA());
  await jump('Digit8'); await sleep(1800); await shot('18_chicken_banner'); await waitFor(`G.dlg`, 6000); await sleep(800); await shot('19_chicken_intro');
  await key('Enter', true); await sleep(1000); await key('Enter', false); await sleep(3500); await shot('20_chicken_fight');
  await ev(`G.lv.boss.e.hp = 0`); await sleep(2500); await shot('21_chicken_defeat');
  for (let i = 0; i < 10; i++) { await tap('KeyJ'); await sleep(500); }
  await shot('22_kylo_join');
  await key('Enter', true); await sleep(1000); await key('Enter', false); await sleep(1200); await shot('23_crossing');
  await jump('Digit9'); await sleep(2200); await shot('24_town');
  await jump('Digit0'); await sleep(1200); await shot('25_castle1');
  await hold('KeyD', 1200); await key('Space', true); await sleep(250); await key('Space', false); await tap('KeyJ'); await sleep(50); await shot('26_castle1_jump');
  console.log('fps castle', await fpsA());
  await jump('Digit1', true); await key('Enter', true); await sleep(2500); await key('Enter', false); await sleep(3000); await shot('27_polly');
  await jump('Digit2', true); await sleep(1500); await shot('28_castle2');
  await jump('Digit3', true); await key('Enter', true); await sleep(2500); await key('Enter', false); await sleep(3000); await shot('29_lola');
  await jump('Digit4', true); await sleep(1800); await waitFor(`G.dlg`, 5000); await sleep(1000); await shot('30_dozer_intro');
  await key('Enter', true); await sleep(1000); await key('Enter', false); await sleep(4000); await shot('31_dozer_fight');
  await ev(`G.lv.boss.e.hp = 0`); await sleep(3500); await shot('32_dozer_defeat');
  await jump('Digit5', true); await sleep(3500); await shot('33_ending_throne');
  for (let i = 0; i < 14; i++) { await tap('KeyJ'); await sleep(450); }
  await shot('34_ending_later');
  await waitFor(`G.cutStage === 'sea'`, 15000); await sleep(1500); await shot('35_ending_sea');
  for (let i = 0; i < 8; i++) { await tap('KeyJ'); await sleep(450); }
  await waitFor(`G.cutStage === 'home'`, 15000); await sleep(2500); await shot('36_ending_home');
  for (let i = 0; i < 8; i++) { await tap('KeyJ'); await sleep(450); }
  await waitFor(`G.sceneName === 'end'`, 15000); await sleep(1500); await shot('37_end');
  await jump('Digit4'); await sleep(800);
  await ev(`(() => { G.p.hp = 1; G.p.inv = 0; hurtPlayer(G.p.x + 4, G.p.y); })()`); await sleep(1200); await shot('38_death');
  await tap('KeyJ'); await sleep(900); await tap('Escape'); await sleep(300); await shot('39_pause');
  await tap('Escape'); await tap('KeyM'); await tap('KeyM'); await tap('F1'); await sleep(300); await shot('40_hitboxes'); await tap('F1');
  await ev(`loadArea('title')`); await sleep(500); await shot('41_title_continue');
  console.log('messages:', msgs.length ? msgs : 'none');
  ws.close(); edge.kill();
  setTimeout(() => process.exit(0), 300);
})().catch(e => { console.log('FAIL', e.message, msgs); try { edge.kill(); } catch (x) { } process.exit(1); });
