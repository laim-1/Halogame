function gR(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }
function gP(g, x, y, c) { g.fillStyle = c; g.fillRect(x, y, 1, 1); }
function gE(g, cx, cy, rx, ry, c) {
  g.fillStyle = c;
  if (ry <= 0) { g.fillRect(cx - rx, cy, rx * 2 + 1, 1); return; }
  for (let dy = -ry; dy <= ry; dy++) {
    const k = 1 - (dy * dy) / ((ry + 0.5) * (ry + 0.5));
    const hw = Math.round(Math.sqrt(Math.max(0, k)) * (rx + 0.3));
    g.fillRect(cx - hw, cy + dy, hw * 2 + 1, 1);
  }
}
const PALN = new Map();
function palName(pal) { if (PALN.has(pal)) return PALN.get(pal); for (const k in PAL.area) if (PAL.area[k] === pal) { PALN.set(pal, k); return k; } return 'castle'; }

function buildFxSprites() {
  const arc = (r0, r1, a0, a1, cx, cy) => {
    for (let y = 0; y < 40; y++) for (let x = 0; x < 40; x++) {
      const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
      if (r >= r0 && r <= r1 && a >= a0 && a <= a1) P(x, y, r > r1 - 1.2 ? '#ffffff' : r > r0 + 1.5 ? '#e8f4ff' : '#9ad0ff');
    }
  };
  bake('fx_slash', 16, 24, 6, 12, () => arc(8, 12, -1.1, 1.1, 1, 12), null);
  bake('fx_slash3', 20, 30, 7, 15, () => arc(10, 15, -1.2, 1.2, 1, 15), null);
  for (let i = 0; i < 2; i++) bake('urchin_' + i, 18, 18, 9, 9, () => {
    const L = 7 + i;
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + (k % 2) * 0.1; Ln(9, 9, Math.round(9 + Math.cos(a) * L), Math.round(9 + Math.sin(a) * L), k % 2 ? '#5a3a6a' : '#7a4a8a'); P(Math.round(9 + Math.cos(a) * L), Math.round(9 + Math.sin(a) * L), '#d8b0f0'); }
    E(9, 9, 4, 4, '#3a2248'); E(8, 8, 2, 2, '#5a3a6a'); P(7, 7, '#9a70b0');
  }, '#1a0e24');
}

