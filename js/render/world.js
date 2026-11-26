// Mundo em pixel art. Luz do canto superior esquerdo: sombras caem para a direita e para baixo.
const T = 16, COLS = 20, ROWS = 15, W = COLS * T, H = ROWS * T, Z = 2, TS = T * Z, WP = W * Z, HP = H * Z, CKX = 544, CKY = 104;
const RAMPS = {
  grass: { ruin: ['#1a3433', '#244640', '#30564a', '#3e6a54', '#55805f'], warm: ['#2e5c32', '#386c36', '#447d39', '#528c3e', '#67a046'], sepia: ['#56532a', '#5f5c2d', '#686432', '#726e37', '#827d40'] },
  dirt: { ruin: ['#323c3a', '#46544f', '#5f7068', '#86998e'], warm: ['#5a3c26', '#7a5434', '#9a7244', '#bc9660'], sepia: ['#4a3a26', '#695234', '#887044', '#a99468'] },
  stone: { ruin: ['#212338', '#34364e', '#4d4f6a', '#6e708a', '#9899b2'], warm: ['#3a322c', '#564a40', '#766858', '#988a76', '#bcae96'], sepia: ['#36301f', '#504634', '#6e6249', '#90826a', '#b4a684'] },
  wood: { ruin: ['#261a12', '#42301f', '#62462c', '#82603e'], warm: ['#34200f', '#56381c', '#7a5629', '#a07840'], sepia: ['#30241a', '#4a3a26', '#685236', '#8a7050'] },
  roof: { ruin: ['#331a20', '#58282a', '#7e3e38', '#a45a46'], warm: ['#6e4e18', '#9c761c', '#cca238', '#eec860'], sepia: ['#42341f', '#654f2f', '#896d40', '#ad915c'] },
  wall: { ruin: ['#52483e', '#74685a', '#988a78', '#b8aa94'], warm: ['#9c8a64', '#c0ac80', '#dccaa0', '#f2e4c4'], sepia: ['#665a40', '#84765a', '#a39470', '#c4b48c'] },
  leaf: { ruin: ['#202f28', '#30443a', '#465c48', '#627a5a', '#86a07a'], warm: ['#1c4524', '#296428', '#3c8636', '#58a844', '#86ca58'], sepia: ['#363620', '#4e4e28', '#686834', '#868644', '#a8a45c'] },
  roofB: { warm: ['#5a2420', '#8a3a2a', '#b24c34', '#d36a48'], sepia: ['#3a2c1c', '#58442a', '#7a5e38', '#9c7c4c'], ruin: ['#331a20', '#58282a', '#7e3e38', '#a45a46'] },
  wallB: { warm: ['#7c8e96', '#9eb0b4', '#bccaca', '#dce8e8'], sepia: ['#5c5a4c', '#7a7866', '#999682', '#b8b49c'], ruin: ['#4a4a48', '#6a6a66', '#8c8c86', '#acaca4'] },
  water: ['#15303c', '#224c5a', '#34697a', '#68a2ac', '#bcdede']
};
const FL = ['#fff4f0', '#ff9ab0', '#ffd24a', '#9ab8ff'];
const look = era => YEAR[era] < 1950 ? 'sepia' : YEAR[era] < 2000 ? 'warm' : 'ruin';
const pathAt = (tx, ty) => !!(F.path && F.path(tx, ty));
const isHouse = c => c >= 'a' && c <= 'f';
function tile(tx, ty) { const c = LAYOUT[ty][tx], p = PLACE[c]; return p && ERASED.has(p) ? '.' : c; }
function solidAt(tx, ty, cut, era) {
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return true;
  const c = tile(tx, ty, era, cut);
  return c === '#' || isHouse(c) || c === 'C' || (c === 'B' && !cut) || (c === 'G' && era === 'presente') || (c === 'W' && era === 'passado');
}
function hash(x, y) { let h = (x * 374761393 + y * 668265263) >>> 0; h = ((h ^ (h >>> 13)) * 1274126177) >>> 0; return (h ^ (h >>> 16)) >>> 0; }
function ang(t) { const s = TOD0 + t, q = 6.2832, o = -1.5708; return [(s / 43200) % 1 * q + o, (s / 3600) % 1 * q + o, (s / 60) % 1 * q + o]; }
function hms(t) { const s = Math.floor(TOD0 + t) % 86400, p = n => String(n).padStart(2, '0'); return p(s / 3600 | 0) + ':' + p((s / 60 | 0) % 60) + ':' + p(s % 60); }

