import { NavLink, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth.tsx";
import { IconBriefcase, IconChart, IconDashboard, IconFile, IconLogo } from "./icons.tsx";

const items = [
  { to: "/admin", label: "Vue d'ensemble", end: true, icon: IconDashboard },
  { to: "/admin/utilisateurs", label: "Utilisateurs", icon: IconFile },
  { to: "/admin/cv", label: "CV", icon: IconChart },
];

export default function AdminShell() {
  const { user, loading, logout } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/connexion" replace />;
  if (!user.is_admin) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <aside className="w-60 shrink-0 flex flex-col border-r border-[var(--border)] px-4 py-6">
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <span className="w-7 h-7 p-1.5 rounded-lg bg-gradient-to-br from-[var(--violet)] to-[var(--violet-soft)] text-white shadow-[0_4px_14px_var(--violet-glow)]">
            <IconLogo />
          </span>
          <div>
            <p className="font-[var(--ff-display)] font-bold text-[15px] tracking-tight leading-none">ATSme</p>
            <p className="text-[10px] font-[var(--ff-mono)] uppercase tracking-widest text-[var(--violet-soft)] mt-0.5">Admin</p>
          </div>
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
        <NavLink to="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-dim)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors mb-1">
          <IconBriefcase />
          Retour à l'app
        </NavLink>
        <button
          onClick={logout}
          className="text-xs font-[var(--ff-mono)] border border-[var(--border)] rounded-md px-3 py-1.5 text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--violet-soft)] transition-colors cursor-pointer"
        >
          Déconnexion
        </button>
      </aside>
      <main className="flex-1 px-6 md:px-10 py-8 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