function drawTile(g, id, x, y, pal, tx, ty) {
  const pn = palName(pal), h = hash2(tx, ty), parts = id.split('_'), base = parts[0];
  const top = parts.indexOf('t') > 0, bot = parts.indexOf('b') > 0;
  const speck = (cols, n) => { for (let i = 0; i < n; i++) { const px = Math.floor(hash2(tx * 7 + i, ty * 3 + 1) * 15), py = Math.floor(hash2(tx + i * 5, ty * 11 + i) * 15); gR(g, x + px, y + py, 2, 1, cols[i % cols.length]); } };
  switch (base) {
    case 'rock': {
      const r = pal.rock;
      gR(g, x, y, 16, 16, r[1]); speck([r[0], r[2], r[0]], 6);
      if (h < 0.3) { gR(g, x + 3 + Math.floor(h * 20), y + 7, 4, 1, r[0]); gP(g, x + 7 + Math.floor(h * 20), y + 8, r[0]); }
      if (top) {
        if (pal.sand && pn !== 'trench') { const s = pal.sand; gR(g, x, y, 16, 3, s[0]); gR(g, x, y + 3, 16, 1, s[1]); for (let i = 0; i < 16; i += 4) gP(g, x + i + Math.floor(h * 4), y + 4, s[2]); gP(g, x + Math.floor(h * 14), y + 1, s[1]); }
        else { gR(g, x, y, 16, 2, pal.weed || r[2]); gR(g, x, y + 2, 16, 1, pal.weedD || r[1]); for (let i = 0; i < 16; i += 5) gP(g, x + i + Math.floor(h * 5), y - 0, pal.weed || r[2]); }
        if (pn === 'reef' && h < 0.45) { const c = pal.coral[Math.floor(h * 8) % 4]; gE(g, x + 4 + Math.floor(h * 16), y + 1, 2, 1, c); }
        if ((pn === 'trench' || pn === 'lair') && h < 0.2) { gP(g, x + Math.floor(h * 70), y + 1, pal.glow[0]); }
      }
      if (bot) { gR(g, x, y + 14, 16, 2, r[0]); gP(g, x + Math.floor(h * 15), y + 13, r[0]); }
      break;
    }
    case 'stone': {
      const s = pal.stone;
      gR(g, x, y, 16, 16, pal.mortar);
      for (let r = 0; r < 4; r++) {
        const off = ((ty * 4 + r) % 2) * 4;
        for (let c = -1; c < 3; c++) {
          const bx = x + c * 8 + off, x0 = Math.max(bx, x), x1 = Math.min(bx + 7, x + 16);
          if (x1 <= x0) continue;
          gR(g, x0, y + r * 4, x1 - x0, 3, s[1 + Math.floor(hash2(tx * 3 + c, ty * 4 + r) * 2)]);
          gR(g, x0, y + r * 4, x1 - x0, 1, s[2]);
        }
      }
      if (top) { gR(g, x, y, 16, 2, s[3]); gR(g, x, y + 2, 16, 1, s[0]); }
      if (bot) gR(g, x, y + 15, 16, 1, s[0]);
      break;
    }
    case 'wood': {
      const w = pal.wood;
      for (let r = 0; r < 4; r++) { gR(g, x, y + r * 4, 16, 4, w[1 + (r % 2)]); gR(g, x, y + r * 4 + 3, 16, 1, w[0]); }
      gP(g, x + 2, y + 1, w[0]); gP(g, x + 13, y + 9, w[0]);
      break;
    }
    case 'plank': { const w = pal.wood; gR(g, x, y, 16, 4, w[1]); gR(g, x, y, 16, 1, w[2]); gR(g, x, y + 4, 16, 1, w[0]); if (tx % 2) { gR(g, x + 6, y + 5, 3, 1, w[0]); gR(g, x + 7, y + 6, 1, 3, w[0]); } gP(g, x + 1, y + 2, w[0]); gP(g, x + 14, y + 2, w[0]); break; }
    case 'hedge': { const c = pal.hedge; gR(g, x, y + 1, 16, 6, c[1]); for (let i = 0; i < 16; i += 4) gE(g, x + i + 2, y + 1, 2, 1, c[2]); gR(g, x, y + 6, 16, 2, c[0]); gP(g, x + 5, y + 4, c[0]); gP(g, x + 11, y + 3, c[0]); if (h < 0.3) gP(g, x + 8, y + 1, '#f06080'); break; }
    case 'ledge': { const r = pal.rock; gR(g, x, y, 16, 5, r[1]); gR(g, x, y, 16, 1, pal.sand && pn !== 'trench' ? pal.sand[0] : r[2]); gR(g, x, y + 5, 16, 1, r[0]); gP(g, x + 3 + Math.floor(h * 8), y + 6, r[0]); gP(g, x + 10, y + 6, r[0]); break; }
    case 'spike': {
      gR(g, x, y + 13, 16, 3, pal.spikeD); gR(g, x, y + 13, 16, 1, pal.spike);
      for (let i = 0; i < 3; i++) { const fx = x + 2 + i * 5; gR(g, fx, y + 9, 3, 4, pal.spikeD); gR(g, fx, y + 5, 1, 4, pal.spike); gR(g, fx + 2, y + 5, 1, 4, pal.spike); gP(g, fx, y + 4, '#ffffff'); gP(g, fx + 2, y + 4, '#ffffff'); gP(g, fx + 1, y + 7, pal.spike); }
      break;
    }
    case 'surf': { gR(g, x, y, 16, 16, pal.sky || '#bfefff'); gR(g, x, y + 10, 16, 6, pal.top); gR(g, x, y + 9, 16, 1, '#e8fbff'); break; }
    case 'sky': { gR(g, x, y, 16, 16, pal.sky || '#bfefff'); if (h < 0.15) gR(g, x + 3, y + 6, 6, 1, '#ffffff'); break; }
    case 'pillow': {
      const c = pal.pillow || PAL.area.castle.pillow;
      gE(g, x + 8, y + 7, 8, 6, c[1]); gR(g, x + 2, y + 3, 12, 1, c[2]); gR(g, x + 2, y + 12, 12, 1, c[0]); gE(g, x + 8, y + 7, 1, 1, c[0]); gP(g, x, y + 2, c[2]); gP(g, x + 15, y + 2, c[2]);
      break;
    }
    case 'd1': case 'd2': case 'd3': case 'd4': case 'd5': case 'd6': case 'd7': case 'd8': case 'd9': drawDeco(g, id, x, y, pal, pn, tx, ty, h); break;
    case 'grass': tdGrass(g, x, y, pal, tx, ty, h); break;
    case 'flower': { tdGrass(g, x, y, pal, tx, ty, h); const f = pal.flower; for (let i = 0; i < 3; i++) { const fx = x + 2 + Math.floor(hash2(tx * 5 + i, ty) * 12), fy = y + 2 + Math.floor(hash2(tx, ty * 5 + i) * 12); gP(g, fx, fy, f[(i + Math.floor(h * 4)) % f.length]); gP(g, fx, fy + 1, pal.grass[0]); } break; }
    case 'path': { gR(g, x, y, 16, 16, pal.path); for (let i = 0; i < 4; i++) gP(g, x + Math.floor(hash2(tx + i, ty * 9) * 16), y + Math.floor(hash2(tx * 9, ty + i) * 16), pal.pathD); break; }
    case 'road': { gR(g, x, y, 16, 16, pal.road); for (let i = 0; i < 3; i++) gR(g, x + Math.floor(hash2(tx + i, ty * 9) * 14), y + Math.floor(hash2(tx * 9, ty + i) * 15), 2, 1, pal.roadD); break; }
    case 'floor': { const w = pal.wood || PAL.area.cat.wood; for (let r = 0; r < 4; r++) { gR(g, x, y + r * 4, 16, 4, w[1]); gR(g, x, y + r * 4 + 3, 16, 1, w[0]); gP(g, x + ((ty * 4 + r) * 5) % 16, y + r * 4 + 1, w[2]); gR(g, x + ((ty + r * 3) * 7) % 16, y + r * 4, 1, 3, w[0]); } break; }
    case 'rug': { gR(g, x, y, 16, 16, pal.rug); gR(g, x, y + 3, 16, 1, pal.rugL); gR(g, x, y + 12, 16, 1, pal.rugL); if ((tx + ty) % 2) gE(g, x + 8, y + 8, 2, 2, pal.rugL); break; }
    case 'wallf': { gR(g, x, y, 16, 16, pal.wall || '#d8c0a0'); gR(g, x, y, 16, 2, pal.wallT || '#7a4e34'); gR(g, x, y + 13, 16, 3, pal.wallD || '#a88870'); if (h < 0.2) { gR(g, x + 5, y + 5, 6, 5, pal.wallD); gR(g, x + 6, y + 6, 4, 3, '#f8d890'); } break; }
    case 'wallt': { const c = pal.wallT || '#7a4e34'; gR(g, x, y, 16, 16, c); gR(g, x, y + 7, 16, 1, shade(c, 0.8)); gR(g, x + (ty % 2) * 8, y, 1, 7, shade(c, 0.8)); gR(g, x + 4 + (ty % 2) * 8, y + 8, 1, 8, shade(c, 0.8)); break; }
    case 'water': {
      gR(g, x, y, 16, 16, pal.water); gR(g, x + Math.floor(h * 10), y + 4 + Math.floor(h * 8), 5, 1, pal.waterL); if (h > 0.5) gR(g, x + Math.floor(h * 6), y + 11, 4, 1, pal.waterD);
      if (parts[1] === 't') { gR(g, x, y, 16, 3, pal.waterL); gR(g, x, y, 16, 1, '#ffffff'); gP(g, x + Math.floor(h * 16), y + 3, '#ffffff'); }
      break;
    }
    case 'tree': {
      tdGrass(g, x, y, pal, tx, ty, h);
      const t = pal.tree; gE(g, x + 8, y + 14, 6, 1, 'rgba(0,0,0,0.25)'); gR(g, x + 7, y + 10, 3, 5, pal.trunk);
      gE(g, x + 8, y + 7, 7, 6, t[0]); gE(g, x + 8, y + 6, 6, 5, t[1]); gE(g, x + 6, y + 4, 3, 2, t[2]); gP(g, x + 11, y + 8, t[2]);
      break;
    }
    case 'fence': { tdGrass(g, x, y, pal, tx, ty, h); gR(g, x, y + 6, 16, 2, pal.fence); gR(g, x, y + 11, 16, 2, pal.fence); gR(g, x, y + 13, 16, 1, pal.fenceD); for (const fx of [2, 10]) { gR(g, x + fx, y + 3, 3, 12, pal.fence); gR(g, x + fx + 2, y + 3, 1, 12, pal.fenceD); gP(g, x + fx + 1, y + 2, pal.fence); } break; }
    case 'dock': { const w = PAL.area.cat.wood; gR(g, x, y, 16, 16, pal.water || '#3a78b0'); for (let i = 0; i < 4; i++) { gR(g, x + i * 4, y, 3, 16, w[1 + (i % 2)]); gR(g, x + i * 4 + 3, y, 1, 16, w[0]); } gP(g, x + 1, y + 3, w[0]); gP(g, x + 9, y + 11, w[0]); break; }
    case 'sand': { gR(g, x, y, 16, 16, pal.sand); for (let i = 0; i < 4; i++) gP(g, x + Math.floor(hash2(tx + i, ty * 7) * 16), y + Math.floor(hash2(tx * 7, ty + i) * 16), pal.sandD || '#c8a878'); break; }
    case 'roof': { gR(g, x, y, 16, 16, pal.roof); for (let r = 0; r < 4; r++) { gR(g, x, y + r * 4 + 3, 16, 1, pal.roofD); for (let c = 0; c < 16; c += 4) gP(g, x + c + (r % 2) * 2, y + r * 4 + 1, pal.roofL); } break; }
    case 'bwall': {
      gR(g, x, y, 16, 16, pal.wall); gR(g, x, y + 14, 16, 2, pal.wallD);
      const bottom = ty + 1 >= G.lv.h || G.lv.t[(ty + 1) * G.lv.w + tx] !== 'B';
      if (bottom && tx % 4 === 1) { gR(g, x + 3, y + 3, 10, 13, '#6a4428'); gR(g, x + 4, y + 4, 8, 12, '#8a5a34'); gP(g, x + 10, y + 10, PAL.gold); }
      else if ((tx + ty) % 2 === 0) { gR(g, x + 4, y + 4, 8, 7, pal.wallD); gR(g, x + 5, y + 5, 6, 5, '#88c8f0'); gR(g, x + 5, y + 5, 2, 2, '#ffffff'); gR(g, x + 8, y + 5, 1, 5, pal.wallD); }
      break;
    }
    case 'cwallf': case 'cwallt': {
      const s = pal.stone || PAL.area.castle.stone;
      gR(g, x, y, 16, 16, s[0]);
      for (let r = 0; r < 4; r++) { const off = ((ty * 4 + r) % 2) * 4; for (let c = -1; c < 3; c++) { const bx = x + c * 8 + off, x0 = Math.max(bx, x), x1 = Math.min(bx + 7, x + 16); if (x1 > x0) gR(g, x0, y + r * 4, x1 - x0, 3, s[base === 'cwallt' ? 2 : 1]); } }
      if (base === 'cwallf') { gR(g, x, y + 14, 16, 2, s[0]); if (ty === 3) { gR(g, x, y, 16, 3, s[2]); } }
      else if (ty === 0) { gR(g, x + 2, y, 5, 4, s[2]); gR(g, x + 10, y, 5, 4, s[2]); }
      break;
    }
    case 'plaza': { gR(g, x, y, 16, 16, pal.plaza); gR(g, x, y + 7, 16, 1, pal.plazaD); gR(g, x + (ty % 2 ? 4 : 11), y, 1, 7, pal.plazaD); gR(g, x + (ty % 2 ? 11 : 4), y + 8, 1, 8, pal.plazaD); break; }
  }
}
function tdGrass(g, x, y, pal, tx, ty, h) {
  const c = pal.grass; gR(g, x, y, 16, 16, c[1]);
  for (let i = 0; i < 5; i++) { const px = Math.floor(hash2(tx * 13 + i, ty * 7) * 15), py = Math.floor(hash2(tx * 3, ty * 13 + i) * 14); gP(g, x + px, y + py, c[i % 2 ? 0 : 2]); gP(g, x + px, y + py + 1, c[0]); }
}
function drawDeco(g, id, x, y, pal, pn, tx, ty, h) {
  const castle = pn === 'castle' || pn === 'roof';
  const n = id[1];
  if (!castle) {
    if (n === '1') { const c = pal.weed || '#3aa05a', d = pal.weedD || '#2a7a44'; for (let s = 0; s < 3; s++) { const bx = x + 4 + s * 4; for (let yy = 0; yy < 12 - s * 2; yy++) gP(g, bx + Math.round(Math.sin((yy + s * 2) * 0.7)), y + 15 - yy, yy % 3 ? c : d); } }
    else if (n === '2') { if (pal.coral) { const c = pal.coral; gR(g, x + 7, y + 6, 2, 10, c[0]); gR(g, x + 3, y + 8, 2, 8, c[2]); gR(g, x + 4, y + 11, 4, 1, c[2]); gR(g, x + 11, y + 9, 2, 7, c[3]); gR(g, x + 9, y + 11, 3, 1, c[0]); gP(g, x + 7, y + 5, c[1]); gP(g, x + 3, y + 7, c[1]); gP(g, x + 11, y + 8, c[1]); } else { gE(g, x + 8, y + 13, 5, 2, '#f090b0'); for (let i = 0; i < 5; i++) gR(g, x + 4 + i * 2, y + 8 + (i % 2), 1, 4, '#ffb0d0'); } }
    else if (n === '3') { const c = '#f09040'; gR(g, x + 6, y + 13, 5, 1, c); gR(g, x + 8, y + 11, 1, 5, c); gP(g, x + 7, y + 12, c); gP(g, x + 9, y + 12, c); gP(g, x + 8, y + 13, '#ffd0a0'); }
    else if (n === '4') { const gl = pal.glow || ['#60f0d0', '#b0ff70']; gR(g, x + 7, y + 6, 1, 10, '#2a5a4a'); gR(g, x + 4, y + 9, 1, 7, '#2a5a4a'); gR(g, x + 11, y + 8, 1, 8, '#2a5a4a'); gE(g, x + 7, y + 5, 1, 1, gl[0]); gP(g, x + 4, y + 8, gl[1]); gE(g, x + 11, y + 7, 1, 1, gl[1]); gP(g, x + 7, y + 5, '#ffffff'); }
    else if (n === '5') { const b = pal.bone || '#d8d0c0', bd = pal.boneD || '#a09888'; gR(g, x + 3, y + 12, 10, 1, b); for (let i = 0; i < 4; i++) gR(g, x + 4 + i * 2, y + 9 - (i % 2), 1, 3 + (i % 2), b); gE(g, x + 13, y + 12, 1, 1, bd); gP(g, x + 2, y + 12, bd); }
    return;
  }
  if (n === '6') { gR(g, x + 2, y, 12, 1, pal.gold || PAL.gold); gR(g, x + 4, y + 1, 8, 12, pal.banner); gR(g, x + 4, y + 13, 3, 2, pal.banner); gR(g, x + 9, y + 13, 3, 2, pal.banner); gR(g, x + 4, y + 1, 1, 12, pal.bannerD); gR(g, x + 6, y + 6, 4, 1, '#f4ecdc'); gP(g, x + 5, y + 5, '#f4ecdc'); gP(g, x + 5, y + 7, '#f4ecdc'); gP(g, x + 10, y + 5, '#f4ecdc'); gP(g, x + 10, y + 7, '#f4ecdc'); }
  else if (n === '7') {
    const rx = 3 + Math.min(4, Math.floor(tx / 40)), f = pal.frame || PAL.gold, d = PAL.dozer;
    gR(g, x + 1, y + 1, 14, 14, f); gR(g, x + 2, y + 2, 12, 12, '#3a2a3a'); gE(g, x + 8, y + 10, rx, 3, d.m); gE(g, x + 8, y + 6, 3, 2, d.m); gP(g, x + 7, y + 6, '#101018'); gP(g, x + 9, y + 6, '#101018'); gR(g, x + 6, y + 3, 5, 1, d.crown); gP(g, x + 6, y + 2, d.crown); gP(g, x + 10, y + 2, d.crown);
  }
  else if (n === '8') { const w = pal.wood; gR(g, x, y + 12, 16, 2, w[1]); gR(g, x, y + 14, 16, 1, w[0]); const j = pal.jar || ['#80a0c0', '#a0c0e0']; for (let i = 0; i < 2; i++) { gR(g, x + 2 + i * 7, y + 5, 5, 7, j[0]); gR(g, x + 3 + i * 7, y + 4, 3, 1, w[0]); gR(g, x + 3 + i * 7, y + 6, 1, 4, j[1]); } }
  else if (n === '9') { gR(g, x + 7, y + 7, 2, 7, pal.wood ? pal.wood[0] : '#5a3a22'); gR(g, x + 5, y + 6, 6, 2, pal.stone ? pal.stone[3] : '#9a9ab8'); gE(g, x + 8, y + 3, 2, 2, '#f09030'); gE(g, x + 8, y + 3, 1, 1, '#f8e070'); gP(g, x + 8, y, '#f09030'); }
}
function drawFgDeco(g, x, y, pal, pn, tx, ty) {
  const h = hash2(tx * 5, ty * 9);
  if (pn === 'shallows' || pn === 'reef') { const c = pal.weed; for (let i = 0; i < 3; i++) { const bx = x + 3 + Math.floor(h * 6) + i * 3; gR(g, bx, y - 3 + (i % 2), 1, 4 - (i % 2), i === 1 ? pal.weedD : c); } if (pn === 'reef' && h < 0.15) gE(g, x + 10, y - 1, 1, 1, pal.coral[1]); }
  else if (pn === 'trench' || pn === 'lair') { gR(g, x + 5 + Math.floor(h * 6), y - 2, 1, 3, pal.weed); if (h < 0.2) gP(g, x + 5 + Math.floor(h * 6), y - 3, pal.glow[1]); }
  else if (pn === 'roof') { gP(g, x + 4 + Math.floor(h * 8), y - 1, '#f06080'); gP(g, x + 4 + Math.floor(h * 8), y, '#347a34'); }
}

