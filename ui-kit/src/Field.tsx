import type { ReactNode } from "react";

export type FieldProps = {
  /** Intitulé du champ, affiché en petites capitales espacées. */
  label: string;
  children: ReactNode;
};

/**
 * Étiquette de champ de formulaire, au-dessus d'un `Input`, `Textarea` ou tout autre
 * contrôle.
 *
 * @example
 * <Field label="Nom complet"><Input placeholder="Votre nom" /></Field>
 */
export function Field({ label, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-[var(--ff-mono)] font-medium uppercase tracking-[0.08em] text-[var(--text-faint)]">{label}</span>
      {children}
    </label>
  );
}
