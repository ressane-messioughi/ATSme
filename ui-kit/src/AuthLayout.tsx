import type { ReactNode } from "react";
import { BrandMark } from "./BrandMark.js";

export type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

/**
 * Carte centrée utilisée par les écrans de connexion et d'inscription — logo, titre,
 * sous-titre, puis le formulaire fourni en enfant.
 *
 * @example
 * <AuthLayout title="Bon retour" subtitle="Connectez-vous pour retrouver vos CV.">
 *   <p>Formulaire ici</p>
 * </AuthLayout>
 */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] grid place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <BrandMark size={34} className="shadow-[0_4px_14px_var(--violet-glow)]" />
          <span className="font-[var(--ff-display)] font-bold text-lg tracking-tight">ATSme</span>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-7 py-8 shadow-xl">
          <h1 className="text-xl font-bold mb-1.5">{title}</h1>
          <p className="text-sm text-[var(--text-dim)] mb-7">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
