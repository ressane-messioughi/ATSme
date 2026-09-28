import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { hasSeenCookieNotice, markCookieNoticeSeen } from "../lib/consent.ts";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [cardHeight, setCardHeight] = useState(140);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(!hasSeenCookieNotice());
  }, []);

  // Le bandeau passe de 1 ligne (desktop) à un empilement de 3 blocs (mobile étroit) :
  // sa hauteur réelle varie beaucoup selon la largeur, donc on la mesure au lieu de la
  // figer, sinon le spacer réserve trop peu de place et le bandeau recouvre un bouton
  // situé en bas d'une page courte (ex. connexion) sans que la page ne puisse défiler.
  useEffect(() => {
    if (!visible || !cardRef.current) return;
    const el = cardRef.current;
    const update = () => setCardHeight(el.offsetHeight + 16);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    addEventListener("resize", update);
    return () => {
      ro.disconnect();
      removeEventListener("resize", update);
    };
  }, [visible]);

  if (!visible) return null;

  function dismiss() {
    markCookieNoticeSeen();
    setVisible(false);
  }

  return (
    <>
      {/* Élément réel dans le flux normal (pas du padding sur body/#root, coincés à
          height:100% par index.css) : réserve la place que le bandeau (position fixed)
          occupe, sinon il recouvre la fin des pages assez longues pour défiler. Hauteur
          mesurée dynamiquement (cf. useEffect ci-dessus). */}
      <div aria-hidden="true" style={{ height: cardHeight, background: "var(--t-bg)" }} />
      <div
        role="region"
        aria-label="Information sur les cookies"
        className="fixed left-0 right-0 bottom-0 z-[200] flex justify-center px-4 pb-4"
      >
        <div
          ref={cardRef}
          className="w-full flex flex-wrap items-center gap-4 p-5 rounded-[var(--t-r-lg)]"
          style={{
            maxWidth: 720,
            background: "var(--t-surface)",
            border: "1px solid var(--t-line-soft)",
            boxShadow: "0 12px 30px -12px rgba(0,0,0,.35)",
            color: "var(--t-ink)",
          }}
        >
          <iframe
            src="/accueil/companion.html?o=cat"
            title=""
            aria-hidden="true"
            tabIndex={-1}
            style={{ width: 72, height: 72, border: 0, flex: "none", pointerEvents: "none" }}
          />
          <div className="flex-1 min-w-[220px]">
            <p className="font-black text-base m-0" style={{ fontFamily: "var(--t-display)" }}>
              Aucun cookie de suivi
            </p>
            <p className="text-sm mt-1.5 mb-0" style={{ color: "var(--t-ink2)" }}>
              ATSme ne dépose ni cookie publicitaire ni traceur tiers. Sur votre appareil, nous gardons seulement de
              quoi vous garder connecté·e (essentiel) et retenir vos préférences : thème, dernier modèle choisi
              (confort). La page charge aussi ses polices d'écriture depuis Google Fonts, une requête tierce classique
              au chargement.{" "}
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
