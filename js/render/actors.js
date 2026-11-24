const V_P = { hair: '#3a2a1a', skin: '#f0c090', shirt: '#e8b030', pants: '#2a3a6a', scarf: '#d8453a', w: 1 };
const V_G = { hair: '#a8302a', skin: '#d8a880', shirt: '#4a4a68', pants: '#2a2a3c', scarf: '#2a2a3c' };
const V_S = { hair: '#e6e6e6', skin: '#e6e6e6', shirt: '#cfcfcf', pants: '#bdbdbd', scarf: '#e6e6e6' };
const V_A = { hair: '#ececec', skin: '#e0b890', shirt: '#8a5a32', pants: '#4a4a5a', scarf: '#ececec' };
function drawChar(c, x, y, v, st, mv) {
  x = Math.round(x * 2) / 2; y = Math.round(y * 2) / 2;
  const sw = mv ? Math.sin(st * 0.35) * 1.2 : 0;
  c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.ellipse(x, y + 4.6, 4.2, 1.6, 0, 0, 6.2832); c.fill();
  c.fillStyle = v.pants; c.fillRect(x - 2.4 + sw, y + 1.6, 1.8, 3); c.fillRect(x + 0.6 - sw, y + 1.6, 1.8, 3);
  c.fillStyle = '#16161e'; c.fillRect(x - 2.4 + sw, y + 4, 1.8, 0.8); c.fillRect(x + 0.6 - sw, y + 4, 1.8, 0.8);
  c.fillStyle = v.shirt; c.fillRect(x - 3, y - 2, 6, 4);
  c.fillStyle = v.scarf; c.fillRect(x - 2.6, y - 2.6, 5.2, 1.2);
  c.fillStyle = v.skin; c.beginPath(); c.arc(x, y - 4.8, 2.7, 0, 6.2832); c.fill();
  c.fillStyle = v.hair; c.beginPath(); c.arc(x, y - 5.2, 2.8, 3.1416, 6.2832); c.fill(); c.fillRect(x - 2.8, y - 5.4, 5.6, 0.8);
  c.fillStyle = '#111'; c.fillRect(x - 1.4, y - 4.5, 0.7, 0.8); c.fillRect(x + 0.7, y - 4.5, 0.7, 0.8);
  if (v.w) { c.fillStyle = '#ffe066'; c.fillRect(x + 1.2, y - 0.6, 1, 1); }
}
function drawActors(c) {
  if (S.era === 'passado') { const gone = ERASED.has('amadeu'); c.globalAlpha = gone ? 0.5 : 1; drawChar(c, AMADEU.x, AMADEU.y, gone ? V_S : V_A, 0, 0); c.globalAlpha = 1; }
  for (const g of S.guards) {
    const q = c.createRadialGradient(g.x, g.y, 1, g.x, g.y, 16); q.addColorStop(0, 'rgba(255,225,130,0.35)'); q.addColorStop(1, 'rgba(255,225,130,0)');
    c.fillStyle = q; c.fillRect(g.x - 16, g.y - 16, 32, 32);
    drawChar(c, g.x, g.y, V_G, S.frame, 1);
  }
  drawChar(c, S.px, S.py, V_P, S.walk, S.mv && !S.rewinding);
}

const PT = Array.from({ length: 40 }, (_, i) => ({ x: hash(i, 1) % W, y: hash(i, 2) % H, s: 0.4 + (hash(i, 3) % 10) / 10, p: (hash(i, 4) % 628) / 100 }));
function drawParticles(c, past) {
  const u = S.t * 10;
  for (const q of PT) {
    c.fillStyle = past ? 'rgba(255,240,150,' + (0.5 + 0.4 * Math.sin(u * 0.1 + q.p)).toFixed(2) + ')' : 'rgba(190,200,220,0.45)';
    c.fillRect(past ? q.x + Math.sin(u * 0.05 * q.s + q.p) * 7 : (q.x + u * 0.12 * q.s) % W, past ? q.y + Math.cos(u * 0.04 * q.s + q.p) * 5 : (q.y + u * 0.3 * q.s) % H, 0.8, 0.8);
  }
}

