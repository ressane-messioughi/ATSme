import { NavLink } from "react-router-dom";
import { useAuth } from "../lib/auth.tsx";
import {
  IconBriefcase,
  IconChart,
  IconDashboard,
  IconFile,
  IconHistory,
  IconLogo,
  IconPlusCircle,
  IconSettings,
  IconLayers,
} from "./icons.tsx";

const items = [
  { to: "/", label: "Tableau de bord", end: true, icon: IconDashboard },
  { to: "/cv", label: "Mes CV", icon: IconFile },
  { to: "/cv/nouveau", label: "Nouveau CV", icon: IconPlusCircle },
  { to: "/templates", label: "Templates", icon: IconLayers },
  { to: "/analyse", label: "Analyse ATS", icon: IconChart },
  { to: "/offres", label: "Offres d'emploi", icon: IconBriefcase },
  { to: "/historique", label: "Historique", icon: IconHistory },
  { to: "/parametres", label: "Paramètres", icon: IconSettings },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[var(--border)] px-4 py-6">
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <span className="w-7 h-7 p-1.5 rounded-lg bg-gradient-to-br from-[var(--violet)] to-[var(--violet-soft)] text-white shadow-[0_4px_14px_var(--violet-glow)]">
          <IconLogo />
        </span>
        <span className="font-[var(--ff-display)] font-bold text-[15px] tracking-tight">ATSme</span>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[var(--violet-glow)] text-[var(--violet-soft)] font-medium"
                  : "text-[var(--text-dim)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              }`
            }
          >
            <item.icon />
            {item.label}
          </NavLink>
        ))}
      </nav>
      {Boolean(user?.is_admin) && (
        <NavLink
          to="/admin"
          className="flex items-center gap-2.5 px-3 py-2 mb-2 rounded-lg text-sm text-[var(--violet-soft)] hover:bg-[var(--violet-glow)] transition-colors font-[var(--ff-mono)] text-xs uppercase tracking-wider"
        >
          Panel admin
        </NavLink>
      )}
      <div className="flex items-center gap-2.5 px-2 pt-4 border-t border-[var(--border)]">
        <span className="w-8 h-8 rounded-full bg-[var(--violet-glow)] text-[var(--violet-soft)] grid place-items-center text-xs font-semibold shrink-0">
          {user?.name?.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate">{user?.name}</p>
          <p className="text-[11px] text-[var(--text-faint)] truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          title="Déconnexion"
          className="text-[var(--text-faint)] hover:text-[var(--danger)] transition-colors cursor-pointer shrink-0 p-1"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
