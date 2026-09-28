import { useEffect } from "react";
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

export default function Landing() {
  const navigate = useNavigate();
  const { setTheme } = useTheme3D();

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
    <iframe
      src="/accueil/index.html?embed=1"
      title="ATSme — accueil"
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", border: 0, display: "block" }}
    />
  );
}
