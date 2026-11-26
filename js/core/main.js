// Pipeline pixel-perfect: 1 pixel de arte = 1 pixel do canvas; o canvas só é ampliado por fator inteiro (sem suavização)
const cv = document.getElementById('game'), ctx = cv.getContext('2d', { alpha: false });
let VW = 640, VH = 360, camX = 0, camY = 0, snapCam = true, AF = 0;
const LAY = {};
function layer(era, cut) {
  const k = era + cut + maskOf();
  if (!LAY[k]) {
    const ks = Object.keys(LAY); if (ks.length >= 8) delete LAY[ks[0]];
    const c = document.createElement('canvas'); c.width = WP; c.height = HP; drawTiles(c.getContext('2d'), era, cut); LAY[k] = c;
  }
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

function draw() {
  AF++;
  if (S.title) { drawTitle(); return; }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false; px(ctx, '#0a0812', 0, 0, VW, VH);
  const tx = WP > VW ? Math.max(0, Math.min(WP - VW, S.px * Z - VW / 2)) : (WP - VW) / 2;
  const ty = HP > VH ? Math.max(0, Math.min(HP - VH, S.py * Z - VH / 2)) : (HP - VH) / 2;
  if (snapCam) { camX = tx; camY = ty; snapCam = false; } else { camX += (tx - camX) * 0.15; camY += (ty - camY) * 0.15; }
  ctx.setTransform(1, 0, 0, 1, -Math.round(camX), -Math.round(camY));
  ctx.drawImage(layer(S.era, S.cut), 0, 0);
  drawLive(ctx, S.era, S.t);
  drawParticles(ctx, S.era, S.t);
  drawActors(ctx);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawGrade();
  drawHUD();
}

let last = performance.now(), acc = 0;
function loop(now) {
  acc += Math.min(100, now - last); last = now;
  while (acc >= 1000 / 60) { tick(); acc -= 1000 / 60; }
  draw(); requestAnimationFrame(loop);
}
['presente', 'passado'].forEach(e => layer(e, false));
loadFase(0); resetGame(false); goTitle();
requestAnimationFrame(loop);
