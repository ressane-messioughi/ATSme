// Palettes 3D par thème de l'interface. Clés = noms de matériaux de la scène.
export const THEMES3D = {
  ghibli: { wood: '#c9945f', dark: '#5a4538', monitor: '#e7dcc3', cat: '#e8913f', catLight: '#fff1dc', eye: '#2a1d16', mug: '#f6efe0', coffee: '#6b4228', leaf: '#6fa75a', pot: '#c77b52', shade: '#fff4dc', paper: '#fbf5e6', paperFold: '#e9dcc0', notebook: '#4f7f52', bell: '#e8c14a', outline: '#4a3326', hemiSky: '#dff0ff', hemiGround: '#c9b58a', hemiI: 1.7, sun: '#ffe2b0', sunI: 2.2, lamp: '#ffc978', bulb: '#ffe2a8', scr: { bg: '#fbf6ea', bar: '#efe4cb', accent: '#4f7f52', ink: '#3b2f25', sub: '#6a5a49', label: '#8a7760', on: '#ffffff' } },
  cyber: { wood: '#1c1236', dark: '#2e1f52', monitor: '#120a24', cat: '#3a2c5c', catLight: '#8f7cc4', eye: '#05d9e8', mug: '#ff2a6d', coffee: '#1a0b2e', leaf: '#05d9e8', pot: '#ff2a6d', shade: '#fcee0a', paper: '#f3efff', paperFold: '#ff2a6d', notebook: '#fcee0a', bell: '#fcee0a', outline: '#ff2a6d', hemiSky: '#8a5cff', hemiGround: '#2a0a3a', hemiI: 1.4, sun: '#ff6ad5', sunI: 1.8, lamp: '#05d9e8', bulb: '#9ff6ff', scr: { bg: '#0a0614', bar: '#1d1233', accent: '#fcee0a', ink: '#f3efff', sub: '#cfc6ee', label: '#05d9e8', on: '#0a0614' } },
  tech: { wood: '#2d333b', dark: '#1c2128', monitor: '#22272e', cat: '#8b949e', catLight: '#d0d7de', eye: '#0d1117', mug: '#e6edf3', coffee: '#3a2a1e', leaf: '#3fb950', pot: '#30363d', shade: '#adbac7', paper: '#e6edf3', paperFold: '#8b949e', notebook: '#4c8dff', bell: '#d29922', outline: '#0b0e13', hemiSky: '#cfe3ff', hemiGround: '#3a4250', hemiI: 1.5, sun: '#ffffff', sunI: 1.9, lamp: '#9cc2ff', bulb: '#dbe9ff', scr: { bg: '#0d1117', bar: '#161b22', accent: '#4c8dff', ink: '#e6edf3', sub: '#9aa4ae', label: '#8b949e', on: '#0d1117' } },
  vinyle: { wood: '#282828', dark: '#181818', monitor: '#1f1f1f', cat: '#2b2b2b', catLight: '#b3b3b3', eye: '#1ed760', mug: '#1ed760', coffee: '#2a1a10', leaf: '#1ed760', pot: '#535353', shade: '#ffffff', paper: '#ffffff', paperFold: '#1ed760', notebook: '#1ed760', bell: '#e8c14a', outline: '#000000', hemiSky: '#e0ffe9', hemiGround: '#202020', hemiI: 1.5, sun: '#ffffff', sunI: 1.9, lamp: '#1ed760', bulb: '#b8ffd0', scr: { bg: '#121212', bar: '#181818', accent: '#1ed760', ink: '#ffffff', sub: '#b3b3b3', label: '#a7a7a7', on: '#000000' } }
};
export const themeName = () => { try { return localStorage.getItem('atsme-theme') || 'ghibli'; } catch (e) { return 'ghibli'; } };
const KEY = { edge: 'outline' };
// Recolore tous les matériaux nommés d'une scène selon la palette.
export function paintScene(scene, P) {
  scene.traverse(o => { const m = o.material; if (!m || !m.color) return; const k = KEY[m.name] || m.name; if (P[k]) m.color.set(P[k]); });
}

