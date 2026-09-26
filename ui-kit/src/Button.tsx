import type { ButtonHTMLAttributes, ReactNode } from "react";

const VARIANTS = {
  primary:
    "bg-[var(--violet)] hover:bg-[var(--violet-soft)] text-white shadow-[0_2px_12px_-2px_var(--violet-glow)]",
  secondary: "bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--violet-soft)] text-[var(--text)]",
  ghost: "text-[var(--violet-soft)] hover:text-[var(--text)]",
  danger: "bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] hover:bg-[var(--danger)]/20",
} as const;

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Style visuel du bouton. `primary` pour l'action attendue, `secondary` pour une action
   * courante, `ghost` pour ce qui accompagne, `danger` pour ce qui détruit. */
  variant?: keyof typeof VARIANTS;
  /** Taille du bouton. */
  size?: keyof typeof SIZES;
  /** Icône ou élément affiché avant le texte. */
  icon?: ReactNode;
  children?: ReactNode;
};

/**
 * Bouton principal d'ATSme, dans ses quatre variantes.
 *
 * @example
 * <Button variant="primary" icon={<PlusIcon />}>Nouveau CV</Button>
 * <Button variant="secondary">Enregistrer</Button>
 * <Button variant="ghost" size="sm">Voir tout</Button>
 * <Button variant="danger">Supprimer</Button>
 */
export function Button({ variant = "primary", size = "md", icon, className = "", children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