// ruído de valor, calculado uma vez: define as manchas de grama (nada de grade)
const RT = new Float32Array(65536); for (let i = 0; i < 65536; i++) RT[i] = hash(i & 255, i >> 8) / 4294967295;
function vn(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = RT[((yi & 255) << 8) | (xi & 255)], b = RT[((yi & 255) << 8) | ((xi + 1) & 255)], c = RT[(((yi + 1) & 255) << 8) | (xi & 255)], d = RT[(((yi + 1) & 255) << 8) | ((xi + 1) & 255)];
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const GN = new Uint8Array(WP * HP), DN = new Uint8Array(WP * HP);
for (let y = 0; y < HP; y++) for (let x = 0; x < WP; x++) { const i = y * WP + x; GN[i] = 255 * (vn(x / 14, y / 14) * 0.6 + vn(x / 6, y / 6) * 0.4); DN[i] = 255 * (vn(x / 8 + 50, y / 8) * 0.7 + vn(x / 3 + 20, y / 3) * 0.3); }

// campo do caminho: máscara dos tiles suavizada + ruído = bordas irregulares de terra, sem cara de grade
let FLD = null, FLDk = null;
function field() {
  if (FLDk === LAYOUT) return FLD; FLD = new Uint8Array(WP * HP); FLDk = LAYOUT;
  const MK = new Uint8Array((COLS + 2) * (ROWS + 2));
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) { const c = LAYOUT[j][i]; MK[(j + 1) * (COLS + 2) + i + 1] = (('.P'.includes(c) && pathAt(i, j)) || c === 'B' || c === 'G') ? 1 : 0; }
  const M = (i, j) => MK[(j + 1) * (COLS + 2) + i + 1];
  for (let y = 0; y < HP; y++) { const v = y / TS - 0.5, j = Math.floor(v), fv = v - j; for (let x = 0; x < WP; x++) { const u = x / TS - 0.5, i = Math.floor(u), fu = u - i; FLD[y * WP + x] = 255 * ((M(i, j) * (1 - fu) + M(i + 1, j) * fu) * (1 - fv) + (M(i, j + 1) * (1 - fu) + M(i + 1, j + 1) * fu) * fv); } }
  return FLD;
}
function waterPix(x, y, i, DI, WA) {
  const lx = x & 31, nz = GN[i];
  if (lx < 3 + (nz >> 6) || lx > 28 - (DN[i] >> 6)) return DI[(nz & 3) === 0 ? 2 : 0];
  const band = ((y + (nz >> 5)) >> 2) & 1, deep = lx > 8 && lx < 24, k = deep ? (band ? 1 : 0) : (band ? 2 : 1);
  return WA[band && (nz & 31) === 3 ? 3 : k];
}
function groundPass(g, era, L) {
  const id = g.createImageData(WP, HP), d = new Uint32Array(id.data.buffer), GR = RAMPS.grass[L].map(u32), DI = RAMPS.dirt[L].map(u32), WA = RAMPS.water.map(u32), fl = field();
  for (let y = 0; y < HP; y++) {
    const row = LAYOUT[y >> 5];
    for (let x = 0; x < WP; x++) {
      const i = y * WP + x, bay = ((x & 1) + ((y & 1) << 1)) * 2 - 3;
      if (row[x >> 5] === 'W') { d[i] = waterPix(x, y, i, DI, WA); continue; }
      const f = fl[i] + (DN[i] - 128) * 0.4;
      if (f > 128) { const m = DN[i] + bay; d[i] = f < 150 ? DI[0] : DI[m < 64 ? 0 : m < 170 ? 1 : m < 232 ? 2 : 3]; }
      else { const n = GN[i] + bay; d[i] = GR[n < 92 ? 0 : n < 118 ? 1 : n < 158 ? 2 : n < 190 ? 3 : 4]; }
    }
  }
  g.putImageData(id, 0, 0);
}

const sh = (g, x, y, w, h, a) => px(g, 'rgba(16,8,38,' + (a || 0.3) + ')', x, y, w, h);    // sombra chapada, sem degradê
function tuft(g, x, y, L, h) { const G = RAMPS.grass[L]; px(g, G[0], x, y + 3, 6, 1); [[0, 1, 2], [2, 0, 3], [4, 1, 2]].forEach((b, k) => px(g, G[b[2] + (h >> k & 1)], x + b[0], y + b[1], 1, 2 + (h >> (k + 3) & 1))); }
function flower(g, x, y, c) { px(g, '#2f6a30', x + 1, y + 2, 1, 3); px(g, c, x, y, 3, 1); px(g, c, x + 1, y - 1, 1, 3); px(g, '#ffe27a', x + 1, y, 1, 1); }
function pebble(g, x, y, L) { const S = RAMPS.stone[L]; px(g, S[0], x, y + 2, 5, 2); px(g, S[2], x, y, 5, 3); px(g, S[3], x, y, 2, 1); px(g, 'rgba(16,8,38,0.3)', x + 5, y + 2, 2, 2); }
// detalhes do chão: aglomerados, não pontinhos espalhados por igual
function details(g, L) {
  const S = RAMPS.stone[L];
  for (let cy = 0; cy < HP / 8; cy++) for (let cx = 0; cx < WP / 8; cx++) {
    const x = cx * 8, y = cy * 8, tx = x >> 5, ty = y >> 5, c = tile(tx, ty);
    if (c !== '.' && c !== 'P') continue;
    const h = hash(cx, cy), patch = vn(cx / 3.5, cy / 3.5), ox = x + (h >>> 4) % 5, oy = y + (h >>> 9) % 5;
    if (pathAt(tx, ty)) { if (h % 11 === 0) pebble(g, ox, oy, L); else if (L === 'ruin' && h % 6 === 0) { line(g, S[0], ox, oy, ox + 5, oy + 2); line(g, S[0], ox + 5, oy + 2, ox + 7, oy + 6); } continue; }
    if (h % 5 === 0 && patch > 0.4) tuft(g, ox, oy, L, h >>> 12);
    else if (L !== 'ruin' && patch > 0.7 && h % 3 === 0 && !ERASED.has('flores')) flower(g, ox, oy, FL[(h >>> 7) % 4]);
    else if (h % 37 === 0) pebble(g, ox, oy, L);
  }
}

