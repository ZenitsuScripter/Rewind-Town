// Personagens em pixel art (4 direções, 4 quadros de caminhada), partículas e luz de lanterna
const V = {
  teo: { hair: ['#1e1208', '#3a2210', '#5a3a1c'], skin: ['#a8684a', '#d98f6a', '#f0b890'], top: ['#7a4a10', '#c4801c', '#eaaa2c', '#ffd25c'], pants: ['#141c3c', '#243462', '#385296'], acc: ['#5a1414', '#a82a28', '#d84a3a'], ol: '#120a1c', watch: 1 },
  guard: { hair: ['#3a0e10', '#7a2020', '#b83c30'], skin: ['#8a5a48', '#c08868', '#dca888'], top: ['#1c2030', '#343c58', '#4e587e', '#7280a8'], pants: ['#12141e', '#222638', '#343a56'], acc: ['#2a2a3c', '#4a4a64', '#6a6a88'], ol: '#0c0a14', lantern: 1 },
  amadeu: { hair: ['#9a9aa8', '#cfcfd8', '#f2f2f6'], skin: ['#a8806a', '#d8aa88', '#f0c8a8'], top: ['#3a2210', '#6a4426', '#8e5e34', '#b07a46'], pants: ['#2a2a38', '#4a4a5a', '#64647a'], acc: ['#9a9aa8', '#cfcfd8', '#f2f2f6'], ol: '#1c1008', beard: 1 },
  ghost: { hair: ['#9a9ab0', '#b8b8cc', '#d8d8e8'], skin: ['#b8b8cc', '#d0d0e0', '#e8e8f4'], top: ['#8a8aa0', '#a8a8bc', '#c0c0d4', '#d8d8e8'], pants: ['#8a8aa0', '#a0a0b4', '#b8b8cc'], acc: ['#a8a8bc', '#c0c0d4', '#d8d8e8'], ol: '#6a6a88' }
};
// dir: 0 baixo, 1 cima, 2 esquerda, 3 direita. (x, y) = pés. Luz no alto à esquerda: realce à esquerda, sombra à direita.
function drawChar(c, x, y, v, dir, fr, mv) {
  const f = mv ? fr & 3 : 1, s = [-1, 0, 1, 0][f], by = mv ? f & 1 : (AF >> 5) & 1, side = dir > 1, m = dir === 2 ? -1 : 1, up = dir === 1;
  const B = (col, dx, dy, w, h) => px(c, col, m > 0 ? x + dx : x - dx - w + 1, y + dy, w, h);
  sh(c, x - 5, y - 1, 14, 3, 0.3);
  const la = Math.max(0, s), ra = Math.max(0, -s), lx = side ? -2 + s * 2 : -4, rx = side ? 0 - s * 2 : 1;
  B(v.ol, lx - 1, -8 + la, 5, 9 - la); B(v.ol, rx - 1, -8 + ra, 5, 9 - ra);
  B(v.pants[1], lx, -7 + la, 3, 6 - la); B(v.pants[1], rx, -7 + ra, 3, 6 - ra); B(v.pants[2], lx + 2, -7 + la, 1, 5 - la); B(v.pants[2], rx + 2, -7 + ra, 1, 5 - ra); B('#1a1018', lx, -2 + la, 3, 2); B('#1a1018', rx, -2 + ra, 3, 2);
  const tw2 = side ? 8 : 10, tx0 = side ? -4 : -5, ty0 = -15 + by;
  B(v.ol, tx0 - 1, ty0 - 1, tw2 + 2, 10); B(v.top[2], tx0, ty0, tw2, 8); B(v.top[3], tx0, ty0, 1, 7); B(v.top[3], tx0 + 1, ty0, tw2 - 2, 1); B(v.top[1], tx0 + tw2 - 2, ty0, 2, 8); B(v.top[0], tx0, ty0 + 7, tw2, 1);
  if (!side) { B(v.ol, -7, ty0, 3, 8); B(v.ol, 4, ty0, 3, 8); B(v.top[2], -6, ty0 + 1 + (s > 0 ? 1 : 0), 2, 6); B(v.top[1], 4, ty0 + 1 + (s < 0 ? 1 : 0), 2, 6); B(v.skin[1], -6, ty0 + 6 + (s > 0 ? 1 : 0), 2, 2); B(v.skin[0], 4, ty0 + 6 + (s < 0 ? 1 : 0), 2, 2); }
  else { B(v.ol, -2 + s, ty0 + 1, 5, 8); B(v.top[1], -1 + s, ty0 + 2, 3, 5); B(v.top[2], -1 + s, ty0 + 2, 1, 5); B(v.skin[1], -1 + s, ty0 + 7, 3, 2); }
  if (v.watch && !up && !side) B('#ffe27a', 1, ty0 + 3, 2, 2);
  if (v.lantern && !up) { B(v.ol, side ? 3 : 6, ty0 + 6, 5, 6); B('#ffcf5a', side ? 4 : 7, ty0 + 7, 3, 4); B('#fff4b0', side ? 4 : 7, ty0 + 7, 1, 2); }
  const hy = ty0 - 10, hw = side ? 8 : 10, hx = side ? -4 : -5;
  B(v.acc[1], hx, ty0 - 2, hw, 3); B(v.acc[2], hx, ty0 - 2, hw, 1); B(v.acc[0], hx + hw - 2, ty0 - 1, 2, 2);
  if (v.acc[0] === '#5a1414') { if (up) B(v.acc[1], hx + 6, ty0, 3, 5); else if (!side) B(v.acc[1], 2, ty0 + 1, 3, 5); else B(v.acc[1], -6, ty0, 2, 4); }
  B(v.ol, hx - 1, hy - 1, hw + 2, 11); B(v.skin[1], hx, hy, hw, 9); B(v.skin[2], hx, hy + 2, 2, 5); B(v.skin[0], hx + hw - 2, hy + 3, 2, 6);
  if (up) { B(v.hair[1], hx, hy - 1, hw, 10); B(v.hair[2], hx + 1, hy, 3, 3); B(v.hair[0], hx + hw - 3, hy + 3, 3, 6); }
  else if (!side) { B(v.hair[1], hx, hy - 1, hw, 4); B(v.hair[2], hx + 1, hy - 1, 4, 2); B(v.hair[1], hx, hy + 3, 1, 3); B(v.hair[1], hx + hw - 1, hy + 3, 1, 3); B(v.hair[0], hx + 2, hy + 3, hw - 4, 1); B('#140a14', hx + 2, hy + 5, 2, 2); B('#140a14', hx + hw - 4, hy + 5, 2, 2); if (v.beard) { B(v.hair[2], hx + 1, hy + 7, hw - 2, 3); B(v.hair[1], hx + 1, hy + 9, hw - 2, 1); } }
  else { B(v.hair[1], hx, hy - 1, hw, 4); B(v.hair[2], hx + 1, hy - 1, 4, 2); B(v.hair[1], hx, hy + 3, 4, 6); B(v.hair[0], hx, hy + 7, 4, 2); B('#140a14', hx + 6, hy + 5, 1, 2); B(v.skin[2], hx + hw, hy + 5, 1, 2); if (v.beard) { B(v.hair[2], hx + 4, hy + 7, 4, 3); } }
  if (v === V.guard) { B(v.acc[2], hx, hy + 2, hw, 1); }
}
function lightPool(c, cx, cy, r) {
  const fl = (AF >> 3) & 1; c.globalCompositeOperation = 'lighter';
  ditherDisc(c, '#ff9a3c', 1, cx, cy, r + fl, 0.2); ditherDisc(c, '#ff9a3c', 2, cx, cy, r * 0.68, 0.18); ditherDisc(c, '#ffc060', 3, cx, cy, r * 0.36, 0.16);
  c.globalCompositeOperation = 'source-over';
}
function drawActors(c) {
  const list = [];
  if (S.era === 'passado' && AMADEU) list.push([AMADEU.y, () => { const gone = ERASED.has('amadeu'); c.globalAlpha = gone ? 0.55 : 1; drawChar(c, AMADEU.x * Z, AMADEU.y * Z + 8, gone ? V.ghost : V.amadeu, 0, 1, 0); c.globalAlpha = 1; }]);
  S.guards.forEach(g => list.push([g.y, () => {
    const gx = Math.round(g.x * Z), gy = Math.round(g.y * Z) + 8, dir = g.axis === 'x' ? (g.d > 0 ? 3 : 2) : (g.d > 0 ? 0 : 1);
    lightPool(c, gx + (dir === 3 ? 10 : dir === 2 ? -10 : 6), gy - 8, 30);
    drawChar(c, gx, gy, V.guard, dir, Math.floor((g.axis === 'x' ? g.x : g.y) / 5), 1);
  }]));
  list.push([S.py, () => drawChar(c, Math.round(S.px * Z), Math.round(S.py * Z) + 8, V.teo, S.dir, S.walk >> 3, S.mv && !S.rewinding)]);
  list.sort((a, b) => a[0] - b[0]).forEach(j => j[1]());
}
const PT = Array.from({ length: 36 }, (_, i) => ({ x: hash(i, 1) % WP, y: hash(i, 2) % HP, s: 0.5 + (hash(i, 3) % 10) / 10, p: (hash(i, 4) % 628) / 100 }));
function drawParticles(c, era, t) {
  const L = look(era), u = t * 10;
  for (const q of PT) {
    if (L === 'ruin') px(c, q.p > 3 ? '#b8c0c8' : '#8a96a0', (q.x + u * 0.25 * q.s) % WP, (q.y + u * 0.5 * q.s) % HP, q.s > 1 ? 2 : 1, q.s > 1 ? 2 : 1);
    else if (Math.sin(u * 0.1 + q.p) > -0.3) px(c, L === 'warm' ? '#ffe68a' : '#e8d49a', q.x + Math.sin(u * 0.05 * q.s + q.p) * 9, q.y + Math.cos(u * 0.04 * q.s + q.p) * 6, 2, 2);
  }
}
