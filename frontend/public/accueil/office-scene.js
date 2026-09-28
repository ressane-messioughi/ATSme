// Scène de bureau ATSme (style Ghibli) — module partagé page HTML + React Three Fiber.
// createOffice(THREE) → { group, update({ p, vel, t, dt, camPos }), camera(p), pickables, anchors, react(action) }
// p : progression 0→1 à travers les chapitres ; vel : vitesse de scroll normalisée 0→1.

import { catLogo } from './theme3d.js';

export const CHAPTERS = [
  { id: 'intro', p: 0, label: 'Bienvenue' },
  { id: 'ecrire', p: 0.27, label: 'Écrire' },
  { id: 'analyser', p: 0.5, label: 'Analyser' },
  { id: 'comparer', p: 0.7, label: 'Comparer' },
  { id: 'postuler', p: 0.86, label: 'Postuler' },
  { id: 'ouvrir', p: 1, label: 'Ouvrir' }
];

export function toonGradient(THREE) {
  const g = new THREE.DataTexture(new Uint8Array([150, 150, 150, 255, 222, 222, 222, 255, 255, 255, 255, 255]), 3, 1);
  g.minFilter = g.magFilter = THREE.NearestFilter; g.needsUpdate = true; return g;
}
function canvasTex(THREE, w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function skyTexture(THREE) {
  return canvasTex(THREE, 512, 512, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5f9fd6'); gr.addColorStop(0.7, '#a9d3ec'); gr.addColorStop(1, '#e8f0dc');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
    const cloud = (cx, cy, s) => { x.fillStyle = 'rgba(255,255,255,.95)'; [[0, 0, 1], [-.9, .25, .7], [.9, .3, .75], [-.4, -.35, .7], [.45, -.3, .65]].forEach(([dx, dy, r]) => { x.beginPath(); x.arc(cx + dx * s, cy + dy * s, r * s, 0, 7); x.fill(); }); };
    cloud(w * .3, h * .38, w * .09); cloud(w * .78, h * .22, w * .06); cloud(w * .7, h * .62, w * .05);
    x.fillStyle = '#7fae6a'; x.beginPath(); x.moveTo(0, h); x.quadraticCurveTo(w * .3, h * .78, w * .6, h * .9); x.quadraticCurveTo(w * .85, h * .8, w, h * .86); x.lineTo(w, h); x.fill();
    x.fillStyle = '#5f9253'; x.beginPath(); x.moveTo(0, h); x.quadraticCurveTo(w * .5, h * .9, w, h * .96); x.lineTo(w, h); x.fill();
  });
}
export function addOutlines(THREE, root, color = '#3a2a22', k = 1.045) {
  const om = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide, name: 'outline' });
  const list = [];
  root.traverse(o => { if (o.isMesh && !o.userData.noOutline && !/Plane|Circle|Ring|Shape/.test(o.geometry.type) && !o.material.transparent && !o.material.isMeshBasicMaterial) list.push(o); });
  list.forEach(o => { const l = new THREE.Mesh(o.geometry, om); l.name = o.name + 'Outline'; l.scale.setScalar(k); l.userData.noOutline = true; l.raycast = () => {}; o.add(l); });
}

const C = {
  skin: '#b77a4f', hair: '#1c1410', shirt: '#2d3850', suitDark: '#1f2739', tie: '#9a3440', shirtWhite: '#f7f5f0', sclera: '#ffffff', iris: '#2a1a12', pupil: '#110905', blush: '#e8836f', shine: '#ffffff', mouth: '#a0483a', catStripe: '#c46e28', catPink: '#f4a6a6', collar: '#4f7f52', bell: '#e8c14a', cushion: '#b9574a', cookie: '#c98a4a', pants: '#2d3850', wood: '#c9945f', dark: '#5a4538', floor: '#a9784c', wall: '#f0e3c4',
  cat: '#e8913f', catLight: '#fff1dc', mug: '#c9573f', coffee: '#6b4228', chair: '#9a6a44', eye: '#2a1d16', leaf: '#6fa75a', pot: '#c77b52',
  shade: '#fff4dc', monitor: '#e7dcc3', keys: '#d8cbb0', cork: '#c89a62', rug: '#b9574a', rugLight: '#e9c9a0', paper: '#fbf5e6',
  note1: '#f4d77a', note2: '#a8d0a0', note3: '#f2a7a0', curtain: '#f7efe0', pin: '#c9493a', notebook: '#4f7f52'
};
const UI = { bg: '#fbf6ea', bar: '#efe4cb', side: '#f4ecd9', ink: '#3b2f25', dim: '#65543f', track: '#e4d7bb', accent: '#4f7f52', accentSoft: '#dfe9d6', accentInk: '#2f5a33', warn: '#b7771f', warnSoft: '#f6e3c6', warnInk: '#7a4e0e' };

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const win = (p, a, b, f = 0.02) => smooth(a - f, a + f, p) * (1 - smooth(b - f, b + f, p));

