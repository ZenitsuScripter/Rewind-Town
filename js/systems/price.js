// O preço do Tick: peças da cidade (oferta, apagar, paradoxo) e save
const ERASED = new Set();
const maskOf = () => PECAS.reduce((m, p, i) => ERASED.has(p.id) ? m | (1 << i) : m, 0);

function offerList() {
  let r = PECAS.filter(p => !ERASED.has(p.id));
  const ok = r.filter(p => !p.req || S[p.req]); if (ok.length) r = ok;
  return r.map(p => [p, hash(PECAS.indexOf(p), ERASED.size + 7)]).sort((a, b) => a[1] - b[1]).slice(0, 3).map(a => a[0]);
}
function askPrice(n, then) {
  const opts = offerList();
  if (!opts.length) return then();
  S.offer = { opts, i: 0, n, n0: n, then };
}
function offerKey(code) {
  const o = S.offer, k = o.opts.length;
  if (code === 'ArrowLeft' || code === 'KeyA') o.i = (o.i + k - 1) % k;
  else if (code === 'ArrowRight' || code === 'KeyD') o.i = (o.i + 1) % k;
  else if (code === 'Escape' && o.n === o.n0) S.offer = null;
  else if (code === 'KeyE' || code === 'Enter' || code === 'Space') {
    ERASED.add(o.opts[o.i].id); clue('preco'); saveGame(); o.n--;
    if (o.n > 0 && (o.opts = offerList()).length) o.i = 0;
    else { S.offer = null; o.then(); if (ERASED.size >= PECAS.length) S.end = 'branco'; }
  }
}
function tryTravel() {
  if (S.eraCd > 0) return;
  const to = S.era === 'presente' ? 'passado' : 'presente';
  if (blocked(S.px, S.py, to)) return say('Há algo bloqueando você nesse ano.');
  if (to === 'passado') askPrice(1, () => travel(to)); else travel(to);
}
function travel(to) {
  S.from = S.era; S.era = to; S.trav = 50; S.eraCd = 60;
  say(to === 'passado' ? 'Você viajou para ' + YEAR[to] + '.' : 'De volta a ' + YEAR[to] + '.');
  if (to === 'passado' && !S.talked && !ERASED.has('amadeu')) { S.dlg = FIRST; S.di = 0; S.talked = 1; clue('tick'); }
}
function saveGame() { try { localStorage.setItem('tick.save', JSON.stringify({ e: [...ERASED], c: [...FOUND] })); } catch (e) {} }
function clearSave() { try { localStorage.removeItem('tick.save'); } catch (e) {} }
function loadGame() {
  try {
    const d = JSON.parse(localStorage.getItem('tick.save') || 'null');
    if (d && d.e) d.e.forEach(id => { if (PECAS.some(p => p.id === id)) ERASED.add(id); });
    if (d && d.c) d.c.forEach(id => { if (CLUES.some(c => c.id === id)) FOUND.add(id); });
    if (ERASED.size >= PECAS.length) S.end = 'branco';
  } catch (e) {}
}