function bakeFar(kind, pal) {
  const f = { kind, grad: mkCanvas(W, H), layer: null, px: 0.3, py: 0.12, vert: false, shafts: false, sky: null };
  const g = f.grad.g, rng = mulberry32(kind.length * 977 + kind.charCodeAt(0));
  const bands = (gg, a, b, hh) => { const n = 14; for (let i = 0; i < n; i++) gR(gg, 0, Math.floor(i * hh / n), W, Math.ceil(hh / n) + 1, mixHex(a, b, i / (n - 1))); };
  const L = (w, h) => { f.layer = mkCanvas(w, h); return f.layer.g; };
  switch (kind) {
    case 'shallows': case 'reef': {
      bands(g, pal.top, pal.bot, H); f.shafts = true;
      const l = L(512, H + 40);
      for (let x = 0; x < 512; x += 2) { const hh = 40 + Math.sin(x / 60) * 14 + Math.sin(x / 23) * 6; gR(l, x, H + 40 - hh, 2, hh, pal.farD); }
      for (let i = 0; i < 7; i++) {
        const bx = Math.floor(rng() * 512), bh = 40 + Math.floor(rng() * 80);
        if (kind === 'reef') { gR(l, bx, H + 40 - bh, 4, bh, pal.far); for (let k = 0; k < 4; k++) { const yy = H + 40 - bh + Math.floor(rng() * bh * 0.7), dx = rng() < 0.5 ? -1 : 1, len = 6 + Math.floor(rng() * 10); gR(l, dx > 0 ? bx + 4 : bx - len, yy, len, 3, pal.far); gR(l, dx > 0 ? bx + 3 + len : bx - len, yy - 8, 3, 8, pal.far); } }
        else { gE(l, bx, H + 40 - 30, 16 + Math.floor(rng() * 20), 12 + Math.floor(rng() * 14), pal.far); }
      }
      break;
    }
    case 'rim': {
      bands(g, pal.top, '#06101c', H);
      const l = L(512, H + 40);
      gR(l, 0, H - 30, 512, 70, '#050a12');
      for (let x = 0; x < 512; x += 4) { const hh = 60 + Math.floor(Math.sin(x / 40) * 20 + rng() * 8); gR(l, x, H + 40 - hh - 50, 4, 20, pal.farD); }
      break;
    }
    case 'trench': case 'lair': {
      bands(g, pal.top, pal.bot, H); f.vert = kind === 'trench'; f.py = 0.3;
      const l = L(512, H);
      for (let i = 0; i < 10; i++) { const bx = Math.floor(rng() * 512), bw = 10 + Math.floor(rng() * 30); gR(l, bx, 0, bw, H, pal.far); gR(l, bx + 2, 0, 2, H, pal.farD); }
      for (let i = 0; i < 30; i++) gP(l, Math.floor(rng() * 512), Math.floor(rng() * H), pal.glow[i % 2]);
      if (kind === 'lair') { for (let x = 0; x < 512; x += 12) { const len = 8 + Math.floor(rng() * 26); for (let k = 0; k < len; k++) gR(l, x + Math.floor(k / 3), k, Math.max(1, 8 - Math.floor(k / 3)), 1, pal.farD); } for (let i = 0; i < 6; i++) { const bx = Math.floor(rng() * 480); gR(l, bx, H - 40, 14, 1, pal.boneD); for (let k = 0; k < 4; k++) gR(l, bx + 1 + k * 3, H - 46, 1, 6, pal.boneD); } }
      break;
    }
    case 'castle': case 'ballroom': case 'throne': {
      const c = PAL.area.castle, bg = c.bg; bands(g, bg[1], bg[0], H);
      const l = L(512, H + 60); f.px = 0.35;
      for (let y = 0; y < H + 60; y += 8) for (let x = 0; x < 512; x += 16) { const o = (y / 8) % 2 ? 8 : 0; gR(l, x + o, y, 15, 7, rng() < 0.5 ? bg[1] : bg[2]); }
      for (let x = 32; x < 512; x += 128) {
        gR(l, x, 40, 48, 150, bg[0]); gE(l, x + 24, 40, 24, 18, bg[0]);
        if (kind === 'castle') { gR(l, x + 8, 50, 32, 60, '#1a1a30'); gE(l, x + 24, 50, 16, 12, '#1a1a30'); gR(l, x + 23, 38, 2, 72, bg[0]); gR(l, x + 8, 78, 32, 2, bg[0]); }
        else { gR(l, x + 16, 30, 16, 170, bg[2]); gR(l, x + 14, 30, 20, 4, c.gold); gR(l, x + 14, 196, 20, 4, c.gold); }
      }
      if (kind === 'ballroom') for (let x = 96; x < 512; x += 128) { gR(l, x, 0, 1, 40, c.gold); gE(l, x, 44, 14, 3, c.gold); for (let k = -12; k <= 12; k += 6) { gR(l, x + k, 38, 1, 5, '#f8f0c0'); gP(l, x + k, 37, '#fff8a0'); } }
      if (kind === 'throne') { for (let x = 0; x < 512; x += 64) { gR(l, x, 0, 30, H + 60, c.banner); for (let k = 0; k < 30; k += 6) gR(l, x + k, 0, 2, H + 60, c.bannerD); gR(l, x, 0, 30, 6, c.gold); } }
      break;
    }
    case 'tower': {
      const c = PAL.area.castle, bg = c.bg; bands(g, bg[1], bg[0], H); f.vert = true; f.py = 0.5; f.px = 0.5;
      const l = L(256, 192);
      for (let y = 0; y < 192; y += 8) for (let x = 0; x < 256; x += 16) { const o = (y / 8) % 2 ? 8 : 0; gR(l, x + o, y, 15, 7, rng() < 0.5 ? bg[1] : bg[2]); }
      gR(l, 100, 60, 24, 36, '#141428'); gE(l, 112, 60, 12, 10, '#141428'); gR(l, 111, 50, 2, 46, bg[2]);
      f.sky = mkCanvas(W, H); const rs = PAL.area.roof; bands(f.sky.g, rs.sky, rs.skyL, H);
      for (let i = 0; i < 6; i++) { const cx = Math.floor(rng() * W), cy = 20 + Math.floor(rng() * 200); gE(f.sky.g, cx, cy, 20, 5, rs.cloud); gE(f.sky.g, cx + 10, cy - 4, 10, 4, rs.cloud); }
      break;
    }
    case 'roof': {
      bands(g, pal.sky, pal.skyL, H);
      for (let i = 0; i < 7; i++) { const cx = Math.floor(rng() * W), cy = 20 + Math.floor(rng() * 110); gE(g, cx, cy, 22, 5, pal.cloud); gE(g, cx + 8, cy - 4, 12, 5, pal.cloud); }
      const l = L(512, H + 40); f.px = 0.2;
      for (let x = 0; x < 512; x += 24) { const hh = 50 + Math.floor(rng() * 50); gR(l, x, H + 40 - hh, 20, hh, pal.far); gR(l, x - 2, H + 40 - hh - 6, 24, 6, pal.farD); if (rng() < 0.4) { gR(l, x + 8, H + 40 - hh - 26, 4, 20, pal.farD); gR(l, x + 12, H + 40 - hh - 26, 6, 4, PAL.area.castle.banner); } }
      break;
    }
    default: gR(g, 0, 0, W, H, pal.grass ? pal.grass[0] : '#101018');
  }
  return f;
}
function drawFar(lv, cx, cy) {
  const f = lv.far, pal = PAL.area[lv.A.pal];
  ctx.drawImage(f.grad, 0, 0);
  if (f.layer) {
    const lw = f.layer.width, lh = f.layer.height;
    let ox = -Math.round(cx * f.px) % lw; if (ox > 0) ox -= lw;
    if (f.vert) { let oy = -Math.round(cy * f.py) % lh; if (oy > 0) oy -= lh; for (let y = oy; y < H; y += lh) for (let x = ox; x < W; x += lw) ctx.drawImage(f.layer, x, y); }
    else { const oy = H - lh + Math.round(Math.max(0, lv.h * TS - H - cy) * f.py * 0.5); for (let x = ox; x < W; x += lw) ctx.drawImage(f.layer, x, oy); }
  }
  if (f.sky) { const sy = Math.round(22 * TS - cy); if (sy > 0) ctx.drawImage(f.sky, 0, 0, W, Math.min(H, sy), 0, 0, W, Math.min(H, sy)); }
  if (f.shafts) {
    ctx.fillStyle = pal.shaft;
    for (let i = 0; i < 4; i++) {
      const bx = ((i * 131 - cx * 0.5 + Math.sin(G.t * 0.4 + i) * 10) % (W + 120) + W + 120) % (W + 120) - 60, top = 32 - cy * 0.6;
      if (top > H) continue;
      ctx.beginPath(); ctx.moveTo(bx, top); ctx.lineTo(bx + 18, top); ctx.lineTo(bx + 70, H); ctx.lineTo(bx + 34, H); ctx.closePath(); ctx.fill();
    }
  }
}
function drawDynTiles(lv, cx, cy) {
  const x0 = Math.max(0, Math.floor(cx / TS)), y0 = Math.max(0, Math.floor(cy / TS)), x1 = Math.min(lv.w - 1, Math.floor((cx + W) / TS)), y1 = Math.min(lv.h - 1, Math.floor((cy + H) / TS));
  if (lv.water) {
    if (!lv.A.noSurface && y0 <= 1) {
      for (let x = Math.floor(cx / 4) * 4 - 4; x < cx + W + 4; x += 4) {
        const yy = 25 + Math.round(Math.sin((x + G.t * 40) / 14) * 1.2);
        ctx.fillStyle = '#e8fbff'; ctx.fillRect(x, yy, 4, 1); ctx.fillStyle = 'rgba(232,251,255,0.35)'; ctx.fillRect(x, yy + 1, 4, 2);
      }
    }
    const fr = Math.floor(G.t * 1.5);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (lv.t[ty * lv.w + tx] === '^') spr('urchin_' + ((fr + tx) % 2), tx * TS + 8, ty * TS + 8);
  }
  for (const r of lv.rooms) if (r.sealed.length) for (const i of r.sealed) drawSeal(lv, (i % lv.w) * TS, Math.floor(i / lv.w) * TS, i);
}
function drawSeal(lv, x, y, i) {
  const k = clamp((lv.sealT || 0) / 0.3, 0, 1);
  if (lv.sealKind === 'bubble') {
    for (let j = 0; j < 3; j++) {
      const bx = x + 4 + ((i * 7 + j * 5) % 9), by = y + 3 + j * 5 + Math.round(Math.sin(G.t * 3 + i + j) * 1.5), r = Math.max(1, Math.round((2 + ((i + j) % 2)) * k));
      ctx.fillStyle = 'rgba(216,244,255,0.35)'; ctx.fillRect(bx - r, by - r, r * 2 + 1, r * 2 + 1);
      ctx.fillStyle = '#e8fbff'; ctx.fillRect(bx - r, by - r, 1, 1); ctx.fillRect(bx - r, by, 1, 1); ctx.fillRect(bx, by - r, 1, 1);
    }
  } else {
    const hh = Math.round(16 * k);
    ctx.fillStyle = '#2a2a38'; ctx.fillRect(x, y, 16, hh);
    ctx.fillStyle = '#8a8aa0'; for (let bx = 1; bx < 16; bx += 5) ctx.fillRect(x + bx, y, 2, hh);
    ctx.fillStyle = '#c8c8d8'; for (let bx = 1; bx < 16; bx += 5) ctx.fillRect(x + bx, y, 1, hh);
    if (hh > 8) { ctx.fillStyle = '#5a5a70'; ctx.fillRect(x, y + 6, 16, 2); }
  }
}
const DARKC = mkCanvas(W, H);
function darkHole(g, x, y, r, s) {
  for (const q of [[1, 0.3], [0.78, 0.3], [0.55, 0.4]]) { g.fillStyle = 'rgba(0,0,0,' + (q[1] * s).toFixed(3) + ')'; gE(g, Math.round(x), Math.round(y), Math.round(r * q[0]), Math.round(r * q[0] * 0.9), g.fillStyle); }
}
function drawOverlayTint(lv, cx, cy) {
  const pal = PAL.area[lv.A.pal];
  if (pal.tint) { ctx.fillStyle = pal.tint; ctx.fillRect(0, 0, W, H); }
  const dk = lv.A.dark; if (!dk) return;
  const p = G.p, depth = p ? clamp(p.y / (lv.h * TS), 0, 1) : 0, a = lerp(dk[0], dk[1], depth);
  const g = DARKC.g;
  g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H); g.fillStyle = 'rgba(2,4,12,' + a.toFixed(3) + ')'; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'destination-out';
  if (p) darkHole(g, p.x - cx, p.y - 10 - cy, 64, 1);
  if (!lv.glows) { lv.glows = []; for (let i = 0; i < lv.t.length; i++) if (lv.t[i] === '4') lv.glows.push([(i % lv.w) * TS + 8, Math.floor(i / lv.w) * TS + 8]); }
  for (const q of lv.glows) if (onScreen(q[0], q[1], 30)) darkHole(g, q[0] - cx, q[1] - cy, 20, 0.6);
  for (const e of G.ents) if (!e.dead && ((e.type === 'jelly' && e.glowy) || e.type === 'kibble' || e.type === 'treat' || e.type === 'heart') && onScreen(e.x, e.y, 40)) darkHole(g, e.x - cx, e.y - 8 - cy, e.type === 'jelly' ? (e.state === 'tele' ? 34 : 22) : 12, 0.6);
  if (G.ky) darkHole(g, G.ky.x - cx, G.ky.y - 8 - cy, 20, 0.5);
  g.globalCompositeOperation = 'source-over';
  ctx.drawImage(DARKC, 0, 0);
}

