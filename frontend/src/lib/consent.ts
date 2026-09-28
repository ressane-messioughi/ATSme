// ATSme ne dépose aucun cookie ni traceur tiers (pas de publicité, pas d'analytics) : le
// bandeau est donc une information, pas un choix à arbitrer entre plusieurs traceurs — voir
// pages/Confidentialite.tsx pour le détail exact de ce qui est stocké et pourquoi.
const KEY = "atsme-cookie-consent";

export function hasSeenCookieNotice(): boolean {
  try {
    return localStorage.getItem(KEY) === "seen";
  } catch {
    return true; // stockage indisponible : ne pas bloquer l'affichage sur cette erreur
  }
}

export function markCookieNoticeSeen() {
  try {
    localStorage.setItem(KEY, "seen");
  } catch {
    /* navigation privée ou stockage désactivé — le bandeau réapparaîtra, sans conséquence */
  }
}
