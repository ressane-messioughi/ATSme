import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { hasSeenCookieNotice, markCookieNoticeSeen } from "../lib/consent.ts";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!hasSeenCookieNotice());
  }, []);

  if (!visible) return null;

  function dismiss() {
    markCookieNoticeSeen();
    setVisible(false);
  }

  return (
    <>
      {/* Élément réel dans le flux normal (pas du padding sur body/#root, coincés à
          height:100% par index.css) : réserve la place que le bandeau (position fixed)
          occupe, sinon il recouvre la fin des pages assez longues pour défiler. */}
      <div aria-hidden="true" style={{ height: 140, background: "var(--t-bg)" }} />
      <div
        role="region"
        aria-label="Information sur les cookies"
        className="fixed left-0 right-0 bottom-0 z-[200] flex justify-center px-4 pb-4"
      >
        <div
          className="w-full flex flex-wrap items-center gap-4 p-5 rounded-[var(--t-r-lg)]"
          style={{
            maxWidth: 720,
            background: "var(--t-surface)",
            border: "1px solid var(--t-line-soft)",
            boxShadow: "0 12px 30px -12px rgba(0,0,0,.35)",
            color: "var(--t-ink)",
          }}
        >
          <div className="flex-1 min-w-[220px]">
            <p className="font-black text-base m-0" style={{ fontFamily: "var(--t-display)" }}>
              Aucun cookie de suivi
            </p>
            <p className="text-sm mt-1.5 mb-0" style={{ color: "var(--t-ink2)" }}>
              ATSme ne dépose ni cookie publicitaire ni traceur tiers. Nous gardons juste, sur votre appareil, de quoi
              vous garder connecté·e et retenir vos préférences (thème, dernier modèle choisi).{" "}
              <Link to="/confidentialite" className="font-semibold underline underline-offset-[3px]" style={{ color: "var(--t-accent)" }}>
                En savoir plus
              </Link>
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 inline-flex items-center justify-center min-h-11 px-5 rounded-[var(--t-r-md)] font-semibold text-[15px] cursor-pointer"
            style={{ border: "1.5px solid var(--t-line)", background: "var(--t-accent)", color: "var(--t-on-accent)", boxShadow: "0 2px 0 var(--t-shadow)" }}
          >
            J'ai compris
          </button>
        </div>
      </div>
    </>
  );
}
