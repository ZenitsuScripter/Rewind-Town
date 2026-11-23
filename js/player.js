// Jogador, guardas, entrada de teclado e interações
const keys = {};
const PAL_P = { k: '#3a2a1a', s: '#f0c090', K: '#111', b: '#e8b030', p: '#2a3a6a' };
const PAL_G = { k: '#b0302a', s: '#d8a880', K: '#111', b: '#5a5a78', p: '#33334a' };
const BODY = ["..kkkk..", ".kkkkkk.", ".ssssss.", ".sKssKs.", ".ssssss.", "..bbbb..", ".bbbbbb.", ".bbbbbb.", "..p..p..", "..p..p.."];

addEventListener('keydown', e => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  if (!e.repeat) onKey(e.code);
  keys[e.code] = true;
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
function say(t) { S.msg = t; S.msgT = 200; }

function onKey(code) {
  if (S.won) { if (code === 'Enter') resetGame(); return; }
  if (S.caught) return;
  if (code === 'KeyT' && S.eraCd <= 0) {
    S.era = S.era === 'presente' ? 'passado' : 'presente'; S.eraCd = 45;
    say(S.era === 'passado' ? 'Você viajou ao passado.' : 'De volta ao presente.');
  }
  if (code === 'KeyE') interact();
}

function interact() {
  const nearBush = dist(S.px, S.py, BUSH.x, BUSH.y) < 28, nearClock = dist(S.px, S.py, CLOCK.x, CLOCK.y) < 34;
  if (nearBush && !S.cut && S.era === 'passado') { S.cut = true; say('Você cortou o broto. O futuro mudou!'); }
  else if (nearBush && !S.cut) say('Espinhos! No passado isso era só um broto...');
  else if (nearClock && S.era === 'presente') { S.won = true; S.winT = (S.frame / 60).toFixed(1); }
  else if (nearClock) say('Aqui o relógio ainda funciona. Volte ao presente.');
  else say('Nada para fazer aqui.');
}

function blocked(x, y) {
  for (const ox of [-4, 3]) for (const oy of [-4, 3])
    if (solidAt(Math.floor((x + ox) / T), Math.floor((y + oy) / T), S.cut)) return true;
  return false;
}
function movePlayer() {
  let dx = 0, dy = 0;
  if (keys.ArrowLeft || keys.KeyA) dx--;
  if (keys.ArrowRight || keys.KeyD) dx++;
  if (keys.ArrowUp || keys.KeyW) dy--;
  if (keys.ArrowDown || keys.KeyS) dy++;
  if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
  if (!blocked(S.px + dx * 1.1, S.py)) S.px += dx * 1.1;
  if (!blocked(S.px, S.py + dy * 1.1)) S.py += dy * 1.1;
}

function makeGuards() {
  return [
    { x: 128, y: 24, axis: 'y', s: 0.9, d: 1, min: 24, max: 216 },
    { x: 168, y: 80, axis: 'x', s: 1.3, d: 1, min: 168, max: 296 }
  ];
}
function moveGuards() {
  for (const g of S.guards) {
    g[g.axis] += g.s * g.d;
    if (g[g.axis] >= g.max) g.d = -1;
    if (g[g.axis] <= g.min) g.d = 1;
  }
}
function nearGuard(r) { return S.guards.some(g => dist(S.px, S.py, g.x, g.y) < r); }

function drawPlayer(ctx) {
  px(ctx, 'rgba(0,0,0,0.3)', Math.round(S.px) - 4, Math.round(S.py) + 4, 8, 2);
  sprite(ctx, BODY, PAL_P, S.px - 4, S.py - 6);
}
function drawGuards(ctx) {
  for (const g of S.guards) {
    px(ctx, 'rgba(0,0,0,0.3)', Math.round(g.x) - 4, Math.round(g.y) + 4, 8, 2);
    sprite(ctx, BODY, PAL_G, g.x - 4, g.y - 6);
  }
}
