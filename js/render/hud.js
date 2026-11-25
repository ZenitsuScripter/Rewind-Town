// HUD, diálogos e a tela da cobrança (desenhados em unidades de HUD, nítidos em qualquer tela)
function text(str, x, y, col, align, font) {
  ctx.font = font || '8px monospace'; ctx.textBaseline = 'top'; ctx.textAlign = align || 'left';
  ctx.fillStyle = '#000'; ctx.fillText(str, x + 1, y + 1); ctx.fillStyle = col; ctx.fillText(str, x, y);
}
function wrap(str, maxW) {
  const out = []; let line = '';
  for (const w of str.split(' ')) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
  out.push(line); return out;
}
const veil = (col) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = col; ctx.fillRect(0, 0, VW, VH); ctx.restore(); };
function drawHUD(past) {
  ctx.setTransform(Hs, 0, 0, Hs, 0, 0); const HW = VW / Hs, HH = VH / Hs;
  // HUD: era + energia
  text(S.era === 'passado' ? 'PASSADO' : 'PRESENTE', 6, 5, past ? '#f0c060' : '#9ad0ff');
  px(ctx, '#111', 6, 16, 62, 6); px(ctx, S.energy < 15 ? '#e05050' : '#58d0ff', 7, 17, 60 * S.energy / 100, 4);
  PECAS.forEach((p, i) => { if (ERASED.has(p.id)) { ctx.strokeStyle = '#d8d8d8'; ctx.lineWidth = 0.5; ctx.strokeRect(6.25 + i * 7, 25.25, 4.5, 4.5); } else px(ctx, '#f0c060', 6 + i * 7, 25, 5, 5); });
  text('PEÇAS', 74, 23, '#9a9ab0');
  if (S.stopped) text('TEMPO PARADO', 74, 5, '#b0c0ff');
  if (S.rewinding) text('VOLTANDO O TEMPO', 74, 5, '#e0a0ff');
  // HUD: ano, relógio analógico e digital (os ponteiros e os segundos voltam junto com o tempo)
  const yr = S.trav > 0 ? Math.round(YEAR[S.from] + (YEAR[S.era] - YEAR[S.from]) * (1 - S.trav / 50)) : YEAR[S.era];
  const x = HW - 88, y = 5, a = ang(S.t), dx = x + 17, dy = y + 16;
  px(ctx, 'rgba(8,8,16,0.75)', x, y, 82, 32); px(ctx, past ? '#d8b04a' : '#58b8e8', x, y, 82, 1);
  ctx.lineWidth = 1; ctx.strokeStyle = '#9a9ab0'; ctx.beginPath(); ctx.arc(dx, dy, 11, 0, 6.2832); ctx.stroke();
  [[a[0], 5, '#fff'], [a[1], 8, '#fff'], [a[2], 9, S.rewinding ? '#e0a0ff' : '#f55']].forEach(h => {
    ctx.strokeStyle = h[2]; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + Math.cos(h[0]) * h[1], dy + Math.sin(h[0]) * h[1]); ctx.stroke();
  });
  text(String(yr), x + 33, y + 3, past ? '#f0c060' : '#9ad0ff', 'left', 'bold 11px monospace');
  text(hms(S.t), x + 33, y + 19, S.stopped ? '#b0c0ff' : S.rewinding ? '#e0a0ff' : '#fff');
  if (S.trav > 0) text('VIAGEM ' + YEAR[S.from] + ' > ' + YEAR[S.era], x + 41, y + 36, '#fff', 'center');

  if (S.dlg) {
    const d = S.dlg[S.di], bw = Math.min(HW - 24, 300), bx = (HW - bw) / 2, bh = 48, by = HH - bh - 10;
    px(ctx, '#f0c060', bx - 1, by - 1, bw + 2, bh + 2); px(ctx, '#14141f', bx, by, bw, bh);
    if (d[0]) text(d[0], bx + 6, by + 4, '#f0c060');
    ctx.font = '8px monospace'; wrap(d[1], bw - 12).forEach((l, i) => text(l, bx + 6, by + 15 + i * 10, '#fff'));
    if ((S.frame >> 4 & 1) || true) text('E >', bx + bw - 6, by + bh - 11, '#9a9ab0', 'right');
  } else if (S.msgT > 0 || S.caught) {
    px(ctx, 'rgba(0,0,0,0.65)', 0, HH - 18, HW, 16); text(S.msg, HW / 2, HH - 14, '#fff', 'center');
  }
  if (S.won) {
    veil('rgba(0,0,0,0.78)'); const m = HH / 2;
    text(F.fim[0], HW / 2, m - 34, '#f0c060', 'center', 'bold 11px monospace');
    text(YEAR[S.era] + ' · ' + S.winT, HW / 2, m - 16, '#fff', 'center');
    text(F.fim[1], HW / 2, m, '#9ad0ff', 'center');
    text('Pistas: ' + FOUND.size + ' de ' + CLUES.length + ' · Peças que restaram: ' + (PECAS.length - nGone()) + ' de ' + PECAS.length, HW / 2, m + 12, '#9ad0ff', 'center');
    text(S.won ? F.fim[2] : 'ENTER: recomeçar a fase', HW / 2, m + 34, '#aaa', 'center');
  }
  if (S.end) {
    veil('rgba(255,255,255,0.92)');
    text('FIM EM BRANCO', HW / 2, HH / 2 - 18, '#444', 'center', 'bold 11px monospace');
    text('A cidade esqueceu tudo, até você.', HW / 2, HH / 2, '#444', 'center');
    text('ENTER: recomeçar', HW / 2, HH / 2 + 22, '#777', 'center');
  }
  if (S.note > 0) { px(ctx, 'rgba(0,0,0,0.65)', HW / 2 - 66, 22, 132, 14); text('Nova pista no caderno (C)', HW / 2, 25, '#f0c060', 'center'); }
  if (S.offer) drawOffer();
  if (S.book) drawBook();
  if (S.card > 0) drawCard();
}

