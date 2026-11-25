// Tela adaptável, câmera e loop principal
// Tela adaptável (pixels físicos, imune ao zoom do navegador), câmera, loop e HUD
const cv = document.getElementById('game'), ctx = cv.getContext('2d', { alpha: false });
let VW = 320, VH = 180, camX = 0, camY = 0, snapCam = true;
const Hs = 2;
const LAY = {};
function layer(era, cut) {
  const k = era + cut + maskOf();
  if (!LAY[k]) {
    const ks = Object.keys(LAY); if (ks.length >= 8) delete LAY[ks[0]];
    const c = document.createElement('canvas'); c.width = W * Z; c.height = H * Z; drawTiles(c.getContext('2d'), era, cut); LAY[k] = c;
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
  if (S.title) { drawTitle(); return; }
  const past = YEAR[S.era] < 2000;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  px(ctx, '#0a0a12', 0, 0, VW, VH);
  const WW = W * Z, WH = H * Z;
  const tx = WW > VW ? Math.max(0, Math.min(WW - VW, S.px * Z - VW / 2)) : (WW - VW) / 2;
  const ty = WH > VH ? Math.max(0, Math.min(WH - VH, S.py * Z - VH / 2)) : (WH - VH) / 2;
  if (snapCam) { camX = tx; camY = ty; snapCam = false; } else { camX += (tx - camX) * 0.15; camY += (ty - camY) * 0.15; }
  ctx.setTransform(1, 0, 0, 1, -Math.round(camX), -Math.round(camY));
  ctx.drawImage(layer(S.era, S.cut), 0, 0);
  ctx.scale(Z, Z);
  if (YEAR[S.era] > 1950) drawHands(ctx, past, S.t);
  drawParticles(ctx, past);
  drawActors(ctx);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  veil(YEAR[S.era] < 1950 ? 'rgba(170,120,60,0.3)' : past ? 'rgba(255,200,120,0.12)' : 'rgba(10,15,40,0.22)');
  if (S.stopped) veil('rgba(110,140,255,0.28)');
  if (S.rewinding) { veil('rgba(170,80,220,0.25)'); ctx.fillStyle = 'rgba(255,255,255,0.12)'; for (let y = (S.frame * 2) % 6; y < VH; y += 6) ctx.fillRect(0, y, VW, 1); }
  if (S.trav > 0) {
    const k = S.trav / 50; veil('rgba(255,255,255,' + (Math.sin(k * 3.1416) * 0.55).toFixed(2) + ')');
    ctx.fillStyle = 'rgba(120,200,255,0.3)'; for (let i = 0; i < 6; i++) ctx.fillRect(0, hash(i, S.trav) % VH, VW, 2);
  }

  if (S.glitch > 0) { veil('rgba(255,255,255,0.18)'); ctx.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 5; i++) ctx.fillRect(0, hash(i, S.glitch) % VH, VW, 1); }
  const vg = ctx.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.35, VW / 2, VH / 2, Math.max(VW, VH) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
  drawHUD(past);
}

let last = performance.now(), acc = 0;
function loop(now) {
  acc += Math.min(100, now - last); last = now;
  while (acc >= 1000 / 60) { tick(); acc -= 1000 / 60; }
  draw(); requestAnimationFrame(loop);
}
loadFase(0); resetGame(false); goTitle();
layer('presente', false); layer('passado', false);
requestAnimationFrame(loop);
