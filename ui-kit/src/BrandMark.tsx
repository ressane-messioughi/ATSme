export type BrandMarkProps = {
  /** Diamètre en pixels. */
  size?: number;
  /** Couleur principale — typiquement la couleur d'accent du thème actif. */
  accent?: string;
  className?: string;
};

/**
 * Repère de marque statique — un dégradé circulaire aux couleurs d'ATSme. Utilisée à
 * la place de l'entité 3D animée (BrandOrb, qui vit dans le code de l'app mais pas dans
 * ce design system — voir NOTES.md) partout où une version simple, toujours stable,
 * suffit : barre latérale, écrans de connexion, fil d'Ariane.
 *
 * @example
 * <BrandMark size={30} />
 * <BrandMark size={72} accent="#10b981" />
 */
export function BrandMark({ size = 40, accent = "#7c3aed", className = "" }: BrandMarkProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "9999px",
        background: `radial-gradient(circle at 32% 28%, ${accent}, ${accent} 55%, #4c1d95 100%)`,
        flexShrink: 0,
      }}
    />
  );
}