// Tela da cobrança: o Tick oferece peças e o jogador escolhe o que a cidade esquece
function drawOffer() {
  const HW = VW / Hs, HH = VH / Hs, o = S.offer, bw = Math.min(HW - 16, 300), bx = (HW - bw) / 2, by = HH / 2 - 52;
  veil('rgba(0,0,0,0.72)');
  text('O TICK COBRA ' + o.n + (o.n > 1 ? ' PEÇAS' : ' PEÇA'), HW / 2, by, '#f0c060', 'center', 'bold 11px monospace');
  text('Escolha o que a cidade vai esquecer para sempre.', HW / 2, by + 16, '#fff', 'center');
  const cw = (bw - 8 * (o.opts.length - 1)) / o.opts.length;
  o.opts.forEach((p, i) => {
    const x = bx + i * (cw + 8), y = by + 32, sel = i === o.i;
    px(ctx, sel ? '#f0c060' : '#444', x - 1, y - 1, cw + 2, 70); px(ctx, '#14141f', x, y, cw, 68);
    text(p.tipo.toUpperCase(), x + cw / 2, y + 6, sel ? '#f0c060' : '#9a9ab0', 'center');
    ctx.font = '8px monospace';
    wrap(p.nome, cw - 8).forEach((l, j) => text(l, x + cw / 2, y + 20 + j * 10, '#fff', 'center'));
    wrap(EFEITO[p.tipo], cw - 8).forEach((l, j) => text(l, x + cw / 2, y + 46 + j * 10, sel ? '#9ad0ff' : '#777', 'center'));
  });
  text('← → escolher · E confirmar' + (o.n === o.n0 ? ' · Esc desistir' : ''), HW / 2, by + 112, '#9a9ab0', 'center');
}


// Cartão de capítulo no começo de cada fase
function drawCard() {
  const HW = VW / Hs, HH = VH / Hs, a = Math.min(1, S.card / 20);
  veil('rgba(0,0,0,' + (0.92 * a).toFixed(2) + ')');
  ctx.globalAlpha = a;
  text(F.nome, HW / 2, HH / 2 - 24, '#f0c060', 'center', 'bold 22px monospace');
  text(F.sub, HW / 2, HH / 2 + 6, '#fff', 'center', 'bold 10px monospace');
  text(YEAR.presente + '  >  ' + YEAR.passado, HW / 2, HH / 2 + 22, '#9a9ab0', 'center');
  ctx.globalAlpha = 1;
}
