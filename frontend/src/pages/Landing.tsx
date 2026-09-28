import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme3D, THEMES3D, type Theme3DId } from "../lib/theme3d.ts";

// Accueil 3D : page statique livrée telle quelle dans public/accueil/ (three.js autonome,
// voir design_handoff_atsme_3d/PROMPT_CLAUDE_CODE.md — "l'accueil 3D se copie, il ne se
// réécrit pas"). Ce composant ne fait que l'embarquer en iframe et relayer les deux
// messages qu'elle émet : le changement de route (bouton de l'écran final) et le
// changement de thème (barre de thèmes en haut à droite).
const ROUTES: Record<string, string> = {
  login: "/connexion",
  register: "/inscription",
  dashboard: "/dashboard",
};

// L'accueil positionne ses sections de texte en JS (top calculé dans placeSections(), pas
// en CSS) une fois le DOM prêt puis une seconde fois après le chargement des polices — un
// bref instant, tout s'empile en haut à gauche avant ce calcul. On ne peut pas corriger ça
// dans accueil/index.html (copié tel quel, non modifiable) : on masque l'iframe le temps
// qu'elle se stabilise, fond uni de la couleur du thème actif pendant l'attente.
const REVEAL_DELAY_MS = 450;

export default function Landing() {
  const navigate = useNavigate();
  const { setTheme } = useTheme3D();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const d = e.data || {};
      if (d.type === "atsme-navigate" && ROUTES[d.route]) navigate(ROUTES[d.route]);
      if (d.type === "atsme-theme" && d.theme in THEMES3D) setTheme(d.theme as Theme3DId);
    }
    addEventListener("message", onMessage);
    return () => removeEventListener("message", onMessage);
  }, [navigate, setTheme]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--t-bg)" }}>
      <iframe
        src="/accueil/index.html?embed=1"
        title="ATSme — accueil"
        onLoad={() => setTimeout(() => setReady(true), REVEAL_DELAY_MS)}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          border: 0,
          display: "block",
          opacity: ready ? 1 : 0,
          transition: "opacity .25s ease",
        }}
      />
    </div>
  );
}
