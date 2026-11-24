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
  if (code === 'KeyF') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); return; }
  if (S.won || S.end) { if (code === 'Enter') resetGame(); return; }
  if (S.offer) { offerKey(code); return; }
  if (S.dlg) { if (code === 'KeyE' || code === 'Enter' || code === 'Space') { S.di++; if (S.di >= S.dlg.length) S.dlg = null; } return; }
  if (S.caught) return;
  if (code === 'KeyT') tryTravel();
  if (code === 'KeyE') interact();
}
