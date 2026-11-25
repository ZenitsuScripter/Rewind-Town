// Fases: carregar os dados da fase, novo jogo, continuar, recomeçar e voltar ao título
const FASES = [FASE1, FASE2];
function loadFase(n) {
  F = FASES[n]; S.fase = n;
  ({ YEAR, TOD0, LAYOUT, START, CLOCK, BUSH, AMADEU, GUARDS, PECAS, INTRO, FIRST, AGAIN, AFTER } = F);
  PLACE = {}; PECAS.forEach(p => { if (p.ch) PLACE[p.ch] = p.id; });
  for (const k in LAY) delete LAY[k];
}
function startFase(n) { loadFase(n); resetGame(false); S.title = false; S.card = 170; S.dlg = INTRO; saveGame(); }
function newGame() { clearSave(); ERASED.clear(); FOUND.clear(); startFase(0); }
function continueGame() {
  const d = readSave(); if (!d) return newGame();
  ERASED.clear(); FOUND.clear();
  (d.e || []).forEach(id => ERASED.add(id)); (d.c || []).forEach(id => { if (CLUES.some(c => c.id === id)) FOUND.add(id); });
  loadFase(d.f || 0); resetGame(false); S.title = false; S.card = 120;
  if (nGone() >= PECAS.length) S.end = 'branco';
}
function restartFase() { PECAS.forEach(p => ERASED.delete(p.id)); startFase(S.fase); }
function goTitle() { S.title = true; S.menu = 0; S.hasSave = hasSave(); }
