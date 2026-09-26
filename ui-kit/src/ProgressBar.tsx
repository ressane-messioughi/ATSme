const TONES = { good: "bg-[var(--good)]", warn: "bg-[var(--warn)]", danger: "bg-[var(--danger)]", accent: "bg-[var(--violet)]" } as const;

export type ProgressBarProps = {
  /** Valeur actuelle. */
  value: number;
  /** Valeur maximale — la barre se remplit à `value / max`. */
  max: number;
  tone?: keyof typeof TONES;
};

/**
 * Barre de progression fine et animée — utilisée pour le détail d'un score, une quota
 * d'offre, ou toute mesure sur une échelle bornée.
 *
 * @example
 * <ProgressBar value={7} max={10} tone="warn" />
 * <ProgressBar value={3} max={5} tone="accent" />
 */
export function ProgressBar({ value, max, tone = "accent" }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-[width] duration-500 ease-out ${TONES[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