function drawParts() {
  for (const q of G.parts) {
    const k = 1 - q.t / q.life;
    let x = q.x, y = q.y;
    if (q.home) { x = lerp(q.x, q.hx, q.t / q.life); y = lerp(q.y, q.hy, q.t / q.life); }
    x = Math.round(x); y = Math.round(y);
    ctx.fillStyle = q.col;
    switch (q.k) {
      case 'puff': { ctx.globalAlpha = k; const s = Math.max(1, Math.round(q.sz * (0.4 + k * 0.6))); ctx.fillRect(x - (s >> 1), y - (s >> 1), s, s); ctx.globalAlpha = 1; break; }
      case 'spark': ctx.fillRect(x, y, 1, 1); if (k > 0.5) ctx.fillRect(Math.round(x - q.vx * 0.02), Math.round(y - q.vy * 0.02), 1, 1); break;
      case 'bubble': if (q.sz <= 1) ctx.fillRect(x, y, 1, 1); else { ctx.fillRect(x - 1, y, 1, 1); ctx.fillRect(x + 1, y, 1, 1); ctx.fillRect(x, y - 1, 1, 1); ctx.fillRect(x, y + 1, 1, 1); } break;
      case 'streak': { const len = q.len || 6; ctx.globalAlpha = Math.min(1, k * 2); if (Math.abs(q.vx) >= Math.abs(q.vy)) ctx.fillRect(q.vx > 0 ? x - len : x, y, len, 1); else ctx.fillRect(x, q.vy > 0 ? y - len : y, 1, len); ctx.globalAlpha = 1; break; }
      case 'heart': ctx.globalAlpha = Math.min(1, k * 2); ctx.fillRect(x - 2, y, 5, 1); ctx.fillRect(x - 2, y - 1, 2, 1); ctx.fillRect(x + 1, y - 1, 2, 1); ctx.fillRect(x - 1, y + 1, 3, 1); ctx.fillRect(x, y + 2, 1, 1); ctx.globalAlpha = 1; break;
      case 'z': ctx.globalAlpha = Math.min(1, k * 2); text('Z', x, y, q.col, 1, true, 'c'); ctx.globalAlpha = 1; break;
      default: ctx.fillRect(x, y, q.sz, q.sz);
    }
  }
  for (const t of G.texts) {
    const a = t.t < t.life - 0.3 ? 1 : Math.max(0, (t.life - t.t) / 0.3), hw = textWidth(t.s) * t.sc / 2 + 2;
    ctx.globalAlpha = a; text(t.s, clamp(t.x, G.cam.x + hw, G.cam.x + W - hw), Math.max(G.cam.y + 4, t.y), t.col, t.sc, true, 'c');
  }
  ctx.globalAlpha = 1;
}
function drawDebugBoxes() {
  const sb = (b, c) => { if (!b) return; ctx.fillStyle = c; ctx.fillRect(Math.round(b.x), Math.round(b.y), Math.round(b.w), 1); ctx.fillRect(Math.round(b.x), Math.round(b.y + b.h - 1), Math.round(b.w), 1); ctx.fillRect(Math.round(b.x), Math.round(b.y), 1, Math.round(b.h)); ctx.fillRect(Math.round(b.x + b.w - 1), Math.round(b.y), 1, Math.round(b.h)); };
  const p = G.p;
  if (p) { sb(boxOf(p), '#40ff60'); if (p.atk && p.atk.f >= p.atk.d.su && p.atk.f < p.atk.d.su + p.atk.d.ac) sb(atkBox(p, p.atk), '#ff3040'); }
  for (const e of G.ents) {
    if (e.dead) continue;
    const T = TYPES[e.type];
    if (T.enemy || T.boss || T.hostile) { const hb = T.hurt ? T.hurt(e) : boxOf(e); sb(hb, '#ffe040'); }
    if (e.atkBox) sb(e.atkBox, '#ff3040');
    if (e.ring) pixRing(e.ring.x, e.ring.y, e.ring.r1, '#ff3040', 1, false);
    if (e.fish) for (const f of e.fish) if (!f.dead) sb({ x: f.x - 3, y: f.y - 2, w: 6, h: 4 }, '#ffe040');
  }
  for (const s of G.lv.solids) sb(s, '#40a0ff');
}
function drawDying(e) {
  const T = TYPES[e.type], cy = e.y - e.h / 2, k = clamp(e.dying / 0.3, 0, 1);
  ctx.save(); ctx.globalAlpha = k; ctx.translate(0, Math.round(cy)); ctx.scale(1, -1); ctx.translate(0, -Math.round(cy));
  const f = e.flash; e.flash = 1; T.draw(e); e.flash = f;
  ctx.restore(); ctx.globalAlpha = 1;
}
function pixRing(x, y, r, col, sz, dash) {
  if (r < 1) return;
  const n = Math.max(8, Math.ceil(r * 6.3 / Math.max(1, sz * 1.5)));
  ctx.fillStyle = col;
  for (let i = 0; i < n; i++) { if (dash && (i % 4) >= 2) continue; const a = i / n * Math.PI * 2; ctx.fillRect(Math.round(x + Math.cos(a) * r - sz / 2), Math.round(y + Math.sin(a) * r - sz / 2), sz, sz); }
}
function shadow(x, y, w, a) {
  x = Math.round(x); y = Math.round(y); ctx.fillStyle = 'rgba(0,0,0,' + (a || 0.3) + ')';
  ctx.fillRect(x - (w >> 1) + 1, y - 1, w - 2, 1); ctx.fillRect(x - (w >> 1), y, w, 1); ctx.fillRect(x - (w >> 1) + 1, y + 1, w - 2, 1);
}
function stars(x, y, t) { for (let i = 0; i < 3; i++) { const a = t * 5 + i * 2.1; ctx.fillStyle = i % 2 ? '#fff8a0' : '#f0c040'; ctx.fillRect(Math.round(x + Math.cos(a) * 9), Math.round(y + Math.sin(a) * 3), 2, 2); } }
function bang(x, y, col) { const b = Math.round(Math.sin(G.t * 10) * 1); text('!', x, y - 8 + b, col || PAL.warn, 1, true, 'c'); }
function sprC(name, cx, cy, ang, flip, fl, alpha) {
  const c = (fl && SPR[name + '_w']) || SPR[name]; if (!c) return;
  ctx.save(); if (alpha !== undefined) ctx.globalAlpha = alpha;
  ctx.translate(Math.round(cx), Math.round(cy)); ctx.rotate(ang); if (flip) ctx.scale(-1, 1);
  ctx.drawImage(c, -Math.round(c.width / 2), -Math.round(c.height / 2)); ctx.restore();
}
function blink(hz) { return Math.floor(G.t * hz) % 2 === 0; }

