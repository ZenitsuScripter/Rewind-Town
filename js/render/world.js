// Mundo: duas versões da cidade (2026 em ruínas, 1996 viva), pré-renderizadas em camadas
const T = 16, COLS = 20, ROWS = 15, W = COLS * T, H = ROWS * T, Z = 2;
function tile(tx, ty) { const c = LAYOUT[ty][tx], p = PLACE[c]; return p && ERASED.has(p) ? '.' : c; }
function solidAt(tx, ty, cut, era) {
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return true;
  const c = tile(tx, ty, era, cut);
  return c === '#' || isHouse(c) || c === 'C' || (c === 'B' && !cut) || (c === 'G' && era === 'presente') || (c === 'W' && era === 'passado');
}
function hash(x, y) { let h = (x * 374761393 + y * 668265263) >>> 0; h = ((h ^ (h >>> 13)) * 1274126177) >>> 0; return (h ^ (h >>> 16)) >>> 0; }
function px(c, col, x, y, w, h) { c.fillStyle = col; c.fillRect(x, y, w, h); }
function sprite(c, rows, pal, x, y) {
  x = Math.round(x); y = Math.round(y);
  for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) { const k = rows[j][i]; if (k !== '.') px(c, pal[k], x + i, y + j, 1, 1); }
}
function ang(t) { const s = TOD0 + t, q = 6.2832, o = -1.5708; return [(s / 43200) % 1 * q + o, (s / 3600) % 1 * q + o, (s / 60) % 1 * q + o]; }
function hms(t) { const s = Math.floor(TOD0 + t) % 86400, p = n => String(n).padStart(2, '0'); return p(s / 3600 | 0) + ':' + p((s / 60 | 0) % 60) + ':' + p(s % 60); }
const isPath = (tx, ty) => ty === 6 || ty === 7 || tx === 4 || (tx === 15 && ty < 8);
const isHouse = c => c >= 'a' && c <= 'f';

