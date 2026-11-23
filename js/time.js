// Mecânicas de tempo: parar, voltar (histórico) e mudar o futuro (cut)
const S = {
  px: START.x, py: START.y, cut: false, era: 'presente', guards: makeGuards(),
  energy: 100, stopped: false, rewinding: false, caught: false, won: false,
  frame: 0, eraCd: 0, msg: '', msgT: 0, winT: 0
};
let hist = [];

function snap() { return { px: S.px, py: S.py, cut: S.cut, era: S.era, g: S.guards.map(g => [g.x, g.y, g.d]) }; }
function restore(o) {
  S.px = o.px; S.py = o.py; S.cut = o.cut; S.era = o.era;
  o.g.forEach((v, i) => { S.guards[i].x = v[0]; S.guards[i].y = v[1]; S.guards[i].d = v[2]; });
}

function resetGame() {
  Object.assign(S, { px: START.x, py: START.y, cut: false, era: 'presente', guards: makeGuards(), energy: 100,
    stopped: false, rewinding: false, caught: false, won: false, frame: 0, eraCd: 0 });
  hist = [snap()];
  say('Conserte o relógio da torre. Cuidado com os guardas.');
}

function tick() {
  if (S.won) return;
  S.frame++;
  if (S.eraCd > 0) S.eraCd--;
  if (S.msgT > 0) S.msgT--;
  S.rewinding = !!keys.KeyR && (S.caught || S.energy > 0);
  S.stopped = !S.rewinding && !S.caught && !!keys.Space && S.energy > 0;

  if (S.rewinding) {
    for (let i = 0; i < 2 && hist.length > 1; i++) restore(hist.pop());
    if (!S.caught) S.energy = Math.max(0, S.energy - 0.5);
    else if (!nearGuard(40)) S.caught = false;
    else if (hist.length <= 1) { resetGame(); say('Não dava mais para voltar. Recomeçando.'); }
    return;
  }
  if (S.caught) return;

  S.energy = S.stopped ? Math.max(0, S.energy - 0.6) : Math.min(100, S.energy + 0.25);
  movePlayer();
  if (!S.stopped) {
    moveGuards();
    if (nearGuard(12)) { S.caught = true; say('Pegaram você! Segure R para voltar no tempo.'); return; }
  }
  hist.push(snap());
  if (hist.length > 360) hist.shift();
}
