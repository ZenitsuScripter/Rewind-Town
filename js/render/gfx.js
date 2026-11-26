// Primitivas de pixel art: pixels inteiros, sem suavização, sem degradês
const px = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
function disc(c, col, cx, cy, r) {
  cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r); c.fillStyle = col;
  for (let dy = -r; dy <= r; dy++) { const dx = Math.round(Math.sqrt(r * r - dy * dy + r * 0.4)); c.fillRect(cx - dx, cy + dy, 2 * dx + 1, 1); }
}
function line(c, col, x0, y0, x1, y1) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); c.fillStyle = col;
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
  for (;;) { c.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
// padrões de dither 2x2 (25%, 50%, 75%) em qualquer cor
const PATS = {};
function pat(c, col, lv) {
  const k = col + lv;
  if (!PATS[k]) { const p = document.createElement('canvas'); p.width = 2; p.height = 2; const g = p.getContext('2d'); g.fillStyle = col; [[0, 0], [1, 1], [1, 0], [0, 1]].slice(0, lv).forEach(q => g.fillRect(q[0], q[1], 1, 1)); PATS[k] = c.createPattern(p, 'repeat'); }
  return PATS[k];
}
function ditherDisc(c, col, lv, cx, cy, r, a) {
  cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r); c.globalAlpha = a; c.fillStyle = pat(c, col, lv);
  for (let dy = -r; dy <= r; dy++) { const dx = Math.round(Math.sqrt(r * r - dy * dy + r * 0.4)); c.fillRect(cx - dx, cy + dy, 2 * dx + 1, 1); }
  c.globalAlpha = 1;
}
const veil = col => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = col; ctx.fillRect(0, 0, VW, VH); ctx.restore(); };
const u32 = h => { const n = parseInt(h.slice(1), 16); return (255 << 24 | (n & 255) << 16 | (n >> 8 & 255) << 8 | (n >> 16)) >>> 0; };

// fonte de pixel 5x7 (tudo em maiúsculas, como nos jogos clássicos)
const FONT = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.', C: '.###.|#...#|#....|#....|#....|#...#|.###.', D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '#####|#....|#....|####.|#....|#....|#####', F: '#####|#....|#....|####.|#....|#....|#....', G: '.###.|#...#|#....|#.###|#...#|#...#|.###.', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '.###.|..#..|..#..|..#..|..#..|..#..|.###.', J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..', K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#...#|##..#|#.#.#|#..##|#...#|#...#|#...#', O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.', P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#', S: '.####|#....|#....|.###.|....#|....#|####.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.', V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..', W: '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.', 2: '.###.|#...#|....#|...#.|..#..|.#...|#####', 3: '####.|....#|....#|.###.|....#|....#|####.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.', 6: '.###.|#....|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|....#|.###.',
  '.': '.....|.....|.....|.....|.....|.##..|.##..', ',': '.....|.....|.....|.....|.##..|..#..|.#...', ':': '.....|.##..|.##..|.....|.##..|.##..|.....', '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
  '?': '.###.|#...#|....#|...#.|..#..|.....|..#..', '-': '.....|.....|.....|#####|.....|.....|.....', '/': '....#|....#|...#.|..#..|.#...|#....|#....', '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.',
  ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...', "'": '..#..|..#..|.....|.....|.....|.....|.....', '·': '.....|.....|.....|..#..|.....|.....|.....', '>': '#....|.#...|..#..|...#.|..#..|.#...|#....',
  '<': '....#|...#.|..#..|.#...|..#..|...#.|....#', '+': '.....|..#..|..#..|#####|..#..|..#..|.....', '=': '.....|.....|#####|.....|#####|.....|.....'
};
const ACC = { 'Á': ['A', 'a'], 'À': ['A', 'g'], 'Â': ['A', 'c'], 'Ã': ['A', 't'], 'É': ['E', 'a'], 'Ê': ['E', 'c'], 'Í': ['I', 'a'], 'Ó': ['O', 'a'], 'Ô': ['O', 'c'], 'Õ': ['O', 't'], 'Ú': ['U', 'a'], 'Ç': ['C', 's'] };
const MARK = { a: [[3, -2], [2, -1]], g: [[1, -2], [2, -1]], c: [[2, -2], [1, -1], [3, -1]], t: [[1, -1], [2, -2], [3, -2], [4, -1]], s: [[2, 7], [1, 8]] };
function tw(str, k) { let w = 0; for (const ch of String(str).toUpperCase()) w += (ch === ' ' ? 3 : 6) * (k || 1); return w ? w - (k || 1) : 0; }
function txt(c, str, x, y, col, o) {
  o = o || {}; const k = o.s || 1, sh = o.sh === undefined ? '#0c0814' : o.sh; str = String(str).toUpperCase();
  x = Math.round(o.a === 'center' ? x - tw(str, k) / 2 : o.a === 'right' ? x - tw(str, k) : x); y = Math.round(y);
  for (const pass of sh ? [1, 0] : [0]) {
    c.fillStyle = pass ? sh : col; let cx = x + pass * k;
    for (const ch of str) {
      if (ch === ' ') { cx += 3 * k; continue; }
      const a = ACC[ch], g = FONT[a ? a[0] : ch], m = a ? MARK[a[1]] : null;
      if (g) g.split('|').forEach((row, j) => { for (let i = 0; i < 5; i++) if (row[i] === '#') c.fillRect(cx + i * k, y + pass * k + j * k, k, k); });
      if (m) m.forEach(p => c.fillRect(cx + p[0] * k, y + pass * k + p[1] * k, k, k));
      cx += 6 * k;
    }
  }
}
function wrapT(str, maxW, k) {
  const out = []; let ln = '';
  for (const w of String(str).split(' ')) { const t = ln ? ln + ' ' + w : w; if (tw(t, k) > maxW && ln) { out.push(ln); ln = w; } else ln = t; }
  out.push(ln); return out;
}
// painel de interface em pixel art: borda clara no alto/esquerda, escura embaixo/direita, cantos cortados
function panel(c, x, y, w, h, bg, hi) {
  bg = bg || '#181424'; hi = hi || '#6a5a8a';
  px(c, '#0a0612', x + 1, y + 2, w, h - 1); px(c, hi, x + 1, y, w - 2, h); px(c, hi, x, y + 1, w, h - 2); px(c, bg, x + 1, y + 1, w - 2, h - 2);
  px(c, '#2e2646', x + 2, y + 2, w - 4, 1); px(c, '#2e2646', x + 2, y + 2, 1, h - 4);
}
