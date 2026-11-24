// Jogador, vigias e interações
function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
function say(t) { S.msg = t; S.msgT = 200; }

function interact() {
  const nearBush = dist(S.px, S.py, BUSH.x, BUSH.y) < 28, nearClock = dist(S.px, S.py, CLOCK.x, CLOCK.y) < 34, past = S.era === 'passado';
  if (past && dist(S.px, S.py, AMADEU.x, AMADEU.y) < 26) {
    if (ERASED.has('amadeu')) say('O traço no papel não responde. Ninguém aqui conhece você.');
    else { S.dlg = S.cut ? AFTER : S.talked ? AGAIN : FIRST; S.di = 0; S.talked = 1; }
  } else if (nearBush && past && !S.cut) { S.cut = true; say('Você cortou o broto. O futuro mudou!'); }
  else if (nearBush && past) replant();
  else if (nearBush && !S.cut) say('Espinhos! Em 1996 isso era só um broto...');
  else if (nearClock && !past) { S.won = true; S.winT = hms(S.t); }
  else if (nearClock) say('Em 1996 o relógio ainda funciona. Volte a 2026.');
  else say('Nada para fazer aqui.');
}
// Plantar o broto de novo: se o jogador já usou o portão aberto, é paradoxo (custa 2 peças)
function replant() {
  S.cut = false; const bad = blocked(S.px, S.py); S.cut = true;
  if (bad) return say('Saia da frente do broto.');
  if (!S.used) { S.cut = false; return say('Você plantou o broto de novo.'); }
  say('Paradoxo! Você já passou por aquele portão.');
  askPrice(2, () => { S.cut = false; S.used = 0; say('O Tick costurou a contradição.'); });
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

function makeGuards() { return GUARDS.map(g => Object.assign({}, g)); }
function moveGuards() {
  for (const g of S.guards) {
    g[g.axis] += g.s * g.d;
    if (g[g.axis] >= g.max) g.d = -1;
    if (g[g.axis] <= g.min) g.d = 1;
  }
}
function nearGuard(r) { return S.guards.some(g => dist(S.px, S.py, g.x, g.y) < r); }

