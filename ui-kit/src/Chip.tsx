import type { ReactNode } from "react";

export type ChipProps = {
  children: ReactNode;
  /** Fonction appelée quand la puce est retirée — sa présence affiche le bouton ×. */
  onRemove?: () => void;
};

/**
 * Puce violette, utilisée pour une compétence, un mot-clé ou toute valeur d'une liste
 * courte. Avec `onRemove`, affiche un bouton de suppression.
 *
 * @example
 * <Chip>React</Chip>
 * <Chip onRemove={() => {}}>TypeScript</Chip>
 */
export function Chip({ children, onRemove }: ChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[var(--violet-glow)] border border-[var(--violet-soft)]/25 text-[var(--violet-soft)] text-xs font-medium rounded-full pl-3 pr-1.5 py-1">
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Retirer"
          className="grid place-items-center w-4 h-4 rounded-full text-[var(--violet-soft)]/70 hover:text-white hover:bg-[var(--violet-soft)]/50 transition-colors cursor-pointer text-[13px] leading-none"
        >
          ×
        </button>
      )}
    </span>
  );
}
