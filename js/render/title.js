// Tela de título: cena desenhada direto no canvas do jogo (mesma escala de pixel), sem degradês nem arcos suavizados
const GLYPH = {
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#']
};
const SKY = ['#080818', '#0e0e2a', '#151236', '#1f1642', '#2d1b50', '#41245a', '#5c2f64', '#7d3c68', '#a24d66', '#c9625e', '#e8805a', '#f6a35e', '#fcc772'];
let titleT = 0;
function thick(g, col, x0, y0, x1, y1) { line(g, col, x0, y0, x1, y1); line(g, col, x0 + 1, y0, x1 + 1, y1); line(g, col, x0, y0 + 1, x1, y1 + 1); }
function titleScene(g, AW, AH, t) {
  const R = (c, x, y, w, h) => px(g, c, x, y, w, h), hz = Math.round(AH * 0.74), bh = hz / SKY.length;
  SKY.forEach((c, i) => R(c, 0, i * bh, AW, bh + 1));
  for (let i = 1; i < SKY.length; i++) for (let x = (i & 1) * 4; x < AW; x += 8) R(SKY[i], x, i * bh - 3, 4, 2);
  for (let i = 0; i < 110; i++) { const tw2 = (t * 0.04 + i) % 6, x = hash(i, 1) % AW, y = hash(i, 2) % (hz * 0.55); if (tw2 < 4) { R(tw2 < 1 ? '#fff' : '#9aa0d0', x, y, 1, 1); if (tw2 < 1 && i % 4 === 0) { R('#c8ccff', x - 1, y, 3, 1); R('#c8ccff', x, y - 1, 1, 3); } } }
  // o sol é um relógio preso em 14:20: o ponteiro dos segundos anda, anda... e volta
  const cx = Math.round(AW * 0.6), cy = Math.round(hz * 0.82), r = Math.round(AH * 0.27);
  g.globalCompositeOperation = 'lighter';
  ditherDisc(g, '#ffa040', 1, cx, cy, r * 1.9, 0.2); ditherDisc(g, '#ffa040', 2, cx, cy, r * 1.5, 0.18); ditherDisc(g, '#ffb860', 3, cx, cy, r * 1.2, 0.14);
  g.globalCompositeOperation = 'source-over';
  disc(g, '#f0a050', cx, cy, r + 4); disc(g, '#fff0c8', cx, cy, r); disc(g, '#f6d894', cx + 3, cy + 3, r - 3); disc(g, '#ffe9b0', cx, cy, r - 10);
  for (let i = 0; i < 12; i++) { const a = i * 0.5236, q = i % 3 === 0, s = q ? 6 : 4; R('#6a2e1e', cx + Math.cos(a) * r * 0.86 - s / 2, cy + Math.sin(a) * r * 0.86 - s / 2, s, s); }
  for (let k = 0; k < 7; k++) { const y = cy + r * 0.25 + k * r * 0.12; R(SKY[Math.min(SKY.length - 1, Math.floor(y / bh))], cx - r - 8, y, 2 * r + 16, 2 + k); }
  thick(g, '#4a2218', cx, cy, cx + Math.cos(-0.349) * r * 0.5, cy + Math.sin(-0.349) * r * 0.5); thick(g, '#4a2218', cx, cy, cx + Math.cos(0.5236) * r * 0.8, cy + Math.sin(0.5236) * r * 0.8);
  const c = t % 160, st = c < 20 ? 0 : c < 45 ? 1 : c < 70 ? 2 : c < 100 ? 3 : c < 120 ? 3 - (c - 100) * 0.15 : 0, sa = -1.5708 + st * 0.5236;
  line(g, '#c0302a', cx, cy, cx + Math.cos(sa) * r * 0.92, cy + Math.sin(sa) * r * 0.92); line(g, '#c0302a', cx + 1, cy, cx + 1 + Math.cos(sa) * r * 0.92, cy + Math.sin(sa) * r * 0.92); disc(g, '#4a2218', cx, cy, 4);
  for (let x = 0; x < AW; x++) { const y = hz - 22 - 10 * Math.sin(x * 0.02 + 2) - 6 * Math.sin(x * 0.06); R('#3a2060', x, y, 1, AH - y); }
  for (let x = 0; x < AW; x++) { const y = hz - 10 - 12 * Math.sin(x * 0.022 + 1) - 8 * Math.sin(x * 0.055); R('#2a1648', x, y, 1, AH - y); }
  const tx = Math.round(AW * 0.27), th = Math.round(AH * 0.4), ty = hz - th;
  for (let i = 0; i < 11; i++) {
    const x = Math.round(i * AW / 10 + hash(i, 5) % 12 - 6), w = 28 + hash(i, 6) % 20, h = 24 + hash(i, 7) % 32, y = hz - h + 8;
    if (Math.abs(x + w / 2 - tx - 14) < 34) continue;
    if (Math.sin(t * 0.011 + i * 2.3) > 0.62) {
      for (let k = 0; k < w; k += 3) { R('#b8b8d8', x + k, y, 2, 1); R('#b8b8d8', x + k, y + h - 1, 2, 1); }
      for (let k = 0; k < h; k += 3) { R('#b8b8d8', x, y + k, 1, 2); R('#b8b8d8', x + w - 1, y + k, 1, 2); }
      for (let k = 4; k < Math.min(w, h) - 3; k += 5) R('#8888a8', x + k, y + k, 2, 1);
    } else {
      R('#140c26', x, y, w, h + 10); R('#140c26', x - 2, y - 5, w + 4, 5); R('#140c26', x + 6, y - 11, w - 12, 6); R('#1e1436', x, y, w, 2);
      for (let k = 0; k < 3; k++) if (hash(i * 3 + k, 9) % 3 && (t * 0.05 + i + k) % 9 > 0.6) R('#ffcf5a', x + 6 + k * 10, y + 8, 4, 6);
    }
  }
  R('#0d0820', tx, ty, 28, th + 10); R('#1a1030', tx, ty, 3, th + 10); R('#0d0820', tx - 4, ty - 8, 36, 8); R('#0d0820', tx + 4, ty - 16, 20, 8); R('#0d0820', tx + 10, ty - 30, 8, 14);
  disc(g, '#3a2a30', tx + 14, ty + 22, 11); disc(g, '#ffdf8a', tx + 14, ty + 22, 10);
  line(g, '#3a1a10', tx + 14, ty + 22, tx + 14 + Math.cos(0.52) * 8, ty + 22 + Math.sin(0.52) * 8); line(g, '#3a1a10', tx + 14, ty + 22, tx + 14 + Math.cos(-0.35) * 5, ty + 22 + Math.sin(-0.35) * 5);
  for (let k = 0; k < 3; k++) R('#ffcf5a', tx + 12, ty + 50 + k * 24, 4, 8);
  R('#07040e', 0, hz + 8, AW, AH - hz);
  for (let x = 0; x < AW; x++) { const y = hz + 4 - 6 * Math.sin(x * 0.05) - 4 * Math.sin(x * 0.13 + 2); R('#0a0612', x, y, 1, AH - y); }
  const x0 = Math.round(AW * 0.14), y0 = hz + 6;
  g.globalCompositeOperation = 'lighter'; ditherDisc(g, '#ffe27a', 1, x0 + 6, y0 - 10, 18 + (Math.sin(t * 0.06) > 0 ? 2 : 0), 0.4); ditherDisc(g, '#ffe27a', 3, x0 + 6, y0 - 10, 8, 0.4); g.globalCompositeOperation = 'source-over';
  R('#05030a', x0 - 4, y0 - 14, 10, 14); R('#05030a', x0 - 2, y0 - 20, 6, 6); R('#9a2a2a', x0 - 4, y0 - 14, 10, 2); R('#05030a', x0 + 6, y0 - 14, 4, 2); R('#ffe27a', x0 + 8, y0 - 12, 2, 2);
  for (let i = 0; i < 40; i++) { const x = hash(i, 11) % AW + Math.sin(t * 0.02 + i) * 8, y = (((hash(i, 12) % AH) - t * (0.12 + (i % 5) * 0.06)) % AH + AH) % AH; R(i % 2 ? '#ffd36a' : '#ff9a5a', x, y, i % 3 ? 1 : 2, i % 3 ? 1 : 2); }
  const gs = 8, gw = 5 * gs, gap = 8, x1 = Math.round((AW - (4 * gw + 3 * gap)) / 2), y1 = 22 + Math.round(Math.sin(t * 0.03) * 2);
  g.globalCompositeOperation = 'lighter'; ditherDisc(g, '#ffc85a', 1, AW / 2, y1 + 28, 100 + (Math.sin(t * 0.05) > 0 ? 6 : 0), 0.16); ditherDisc(g, '#ffc85a', 2, AW / 2, y1 + 28, 66, 0.14); g.globalCompositeOperation = 'source-over';
  const ROWC = ['#fff6c0', '#ffe680', '#ffd24a', '#f6b030', '#ea9028', '#d6702a', '#b4502a'];
  [0, 1].forEach(pass => 'TICK'.split('').forEach((ch, n) => GLYPH[ch].forEach((row, j) => [...row].forEach((v, i) => {
    if (v !== '#') return;
    const x = x1 + n * (gw + gap) + i * gs, y = y1 + j * gs;
    if (pass === 0) { R('#0a0410', x, y + 6, gs + 2, gs + 2); R('#1a0a1c', x - 2, y - 2, gs + 4, gs + 4); }
    else { R(ROWC[j], x, y, gs, gs); R('#fffbe0', x, y, gs, 2); R('#8a3a1a', x, y + gs - 1, gs, 1); }
  }))));
}
function titleItems() { return [{ t: 'NOVO JOGO', f: newGame }].concat(S.hasSave ? [{ t: 'CONTINUAR', f: continueGame }] : []).concat([{ t: 'TELA CHEIA', f: toggleFS }]); }
function titleKey(code) {
  const it = titleItems();
  if (code === 'ArrowUp' || code === 'KeyW') S.menu = (S.menu + it.length - 1) % it.length;
  else if (code === 'ArrowDown' || code === 'KeyS') S.menu = (S.menu + 1) % it.length;
  else if (code === 'Enter' || code === 'KeyE' || code === 'Space') it[S.menu].f();
}
function drawTitle() {
  titleT++;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  titleScene(ctx, VW, VH, titleT);
  txt(ctx, 'R E W I N D   T O W N', VW >> 1, Math.round(VH * 0.27), '#f6c76a', { a: 'center', s: 2 });
  const items = titleItems(), y0 = Math.round(VH * 0.74) + 26;
  items.forEach((it, i) => {
    const sel = i === S.menu, y = y0 + i * 26, w = tw(it.t, 2) + 44;
    if (sel) { panel(ctx, (VW - w) >> 1, y - 6, w, 26, '#241c36', '#ffd36a'); if ((titleT >> 4) & 1) { px(ctx, '#ffd36a', ((VW - w) >> 1) + 8, y + 1, 3, 9); px(ctx, '#ffd36a', ((VW - w) >> 1) + 11, y + 3, 3, 5); } }
    txt(ctx, it.t, VW >> 1, y, sel ? '#ffe27a' : '#9a8fb0', { a: 'center', s: 2 });
  });
  txt(ctx, '↑ ↓ ESCOLHER · ENTER CONFIRMAR', VW >> 1, VH - 14, '#6a6088', { a: 'center' });
  [0, 1].length; drawVignetteTitle();
}
function drawVignetteTitle() { [[0, 0], [10, 3], [20, 2]].forEach(b => { ctx.globalAlpha = 0.3; ctx.fillStyle = b[1] ? pat(ctx, '#0a0614', b[1]) : '#0a0614'; ctx.fillRect(0, b[0], VW, 10); ctx.fillRect(0, VH - b[0] - 10, VW, 10); ctx.fillRect(b[0], b[0] + 10, 10, VH - 2 * b[0] - 20); ctx.fillRect(VW - b[0] - 10, b[0] + 10, 10, VH - 2 * b[0] - 20); }); ctx.globalAlpha = 1; }
