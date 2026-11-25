// Fase 1: tudo que é dado (mapa, marcos, vigias, peças, falas). O código só lê daqui.
let YEAR = { presente: 2026, passado: 1996 };
let TOD0 = 14 * 3600 + 20 * 60;
// # muro/cerca  a-f casas  C relógio  B broto  P início
let LAYOUT = [
"####################",
"#........#.........#",
"#.bb.aa..#.eee..CC.#",
"#.bb.aa..#.eee..CC.#",
"#........#.........#",
"#........#.........#",
"#........B.........#",
"#........B.........#",
"#........#.........#",
"#.cc.dd..#.........#",
"#.cc.dd..#.fff.....#",
"#........#.fff.....#",
"#........#.........#",
"#P.......#.........#",
"####################"
];
let START = { x: 24, y: 216 }, CLOCK = { x: 272, y: 48 }, BUSH = { x: 152, y: 112 }, AMADEU = { x: 100, y: 108 };
let GUARDS = [
  { x: 128, y: 24, axis: 'y', s: 0.9, d: 1, min: 24, max: 216 },
  { x: 168, y: 80, axis: 'x', s: 1.3, d: 1, min: 168, max: 296 }
];
// As 9 peças da cidade (3 por era). req: só podem ser oferecidas depois disso.
let PECAS = [
  { id: 'casa-amadeu', nome: 'A casa do Amadeu', tipo: 'lugar', ch: 'a', box: [5, 2, 2, 2] },
  { id: 'casa-lia', nome: 'A casa da Dona Lia', tipo: 'lugar', ch: 'b', box: [2, 2, 2, 2] },
  { id: 'padaria', nome: 'A padaria', tipo: 'lugar', ch: 'c', box: [2, 9, 2, 2] },
  { id: 'escola', nome: 'A escola', tipo: 'lugar', ch: 'd', box: [5, 9, 2, 2] },
  { id: 'biblioteca', nome: 'A biblioteca', tipo: 'lugar', ch: 'e', box: [11, 2, 3, 2] },
  { id: 'oficina', nome: 'A oficina', tipo: 'lugar', ch: 'f', box: [11, 10, 3, 2] },
  { id: 'amadeu', nome: 'O Amadeu', tipo: 'pessoa', req: 'talked' },
  { id: 'flores', nome: 'As flores de 1996', tipo: 'objeto' },
  { id: 'sino', nome: 'O sino da torre', tipo: 'acontecimento' }
];
let PLACE = {}; PECAS.forEach(p => { if (p.ch) PLACE[p.ch] = p.id; });
const EFEITO = { lugar: 'vira passagem livre', pessoa: 'esquece você', objeto: 'perde a cor', acontecimento: 'deixa de ter existido' };

let INTRO = [
  ['', '2026. A torre do relógio parou e a cidade está esquecendo de si mesma.'],
  ['', 'Teo achou um relógio de bolso, o TICK. Ele para o tempo, volta o tempo e leva a outros anos.'],
  ['', 'Mas cada ida ao passado cobra uma peça da cidade, que some para sempre. E os Vigias do Tempo caçam quem viaja.']
];
let FIRST = [
  ['Amadeu', 'Teo? Esse relógio no seu bolso... eu o desenhei, mas só vou construí-lo em 1997.'],
  ['Amadeu', 'Um broto de espinhos nasceu no portão do meio. Daqui a trinta anos ele vai sufocar a torre.'],
  ['Amadeu', 'Corte o broto (E), de perto. E lembre: o Tick sempre cobra um preço.']
];
let AGAIN = [['Amadeu', 'O broto fica no portão do meio. Chegue perto e use E. Cuidado com os Vigias.']];
let AFTER = [
  ['Amadeu', 'O portão está livre. Volte a 2026 (T) e conserte a torre.'],
  ['Amadeu', 'Plantar o broto de novo, depois de você já ter passado por lá, seria um paradoxo. O Tick cobraria o dobro.']
];

// Pistas do caderno do Teo: o progresso do mistério é saber, não achar itens
const CLUES = [
  { id: 'tick', t: 'O Tick sem origem', x: 'O Amadeu desenhou o relógio de bolso, mas só vai construí-lo em 1997.' },
  { id: 'broto', t: 'O broto do portão', x: 'Em 1996 era só um broto. Em 2026 virou uma parede de espinhos.' },
  { id: 'preco', t: 'O preço', x: 'Cada ida ao passado cobra uma peça da cidade. O que some vira traço de lápis.' },
  { id: 'lacuna', t: 'Lacunas', x: 'Onde havia uma peça só sobrou o traço. Ninguém lembra do que era.' },
  { id: 'vigias', t: 'Os Vigias', x: 'Os Vigias caçam quem viaja com o Tick. Quem são eles?' },
  { id: '1420', t: 'O minuto 14:20', x: 'A torre parou às 14:20, a mesma hora em que o Teo achou o Tick.' }
];

const FASE1 = { nome: 'FASE 1', sub: 'O MINUTO PERDIDO', YEAR, TOD0, LAYOUT, START, CLOCK, BUSH, AMADEU, GUARDS, PECAS, INTRO, FIRST, AGAIN, AFTER, goal: 'clock', next: 1,
  fim: ['FIM DA FASE 1', 'A torre parou às 14:20. Por quê?', 'ENTER: próxima fase'] };
let F = FASE1;
