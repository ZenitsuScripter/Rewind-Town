// Interface em pixel art (mesma escala de pixel do mundo): painéis, ícones, fonte de pixel e efeitos de tela
const ICONS = {
  lugar: ['...#...', '..###..', '.#####.', '#######', '.#...#.', '.#.#.#.', '.#####.'],
  pessoa: ['..###..', '.#####.', '.#####.', '..###..', '.#####.', '#######', '#######'],
  objeto: ['..#.#..', '.#####.', '..###..', '...#...', '..##...', '...#...', '...#...'],
  acontecimento: ['...#...', '..###..', '#######', '.#####.', '..###..', '.##.##.', '##...##']
};
const ICOL = { lugar: '#ffd36a', pessoa: '#ff9ab0', objeto: '#8aff9a', acontecimento: '#9ad8ff' };
function icon(c, p, x, y, gone, k) {
  k = k || 1;
  ICONS[p.tipo].forEach((r, j) => { for (let i = 0; i < 7; i++) if (r[i] === '#' && (!gone || (i + j) % 2 === 0)) px(c, gone ? '#6a6488' : ICOL[p.tipo], x + i * k, y + j * k, k, k); });
}
function dial(c, cx, cy, r, t, rew) {
  disc(c, '#6a5a8a', cx, cy, r); disc(c, '#14101e', cx, cy, r - 1);
  for (let i = 0; i < 12; i++) { const a = i * 0.5236; px(c, i % 3 ? '#4a4264' : '#c8bce8', cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3), 1, 1); }
  const a = ang(t);
  line(c, '#f4ecd8', cx, cy, cx + Math.cos(a[0]) * r * 0.45, cy + Math.sin(a[0]) * r * 0.45); line(c, '#f4ecd8', cx, cy, cx + Math.cos(a[1]) * r * 0.7, cy + Math.sin(a[1]) * r * 0.7);
  line(c, rew ? '#e0a0ff' : '#ff6a5a', cx, cy, cx + Math.cos(a[2]) * r * 0.82, cy + Math.sin(a[2]) * r * 0.82); px(c, '#f4ecd8', cx - 1, cy - 1, 2, 2);
}
// efeitos de tela chapados (sem degradê) e vinheta em dither
function drawGrade() {
  if (S.stopped) { ctx.globalCompositeOperation = 'multiply'; veil('#8f9ee0'); ctx.globalCompositeOperation = 'source-over'; }
  if (S.rewinding) { veil('rgba(170,80,220,0.2)'); ctx.fillStyle = 'rgba(255,255,255,0.14)'; for (let y = (AF * 2) % 6; y < VH; y += 6) ctx.fillRect(0, y, VW, 1); }
  if (S.trav > 0) { veil('rgba(255,255,255,' + (Math.sin(S.trav / 50 * 3.1416) * 0.5).toFixed(2) + ')'); ctx.fillStyle = 'rgba(120,200,255,0.35)'; for (let i = 0; i < 6; i++) ctx.fillRect(0, hash(i, S.trav) % VH, VW, 2); }
  if (S.glitch > 0) { veil('rgba(255,255,255,0.16)'); ctx.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 5; i++) ctx.fillRect(0, hash(i, S.glitch) % VH, VW, 1); }
  [[0, 0], [10, 3], [20, 2], [30, 1]].forEach(b => {
    const o = b[0]; ctx.globalAlpha = 0.3; ctx.fillStyle = b[1] ? pat(ctx, '#0a0614', b[1]) : '#0a0614';
    ctx.fillRect(0, o, VW, 10); ctx.fillRect(0, VH - o - 10, VW, 10); ctx.fillRect(o, o + 10, 10, VH - 2 * o - 20); ctx.fillRect(VW - o - 10, o + 10, 10, VH - 2 * o - 20);
  });
  ctx.globalAlpha = 1;
}
function drawHUD() {
  const L = look(S.era), warm = L !== 'ruin', gold = warm ? '#ffd36a' : '#9ad8ff', yr = S.trav > 0 ? Math.round(YEAR[S.from] + (YEAR[S.era] - YEAR[S.from]) * (1 - S.trav / 50)) : YEAR[S.era];
  panel(ctx, 6, 6, 108, 48);
  txt(ctx, S.era === 'passado' ? 'PASSADO' : 'PRESENTE', 14, 13, gold);
  const n = 14, on = Math.ceil(S.energy / 100 * n);
  for (let i = 0; i < n; i++) px(ctx, i < on ? (S.energy < 15 ? '#e05050' : '#58d0ff') : '#2a2438', 14 + i * 6, 25, 5, 6);
  PECAS.forEach((p, i) => icon(ctx, p, 14 + i * 11, 37, ERASED.has(p.id)));
  const cx = VW - 126;
  panel(ctx, cx, 6, 120, 44); px(ctx, gold, cx + 3, 6, 114, 1);
  dial(ctx, cx + 24, 28, 17, S.t, S.rewinding);
  txt(ctx, yr, cx + 50, 12, gold, { s: 2 });
  txt(ctx, hms(S.t), cx + 50, 32, S.stopped ? '#b0c0ff' : S.rewinding ? '#e0a0ff' : '#f4ecd8');
  if (S.trav > 0) txt(ctx, 'VIAGEM ' + YEAR[S.from] + ' > ' + YEAR[S.era], cx + 60, 56, '#f4ecd8', { a: 'center' });
  if (S.stopped || S.rewinding) { const s = S.stopped ? 'TEMPO PARADO' : 'VOLTANDO O TEMPO', w = tw(s, 1) + 24; panel(ctx, (VW - w) >> 1, 6, w, 18, '#181424', S.stopped ? '#7a8ae0' : '#b070e0'); txt(ctx, s, VW >> 1, 11, S.stopped ? '#b0c0ff' : '#e0a0ff', { a: 'center' }); }
  if (S.note > 0) { const s = 'NOVA PISTA NO CADERNO (C)', w = tw(s, 1) + 24; panel(ctx, (VW - w) >> 1, 28, w, 18); txt(ctx, s, VW >> 1, 33, '#ffd36a', { a: 'center' }); }
  if (S.dlg) drawDialog();
  else if (S.msgT > 0 || S.caught) { const w = tw(S.msg, 1) + 28; panel(ctx, (VW - w) >> 1, VH - 32, w, 20); txt(ctx, S.msg, VW >> 1, VH - 26, '#f4ecd8', { a: 'center' }); }
  else txt(ctx, 'SETAS/WASD MOVER · ESPAÇO PARAR · R VOLTAR · T VIAJAR · E AGIR · C CADERNO · F TELA CHEIA', VW >> 1, VH - 12, '#6a6488', { a: 'center', sh: null });
  if (S.won) {
    veil('rgba(8,4,16,0.8)'); const w = 400, h = 136, x = (VW - w) >> 1, y = (VH - h) >> 1;
    panel(ctx, x, y, w, h); txt(ctx, F.fim[0], VW >> 1, y + 16, '#ffd36a', { a: 'center', s: 3 });
    txt(ctx, YEAR[S.era] + ' · ' + S.winT, VW >> 1, y + 48, '#f4ecd8', { a: 'center' }); txt(ctx, F.fim[1], VW >> 1, y + 64, '#9ad8ff', { a: 'center' });
    txt(ctx, 'PISTAS: ' + FOUND.size + ' DE ' + CLUES.length + ' · PEÇAS QUE RESTARAM: ' + (PECAS.length - nGone()) + ' DE ' + PECAS.length, VW >> 1, y + 80, '#9ad8ff', { a: 'center' });
    txt(ctx, S.won ? F.fim[2] : '', VW >> 1, y + 108, '#8a84a8', { a: 'center' });
  }
  if (S.end) {
    veil('rgba(244,240,232,0.94)'); txt(ctx, 'FIM EM BRANCO', VW >> 1, (VH >> 1) - 30, '#444', { a: 'center', s: 3, sh: null });
    txt(ctx, 'A cidade esqueceu tudo, até você.', VW >> 1, VH >> 1, '#555', { a: 'center', sh: null }); txt(ctx, 'ENTER: recomeçar a fase', VW >> 1, (VH >> 1) + 30, '#888', { a: 'center', sh: null });
  }
  if (S.offer) drawOffer();
  if (S.book) drawBook();
  if (S.card > 0) drawCard();
}
function drawDialog() {
  const d = S.dlg[S.di], w = Math.min(VW - 40, 540), h = 74, x = (VW - w) >> 1, y = VH - h - 16;
  panel(ctx, x, y, w, h);
  if (d[0]) { const nw = tw(d[0], 1) + 16; panel(ctx, x + 12, y - 10, nw, 16, '#2a2040', '#ffd36a'); txt(ctx, d[0], x + 20, y - 5, '#ffd36a'); }
  wrapT(d[1], w - 32, 1).forEach((l, j) => txt(ctx, l, x + 16, y + 16 + j * 13, '#f4ecd8'));
  if ((AF >> 4) & 1) { px(ctx, '#ffd36a', x + w - 22, y + h - 16, 7, 3); px(ctx, '#ffd36a', x + w - 20, y + h - 13, 3, 1); }
}
function drawOffer() {
  const o = S.offer, n = o.opts.length, cw = 132, gap = 12, bw = n * cw + (n - 1) * gap, bx = (VW - bw) >> 1, by = (VH >> 1) - 92;
  veil('rgba(8,4,16,0.78)');
  txt(ctx, 'O TICK COBRA ' + o.n + (o.n > 1 ? ' PEÇAS' : ' PEÇA'), VW >> 1, by, '#ffd36a', { a: 'center', s: 2 });
  txt(ctx, 'Escolha o que a cidade vai esquecer para sempre.', VW >> 1, by + 24, '#f4ecd8', { a: 'center' });
  o.opts.forEach((p, i) => {
    const x = bx + i * (cw + gap), y = by + 46, sel = i === o.i;
    panel(ctx, x, y, cw, 112, sel ? '#241c36' : '#181424', sel ? '#ffd36a' : '#4a4264');
    txt(ctx, p.tipo, x + cw / 2, y + 10, sel ? '#ffd36a' : '#8a84a8', { a: 'center', sh: null });
    icon(ctx, p, x + cw / 2 - 10, y + 24, false, 3);
    wrapT(p.nome, cw - 16, 1).forEach((l, j) => txt(ctx, l, x + cw / 2, y + 54 + j * 11, '#f4ecd8', { a: 'center' }));
    wrapT(EFEITO[p.tipo], cw - 16, 1).forEach((l, j) => txt(ctx, l, x + cw / 2, y + 86 + j * 11, sel ? '#9ad8ff' : '#6a6488', { a: 'center' }));
  });
  txt(ctx, '< > ESCOLHER · E CONFIRMAR' + (o.n === o.n0 ? ' · ESC DESISTIR' : ''), VW >> 1, by + 172, '#8a84a8', { a: 'center' });
}
function drawCard() {
  const a = Math.min(1, S.card / 20); veil('rgba(8,4,16,' + (0.94 * a).toFixed(2) + ')'); ctx.globalAlpha = a;
  txt(ctx, F.nome, VW >> 1, (VH >> 1) - 40, '#ffd36a', { a: 'center', s: 5 });
  txt(ctx, F.sub, VW >> 1, (VH >> 1) + 6, '#f4ecd8', { a: 'center', s: 2 });
  txt(ctx, YEAR.presente + '  >  ' + YEAR.passado, VW >> 1, (VH >> 1) + 34, '#8a84a8', { a: 'center' });
  ctx.globalAlpha = 1;
}
