// Tempo: parar, voltar (buffer circular), viajar entre anos, mudar o futuro, história
const INTRO = [
  ['', '2026. A torre do relógio parou e a cidade está esquecendo de si mesma.'],
  ['', 'Teo achou um relógio de bolso, o TICK. Ele para o tempo, volta o tempo e leva a outros anos.'],
  ['', 'Mas toda mudança no passado apaga algo no presente. E os Vigias do Tempo caçam quem viaja. Descubra por que a torre parou.']
];
const FIRST = [
  ['Amadeu', 'Teo? Esse relógio no seu bolso... eu o desenhei, mas só vou construí-lo em 1997.'],
  ['Amadeu', 'Um broto de espinhos nasceu no portão do meio. Daqui a trinta anos ele vai sufocar a torre.'],
  ['Amadeu', 'Corte o broto (E), de perto. Mas o Tick sempre cobra um preço.']
];
const AGAIN = [['Amadeu', 'O broto fica no portão do meio. Chegue perto e use E. Cuidado com os Vigias.']];
const AFTER = [['Amadeu', 'O portão está livre. Volte a 2026 (T) e conserte a torre.'], ['Amadeu', 'Se minha casa sumir de lá... saiba que valeu a pena.']];

const S = {
  px: START.x, py: START.y, cut: false, era: 'presente', from: 'presente', guards: makeGuards(), t: 0, energy: 100,
  stopped: false, rewinding: false, caught: false, won: false, frame: 0, eraCd: 0, trav: 0, walk: 0,
  msg: '', msgT: 0, winT: '', dlg: null, di: 0, talked: 0
};
const HN = 360, HS = 11, HB = new Float32Array(HN * HS);
let hHead = 0, hLen = 0;

function push() {
  const o = hHead * HS, g = S.guards;
  HB[o] = S.px; HB[o + 1] = S.py; HB[o + 2] = S.t; HB[o + 3] = S.cut ? 1 : 0; HB[o + 4] = S.era === 'passado' ? 1 : 0;
  for (let i = 0; i < 2; i++) { HB[o + 5 + i * 3] = g[i].x; HB[o + 6 + i * 3] = g[i].y; HB[o + 7 + i * 3] = g[i].d; }
  hHead = (hHead + 1) % HN; if (hLen < HN) hLen++;
}
function popRestore() {
  hHead = (hHead + HN - 1) % HN; hLen--;
  const o = hHead * HS, g = S.guards;
  S.px = HB[o]; S.py = HB[o + 1]; S.t = HB[o + 2]; S.cut = HB[o + 3] === 1; S.era = HB[o + 4] ? 'passado' : 'presente';
  for (let i = 0; i < 2; i++) { g[i].x = HB[o + 5 + i * 3]; g[i].y = HB[o + 6 + i * 3]; g[i].d = HB[o + 7 + i * 3]; }
}

function resetGame(intro) {
  Object.assign(S, { px: START.x, py: START.y, cut: false, era: 'presente', from: 'presente', guards: makeGuards(), t: 0, energy: 100,
    stopped: false, rewinding: false, caught: false, won: false, frame: 0, eraCd: 0, trav: 0, talked: 0, dlg: intro === false ? null : INTRO, di: 0 });
  hHead = 0; hLen = 0; push();
}

function tick() {
  if (S.trav > 0) S.trav--;
  if (S.msgT > 0) S.msgT--;
  if (S.won || S.dlg) return;
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
  if (!S.stopped) {
    S.t += 0.1; moveGuards();
    if (nearGuard(12)) { S.caught = true; say('Os Vigias pegaram você! Segure R para voltar no tempo.'); return; }
  }
  push();
}
