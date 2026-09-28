import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth.tsx";
import CatLogo from "./CatLogo.tsx";

function IconUsers({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={{ flex: "none" }}>
      <circle cx="9" cy="9" r="3.2" />
      <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
      <circle cx="16.5" cy="8" r="2.6" />
      <path d="M15.5 13.3c2.6-.3 4.6 1.5 5 4.7" />
    </svg>
  );
}
function IconGrid({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={{ flex: "none" }}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </svg>
  );
}
function IconFileStack({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={{ flex: "none" }}>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
      <path d="M10 13h6M10 17h6" />
    </svg>
  );
}

const ITEMS = [
  { to: "/admin", label: "Vue d'ensemble", end: true, icon: IconGrid },
  { to: "/admin/utilisateurs", label: "Utilisateurs", icon: IconUsers },
  { to: "/admin/cv", label: "CV déposés", icon: IconFileStack },
];

const CRUMBS: Record<string, string> = {
  "/admin": "Vue d'ensemble",
  "/admin/utilisateurs": "Utilisateurs",
  "/admin/cv": "CV déposés",
};

export default function AdminShell() {
  const { user, loading, logout } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    addEventListener("keydown", onKey);
    addEventListener("pointerdown", onClick);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("pointerdown", onClick);
    };
  }, []);

  if (loading) return null;
  if (!user) return <Navigate to="/connexion" replace />;
  if (!user.is_admin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex flex-wrap" style={{ background: "var(--t-bg)", color: "var(--t-ink)" }}>
      <a
        href="#contenu"
        className="fixed left-3 z-[100] px-4 py-3 rounded-[var(--t-r-md)] font-semibold text-[15px] focus:top-3"
        style={{ top: "-80px", background: "var(--t-accent)", color: "var(--t-on-accent)" }}
        onFocus={(e) => (e.currentTarget.style.top = "12px")}
        onBlur={(e) => (e.currentTarget.style.top = "-80px")}
      >
        Aller au contenu
      </a>

      <aside
        className="hidden md:flex flex-col gap-[22px] w-[248px] shrink-0 px-3.5 py-4 sticky top-0 self-start max-h-screen overflow-auto"
        style={{ background: "var(--t-surface)", borderRight: "1px solid var(--t-line-soft)", minHeight: "100vh" }}
      >
        <Link to="/admin" className="flex items-center gap-2.5 px-2 py-1.5 rounded-[var(--t-r-md)]" style={{ color: "var(--t-ink)" }}>
          <CatLogo size={34} />
          <span className="font-bold text-[20px]" style={{ fontFamily: "var(--t-display)" }}>
            ATSme
          </span>
          <span
            className="ml-auto font-semibold text-[10px] tracking-[0.12em] px-1.5 py-0.5 rounded-[var(--t-r-pill)]"
            style={{ background: "var(--t-warn-soft)", color: "var(--t-warn-ink)" }}
          >
            ADMIN
          </span>
        </Link>

        <nav aria-label="Navigation administration" className="flex flex-col gap-0.5">
          <div
            className="px-3 pb-1.5 font-semibold text-[11px] uppercase"
            style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.14em", color: "var(--t-muted)" }}
          >
            Administration
          </div>
          {ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 w-full min-h-11 px-3 rounded-[var(--t-r-md)] text-[15px] transition-colors ${isActive ? "font-semibold" : "font-medium"}`
              }
              style={({ isActive }) =>
                isActive
                  ? { background: "var(--t-accent-soft)", color: "var(--t-accent-ink)", boxShadow: "inset 3px 0 0 var(--t-accent)" }
                  : { color: "var(--t-ink2)" }
              }
            >
              <item.icon />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-0.5">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 w-full min-h-11 px-3 rounded-[var(--t-r-md)] text-[15px] font-medium"
            style={{ color: "var(--t-ink2)" }}
          >
            Retour à l'app
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 w-full min-h-11 px-3 rounded-[var(--t-r-md)] text-[15px] font-medium text-left cursor-pointer bg-transparent border-0"
            style={{ color: "var(--t-danger)" }}
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex-[999_1_560px] min-w-0 flex flex-col">
        <header
          className="sticky top-0 z-20 flex flex-wrap items-center gap-3.5 px-4 md:px-10 min-h-16"
          style={{ background: "var(--t-bg)", borderBottom: "1px solid var(--t-line-soft)" }}
        >
          <nav aria-label="Fil d'Ariane" className="flex-1 min-w-[200px]">
            <ol className="list-none m-0 p-0 flex flex-wrap gap-2 text-sm" style={{ color: "var(--t-muted)" }}>
              <li>Administration</li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-semibold" style={{ color: "var(--t-ink)" }}>
                {CRUMBS[pathname] ?? ""}
              </li>
            </ol>
          </nav>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={`Compte de ${user.name}`}
              className="flex items-center gap-2 min-h-11 pr-2.5 pl-1 rounded-[var(--t-r-pill)] cursor-pointer"
              style={{ border: "1px solid var(--t-line-soft)", background: "var(--t-surface)", color: "var(--t-ink)" }}
            >
              <span
                aria-hidden="true"
                className="w-[34px] h-[34px] rounded-full grid place-items-center font-bold text-sm"
                style={{ background: "var(--t-pop)", color: "var(--t-on-accent)" }}
              >
                {user.name?.slice(0, 1).toUpperCase()}
              </span>
              <span className="font-semibold text-sm">{user.name}</span>
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {menuOpen && (
              <div
                role="menu"
                aria-label="Compte"
                className="absolute right-0 top-[calc(100%+8px)] min-w-[230px] p-1.5 rounded-[var(--t-r-md)] flex flex-col gap-0.5 z-30"
                style={{ background: "var(--t-surface)", border: "1px solid var(--t-line-soft)", boxShadow: "0 12px 30px -12px rgba(0,0,0,.35)" }}
              >
                <div className="px-3.5 pt-2.5 pb-2 text-[13px]" style={{ color: "var(--t-muted)" }}>
                  {user.email}
                </div>
                <Link
                  role="menuitem"
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center w-full min-h-11 px-3.5 rounded-[var(--t-r-md)] text-[15px] font-medium"
                  style={{ color: "var(--t-ink)" }}
                >
                  Retour à l'app
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={logout}
                  className="flex items-center w-full min-h-11 px-3.5 rounded-[var(--t-r-md)] text-[15px] font-medium text-left cursor-pointer bg-transparent border-0"
                  style={{ color: "var(--t-danger)" }}
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </header>

        <main id="contenu" tabIndex={-1} className="flex-1 outline-none px-4 md:px-10 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
