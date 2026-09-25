import { Suspense, lazy, useEffect, useState } from "react";
import { THEME_ACCENT, useTheme } from "../lib/theme.ts";

const BrandOrbScene = lazy(() => import("./BrandOrbScene.tsx"));

// Repli statique pendant le chargement du chunk Three.js (ou si le rendu 3D échoue) :
// mêmes teintes que la scène réelle (et donc du thème actif), pour qu'il n'y ait jamais de
// flash ni de saut de mise en page en attendant que le WebGL prenne le relais.
function StaticFallback({ accent }: { accent: string }) {
  return (
    <div
      className="w-full h-full rounded-full"
      style={{ background: `radial-gradient(circle at 32% 28%, ${accent}, ${accent} 55%, #4c1d95 100%)` }}
    />
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

// L'entité emblématique d'ATSme : une petite présence 3D à la couleur du thème actif,
// déclinée en icône compacte dans la barre latérale et en pièce plus grande sur le
// tableau de bord. Volontairement discrète (pas d'icône de bouclier ou de coche dessinée
// en dur) : c'est le mouvement organique et le rendu qui portent l'identité, pas une
// forme figurative.
export default function BrandOrb({ size = 40, className = "" }: { size?: number; className?: string }) {
  const reduceMotion = usePrefersReducedMotion();
  const { theme } = useTheme();
  const { base, soft } = THEME_ACCENT[theme];

  return (
    <div className={className} style={{ width: size, height: size }}>
      <Suspense fallback={<StaticFallback accent={base} />}>
        <BrandOrbScene reduceMotion={reduceMotion} accent={base} accentSoft={soft} />
      </Suspense>
    </div>
  );
}
