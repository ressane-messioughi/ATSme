const TONES = {
  neutral: "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-dim)]",
  good: "bg-[var(--good)]/10 border-[var(--good)]/30 text-[var(--good)]",
  warn: "bg-[var(--warn)]/10 border-[var(--warn)]/30 text-[var(--warn)]",
  danger: "bg-[var(--danger)]/10 border-[var(--danger)]/30 text-[var(--danger)]",
  accent: "bg-[var(--violet-glow)] border-[var(--violet-soft)]/25 text-[var(--violet-soft)]",
} as const;

export type BadgeProps = {
  children: string;
  /** Couleur sémantique du badge. */
  tone?: keyof typeof TONES;
};

/**
 * Étiquette de statut compacte — un plan d'offre, un état de CV, une catégorie.
 *
 * @example
 * <Badge tone="good">Actif</Badge>
 * <Badge tone="warn">En attente</Badge>
 * <Badge tone="accent">Pro</Badge>
 */
export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${TONES[tone]}`}>{children}</span>
  );
}
