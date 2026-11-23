// Loop principal e desenho
const cv = document.getElementById('game'), ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;

function fit() {
  const s = Math.max(1, Math.floor(Math.min(innerWidth / W, (innerHeight - 24) / H)));
  cv.style.width = W * s + 'px'; cv.style.height = H * s + 'px';
}
addEventListener('resize', fit); fit();

function text(str, x, y, color, align) {
  ctx.font = '8px monospace'; ctx.textBaseline = 'top'; ctx.textAlign = align || 'left';
  ctx.fillStyle = '#000'; ctx.fillText(str, x + 1, y + 1);
  ctx.fillStyle = color; ctx.fillText(str, x, y);
}

function draw() {
  drawWorld(ctx, S.era, S.cut, S.frame);
  drawGuards(ctx);
  drawPlayer(ctx);

  ctx.fillStyle = S.era === 'passado' ? 'rgba(200,150,70,0.22)' : 'rgba(20,20,50,0.18)';
  ctx.fillRect(0, 0, W, H);
  if (S.stopped) { ctx.fillStyle = 'rgba(110,140,255,0.28)'; ctx.fillRect(0, 0, W, H); }
  if (S.rewinding) {
    ctx.fillStyle = 'rgba(170,80,220,0.25)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let y = (S.frame * 2) % 6; y < H; y += 6) ctx.fillRect(0, y, W, 1);
  }

  text(S.era === 'passado' ? 'PASSADO' : 'PRESENTE', 6, 5, S.era === 'passado' ? '#f0c060' : '#9ad0ff');
  px(ctx, '#111', 6, 16, 62, 6);
  px(ctx, S.energy < 15 ? '#e05050' : '#58d0ff', 7, 17, 60 * S.energy / 100, 4);
  if (S.stopped) text('TEMPO PARADO', 74, 5, '#b0c0ff');
  if (S.rewinding) text('VOLTANDO...', 74, 5, '#e0a0ff');
  if (S.msgT > 0 || S.caught) {
    px(ctx, 'rgba(0,0,0,0.6)', 0, H - 16, W, 16);
    text(S.msg, W / 2, H - 12, '#fff', 'center');
  }
  if (S.won) {
    px(ctx, 'rgba(0,0,0,0.75)', 0, 0, W, H);
    text('O RELÓGIO VOLTOU A ANDAR', W / 2, 88, '#f0c060', 'center');
    text('Tempo: ' + S.winT + 's', W / 2, 106, '#fff', 'center');
    text('Mas alguma coisa na cidade sumiu...', W / 2, 122, '#9ad0ff', 'center');
    text('ENTER: jogar de novo', W / 2, 146, '#aaa', 'center');
  }
}

let last = performance.now(), acc = 0;
function loop(now) {
  acc += Math.min(100, now - last); last = now;
  while (acc >= 1000 / 60) { tick(); acc -= 1000 / 60; }
  draw();
  requestAnimationFrame(loop);
}
resetGame();
requestAnimationFrame(loop);
