// Tela de título: a cena é desenhada num canvas pequeno e ampliada sem suavização (pixel art de verdade)
const GLYPH = {
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#']
};
const SKY = ['#080818', '#0e0e2a', '#151236', '#1f1642', '#2d1b50', '#41245a', '#5c2f64', '#7d3c68', '#a24d66', '#c9625e', '#e8805a', '#f6a35e', '#fcc772'];
let TC = null, titleT = 0;

function titleScene(g, AW, AH, t) {
  const R = (c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const hz = Math.round(AH * 0.72), bh = hz / SKY.length;
  SKY.forEach((c, i) => R(c, 0, i * bh, AW, bh + 1));
  for (let i = 1; i < SKY.length; i++) for (let x = (i & 1) * 2; x < AW; x += 4) R(SKY[i], x, i * bh - 1, 2, 1);
  for (let i = 0; i < 80; i++) { const tw = (t * 0.04 + i) % 6; if (tw < 4) R(tw < 1 ? '#fff' : '#9aa0d0', hash(i, 1) % AW, hash(i, 2) % (hz * 0.55), 1, 1); }
  // o sol é um relógio preso em 14:20, e o ponteiro dos segundos anda, anda... e volta
  const cx = Math.round(AW * 0.58), cy = Math.round(hz * 0.8), r = Math.round(AH * 0.25);
  const gl = g.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 2.4); gl.addColorStop(0, 'rgba(255,190,90,0.5)'); gl.addColorStop(1, 'rgba(255,190,90,0)');
  g.fillStyle = gl; g.fillRect(0, 0, AW, hz);
  g.fillStyle = '#f0a050'; g.beginPath(); g.arc(cx, cy, r + 2, 0, 6.2832); g.fill();
  g.fillStyle = '#ffe9b0'; g.beginPath(); g.arc(cx, cy, r, 0, 6.2832); g.fill();
  for (let i = 0; i < 12; i++) { const a = i * 0.5236; R('#6a2e1e', cx + Math.cos(a) * r * 0.86 - 1, cy + Math.sin(a) * r * 0.86 - 1, 2, 2); }
  for (let k = 0; k < 6; k++) { const y = cy + r * 0.25 + k * r * 0.13; R(SKY[Math.min(SKY.length - 1, Math.floor(y / bh))], cx - r - 3, y, 2 * r + 6, 1 + k * 0.6); }
  g.lineCap = 'butt'; g.strokeStyle = '#4a2218'; g.lineWidth = 2; g.beginPath();
  g.moveTo(cx, cy); g.lineTo(cx + Math.cos(-0.349) * r * 0.5, cy + Math.sin(-0.349) * r * 0.5);
  g.moveTo(cx, cy); g.lineTo(cx + Math.cos(0.5236) * r * 0.8, cy + Math.sin(0.5236) * r * 0.8); g.stroke();
  const c = t % 160, st = c < 20 ? 0 : c < 45 ? 1 : c < 70 ? 2 : c < 100 ? 3 : c < 120 ? 3 - (c - 100) * 0.15 : 0, sa = -1.5708 + st * 0.5236;
  g.strokeStyle = '#c0302a'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(sa) * r * 0.92, cy + Math.sin(sa) * r * 0.92); g.stroke();
  R('#4a2218', cx - 2, cy - 2, 4, 4);
  for (let x = 0; x < AW; x++) { const y = hz - 8 - 6 * Math.sin(x * 0.045 + 1) - 4 * Math.sin(x * 0.11); R('#2a1648', x, y, 1, AH - y); }
  // a cidade: casas que viram desenho a lápis e voltam
  const tx = Math.round(AW * 0.27), th = Math.round(AH * 0.4), ty = hz - th;
  for (let i = 0; i < 11; i++) {
    const x = Math.round(i * AW / 10 + hash(i, 5) % 8 - 4), w = 14 + hash(i, 6) % 10, h = 12 + hash(i, 7) % 16, y = hz - h + 4;
    if (Math.abs(x + w / 2 - tx - 7) < 18) continue;
    if (Math.sin(t * 0.011 + i * 2.3) > 0.62) {
      for (let k = 0; k < w; k += 2) { R('#b8b8d8', x + k, y, 1, 1); R('#b8b8d8', x + k, y + h - 1, 1, 1); }
      for (let k = 0; k < h; k += 2) { R('#b8b8d8', x, y + k, 1, 1); R('#b8b8d8', x + w - 1, y + k, 1, 1); }
      for (let k = 2; k < Math.min(w, h) - 2; k += 3) R('#8888a8', x + k, y + k, 1, 1);
    } else {
      R('#140c26', x, y, w, h + 6); R('#140c26', x - 1, y - 3, w + 2, 3); R('#140c26', x + 3, y - 6, w - 6, 3);
      for (let k = 0; k < 3; k++) if (hash(i * 3 + k, 9) % 3 && (t * 0.05 + i + k) % 9 > 0.6) R('#ffcf5a', x + 3 + k * 5, y + 4, 2, 3);
    }
  }
  // a torre
  R('#0d0820', tx, ty, 14, th + 6); R('#0d0820', tx - 2, ty - 4, 18, 4); R('#0d0820', tx + 2, ty - 8, 10, 4); R('#0d0820', tx + 5, ty - 15, 4, 7);
  g.fillStyle = '#ffdf8a'; g.beginPath(); g.arc(tx + 7, ty + 10, 5, 0, 6.2832); g.fill();
  g.strokeStyle = '#3a1a10'; g.lineWidth = 1; g.beginPath();
  g.moveTo(tx + 7, ty + 10); g.lineTo(tx + 7 + Math.cos(0.52) * 4, ty + 10 + Math.sin(0.52) * 4);
  g.moveTo(tx + 7, ty + 10); g.lineTo(tx + 7 + Math.cos(-0.35) * 2.5, ty + 10 + Math.sin(-0.35) * 2.5); g.stroke();
  for (let k = 0; k < 3; k++) R('#ffcf5a', tx + 6, ty + 24 + k * 12, 2, 4);
  // chão e o Teo olhando o relógio de bolso
  R('#07040e', 0, hz + 4, AW, AH - hz);
  for (let x = 0; x < AW; x++) { const y = hz + 2 - 3 * Math.sin(x * 0.05) - 2 * Math.sin(x * 0.13 + 2); R('#0a0612', x, y, 1, AH - y); }
  const x0 = Math.round(AW * 0.14), y0 = hz + 3;
  const wg = g.createRadialGradient(x0 + 3, y0 - 5, 1, x0 + 3, y0 - 5, 9 + Math.sin(t * 0.06) * 2); wg.addColorStop(0, 'rgba(255,226,120,0.9)'); wg.addColorStop(1, 'rgba(255,226,120,0)');
  g.fillStyle = wg; g.fillRect(x0 - 8, y0 - 16, 22, 22);
  R('#05030a', x0 - 2, y0 - 7, 5, 7); R('#05030a', x0 - 1, y0 - 10, 3, 3); R('#9a2a2a', x0 - 2, y0 - 7, 5, 1); R('#05030a', x0 + 3, y0 - 7, 2, 1); R('#ffe27a', x0 + 4, y0 - 6, 1, 1);
  for (let i = 0; i < 28; i++) { const x = hash(i, 11) % AW + Math.sin(t * 0.02 + i) * 6, y = (((hash(i, 12) % AH) - t * (0.08 + (i % 5) * 0.04)) % AH + AH) % AH; R(i % 2 ? '#ffd36a' : '#ff9a5a', x, y, 1, 1); }
  // o título TICK em letras de pixel
  const gs = 4, gw = 5 * gs, gap = 4, x1 = Math.round((AW - (4 * gw + 3 * gap)) / 2), y1 = 12 + Math.round(Math.sin(t * 0.03));
  const tg = g.createRadialGradient(AW / 2, y1 + 14, 4, AW / 2, y1 + 14, 80); tg.addColorStop(0, 'rgba(255,200,90,' + (0.28 + 0.1 * Math.sin(t * 0.05)).toFixed(2) + ')'); tg.addColorStop(1, 'rgba(255,200,90,0)');
  g.fillStyle = tg; g.fillRect(0, 0, AW, hz);
  const ROWC = ['#fff6c0', '#ffe680', '#ffd24a', '#f6b030', '#ea9028', '#d6702a', '#b4502a'];
  [0, 1].forEach(pass => 'TICK'.split('').forEach((ch, n) => GLYPH[ch].forEach((row, j) => [...row].forEach((v, i) => {
    if (v !== '#') return;
    const x = x1 + n * (gw + gap) + i * gs, y = y1 + j * gs;
    if (pass === 0) { R('#0a0410', x, y + 3, gs + 1, gs + 1); R('#1a0a1c', x - 1, y - 1, gs + 2, gs + 2); }
    else { R(ROWC[j], x, y, gs, gs); R('rgba(255,255,255,0.5)', x, y, gs, 1); }
  }))));
}