function haloFrame(p) {
  const pre = p.helmet ? 'haloh_' : 'halo_';
  if (p.mode === 'td') {
    const f = Math.floor(p.anim * 8) % 4;
    if (p.tdDir === 's') { if (p.atk) return 'halo_swat'; return p.moving ? 'halo_run_' + f : (p.blinkT < 0 ? 'halo_blink' : 'halo_idle_' + (Math.floor(p.anim * 2) % 2)); }
    if (p.atk) return 'halo_td_' + p.tdDir + '_swat';
    return 'halo_td_' + p.tdDir + '_' + (p.moving ? f : 0);
  }
  if (p.dead) return pre + 'faint';
  if (p.hurtT > 0) return pre + 'hurt';
  if (p.dashT > 0) return pre + 'dash';
  if (p.atk) { const k = p.atk.k; return pre + (k === 's2' ? 'atk2' : k === 's3' ? 'atk3' : k === 'up' ? 'atkup' : k === 'down' ? 'atkdown' : 'atk1'); }
  if (p.mode === 'water') { const i = Math.floor(p.anim * (p.moving ? 8 : 3)) % 4; return (p.tilt && p.helmet ? 'haloh_swim_' + i + '_' + p.tilt : pre + 'swim_' + i); }
  if (!p.grounded) return pre + (p.vy < 0 ? 'jump' : 'fall');
  if (p.moving) return pre + 'run_' + (Math.floor(p.anim * 10) % 4);
  return pre + (p.blinkT < 0 ? 'blink' : 'idle_' + (Math.floor(p.anim * 2) % 2));
}
function drawHalo(p) {
  if (p.hide) return;
  if (p.mode === 'td' && p.helmet) { drawHaloBody(p); spr('fishbowl', p.x, p.y - 3, false, false, 0.75); return; }
  drawHaloBody(p);
}
function drawHaloBody(p) {
  for (const gh of p.ghosts) spr(gh.name, gh.x, gh.y, gh.flip, true, 0.35 * (1 - gh.t / 0.18));
  if (p.inv > 0 && !p.dead && Math.floor(p.inv * 30) % 2 === 1) return;
  if (p.mode === 'td' || (p.mode === 'land' && p.grounded)) shadow(p.x, p.y, 12);
  const name = haloFrame(p);
  if (p.dead && p.deadT < 0.45) { sprC(name, p.x, p.y - 12, p.deadT * 18 * (p.face < 0 ? -1 : 1), p.face < 0, false); return; }
  spr(name, p.x, p.y, p.face < 0, p.flash > 0);
}
function drawHaloTop(p) {
  if (G.lv.A.dark && !(p.inv > 0 && Math.floor(p.inv * 30) % 2 === 1)) spr(haloFrame(p), p.x, p.y, p.face < 0, p.flash > 0);
  const s = p.slash; if (!s || p.dead) return;
  const a = clamp(1 - s.t / 0.12, 0, 1), d = ATK[s.k], b = atkBox(p, { k: s.k, d });
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2, big = s.k === 's3', name = big ? 'fx_slash3' : 'fx_slash';
  let ang = 0, flip = p.face < 0;
  if (s.k === 'up' || (p.mode === 'td' && p.tdDir === 'u')) { ang = -Math.PI / 2; flip = false; }
  else if (s.k === 'down' || (p.mode === 'td' && p.tdDir === 'd')) { ang = Math.PI / 2; flip = false; }
  sprC(name, cx, cy, ang, flip, false, a);
}
function drawKylo(k) {
  if (G.lv.td) { shadow(k.x, k.y, 10); spr(k.moving ? 'kylo_walk_' + (Math.floor(k.anim * 6) % 2) : 'kylo_idle_' + (Math.floor(k.anim * 2) % 2), k.x, k.y, k.face < 0); return; }
  spr(k.charge > 0 ? 'kylo_cast' : 'kylo_float_' + (Math.floor(k.anim * 3) % 2), k.x, k.y, k.face < 0);
  if (Math.floor(k.anim * 2) % 3 === 0) { ctx.fillStyle = '#80c8f0'; ctx.fillRect(Math.round(k.x - k.face * 4), Math.round(k.y + 1 + (k.anim * 20) % 6), 1, 1); }
}

