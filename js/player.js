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
  S.mv = dx || dy ? 1 : 0; if (S.mv) S.walk++;
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

const V_P = { hair: '#3a2a1a', skin: '#f0c090', shirt: '#e8b030', pants: '#2a3a6a', scarf: '#d8453a', w: 1 };
const V_G = { hair: '#a8302a', skin: '#d8a880', shirt: '#4a4a68', pants: '#2a2a3c', scarf: '#2a2a3c' };
const V_A = { hair: '#ececec', skin: '#e0b890', shirt: '#8a5a32', pants: '#4a4a5a', scarf: '#ececec' };
function drawChar(c, x, y, v, st, mv) {
  x = Math.round(x * 2) / 2; y = Math.round(y * 2) / 2;
  const sw = mv ? Math.sin(st * 0.35) * 1.2 : 0;
  c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.ellipse(x, y + 4.6, 4.2, 1.6, 0, 0, 6.2832); c.fill();
  c.fillStyle = v.pants; c.fillRect(x - 2.4 + sw, y + 1.6, 1.8, 3); c.fillRect(x + 0.6 - sw, y + 1.6, 1.8, 3);
  c.fillStyle = '#16161e'; c.fillRect(x - 2.4 + sw, y + 4, 1.8, 0.8); c.fillRect(x + 0.6 - sw, y + 4, 1.8, 0.8);
  c.fillStyle = v.shirt; c.fillRect(x - 3, y - 2, 6, 4);
  c.fillStyle = v.scarf; c.fillRect(x - 2.6, y - 2.6, 5.2, 1.2);
  c.fillStyle = v.skin; c.beginPath(); c.arc(x, y - 4.8, 2.7, 0, 6.2832); c.fill();
  c.fillStyle = v.hair; c.beginPath(); c.arc(x, y - 5.2, 2.8, 3.1416, 6.2832); c.fill(); c.fillRect(x - 2.8, y - 5.4, 5.6, 0.8);
  c.fillStyle = '#111'; c.fillRect(x - 1.4, y - 4.5, 0.7, 0.8); c.fillRect(x + 0.7, y - 4.5, 0.7, 0.8);
  if (v.w) { c.fillStyle = '#ffe066'; c.fillRect(x + 1.2, y - 0.6, 1, 1); }
}
function drawActors(c) {
  if (S.era === 'passado') drawChar(c, AMADEU.x, AMADEU.y, V_A, 0, 0);
  for (const g of S.guards) {
    const q = c.createRadialGradient(g.x, g.y, 1, g.x, g.y, 16); q.addColorStop(0, 'rgba(255,225,130,0.35)'); q.addColorStop(1, 'rgba(255,225,130,0)');
    c.fillStyle = q; c.fillRect(g.x - 16, g.y - 16, 32, 32);
    drawChar(c, g.x, g.y, V_G, S.frame, 1);
  }
  drawChar(c, S.px, S.py, V_P, S.walk, S.mv && !S.rewinding);
}