function titleItems() {
  return [{ t: 'NOVO JOGO', f: newGame }].concat(S.hasSave ? [{ t: 'CONTINUAR', f: continueGame }] : []).concat([{ t: 'TELA CHEIA', f: toggleFS }]);
}
function titleKey(code) {
  const it = titleItems();
  if (code === 'ArrowUp' || code === 'KeyW') S.menu = (S.menu + it.length - 1) % it.length;
  else if (code === 'ArrowDown' || code === 'KeyS') S.menu = (S.menu + 1) % it.length;
  else if (code === 'Enter' || code === 'KeyE' || code === 'Space') it[S.menu].f();
}
function drawTitle() {
  titleT++;
  const s = Math.max(1, Math.floor(Math.min(VW / 320, VH / 180))), AW = Math.ceil(VW / s), AH = Math.ceil(VH / s);
  if (!TC || TC.width !== AW || TC.height !== AH) { TC = document.createElement('canvas'); TC.width = AW; TC.height = AH; }
  titleScene(TC.getContext('2d'), AW, AH, titleT);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(TC, 0, 0, AW * s, AH * s);
  const vg = ctx.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.4, VW / 2, VH / 2, Math.max(VW, VH) * 0.8);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
  ctx.setTransform(Hs, 0, 0, Hs, 0, 0);
  const HW = VW / Hs, HH = VH / Hs, items = titleItems();
  text('R E W I N D   T O W N', HW / 2, 50 * s / Hs, '#f6c76a', 'center', 'bold 9px monospace');
  items.forEach((it, i) => { const sel = i === S.menu; text((sel ? ((titleT >> 4) & 1 ? '> ' : '  ') : '  ') + it.t, HW / 2, HH * 0.76 + i * 13, sel ? '#ffe27a' : '#9a8fb0', 'center', sel ? 'bold 10px monospace' : '10px monospace'); });
  if (HH > 200) text('↑ ↓ escolher · ENTER confirmar', HW / 2, HH - 12, '#6a6088', 'center');
}