function stoneWall(g, tx, ty, L) {
  const S = RAMPS.stone[L], x = tx * TS, y = ty * TS, h = hash(tx, ty), below = ty + 1 < ROWS && LAYOUT[ty + 1][tx] === '#', top = below ? 32 : 18;
  px(g, S[2], x, y, 32, top);
  for (let k = 0; k < 5; k++) { const bx = x + (h >>> (k * 3)) % 24, by = y + (h >>> (k * 2 + 1)) % (top - 4); px(g, S[3], bx, by, 5 + k % 3, 2); px(g, S[1], bx + 1, by + 2, 5, 1); }
  px(g, S[4], x, y, 32, 1); px(g, S[3], x, y, 1, top);
  if (!below) {
    px(g, S[1], x, y + 18, 32, 14); px(g, S[2], x + 1, y + 19, 30, 1);
    for (let r = 0; r < 3; r++) { const by = y + 20 + r * 4; px(g, S[0], x, by + 3, 32, 1); for (let bx = (r % 2) * 5; bx < 32; bx += 10) px(g, S[0], x + bx, by, 1, 4); }
    px(g, S[0], x, y + 31, 32, 1); sh(g, x + 4, y + 32, 32, 5, 0.3);
  }
  if (h % 3 === 0) { const mx = x + h % 20, my = y + (below ? 8 : 21); px(g, RAMPS.leaf[L][1], mx, my, 6, 2); px(g, RAMPS.leaf[L][2], mx + 1, my - 1, 4, 1); }
  if (h % 5 === 0) line(g, S[0], x + 8, y + 3, x + 11, y + 10);
}
function fence(g, tx, ty, L) {
  const wd = RAMPS.wood[L], x = tx * TS, y = ty * TS;
  if ((ty > 0 && LAYOUT[ty - 1][tx] === '#') || (ty < ROWS - 1 && LAYOUT[ty + 1][tx] === '#')) {
    sh(g, x + 24, y + 2, 5, 32, 0.28);
    [9, 20].forEach(o => { px(g, wd[0], x + o - 1, y, 6, 32); px(g, wd[2], x + o, y, 4, 32); px(g, wd[3], x + o, y, 1, 32); px(g, wd[1], x + o + 3, y, 1, 32); });
    px(g, wd[0], x + 10, y + 10, 12, 12); px(g, wd[2], x + 11, y + 11, 10, 10); px(g, wd[3], x + 11, y + 11, 10, 1); px(g, wd[3], x + 11, y + 11, 1, 9); px(g, wd[1], x + 18, y + 12, 3, 9);
    return;
  }
  sh(g, x + 6, y + 27, 32, 5, 0.28);
  [8, 19].forEach(o => { px(g, wd[0], x, y + o - 1, 32, 6); px(g, wd[2], x, y + o, 32, 4); px(g, wd[3], x, y + o, 32, 1); px(g, wd[1], x, y + o + 3, 32, 1); });
  [4, 24].forEach(o => { px(g, wd[0], x + o - 1, y + 1, 7, 30); px(g, wd[2], x + o, y + 2, 5, 28); px(g, wd[3], x + o, y + 2, 1, 26); px(g, wd[1], x + o + 3, y + 2, 2, 28); px(g, wd[3], x + o, y + 1, 5, 1); });
}
function gate(g, tx, ty, era, L) {
  const x = tx * TS, y = ty * TS, wd = RAMPS.wood[L];
  if (era === 'presente') {
    sh(g, x + 6, y + 29, 32, 5, 0.3);
    px(g, '#2a2c38', x, y + 8, 32, 3); px(g, '#2a2c38', x, y + 21, 32, 3); px(g, '#4a4e60', x, y + 8, 32, 1); px(g, '#4a4e60', x, y + 21, 32, 1);
    for (let i = 1; i < 32; i += 5) { px(g, '#1e2028', x + i, y + 3, 3, 27); px(g, '#4e5266', x + i, y + 4, 1, 25); px(g, '#1e2028', x + i, y + 1, 3, 2); px(g, '#7a7e94', x + i, y + 1, 1, 1); }
  } else [3, 25].forEach(o => { sh(g, x + o + 4, y + 26, 5, 3, 0.28); px(g, wd[0], x + o - 1, y + 5, 7, 24); px(g, wd[2], x + o, y + 6, 5, 22); px(g, wd[3], x + o, y + 6, 1, 20); px(g, wd[1], x + o + 3, y + 6, 2, 22); });
}
function bridge(g, tx, ty, L) {
  const wd = RAMPS.wood[L], x = tx * TS, y = ty * TS;
  for (let j = 0; j < 32; j += 4) { const k = hash(tx, ty * 8 + j) % 3; px(g, wd[0], x + 1, y + j, 30, 4); px(g, wd[k === 0 ? 3 : 2], x + 2, y + j, 28, 3); px(g, wd[3], x + 2, y + j, 28, 1); if (k === 1) px(g, wd[1], x + 12, y + j + 1, 6, 1); }
  px(g, wd[0], x, y, 3, 32); px(g, wd[1], x + 1, y, 1, 32); px(g, wd[0], x + 29, y, 3, 32); px(g, wd[1], x + 30, y, 1, 32);
  if (ty % 2 === 0) { px(g, wd[3], x, y + 2, 3, 3); px(g, wd[3], x + 29, y + 2, 3, 3); }
}
function bush(g, tx, ty, cut, L) {
  const x = tx * TS + 16, y = ty * TS + 20, h = hash(tx, ty), lf = RAMPS.leaf[L], wd = RAMPS.wood[L];
  if (cut) {
    if (L !== 'ruin') { sh(g, x - 5, y + 2, 15, 4, 0.28); px(g, wd[0], x - 7, y - 6, 14, 10); px(g, wd[2], x - 6, y - 6, 12, 8); px(g, wd[3], x - 6, y - 7, 12, 2); px(g, wd[1], x - 3, y - 4, 6, 1); px(g, wd[1], x - 1, y - 5, 2, 3); }
    else [[-8, -2], [3, 3], [-1, -9]].forEach((f, i) => flower(g, x + f[0], y + f[1], FL[(h >>> i) % 4]));
    return;
  }
  if (L !== 'ruin') {
    sh(g, x - 6, y + 2, 15, 4, 0.25); px(g, wd[0], x - 6, y - 1, 12, 5); px(g, wd[1], x - 5, y - 1, 10, 4); px(g, wd[2], x - 5, y - 2, 6, 2);
    px(g, lf[1], x - 1, y - 12, 3, 12); px(g, lf[3], x - 1, y - 12, 1, 11);
    [[-8, -9], [3, -13], [-5, -15]].forEach(l => { px(g, lf[0], l[0] - 1 + x, y + l[1] - 1, 8, 5); px(g, lf[2], x + l[0], y + l[1], 6, 3); px(g, lf[4], x + l[0], y + l[1], 3, 1); });
  } else {
    const B = [[-6, -4, 11], [7, -3, 10], [0, -12, 11], [-8, -14, 8], [9, -14, 8]];
    sh(g, x - 10, y + 4, 36, 6, 0.3);
    B.forEach(a => disc(g, lf[0], x + a[0], y + a[1], a[2] + 1)); B.forEach(a => disc(g, lf[1], x + a[0], y + a[1], a[2]));
    B.slice(0, 3).forEach(a => disc(g, lf[2], x + a[0] - 2, y + a[1] - 2, a[2] - 4));
    for (let k = 0; k < 12; k++) { const a = (h >>> (k % 8)) + k * 53, sx = x - 15 + (a * 7) % 31, sy = y - 24 + (a * 13) % 26; px(g, '#d4dac0', sx, sy, 1, 3); px(g, '#d4dac0', sx - 1, sy + 1, 3, 1); }
  }
}
function tree(g, cx, by, v, L) {
  const lf = RAMPS.leaf[L], wd = RAMPS.wood[L], r = [9, 12, 15, 8, 11][v];
  sh(g, cx - 3, by - 3, r * 2 + 4, 8, 0.3);
  px(g, wd[0], cx - 4, by - 14, 8, 15); px(g, wd[2], cx - 3, by - 14, 5, 14); px(g, wd[3], cx - 3, by - 14, 1, 11); px(g, wd[1], cx + 1, by - 14, 2, 14); px(g, wd[0], cx - 6, by - 1, 12, 2); px(g, wd[1], cx - 5, by - 2, 4, 1);
  if (v === 4 && L === 'sepia') { const br = [[-9, -30], [8, -28], [0, -36], [-5, -24]]; br.forEach(b => line(g, wd[1], cx, by - 16, cx + b[0], by + b[1])); br.slice(0, 3).forEach(b => px(g, lf[2], cx + b[0] - 2, by + b[1] - 1, 4, 3)); return; }
  const lm = [[0, -r - 10, r], [-0.65 * r, -r - 5, 0.7 * r], [0.65 * r, -r - 6, 0.72 * r], [0, -1.7 * r - 8, 0.55 * r]].map(a => [Math.round(cx + a[0]), Math.round(by + a[1]), Math.round(a[2])]);
  lm.forEach(a => disc(g, lf[0], a[0], a[1], a[2] + 1)); lm.forEach(a => disc(g, lf[1], a[0], a[1], a[2]));
  lm.forEach(a => disc(g, lf[2], a[0] - 1, a[1] - 1, Math.round(a[2] * 0.82)));
  lm.forEach(a => disc(g, lf[3], a[0] - Math.round(a[2] * 0.3), a[1] - Math.round(a[2] * 0.35), Math.round(a[2] * 0.42)));
  lm.forEach(a => { px(g, lf[4], a[0] - Math.round(a[2] * 0.4), a[1] - Math.round(a[2] * 0.5), 3, 2); px(g, lf[0], a[0] + Math.round(a[2] * 0.3), a[1] + Math.round(a[2] * 0.4), 4, 2); });
}
function border(g, tx, ty, L) {
  const h = hash(tx, ty), x = tx * TS + 16 + ((h >>> 3) % 9) - 4, by = ty * TS + (ty === 0 ? 30 : 28) + ((h >>> 7) % 5);
  tree(g, x, by, (h >>> 11) % 5, L);
  if (h % 2) tree(g, x + ((h >>> 5) % 2 ? 11 : -11), by - 9 - (h >>> 9) % 4, (h >>> 13) % 3, L);
}