function drawTiles(g, era, cut) {
  g.scale(Z, Z);
  const past = YEAR[era] < 2000, old = YEAR[era] < 1950, R = (c, x, y, w, h) => px(g, c, x, y, w, h);
  const G = old ? ['#8f8a4a', '#827d42', '#a39d5a'] : past ? ['#86b043', '#78a23a', '#9bc450'] : ['#3b6a48', '#325c3e', '#4a7b52'];
  for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < COLS; tx++) {
    const c = tile(tx, ty, era, cut), x = tx * T, y = ty * T, h = hash(tx, ty);
    R(G[0], x, y, T, T);
    if ((c === '.' || c === 'P') && isPath(tx, ty)) {
      if (past) { R('#c2a46c', x, y, T, T); R('#ad8f58', x + (h >>> 3) % 12, y + (h >>> 7) % 12, 3, 2); R('#d4b87e', x + (h >>> 11) % 12, y + (h >>> 15) % 12, 2, 1); }
      else { R('#5b675f', x, y, T, T); R('#48524c', x, y + 7, T, 1); R('#48524c', x + 8, y, 1, 7); R('#6c7a70', x + 2, y + 2, 4, 1); }
    } else if (c === '.' || c === 'P') {
      R(G[1 + (h & 1)], x + (h >>> 3) % 12, y + (h >>> 7) % 12, 2, 2);
      R(G[1 + ((h >>> 1) & 1)], x + (h >>> 11) % 12, y + (h >>> 15) % 12, 2, 2);
      if (past && h % 7 === 0 && !ERASED.has('flores')) { R('#fff', x + 5, y + 5, 2, 2); R('#f4d03f', x + 5, y + 5, 1, 1); R('#e85d75', x + 11, y + 10, 2, 2); }
      if (!past && h % 9 === 0) { R('#7a7f78', x + 4, y + 9, 4, 3); R('#9aa098', x + 4, y + 9, 3, 1); }
    }
    if (c === '#') {
      if (!past) {
        const o = (tx + ty) % 2;
        R('#4d4d63', x, y, T, T); R('#62627a', x, y, T, 1); R('#3a3a4d', x, y + 7, T, 1); R('#3a3a4d', x, y + 15, T, 1);
        R('#3a3a4d', x + (o ? 4 : 11), y, 1, 7); R('#3a3a4d', x + (o ? 11 : 4), y + 8, 1, 7);
        if (h % 5 === 0) R('#2f5a3a', x + 2, y + 9, 5, 5);
      } else if (tx === 0 || ty === 0 || tx === COLS - 1 || ty === ROWS - 1) {
        R('#2c6a2a', x, y, T, T); R('#3c8a34', x + 1, y + 1, 14, 11); R('#58a845', x + 3, y + 2, 5, 4); R('#244f22', x, y + 12, T, 4); R('#5a3b1e', x + 6, y + 12, 4, 4);
      } else {
        R('#a06a38', x, y + 4, T, 2); R('#a06a38', x, y + 10, T, 2); R('#8a5a2e', x + 2, y, 3, T); R('#8a5a2e', x + 11, y, 3, T); R('#b87a42', x + 2, y, 1, T); R('#b87a42', x + 11, y, 1, T);
      }
    } else if (isHouse(c)) {
      if (!isHouse(LAYOUT[ty - 1][tx])) {
        if (past) { R('#d9b44a', x, y, T, T); R('#b88a2a', x, y + 4, T, 1); R('#b88a2a', x, y + 9, T, 1); R('#8c6a1c', x, y + 14, T, 2); if (tx % 2) { R('#8a4a3a', x + 10, y, 4, 6); R('#5a2a22', x + 10, y, 4, 1); } }
        else { R('#a8402f', x, y, T, T); R('#c4553f', x, y + 3, T, 2); R('#c4553f', x, y + 9, T, 2); R('#7d2c20', x, y + 14, T, 2); if (h % 3 === 0) R('#3a2a2a', x + 4, y + 5, 5, 4); }
      } else {
        R(past ? '#f0e6cf' : '#c9a982', x, y, T, T); R(past ? '#7a5232' : '#a88a64', x, y, T, 2);
        if (!isHouse(LAYOUT[ty + 1][tx]) && tx % 2 === 0) { R(c === 'a' ? '#2a5a9a' : '#6b4326', x + 4, y + 4, 8, 12); R('#e0b84a', x + 10, y + 10, 1, 1); }
        else {
          R('#7a5a3a', x + 3, y + 3, 10, 8); R(past ? '#ffd86a' : (h & 1 ? '#27323a' : '#6cc0e8'), x + 4, y + 4, 8, 6); R('#7a5a3a', x + 7, y + 4, 1, 6);
          if (past) { R('#e85d75', x + 4, y + 11, 3, 2); R('#6bbf4a', x + 7, y + 11, 5, 2); }
        }
      }
    } else if (c === 'B') {
      if (cut) {
        if (past) { R('#6b4a2a', x + 5, y + 8, 6, 4); R('#8a6a3a', x + 5, y + 8, 6, 1); }
        else { R('#f4d84a', x + 3, y + 4, 2, 2); R('#f08aa8', x + 10, y + 9, 2, 2); R('#f4d84a', x + 6, y + 12, 2, 2); }
      } else if (past) { R('#5a8a2a', x + 7, y + 6, 2, 6); R('#7ac03a', x + 4, y + 5, 4, 2); R('#7ac03a', x + 8, y + 3, 4, 2); }
      else { R('#1f5a2a', x + 1, y + 1, 14, 14); R('#2f7a38', x + 3, y + 2, 10, 8); [[2, 2], [12, 4], [5, 11], [11, 12]].forEach(p => R('#d8d8b0', x + p[0], y + p[1], 1, 2)); }
    } else if (c === 'G') {
      if (era === 'presente') { R('#2a2a35', x, y + 3, T, 1.5); R('#2a2a35', x, y + 11, T, 1.5); for (let i = 1; i < T; i += 3) { R('#3a3a48', x + i, y + 1, 1, 14); R('#7a7a8a', x + i, y, 1, 2); } }
      else { R('#8a5a2e', x + 1, y + 2, 2, 12); R('#8a5a2e', x + 13, y + 2, 2, 12); R('#b87a42', x + 1, y + 2, 1, 12); }
    } else if (c === 'W') {
      if (era === 'passado') { R('#3a3020', x, y, T, T); R('#2f5566', x + 2, y + 2, 12, 12); R('#4a7a8a', x + 4, y + 5 + (h & 1), 5, 1); R('#6a5a3a', x, y, T, 2); }
      else { R('#2f5566', x, y, T, T); R('#8a6a3a', x + 1, y, 14, T); for (let i = 3; i < T; i += 4) R('#5e4426', x + 1, y + i, 14, 1); R('#4a3418', x + 1, y, 1, T); R('#4a3418', x + 14, y, 1, T); }
    }
  }
  detail(g, era, cut);
  const X = 256, Y = 32;
  R(past ? '#b8b8c8' : '#7e7e92', X, Y, 32, 32); R(past ? '#d8b04a' : '#5a5a6e', X, Y, 32, 3); R(past ? '#d8b04a' : '#4a4a5e', X, Y + 29, 32, 3);
  R(past ? '#e0e0f0' : '#8e8ea2', X + 2, Y + 3, 2, 26); R(past ? '#d8b04a' : '#55555f', X + 6, Y + 5, 20, 20); R(past ? '#f6f0dc' : '#9c9c92', X + 7, Y + 6, 18, 18);
  if (!past) { R('#3a3a44', X + 12, Y + 6, 1, 6); R('#3a3a44', X + 13, Y + 11, 3, 1); R('#3a3a44', X + 16, Y + 12, 1, 6); R('#2a5a2a', X, Y + 6, 3, 26); R('#2a5a2a', X + 29, Y + 10, 3, 22); R('#3f7f3a', X + 1, Y + 14, 2, 2); }
  clockFace(g, past, old);
  sketch(g, past);
}
function drawHands(c, live, t) {
  const a = live ? ang(t) : ang(0);
  c.lineWidth = 1; c.strokeStyle = '#222'; c.beginPath();
  c.moveTo(272, 47); c.lineTo(272 + Math.cos(a[1]) * 7, 47 + Math.sin(a[1]) * 7);
  c.moveTo(272, 47); c.lineTo(272 + Math.cos(a[0]) * 4, 47 + Math.sin(a[0]) * 4); c.stroke();
  if (live) { c.strokeStyle = '#d33'; c.beginPath(); c.moveTo(272, 47); c.lineTo(272 + Math.cos(a[2]) * 8, 47 + Math.sin(a[2]) * 8); c.stroke(); }
}

