// Mundo: mapa, pixel art dos tiles e das duas eras (passado / presente)
const T = 16, COLS = 20, ROWS = 15, W = COLS * T, H = ROWS * T;
// # muro  H casa  C relógio  B broto/arbusto (bloqueia até ser cortado)  P início
const LAYOUT = [
"####################",
"#........#.........#",
"#.HH.HH..#.HHH..CC.#",
"#.HH.HH..#.HHH..CC.#",
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
const START = { x: 1 * T + 8, y: 13 * T + 8 };
const CLOCK = { x: 272, y: 48 };
const BUSH = { x: 152, y: 112 };

function solidAt(tx, ty, cut) {
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return true;
  const c = LAYOUT[ty][tx];
  return c === '#' || c === 'H' || c === 'C' || (c === 'B' && !cut);
}
function hash(x, y) { let h = (x * 374761393 + y * 668265263) >>> 0; h = ((h ^ (h >>> 13)) * 1274126177) >>> 0; return (h ^ (h >>> 16)) >>> 0; }
function px(ctx, c, x, y, w, h) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
function sprite(ctx, rows, pal, x, y) {
  x = Math.round(x); y = Math.round(y);
  for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) {
    const c = rows[j][i];
    if (c !== '.') px(ctx, pal[c], x + i, y + j, 1, 1);
  }
}

function drawWorld(ctx, era, cut, f) {
  const past = era === 'passado';
  const g = past ? ['#8c8a3e', '#7b7a35', '#a39a4a'] : ['#3f7a45', '#356b3b', '#4c8a50'];
  for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < COLS; tx++) {
    const c = LAYOUT[ty][tx], x = tx * T, y = ty * T, h = hash(tx, ty);
    px(ctx, g[0], x, y, T, T);
    px(ctx, g[1 + (h & 1)], x + (h >>> 3) % 12, y + (h >>> 7) % 12, 2, 2);
    px(ctx, g[1 + ((h >>> 1) & 1)], x + (h >>> 11) % 12, y + (h >>> 15) % 12, 2, 2);
    if (c === '#') {
      const o = (tx + ty) % 2;
      px(ctx, '#4d4d63', x, y, T, T); px(ctx, '#62627a', x, y, T, 1);
      px(ctx, '#3a3a4d', x, y + 7, T, 1); px(ctx, '#3a3a4d', x, y + 15, T, 1);
      px(ctx, '#3a3a4d', x + (o ? 4 : 11), y, 1, 7); px(ctx, '#3a3a4d', x + (o ? 11 : 4), y + 8, 1, 7);
    } else if (c === 'H') {
      if (LAYOUT[ty - 1][tx] !== 'H') {
        px(ctx, '#a8402f', x, y, T, T); px(ctx, '#c4553f', x, y + 3, T, 2); px(ctx, '#c4553f', x, y + 9, T, 2); px(ctx, '#7d2c20', x, y + 14, T, 2);
      } else {
        px(ctx, '#d6b48a', x, y, T, T);
        if (LAYOUT[ty + 1][tx] !== 'H' && tx % 2 === 0) { px(ctx, '#6b4326', x + 4, y + 4, 8, 12); px(ctx, '#e0b84a', x + 10, y + 10, 1, 1); }
        else { px(ctx, '#7a5a3a', x + 3, y + 3, 10, 8); px(ctx, '#6cc0e8', x + 4, y + 4, 8, 6); px(ctx, '#7a5a3a', x + 7, y + 4, 1, 6); }
      }
    } else if (c === 'B') {
      if (cut) {
        if (past) px(ctx, '#6b4a2a', x + 5, y + 8, 6, 4);
        else { px(ctx, '#f4d84a', x + 3, y + 4, 2, 2); px(ctx, '#f08aa8', x + 10, y + 9, 2, 2); px(ctx, '#f4d84a', x + 6, y + 12, 2, 2); }
      } else if (past) {
        px(ctx, '#5a8a2a', x + 7, y + 6, 2, 6); px(ctx, '#7ac03a', x + 4, y + 5, 4, 2); px(ctx, '#7ac03a', x + 8, y + 3, 4, 2);
      } else {
        px(ctx, '#1f5a2a', x + 1, y + 1, 14, 14); px(ctx, '#2f7a38', x + 3, y + 2, 10, 8);
        [[2, 2], [12, 4], [5, 11], [11, 12]].forEach(p => px(ctx, '#d8d8b0', x + p[0], y + p[1], 1, 2));
      }
    }
  }
  drawClock(ctx, past, f);
}

function drawClock(ctx, past, f) {
  const x = 256, y = 32, cx = x + 16, cy = y + 15;
  px(ctx, '#8a8aa0', x, y, 32, 32); px(ctx, '#6a6a82', x, y, 32, 3); px(ctx, '#5a5a72', x, y + 29, 32, 3);
  px(ctx, past ? '#f0f0e0' : '#9c9c92', x + 7, y + 6, 18, 18);
  ctx.strokeStyle = '#222'; ctx.lineWidth = 1; ctx.beginPath();
  const m = past ? f * 0.06 : 2.2, hr = past ? f * 0.005 : 5.1;
  ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(m) * 7, cy + Math.sin(m) * 7);
  ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(hr) * 4, cy + Math.sin(hr) * 4);
  ctx.stroke();
  if (!past) { px(ctx, '#3a3a44', x + 12, y + 6, 1, 6); px(ctx, '#3a3a44', x + 13, y + 11, 3, 1); px(ctx, '#3a3a44', x + 16, y + 12, 1, 6); }
}
