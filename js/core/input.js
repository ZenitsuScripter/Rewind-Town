// Teclado
const keys = {};
addEventListener('keydown', e => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  if (!e.repeat) onKey(e.code);
  keys[e.code] = true;
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

function onKey(code) {
  if (code === 'KeyF') { toggleFS(); return; }
  if (S.title) { titleKey(code); return; }
  if (S.card > 0) { S.card = 0; return; }
  if (S.won || S.end) { if (code === 'Enter') S.won ? (F.next != null ? startFase(F.next) : goTitle()) : restartFase(); return; }
  if (S.book) { if (code === 'ArrowLeft' || code === 'KeyA') flipBook(-1); else if (code === 'ArrowRight' || code === 'KeyD') flipBook(1); else if (code === 'KeyC' || code === 'Escape' || code === 'KeyE' || code === 'Enter') S.book = false; return; }
  if (S.offer) { offerKey(code); return; }
  if (S.dlg) { if (code === 'KeyE' || code === 'Enter' || code === 'Space') { S.di++; if (S.di >= S.dlg.length) { S.dlg = null; if (S.after) { const f = S.after; S.after = null; f(); } } } return; }
  if (S.caught) return;
  if (code === 'KeyC') { S.book = true; S.bp = 0; return; }
  if (code === 'KeyT') tryTravel();
  if (code === 'KeyE') interact();
}

function toggleFS() { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); }