function drawCheckpoint(e) {
  const g = e.glow || 0;
  if (G.lv.water) {
    spr(e.on ? 'clam_1' : 'clam_0', e.x, e.y);
    if (e.on) { ctx.fillStyle = 'rgba(240,230,255,' + (0.5 + 0.4 * Math.sin(G.t * 4)).toFixed(2) + ')'; ctx.fillRect(Math.round(e.x - 2), Math.round(e.y - 8), 4, 3); if (Math.random() < 0.05) bubbleP(e.x, e.y - 10, 1); }
  } else spr(e.on ? 'flag_1' : 'flag_0', e.x, e.y);
  if (g > 0) pixRing(e.x, e.y - 12, 20 * (1 - g) + 6, 'rgba(255,240,160,' + g.toFixed(2) + ')', 2, false);
}
function drawKibble(e) {
  const by = Math.round(Math.sin(G.t * 4 + e.x * 0.1) * 1.5);
  spr('pk_kibble', e.x, e.y + by);
  if ((Math.floor(G.t * 3 + e.x) % 7) === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(e.x + 2), Math.round(e.y - 7 + by), 1, 1); }
}
function drawHeartPickup(e) {
  if (!e.perm && e.t > 6 && blink(10)) return;
  const by = Math.round(Math.sin(G.t * 5) * 1.5);
  spr('pk_heart', e.x, e.y + by);
}
function drawTreat(e) {
  const by = Math.round(Math.sin(G.t * 3) * 2);
  spr('pk_treat', e.x, e.y + by);
  if (blink(3)) { ctx.fillStyle = '#fff8c0'; ctx.fillRect(Math.round(e.x - 8), Math.round(e.y - 14 + by), 1, 1); ctx.fillRect(Math.round(e.x + 9), Math.round(e.y - 4 + by), 1, 1); }
}
function drawSign(e) { spr('sign', e.x, e.y); }
function bubbleBox(lines, x, y, col) {
  let w = 0; for (const l of lines) w = Math.max(w, textWidth(l));
  const bw = w + 10, bh = lines.length * 9 + 6;
  const bx = Math.round(clamp(x - bw / 2, G.cam.x + 2, G.cam.x + W - bw - 2)), by = Math.round(Math.max(G.cam.y + 2, y - bh));
  ctx.fillStyle = PAL.uiDark; ctx.fillRect(bx, by, bw, bh); ctx.fillStyle = PAL.uiLight; ctx.fillRect(bx, by, bw, 1); ctx.fillRect(bx, by + bh - 1, bw, 1); ctx.fillRect(bx, by, 1, bh); ctx.fillRect(bx + bw - 1, by, 1, bh);
  lines.forEach((l, i) => text(l, bx + 5, by + 4 + i * 9, col || PAL.uiLight, 1, false));
}
function drawSignText(e) { if (!e.show) return; bubbleBox(wrap(LINES[e.text] || '', 180), e.x, e.y - 38); }
function drawProp(e) {
  const by = e.bob ? Math.round(Math.sin(G.t * 2 + e.x * 0.05) * 2) : 0;
  if (e.spr === 'plight') { ctx.fillStyle = 'rgba(255,240,160,0.18)'; ctx.fillRect(Math.round(e.x - 10), Math.round(e.y - 16), 20, 14); }
  spr(e.spr, e.x, e.y + by);
}
function drawPropTop(e) {
  if (e.talkable) drawTalkMark(e, sprH(e.spr) + 2);
  if (e.label) { const hh = sprH(e.spr); text(LINES[e.label], e.x, e.y - hh - 10, PAL.gold, 1, true, 'c'); }
}
function drawTalkMark(e, hh) { if (G.lv && G.lv.td && G.p && !G.script && !G.dlg && talkTarget(G.p) === e) bang(e.x, e.y - hh, PAL.gold); }
function drawLabel(e) { const s = LINES[e.text] || '', hw = textWidth(s) / 2 + 4, mw = G.lv ? G.lv.w * TS : W; text(s, clamp(e.x, hw, mw - hw), e.y, PAL.gold, 1, true, 'c'); }
function drawExit(e) {
  const lv = G.lv;
  if (!lv.water) { spr('bossdoor', e.x, e.y); if (blink(2)) text('>', e.x, e.y - 60, PAL.gold, 1, true, 'c'); return; }
  const ex = lv.exits, down = ex.filter(q => q.ty === ex[0].ty).length > 1;
  for (let i = 0; i < 6; i++) {
    const a = G.t * 3 + i * 1.05, r = 6 + (i % 3) * 3;
    ctx.fillStyle = i % 2 ? '#e8fbff' : 'rgba(216,244,255,0.5)';
    ctx.fillRect(Math.round(e.x + Math.cos(a) * r), Math.round(e.y - 16 + Math.sin(a) * r * (down ? 0.4 : 1)), 2, 2);
  }
  if (blink(2)) text(down ? 'V' : '>', e.x, e.y - 20, PAL.gold, 1, true, 'c');
}
function drawBowlPlat(e) { spr('plat_bowl', e.x + e.w / 2, e.y); }
function drawLedge(e) {
  const s = PAL.area.castle.stone, x = Math.round(e.x), y = Math.round(e.y);
  ctx.fillStyle = s[2]; ctx.fillRect(x, y, e.w, 6); ctx.fillStyle = s[3]; ctx.fillRect(x, y, e.w, 1); ctx.fillStyle = s[0]; ctx.fillRect(x, y + 6, e.w, 2);
  ctx.fillStyle = PAL.area.castle.gold; for (let i = 6; i < e.w; i += 12) ctx.fillRect(x + i, y + 8, 2, 3);
}
function drawBowlProp(e) { spr(e.full ? e.spr : 'bowl_empty', e.x, e.y); }
function drawSugar(e) { spr(e.awakeT > 0 ? 'sugar_open' : 'sugar_sleep_' + (Math.floor(G.t * 0.8) % 2), e.x, e.y); }
function drawMoth(e) { spr('moth_' + (Math.floor(G.t * 16) % 2), e.x, e.y); }
function drawHouseDoor(e) { if (!G.flags.doorOpen && !G.flags.doorAjar) spr('door_house', e.x, e.y); }
function drawNpc(e) {
  shadow(e.x, e.y, e.pup !== undefined ? 10 : 16);
  const f = Math.floor((e.anim || 0) * 2) % 2;
  spr(e.pup !== undefined ? 'pup' + e.pup + '_idle_' + f : 'npc' + e.k + '_idle_' + f, e.x, e.y, e.face < 0);
}
function drawParkBall(e) { shadow(e.x, e.y, 8); spr('p_ball', e.x, e.y - 5 - Math.round(Math.min(4, Math.hypot(e.vx, e.vy) / 50))); }
function drawPortcullis(e) {
  const k = e.open || 0;
  ctx.save(); ctx.beginPath(); ctx.rect(Math.round(e.x - 34), Math.round(e.y - 36), 68, 36); ctx.clip();
  spr('portcullis', e.x, e.y - Math.round(k * 34)); ctx.restore();
}
function drawRockGate(e) {
  const k = ease(e.open || 0), x = e.tx * TS, y = e.ty * TS, w = e.tw * TS, h = e.th * TS, hw = w / 2, off = Math.round(k * (hw + 8));
  if (k >= 1) return;
  const r = PAL.area.trench.rock, jit = e.state === 'opening' ? Math.round(Math.sin(G.t * 60)) : 0;
  for (const s of [-1, 1]) {
    const bx = Math.round(s < 0 ? x - off : x + hw + off) + jit;
    ctx.fillStyle = r[1]; ctx.fillRect(bx, y, hw, h); ctx.fillStyle = r[2]; ctx.fillRect(bx, y, hw, 2); ctx.fillStyle = r[0]; ctx.fillRect(bx, y + h - 3, hw, 3);
    const ex = s < 0 ? bx + hw - 22 : bx + 10;
    ctx.fillStyle = r[0]; ctx.fillRect(ex, y + 12, 12, 4); ctx.fillRect(s < 0 ? ex : ex + 6, y + 8, 6, 3);
    ctx.fillStyle = PAL.area.trench.glow[0]; ctx.fillRect(ex + 4, y + 14, 3, 2);
    ctx.fillStyle = r[0]; ctx.fillRect(s < 0 ? bx + hw - 26 : bx, y + 30, 26, 3); ctx.fillRect(s < 0 ? bx + hw - 26 : bx + 23, y + 27, 3, 3);
  }
}