// Detalhes em meio-pixel: grama, sombras suaves, telhas, copas redondas
function detail(g, era, cut) {
  const past = YEAR[era] < 2000, R = (c, x, y, w, h) => px(g, c, x, y, w, h);
  const shade = (x, y, h, a) => { const q = g.createLinearGradient(0, y, 0, y + h); q.addColorStop(0, 'rgba(0,0,20,' + a + ')'); q.addColorStop(1, 'rgba(0,0,20,0)'); g.fillStyle = q; g.fillRect(x, y, T, h); };
  for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < COLS; tx++) {
    const c = tile(tx, ty, era, cut), x = tx * T, y = ty * T, edge = tx === 0 || ty === 0 || tx === COLS - 1 || ty === ROWS - 1;
    if ((c === '.' || c === 'P') && !isPath(tx, ty)) for (let i = 0; i < 6; i++) { const q = hash(tx * 7 + i, ty * 13 + i); R(past ? (q & 1 ? '#a8d45c' : '#6c9833') : (q & 1 ? '#568c5e' : '#294e36'), x + (q >>> 3) % 15 + 0.5, y + (q >>> 9) % 14, 0.5, 1.5); }
    if (c === '#' && !past) { R('#6e6e86', x, y, T, 0.5); R('#2c2c3a', x, y + 15.5, T, 0.5); }
    if (c === '#' && past && edge) [['#1f5a22', 8, 7, 8.5], ['#2f7d2c', 8, 6.5, 7], ['#4c9a3a', 6, 4.5, 3.5], ['#7cc65a', 5.5, 4, 1.6]].forEach(a => { g.fillStyle = a[0]; g.beginPath(); g.arc(x + a[1], y + a[2], a[3], 0, 6.2832); g.fill(); });
    if (isHouse(c)) {
      if (!isHouse(LAYOUT[ty - 1][tx])) for (let i = 1; i < T; i += 3) R('rgba(0,0,0,0.2)', x, y + i + 1.5, T, 0.5);
      else R('rgba(0,0,0,0.1)', x, y, T, 4);
    }
    const b = ty + 1 < ROWS ? tile(tx, ty + 1, era, cut) : '#';
    if ((isHouse(c) || c === '#' || c === 'C') && (b === '.' || b === 'P')) shade(x, y + T, 6, 0.35);
  }
}
function clockFace(g, past, old) {
  if (old) return scaffold(g);
  const R = (c, x, y, w, h) => px(g, c, x, y, w, h), arc = (c, r) => { g.fillStyle = c; g.beginPath(); g.arc(272, 47, r, 0, 6.2832); g.fill(); };
  R(past ? '#b8b8c8' : '#7e7e92', 262, 37, 20, 20);
  if (ERASED.has('sino')) { g.save(); g.strokeStyle = 'rgba(240,240,240,0.9)'; g.lineWidth = 0.5; g.setLineDash([1, 1]); g.strokeRect(270, 27, 4, 4); g.restore(); } else { R('#e8c040', 270, 27, 4, 4); R('#b8901c', 270, 30.5, 4, 0.5); }
  arc(past ? '#d8b04a' : '#55555f', 10.5); arc(past ? '#fbf6e4' : '#a4a49a', 9);
  for (let i = 0; i < 12; i++) { const a = i * 0.5236; R('#333', 272 + Math.cos(a) * 7.6 - 0.25, 47 + Math.sin(a) * 7.6 - 0.25, 0.5, i % 3 ? 0.5 : 1); }
  if (!past) { g.strokeStyle = '#2a2a33'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(268, 41); g.lineTo(270, 46); g.lineTo(268, 49); g.lineTo(271, 54); g.stroke(); }
}