// Pièce complète (page d'accueil) : couleurs de matériaux, lumières, écran.
export const ROOM3D = {
  ghibli: { mats: {}, morning: '#fff0d0', golden: '#ffbe78', window: '#ffffff', warm: '#ffd2a0', hemiSky: '#cfe6ff', hemiGround: '#b9a57a', bg: '#efe4c8', bulb: '#ffe2a8',
    ui: { bg: '#fbf6ea', bar: '#efe4cb', side: '#f4ecd9', ink: '#3b2f25', dim: '#65543f', track: '#e4d7bb', accent: '#4f7f52', accentSoft: '#dfe9d6', accentInk: '#2f5a33', warn: '#b7771f', warnSoft: '#f6e3c6', warnInk: '#7a4e0e' } },
  cyber: { mats: { wood: '#3a2a5a', dark: '#2a1f45', floor: '#5a4a8a', wall: '#4a3a7a', chair: '#3a2a5a', shirt: '#2b2048', pants: '#1e1733', suitDark: '#15102a', tie: '#ff2a6d', cat: '#3a2c5c', catLight: '#8f7cc4', eye: '#05d9e8', leaf: '#05d9e8', pot: '#ff2a6d', curtain: '#6a3a8a', notebook: '#fcee0a', bell: '#fcee0a', mug: '#ff2a6d', shade: '#fcee0a', collar: '#fcee0a', catStripe: '#241a3e', cushion: '#ff2a6d' },
    morning: '#b58cff', golden: '#ff5fb0', window: '#7a5aff', warm: '#ff5fb0', hemiSky: '#8a5cff', hemiGround: '#2a0a3a', bg: '#0a0614', bulb: '#9ff6ff',
    ui: { bg: '#0a0614', bar: '#1d1233', side: '#140c24', ink: '#f3efff', dim: '#a89fd0', track: '#2a1d45', accent: '#fcee0a', accentSoft: '#2a2610', accentInk: '#fcee0a', warn: '#ff9f1c', warnSoft: '#3a2410', warnInk: '#ffc46b' } },
  tech: { mats: { wood: '#5a6270', dark: '#2d333b', floor: '#7a828e', wall: '#9aa4b2', chair: '#3a414b', shirt: '#2d333b', pants: '#2d333b', suitDark: '#1c2128', tie: '#4c8dff', cat: '#8b949e', catLight: '#d0d7de', leaf: '#3fb950', pot: '#30363d', curtain: '#aab4c2', notebook: '#4c8dff', bell: '#d29922', collar: '#4c8dff', catStripe: '#6e7681', cushion: '#30363d' },
    morning: '#e6f0ff', golden: '#c8d8ff', window: '#bcd4ff', warm: '#9fb8e8', hemiSky: '#cfe3ff', hemiGround: '#3a4250', bg: '#0d1117', bulb: '#dbe9ff',
    ui: { bg: '#0d1117', bar: '#161b22', side: '#161b22', ink: '#e6edf3', dim: '#8b949e', track: '#262c35', accent: '#4c8dff', accentSoft: '#16263f', accentInk: '#8fb8ff', warn: '#d29922', warnSoft: '#2b2211', warnInk: '#e8c068' } },
  vinyle: { mats: { wood: '#3a3a3a', dark: '#1a1a1a', floor: '#555555', wall: '#6a6a6a', chair: '#2a2a2a', shirt: '#262626', pants: '#262626', suitDark: '#141414', tie: '#1ed760', cat: '#2b2b2b', catLight: '#b3b3b3', eye: '#1ed760', leaf: '#1ed760', pot: '#535353', curtain: '#444444', notebook: '#1ed760', bell: '#e8c14a', mug: '#1ed760', collar: '#1ed760', catStripe: '#161616', cushion: '#2a2a2a' },
    morning: '#ffffff', golden: '#d8ffe6', window: '#9fe8b8', warm: '#6ad48e', hemiSky: '#e0ffe9', hemiGround: '#202020', bg: '#121212', bulb: '#b8ffd0',
    ui: { bg: '#121212', bar: '#181818', side: '#1e1e1e', ink: '#ffffff', dim: '#a7a7a7', track: '#3e3e3e', accent: '#1ed760', accentSoft: '#16331f', accentInk: '#1ed760', warn: '#f59b23', warnSoft: '#33240f', warnInk: '#f7b35a' } }
};

// Logo ATSme : la tête du chat de l'app (mêmes couleurs que le modèle 3D).
export const LOGO_PARTS = [["M5.2 15 L6.6 3.6 L14 9.4 Z","cat","ink",1.4],["M26.8 15 L25.4 3.6 L18 9.4 Z","cat","ink",1.4],["M7.6 11.6 L8.3 6.6 L11.9 9.6 Z","pink",null,0],["M24.4 11.6 L23.7 6.6 L20.1 9.6 Z","pink",null,0],["M3.8 18.4 A12.2 10.2 0 1 0 28.2 18.4 A12.2 10.2 0 1 0 3.8 18.4 Z","cat","ink",1.4],["M13.6 9.2 L14.2 12",null,"stripe",1.6],["M16 8.6 L16 12.4",null,"stripe",1.6],["M18.4 9.2 L17.8 12",null,"stripe",1.6],["M10.6 22.6 A5.4 3.7 0 1 0 21.4 22.6 A5.4 3.7 0 1 0 10.6 22.6 Z","light",null,0],["M9.2 17.4 A2.1 2.6 0 1 0 13.4 17.4 A2.1 2.6 0 1 0 9.2 17.4 Z","eye",null,0],["M18.6 17.4 A2.1 2.6 0 1 0 22.8 17.4 A2.1 2.6 0 1 0 18.6 17.4 Z","eye",null,0],["M11.3 16.4 A0.8 0.8 0 1 0 12.9 16.4 A0.8 0.8 0 1 0 11.3 16.4 Z","shine",null,0],["M20.7 16.4 A0.8 0.8 0 1 0 22.3 16.4 A0.8 0.8 0 1 0 20.7 16.4 Z","shine",null,0],["M14.8 20.9 L17.2 20.9 L16 22.2 Z","pink",null,0],["M16 22.2 Q15.2 23.6 13.8 23",null,"ink",0.9],["M16 22.2 Q16.8 23.6 18.2 23",null,"ink",0.9],["M8.6 26.2 Q16 30.4 23.4 26.2",null,"collar",2.2],["M14.4 29.3 A1.6 1.6 0 1 0 17.6 29.3 A1.6 1.6 0 1 0 14.4 29.3 Z","bell","ink",0.8]];
export function catLogo(ctx, x, y, size, P) {
  ctx.save(); ctx.translate(x, y); ctx.scale(size / 32, size / 32); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  LOGO_PARTS.forEach(([d, f, s, w]) => { const p = new Path2D(d); if (f) { ctx.fillStyle = f === 'shine' ? '#ffffff' : P[f]; ctx.fill(p); } if (s) { ctx.strokeStyle = P[s]; ctx.lineWidth = w; ctx.stroke(p); } });
  ctx.restore();
}