function drawCrab(e) {
  const pre = e.chef ? 'crabc_' : 'crab_';
  const n = e.state === 'tele' ? 'tele' : e.state === 'atk' ? 'pinch' : e.state === 'walk' ? 'walk_' + (Math.floor(e.anim * 6) % 2) : 'walk_0';
  const jx = e.state === 'tele' ? Math.round(Math.sin(G.t * 50)) : 0;
  spr(pre + n, e.x + jx, e.y, e.face < 0, e.flash > 0 || (e.state === 'tele' && blink(12)));
}
function drawJelly(e) {
  const n = e.state === 'tele' || e.state === 'zap' ? 'jelly_glow' : 'jelly_' + (Math.floor(e.anim * 3) % 2);
  if (e.glowy) { ctx.fillStyle = 'rgba(96,240,208,0.25)'; ctx.fillRect(Math.round(e.x - 8), Math.round(e.y - 18), 16, 12); }
  spr(n, e.x, e.y, false, e.flash > 0 || (e.state === 'tele' && blink(10)));
}
function drawJellyWarn(e) {
  if (e.state === 'tele') pixRing(e.x, e.y - 7, 26, blink(10) ? PAL.warn : '#ffd0e0', 2, true);
  else if (e.state === 'zap') { pixRing(e.x, e.y - 7, 26, '#f8f080', 2, false); for (let i = 0; i < 6; i++) { const a = G.t * 20 + i; ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(e.x + Math.cos(a) * rnd(8, 24)), Math.round(e.y - 7 + Math.sin(a) * rnd(8, 24)), 2, 1); } }
}
function drawPuffer(e) {
  let n = 'puffer_' + (Math.floor(e.anim * 4) % 2), jx = 0;
  if (e.state === 'tele') { n = 'puffer_half'; jx = Math.round(Math.sin(G.t * 60)); }
  else if (e.state === 'big') n = 'puffer_big';
  else if (e.state === 'dizzy') n = 'puffer_dizzy';
  spr(n, e.x + jx, e.y, e.face < 0, e.flash > 0);
  if (e.state === 'dizzy') stars(e.x, e.y - 16, G.t);
}
function drawEel(e) {
  const c = PAL.eel;
  if (e.state === 'tele' || e.state === 'hide') {
    if (e.state === 'tele' && blink(8)) { ctx.fillStyle = c.e; const px = Math.round(e.bx + e.dx * 3 - e.dy * 2), py = Math.round(e.by + e.dy * 3 - e.dx * 2); ctx.fillRect(px, py, 1, 1); ctx.fillRect(px + e.dy * 4, py + e.dx * 4, 1, 1); }
    return;
  }
  const L = Math.max(0, e.ext - 12), ang = Math.atan2(e.dy, e.dx);
  for (let d = 0; d < L; d += 2) {
    const x = Math.round(e.bx + e.dx * d - Math.abs(e.dy) * 3), y = Math.round(e.by + e.dy * d - Math.abs(e.dx) * 3);
    ctx.fillStyle = c.ol; ctx.fillRect(x - Math.abs(e.dy), y - Math.abs(e.dx), e.dx ? 2 : 8, e.dy ? 2 : 8);
    ctx.fillStyle = (d / 2) % 3 === 0 ? c.d : c.m; ctx.fillRect(x, y, e.dx ? 2 : 6, e.dy ? 2 : 6);
  }
  const hx = e.bx + e.dx * L, hy = e.by + e.dy * L;
  ctx.save(); ctx.translate(Math.round(hx), Math.round(hy)); ctx.rotate(ang);
  const sp = SPR[(e.state === 'lunge' || e.state === 'out' ? 'eel_open' : 'eel_head') + (e.flash > 0 ? '_w' : '')];
  if (sp) ctx.drawImage(sp, -sp.anc[0], -sp.anc[1]);
  ctx.restore();
}
function drawSwarm(e) {
  for (const f of e.fish) if (!f.dead) spr(f.tele > 0 ? 'minnow_f' : 'minnow_' + (Math.floor((G.t + f.ph) * 8) % 2), f.x, f.y, f.vx < 0, f.tele > 0 && blink(14));
}
function drawPatrolDog(e) {
  let n = 'pdog_walk_' + (Math.floor(e.anim * 6) % 2), jx = 0;
  if (e.state === 'tele') { n = 'pdog_tele'; jx = Math.round(Math.sin(G.t * 50)); }
  else if (e.state === 'lunge') n = 'pdog_lunge';
  else if (e.state === 'pant') n = 'pdog_pant_' + (Math.floor(e.anim * 5) % 2);
  shadow(e.x, e.y, 14);
  spr(n, e.x + jx, e.y, e.face < 0, e.flash > 0);
}
function drawBang(e) { if (e.state === 'tele') bang(e.x, e.y - 22); }
function drawPuppy(e) {
  const n = e.state === 'squish' ? 'puppy_squish' : e.state === 'hop' ? 'puppy_hop' : 'puppy_idle_' + (Math.floor(e.anim * 3) % 2);
  shadow(e.x, e.y, 10);
  spr(n, e.x, e.y, e.face < 0, e.flash > 0);
}
function drawBallDog(e) {
  const n = e.state === 'tele' ? 'bdog_wind_' + (Math.floor(e.t * 10) % 2) : e.state === 'throw' ? 'bdog_throw' : 'bdog_idle_' + (Math.floor(e.anim * 2) % 2);
  shadow(e.x, e.y, 14);
  spr(n, e.x, e.y, e.face < 0, e.flash > 0 || (e.state === 'tele' && blink(12)));
}
function drawTennisBall(e) { spr('p_ball', e.x, e.y - 3, false, e.friendly && blink(12)); }
function drawBolt(e) { spr('p_bolt_' + (Math.floor(G.t * 12) % 2), e.x, e.y); }
function drawFallRock(e) { if (e.state === 'fall') spr('p_rock', e.x, e.y - 5); }
function drawFallRockWarn(e) { if (blink(10) || e.state === 'fall') shadow(e.x, e.floorY - 1, 14, e.state === 'fall' ? 0.45 : 0.6); if (e.state === 'warn' && blink(10)) { ctx.fillStyle = PAL.warn; ctx.fillRect(Math.round(e.x - 7), Math.round(e.floorY - 2), 14, 1); } }
function drawProj(e) {
  if (e.txt) { text(e.txt, e.x, e.y - e.h, blink(10) ? '#9ad0ff' : '#ffffff', 1, '#0a1650', 'c'); return; }
  spr(e.spr, e.x, e.y - e.h / 2);
}
function drawRingFx(e) {
  const a = clamp(1 - e.t / e.dur, 0.2, 1);
  ctx.globalAlpha = a; pixRing(e.x, e.y, e.r, e.col || '#ffffff', 2, false); if (e.r > 6) pixRing(e.x, e.y, e.r - 4, e.col || '#ffffff', 1, true); ctx.globalAlpha = 1;
}
function drawWaveFx(e) {
  const x = Math.round(e.x), y = Math.round(e.y), hh = e.h;
  if (e.kind === 'twister') {
    for (let i = 0; i < 5; i++) { const w = 4 + i * 2, o = Math.round(Math.sin(G.t * 20 + i) * 2); ctx.fillStyle = i % 2 ? '#d8d0e8' : '#a8a0c0'; ctx.fillRect(x - w / 2 + o, y - 4 - i * 4, w, 3); }
    return;
  }
  const lw = G.lv.water;
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? (lw ? '#d8f4ff' : '#e8e0d0') : (lw ? '#a8d8f0' : '#b8a890'); const h2 = hh - i * 3 - Math.round(Math.sin(G.t * 30 + i) * 1); ctx.fillRect(x - 5 + i * 3 * sgn(e.vx), y - h2, 3, h2); }
}

function drawCage(e) {
  const x = Math.round(e.x), top = Math.round(e.y), by = top + e.len, gold = e.who === 'bella';
  ctx.fillStyle = gold ? '#b08820' : '#6a6a7a'; for (let y = top; y < by; y += 3) ctx.fillRect(x, y, 1, 2);
  const inY = by + (gold ? 32 : 34);
  if (!e.open) spr((e.who === 'kylo' ? 'kylo_idle_' : 'bella_idle_') + (Math.floor(G.t * 2) % 2), x, inY, true);
  spr((gold ? 'bcage' : 'gcage') + (e.open ? '_open' : ''), x, by + (gold ? 35 : 37));
}
function drawActor(e) {
  const f = e.frames ? '_' + (Math.floor(G.t * (e.mv ? 8 : 4)) % e.frames) : '';
  const by = e.bob ? Math.round(Math.sin(G.t * 3) * 2) : 0;
  if (e.sc && e.sc < 1) { ctx.save(); ctx.translate(Math.round(e.x), Math.round(e.y)); ctx.scale(e.sc, e.sc); drawActorBody(e, f, 0, by); ctx.restore(); return; }
  drawActorBody(e, f, e.x, e.y + by);
}
function drawActorBody(e, f, x, y) {
  spr(e.spr + f, x, y, e.face < 0);
  if (e.riders) e.riders.forEach((r, i) => spr(r, x - 22 + i * 11, y - 19 + (i % 2) * 2, true));
}

