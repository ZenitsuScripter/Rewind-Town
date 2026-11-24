// Pistas do mistério (descobertas jogando)
const FOUND = new Set();
function clue(id) {
  if (FOUND.has(id) || !CLUES.some(c => c.id === id)) return;
  FOUND.add(id); saveGame(); S.note = 240;
}
