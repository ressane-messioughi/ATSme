// Contrepartie présentationnelle de frontend/src/pages/ComingSoon.tsx — déjà purement
// présentationnel à l'origine (aucune donnée réseau, aucun routeur), portée ici quasiment
// telle quelle.
export type ComingSoonScreenProps = {
  title?: string;
  description?: string;
};

/**
 * Emplacement réservé pour une fonctionnalité pas encore construite.
 *
 * @example
 * <ComingSoonScreen title="Lettres de motivation" description="Bientôt disponible." />
 */
export function ComingSoonScreen({
  title = "Bientôt disponible",
  description = "Cette fonctionnalité arrive prochainement.",
}: ComingSoonScreenProps) {
  return (
    <div className="max-w-2xl">
      <p className="font-[var(--ff-mono)] text-xs uppercase tracking-widest text-[var(--violet-soft)] mb-2">{title}</p>
      <h1 className="text-2xl font-bold mb-3">{title}</h1>
      <div className="border border-dashed border-[var(--border)] rounded-xl px-6 py-10">
        <p className="text-sm text-[var(--text-dim)]">{description}</p>
      </div>
    </div>
  );
}
