import type { ReactNode } from "react";
import { BrandMark } from "./BrandMark.js";
import {
  IconBriefcase,
  IconChart,
  IconDashboard,
  IconFile,
  IconHistory,
  IconLayers,
  IconPlusCircle,
  IconSettings,
} from "./screens/icons.js";

export type AppFrameActiveKey =
  | "dashboard"
  | "cv"
  | "nouveau"
  | "templates"
  | "analyse"
  | "offres"
  | "historique"
  | "parametres";

const NAV_ITEMS: { key: AppFrameActiveKey; label: string; icon: typeof IconDashboard }[] = [
  { key: "dashboard", label: "Tableau de bord", icon: IconDashboard },
  { key: "cv", label: "Mes CV", icon: IconFile },
  { key: "nouveau", label: "Nouveau CV", icon: IconPlusCircle },
  { key: "templates", label: "Templates", icon: IconLayers },
  { key: "analyse", label: "Analyse ATS", icon: IconChart },
  { key: "offres", label: "Offres d'emploi", icon: IconBriefcase },
  { key: "historique", label: "Historique", icon: IconHistory },
  { key: "parametres", label: "Paramètres", icon: IconSettings },
];

export type AppFrameProps = {
  /** Onglet actif dans la barre latérale. */
  active: AppFrameActiveKey;
  /** Nom et email affichés en bas de la barre latérale. */
  user?: { name: string; email: string };
  /** Appelé avec la clé de destination quand un lien de navigation est cliqué. */
  onNavigate?: (key: AppFrameActiveKey) => void;
  /** Appelé quand "Déconnexion" est cliqué. */
  onLogout?: () => void;
  children: ReactNode;
};

/**
 * Ossature commune à tout l'espace applicatif ATSme : barre latérale de navigation +
 * zone de contenu. Enveloppe chaque écran de l'app (Tableau de bord, Mes CV, Éditeur...).
 *
 * @example
 * <AppFrame active="dashboard" user={{ name: "Ressane", email: "ressane@example.com" }}>
 *   <p>Contenu de la page</p>
 * </AppFrame>
 */
export function AppFrame({ active, user, onNavigate, onLogout, children }: AppFrameProps) {
  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[var(--border)] px-4 py-6">
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <BrandMark size={30} className="shadow-[0_4px_14px_var(--violet-glow)]" />
          <span className="font-[var(--ff-display)] font-bold text-[15px] tracking-tight">ATSme</span>
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
        {user && (
          <div className="flex items-center gap-2.5 px-2 pt-4 border-t border-[var(--border)]">
            <span className="w-8 h-8 rounded-full bg-[var(--violet-glow)] text-[var(--violet-soft)] grid place-items-center text-xs font-semibold shrink-0">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{user.name}</p>
              <p className="text-[11px] text-[var(--text-faint)] truncate">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              title="Déconnexion"
              className="text-[var(--text-faint)] hover:text-[var(--danger)] transition-colors cursor-pointer shrink-0 p-1"
              aria-label="Déconnexion"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex md:hidden items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <span className="flex items-center gap-2">
            <BrandMark size={24} />
            <span className="font-[var(--ff-display)] font-bold text-sm">ATSme</span>
          </span>
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-xs font-[var(--ff-mono)] border border-[var(--border)] rounded-md px-3 py-1.5 text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--violet-soft)] transition-colors cursor-pointer"
            >
              Déconnexion
            </button>
          )}
        </header>
        <main className="flex-1 px-6 md:px-10 py-8">{children}</main>
      </div>
    </div>
  );
}
