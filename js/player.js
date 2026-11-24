// Jogador, Amadeu, vigias, teclado e interações
const keys = {};
const PAL_P = { k: '#3a2a1a', s: '#f0c090', K: '#111', b: '#e8b030', p: '#2a3a6a', g: '#fff3a0', o: '#c8861a' };
const PAL_G = { k: '#b0302a', s: '#d8a880', K: '#111', b: '#5a5a78', p: '#33334a', g: '#ffd060', o: '#44445e' };
const PAL_A = { k: '#ececec', s: '#e0b890', K: '#111', b: '#8a5a32', p: '#4a4a5a', g: '#ececec', o: '#6a4426' };
const TOP = ["..kkkk..", ".kkkkkk.", ".ssssss.", ".sKssKs.", ".ssssss.", "obbbbbbo", "obbgbbbo", ".bbbbbb."];
const TOP_A = TOP.map((r, i) => i === 4 ? ".gggggg." : r);
const LEG = [["..p..p..", "..p..p.."], [".p....p.", ".p....p."]];

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
  if (code === 'KeyF') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); return; }
  if (S.won) { if (code === 'Enter') resetGame(); return; }
  if (S.dlg) { if (code === 'KeyE' || code === 'Enter' || code === 'Space') { S.di++; if (S.di >= S.dlg.length) S.dlg = null; } return; }
  if (S.caught) return;
  if (code === 'KeyT') {
    if (S.eraCd > 0) return;
    const to = S.era === 'presente' ? 'passado' : 'presente';
    if (blocked(S.px, S.py, to)) { say('Há algo bloqueando você nesse ano.'); return; }
    S.from = S.era; S.era = to; S.trav = 50; S.eraCd = 60;
    say(to === 'passado' ? 'Você viajou para ' + YEAR[to] + '.' : 'De volta a ' + YEAR[to] + '.');
  }
  if (code === 'KeyE') interact();
}

function interact() {
  const nearBush = dist(S.px, S.py, BUSH.x, BUSH.y) < 28, nearClock = dist(S.px, S.py, CLOCK.x, CLOCK.y) < 34;
  if (S.era === 'passado' && dist(S.px, S.py, AMADEU.x, AMADEU.y) < 26) {
    S.dlg = S.cut ? AFTER : S.talked ? AGAIN : FIRST; S.di = 0; S.talked = 1;
  } else if (nearBush && !S.cut && S.era === 'passado') { S.cut = true; say('Você cortou o broto. O futuro mudou!'); }
  else if (nearBush && !S.cut) say('Espinhos! Em 1996 isso era só um broto...');
  else if (nearClock && S.era === 'presente') { S.won = true; S.winT = hms(S.t); }
  else if (nearClock) say('Em 1996 o relógio ainda funciona. Volte a 2026.');
  else say('Nada para fazer aqui.');
}

function blocked(x, y, era) {
  era = era || S.era;
  for (const ox of [-4, 3]) for (const oy of [-4, 3])
    if (solidAt(Math.floor((x + ox) / T), Math.floor((y + oy) / T), S.cut, era)) return true;
  return false;
}
function movePlayer() {
  let dx = 0, dy = 0;
  if (keys.ArrowLeft || keys.KeyA) dx--;
  if (keys.ArrowRight || keys.KeyD) dx++;
  if (keys.ArrowUp || keys.KeyW) dy--;
  if (keys.ArrowDown || keys.KeyS) dy++;
  if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
  if (dx || dy) S.walk++;
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

function drawChar(c, top, pal, x, y, step) {
  x = Math.round(x); y = Math.round(y);
  px(c, 'rgba(0,0,0,0.3)', x - 4, y + 4, 8, 2);
  sprite(c, top, pal, x - 4, y - 6);
  sprite(c, LEG[step], pal, x - 4, y + 2);
}
function drawActors(c) {
  if (S.era === 'passado') drawChar(c, TOP_A, PAL_A, AMADEU.x, AMADEU.y, 0);
  for (const g of S.guards) {
    c.fillStyle = 'rgba(255,220,120,0.14)'; c.beginPath(); c.arc(Math.round(g.x), Math.round(g.y), 12, 0, 6.2832); c.fill();
    drawChar(c, TOP, PAL_G, g.x, g.y, (S.frame >> 3) & 1);
  }
  drawChar(c, TOP, PAL_P, S.px, S.py, (S.walk >> 3) & 1);
}
