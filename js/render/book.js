// Caderno do Teo: livro em pixel art desenhado na mesma escala do jogo, com texto de pixel
const BW = 480, BH = 300;
let BK = null;
function bookArt() {
  const c = document.createElement('canvas'); c.width = BW; c.height = BH;
  const g = c.getContext('2d'), R = (col, x, y, w, h) => px(g, col, x, y, w, h);
  R('#120a06', 5, 13, BW - 5, BH - 13); R('#4a2e1a', 0, 6, BW - 5, BH - 14); R('#331f10', 4, 10, BW - 13, BH - 22); R('#6a4428', 0, 6, BW - 5, 3);
  for (let x = 14; x < BW - 20; x += 12) R('#4a2c18', x, BH - 14, 6, 1);
  [[4, 10], [BW - 22, 10], [4, BH - 26], [BW - 22, BH - 26]].forEach(q => { R('#8a6a1c', q[0], q[1], 15, 15); R('#d8b04a', q[0], q[1], 14, 14); R('#fff0a0', q[0] + 1, q[1] + 1, 12, 2); R('#b8902e', q[0] + 4, q[1] + 4, 6, 6); });
  [[16, 0], [248, 1]].forEach(([x, right]) => {
    R('#a8925c', x + 2, 284, 214, 1); R('#bfa86e', x + 1, 283, 215, 1); R('#d0bc84', x, 282, 216, 1);
    R('#efe1ba', x, 20, 216, 262); R('#f6ebcc', x, 20, 216, 2);
    for (let k = 0; k < 14; k++) R('rgba(120,90,40,' + (0.34 - k * 0.024).toFixed(2) + ')', right ? x + k : x + 215 - k, 20, 1, 262);
    for (let y = 74; y < 276; y += 14) R('#e2d3a0', x + 14, y, 188, 1);
  });
  R('#24130a', 232, 14, 16, 272); R('#3a2312', 233, 14, 2, 272); for (let k = 0; k < 9; k++) { R('#c8a050', 238, 28 + k * 30, 4, 9); R('#8a6a30', 238, 35 + k * 30, 4, 2); }
  R('rgba(232,216,160,0.92)', 18, 12, 36, 10); R('rgba(232,216,160,0.92)', 442, 12, 36, 10);
  R('#7a5a2e', 30, 56, 188, 2);
  disc(g, '#4a3a22', 58, 250, 14); disc(g, '#efe1ba', 58, 250, 12);
  line(g, '#4a3a22', 58, 250, 58 + 9, 250 + 5); line(g, '#4a3a22', 58, 250, 58 + 6, 250 - 3); R('#4a3a22', 56, 233, 4, 4); R('#4a3a22', 58, 229, 1, 4);
  disc(g, 'rgba(120,80,40,0.4)', 420, 240, 18); disc(g, '#efe1ba', 420, 240, 15);
  R('#b3262e', 452, 6, 8, 292); R('#d84a52', 452, 6, 2, 292); R('#8a1a22', 458, 6, 2, 292); R('#0a0612', 452, 294, 3, 4); R('#0a0612', 457, 294, 3, 4);
  return c;
}
function flipBook(d) {
  const n = Math.ceil(CLUES.length / 4), p = Math.max(0, Math.min(n - 1, S.bp + d));
  if (p !== S.bp) { S.bp = p; S.bflip = 10; S.bdir = d; }
}
function drawBook() {
  if (!BK) BK = bookArt();
  const ox = Math.round((VW - BW) / 2), oy = Math.round((VH - BH) / 2) - 6, per = 4, n = Math.ceil(CLUES.length / per), p = S.bp, ink = '#3a2a1a';
  veil('rgba(8,4,16,0.82)'); ctx.imageSmoothingEnabled = false; ctx.drawImage(BK, ox, oy);
  txt(ctx, 'CADERNO DO TEO', ox + 30, oy + 32, '#4a2a14', { s: 2, sh: null });
  CLUES.slice(p * per, p * per + per).forEach((c, k) => {
    const left = k < 2, ax = ox + (left ? 30 : 262), ay = oy + (left ? 70 : 34) + (k % 2) * 110, ok = FOUND.has(c.id);
    txt(ctx, (p * per + k + 1) + '. ' + (ok ? c.t : '???'), ax, ay, ok ? '#7a1f1f' : '#9a8a6a', { sh: null });
    if (ok) wrapT(c.x, 186, 1).slice(0, 5).forEach((l, j) => txt(ctx, l, ax, ay + 16 + j * 14, ink, { sh: null }));
    else for (let j = 0; j < 3; j++) px(ctx, 'rgba(120,100,70,0.35)', ax, ay + 18 + j * 14, 150 - j * 36, 3);
  });
  txt(ctx, '<', ox + 30, oy + 266, p > 0 ? '#7a1f1f' : '#c8b88a', { s: 2, sh: null }); txt(ctx, '>', ox + 436, oy + 266, p < n - 1 ? '#7a1f1f' : '#c8b88a', { s: 2, sh: null, a: 'right' });
  txt(ctx, (p + 1) + ' / ' + n, ox + 124, oy + 268, '#5a4026', { a: 'center', sh: null });
  if (S.bflip > 0) { const q = 1 - S.bflip / 10, x = Math.round(S.bdir > 0 ? 236 - q * 220 : 16 + q * 220); px(ctx, '#efe1ba', ox + x, oy + 20, 12, 262); px(ctx, '#bfa86e', ox + x, oy + 20, 2, 262); px(ctx, 'rgba(16,8,38,0.22)', ox + x + 12, oy + 20, 5, 262); }
  txt(ctx, 'A / D OU SETAS: VIRAR PÁGINA · C OU ESC: FECHAR', VW >> 1, oy + BH + 8, '#8a84a8', { a: 'center' });
}