export function createOffice(THREE) {
  const S0 = {};
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const root = new THREE.Group(); root.name = 'office';
  const grad = toonGradient(THREE);
  const M = (name, color, extra = {}) => Object.assign(new THREE.MeshToonMaterial({ color, gradientMap: grad, ...extra }), { name });
  const mat = {}; for (const k in C) mat[k] = M(k, C[k]);
  mat.shade.side = THREE.DoubleSide;
  mat.window = new THREE.MeshBasicMaterial({ map: skyTexture(THREE), name: 'window' });
  const roundCache = new Map();
  function roundedBox(g) {
    const p = g.parameters, mn = Math.min(p.width, p.height, p.depth); if (mn < 0.04) return g;
    const r = Math.min(mn * 0.3, 0.022), key = p.width + '|' + p.height + '|' + p.depth; if (roundCache.has(key)) return roundCache.get(key);
    const N = 3, b = new THREE.BoxGeometry(p.width, p.height, p.depth, N, N, N), pos = b.attributes.position, nor = b.attributes.normal, h = [p.width / 2, p.height / 2, p.depth / 2];
    const c = [0, 0, 0], ic = [0, 0, 0];
    for (let i = 0; i < pos.count; i++) {
      const raw = [pos.getX(i), pos.getY(i), pos.getZ(i)];
      for (let k = 0; k < 3; k++) { const a = h[k], u = Math.abs(raw[k]) / a, s = Math.sign(raw[k]); c[k] = s * (u <= 1 / 3 + 1e-6 ? u * 3 * (a - r) : (a - r) + (u - 1 / 3) * 1.5 * r); ic[k] = Math.max(-(a - r), Math.min(a - r, c[k])); }
      const nx = c[0] - ic[0], ny = c[1] - ic[1], nz = c[2] - ic[2], L = Math.hypot(nx, ny, nz);
      if (L > 1e-7) { pos.setXYZ(i, ic[0] + nx / L * r, ic[1] + ny / L * r, ic[2] + nz / L * r); nor.setXYZ(i, nx / L, ny / L, nz / L); } else pos.setXYZ(i, c[0], c[1], c[2]);
    }
    b.computeBoundingSphere(); b.computeBoundingBox(); roundCache.set(key, b); return b;
  }
  const mesh = (name, geo, m, parent = root) => { if (geo && geo.type === 'BoxGeometry') geo = roundedBox(geo); const o = new THREE.Mesh(geo, m); o.name = name; o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
  const group = (name, x, y, z, parent = root) => { const g = new THREE.Group(); g.name = name; g.position.set(x, y, z); parent.add(g); return g; };

  // lumières (matin → fin d'après-midi selon p)
  const hemi = new THREE.HemisphereLight(0xcfe6ff, 0xb9a57a, 1.6); root.add(hemi);
  const key = new THREE.DirectionalLight(0xfff0d0, 2.6); key.position.set(-2.2, 3.2, 0.6); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.normalBias = 0.012; Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2.5, bottom: -1 }); key.shadow.bias = -0.0005; root.add(key);
  const rim = new THREE.PointLight('#ffd9a0', 0.8, 4); rim.position.set(-1.2, 1.6, -0.5); root.add(rim);
  const screenGlow = new THREE.PointLight('#fff3d6', 0.4, 1.6); screenGlow.position.set(0, 1.05, 0); root.add(screenGlow);
  const windowLight = new THREE.PointLight('#fff0c8', 0.6, 3); windowLight.position.set(-1.05, 1.7, -0.4); root.add(windowLight);
  const UI0 = { ...UI }, BULB = new THREE.Color('#ffe2a8'), MORNING = new THREE.Color('#fff0d0'), GOLDEN = new THREE.Color('#ffbe78'), WHITE = new THREE.Color('#ffffff'), WARM = new THREE.Color('#ffd2a0');

  // pièce
  const plaster = canvasTex(THREE, 512, 512, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f6ead0'); g.addColorStop(1, '#e9d6b2'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${150 + Math.random() * 60},${120 + Math.random() * 50},${80 + Math.random() * 40},${Math.random() * 0.05})`; const r = 4 + Math.random() * 22; x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, r * 1.8, r, Math.random() * 3, 0, 7); x.fill(); }
  });
  plaster.wrapS = plaster.wrapT = THREE.RepeatWrapping; plaster.repeat.set(4, 1.6);
  const planks = canvasTex(THREE, 512, 512, (x, w, h) => {
    x.fillStyle = '#b07e50'; x.fillRect(0, 0, w, h);
    for (let r = 0; r < 8; r++) { const y = r * 64; for (let c = -1; c < 3; c++) { const x0 = c * 256 + (r % 2) * 128; x.fillStyle = `hsl(${28 + Math.random() * 6},${38 + Math.random() * 10}%,${46 + Math.random() * 8}%)`; x.fillRect(x0 + 2, y + 2, 252, 60); x.strokeStyle = 'rgba(90,60,35,.18)'; x.lineWidth = 2; for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(x0 + 10, y + 14 + k * 16 + Math.random() * 4); x.bezierCurveTo(x0 + 80, y + 8 + k * 16, x0 + 160, y + 22 + k * 16, x0 + 246, y + 14 + k * 16); x.stroke(); } } x.fillStyle = 'rgba(70,45,25,.5)'; x.fillRect(0, y, w, 2); }
  });
  planks.wrapS = planks.wrapT = THREE.RepeatWrapping; planks.repeat.set(5, 5);
  mat.floor = Object.assign(new THREE.MeshToonMaterial({ map: planks, gradientMap: grad }), { name: 'floor' });
  mat.wall = Object.assign(new THREE.MeshToonMaterial({ map: plaster, gradientMap: grad }), { name: 'wall' });
  planks.repeat.set(10, 10);
  const floor = mesh('floor', new THREE.PlaneGeometry(12, 12), mat.floor); floor.rotation.x = -Math.PI / 2; floor.position.z = 2;
  mesh('wall', new THREE.PlaneGeometry(12, 3.2), mat.wall).position.set(0, 1.6, -0.8);
  const sideWall = mesh('sideWall', new THREE.PlaneGeometry(8, 3.2), mat.wall); sideWall.rotation.y = Math.PI / 2; sideWall.position.set(-2.1, 1.6, 3.2);
  const sideBase = mesh('sideBaseboard', new THREE.BoxGeometry(0.02, 0.08, 8), mat.wood); sideBase.position.set(-2.09, 0.04, 3.2);
  const cornerPost = mesh('cornerBeam', new THREE.BoxGeometry(0.08, 3.2, 0.08), mat.wood); cornerPost.position.set(-2.06, 1.6, -0.76);
  const ceilBeam = mesh('ceilingBeam', new THREE.BoxGeometry(12, 0.1, 0.1), mat.wood); ceilBeam.position.set(0, 2.55, -0.74);
  mesh('baseboard', new THREE.BoxGeometry(12, 0.08, 0.02), mat.wood).position.set(0, 0.04, -0.79);
  const rug = mesh('rug', new THREE.CircleGeometry(0.7, 48), mat.rug); rug.rotation.x = -Math.PI / 2; rug.scale.set(1.35, 1, 1); rug.position.set(0, 0.003, 0.45);
  const rugRing = mesh('rugRing', new THREE.RingGeometry(0.56, 0.61, 48), mat.rugLight); rugRing.rotation.x = -Math.PI / 2; rugRing.scale.set(1.35, 1, 1); rugRing.position.set(0, 0.005, 0.45);

  // fenêtre + rideaux + rayon de soleil
  const win3 = group('window', -1.05, 1.7, -0.79);
  mesh('windowGlass', new THREE.PlaneGeometry(0.9, 1.05), mat.window, win3).castShadow = false;
  for (const [w, h, x, y] of [[0.96, 0.04, 0, 0.545], [0.96, 0.04, 0, -0.545], [0.04, 1.13, 0.465, 0], [0.04, 1.13, -0.465, 0], [0.9, 0.025, 0, 0], [0.025, 1.05, 0, 0]])
    mesh('windowFrame', new THREE.BoxGeometry(w, h, 0.03), mat.wood, win3).position.set(x, y, 0.01);
  mesh('sill', new THREE.BoxGeometry(1.05, 0.03, 0.1), mat.wood, win3).position.set(0, -0.58, 0.05);
  const curtains = [-1, 1].map(s => { const c = mesh('curtain', new THREE.BoxGeometry(0.2, 1.2, 0.02), mat.curtain, win3); c.position.set(s * 0.58, 0.02, 0.05); return c; });
  mesh('curtainRod', new THREE.CylinderGeometry(0.01, 0.01, 1.5, 12), mat.dark, win3).rotation.z = Math.PI / 2;
  win3.children.at(-1).position.set(0, 0.64, 0.06);
  const beamTex = canvasTex(THREE, 64, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'destination-in'; const sg = x.createLinearGradient(0, 0, w, 0); sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(0.5, 'rgba(0,0,0,1)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = sg; x.fillRect(0, 0, w, h); });
  const beamMat = new THREE.MeshBasicMaterial({ color: '#fff1c8', map: beamTex, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, name: 'sunbeam' });
  const beam = group('sunbeam', 0, 0, 0);
  { const top = V(-1.05, 1.7, -0.78), bot = V(-0.5, 0, 0.5), dir = top.clone().sub(bot).normalize(), len = top.distanceTo(bot);
    beam.position.copy(top).add(bot).multiplyScalar(0.5); beam.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
    [0, 1, 2].forEach(i => { const pl = mesh('sunbeamPlane', new THREE.PlaneGeometry(0.75 + i * 0.12, len), beamMat, beam); pl.rotation.set(Math.PI, i * Math.PI / 3, 0); pl.castShadow = pl.receiveShadow = false; }); }
  const cloudTex = canvasTex(THREE, 1024, 512, (x, w, h) => {
    const puff = (cx, cy, sz) => { [[0, 0, 1], [-0.9, 0.3, 0.72], [0.95, 0.28, 0.78], [-0.45, -0.45, 0.72], [0.5, -0.4, 0.66], [0, -0.75, 0.55]].forEach(([dx, dy, r]) => { const g = x.createRadialGradient(cx + dx * sz, cy + dy * sz - r * sz * 0.3, 0, cx + dx * sz, cy + dy * sz, r * sz); g.addColorStop(0, '#ffffff'); g.addColorStop(0.75, '#fbfbff'); g.addColorStop(1, 'rgba(236,240,250,0)'); x.fillStyle = g; x.beginPath(); x.arc(cx + dx * sz, cy + dy * sz, r * sz, 0, 7); x.fill(); }); x.fillStyle = 'rgba(190,205,228,.45)'; x.beginPath(); x.ellipse(cx, cy + 0.62 * sz, 1.6 * sz, 0.22 * sz, 0, 0, 7); x.fill(); };
    puff(180, 210, 95); puff(560, 150, 70); puff(820, 260, 110); puff(380, 330, 50);
  });
  cloudTex.wrapS = THREE.RepeatWrapping;
  const clouds = mesh('clouds', new THREE.PlaneGeometry(0.9, 0.62), new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, depthWrite: false, name: 'clouds' }), win3); clouds.position.set(0, 0.2, 0.002); clouds.castShadow = false;
  const potPlant = (parent, x, y, z, sc, leafCol) => { const g = group('sillPlant', x, y, z, parent); mesh('sillPot', new THREE.CylinderGeometry(0.045 * sc, 0.035 * sc, 0.07 * sc, 20), mat.pot, g).position.y = 0.035 * sc; for (let i = 0; i < 6; i++) { const a = i * 2.4; const l = mesh('sillLeaf', new THREE.SphereGeometry(0.035 * sc, 12, 10), leafCol, g); l.scale.set(0.5, 1.2, 0.25); l.position.set(Math.cos(a) * 0.02 * sc, (0.09 + (i % 3) * 0.025) * sc, Math.sin(a) * 0.02 * sc); l.rotation.set(Math.sin(a) * 0.6, -a, Math.cos(a) * 0.6); } return g; };
  const leaf2 = M('leaf2', '#8cbf6a');
  potPlant(win3, -0.32, -0.565, 0.06, 1, mat.leaf); potPlant(win3, 0.3, -0.565, 0.06, 0.8, leaf2);
  const hang = group('hangingPlant', -1.62, 2.25, -0.45);
  mesh('hangRope', new THREE.CylinderGeometry(0.004, 0.004, 0.5, 6), mat.dark, hang).position.y = 0.25;
  mesh('hangPot', new THREE.SphereGeometry(0.09, 20, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat.pot, hang);
  const vines = [];
  for (let v = 0; v < 5; v++) { const a = v / 5 * Math.PI * 2, vg = group('vine', Math.cos(a) * 0.07, 0, Math.sin(a) * 0.07, hang); vines.push(vg); for (let i = 0; i < 6; i++) { const l = mesh('vineLeaf', new THREE.SphereGeometry(0.03, 10, 8), i % 2 ? leaf2 : mat.leaf, vg); l.scale.set(1, 0.6, 0.3); l.position.set(Math.cos(a) * i * 0.012, -i * 0.07 - 0.02, Math.sin(a) * i * 0.012); l.rotation.y = a + i; } }

  // horloge (tourne avec le scroll)
  const clock = group('clock', -0.2, 1.88, -0.785);
  const face = mesh('clockFace', new THREE.CylinderGeometry(0.11, 0.11, 0.02, 40), mat.paper, clock); face.rotation.x = Math.PI / 2;
  mesh('clockRim', new THREE.TorusGeometry(0.11, 0.012, 10, 40), mat.wood, clock);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, d = mesh('clockTick', new THREE.BoxGeometry(i % 3 ? 0.006 : 0.012, i % 3 ? 0.014 : 0.022, 0.004), mat.dark, clock); d.position.set(Math.sin(a) * 0.088, Math.cos(a) * 0.088, 0.012); d.rotation.z = -a; }
  const hand = (len, w, z) => { const g = group('clockHand', 0, 0, z, clock); mesh('clockHandBar', new THREE.BoxGeometry(w, len, 0.004), mat.dark, g).position.y = len / 2 - 0.01; return g; };
  const hourHand = hand(0.06, 0.012, 0.016), minHand = hand(0.085, 0.008, 0.02);

  // tableau en liège + offre d'emploi
  const board = group('corkboard', 0.72, 1.45, -0.78);
  mesh('boardFrame', new THREE.BoxGeometry(0.64, 0.46, 0.025), mat.wood, board);
  mesh('cork', new THREE.BoxGeometry(0.6, 0.42, 0.026), mat.cork, board).position.z = 0.002;
  const offerTex = canvasTex(THREE, 256, 340, (x, w, h) => {
    x.fillStyle = C.paper; x.fillRect(0, 0, w, h);
    x.fillStyle = UI.accent; x.font = '700 18px Helvetica'; x.fillText('OFFRE', 20, 38);
    x.fillStyle = UI.ink; x.font = '700 24px Helvetica'; x.fillText('Dév. Front-end', 20, 74);
    x.fillStyle = UI.dim; x.font = '400 16px Helvetica'; x.fillText('Atelier Kumo · Lyon', 20, 100);
    x.fillStyle = '#d9ccb0'; for (let i = 0; i < 7; i++) x.fillRect(20, 130 + i * 24, i % 3 === 2 ? 140 : 210, 8);
    x.strokeStyle = UI.accent; x.lineWidth = 3; x.strokeRect(20, 300, 90, 24);
  });
  const offer = mesh('offerPaper', new THREE.PlaneGeometry(0.2, 0.265), new THREE.MeshToonMaterial({ map: offerTex, gradientMap: grad, name: 'offerPaper' }), board);
  offer.position.set(-0.13, 0, 0.017); offer.rotation.z = 0.03;
  mesh('pin', new THREE.SphereGeometry(0.012, 12, 12), mat.pin, board).position.set(-0.13, 0.12, 0.025);
  [[0.1, 0.11, mat.note1, -0.08], [0.2, -0.03, mat.note2, 0.06], [0.07, -0.12, mat.note3, 0.1]].forEach(([x, y, m, r]) => {
    const n = mesh('stickyNote', new THREE.BoxGeometry(0.09, 0.09, 0.003), m, board); n.position.set(x, y, 0.017); n.rotation.z = r;
    mesh('pin', new THREE.SphereGeometry(0.009, 10, 10), mat.pin, board).position.set(x, y + 0.035, 0.022);
  });

  // étagère + livres
  const shelf = group('shelf', 1.6, 1.55, -0.68);
  mesh('shelfBoard', new THREE.BoxGeometry(0.8, 0.025, 0.2), mat.wood, shelf);
  let bx = -0.34;
  ['#6b4fa8', '#d9c9a3', '#2f5d62', '#b5523b', '#e2b04a', '#3a3a52'].forEach((c, i) => { const h = 0.16 + (i * 37 % 7) * 0.012, w = 0.035 + (i % 3) * 0.01; const b = mesh('book', new THREE.BoxGeometry(w, h, 0.15), M('book' + i, c), shelf); b.position.set(bx + w / 2, h / 2 + 0.0125, 0); if (i === 5) b.rotation.z = 0.25; bx += w + 0.006; });

  // plante
  const plant = group('plant', -1.55, 0, -0.5);
  mesh('pot', new THREE.CylinderGeometry(0.13, 0.1, 0.26, 32), mat.pot, plant).position.y = 0.13;
  const leaves = [];
  for (let i = 0; i < 9; i++) { const a = i * 2.4, r = 0.05 + (i % 3) * 0.04; const l = mesh('leaf', new THREE.SphereGeometry(0.09, 16, 12), mat.leaf, plant); l.scale.set(0.45, 1.3, 0.2); l.position.set(Math.cos(a) * r, 0.38 + (i % 4) * 0.08, Math.sin(a) * r); l.rotation.set(Math.sin(a) * 0.5, -a, Math.cos(a) * 0.5); l.userData.rz = Math.cos(a) * 0.5; leaves.push(l); }

  // bureau
  mesh('deskTop', new THREE.BoxGeometry(1.9, 0.04, 0.8), mat.wood).position.set(0, 0.73, -0.05);
  const drawers = group('deskDrawers', -0.66, 0, -0.1);
  mesh('drawerBox', new THREE.BoxGeometry(0.42, 0.62, 0.6), mat.wood, drawers).position.y = 0.4;
  [0.58, 0.39, 0.2].forEach(y => { mesh('drawerFront', new THREE.BoxGeometry(0.38, 0.16, 0.012), mat.wood, drawers).position.set(0, y, 0.303); mesh('drawerHandle', new THREE.BoxGeometry(0.1, 0.014, 0.018), mat.dark, drawers).position.set(0, y + 0.03, 0.315); });
  for (const [x, z] of [[0.9, -0.4], [0.9, 0.3]]) mesh('deskLeg', new THREE.BoxGeometry(0.04, 0.71, 0.04), mat.dark).position.set(x, 0.355, z);
  const notebook = mesh('notebook', new THREE.BoxGeometry(0.15, 0.014, 0.2), mat.notebook); notebook.position.set(0.3, 0.757, 0.18); notebook.rotation.y = -0.25;
  const pen = mesh('pen', new THREE.CylinderGeometry(0.005, 0.005, 0.14, 8), mat.dark); pen.position.set(0.3, 0.768, 0.18); pen.rotation.set(Math.PI / 2, 0, 0.6);

  // lampe
  const lamp = group('lamp', -0.66, 0.75, -0.3); lamp.rotation.y = 0.9;
  mesh('lampBase', new THREE.CylinderGeometry(0.06, 0.07, 0.02, 32), mat.dark, lamp).position.y = 0.01;
  const arm1 = mesh('lampArm', new THREE.CylinderGeometry(0.008, 0.008, 0.3, 12), mat.dark, lamp); arm1.position.set(0.04, 0.15, 0); arm1.rotation.z = -0.3;
  const arm2 = mesh('lampArm', new THREE.CylinderGeometry(0.008, 0.008, 0.24, 12), mat.dark, lamp); arm2.position.set(0.16, 0.32, 0.02); arm2.rotation.z = -1.2;
  const shade = mesh('lampShade', new THREE.ConeGeometry(0.07, 0.1, 32, 1, true), mat.shade, lamp); shade.position.set(0.26, 0.33, 0.04); shade.rotation.z = 0.5;
  const bulbMat = new THREE.MeshBasicMaterial({ color: '#ffe2a8', name: 'bulb' });
  const bulb = mesh('lampBulb', new THREE.SphereGeometry(0.02, 12, 12), bulbMat, lamp); bulb.position.set(0.25, 0.3, 0.04); bulb.castShadow = false;
  const lampLight = new THREE.PointLight('#ffc978', 1, 1.6); lampLight.position.set(-0.52, 1.0, -0.5); root.add(lampLight);

  // écran
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 620;
  const ctx = cv.getContext('2d'); const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const monitor = group('monitorGroup', 0, 0, 0);
  mesh('monitorStand', new THREE.CylinderGeometry(0.02, 0.02, 0.22, 16), mat.dark, monitor).position.set(0, 0.86, -0.335);
  mesh('monitorBase', new THREE.CylinderGeometry(0.1, 0.11, 0.015, 32), mat.dark, monitor).position.set(0, 0.757, -0.335);
  mesh('monitor', new THREE.BoxGeometry(0.66, 0.4, 0.025), mat.monitor, monitor).position.set(0, 1.08, -0.3);
  const screen = mesh('screen', new THREE.PlaneGeometry(0.63, 0.38), new THREE.MeshBasicMaterial({ map: tex, name: 'screen', toneMapped: false }), monitor);
  screen.position.set(0, 1.08, -0.2865); screen.castShadow = false;
  mesh('keyboard', new THREE.BoxGeometry(0.42, 0.018, 0.14), mat.dark).position.set(0, 0.759, 0.12);
  mesh('keys', new THREE.BoxGeometry(0.39, 0.006, 0.11), mat.keys).position.set(0, 0.771, 0.12);

  // tasse
  const mugHome = V(-0.34, 0.75, 0.2);
  const mug = group('mugGroup', mugHome.x, mugHome.y, mugHome.z);
  mesh('mug', new THREE.CylinderGeometry(0.042, 0.038, 0.1, 32, 1, true), mat.mug, mug).position.y = 0.05;
  mesh('mugBottom', new THREE.CircleGeometry(0.038, 32), mat.mug, mug).rotation.x = -Math.PI / 2;
  const cof = mesh('coffee', new THREE.CircleGeometry(0.04, 32), mat.coffee, mug); cof.rotation.x = -Math.PI / 2; cof.position.y = 0.085;
  mesh('mugRim', new THREE.TorusGeometry(0.041, 0.005, 8, 32), mat.mug, mug).set = null;
  mug.children[mug.children.length - 1].rotation.x = Math.PI / 2; mug.children[mug.children.length - 1].position.y = 0.1;
  const handle = mesh('mugHandle', new THREE.TorusGeometry(0.026, 0.008, 12, 24, Math.PI), mat.mug, mug); handle.position.set(0.042, 0.05, 0); handle.rotation.z = -Math.PI / 2;
  const steam = [0, 1, 2, 3, 4, 5].map(() => { const s = mesh('steam', new THREE.SphereGeometry(0.012, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15, depthWrite: false }), mug); s.castShadow = false; return s; });

  // chaise
  const chair = group('chair', 0, 0, 0.62);
  mesh('seat', new THREE.BoxGeometry(0.46, 0.06, 0.44), mat.chair, chair).position.y = 0.45;
  mesh('back', new THREE.BoxGeometry(0.44, 0.5, 0.05), mat.chair, chair).position.set(0, 0.78, 0.22);
  mesh('pole', new THREE.CylinderGeometry(0.025, 0.025, 0.4, 16), mat.dark, chair).position.y = 0.22;
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const l = mesh('chairFoot', new THREE.BoxGeometry(0.3, 0.025, 0.035), mat.dark, chair); l.position.set(Math.cos(a) * 0.15, 0.03, Math.sin(a) * 0.15); l.rotation.y = -a; }

  // personnage : style animé façon Ghibli — peau mate, cheveux mi-longs ondulés, bouc, costume
  const person = group('person', 0, 0, 0);
  const torso = mesh('torso', new THREE.CapsuleGeometry(0.16, 0.28, 10, 28), mat.shirt, person); torso.position.set(0, 0.8, 0.6); torso.scale.set(1.12, 1, 0.72);
  const shirtV = mesh('shirtFront', new THREE.ConeGeometry(0.07, 0.22, 3), mat.shirtWhite, person); shirtV.position.set(0, 0.975, 0.487); shirtV.rotation.set(Math.PI, 0, 0); shirtV.scale.set(1, 1, 0.2);
  const tie = group('tie', 0, 1.0, 0.462, person); tie.rotation.x = 0.1;
  mesh('tieKnot', new THREE.SphereGeometry(0.017, 14, 10), mat.tie, tie).scale.set(1.1, 0.9, 0.6);
  const tieBlade = mesh('tieBlade', new THREE.ConeGeometry(0.024, 0.16, 4), mat.tie, tie); tieBlade.position.y = -0.09; tieBlade.rotation.x = Math.PI; tieBlade.scale.set(1, 1, 0.3);
  [-1, 1].forEach(s => {
    const c = mesh('collar', new THREE.BoxGeometry(0.05, 0.034, 0.012), mat.shirtWhite, person); c.position.set(s * 0.03, 1.045, 0.51); c.rotation.set(0.35, 0, s * 0.55);
    const l = mesh('lapel', new THREE.BoxGeometry(0.036, 0.21, 0.012), mat.suitDark, person); l.position.set(s * 0.06, 0.95, 0.485); l.rotation.set(0.1, 0, s * 0.3);
  });
  [0.835, 0.775].forEach(y => mesh('suitButton', new THREE.SphereGeometry(0.008, 10, 8), mat.suitDark, person).position.set(0, y, 0.482));
  mesh('pocketSquare', new THREE.BoxGeometry(0.036, 0.018, 0.008), mat.shirtWhite, person).position.set(-0.09, 0.925, 0.49);
  mesh('neck', new THREE.CylinderGeometry(0.04, 0.046, 0.1, 16), mat.skin, person).position.set(0, 1.075, 0.59);
  const headG = group('headGroup', 0, 1.215, 0.57, person); headG.rotation.order = 'YXZ'; headG.scale.setScalar(1.1);
  mesh('head', new THREE.SphereGeometry(0.112, 40, 32), mat.skin, headG).scale.set(0.92, 1.0, 0.95);
  const jaw = mesh('jaw', new THREE.SphereGeometry(0.08, 28, 20), mat.skin, headG); jaw.position.set(0, -0.046, -0.03); jaw.scale.set(0.9, 0.86, 0.92);
  mesh('chin', new THREE.SphereGeometry(0.033, 18, 14), mat.skin, headG).position.set(0, -0.09, -0.066);
  const noOut = m => { m.userData.noOutline = true; m.castShadow = false; return m; };
  const eyes = [-1, 1].map(s => {
    const g = group('eyeGroup', s * 0.04, -0.008, -0.1, headG);
    noOut(mesh('eyeWhite', new THREE.SphereGeometry(0.02, 20, 16), mat.sclera, g)).scale.set(1.0, 1.15, 0.32);
    const ir = noOut(mesh('iris', new THREE.SphereGeometry(0.0155, 20, 16), mat.iris, g)); ir.scale.set(0.85, 1.15, 0.3); ir.position.set(-s * 0.001, -0.002, -0.005);
    const pu = noOut(mesh('pupil', new THREE.SphereGeometry(0.008, 12, 10), mat.pupil, g)); pu.scale.set(0.9, 1.2, 0.3); pu.position.set(-s * 0.001, -0.002, -0.0075);
    noOut(mesh('eyeShine', new THREE.SphereGeometry(0.0055, 10, 8), mat.shine, g)).position.set(0.005, 0.008, -0.0098);
    noOut(mesh('eyeShine', new THREE.SphereGeometry(0.0025, 8, 6), mat.shine, g)).position.set(-0.004, -0.007, -0.0098);
    const lid = noOut(mesh('eyelid', new THREE.BoxGeometry(0.046, 0.007, 0.012), mat.hair, g)); lid.position.set(0, 0.021, -0.005); lid.rotation.z = -s * 0.05;
    const wing = noOut(mesh('eyelidWing', new THREE.BoxGeometry(0.013, 0.005, 0.01), mat.hair, g)); wing.position.set(s * 0.023, 0.018, -0.004); wing.rotation.z = -s * 0.35;
    const brow = noOut(mesh('brow', new THREE.BoxGeometry(0.046, 0.013, 0.012), mat.hair, headG)); brow.position.set(s * 0.041, 0.045, -0.104); brow.rotation.z = -s * 0.07; brow.scale.y = 0.8;
    return g;
  });
  const noseM = mesh('nose', new THREE.SphereGeometry(0.009, 14, 12), mat.skin, headG); noseM.position.set(0, -0.028, -0.113); noseM.scale.set(0.8, 1, 1.3);
  const mouth = noOut(mesh('mouth', new THREE.TorusGeometry(0.012, 0.0025, 6, 16, Math.PI * 0.85), mat.mouth, headG)); mouth.position.set(0, -0.058, -0.106); mouth.rotation.z = Math.PI * 1.07; mouth.scale.set(1.35, 0.9, 1);
  const blushM = new THREE.MeshBasicMaterial({ color: C.blush, transparent: true, opacity: 0.28, depthWrite: false, name: 'blush' });
  [-1, 1].forEach(s => { const bl = noOut(mesh('blush', new THREE.SphereGeometry(0.016, 14, 10), blushM, headG)); bl.scale.set(1.3, 0.55, 0.3); bl.position.set(s * 0.06, -0.035, -0.095); });
  [-1, 1].forEach(s => { const m = noOut(mesh('mustache', new THREE.BoxGeometry(0.02, 0.0045, 0.01), mat.hair, headG)); m.position.set(s * 0.012, -0.046, -0.108); m.rotation.z = -s * 0.18; });
  noOut(mesh('soulPatch', new THREE.BoxGeometry(0.011, 0.013, 0.01), mat.hair, headG)).position.set(0, -0.074, -0.104);
  const goatee = mesh('goatee', new THREE.SphereGeometry(0.023, 18, 14), mat.hair, headG); goatee.position.set(0, -0.1, -0.074); goatee.scale.set(1.1, 1.2, 0.75);
  [-1, 1].forEach(s => { const e = mesh('ear', new THREE.SphereGeometry(0.021, 12, 12), mat.skin, headG); e.position.set(s * 0.104, -0.012, 0.006); e.scale.set(0.6, 1, 0.9); });
  // cheveux : grandes masses douces, raie au milieu, pointes qui rebiquent
  const hairCap = mesh('hair', new THREE.SphereGeometry(0.122, 40, 32, 0, Math.PI * 2, 0, Math.PI * 0.52), mat.hair, headG); hairCap.rotation.x = 0.4; hairCap.position.set(0, 0.028, 0.018); hairCap.scale.set(1.03, 0.95, 1.05);
  [-1, 1].forEach(s => {
    const top = mesh('hairTop', new THREE.SphereGeometry(0.06, 24, 16), mat.hair, headG); top.position.set(s * 0.045, 0.1, 0.0); top.scale.set(0.9, 0.5, 1.5); top.rotation.set(0.2, 0, s * 0.3);
    const fr = mesh('hairStrand', new THREE.CapsuleGeometry(0.014, 0.08, 6, 12), mat.hair, headG); fr.position.set(s * 0.085, 0.03, -0.074); fr.rotation.set(0.3, 0, s * 0.25);
    for (let i = 0; i < 3; i++) { const k = i / 2, cl = mesh('hairSide', new THREE.SphereGeometry(0.058, 20, 16), mat.hair, headG); cl.position.set(s * (0.098 + 0.03 * k), 0.01 - k * 0.14, 0.035 + k * 0.025); cl.scale.set(0.72, 1.3, 1.2); cl.rotation.set(0.15, 0, s * (0.08 + k * 0.3)); }
    [0.02, 0.085].forEach(z => { const tip = mesh('hairTip', new THREE.ConeGeometry(0.028, 0.07, 10), mat.hair, headG); tip.position.set(s * 0.15, -0.16, z); tip.rotation.z = s * (Math.PI - 0.8); });
  });
  const back = mesh('hairBack', new THREE.SphereGeometry(0.11, 28, 20), mat.hair, headG); back.position.set(0, -0.03, 0.06); back.scale.set(1.08, 1.1, 0.82);
  [-1, 0, 1].forEach(j => { const cl = mesh('hairBackTip', new THREE.SphereGeometry(0.05, 16, 12), mat.hair, headG); cl.position.set(j * 0.06, -0.14, 0.07); cl.scale.set(1.1, 1.2, 0.8); });
  for (const s of [-1, 1]) {
    const th = mesh('thigh', new THREE.CapsuleGeometry(0.066, 0.3, 6, 16), mat.pants, person); th.rotation.x = Math.PI / 2; th.position.set(s * 0.095, 0.53, 0.45);
    mesh('shin', new THREE.CapsuleGeometry(0.056, 0.36, 6, 16), mat.pants, person).position.set(s * 0.095, 0.3, 0.27);
    const sh = mesh('shoe', new THREE.CapsuleGeometry(0.046, 0.11, 6, 14), mat.dark, person); sh.rotation.x = Math.PI / 2; sh.position.set(s * 0.095, 0.04, 0.22);
  }
  const UP = V(0, 1, 0), A = 0.27, B = 0.27;
  const arms = [-1, 1].map(s => ({
    s, S: V(s * 0.215, 1.0, 0.6),
    up: mesh('upperArm', new THREE.CylinderGeometry(0.048, 0.042, 1, 16), mat.shirt, person),
    fo: mesh('forearm', new THREE.CylinderGeometry(0.04, 0.034, 1, 16), mat.shirt, person),
    sh: mesh('shoulder', new THREE.SphereGeometry(0.05, 16, 16), mat.shirt, person),
    el: mesh('elbow', new THREE.SphereGeometry(0.043, 16, 16), mat.shirt, person),
    hd: mesh('hand', new THREE.SphereGeometry(0.036, 16, 16), mat.skin, person),
    rest: V(s * 0.13, 0.62, 0.36), key: V(s * 0.085, 0.8, 0.13)
  }));
  arms.forEach(a => a.hd.scale.set(1.1, 0.7, 1.35));
  const limb = (m, a, b) => { const d = b.clone().sub(a); m.position.copy(a).add(b).multiplyScalar(0.5); m.scale.set(1, d.length(), 1); m.quaternion.setFromUnitVectors(UP, d.normalize()); };
  function solve(arm, H) {
    const S = arm.S, dir = H.clone().sub(S).normalize(), d = Math.min(S.distanceTo(H), A + B - 0.002);
    const Hc = S.clone().add(dir.clone().multiplyScalar(d));
    const x = (A * A - B * B + d * d) / (2 * d), h = Math.sqrt(Math.max(0, A * A - x * x));
    const pole = V(arm.s * 0.6, -1, 0.5).normalize();
    const perp = pole.sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
    const E = S.clone().add(dir.multiplyScalar(x)).add(perp.multiplyScalar(h));
    limb(arm.up, S, E); limb(arm.fo, E, Hc); arm.sh.position.copy(S); arm.el.position.copy(E); arm.hd.position.copy(Hc);
  }

  // chat : mascotte ATSme (style anime)
  const cat = group('cat', -0.74, 0.75, 0.04); cat.rotation.y = 0.7;
  const cushion = mesh('catCushion', new THREE.CylinderGeometry(0.14, 0.15, 0.035, 36), mat.cushion, cat); cushion.position.y = 0.017; cushion.scale.set(1, 1, 1.25);
  const LIFT = 0.03;
  const catBody = mesh('catBody', new THREE.SphereGeometry(0.1, 36, 28), mat.cat, cat); catBody.scale.set(1.05, 0.7, 1.45); catBody.position.y = 0.07 + LIFT;
  mesh('catBelly', new THREE.SphereGeometry(0.062, 24, 16), mat.catLight, cat).position.set(0, 0.06 + LIFT, -0.1);
  [-0.05, 0, 0.05].forEach(z => { const st = mesh('catStripe', new THREE.BoxGeometry(0.13, 0.008, 0.016), mat.catStripe, cat); st.position.set(0, 0.07 + LIFT + 0.07 * Math.sqrt(1 - (z / 0.145) ** 2) - 0.002, z); st.userData.noOutline = true; });
  const catHead = group('catHeadGroup', 0, 0.165 + LIFT, -0.14, cat); catHead.rotation.order = 'YXZ';
  mesh('catHead', new THREE.SphereGeometry(0.078, 36, 28), mat.cat, catHead).scale.set(1.15, 0.95, 1);
  [-1, 1].forEach(s => { const f = mesh('catCheek', new THREE.SphereGeometry(0.034, 18, 12), mat.catLight, catHead); f.position.set(s * 0.052, -0.03, -0.036); f.scale.set(1.2, 0.8, 0.8); });
  const muz = mesh('catMuzzle', new THREE.SphereGeometry(0.03, 18, 12), mat.catLight, catHead); muz.position.set(0, -0.024, -0.06); muz.scale.set(1.3, 0.8, 0.8);
  const nose = mesh('catNose', new THREE.SphereGeometry(0.008, 12, 8), mat.catPink, catHead); nose.position.set(0, -0.01, -0.084); nose.scale.set(1.4, 0.8, 0.6); nose.userData.noOutline = true;
  [-0.02, 0, 0.02].forEach((x, i) => { const st = mesh('catStripe', new THREE.BoxGeometry(0.011, 0.005, 0.034), mat.catStripe, catHead); st.position.set(x, 0.071 - Math.abs(x) * 0.4, -0.012); st.rotation.x = -0.35; st.userData.noOutline = true; });
  const catEyes = [-1, 1].map(s => {
    const g = group('catEyeGroup', s * 0.036, 0.006, -0.07, catHead);
    const e = mesh('catEye', new THREE.SphereGeometry(0.017, 18, 14), mat.eye, g); e.scale.set(1.15, 1.4, 0.5);
    const h1 = mesh('catEyeShine', new THREE.SphereGeometry(0.0058, 10, 8), mat.shine, g); h1.position.set(0.005, 0.007, -0.008);
    const h2 = mesh('catEyeShine', new THREE.SphereGeometry(0.003, 8, 6), mat.shine, g); h2.position.set(-0.005, -0.006, -0.008);
    [e, h1, h2].forEach(m => { m.userData.noOutline = true; m.castShadow = false; });
    for (let j = 0; j < 3; j++) { const w = mesh('whisker', new THREE.CylinderGeometry(0.0011, 0.0011, 0.07, 4), mat.eye, catHead); w.position.set(s * 0.078, -0.022 + (j - 1) * 0.008, -0.058); w.rotation.set(0, 0, Math.PI / 2 + s * (j - 1) * 0.16); w.userData.noOutline = true; w.castShadow = false; }
    return g;
  });
  const ears = [-1, 1].map(s => {
    const e = mesh('catEar', new THREE.ConeGeometry(0.037, 0.078, 14), mat.cat, catHead); e.position.set(s * 0.052, 0.072, 0.004); e.rotation.z = -s * 0.28; e.scale.z = 0.6;
    const inner = mesh('catEarInner', new THREE.ConeGeometry(0.018, 0.04, 12), mat.catPink, e); inner.position.set(0, -0.006, -0.012); inner.scale.z = 0.5; inner.userData.noOutline = true;
    const paw = mesh('catPaw', new THREE.SphereGeometry(0.025, 14, 12), mat.catLight, cat); paw.position.set(s * 0.045, 0.02 + LIFT, -0.17); paw.scale.set(1, 0.7, 1.3);
    return e;
  });
  catHead.scale.setScalar(1.16);
  const collar = mesh('catCollar', new THREE.TorusGeometry(0.052, 0.007, 10, 32), mat.collar, cat); collar.position.set(0, 0.125 + LIFT, -0.125); collar.rotation.x = Math.PI / 2 - 0.55;
  mesh('catBell', new THREE.SphereGeometry(0.013, 14, 12), mat.bell, cat).position.set(0, 0.098 + LIFT, -0.172);
  const tail = Array.from({ length: 10 }, (_, i) => mesh('catTail', new THREE.SphereGeometry(0.026 - i * 0.0011, 14, 12), i > 7 ? mat.catLight : mat.cat, cat));

  // détails du bureau
  const books = group('deskBooks', 0.74, 0.75, 0.18);
  [['#6b4fa8', 0.2, 0.03, 0.14], ['#2f5d62', 0.18, 0.028, 0.13], ['#e2b04a', 0.16, 0.024, 0.12]].reduce((y, [c, w, h, d], i) => { const bk = mesh('deskBook', new THREE.BoxGeometry(w, h, d), M('deskBook' + i, c), books); bk.position.set(0, y + h / 2, 0); bk.rotation.y = i * 0.14 - 0.12; return y + h; }, 0);
  const cup = group('penCup', 0.22, 0.75, -0.28);
  mesh('penCupBody', new THREE.CylinderGeometry(0.03, 0.027, 0.09, 20, 1, true), mat.pot, cup).position.y = 0.045;
  ['#c9493a', '#3a3a52', '#4f7f52'].forEach((c, i) => { const p = mesh('cupPen', new THREE.CylinderGeometry(0.004, 0.004, 0.14, 6), M('cupPen' + i, c), cup); p.position.set((i - 1) * 0.01, 0.08, (i % 2) * 0.008); p.rotation.set((i - 1) * 0.12, 0, (i - 1) * 0.18); });
  const phone = mesh('phone', new THREE.BoxGeometry(0.07, 0.008, 0.14), mat.dark); phone.position.set(-0.2, 0.754, 0.265); phone.rotation.y = 0.2;
  const phoneScr = mesh('phoneScreen', new THREE.PlaneGeometry(0.06, 0.125), new THREE.MeshBasicMaterial({ color: '#2a3a4a', name: 'phoneScreen' }), phone); phoneScr.rotation.x = -Math.PI / 2; phoneScr.position.y = 0.0045;
  const plate = group('cookiePlate', -0.46, 0.75, 0.3);
  mesh('plate', new THREE.CylinderGeometry(0.055, 0.045, 0.008, 28), mat.paper, plate).position.y = 0.004;
  [[0, 0], [0.022, 0.012]].forEach(([x, z], i) => { const ck = mesh('cookie', new THREE.CylinderGeometry(0.022, 0.022, 0.008, 18), mat.cookie, plate); ck.position.set(x, 0.012 + i * 0.006, z); ck.rotation.z = i * 0.15; });
  [[0.34, 1.21, 'note1', 0.18], [0.338, 1.15, 'note2', -0.1]].forEach(([x, y, n, r]) => { const nt = mesh('monitorNote', new THREE.BoxGeometry(0.05, 0.05, 0.003), mat[n]); nt.position.set(x, y, -0.286); nt.rotation.z = r; });
  const poster = group('brandPoster', 0.14, 1.96, -0.785);
  mesh('posterFrame', new THREE.BoxGeometry(0.26, 0.2, 0.02), mat.wood, poster);
  const posterTex = canvasTex(THREE, 260, 200, (x, w, h) => { x.fillStyle = C.paper; x.fillRect(0, 0, w, h); catLogo(x, 90, 30, 84, { cat: C.cat, light: C.catLight, stripe: C.catStripe, eye: C.eye, pink: C.catPink, ink: '#3b2f25', collar: C.collar, bell: C.bell }); x.fillStyle = UI.ink; x.font = '700 30px Helvetica'; x.textAlign = 'center'; x.fillText('ATSme', w / 2, 168); });
  const posterArt = mesh('posterArt', new THREE.PlaneGeometry(0.23, 0.17), new THREE.MeshToonMaterial({ map: posterTex, gradientMap: grad, name: 'posterArt' }), poster); posterArt.position.z = 0.011;
  const bin = group('bin', 1.18, 0, 0.38);
  mesh('binBody', new THREE.CylinderGeometry(0.1, 0.085, 0.26, 24, 1, true), mat.dark, bin).position.y = 0.13;
  mesh('crumple', new THREE.IcosahedronGeometry(0.035, 0), mat.paper, bin).position.set(0.02, 0.25, 0.01);

  // imprimante 3D : imprime des CV couche par couche puis les éjecte dans le bac
  mat.printer = M('printer', '#e8e1d0'); mat.printerDark = M('printerDark', '#3d3a44');
  const printCab = group('printerCabinet', 1.12, 0, -0.52);
  mesh('printerCabBody', new THREE.BoxGeometry(0.46, 0.6, 0.42), mat.wood, printCab).position.y = 0.3;
  [0.42, 0.18].forEach(y => { mesh('printerCabDoor', new THREE.BoxGeometry(0.42, 0.2, 0.012), mat.wood, printCab).position.set(0, y, 0.213); mesh('printerCabKnob', new THREE.SphereGeometry(0.014, 10, 8), mat.dark, printCab).position.set(0, y, 0.225); });
  const printer = group('printer3d', 1.12, 0.6, -0.56);
  const PW = 0.3, PD = 0.26, PH = 0.3;
  mesh('printerBase', new THREE.BoxGeometry(PW, 0.045, PD), mat.printer, printer).position.y = 0.0225;
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => mesh('printerPost', new THREE.BoxGeometry(0.02, PH, 0.02), mat.printerDark, printer).position.set(sx * (PW / 2 - 0.01), PH / 2, sz * (PD / 2 - 0.01)));
  [-1, 1].forEach(sz => mesh('printerRail', new THREE.BoxGeometry(PW, 0.022, 0.022), mat.printerDark, printer).position.set(0, PH, sz * (PD / 2 - 0.01)));
  [-1, 1].forEach(sx => mesh('printerRail', new THREE.BoxGeometry(0.022, 0.022, PD), mat.printerDark, printer).position.set(sx * (PW / 2 - 0.01), PH, 0));
  mesh('printerBed', new THREE.BoxGeometry(0.22, 0.01, 0.23), mat.printerDark, printer).position.y = 0.05;
  const gantry = group('printerGantry', 0, 0.113, 0, printer);
  mesh('gantryBar', new THREE.BoxGeometry(PW - 0.02, 0.018, 0.022), mat.printerDark, gantry);
  const pHead = group('printHead', 0, 0, 0, gantry);
  mesh('printHeadBody', new THREE.BoxGeometry(0.05, 0.045, 0.045), mat.notebook, pHead).position.y = -0.005;
  const nozzle = mesh('nozzle', new THREE.ConeGeometry(0.008, 0.02, 12), new THREE.MeshBasicMaterial({ color: '#ff9a3c', name: 'nozzleHot' }), pHead); nozzle.rotation.x = Math.PI; nozzle.position.y = -0.037; nozzle.castShadow = false;
  const spool = mesh('spool', new THREE.CylinderGeometry(0.055, 0.055, 0.035, 28), mat.pot, printer); spool.rotation.z = Math.PI / 2; spool.position.set(PW / 2 + 0.035, 0.2, 0);
  mesh('spoolHub', new THREE.CylinderGeometry(0.018, 0.018, 0.05, 16), mat.printerDark, spool);
  const lcd = mesh('printerScreen', new THREE.PlaneGeometry(0.07, 0.028), new THREE.MeshBasicMaterial({ color: '#9fe0a8', name: 'printerScreen' }), printer); lcd.position.set(0.07, 0.0225, PD / 2 + 0.0015); lcd.castShadow = false;
  const sheetTex = canvasTex(THREE, 200, 270, (x, w, h) => {
    x.fillStyle = '#fffdf7'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#1f1812'; x.font = '700 22px Helvetica'; x.fillText('Corentin Nador', 16, 36);
    x.fillStyle = '#2f5a33'; x.font = '600 13px Helvetica'; x.fillText('Développeur Full-stack', 16, 56);
    [84, 172].forEach(y => x.fillRect(16, y, 64, 4));
    x.fillStyle = '#b9ad98'; for (let i = 0; i < 5; i++) { x.fillRect(16, 98 + i * 13, i % 2 ? 130 : 168, 5); x.fillRect(16, 186 + i * 13, i % 3 === 2 ? 110 : 168, 5); }
  });
  const sheetM = new THREE.MeshToonMaterial({ map: sheetTex, gradientMap: grad, name: 'cvSheet' });
  const SHW = 0.16, SHD = 0.21, sheetMats = [mat.paper, mat.paper, sheetM, mat.paper, mat.paper, mat.paper];
  const printing = mesh('printingSheet', new THREE.BoxGeometry(SHW, 0.004, SHD), sheetMats, printer); printing.position.y = 0.057;
  const tray = group('printTray', 0, 0, PD / 2 + 0.13, printer);
  mesh('trayBase', new THREE.BoxGeometry(0.2, 0.012, 0.24), mat.printerDark, tray).position.y = 0.006;
  [-1, 1].forEach(sx => mesh('trayLip', new THREE.BoxGeometry(0.012, 0.03, 0.24), mat.printerDark, tray).position.set(sx * 0.1, 0.015, 0));
  const stack = Array.from({ length: 6 }, (_, i) => { const s = mesh('printedCV', new THREE.BoxGeometry(SHW, 0.004, SHD), sheetMats, tray); s.position.set((i % 2 ? 0.004 : -0.003), 0.014 + i * 0.0045, 0); s.rotation.y = (i % 3 - 1) * 0.04; s.visible = i < 2; return s; });
  const ejecting = mesh('ejectingCV', new THREE.BoxGeometry(SHW, 0.004, SHD), sheetMats, printer); ejecting.visible = false;
  S0.stackN = 2;

  // mobilier
  const bookcase = group('bookcase', 1.78, 0, -0.62);
  [-1, 1].forEach(sx => mesh('bookcaseSide', new THREE.BoxGeometry(0.025, 1.2, 0.3), mat.wood, bookcase).position.set(sx * 0.36, 0.6, 0));
  mesh('bookcaseBack', new THREE.BoxGeometry(0.72, 1.2, 0.015), mat.dark, bookcase).position.set(0, 0.6, -0.14);
  [0.02, 0.41, 0.8, 1.19].forEach(y => mesh('bookcaseShelf', new THREE.BoxGeometry(0.72, 0.022, 0.3), mat.wood, bookcase).position.set(0, y, 0));
  const BC = ['#6b4fa8', '#2f5d62', '#b5523b', '#e2b04a', '#3a3a52', '#d9c9a3', '#4f7f52', '#8a5a3a'];
  [0.03, 0.42, 0.81].forEach((y, r) => { let x = -0.32; for (let i = 0; x < 0.22 - r * 0.12; i++) { const w = 0.03 + ((i * 7 + r * 3) % 4) * 0.008, h = 0.22 + ((i * 5 + r) % 5) * 0.025; const bk = mesh('shelfBook', new THREE.BoxGeometry(w, h, 0.2), M('shelfBook' + r + i, BC[(i + r * 3) % BC.length]), bookcase); bk.position.set(x + w / 2, y + 0.011 + h / 2, 0.01); if (i % 6 === 5) bk.rotation.z = 0.12; x += w + 0.004; } });
  const storeBox = mesh('storageBox', new THREE.BoxGeometry(0.2, 0.16, 0.22), mat.cork, bookcase); storeBox.position.set(0.23, 0.9, 0);
  const globe = group('globe', 0.22, 0.43, 0, bookcase);
  mesh('globeStand', new THREE.CylinderGeometry(0.035, 0.05, 0.02, 20), mat.dark, globe).position.y = 0.01;
  mesh('globeBall', new THREE.SphereGeometry(0.075, 24, 18), M('globe', '#6fa0c8'), globe).position.y = 0.11;
  const armchair = group('armchair', -1.32, 0, 0.78); armchair.rotation.y = 0.85;
  const fabric = M('armchairFabric', '#6f8a5e');
  mesh('armSeat', new THREE.BoxGeometry(0.56, 0.16, 0.52), fabric, armchair).position.y = 0.3;
  mesh('armBack', new THREE.BoxGeometry(0.56, 0.48, 0.13), fabric, armchair).position.set(0, 0.6, 0.2);
  [-1, 1].forEach(sx => { mesh('armRest', new THREE.BoxGeometry(0.1, 0.24, 0.52), fabric, armchair).position.set(sx * 0.3, 0.44, 0); mesh('armLeg', new THREE.CylinderGeometry(0.018, 0.014, 0.22, 10), mat.dark, armchair).position.set(sx * 0.26, 0.11, -0.22); mesh('armLeg', new THREE.CylinderGeometry(0.018, 0.014, 0.22, 10), mat.dark, armchair).position.set(sx * 0.26, 0.11, 0.22); });
  const pillow = mesh('armPillow', new THREE.BoxGeometry(0.3, 0.26, 0.08), mat.rugLight, armchair); pillow.position.set(0.05, 0.5, 0.12); pillow.rotation.set(-0.2, 0, 0.12);
  const floorLamp = group('floorLamp', -1.78, 0, 0.22);
  mesh('floorLampBase', new THREE.CylinderGeometry(0.12, 0.14, 0.03, 28), mat.dark, floorLamp).position.y = 0.015;
  mesh('floorLampPole', new THREE.CylinderGeometry(0.012, 0.012, 1.45, 10), mat.dark, floorLamp).position.y = 0.74;
  mesh('floorLampShade', new THREE.CylinderGeometry(0.12, 0.2, 0.24, 28, 1, true), mat.shade, floorLamp).position.y = 1.5;
  const radiator = group('radiator', -1.05, 0.1, -0.74);
  for (let i = 0; i < 11; i++) mesh('radiatorFin', new THREE.BoxGeometry(0.035, 0.5, 0.06), mat.paper, radiator).position.set(-0.3 + i * 0.06, 0.25, 0);
  mesh('radiatorPipe', new THREE.CylinderGeometry(0.012, 0.012, 0.66, 10), mat.paper, radiator).rotation.z = Math.PI / 2;
  const diploma = group('diploma', 1.28, 1.42, -0.785);
  mesh('diplomaFrame', new THREE.BoxGeometry(0.28, 0.2, 0.02), mat.dark, diploma);
  const dipTex = canvasTex(THREE, 280, 200, (x, w, h) => { x.fillStyle = '#fbf5e6'; x.fillRect(0, 0, w, h); x.strokeStyle = '#c9a24a'; x.lineWidth = 6; x.strokeRect(12, 12, w - 24, h - 24); x.fillStyle = '#3b2f25'; x.font = '700 24px Georgia'; x.textAlign = 'center'; x.fillText('Diplôme', w / 2, 70); x.font = '400 15px Georgia'; x.fillText('Master Informatique', w / 2, 104); x.fillStyle = '#b5523b'; x.beginPath(); x.arc(w / 2, 148, 16, 0, 7); x.fill(); });
  const dipArt = mesh('diplomaArt', new THREE.PlaneGeometry(0.25, 0.17), new THREE.MeshToonMaterial({ map: dipTex, gradientMap: grad, name: 'diplomaArt' }), diploma); dipArt.position.z = 0.011;

  // décor douillet : guirlande, plantes, cadres, mur de droite
  const lightsCurve = new THREE.CatmullRomCurve3([V(-1.95, 2.46, -0.72), V(-1.2, 2.3, -0.7), V(-0.4, 2.44, -0.72), V(0.4, 2.3, -0.7), V(1.2, 2.44, -0.72), V(2.1, 2.32, -0.7)]);
  const wireM = new THREE.MeshBasicMaterial({ color: '#4a3326', name: 'fairyWire' });
  noOut(mesh('fairyWire', new THREE.TubeGeometry(lightsCurve, 120, 0.003, 5, false), wireM));
  const bulbs = Array.from({ length: 26 }, (_, i) => { const b2 = noOut(mesh('fairyBulb', new THREE.SphereGeometry(0.014, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffd98a', name: 'fairyBulb' }))); b2.position.copy(lightsCurve.getPoint((i + 0.5) / 26)).add(V(0, -0.012, 0)); return b2; });
  const sillPlants = [-0.3, 0, 0.3].map((dx, i) => { const g2 = group('sillPlant', -1.05 + dx, 1.137, -0.72); mesh('sillPot', new THREE.CylinderGeometry(0.04, 0.032, 0.07, 18), M('sillPot' + i, ['#c77b52', '#e9d6b2', '#6f8a9e'][i]), g2).position.y = 0.035; for (let k = 0; k < 5; k++) { const lf = mesh('sillLeaf', new THREE.SphereGeometry(0.03, 12, 10), mat.leaf, g2); lf.scale.set(0.45, 1.2, 0.2); lf.position.set(Math.cos(k * 1.3) * 0.02, 0.1, Math.sin(k * 1.3) * 0.02); lf.rotation.set(Math.sin(k) * 0.5, k * 1.3, Math.cos(k) * 0.5); } return g2; });
  const paint = (sky, hill) => canvasTex(THREE, 160, 120, (x, w, h) => { const gr2 = x.createLinearGradient(0, 0, 0, h); gr2.addColorStop(0, sky); gr2.addColorStop(1, '#f3ead8'); x.fillStyle = gr2; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.beginPath(); x.arc(50, 34, 14, 0, 7); x.arc(66, 30, 18, 0, 7); x.arc(84, 36, 12, 0, 7); x.fill(); x.fillStyle = hill; x.beginPath(); x.moveTo(0, h); x.quadraticCurveTo(w * 0.35, h * 0.45, w * 0.7, h * 0.75); x.quadraticCurveTo(w * 0.85, h * 0.6, w, h * 0.7); x.lineTo(w, h); x.fill(); });
  [[-0.5, 2.02, 0.2, 0.15, '#7fb3de', '#6f9a5a'], [-0.5, 1.76, 0.16, 0.12, '#f2b98a', '#b5523b'], [0.42, 2.05, 0.18, 0.13, '#a9d3ec', '#4f7f52']].forEach(([x, y, w, h, sky, hill], i) => { const fr = group('painting', x, y, -0.785); mesh('paintingFrame', new THREE.BoxGeometry(w + 0.03, h + 0.03, 0.018), mat.wood, fr); const art = noOut(mesh('paintingArt', new THREE.PlaneGeometry(w, h), new THREE.MeshToonMaterial({ map: paint(sky, hill), gradientMap: grad, name: 'paintingArt' + i }), fr)); art.position.z = 0.0101; });
  const cal = group('calendar', -1.72, 1.62, -0.785); mesh('calendarBoard', new THREE.BoxGeometry(0.22, 0.3, 0.01), mat.paper, cal);
  const calArt = noOut(mesh('calendarArt', new THREE.PlaneGeometry(0.2, 0.28), new THREE.MeshToonMaterial({ gradientMap: grad, name: 'calendarArt', map: canvasTex(THREE, 200, 280, (x, w, h) => { x.fillStyle = '#fbf5e6'; x.fillRect(0, 0, w, h); x.fillStyle = '#b5523b'; x.fillRect(0, 0, w, 50); x.fillStyle = '#fff'; x.font = '700 24px Helvetica'; x.textAlign = 'center'; x.fillText('Septembre', w / 2, 34); x.fillStyle = '#6b5a46'; for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) x.fillRect(12 + c * 26, 70 + r * 38, 20, 26); x.strokeStyle = '#b5523b'; x.lineWidth = 3; x.beginPath(); x.arc(12 + 4 * 26 + 10, 70 + 3 * 38 + 13, 17, 0, 7); x.stroke(); }) }), cal)); calArt.position.z = 0.006;
  const rightWall = mesh('rightWall', new THREE.PlaneGeometry(8, 3.2), mat.wall); rightWall.rotation.y = -Math.PI / 2; rightWall.position.set(2.3, 1.6, 3.2);
  mesh('rightBaseboard', new THREE.BoxGeometry(0.02, 0.08, 8), mat.wood).position.set(2.29, 0.04, 3.2);
  const door = group('door', 2.29, 0, 1.3);
  mesh('doorPanel', new THREE.BoxGeometry(0.03, 2.0, 0.8), mat.wood, door).position.y = 1.0;
  mesh('doorKnob', new THREE.SphereGeometry(0.025, 12, 10), mat.bell, door).position.set(-0.03, 1.0, -0.3);
  const hook = group('coatHook', 2.28, 1.7, 0.55);
  mesh('hookBar', new THREE.BoxGeometry(0.02, 0.05, 0.4), mat.wood, hook);
  const hat = mesh('hat', new THREE.CylinderGeometry(0.1, 0.12, 0.08, 24), M('hat', '#7a5a3a'), hook); hat.position.set(-0.08, -0.06, -0.1); hat.rotation.z = 0.2;
  const bag = mesh('bag', new THREE.BoxGeometry(0.1, 0.3, 0.24), M('bag', '#b98a55'), hook); bag.position.set(-0.07, -0.28, 0.1); bag.rotation.x = 0.08;
  const bigPlant = group('bigPlant', 2.02, 0, 0.15);
  mesh('bigPot', new THREE.CylinderGeometry(0.16, 0.12, 0.34, 28), mat.pot, bigPlant).position.y = 0.17;
  for (let i = 0; i < 11; i++) { const a2 = i * 2.1, h2 = 0.55 + (i % 4) * 0.18; const st = mesh('bigStem', new THREE.CylinderGeometry(0.006, 0.008, h2, 6), mat.leaf, bigPlant); st.position.set(Math.cos(a2) * 0.05, 0.34 + h2 / 2, Math.sin(a2) * 0.05); st.rotation.set(Math.sin(a2) * 0.3, 0, Math.cos(a2) * 0.3); const lf = mesh('bigLeaf', new THREE.SphereGeometry(0.12, 16, 12), mat.leaf, bigPlant); lf.scale.set(1, 0.2, 0.7); lf.position.set(Math.cos(a2) * (0.12 + h2 * 0.25), 0.34 + h2, Math.sin(a2) * (0.12 + h2 * 0.25)); lf.rotation.set(Math.sin(a2) * 0.5, a2, 0.3); }
  const floorBooks = group('floorBooks', -0.95, 0, 1.05);
  [['#2f5d62', 0.28], ['#e2b04a', 0.26], ['#b5523b', 0.3], ['#6b4fa8', 0.24]].reduce((y, [c, w], i) => { const bk = mesh('floorBook', new THREE.BoxGeometry(w, 0.05, 0.2), M('floorBook' + i, c), floorBooks); bk.position.set(0, y + 0.025, 0); bk.rotation.y = i * 0.3 - 0.4; return y + 0.05; }, 0);
  const teaTable = group('sideTable', -1.72, 0, 0.78);
  mesh('sideTableTop', new THREE.CylinderGeometry(0.2, 0.2, 0.025, 28), mat.wood, teaTable).position.y = 0.5;
  mesh('sideTableLeg', new THREE.CylinderGeometry(0.025, 0.04, 0.5, 12), mat.dark, teaTable).position.y = 0.25;
  const pot2 = group('teapot', 0, 0.513, 0, teaTable);
  mesh('teapotBody', new THREE.SphereGeometry(0.07, 20, 16), M('teapot', '#6f9a8e'), pot2).scale.set(1, 0.8, 1); pot2.children[0].position.y = 0.055;
  const spout = mesh('teapotSpout', new THREE.CylinderGeometry(0.01, 0.016, 0.08, 10), M('teapot2', '#6f9a8e'), pot2); spout.position.set(0.08, 0.07, 0); spout.rotation.z = -0.9;
  mesh('teapotLid', new THREE.SphereGeometry(0.02, 12, 10), mat.dark, pot2).position.y = 0.115;

  // mur de gauche : réseaux sociaux, avis, trophée, sécurité, drapeau
  const wallX = -2.085;
  const framed = (name, z, y, w, h, draw) => {
    const g = group(name, wallX, y, z); g.rotation.y = Math.PI / 2;
    mesh(name + 'Frame', new THREE.BoxGeometry(w + 0.035, h + 0.035, 0.02), mat.wood, g);
    const art = noOut(mesh(name + 'Art', new THREE.PlaneGeometry(w, h), new THREE.MeshToonMaterial({ gradientMap: grad, name: name + 'Art', map: canvasTex(THREE, Math.round(w * 1000), Math.round(h * 1000), draw) }), g)); art.position.z = 0.0105;
    return g;
  };
  const rrp = (x, X, Y, W, H, r) => { x.beginPath(); x.roundRect(X, Y, W, H, r); };
  const ytF = framed('youtubeFrame', 1.5, 1.68, 0.3, 0.22, (x, w, h) => { x.fillStyle = '#fbf5e6'; x.fillRect(0, 0, w, h); x.fillStyle = '#e62117'; rrp(x, 95, 35, 110, 78, 20); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(137, 55); x.lineTo(137, 93); x.lineTo(170, 74); x.fill(); x.fillStyle = '#231a14'; x.font = '700 26px Helvetica'; x.textAlign = 'center'; x.fillText('YouTube', w / 2, 158); x.fillStyle = '#6b5a46'; x.font = '500 19px Helvetica'; x.fillText('@ATSme', w / 2, 188); });
  const igF = framed('instagramFrame', 1.92, 1.68, 0.3, 0.22, (x, w, h) => { x.fillStyle = '#fbf5e6'; x.fillRect(0, 0, w, h); const gr4 = x.createLinearGradient(110, 110, 190, 30); gr4.addColorStop(0, '#f9ce34'); gr4.addColorStop(0.5, '#ee2a7b'); gr4.addColorStop(1, '#6228d7'); x.fillStyle = gr4; rrp(x, 111, 30, 78, 78, 22); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 7; rrp(x, 126, 45, 48, 48, 14); x.stroke(); x.beginPath(); x.arc(150, 69, 12, 0, 7); x.stroke(); x.fillStyle = '#fff'; x.beginPath(); x.arc(165, 54, 4, 0, 7); x.fill(); x.fillStyle = '#231a14'; x.font = '700 26px Helvetica'; x.textAlign = 'center'; x.fillText('Instagram', w / 2, 158); x.fillStyle = '#6b5a46'; x.font = '500 19px Helvetica'; x.fillText('@atsme.cv', w / 2, 188); });
  const tpF = framed('trustFrame', 2.38, 1.68, 0.34, 0.22, (x, w, h) => { x.fillStyle = '#fbf5e6'; x.fillRect(0, 0, w, h); x.fillStyle = '#231a14'; x.font = '700 30px Helvetica'; x.textAlign = 'center'; x.fillText('Excellent', w / 2, 50);
    const star = (cx, cy, r) => { x.beginPath(); for (let i = 0; i < 10; i++) { const rr2 = i % 2 ? r * 0.45 : r, an = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(cx + Math.cos(an) * rr2, cy + Math.sin(an) * rr2); } x.closePath(); x.fill(); };
    for (let i = 0; i < 5; i++) { x.fillStyle = '#00b67a'; x.fillRect(40 + i * 54, 72, 48, 48); x.fillStyle = '#fff'; star(64 + i * 54, 97, 19); }
    x.fillStyle = '#231a14'; x.font = '600 20px Helvetica'; x.fillText('5,0 sur 5 · Trustpilot', w / 2, 160); x.fillStyle = '#00b67a'; star(w / 2 - 110, 154, 11); });
  const wShelf = group('wallShelfLeft', wallX + 0.09, 1.32, 1.94);
  mesh('wallShelfBoard', new THREE.BoxGeometry(0.18, 0.025, 1.2), mat.wood, wShelf);
  [-0.5, 0.5].forEach(dz => mesh('wallShelfBracket', new THREE.BoxGeometry(0.14, 0.08, 0.02), mat.dark, wShelf).position.set(-0.02, -0.05, dz));
  // trophée « meilleur projet »
  const gold = M('trophyGold', '#e8b93c'), dark2 = M('trophyBase', '#3d2f26');
  const trophy = group('trophy', 0, 0.0125, -0.42, wShelf);
  mesh('trophyBase', new THREE.BoxGeometry(0.1, 0.035, 0.1), dark2, trophy).position.y = 0.018;
  mesh('trophyBase2', new THREE.BoxGeometry(0.075, 0.03, 0.075), dark2, trophy).position.y = 0.05;
  mesh('trophyStem', new THREE.CylinderGeometry(0.01, 0.016, 0.05, 14), gold, trophy).position.y = 0.09;
  const cupPts = []; for (let i = 0; i <= 10; i++) { const k = i / 10; cupPts.push(new THREE.Vector2(0.012 + Math.sin(k * Math.PI * 0.5) * 0.045, k * 0.08)); }
  const cupM = mesh('trophyCup', new THREE.LatheGeometry(cupPts, 28), gold, trophy); cupM.position.y = 0.115; cupM.material.side = THREE.DoubleSide;
  [-1, 1].forEach(sz => { const hd2 = mesh('trophyHandle', new THREE.TorusGeometry(0.022, 0.005, 8, 16, Math.PI), gold, trophy); hd2.position.set(0, 0.16, sz * 0.055); hd2.rotation.set(0, Math.PI / 2, sz * -Math.PI / 2); });
  const plaque = noOut(mesh('trophyPlaque', new THREE.PlaneGeometry(0.07, 0.022), new THREE.MeshToonMaterial({ gradientMap: grad, name: 'trophyPlaque', map: canvasTex(THREE, 280, 88, (x, w, h) => { x.fillStyle = '#e8b93c'; x.fillRect(0, 0, w, h); x.fillStyle = '#3d2f26'; x.font = '700 30px Helvetica'; x.textAlign = 'center'; x.fillText('MEILLEUR PROJET', w / 2, 40); x.font = '600 26px Helvetica'; x.fillText('2026', w / 2, 74); }) }), trophy)); plaque.position.set(0.0505, 0.018, 0); plaque.rotation.y = Math.PI / 2;
  // cadenas « sécurisé »
  const lock = group('padlock', 0, 0.0125, 0.05, wShelf); lock.rotation.y = Math.PI / 2 - 0.3;
  const lockBody = M('padlockBody', '#c9a24a'), steel = M('padlockSteel', '#b9c0c8');
  mesh('padlockBody', new THREE.BoxGeometry(0.085, 0.07, 0.035), lockBody, lock).position.y = 0.036;
  const shackle = mesh('padlockShackle', new THREE.TorusGeometry(0.028, 0.007, 10, 20, Math.PI), steel, lock); shackle.position.y = 0.075;
  [-1, 1].forEach(sx => mesh('padlockLeg', new THREE.CylinderGeometry(0.007, 0.007, 0.012, 10), steel, lock).position.set(sx * 0.028, 0.075, 0));
  mesh('padlockKeyhole', new THREE.CylinderGeometry(0.007, 0.007, 0.004, 12), dark2, lock).rotation.x = Math.PI / 2; lock.children[lock.children.length - 1].position.set(0, 0.04, 0.019);
  const lockTag = noOut(mesh('padlockTag', new THREE.PlaneGeometry(0.1, 0.025), new THREE.MeshToonMaterial({ gradientMap: grad, name: 'padlockTag', map: canvasTex(THREE, 400, 100, (x, w, h) => { x.fillStyle = '#fbf5e6'; x.fillRect(0, 0, w, h); x.fillStyle = '#2f5a33'; x.font = '700 42px Helvetica'; x.textAlign = 'center'; x.fillText('100 % sécurisé', w / 2, 66); }) }), wShelf)); lockTag.position.set(0.091, -0.03, 0.05); lockTag.rotation.y = Math.PI / 2;
  // petit drapeau français
  const flag = group('frenchFlag', 0, 0.0125, 0.42, wShelf); flag.scale.setScalar(0.75);
  mesh('flagBase', new THREE.CylinderGeometry(0.025, 0.03, 0.012, 18), dark2, flag).position.y = 0.006;
  mesh('flagPole', new THREE.CylinderGeometry(0.003, 0.003, 0.2, 8), gold, flag).position.y = 0.105;
  const flagGeo = new THREE.PlaneGeometry(0.1, 0.066, 12, 4);
  const flagMesh = noOut(mesh('flagCloth', flagGeo, new THREE.MeshToonMaterial({ gradientMap: grad, side: THREE.DoubleSide, name: 'flagCloth', map: canvasTex(THREE, 150, 100, (x) => { x.fillStyle = '#002654'; x.fillRect(0, 0, 50, 100); x.fillStyle = '#ffffff'; x.fillRect(50, 0, 50, 100); x.fillStyle = '#ce1126'; x.fillRect(100, 0, 50, 100); }) }), flag));
  flagMesh.position.set(0, 0.17, 0.053); flagMesh.rotation.y = Math.PI / 2;
  const flagBase0 = flagGeo.attributes.position.array.slice();

  // avion en papier (candidature envoyée)
  const plane = group('paperPlane', 0, 0, 0); plane.visible = false;
  const paperM = new THREE.MeshToonMaterial({ color: C.paper, gradientMap: grad, side: THREE.DoubleSide, name: 'planePaper' });
  const foldM = new THREE.MeshToonMaterial({ color: '#e9dcc0', gradientMap: grad, side: THREE.DoubleSide, name: 'planeFold' });
  const edgeM = new THREE.LineBasicMaterial({ color: '#4a3326' });
  [-1, 1].forEach(s => {
    const sh = new THREE.Shape(); sh.moveTo(0, -0.12); sh.lineTo(s * 0.085, 0.08); sh.lineTo(0, 0.05); sh.lineTo(0, -0.12);
    const g = group('wingPivot', 0, 0, 0, plane); g.rotation.z = s * 0.22;
    const w = mesh('wing', new THREE.ShapeGeometry(sh), paperM, g); w.rotation.x = -Math.PI / 2; w.add(new THREE.LineSegments(new THREE.EdgesGeometry(w.geometry), edgeM));
  });
  { const kl = new THREE.Shape(); kl.moveTo(0.12, 0); kl.lineTo(-0.05, -0.03); kl.lineTo(-0.05, 0); kl.lineTo(0.12, 0);
    const k = mesh('keel', new THREE.ShapeGeometry(kl), foldM, plane); k.rotation.y = -Math.PI / 2; k.add(new THREE.LineSegments(new THREE.EdgesGeometry(k.geometry), edgeM)); }
  plane.traverse(o => { o.userData.noOutline = true; o.castShadow = true; });
  const flight = new THREE.CatmullRomCurve3([V(0.12, 1.02, 0.05), V(0.02, 1.3, -0.1), V(-0.45, 1.55, -0.3), V(-0.85, 1.68, -0.62), V(-1.05, 1.7, -0.8)]);

  // poussière dans le rayon
  const n = 70, dpos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { dpos[i * 3] = -1.3 + Math.random() * 1.2; dpos[i * 3 + 1] = 0.3 + Math.random() * 1.7; dpos[i * 3 + 2] = -0.7 + Math.random() * 1.3; }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  const dustTex = canvasTex(THREE, 32, 32, (x, w, h) => { const gr3 = x.createRadialGradient(16, 16, 0, 16, 16, 16); gr3.addColorStop(0, 'rgba(255,255,255,1)'); gr3.addColorStop(0.5, 'rgba(255,255,255,.5)'); gr3.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr3; x.fillRect(0, 0, w, h); });
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: '#fff3c4', map: dustTex, size: 0.02, transparent: true, opacity: 0.45, depthWrite: false, name: 'dust' }));
  dust.name = 'dust'; root.add(dust);

  const walker = cat.clone(true); walker.name = 'catWalker'; root.add(walker);
  walker.children.filter(c2 => c2.name === 'catCushion' || c2.name === 'catPaw').forEach(c2 => walker.remove(c2));
  const wHead = walker.getObjectByName('catHeadGroup'), wTail = walker.children.filter(c2 => c2.name === 'catTail'), wBody = walker.getObjectByName('catBody');
  const wLegs = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => { const lg = group('catLegPivot', sx * 0.048, 0.085, sz * 0.085, walker); const leg = mesh('catLeg', new THREE.CapsuleGeometry(0.019, 0.05, 6, 12), sz < 0 ? mat.catLight : mat.cat, lg); leg.position.y = -0.04; const paw = mesh('catPaw', new THREE.SphereGeometry(0.022, 12, 10), mat.catLight, lg); paw.position.set(0, -0.075, -0.006); paw.scale.set(1, 0.7, 1.25); return lg; });
  walker.position.set(-1.2, 0.02, 1.4);
  const walkPts = [], walkTan = [];
  const walkPath = new THREE.CatmullRomCurve3([V(-0.75, 0, 1.45), V(-0.9, 0, 2.05), V(-0.1, 0, 2.3), V(0.8, 0, 2.0), V(1.05, 0, 1.35), V(0.55, 0, 1.15), V(-0.2, 0, 1.3)], true, 'centripetal');
  const walkLen = walkPath.getLength(), _wp = V(0, 0, 0), _wt = V(0, 0, 0);
  for (let i = 0; i <= 240; i++) { walkPts.push(walkPath.getPointAt(i / 240)); walkTan.push(walkPath.getTangentAt(i / 240)); }

  screen.userData.noOutline = true; addOutlines(THREE, root);

  // ---------- écran : interface ATSme par chapitre ----------
  const hx = m => '#' + m.color.getHexString();
  const logoP = () => ({ cat: hx(mat.cat), light: hx(mat.catLight), stripe: hx(mat.catStripe), eye: hx(mat.eye), pink: hx(mat.catPink), ink: UI.ink, collar: hx(mat.collar), bell: hx(mat.bell) });
  const F = (w, s) => `${w} ${s}px Helvetica, Arial, sans-serif`;
  const rr = (x, y, w, h, r, fill) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); };
  const center = (txt, y, font, col) => { ctx.font = font; ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(txt, 512, y); ctx.textAlign = 'left'; };
  function top(active) {
    ctx.fillStyle = UI.bg; ctx.fillRect(0, 0, 1024, 620);
    ctx.fillStyle = UI.bar; ctx.fillRect(0, 0, 1024, 54);
    catLogo(ctx, 16, 9, 36, logoP());
    ctx.fillStyle = UI.ink; ctx.font = F(700, 22); ctx.fillText('ATSme', 56, 35);
    let x = 470; ['Éditeur', 'Analyse', 'Offre', 'Envoi'].forEach((l, i) => { ctx.font = F(600, 18); const w = ctx.measureText(l).width + 32; if (i === active) rr(x, 11, w, 32, 16, UI.accentSoft); ctx.fillStyle = i === active ? UI.accent : UI.dim; ctx.fillText(l, x + 16, 33); x += w + 8; });
  }
  function gauge(cx, cy, r, val, lw = 18, size = 64, suffix = '') {
    ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.strokeStyle = UI.track; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
    ctx.strokeStyle = val > 80 ? UI.accent : UI.warn; ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * val / 100); ctx.stroke();
    ctx.fillStyle = UI.ink; ctx.font = F(700, size); ctx.textAlign = 'center'; ctx.fillText(val + suffix, cx, cy + size * 0.34); ctx.textAlign = 'left';
  }
  function bar(x, y, w, label, v) {
    ctx.fillStyle = UI.dim; ctx.font = F(400, 19); ctx.fillText(label, x, y);
    ctx.textAlign = 'right'; ctx.fillStyle = UI.ink; ctx.font = F(600, 19); ctx.fillText(Math.round(v * 100), x + w, y); ctx.textAlign = 'left';
    rr(x, y + 10, w, 9, 4.5, UI.track); if (v > 0.02) rr(x, y + 10, w * v, 9, 4.5, UI.accent);
  }
  function tick(x, y, s, col, lw = 3) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s * 0.38, y + s * 0.36); ctx.lineTo(x + s, y - s * 0.42); ctx.stroke(); }

  const CV_TEXT = ['Corentin Nador', 'Développeur Full-stack', '', 'EXPÉRIENCE', 'Lead Developer — Studio Nord, 2022–2026', 'API de paiement : 2 M de transactions par mois', 'Temps de chargement divisé par 3', '', 'COMPÉTENCES', 'React · Node.js · TypeScript · PostgreSQL'];
  const TOTAL = CV_TEXT.join('').length;
  function drawEditor(nc, score, blink) {
    top(0);
    rr(40, 78, 600, 516, 10, '#fffdf7'); ctx.strokeStyle = UI.track; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(40, 78, 600, 516, 10); ctx.stroke();
    let left = nc, y = 128, cx = 70, cy = 128, placed = false;
    CV_TEXT.forEach((line, i) => {
      const big = i === 0, head = /^[A-ZÉ ]+$/.test(line) && line.length > 3;
      ctx.font = big ? F(700, 34) : head ? F(700, 16) : i === 1 ? F(400, 22) : F(400, 19);
      ctx.fillStyle = big ? '#1f1812' : head ? '#2f5a33' : '#3b3128';
      const shown = line.slice(0, Math.max(0, left)); left -= line.length;
      if (shown) ctx.fillText(shown, 70, y);
      if (!placed && left <= 0) { cx = 70 + ctx.measureText(shown).width + 2; cy = y; placed = true; }
      y += big ? 42 : line ? 36 : 20;
    });
    if (blink) { ctx.fillStyle = '#1f1812'; ctx.fillRect(cx, cy - 20, 3, 24); }
    rr(670, 78, 314, 516, 12, UI.side);
    ctx.fillStyle = UI.dim; ctx.font = F(700, 17); ctx.fillText('SCORE ATS · EN DIRECT', 700, 116);
    gauge(827, 250, 95, score);
    bar(700, 420, 254, 'Mots-clés', Math.min(1, score / 95)); bar(700, 472, 254, 'Structure', Math.min(1, score / 80)); bar(700, 524, 254, 'Lisibilité', Math.min(1, score / 88));
  }
  function drawAnalysis(k) {
    top(1);
    rr(40, 78, 360, 516, 12, UI.side);
    ctx.fillStyle = UI.dim; ctx.font = F(700, 17); ctx.fillText('SCORE ATS', 70, 116);
    gauge(220, 280, 110, 92, 20, 72);
    ctx.font = F(700, 24); ctx.fillStyle = UI.accentInk; ctx.textAlign = 'center'; ctx.fillText('Excellent', 220, 450); ctx.textAlign = 'left';
    ctx.font = F(400, 19); ctx.fillStyle = UI.dim; ctx.textAlign = 'center'; ctx.fillText('Mieux que 86 % des CV', 220, 480); ctx.textAlign = 'left';
    const e = smooth(0, 0.45, k);
    [['Mots-clés', 0.88], ['Structure', 0.95], ['Lisibilité', 0.9], ['Mise en forme', 0.94]].forEach(([l, v], i) => bar(440, 116 + i * 52, 540, l, v * e));
    ctx.fillStyle = UI.ink; ctx.font = F(700, 19); ctx.fillText('Points forts', 440, 350);
    ['Titre clair et ciblé', 'Compétences alignées sur le poste', 'Mise en page lisible par les robots'].forEach((l, i) => {
      if (k < 0.35 + i * 0.12) return; tick(442, 382 + i * 36, 16, UI.accent); ctx.fillStyle = UI.ink; ctx.font = F(400, 19); ctx.fillText(l, 472, 388 + i * 36);
    });
    if (k > 0.8) { ctx.fillStyle = UI.ink; ctx.font = F(700, 19); ctx.fillText('À améliorer', 440, 520); rr(440, 536, 540, 40, 10, UI.warnSoft); ctx.fillStyle = UI.warnInk; ctx.font = F(600, 18); ctx.fillText('Ajoutez des résultats chiffrés à chaque expérience', 458, 562); }
  }
  const KEYWORDS = ['React', 'TypeScript', 'Accessibilité', 'Tests E2E', 'Design system', 'Figma', 'CI/CD'];
  function drawOffer(k) {
    top(2);
    const matched = 4 + Math.min(3, Math.floor(k * 3.999));
    rr(40, 78, 600, 516, 12, UI.side);
    ctx.fillStyle = UI.dim; ctx.font = F(700, 17); ctx.fillText("OFFRE D'EMPLOI", 70, 116);
    ctx.fillStyle = UI.ink; ctx.font = F(700, 30); ctx.fillText('Développeur·se Front-end', 70, 158);
    ctx.fillStyle = UI.dim; ctx.font = F(400, 18); ctx.fillText('Atelier Kumo · Lyon · CDI · Hybride', 70, 188);
    ctx.fillStyle = UI.ink; ctx.font = F(700, 18); ctx.fillText('Mots-clés attendus', 70, 244);
    let x = 70, y = 266;
    KEYWORDS.forEach((kw, i) => {
      ctx.font = F(600, 18); const ok = i < matched, w = ctx.measureText(kw).width + (ok ? 60 : 36);
      if (x + w > 610) { x = 70; y += 52; }
      rr(x, y, w, 38, 19, ok ? UI.accentSoft : UI.warnSoft);
      if (ok) tick(x + 16, y + 20, 14, UI.accent, 2.5);
      ctx.fillStyle = ok ? UI.accentInk : UI.warnInk; ctx.fillText(kw, x + (ok ? 40 : 18), y + 25); x += w + 10;
    });
    ctx.fillStyle = UI.dim; ctx.font = F(400, 19);
    ctx.fillText(matched < 7 ? `${7 - matched} mot${7 - matched > 1 ? 's' : ''}-clé${7 - matched > 1 ? 's' : ''} à ajouter à votre CV` : 'Tous les mots-clés sont couverts', 70, 470);
    rr(670, 78, 314, 516, 12, UI.side);
    ctx.fillStyle = UI.dim; ctx.font = F(700, 17); ctx.fillText('CORRESPONDANCE', 700, 116);
    gauge(827, 260, 95, Math.round(62 + 25 * k), 18, 56, '%');
    ctx.fillStyle = UI.ink; ctx.font = F(600, 18); ctx.textAlign = 'center'; ctx.fillText(`${matched}/7 mots-clés`, 827, 420); ctx.textAlign = 'left';
  }
  function drawSent(k) {
    top(3);
    ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.strokeStyle = UI.track; ctx.beginPath(); ctx.arc(512, 230, 70, 0, 7); ctx.stroke();
    ctx.strokeStyle = UI.accent; ctx.beginPath(); ctx.arc(512, 230, 70, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * smooth(0, 0.6, k)); ctx.stroke();
    if (k > 0.55) tick(482, 232, 60, UI.accent, 10);
    center('Candidature envoyée', 370, F(700, 40), UI.ink);
    center('Atelier Kumo · Développeur·se Front-end', 410, F(400, 20), UI.dim);
    ctx.font = F(600, 18); const a = 'Score ATS 92', b = 'Correspondance 87 %', wa = ctx.measureText(a).width + 36, wb = ctx.measureText(b).width + 36, x0 = 512 - (wa + wb + 12) / 2;
    rr(x0, 446, wa, 40, 20, UI.accentSoft); rr(x0 + wa + 12, 446, wb, 40, 20, UI.accentSoft);
    ctx.fillStyle = UI.accentInk; ctx.fillText(a, x0 + 18, 472); ctx.fillText(b, x0 + wa + 30, 472);
  }
  let lastKey = '';
  function drawScreen(p, t) {
    let key, fn;
    if (p < 0.4) { const pr = clamp((p - 0.16) / 0.22), nc = Math.floor(TOTAL * pr), sc = Math.round(38 + 54 * pr), bl = Math.floor(t * 2) % 2 === 0; key = `e${nc}|${sc}|${bl}`; fn = () => drawEditor(nc, sc, bl); }
    else if (p < 0.62) { const k = Math.round(clamp((p - 0.42) / 0.12) * 60) / 60; key = `a${k}`; fn = () => drawAnalysis(k); }
    else if (p < 0.8) { const k = Math.round(clamp((p - 0.72) / 0.07) * 60) / 60; key = `o${k}`; fn = () => drawOffer(k); }
    else { const k = Math.round(clamp((p - 0.84) / 0.06) * 60) / 60; key = `s${k}`; fn = () => drawSent(k); }
    if (key !== lastKey) { lastKey = key; fn(); tex.needsUpdate = true; }
  }

  // ---------- avatar VRM (remplace le personnage en formes simples) ----------
  let AV = null;
  const _v = new THREE.Vector3();
  function attachAvatar(vrm) {
    vrm.scene.name = 'vrmAvatar'; vrm.scene.rotation.y = Math.PI;
    vrm.scene.traverse(o2 => { if (o2.isMesh) { o2.castShadow = true; o2.receiveShadow = true; o2.frustumCulled = false; } });
    root.add(vrm.scene); person.visible = false;
    AV = { vrm, n: k => vrm.humanoid.getNormalizedBoneNode(k), raw: k => vrm.humanoid.getRawBoneNode(k), placed: false };
  }
  function poseAvatar(reach, typing, toMug, lift, t, dt, blink, greet) {
    const { vrm, n } = AV, ph = S.typePhase;
    const set = (k, x, y, z) => { const b3 = n(k); if (b3) b3.rotation.set(x, y, z); };
    set('spine', 0.1 + reach * 0.08, 0, 0); set('chest', 0.04, 0, 0); set('upperChest', 0.02, 0, 0);
    [1, -1].forEach(sd => {
      const L = sd > 0 ? 'left' : 'right';
      set(L + 'UpperLeg', -1.52, 0, sd * 0.05); set(L + 'LowerLeg', 1.5, 0, 0); set(L + 'Foot', 0.05, 0, 0);
      let uz = -sd * (1.25 - reach * 0.05), uy = -sd * (0.2 + reach * 0.75), ux = 0, ly = -sd * (0.5 + reach * 0.55), lx = 0;
      if (sd > 0) { uy -= sd * toMug * 0.15; ly -= sd * (toMug * 0.5 + lift * 0.9); uz += sd * lift * 0.35; }
      const jig = typing * (sd > 0 ? 1 - toMug : 1);
      lx = Math.sin(ph + (sd > 0 ? 0 : 1.7)) * 0.06 * jig;
      set(L + 'UpperArm', ux, uy, uz); set(L + 'LowerArm', lx, ly, 0);
      set(L + 'Hand', Math.max(0, Math.sin(ph * 1.3 + sd)) * 0.18 * jig, 0, -sd * 0.1);
    });
    set('neck', -S.headPitch * 0.35, S.headYaw * 0.4, 0); set('head', -S.headPitch * 0.65, S.headYaw * 0.6, 0);
    const em = vrm.expressionManager; if (em) { em.setValue('blink', blink < 0.5 ? 1 : 0); em.setValue('happy', 0.22 + greet * 0.35); }
    vrm.update(dt);
    if (!AV.placed) {
      vrm.scene.updateMatrixWorld(true);
      const hips = AV.raw('hips'); if (hips) { hips.getWorldPosition(_v); vrm.scene.position.x += 0 - _v.x; vrm.scene.position.y += 0.6 - _v.y; vrm.scene.position.z += 0.66 - _v.z; }
      AV.placed = true; vrm.update(0);
    }
  }

  // ---------- animation ----------
  const S = { walkYaw: 0, walkSp: 0, swing: { yt: 0, ig: 0, tp: 0 }, spin: 0, lockOpen: false, lockK: 0, flagBoost: 0, printPh: 0.3, stackN: S0.stackN, typePhase: 0, tailPhase: 0, tailSpeed: 0, petT: 0, rustleT: 0, lampOn: true, catYaw: -0.3, catPitch: 0, headYaw: 0, headPitch: 0 };
  const tmp = new THREE.Vector3();
  function aim(parent, from, target) { const l = parent.worldToLocal(tmp.copy(target)).sub(from); return [Math.atan2(-l.x, -l.z), Math.atan2(l.y, Math.hypot(l.x, l.z))]; }
  const P_SCREEN = V(0, 1.08, -0.3), P_HANDS = V(0, 0.8, 0.13), P_BOARD = V(0.72, 1.45, -0.78), P_MOUTH = V(-0.03, 1.08, 0.34), P_THROW = V(0.12, 1.05, 0.05);

  function update({ p, vel = 0, t, dt, camPos, greet: greetIn = 0 }) {
    root.updateMatrixWorld();
    S.tailSpeed += (clamp(vel) - S.tailSpeed) * Math.min(1, dt * 2.5);
    S.petT = Math.max(0, S.petT - dt); S.rustleT = Math.max(0, S.rustleT - dt);
    const pet = clamp(S.petT / 1.4), rustle = clamp(S.rustleT);

    // bras : atteinte du clavier, frappe au scroll, gorgée de café, lancer de l'avion
    const reach = smooth(0.1, 0.18, p);
    const typeZone = Math.max(win(p, 0.15, 0.41), win(p, 0.72, 0.8));
    const typing = typeZone * clamp(vel * 1.4);
    S.typePhase += dt * (10 + 14 * typing);
    const toMug = smooth(0.44, 0.47, p) * (1 - smooth(0.53, 0.56, p));
    const lift = smooth(0.47, 0.49, p) * (1 - smooth(0.51, 0.53, p));
    const throwK = 0;
    const grip = mugHome.clone().add(V(0.066, 0.05, 0));
    arms.forEach((a, i) => {
      const H = a.rest.clone().lerp(a.key, reach), ph = S.typePhase + i * 1.7;
      H.y += Math.max(0, Math.sin(ph)) * 0.018 * typing;
      H.x += Math.sin(ph * 0.37 + i) * 0.03 * typing; H.z += Math.cos(ph * 0.29) * 0.012 * typing;
      if (a.s < 0) { H.lerp(grip, toMug); H.lerp(P_MOUTH, lift); } else H.lerp(P_THROW, throwK);
      solve(a, H);
    });
    if (toMug > 0.97 && !AV) { mug.rotation.set(lift * 0.85, 0, 0); mug.position.copy(arms[0].hd.position).sub(V(0.066, 0.05, 0).applyEuler(mug.rotation)); } else if (!AV) { mug.position.copy(mugHome); mug.rotation.x = 0; }

    // avion en papier
    const u = clamp((p - 0.81) / 0.09);
    plane.visible = false;
    if (plane.visible) {
      const pos = flight.getPoint(u); plane.position.copy(pos); plane.lookAt(flight.getPoint(Math.min(1, u + 0.02)));
      plane.rotateZ(Math.sin(u * 7) * 0.35); plane.scale.setScalar(1 - smooth(0.75, 1, u) * 0.85);
    }

    // tête du personnage
    let tgt = P_SCREEN.clone();
    const greet = Math.max(1 - smooth(0.04, 0.14, p), greetIn);
    if (camPos && greet > 0) tgt.lerp(camPos, greet);
    tgt.lerp(P_BOARD, win(p, 0.63, 0.7));
    if (plane.visible) tgt.lerp(plane.position, smooth(0.8, 0.82, p));
    if (pet > 0) tgt.lerp(cat.position.clone().add(V(0, 0.1, 0)), pet);
    let [hy, hp] = aim(person, headG.position, tgt);
    hy += (1 - reach) * 0.35 * Math.sin(t * 0.4); hp += lift * 0.3 + Math.sin(t * 1.3) * 0.02 + typing * Math.sin(S.typePhase * 0.5) * 0.02;
    S.headYaw += (clamp(hy, -1.1, 1.1) - S.headYaw) * Math.min(1, dt * 4); S.headPitch += (clamp(hp, -0.5, 0.6) - S.headPitch) * Math.min(1, dt * 4);
    headG.rotation.set(S.headPitch, S.headYaw, 0);
    torso.position.z = 0.6 - reach * 0.03; torso.rotation.x = -reach * 0.06 + win(p, 0.44, 0.6) * 0.09;

    // chat : regarde ce qui bouge, la queue suit le scroll (phase cumulée → pas d'à-coups)
    let ct = P_SCREEN.clone();
    if (camPos && greet > 0) ct.lerp(camPos, greet);
    if (typing > 0.05) ct.lerp(P_HANDS, clamp(typing * 2));
    if (plane.visible) ct.copy(plane.position);
    if (pet > 0 && camPos) ct.lerp(camPos, pet);
    const [cy, cp] = aim(cat, catHead.position, ct);
    S.catYaw += (clamp(cy, -1.3, 1.3) - S.catYaw) * Math.min(1, dt * 3); S.catPitch += (clamp(cp, -0.4, 0.7) - S.catPitch) * Math.min(1, dt * 3);
    catHead.rotation.set(S.catPitch + Math.sin(t * 0.8) * 0.04, S.catYaw, Math.sin(t * 0.6) * 0.05 + pet * 0.25);
    ears.forEach((e, i) => { e.rotation.z = -(i ? 1 : -1) * (0.3 + pet * 0.35 * Math.max(0, Math.sin(t * 18))); });
    catBody.scale.y = 0.7 + Math.sin(t * 2.2) * 0.015 + pet * 0.008 * Math.sin(t * 60);
    S.tailPhase += dt * (1.3 + S.tailSpeed * 6 + pet * 5);
    const amp = 0.035 + S.tailSpeed * 0.05 + pet * 0.04;
    tail.forEach((s, i) => { const k = i / 9, w = Math.sin(S.tailPhase - i * 0.55) * amp * k; s.position.set(0.09 + w + k * 0.04, 0.06 + Math.sin(k * 2.4) * (0.05 + pet * 0.05), 0.13 + k * 0.11); });

    { S.walkU = (S.walkU || 0); S.catSit = Math.max(0, (S.catSit || 0) - dt); const pace = 0.55 + 0.45 * Math.sin(t * 0.21); const want2 = S.catSit > 0 ? 0 : Math.max(0, pace - 0.25) / 0.75; S.walkSp += (want2 - S.walkSp) * Math.min(1, dt * 2.5); const sp = S.walkSp; S.walkU = (S.walkU + dt * 0.16 * sp / walkLen) % 1;
      const fu = S.walkU * 240, i0 = Math.floor(fu) % 240, fr = fu - Math.floor(fu), wp = _wp.copy(walkPts[i0]).lerp(walkPts[i0 + 1], fr), wt = _wt.copy(walkTan[i0]).lerp(walkTan[i0 + 1], fr); walker.position.set(wp.x, 0.02 + Math.abs(Math.sin(S.walkPh || 0)) * 0.006 * sp, wp.z); { const want = Math.atan2(-wt.x, -wt.z); let dA = want - S.walkYaw; dA = Math.atan2(Math.sin(dA), Math.cos(dA)); S.walkYaw += dA * Math.min(1, dt * 5); walker.rotation.y = S.walkYaw; }
      S.walkPh = (S.walkPh || 0) + dt * 9 * sp; wLegs.forEach((lg, i) => { lg.rotation.x = Math.sin(S.walkPh + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.55 * sp; });
      if (wHead) { const up = S.catSit > 0 ? 1 : 0; wHead.rotation.y = Math.sin(t * 0.7) * 0.35 * (1 - sp * 0.6) * (1 - up); wHead.rotation.x = Math.sin(t * 1.1) * 0.05 - up * 0.45; }
      if (wBody) wBody.scale.y = 0.7 + Math.sin(t * 2.2) * 0.012;
      wTail.forEach((s2, i) => { const k = i / 9; s2.position.set(Math.sin(t * 2.4 - i * 0.5) * 0.04 * k, 0.1 + k * 0.12 + Math.sin(k * 2.2) * 0.03, 0.14 + k * 0.05); }); }
    const blink = (t % 4.3) < 0.11 ? 0.12 : 1, catBlink = ((t + 1.7) % 5.1) < 0.12 || pet > 0.3 ? 0.15 : 1;
    eyes.forEach(e => { e.scale.y = blink; }); catEyes.forEach(e => { e.scale.y = catBlink; });
    if (AV) {
      poseAvatar(reach, typing, toMug, lift, t, dt, blink, greet);
      const hand = AV.raw('leftHand');
      if (hand && toMug > 0.6) { hand.getWorldPosition(_v); mug.position.copy(mugHome).lerp(_v.add(V(0.02, -0.08, -0.03)), smooth(0.6, 0.97, toMug)); mug.rotation.x = lift * 0.5; } else { mug.position.copy(mugHome); mug.rotation.x = 0; }
    }
    // décor : horloge, lumière du jour, lampe, vapeur, plante, rideaux, poussière
    hourHand.rotation.z = -((9 + p * 9) / 12) * Math.PI * 2; minHand.rotation.z = -(p * 9) * Math.PI * 2;
    key.color.copy(MORNING).lerp(GOLDEN, p); key.intensity = 2.3 - p * 0.4; hemi.intensity = 1.45 - p * 0.3;
    mat.window.color.copy(WHITE).lerp(WARM, p); beamMat.opacity = 0.1 + p * 0.05; beamMat.color.copy(MORNING).lerp(GOLDEN, p);
    S.flagBoost = Math.max(0, S.flagBoost - dt * 0.6);
    { const pa = flagGeo.attributes.position, fb = 1 + S.flagBoost * 3; for (let i = 0; i < pa.count; i++) { const x0 = flagBase0[i * 3], k = (x0 + 0.05) / 0.1; pa.setZ(i, Math.sin(t * 3 * (1 + S.flagBoost) + x0 * 60) * 0.006 * k * fb); } pa.needsUpdate = true; }
    [[ytF, 'yt'], [igF, 'ig'], [tpF, 'tp']].forEach(([g4, k]) => { S.swing[k] = Math.max(0, S.swing[k] - dt * 0.9); g4.rotation.z = Math.sin(t * 11) * 0.14 * S.swing[k] * S.swing[k]; g4.scale.setScalar(1 + S.swing[k] * 0.06); });
    S.spin = Math.max(0, S.spin - dt * 0.7); trophy.rotation.y += dt * S.spin * 14; trophy.position.y = 0.0125 + Math.abs(Math.sin(S.spin * 9)) * 0.03 * S.spin;
    S.lockK += ((S.lockOpen ? 1 : 0) - S.lockK) * Math.min(1, dt * 6); shackle.position.y = 0.075 + S.lockK * 0.022; shackle.rotation.y = S.lockK * 1.1; lockBody.color.set(S.lockOpen ? '#9aa3ab' : '#c9a24a');
    bulbs.forEach((b2, i) => { b2.material.color.setHSL(0.11, 1, 0.72 + Math.sin(t * 2 + i * 1.7) * 0.08); });
    lampLight.intensity = S.lampOn ? 0.5 + p * 0.6 + Math.sin(t * 13) * 0.02 : 0; if (S.lampOn) bulbMat.color.copy(BULB); else bulbMat.color.set('#6a6a6a');
    steam.forEach((s, i) => { const f = (t * 0.22 + i / 6) % 1; s.position.set(Math.sin(t * 1.3 + i * 2) * 0.018 * (0.4 + f), 0.1 + f * 0.26, Math.cos(t + i) * 0.008); s.scale.setScalar(0.5 + f * 1.3); s.material.opacity = (toMug > 0.5 ? 0.05 : 0.16) * Math.sin(Math.PI * f); });
    leaves.forEach((l, i) => { l.rotation.z = l.userData.rz + Math.sin(t * 0.7 + i) * 0.04 + rustle * Math.sin(t * 22 + i) * 0.15; });
    curtains.forEach((c, i) => { c.rotation.z = Math.sin(t * 0.6 + i) * 0.02; });
    cloudTex.offset.x = t * 0.004 + p * 0.25;
    vines.forEach((v, i) => { v.rotation.x = Math.sin(t * 0.5 + i) * 0.05; v.rotation.z = Math.cos(t * 0.4 + i * 1.3) * 0.05; });
    const da = dust.geometry.attributes.position;
    for (let i = 0; i < da.count; i++) { let y = da.getY(i) + dt * 0.03; if (y > 2.1) y = 0.3; da.setY(i, y); da.setX(i, da.getX(i) + Math.sin(t * 0.5 + i) * dt * 0.01); }
    da.needsUpdate = true;
    // imprimante 3D
    S.printPh += dt * (0.16 + vel * 0.5);
    if (S.printPh >= 1) { S.printPh -= 1; S.stackN = S.stackN >= stack.length ? 1 : S.stackN + 1; stack.forEach((s, i) => { s.visible = i < S.stackN; }); }
    const pk = S.printPh, grow = clamp(pk / 0.72), out = clamp((pk - 0.76) / 0.24);
    printing.visible = pk < 0.76; printing.scale.z = Math.max(0.02, grow); printing.position.z = -SHD / 2 + SHD * grow / 2;
    gantry.position.z = -SHD / 2 + SHD * grow; pHead.position.x = pk < 0.72 ? Math.sin(t * 11) * SHW * 0.45 : 0; nozzle.material.color.set(pk < 0.72 ? '#ff9a3c' : '#9a8a7a');
    ejecting.visible = pk >= 0.76;
    if (ejecting.visible) { const e = out * out * (3 - 2 * out); ejecting.position.set(0, 0.057 + Math.sin(Math.PI * e) * 0.04 - e * 0.03 + (S.stackN) * 0.0045 * e, e * (PD / 2 + 0.13)); ejecting.rotation.x = -Math.sin(Math.PI * e) * 0.25; }
    lcd.material.color.set(pk < 0.72 && Math.floor(t * 2) % 2 ? '#c8f0cd' : '#9fe0a8');
    drawScreen(p, t);
    screenGlow.intensity = 0.4 + typing * 0.3;
  }

  // plans de caméra
  const SHOTS = [
    [0.00, [1.5, 1.3, -0.2], [0.15, 1.1, 0.8]],
    [0.14, [0.9, 1.62, 1.05], [-0.05, 1.05, -0.25]],
    [0.30, [0.52, 1.32, 0.8], [0.0, 1.07, -0.3]],
    [0.50, [0.44, 1.3, 0.7], [0.0, 1.08, -0.3]],
    [0.70, [0.52, 1.32, 0.76], [0.0, 1.08, -0.3]],
    [0.88, [0.44, 1.28, 0.68], [0.0, 1.08, -0.3]],
    [1.00, [0.0, 1.08, 0.3], [0.0, 1.08, -0.3]]
  ].map(([p, a, b]) => [p, V(...a), V(...b)]);
  function camera(p) {
    let i = 0; while (i < SHOTS.length - 2 && p > SHOTS[i + 1][0]) i++;
    const [p0, a0, b0] = SHOTS[i], [p1, a1, b1] = SHOTS[i + 1], k = smooth(p0, p1, p);
    return { position: a0.clone().lerp(a1, k), target: b0.clone().lerp(b1, k), offset: 1 - smooth(0.9, 0.99, p) };
  }

  const pickables = [
    { action: 'ouvrir', object: monitor }, { action: 'comparer', object: board }, { action: 'chat', object: cat },
    { action: 'cafe', object: mug }, { action: 'lampe', object: lamp }, { action: 'plante', object: plant }, { action: 'printer', object: printer }, { action: 'chatBalade', object: walker }, { action: 'youtube', object: ytF }, { action: 'instagram', object: igF }, { action: 'trust', object: tpF }, { action: 'trophee', object: trophy }, { action: 'cadenas', object: lock }, { action: 'drapeau', object: flag }, { action: 'etagere', object: wShelf }
  ];
  const anchors = { ouvrir: V(0, 1.34, -0.3), comparer: V(0.72, 1.72, -0.78), chat: V(-0.74, 1.0, 0.04), cafe: V(-0.34, 0.92, 0.2), printer: V(1.12, 1.0, -0.56) };
  function react(action) {
    if (action === 'chat') S.petT = 1.6;
    if (action === 'lampe') S.lampOn = !S.lampOn;
    if (action === 'plante') S.rustleT = 1;
    if (action === 'printer') S.printPh = Math.max(S.printPh, 0.74);
    if (action === 'youtube') S.swing.yt = 1;
    if (action === 'instagram') S.swing.ig = 1;
    if (action === 'trust') S.swing.tp = 1;
    if (action === 'trophee') S.spin = 1;
    if (action === 'chatBalade') S.catSit = 2.5;
    if (action === 'cadenas') S.lockOpen = !S.lockOpen;
    if (action === 'drapeau') S.flagBoost = 1.5;
  }

  function theme(R) {
    for (const k in mat) { if (k === 'window') continue; const c = (R.mats || {})[k] || (k === 'floor' || k === 'wall' ? '#ffffff' : C[k]); if (c) mat[k].color.set(c); }
    MORNING.set(R.morning); GOLDEN.set(R.golden); WHITE.set(R.window); WARM.set(R.warm); BULB.set(R.bulb);
    hemi.color.set(R.hemiSky); hemi.groundColor.set(R.hemiGround); lampLight.color.set(R.bulb);
    Object.assign(UI, UI0, R.ui || {}); lastKey = '';
  }
  update({ p: 0, vel: 0, t: 0, dt: 0 });
  return { group: root, update, camera, pickables, anchors, react, theme, attachAvatar };
}
