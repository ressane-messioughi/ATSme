import type { ReactNode } from "react";
import { BrandMark } from "./BrandMark.js";
import { IconBriefcase, IconChart, IconDashboard, IconFile } from "./screens/icons.js";

export type AdminFrameActiveKey = "dashboard" | "utilisateurs" | "cv";

const NAV_ITEMS: { key: AdminFrameActiveKey; label: string; icon: typeof IconDashboard }[] = [
  { key: "dashboard", label: "Vue d'ensemble", icon: IconDashboard },
  { key: "utilisateurs", label: "Utilisateurs", icon: IconFile },
  { key: "cv", label: "CV", icon: IconChart },
];

export type AdminFrameProps = {
  active: AdminFrameActiveKey;
  onNavigate?: (key: AdminFrameActiveKey) => void;
  /** Appelé quand "Retour à l'app" est cliqué. */
  onExit?: () => void;
  onLogout?: () => void;
  children: ReactNode;
};

/**
 * Ossature du panneau d'administration : barre latérale dédiée (distincte de `AppFrame`,
 * pas de retour visuel possible avec l'espace utilisateur) + zone de contenu.
 *
 * @example
 * <AdminFrame active="dashboard">
 *   <p>Contenu admin</p>
 * </AdminFrame>
 */
export function AdminFrame({ active, onNavigate, onExit, onLogout, children }: AdminFrameProps) {
  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <aside className="w-60 shrink-0 flex flex-col border-r border-[var(--border)] px-4 py-6">
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <BrandMark size={28} className="shadow-[0_4px_14px_var(--violet-glow)]" />
          <div>
            <p className="font-[var(--ff-display)] font-bold text-[15px] tracking-tight leading-none">ATSme</p>
            <p className="text-[10px] font-[var(--ff-mono)] uppercase tracking-widest text-[var(--violet-soft)] mt-0.5">Admin</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate?.(item.key)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer text-left ${
                active === item.key
                  ? "bg-[var(--violet-glow)] text-[var(--violet-soft)] font-medium"
                  : "text-[var(--text-dim)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              }`}
            >
              <item.icon />
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={onExit}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-dim)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors mb-1 cursor-pointer text-left"
        >
          <IconBriefcase />
          Retour à l'app
        </button>
        <button
          onClick={onLogout}
          className="text-xs font-[var(--ff-mono)] border border-[var(--border)] rounded-md px-3 py-1.5 text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--violet-soft)] transition-colors cursor-pointer"
        >
          Déconnexion
        </button>
      </aside>
      <main className="flex-1 px-6 md:px-10 py-8 min-w-0">{children}</main>
    </div>
  );
}
