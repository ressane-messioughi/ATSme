import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.tsx";
import { useTheme3D, THEMES3D, type Theme3DId } from "../lib/theme3d.ts";
import { Avatar } from "../lib/avatars.tsx";

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
  const { user } = useAuth();
  const { setTheme } = useTheme3D();
  const [ready, setReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const d = e.data || {};
      if (d.type === "atsme-navigate" && ROUTES[d.route]) navigate(ROUTES[d.route]);
      if (d.type === "atsme-theme" && d.theme in THEMES3D) setTheme(d.theme as Theme3DId);
    }
    addEventListener("message", onMessage);
    return () => removeEventListener("message", onMessage);
  }, [navigate, setTheme]);

  function onIframeLoad() {
    // L'accueil garde parfois le défilement d'une visite précédente (restauration de
    // scroll du navigateur, retour arrière) : on force le début de l'histoire à chaque
    // (re)chargement plutôt que de laisser l'utilisateur atterrir au milieu du récit.
    try {
      iframeRef.current?.contentWindow?.scrollTo(0, 0);
    } catch {
      // iframe same-origin normalement toujours accessible ; ignore silencieusement sinon.
    }
    setTimeout(() => setReady(true), REVEAL_DELAY_MS);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--t-bg)" }}>
      <iframe
        ref={iframeRef}
        src="/accueil/index.html?embed=1"
        title="Accueil ATSme"
        onLoad={onIframeLoad}
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

      {ready && user && (
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="fixed flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-[999px] cursor-pointer"
          style={{
            right: 18,
            bottom: 18,
            zIndex: 20,
            background: "var(--t-surface, #fbf6ea)",
            border: "1.5px solid var(--t-line, #dccdae)",
            color: "var(--t-ink, #3b2f25)",
            boxShadow: "0 6px 18px -8px rgba(0,0,0,.35)",
          }}
        >
          <Avatar avatar={user.avatar} name={user.name} size={26} />
          <span className="flex flex-col items-start leading-tight">
            <span className="font-semibold text-[13px]">Connecté·e · {user.name}</span>
            <span className="text-[11px] opacity-70">Aller au tableau de bord →</span>
          </span>
        </button>
      )}
    </div>
  );
}
