import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar.tsx";
import { useAuth } from "../lib/auth.tsx";

const CRUMBS: Record<string, [string, string]> = {
  "/dashboard": ["ATSme", "Tableau de bord"],
  "/cv": ["Créer", "Mes CV"],
  "/cv/nouveau": ["Créer", "Nouveau CV"],
  "/templates": ["Créer", "Modèles"],
  "/analyse": ["Optimiser", "Analyse ATS"],
  "/offres": ["Optimiser", "Offres d'emploi"],
  "/historique": ["Suivre", "Historique"],
  "/abonnement": ["Compte", "Achats et abonnement"],
  "/parametres": ["Compte", "Paramètres"],
};

function crumbFor(pathname: string): [string, string] {
  if (CRUMBS[pathname]) return CRUMBS[pathname];
  if (pathname.startsWith("/cv/")) return ["Créer", "Mes CV · Éditeur"];
  return ["ATSme", ""];
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [crumbGroup, crumbPage] = crumbFor(pathname);

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

      <Sidebar />

      <div className="flex-[999_1_560px] min-w-0 flex flex-col">
        <header
          className="sticky top-0 z-20 flex flex-wrap items-center gap-3.5 px-4 md:px-10 min-h-16"
          style={{ background: "var(--t-bg)", borderBottom: "1px solid var(--t-line-soft)" }}
        >
          <nav aria-label="Fil d'Ariane" className="flex-1 min-w-[200px]">
            <ol className="list-none m-0 p-0 flex flex-wrap gap-2 text-sm" style={{ color: "var(--t-muted)" }}>
              <li>{crumbGroup}</li>
              {crumbPage && (
                <>
                  <li aria-hidden="true">/</li>
                  <li aria-current="page" className="font-semibold" style={{ color: "var(--t-ink)" }}>
                    {crumbPage}
                  </li>
                </>
              )}
            </ol>
          </nav>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={`Compte de ${user?.name ?? ""}`}
              className="flex items-center gap-2 min-h-11 pr-2.5 pl-1 rounded-[var(--t-r-pill)] cursor-pointer"
              style={{ border: "1px solid var(--t-line-soft)", background: "var(--t-surface)", color: "var(--t-ink)" }}
            >
              <span
                aria-hidden="true"
                className="w-[34px] h-[34px] rounded-full grid place-items-center font-bold text-sm"
                style={{ background: "var(--t-pop)", color: "var(--t-on-accent)" }}
              >
                {user?.name?.slice(0, 1).toUpperCase()}
              </span>
              <span className="font-semibold text-sm">{user?.name}</span>
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
                  {user?.email}
                </div>
                <Link
                  role="menuitem"
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center w-full min-h-11 px-3.5 rounded-[var(--t-r-md)] text-[15px] font-medium"
                  style={{ color: "var(--t-ink)" }}
                >
                  Page d'accueil
                </Link>
                {Boolean(user?.is_admin) && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/admin");
                    }}
                    className="flex items-center w-full min-h-11 px-3.5 rounded-[var(--t-r-md)] text-[15px] font-medium text-left cursor-pointer bg-transparent border-0"
                    style={{ color: "var(--t-ink)" }}
                  >
                    Administration
                  </button>
                )}
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
