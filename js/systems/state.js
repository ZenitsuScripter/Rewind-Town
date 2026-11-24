// Estado do jogo, histórico do tempo (buffer circular) e passo da simulação
const S = {
  px: START.x, py: START.y, cut: false, era: 'presente', from: 'presente', guards: makeGuards(), t: 0, energy: 100,
  stopped: false, rewinding: false, caught: false, won: false, frame: 0, eraCd: 0, trav: 0, walk: 0,
  msg: '', msgT: 0, winT: '', dlg: null, di: 0, talked: 0,
  offer: null, end: null, used: 0, mv: 0, note: 0, book: false
};
const HN = 360, HS = 12, HB = new Float32Array(HN * HS);
let hHead = 0, hLen = 0;

function push() {
  const o = hHead * HS, g = S.guards;
  HB[o] = S.px; HB[o + 1] = S.py; HB[o + 2] = S.t; HB[o + 3] = S.cut ? 1 : 0; HB[o + 4] = S.era === 'passado' ? 1 : 0; HB[o + 11] = S.used ? 1 : 0;
  for (let i = 0; i < 2; i++) { HB[o + 5 + i * 3] = g[i].x; HB[o + 6 + i * 3] = g[i].y; HB[o + 7 + i * 3] = g[i].d; }
  hHead = (hHead + 1) % HN; if (hLen < HN) hLen++;
}
function popRestore() {
  hHead = (hHead + HN - 1) % HN; hLen--;
  const o = hHead * HS, g = S.guards;
  S.px = HB[o]; S.py = HB[o + 1]; S.t = HB[o + 2]; S.cut = HB[o + 3] === 1; S.era = HB[o + 4] ? 'passado' : 'presente'; S.used = HB[o + 11];
  for (let i = 0; i < 2; i++) { g[i].x = HB[o + 5 + i * 3]; g[i].y = HB[o + 6 + i * 3]; g[i].d = HB[o + 7 + i * 3]; }
}

function resetGame(intro) {
  Object.assign(S, { px: START.x, py: START.y, cut: false, era: 'presente', from: 'presente', guards: makeGuards(), t: 0, energy: 100,
    stopped: false, rewinding: false, caught: false, won: false, frame: 0, eraCd: 0, trav: 0, talked: 0, dlg: intro === false ? null : INTRO, di: 0 });
  S.offer = null; S.end = null; S.used = 0; S.book = false; S.note = 0;
  if (intro !== false) { ERASED.clear(); FOUND.clear(); clearSave(); }
  hHead = 0; hLen = 0; push();
}

function tick() {
  if (S.trav > 0) S.trav--;
  if (S.msgT > 0) S.msgT--;
  if (S.note > 0) S.note--;
  if (S.won || S.dlg || S.offer || S.end || S.book) return;
  S.frame++; if (S.eraCd > 0) S.eraCd--;
  S.rewinding = !!keys.KeyR && (S.caught || S.energy > 0);
  S.stopped = !S.rewinding && !S.caught && !!keys.Space && S.energy > 0;
  if (S.rewinding) {
    for (let i = 0; i < 2 && hLen > 1; i++) popRestore();
    if (!S.caught) S.energy = Math.max(0, S.energy - 0.5);
    else if (!nearGuard(40)) S.caught = false;
    else if (hLen <= 1) { resetGame(false); say('Não dava mais para voltar. Recomeçando.'); }
    return;
  }
  if (S.caught) return;
  S.energy = S.stopped ? Math.max(0, S.energy - 0.6) : Math.min(100, S.energy + 0.25);
  movePlayer();
  if (S.cut && S.era === 'presente' && S.px > 160) S.used = 1;
  if (!FOUND.has('lacuna')) for (const q of PECAS) if (q.box && ERASED.has(q.id) && Math.abs(S.px - (q.box[0] + q.box[2] / 2) * T) < q.box[2] * T / 2 + 10 && Math.abs(S.py - (q.box[1] + q.box[3] / 2) * T) < q.box[3] * T / 2 + 10) { clue('lacuna'); say('Esse espaço vazio parece familiar... mas você não lembra do quê.'); }
  if (!S.stopped) {
    S.t += 0.1; moveGuards();
    if (nearGuard(12)) { S.caught = true; clue('vigias'); say('Os Vigias pegaram você! Segure R para voltar no tempo.'); return; }
  }
  push();
}
