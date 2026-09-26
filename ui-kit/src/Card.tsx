import type { HTMLAttributes, ReactNode } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  /** Rend la carte interactive : bordure et légère élévation au survol. */
  interactive?: boolean;
};

/**
 * Carte de fond, unité de base de presque tous les panneaux d'ATSme.
 *
 * @example
 * <Card className="p-5"><p>Contenu</p></Card>
 * <Card interactive className="p-4">Cliquable</Card>
 */
export function Card({ interactive = false, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`bg-[var(--surface)] border border-[var(--border)] rounded-xl transition-colors duration-150 ${
        interactive ? "rise hover:border-[var(--violet-soft)]" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