function bossFl(e) { return e.flash > 0; }
function drawBabyboo(e) {
  const c = e.y - 9, fl = bossFl(e); let n = 'bb_idle_' + (Math.floor(e.anim * 3) % 2), jx = 0;
  switch (e.state) {
    case 'evil': n = 'bb_evil'; jx = Math.round(Math.sin(G.t * 60)); break;
    case 'lunge': n = 'bb_lunge'; break;
    case 'dizzy': n = 'bb_dizzy'; break;
    case 'pucker': n = 'bb_pucker'; jx = Math.round(Math.sin(G.t * 30)); break;
    case 'angry': n = 'bb_angry'; jx = Math.round(Math.sin(G.t * 70)); break;
    case 'dead': n = 'bb_cry'; break;
  }
  if (e.state === 'spin') { sprC('bb_angry', e.x, c, e.t * 25, e.face < 0, fl); return; }
  spr(n, e.x + jx, c, e.face < 0, fl);
  if (e.state === 'dizzy') stars(e.x, c - 16, G.t);
}
function drawRover(e) {
  const c = e.y - 9, fl = bossFl(e);
  if (e.ghost) for (const g of e.ghost) spr('rv_dash', g.x, g.y - 9, g.face < 0, true, 0.35 * (1 - g.t / 0.2));
  let n = 'rv_idle_' + (Math.floor(e.anim * 5) % 2), up = false, jx = 0;
  switch (e.state) {
    case 'aim': case 'blank': n = 'rv_aim'; break;
    case 'dash': n = 'rv_dash'; break;
    case 'laugh': case 'dead': n = 'rv_laugh_' + (Math.floor(e.anim * 8) % 2); up = true; break;
    case 'coil': n = 'rv_coil'; jx = Math.round(Math.sin(G.t * 60)); break;
    case 'whip': sprC('rv_coil', e.x, c, e.t * 40, e.face < 0, fl); return;
    case 'haha': n = 'rv_haha'; break;
  }
  if (up) sprT(n, e.x, c, e.face < 0, true, fl); else spr(n, e.x + jx, c, e.face < 0, fl || (e.state === 'coil' && blink(14)));
}
function drawCherry(e) {
  const c = e.y - 10, fl = bossFl(e); let n = 'ch_idle_' + (Math.floor(e.anim * 3) % 2), jx = 0, red = false;
  switch (e.state) {
    case 'snort': case 'reflash': n = 'ch_snort_' + (Math.floor(e.t * 12) % 2); jx = Math.round(Math.sin(G.t * 60)); red = blink(12); break;
    case 'charge': n = 'ch_charge'; break;
    case 'stun': n = 'ch_stun'; break;
    case 'puff': n = 'ch_puff'; jx = Math.round(Math.sin(G.t * 40)); break;
    case 'shout': n = 'ch_shout'; break;
    case 'back': case 'slap': n = 'ch_back'; jx = e.state === 'back' ? Math.round(Math.sin(G.t * 40)) : 0; break;
    case 'dead': n = 'ch_sad'; break;
  }
  const a = e.fade ? 1 - e.fade : undefined;
  spr(n, e.x + jx, c, e.face < 0, fl || red, a);
  if (e.state === 'stun') stars(e.x, c - 18, G.t);
}
function drawChicken(e) {
  const fl = bossFl(e); let n = 'ck_idle_' + (Math.floor(e.anim * 1.5) % 2), jx = 0;
  switch (e.state) {
    case 'open': n = 'ck_open'; jx = Math.round(Math.sin(G.t * 30)); break;
    case 'bite': n = 'ck_bite'; break;
    case 'stuck': n = 'ck_stuck'; break;
    case 'rise': n = 'ck_rise'; break;
    case 'drop': case 'floor': n = 'ck_slam'; break;
    case 'lumber': n = 'ck_walk_' + (Math.floor(e.t * 2) % 2); break;
    case 'inhale': n = 'ck_inhale'; break;
    case 'dead': n = 'ck_dead'; break;
  }
  if (e.state !== 'dead') shadow(e.x, e.floorY, 56, 0.25);
  if (e.state === 'dead' && e.rot) { const s = SPR[n]; if (!s) return; const hh = s.height / 2; ctx.save(); ctx.translate(Math.round(e.x), Math.round(e.y - hh + (e.sink || 0) * 0.4)); ctx.rotate(e.rot * (e.face < 0 ? -1 : 1)); if (e.face < 0) ctx.scale(-1, 1); ctx.drawImage(s, -Math.round(s.width / 2), -Math.round(hh)); ctx.restore(); return; }
  spr(n, e.x + jx, e.y, e.face < 0, fl || (e.state === 'open' && blink(10)));
}
function drawPolly(e) {
  const fl = bossFl(e); let n = 'polly_idle_' + (Math.floor(e.anim * 3) % 2), jx = 0, fc = e.face;
  if (e.climb) { const nm = e.state === 'bark' ? 'polly_bark' : 'polly_run_' + (Math.floor(e.anim * 10) % 2); sprC(nm, e.x, e.y - 10, e.climb < 0 ? Math.PI / 2 : -Math.PI / 2, e.climb < 0, fl); return; }
  switch (e.state) {
    case 'idle': case 'toWall': n = 'polly_run_' + (Math.floor(e.anim * 12) % 2); break;
    case 'crouch': n = 'polly_crouch_' + (Math.floor(e.t * 14) % 2); break;
    case 'pin': sprC('polly_charge', e.x, e.y - 10, e.t * 18 * (e.vx < 0 ? -1 : 1), e.face < 0, fl); return;
    case 'fall': case 'leap': n = 'polly_charge'; break;
    case 'pant': n = 'polly_pant_' + (Math.floor(e.anim * 6) % 2); break;
    case 'spin': n = 'polly_idle_0'; fc = Math.floor(e.t * 20) % 2 ? 1 : -1; jx = Math.round(Math.sin(G.t * 60)); break;
    case 'dead': n = e.dstate === 'flop' ? 'polly_flop_' + (Math.floor(G.t * 10) % 2) : 'polly_pant_0'; break;
  }
  shadow(e.x, e.y, 26);
  spr(n, e.x + jx, e.y, fc < 0, fl);
}
function drawLola(e) {
  if (e.hidden) return;
  const fl = bossFl(e); let n = 'lola_idle_' + (Math.floor(e.anim * 3) % 2);
  switch (e.state) {
    case 'jumpup': case 'hop': n = 'lola_hop'; break;
    case 'slam': n = 'lola_dive'; break;
    case 'stuck': n = 'lola_stuck_' + (Math.floor(e.t * 10) % 2); break;
    case 'rehop': case 'crouch': n = 'lola_crouch'; break;
    case 'ears': n = 'lola_yip'; break;
    case 'dead': n = e.dstate === 'sit' ? 'lola_sit' : 'lola_stuck_0'; break;
  }
  if (e.state !== 'slam' && e.state !== 'jumpup') shadow(e.x, e.y, 12);
  if (e.state === 'stuck') { sprT(n, e.x, e.y + 4, e.face < 0, true, fl); return; }
  spr(n, e.x, e.y, e.face < 0, fl);
}
function drawDozer(e) {
  if (e.hidden) return;
  const fl = bossFl(e);
  if (e.rolling) {
    const i = ((Math.floor(((e.rot || 0) % (Math.PI * 2) + Math.PI * 2) / (Math.PI / 4)) % 8) + 8) % 8;
    const jx = e.state === 'tuck' ? Math.round(Math.sin(G.t * 60)) : 0;
    shadow(e.x, e.y, 40);
    spr(e.state === 'tuck' ? 'dozer_ball' : 'dozer_roll_' + i, e.x + jx, e.y, false, fl);
    return;
  }
  let n = 'dozer_idle_' + (Math.floor(e.anim * 2) % 2);
  switch (e.state) {
    case 'dizzy': n = 'dozer_dizzy'; break;
    case 'jump': case 'fall': n = 'dozer_jump'; break;
    case 'wheeze': n = 'dozer_stuck_' + (Math.floor(e.t * 3) % 2); break;
    case 'sit': n = 'dozer_sit'; break;
    case 'snack': n = 'dozer_munch_' + (Math.floor(e.t * 6) % 2); break;
    case 'lick': n = 'dozer_wind'; break;
    case 'dead': n = e.dstate === 'flopped' ? 'dozer_flop' : 'dozer_dizzy'; break;
  }
  if (e.intro) n = 'dozer_munch_' + (Math.floor(G.t * 6) % 2);
  if (e.state !== 'jump' && e.state !== 'fall') shadow(e.x, e.y, 60, 0.25);
  spr(n, e.x, e.y, e.face < 0, fl || (e.state === 'lick' && blink(10)));
  if (e.state === 'dizzy' || (e.state === 'dead' && e.dstate === 'hit')) stars(e.x, e.y - 64, G.t);
}
function drawBossTel(e) {
  const B = G.lv.boss; if (!B || B.phase !== 'fight') return;
  const pc = pCenter(), bl = blink(10);
  switch (e.type) {
    case 'babyboo':
      if (e.state === 'evil') bang(e.x, e.y - 26);
      else if (e.state === 'angry') pixRing(e.x, e.y - 9, 30, bl ? PAL.warn : '#ffd0e0', 2, true);
      break;
    case 'rover':
      if (e.state === 'aim' && bl) { ctx.fillStyle = PAL.warn; const c = bossCenter(e); for (let d = 18; d < 460; d += 6) ctx.fillRect(Math.round(c.x + e.dx * d - 1), Math.round(c.y + e.dy * d - 1), 2, 2); }
      if (e.state === 'coil') pixRing(e.x, e.y - 9, 36, bl ? '#ffffff' : PAL.warn, 2, true);
      if (e.state === 'haha') text('HA HA', e.x, e.y - 34, '#9ad0ff', 1, true, 'c');
      break;
    case 'cherry':
      if ((e.state === 'snort' || e.state === 'reflash') && bl) { const dir = e.state === 'reflash' ? -e.cdir : e.face, c = e.y - 10; ctx.fillStyle = PAL.warn; for (let x = e.x + dir * 20; x > 16 && x < 368; x += dir * 8) ctx.fillRect(Math.round(x), Math.round(c - 11), 4, 1), ctx.fillRect(Math.round(x), Math.round(c + 10), 4, 1); }
      if (e.state === 'puff') pixRing(e.x, e.y - 10, 90, bl ? PAL.warn : '#ffd0e0', 2, true);
      if (e.state === 'back') bang(e.x, e.y - 28);
      break;
    case 'chicken':
      if (e.state === 'rise' && bl) { ctx.fillStyle = PAL.warn; for (let x = 20; x < 364; x += 10) if (Math.abs(x - e.x) > 30) ctx.fillRect(x, e.floorY - 18, 4, 1); }
      if (e.state === 'open') bang(e.x + e.face * 30, e.y - 50);
      if (e.state === 'inhale') pixRing(e.x + e.face * 20, e.y - 24, 110, bl ? '#d8f4ff' : '#88b8d8', 2, true);
      break;
    case 'polly':
      if (e.state === 'crouch' || e.state === 'bark') bang(e.x, e.y - 30);
      if (e.state === 'spin' && bl) { ctx.fillStyle = PAL.warn; for (let x = 20; x < 364; x += 10) ctx.fillRect(x, 234, 4, 1); }
      break;
    case 'lola':
      if (e.state === 'track' || e.state === 'lock') {
        const red = e.state === 'lock' && bl;
        shadow(e.sx, e.sy, 20, red ? 0.7 : 0.45);
        if (e.state === 'lock') { ctx.fillStyle = red ? PAL.warn : '#ffffff'; ctx.fillRect(Math.round(e.sx - 12), Math.round(e.sy), 24, 1); ctx.fillRect(Math.round(e.sx), Math.round(e.sy - 12), 1, 10); pixRing(e.sx, e.sy - 1, 20, red ? PAL.warn : '#ffffff', 1, true); }
      }
      if (e.state === 'crouch') bang(e.x, e.y - 18);
      if (e.state === 'ears') pixRing(e.x, e.y - 6, 60, bl ? PAL.gold : '#ffffff', 2, true);
      break;
    case 'dozer':
      if (e.state === 'tuck') {
        ctx.fillStyle = 'rgba(255,64,80,' + (0.1 + 0.08 * Math.sin(G.t * 12)).toFixed(3) + ')'; ctx.fillRect(16, 224, 352, 32);
        if (bl) { const ax = e.rdir > 0 ? W - 22 : 22, d = e.rdir; ctx.fillStyle = PAL.warn; for (let i = 0; i < 8; i++) ctx.fillRect(Math.round(ax + d * i - (d > 0 ? 8 : 0)), 236 - (7 - i), 2, (7 - i) * 2 + 1); ctx.fillRect(Math.round(ax - d * 14 - (d > 0 ? 0 : 8)), 234, 10, 5); }
      }
      if (e.state === 'strack' || e.state === 'slock') { const red = e.state === 'slock' && bl; shadow(e.sx, 255, 64, red ? 0.75 : 0.45); if (e.state === 'slock') { ctx.fillStyle = red ? PAL.warn : '#ffffff'; ctx.fillRect(Math.round(e.sx - 32), 257, 64, 1); } }
      if (e.state === 'lick') bang(e.x + e.face * 20, e.y - 62);
      break;
  }
}
