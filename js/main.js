// Tela adaptável (pixels físicos, imune ao zoom do navegador), câmera, loop e HUD
const cv = document.getElementById('game'), ctx = cv.getContext('2d', { alpha: false });
let VW = 320, VH = 180, camX = 0, camY = 0, snapCam = true;
const Hs = 2;
const LAY = {};
function layer(era, cut) {
  const k = era + cut;
  if (!LAY[k]) { const c = document.createElement('canvas'); c.width = W * Z; c.height = H * Z; drawTiles(c.getContext('2d'), era, cut); LAY[k] = c; }
  return LAY[k];
}

function fit() {
  const dpr = devicePixelRatio || 1, dw = Math.round(innerWidth * dpr), dh = Math.round(innerHeight * dpr);
  const s = Math.max(1, Math.floor(Math.min(dw / 640, dh / 360)));
  VW = Math.ceil(dw / s); VH = Math.ceil(dh / s);
  cv.width = VW; cv.height = VH;
  cv.style.width = VW * s / dpr + 'px'; cv.style.height = VH * s / dpr + 'px';
  ctx.imageSmoothingEnabled = false; snapCam = true;
}
addEventListener('resize', fit); fit();

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
const PT = Array.from({ length: 40 }, (_, i) => ({ x: hash(i, 1) % W, y: hash(i, 2) % H, s: 0.4 + (hash(i, 3) % 10) / 10, p: (hash(i, 4) % 628) / 100 }));
function drawParticles(c, past) {
  const u = S.t * 10;
  for (const q of PT) {
    c.fillStyle = past ? 'rgba(255,240,150,' + (0.5 + 0.4 * Math.sin(u * 0.1 + q.p)).toFixed(2) + ')' : 'rgba(190,200,220,0.45)';
    c.fillRect(past ? q.x + Math.sin(u * 0.05 * q.s + q.p) * 7 : (q.x + u * 0.12 * q.s) % W, past ? q.y + Math.cos(u * 0.04 * q.s + q.p) * 5 : (q.y + u * 0.3 * q.s) % H, 0.8, 0.8);
  }
}

function draw() {
  const past = S.era === 'passado';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  px(ctx, '#0a0a12', 0, 0, VW, VH);
  const WW = W * Z, WH = H * Z;
  const tx = WW > VW ? Math.max(0, Math.min(WW - VW, S.px * Z - VW / 2)) : (WW - VW) / 2;
  const ty = WH > VH ? Math.max(0, Math.min(WH - VH, S.py * Z - VH / 2)) : (WH - VH) / 2;
  if (snapCam) { camX = tx; camY = ty; snapCam = false; } else { camX += (tx - camX) * 0.15; camY += (ty - camY) * 0.15; }
  ctx.setTransform(1, 0, 0, 1, -Math.round(camX), -Math.round(camY));
  ctx.drawImage(layer(S.era, S.cut), 0, 0);
  ctx.scale(Z, Z);
  drawHands(ctx, past || S.won, S.t);
  drawParticles(ctx, past);
  drawActors(ctx);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  veil(past ? 'rgba(255,200,120,0.12)' : 'rgba(10,15,40,0.22)');
  if (S.stopped) veil('rgba(110,140,255,0.28)');
  if (S.rewinding) { veil('rgba(170,80,220,0.25)'); ctx.fillStyle = 'rgba(255,255,255,0.12)'; for (let y = (S.frame * 2) % 6; y < VH; y += 6) ctx.fillRect(0, y, VW, 1); }
  if (S.trav > 0) {
    const k = S.trav / 50; veil('rgba(255,255,255,' + (Math.sin(k * 3.1416) * 0.55).toFixed(2) + ')');
    ctx.fillStyle = 'rgba(120,200,255,0.3)'; for (let i = 0; i < 6; i++) ctx.fillRect(0, hash(i, S.trav) % VH, VW, 2);
  }

  const vg = ctx.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.35, VW / 2, VH / 2, Math.max(VW, VH) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
  ctx.setTransform(Hs, 0, 0, Hs, 0, 0); const HW = VW / Hs, HH = VH / Hs;
  // HUD: era + energia
  text(past ? 'PASSADO' : 'PRESENTE', 6, 5, past ? '#f0c060' : '#9ad0ff');
  px(ctx, '#111', 6, 16, 62, 6); px(ctx, S.energy < 15 ? '#e05050' : '#58d0ff', 7, 17, 60 * S.energy / 100, 4);
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
    text('A TORRE VOLTOU A BATER', HW / 2, m - 34, '#f0c060', 'center', 'bold 11px monospace');
    text('2026 · ' + S.winT, HW / 2, m - 16, '#fff', 'center');
    text('Mas a casa do Amadeu não existe mais.', HW / 2, m, '#9ad0ff', 'center');
    text('O Tick cobrou seu preço.', HW / 2, m + 12, '#9ad0ff', 'center');
    text('ENTER: jogar de novo', HW / 2, m + 34, '#aaa', 'center');
  }
}

let last = performance.now(), acc = 0;
function loop(now) {
  acc += Math.min(100, now - last); last = now;
  while (acc >= 1000 / 60) { tick(); acc -= 1000 / 60; }
  draw(); requestAnimationFrame(loop);
}
['presente', 'passado'].forEach(e => [false, true].forEach(c => layer(e, c)));
resetGame();
requestAnimationFrame(loop);
