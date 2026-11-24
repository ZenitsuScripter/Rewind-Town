// Mundo: duas versões da cidade (2026 em ruínas, 1996 viva), pré-renderizadas em camadas
const T = 16, COLS = 20, ROWS = 15, W = COLS * T, H = ROWS * T;
const YEAR = { presente: 2026, passado: 1996 };
const TOD0 = 14 * 3600 + 20 * 60;
// # muro/cerca  H casa  X casa do Amadeu (some em 2026 depois do corte)  C relógio  B broto  P início
const LAYOUT = [
"####################",
"#........#.........#",
"#.HH.XX..#.HHH..CC.#",
"#.HH.XX..#.HHH..CC.#",
"#........#.........#",
"#........#.........#",
"#........B.........#",
"#........B.........#",
"#........#.........#",
"#.HH.HH..#.........#",
"#.HH.HH..#.HHH.....#",
"#........#.HHH.....#",
"#........#.........#",
"#P.......#.........#",
"####################"
];
const START = { x: 24, y: 216 }, CLOCK = { x: 272, y: 48 }, BUSH = { x: 152, y: 112 }, AMADEU = { x: 100, y: 108 };

function tile(tx, ty, era, cut) { const c = LAYOUT[ty][tx]; return c === 'X' && era === 'presente' && cut ? '.' : c; }
function solidAt(tx, ty, cut, era) {
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return true;
  const c = tile(tx, ty, era, cut);
  return c === '#' || c === 'H' || c === 'X' || c === 'C' || (c === 'B' && !cut);
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
const isHouse = c => c === 'H' || c === 'X';

function drawTiles(g, era, cut) {
  const past = era === 'passado', R = (c, x, y, w, h) => px(g, c, x, y, w, h);
  const G = past ? ['#86b043', '#78a23a', '#9bc450'] : ['#3b6a48', '#325c3e', '#4a7b52'];
  for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < COLS; tx++) {
    const c = tile(tx, ty, era, cut), x = tx * T, y = ty * T, h = hash(tx, ty);
    R(G[0], x, y, T, T);
    if ((c === '.' || c === 'P') && isPath(tx, ty)) {
      if (past) { R('#c2a46c', x, y, T, T); R('#ad8f58', x + (h >>> 3) % 12, y + (h >>> 7) % 12, 3, 2); R('#d4b87e', x + (h >>> 11) % 12, y + (h >>> 15) % 12, 2, 1); }
      else { R('#5b675f', x, y, T, T); R('#48524c', x, y + 7, T, 1); R('#48524c', x + 8, y, 1, 7); R('#6c7a70', x + 2, y + 2, 4, 1); }
    } else if (c === '.' || c === 'P') {
      R(G[1 + (h & 1)], x + (h >>> 3) % 12, y + (h >>> 7) % 12, 2, 2);
      R(G[1 + ((h >>> 1) & 1)], x + (h >>> 11) % 12, y + (h >>> 15) % 12, 2, 2);
      if (past && h % 7 === 0) { R('#fff', x + 5, y + 5, 2, 2); R('#f4d03f', x + 5, y + 5, 1, 1); R('#e85d75', x + 11, y + 10, 2, 2); }
      if (!past && h % 9 === 0) { R('#7a7f78', x + 4, y + 9, 4, 3); R('#9aa098', x + 4, y + 9, 3, 1); }
    }
    if (LAYOUT[ty][tx] === 'X' && c === '.') { R('#f4d84a', x + 4, y + 5, 2, 2); R('#f0f0f0', x + 10, y + 9, 2, 2); }
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
        if (!isHouse(LAYOUT[ty + 1][tx]) && tx % 2 === 0) { R(c === 'X' ? '#2a5a9a' : '#6b4326', x + 4, y + 4, 8, 12); R('#e0b84a', x + 10, y + 10, 1, 1); }
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
    }
  }
  const X = 256, Y = 32;
  R(past ? '#b8b8c8' : '#7e7e92', X, Y, 32, 32); R(past ? '#d8b04a' : '#5a5a6e', X, Y, 32, 3); R(past ? '#d8b04a' : '#4a4a5e', X, Y + 29, 32, 3);
  R(past ? '#e0e0f0' : '#8e8ea2', X + 2, Y + 3, 2, 26); R(past ? '#d8b04a' : '#55555f', X + 6, Y + 5, 20, 20); R(past ? '#f6f0dc' : '#9c9c92', X + 7, Y + 6, 18, 18);
  if (!past) { R('#3a3a44', X + 12, Y + 6, 1, 6); R('#3a3a44', X + 13, Y + 11, 3, 1); R('#3a3a44', X + 16, Y + 12, 1, 6); R('#2a5a2a', X, Y + 6, 3, 26); R('#2a5a2a', X + 29, Y + 10, 3, 22); R('#3f7f3a', X + 1, Y + 14, 2, 2); }
}
function drawHands(c, live, t) {
  const a = live ? ang(t) : [5.1, 2.2, 0];
  c.lineWidth = 1; c.strokeStyle = '#222'; c.beginPath();
  c.moveTo(272, 47); c.lineTo(272 + Math.cos(a[1]) * 7, 47 + Math.sin(a[1]) * 7);
  c.moveTo(272, 47); c.lineTo(272 + Math.cos(a[0]) * 4, 47 + Math.sin(a[0]) * 4); c.stroke();
  if (live) { c.strokeStyle = '#d33'; c.beginPath(); c.moveTo(272, 47); c.lineTo(272 + Math.cos(a[2]) * 8, 47 + Math.sin(a[2]) * 8); c.stroke(); }
}
