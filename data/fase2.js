// Fase 2: A Fundação (1996 -> 1926).
// W = vala em 1926 (bloqueia) e ponte em 1996. G = portão de ferro em 1996 (bloqueia) e passagem aberta em 1926.
const FASE2 = {
  nome: 'FASE 2', sub: 'A FUNDAÇÃO',
  YEAR: { presente: 1996, passado: 1926 }, TOD0: 14 * 3600 + 19 * 60,
  LAYOUT: [
"####################",
"#........W.........#",
"#.aa.bb..W......CC.#",
"#.aa.bb..W......CC.#",
"#........W.........#",
"#........W.........#",
"#........WGGGGGGGGG#",
"#........W.........#",
"#........W.........#",
"#.cc.dd..W.........#",
"#.cc.dd..W..eee....#",
"#........W..eee....#",
"#........W.........#",
"#P.......W.........#",
"####################"
  ],
  START: { x: 24, y: 216 }, CLOCK: { x: 272, y: 48 }, BUSH: null, AMADEU: null,
  GUARDS: [
    { x: 40, y: 200, axis: 'x', s: 1.0, d: 1, min: 40, max: 120 },
    { x: 136, y: 24, axis: 'y', s: 0.9, d: 1, min: 24, max: 216 },
    { x: 168, y: 120, axis: 'x', s: 1.2, d: 1, min: 168, max: 296 }
  ],
  PECAS: [
    { id: 'barraca', nome: 'A barraca do mestre Hugo', tipo: 'lugar', ch: 'a', box: [2, 2, 2, 2] },
    { id: 'forja', nome: 'A forja', tipo: 'lugar', ch: 'b', box: [5, 2, 2, 2] },
    { id: 'armazem', nome: 'O armazém', tipo: 'lugar', ch: 'c', box: [2, 9, 2, 2] },
    { id: 'estabulo', nome: 'O estábulo', tipo: 'lugar', ch: 'd', box: [5, 9, 2, 2] },
    { id: 'carpintaria', nome: 'A carpintaria', tipo: 'lugar', ch: 'e', box: [12, 10, 3, 2] },
    { id: 'apito', nome: 'O apito da obra', tipo: 'acontecimento' }
  ],
  INTRO: [
    ['', '1996. A torre funciona, mas o pátio está fechado por portões de ferro. Algo foi enterrado sob o alicerce.'],
    ['', 'Em 1926 a vala ao lado do pátio ainda estava aberta. Hoje ela é uma ponte. Cada época fecha um caminho e abre outro.'],
    ['', 'E em 1926 o minuto 14:20 se repete sem parar. Chegue ao pátio durante ele.']
  ],
  FIRST: [], AGAIN: [], AFTER: [],
  goal: 'plaza', path: (tx, ty) => ty === 12 || (tx === 16 && ty > 5 && ty < 12) || (ty >= 4 && ty <= 5 && tx > 9), PLAZA: { x: 264, y: 84, r: 26 }, loop: [60, 120], next: null,
  clockMsg: 'A torre. Chegue ao pátio durante o minuto 14:20.',
  CEREMONIA: [
    ['', '1926, 14:20. A torre ainda não tem ponteiros. A cidade inteira espera a inauguração.'],
    ['', 'Um homem alto, de contorno trêmulo como um desenho, coloca uma pedra no alicerce. No bolso, um relógio igual ao seu.'],
    ['Vigia-Mor', 'Você não devia estar aqui. Esta pedra é a âncora: ela prende o tempo da cidade.'],
    ['Vigia-Mor', 'Cada peça que você apaga a afrouxa. Eu apaguei peças demais, e olhe no que me tornei.'],
    ['', 'A voz é mais velha, mas é a sua. O Tick não teve criador: foi passando de mão em mão, de um Teo para outro.']
  ],
  fim: ['FIM DA FASE 2', 'O Vigia-Mor tem a sua voz. E o seu relógio.', 'ENTER: voltar ao início']
};
CLUES.push(
  { id: 'minuto', t: 'O minuto que se repete', x: 'Em 1926 o 14:20 recomeça sozinho, como um disco riscado.' },
  { id: 'ancora', t: 'A âncora', x: 'A torre foi erguida sobre uma pedra que prende o tempo da cidade.' },
  { id: 'vigiamor', t: 'O Vigia-Mor', x: 'Um homem de contorno trêmulo carrega um Tick igual ao do Teo.' },
  { id: 'rastro', t: 'Quem fez o Tick?', x: 'Ninguém. Ele passa de mão em mão, de um Teo para outro.' }
);