// Peças apagadas viram desenho a lápis, em todas as eras
function sketch(g, past) {
  g.save(); g.strokeStyle = 'rgba(240,240,240,0.9)'; g.lineWidth = 0.5; g.setLineDash([1.5, 1]);
  PECAS.forEach(p => {
    if (!ERASED.has(p.id) || !p.box) return;
    const x = p.box[0] * T, y = p.box[1] * T, w = p.box[2] * T, h = p.box[3] * T;
    g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.beginPath();
    for (let i = -h; i < w; i += 4) { g.moveTo(x + i, y + h); g.lineTo(x + i + h, y); }
    g.stroke(); g.restore();
  });
  if (ERASED.has('flores') && past) for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < COLS; tx++) {
    const c = tile(tx, ty);
    if ((c === '.' || c === 'P') && !isPath(tx, ty) && hash(tx, ty) % 7 === 0) { g.beginPath(); g.arc(tx * T + 6, ty * T + 6, 1.5, 0, 6.2832); g.stroke(); }
  }
  g.restore();
}

// Torre em obras (1926): andaimes e pedra, sem mostrador
function scaffold(g) {
  const R = (c, x, y, w, h) => px(g, c, x, y, w, h);
  R('#8b7a5a', 256, 44, 32, 20); R('#6f6048', 256, 44, 32, 2);
  for (let i = 0; i < 4; i++) R('#7a6a4c', 256, 48 + i * 4, 32, 0.5);
  for (const x of [256, 270, 286]) R('#9a7040', x, 32, 2, 32);
  R('#b88a52', 256, 38, 32, 2); R('#b88a52', 256, 50, 32, 2);
  g.strokeStyle = '#9a7040'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(258, 40); g.lineTo(272, 50); g.moveTo(272, 40); g.lineTo(286, 50); g.stroke();
  R('#c8a050', 264, 30, 8, 2);
}
