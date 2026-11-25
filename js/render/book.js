// Caderno do Teo: o livro é pixel art (canvas pequeno ampliado sem suavização) com o texto escrito por cima
const BW = 256, BH = 172;
let BK = null;
function bookArt() {
  const c = document.createElement('canvas'); c.width = BW; c.height = BH;
  const g = c.getContext('2d'), R = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  R('#1a0e06', 0, 8, BW, 160); R('#5a3820', 2, 5, BW - 4, 160); R('#3b2314', 4, 7, BW - 8, 156); R('#7a4e2c', 2, 5, BW - 4, 2);
  [[3, 6], [BW - 8, 6], [3, 158], [BW - 8, 158]].forEach(q => { R('#d8b04a', q[0], q[1], 5, 5); R('#fff0a0', q[0], q[1], 5, 1); R('#8a6a1c', q[0], q[1] + 4, 5, 1); });
  [[10, 116, 0], [130, 116, 1]].forEach(([x, w, right]) => {
    R('#a8925c', x + 1, 158, w - 2, 1); R('#bfa86e', x, 157, w, 1);
    R('#efe1ba', x, 12, w, 145);
    for (let k = 0; k < 10; k++) R('rgba(120,90,40,' + (0.32 - k * 0.03).toFixed(2) + ')', right ? x + k : x + w - 1 - k, 12, 1, 145);
    R('#d8c690', x, 12, w, 1);
    for (let y = 36; y < 150; y += 8) R('#e0d09a', x + 6, y, w - 12, 1);
  });
  R('#24130a', 126, 9, 4, 150); for (let k = 0; k < 8; k++) R('#a8803a', 127, 18 + k * 18, 2, 3);
  R('rgba(232,216,160,0.9)', 11, 9, 18, 6); R('rgba(232,216,160,0.9)', 228, 9, 18, 6);
  R('#7a5a2e', 16, 27, 104, 1);
  g.strokeStyle = '#4a3a22'; g.lineWidth = 1; g.beginPath(); g.arc(30, 142, 7, 0, 6.2832); g.stroke();
  g.beginPath(); g.moveTo(30, 142); g.lineTo(30 + 5 * Math.cos(0.52), 142 + 5 * Math.sin(0.52)); g.moveTo(30, 142); g.lineTo(30 + 3 * Math.cos(-0.35), 142 + 3 * Math.sin(-0.35)); g.stroke();
  R('#4a3a22', 29, 133, 2, 2);
  g.strokeStyle = 'rgba(120,80,40,0.35)'; g.lineWidth = 2; g.beginPath(); g.arc(226, 130, 9, 0, 6.2832); g.stroke();
  R('#b3262e', 236, 7, 4, 164); R('#d84a52', 236, 7, 1, 164); g.clearRect(237, 169, 1, 3); g.clearRect(238, 170, 1, 2);
  return c;
}
function flipBook(d) {
  const n = Math.ceil(CLUES.length / 4), p = Math.max(0, Math.min(n - 1, S.bp + d));
  if (p !== S.bp) { S.bp = p; S.bflip = 10; S.bdir = d; }
}
function drawBook() {
  if (!BK) BK = bookArt();
  const s = Math.max(1, Math.floor(Math.min(VW / (BW + 8), VH / (BH + 14)))), ox = Math.round((VW - BW * s) / 2), oy = Math.round((VH - BH * s) / 2);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, VW, VH);
  ctx.imageSmoothingEnabled = false; ctx.drawImage(BK, ox, oy, BW * s, BH * s);
  const ink = (str, ax, ay, col, size, bold, al) => { ctx.font = (bold ? 'bold ' : '') + size * s + 'px monospace'; ctx.textBaseline = 'top'; ctx.textAlign = al || 'left'; ctx.fillStyle = col; ctx.fillText(str, ox + ax * s, oy + ay * s); };
  const per = 4, n = Math.ceil(CLUES.length / per), p = S.bp;
  ink('CADERNO DO TEO', 16, 14, '#4a2a14', 7, true);
  CLUES.slice(p * per, p * per + per).forEach((c, k) => {
    const left = k < 2, ax = left ? 16 : 136, ay = (left ? 34 : 18) + (k % 2) * 58, ok = FOUND.has(c.id);
    ink((p * per + k + 1) + '. ' + (ok ? c.t : '???'), ax, ay, ok ? '#7a1f1f' : '#9a8a6a', 6, true);
    if (ok) { ctx.font = 5 * s + 'px monospace'; wrap(c.x, 100 * s).slice(0, 4).forEach((l, j) => ink(l, ax, ay + 10 + j * 7, '#3a2a1a', 5)); }
    else for (let j = 0; j < 3; j++) { ctx.fillStyle = 'rgba(120,100,70,0.35)'; ctx.fillRect(ox + ax * s, oy + (ay + 12 + j * 7) * s, (84 - j * 20) * s, 1.6 * s); }
  });
  ink('<', 16, 146, p > 0 ? '#7a1f1f' : '#c8b88a', 7, true); ink('>', 244, 146, p < n - 1 ? '#7a1f1f' : '#c8b88a', 7, true, 'right');
  ink((p + 1) + ' / ' + n, 128, 148, '#5a4026', 5, false, 'center');
  if (S.bflip > 0) {
    const q = 1 - S.bflip / 10, x = S.bdir > 0 ? 236 - q * 220 : 16 + q * 220;
    ctx.fillStyle = '#efe1ba'; ctx.fillRect(ox + x * s, oy + 12 * s, 8 * s, 145 * s);
    ctx.fillStyle = '#bfa86e'; ctx.fillRect(ox + x * s, oy + 12 * s, 1.5 * s, 145 * s);
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(ox + (x + 8) * s, oy + 12 * s, 3 * s, 145 * s);
  }
  ctx.font = 4.5 * s + 'px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = '#9a9ab0';
  ctx.fillText('A / D ou setas: virar página · C ou Esc: fechar', VW / 2, oy + (BH + 3) * s);
  ctx.restore();
}