let HSK = null, HSL = null;
function houses() {
  if (HSK === LAYOUT) return HSL; HSK = LAYOUT; HSL = [];
  for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < COLS; tx++) {
    const c = LAYOUT[ty][tx];
    if (isHouse(c) && (tx === 0 || LAYOUT[ty][tx - 1] !== c) && (ty === 0 || LAYOUT[ty - 1][tx] !== c)) { let n = 1; while (LAYOUT[ty][tx + n] === c) n++; HSL.push({ c, tx, ty, n }); }
  }
  return HSL;
}
function house(g, hs, L) {
  const x0 = hs.tx * TS, y0 = hs.ty * TS, w = hs.n * TS, h = hash(hs.tx, hs.ty), R = (L === 'warm' && h % 3 === 0) ? RAMPS.roofB.warm : RAMPS.roof[L], Wl = (h >>> 3) % 3 === 0 ? RAMPS.wallB[L] : RAMPS.wall[L], Wd = RAMPS.wood[L], St = RAMPS.stone[L], ruin = L === 'ruin', dc = hs.c === 'a' ? ['#2c4a8a', '#4468b0'] : [['#7a2a2a', '#a04040'], ['#2f5a3a', '#4a7a50'], [Wd[1], Wd[2]], [Wd[1], Wd[2]]][(h >>> 5) % 4];
  sh(g, x0 + 7, y0 + 64, w, 9, 0.3); sh(g, x0 + w, y0 + 14, 9, 52, 0.3);
  px(g, Wl[2], x0, y0 + 30, w, 34); px(g, Wl[3], x0, y0 + 36, 1, 22); px(g, Wl[1], x0 + w - 2, y0 + 36, 2, 22);
  px(g, St[1], x0, y0 + 58, w, 6); px(g, St[2], x0, y0 + 58, w, 1); px(g, St[0], x0, y0 + 63, w, 1);
  for (let k = 5; k < w; k += 9) px(g, St[0], x0 + k, y0 + 59, 1, 4);
  px(g, Wd[0], x0 + 11, y0 + 43, 10, 16); px(g, dc[0], x0 + 12, y0 + 44, 8, 15); px(g, dc[1], x0 + 12, y0 + 44, 1, 15); px(g, '#e8c050', x0 + 18, y0 + 52, 1, 1); px(g, St[3], x0 + 10, y0 + 58, 12, 2);
  for (let k = 1; k < hs.n; k++) {
    const wx = x0 + k * TS + 10, lit = ruin ? (h % 3 === k % 3 ? '#e8b860' : '#22303a') : '#ffd870';
    px(g, Wd[0], wx, y0 + 42, 12, 11); px(g, lit, wx + 1, y0 + 43, 10, 9); if (lit !== '#22303a') px(g, '#fff0b8', wx + 1, y0 + 43, 10, 2);
    px(g, Wd[1], wx + 5, y0 + 43, 1, 9); px(g, Wd[1], wx + 1, y0 + 47, 10, 1); px(g, Wd[3], wx - 1, y0 + 53, 14, 2);
    if (ruin) line(g, '#0e1418', wx + 2, y0 + 44, wx + 6, y0 + 50);
    else { px(g, Wd[2], wx, y0 + 55, 12, 3); px(g, '#e85d75', wx + 2, y0 + 54, 2, 2); px(g, '#ffd24a', wx + 6, y0 + 54, 2, 2); px(g, '#3f8a3a', wx + 4, y0 + 55, 2, 1); }
  }
  px(g, R[0], x0 - 1, y0, w + 2, 36); px(g, R[3], x0, y0 + 1, w, 16); px(g, R[1], x0, y0 + 19, w, 15); px(g, R[3], x0, y0 + 17, w, 1); px(g, R[0], x0, y0 + 18, w, 1);
  for (let yy = 4; yy < 16; yy += 4) { px(g, R[2], x0, y0 + yy, w, 1); for (let xx = (yy >> 2) % 2 * 4; xx < w; xx += 8) px(g, R[2], x0 + xx, y0 + yy - 3, 1, 3); }
  for (let yy = 23; yy < 33; yy += 4) { px(g, R[0], x0, y0 + yy, w, 1); for (let xx = (yy >> 2) % 2 * 4; xx < w; xx += 8) px(g, R[0], x0 + xx, y0 + yy - 3, 1, 3); }
  px(g, R[3], x0, y0, w, 1); px(g, R[0], x0 + w - 2, y0 + 19, 2, 15); px(g, R[0], x0, y0 + 33, w, 3);
  if (ruin) { px(g, R[0], x0 + 8 + h % 20, y0 + 5, 9, 4); px(g, '#1a0e12', x0 + 10 + h % 20, y0 + 6, 5, 2); px(g, RAMPS.leaf[L][1], x0 + w - 18, y0 + 22, 8, 3); }
  sh(g, x0, y0 + 36, w, 5, 0.38);
  const pk = (h >>> 9) % 4, bx = x0 + 24, by = y0 + 49;
  if (ruin) { px(g, St[1], bx, by + 6, 8, 4); px(g, St[3], bx, by + 6, 4, 2); px(g, RAMPS.leaf[L][2], bx + 5, by + 3, 3, 4); }
  else if (pk === 0) { sh(g, bx + 2, by + 9, 9, 3, 0.3); px(g, Wd[0], bx, by, 8, 11); px(g, Wd[2], bx + 1, by + 1, 6, 9); px(g, Wd[3], bx + 1, by + 1, 1, 9); px(g, St[1], bx, by + 3, 8, 1); px(g, St[1], bx, by + 7, 8, 1); }
  else if (pk === 1) { sh(g, bx + 2, by + 7, 10, 3, 0.3); px(g, Wd[0], bx, by + 1, 9, 9); px(g, Wd[2], bx + 1, by + 2, 7, 7); px(g, Wd[1], bx + 1, by + 5, 7, 1); px(g, Wd[3], bx + 1, by + 2, 7, 1); }
  else if (pk === 2) { px(g, '#8a4a30', bx + 1, by + 6, 6, 5); px(g, '#b8683e', bx + 1, by + 6, 2, 5); px(g, '#3f8a3a', bx + 2, by + 2, 4, 4); px(g, '#e85d75', bx + 3, by + 1, 2, 2); }
  else { px(g, Wd[0], bx - 1, by + 4, 13, 4); px(g, Wd[3], bx - 1, by + 4, 13, 1); px(g, Wd[2], bx, by + 5, 11, 2); px(g, Wd[0], bx, by + 8, 2, 3); px(g, Wd[0], bx + 9, by + 8, 2, 3); }
  const cx = x0 + w - 13; px(g, St[0], cx - 1, y0 + 2, 9, 14); px(g, St[2], cx, y0 + 3, 7, 12); px(g, St[3], cx, y0 + 3, 2, 12); px(g, St[1], cx + 5, y0 + 3, 2, 12); px(g, St[4], cx - 1, y0 + 2, 9, 1);
}
function scaffold(g) {
  const wd = RAMPS.wood.sepia, S = RAMPS.stone.sepia, x0 = 512, y0 = 64;
  sh(g, x0 + 8, y0 + 64, 66, 8, 0.3); sh(g, x0 + 62, y0 + 24, 10, 44, 0.3);
  px(g, S[0], x0 + 3, y0 + 36, 58, 28); px(g, S[2], x0 + 4, y0 + 36, 56, 27); px(g, S[3], x0 + 4, y0 + 36, 5, 27); px(g, S[1], x0 + 52, y0 + 36, 8, 27);
  for (let r = 0; r < 4; r++) { const by = y0 + 40 + r * 6; px(g, S[1], x0 + 4, by + 5, 56, 1); for (let bx = 8 + (r % 2) * 7; bx < 56; bx += 14) px(g, S[1], x0 + bx, by, 1, 5); }
  [2, 30, 58].forEach(o => { px(g, wd[0], x0 + o - 1, y0 + 2, 5, 62); px(g, wd[2], x0 + o, y0 + 2, 3, 62); px(g, wd[3], x0 + o, y0 + 2, 1, 62); });
  [10, 26, 42].forEach(o => { px(g, wd[0], x0, y0 + o - 1, 64, 6); px(g, wd[2], x0, y0 + o, 64, 4); px(g, wd[3], x0, y0 + o, 64, 1); });
  line(g, wd[1], x0 + 3, y0 + 12, x0 + 30, y0 + 26); line(g, wd[1], x0 + 31, y0 + 12, x0 + 58, y0 + 26); line(g, wd[1], x0 + 3, y0 + 28, x0 + 30, y0 + 42);
}
function tower(g, L) {
  if (L === 'sepia') return scaffold(g);
  const S = RAMPS.stone[L], R = RAMPS.roof[L], x0 = 512, y0 = 64, ruin = L === 'ruin';
  sh(g, x0 + 62, y0 + 20, 12, 48, 0.3); sh(g, x0 + 8, y0 + 64, 66, 8, 0.3);
  px(g, S[0], x0 + 3, y0 + 22, 58, 42); px(g, S[2], x0 + 4, y0 + 22, 56, 41); px(g, S[3], x0 + 4, y0 + 22, 5, 41); px(g, S[1], x0 + 52, y0 + 22, 8, 41);
  for (let r = 0; r < 7; r++) { const by = y0 + 26 + r * 6; px(g, S[1], x0 + 4, by + 5, 56, 1); for (let bx = 8 + (r % 2) * 7; bx < 56; bx += 14) px(g, S[1], x0 + bx, by, 1, 5); }
  px(g, S[1], x0 + 3, y0 + 58, 58, 6); px(g, S[3], x0 + 3, y0 + 58, 58, 1);
  for (let r = 0; r < 22; r++) { const w = 14 + r * 2, rx = x0 + 32 - (w >> 1), ry = y0 + 2 + r; px(g, R[0], rx - 1, ry, w + 2, 1); px(g, R[3], rx, ry, w >> 1, 1); px(g, R[1], rx + (w >> 1), ry, w - (w >> 1), 1); if (r % 4 === 3) px(g, R[2], rx, ry, w, 1); }
  px(g, R[0], x0 + 8, y0 + 24, 48, 3); px(g, '#d8b04a', x0 + 31, y0 - 6, 2, 8); px(g, '#fff0a0', x0 + 31, y0 - 6, 1, 3);
  if (ERASED.has('sino')) { for (let k = 0; k < 7; k += 2) { px(g, '#d8d8ee', x0 + 10 + k, y0 + 12, 1, 1); px(g, '#d8d8ee', x0 + 10 + k, y0 + 18, 1, 1); px(g, '#d8d8ee', x0 + 10, y0 + 12 + k, 1, 1); px(g, '#d8d8ee', x0 + 16, y0 + 12 + k, 1, 1); } }
  else { px(g, '#8a6a1c', x0 + 9, y0 + 11, 8, 8); px(g, '#e8c050', x0 + 10, y0 + 11, 6, 7); px(g, '#fff0a0', x0 + 10, y0 + 11, 2, 4); px(g, '#8a6a1c', x0 + 12, y0 + 18, 2, 2); }
  disc(g, S[0], CKX, CKY, 16); disc(g, ruin ? '#6a6e78' : '#c8a24a', CKX, CKY, 15); disc(g, ruin ? '#a8a69a' : '#f6eed2', CKX, CKY, 12);
  for (let i = 0; i < 12; i++) { const a = i * 0.5236, q = i % 3 === 0; px(g, '#4a3a30', CKX + Math.cos(a) * 9 - (q ? 1 : 0), CKY + Math.sin(a) * 9 - (q ? 1 : 0), q ? 2 : 1, q ? 2 : 1); }
  if (ruin) { const lf = RAMPS.leaf[L]; px(g, lf[1], x0 + 4, y0 + 22, 5, 38); px(g, lf[2], x0 + 4, y0 + 26, 3, 6); px(g, lf[1], x0 + 55, y0 + 30, 5, 30); px(g, lf[3], x0 + 57, y0 + 36, 2, 5); line(g, '#2a2a33', CKX - 5, CKY - 8, CKX - 2, CKY - 1); line(g, '#2a2a33', CKX - 2, CKY - 1, CKX - 4, CKY + 5); }
}
function drawTiles(g, era, cut) {
  const L = look(era), jobs = [];
  groundPass(g, era, L); details(g, L);
  for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < COLS; tx++) {
    const c = tile(tx, ty), edge = tx === 0 || ty === 0 || tx === COLS - 1 || ty === ROWS - 1, y = ty * TS;
    if (c === '#') jobs.push(edge && L !== 'ruin' ? [y + 28, () => border(g, tx, ty, L)] : [y + 30, () => L === 'ruin' ? stoneWall(g, tx, ty, L) : fence(g, tx, ty, L)]);
    else if (c === 'G') jobs.push([y + 30, () => gate(g, tx, ty, era, L)]);
    else if (c === 'W' && era === 'presente') jobs.push([y, () => bridge(g, tx, ty, L)]);
    else if (c === 'B') jobs.push([y + 24, () => bush(g, tx, ty, cut, L)]);
  }
  houses().forEach(hs => { if (!ERASED.has(PLACE[hs.c])) jobs.push([hs.ty * TS + 64, () => house(g, hs, L)]); });
  jobs.push([128, () => tower(g, L)]);
  jobs.sort((a, b) => a[0] - b[0]).forEach(j => j[1]());
  sketch(g, L);
}
// peças apagadas viram desenho a lápis, em todas as eras
function sketch(g, L) {
  const ink = '#d8d8ee', soft = '#8d8da8';
  PECAS.forEach(p => {
    if (!ERASED.has(p.id) || !p.box) return;
    const x = p.box[0] * TS, y = p.box[1] * TS, w = p.box[2] * TS, h = p.box[3] * TS;
    for (let i = 0; i < w; i += 3) { px(g, ink, x + i, y, 2, 1); px(g, ink, x + i, y + h - 1, 2, 1); }
    for (let j = 0; j < h; j += 3) { px(g, ink, x, y + j, 1, 2); px(g, ink, x + w - 1, y + j, 1, 2); }
    for (let k = 6; k < w + h - 6; k += 7) { const x0 = Math.min(k, w - 1); line(g, soft, x + x0, y + k - x0, x + Math.max(0, k - (h - 1)), y + Math.min(k, h - 1)); }
  });
  if (ERASED.has('flores') && L !== 'ruin') for (let cy = 0; cy < HP / 8; cy++) for (let cx = 0; cx < WP / 8; cx++) {
    const c = tile(cx >> 2, cy >> 2), h = hash(cx, cy), patch = vn(cx / 3.5, cy / 3.5);
    if ((c === '.' || c === 'P') && !pathAt(cx >> 2, cy >> 2) && patch > 0.7 && h % 3 === 0 && h % 5 !== 0) { const ox = cx * 8 + (h >>> 4) % 5, oy = cy * 8 + (h >>> 9) % 5; px(g, soft, ox, oy, 3, 1); px(g, soft, ox + 1, oy - 1, 1, 3); }
  }
}
// camada viva, redesenhada a cada quadro: água, ponteiros, fumaça
function drawLive(c, era, t) {
  const L = look(era), u = t * 10;
  if (L === 'sepia') for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < COLS; tx++) if (LAYOUT[ty][tx] === 'W') for (let k = 0; k < 3; k++) {
    const lx = 6 + ((u * 0.9 + k * 9 + ty * 5) % 18 | 0), ly = 6 + k * 9 + ((u * 0.3 + ty) % 3 | 0);
    px(c, RAMPS.water[4], tx * TS + lx, ty * TS + ly, 4, 1); px(c, RAMPS.water[3], tx * TS + lx - 2, ty * TS + ly + 1, 3, 1);
  }
  if (L !== 'sepia') {
    const live = L === 'warm' || S.won, a = live ? ang(t) : ang(0);
    line(c, '#2a1a1a', CKX, CKY, CKX + Math.cos(a[1]) * 10, CKY + Math.sin(a[1]) * 10); line(c, '#2a1a1a', CKX, CKY, CKX + Math.cos(a[0]) * 6, CKY + Math.sin(a[0]) * 6);
    if (live) line(c, '#c8302a', CKX, CKY, CKX + Math.cos(a[2]) * 11, CKY + Math.sin(a[2]) * 11);
    px(c, '#2a1a1a', CKX - 1, CKY - 1, 3, 3);
  }
  if (L !== 'ruin') houses().forEach(hs => {
    if (ERASED.has(PLACE[hs.c])) return;
    const cx = hs.tx * TS + hs.n * TS - 10, cy = hs.ty * TS + 3;
    for (let k = 0; k < 4; k++) { const a = (u * 0.35 + k * 9 + hs.tx * 3) % 36, s = a < 12 ? 3 : a < 24 ? 4 : 5; c.fillStyle = 'rgba(226,226,236,' + (0.5 * (1 - a / 36)).toFixed(2) + ')'; c.fillRect(Math.round(cx - s / 2 + Math.sin(a * 0.3 + k) * 2 + a * 0.12), Math.round(cy - a * 0.9), s, s); }
  });
}
