import { NavLink } from "react-router-dom";
import { useAuth } from "../lib/auth.tsx";
import CatLogo from "./CatLogo.tsx";
import {
  IconBriefcase,
  IconChart,
  IconDashboard,
  IconFile,
  IconHistory,
  IconPlusCircle,
  IconSettings,
  IconLayers,
  IconStar,
} from "./icons.tsx";

const GROUPS: { title: string | null; items: { to: string; label: string; end?: boolean; icon: typeof IconDashboard }[] }[] = [
  { title: null, items: [{ to: "/dashboard", label: "Tableau de bord", end: true, icon: IconDashboard }] },
  {
    title: "Créer",
    items: [
      { to: "/cv", label: "Mes CV", icon: IconFile },
      { to: "/cv/nouveau", label: "Nouveau CV", icon: IconPlusCircle },
      { to: "/templates", label: "Modèles", icon: IconLayers },
    ],
  },
  {
    title: "Optimiser",
    items: [
      { to: "/analyse", label: "Analyse ATS", icon: IconChart },
      { to: "/offres", label: "Offres d'emploi", icon: IconBriefcase },
    ],
  },
  { title: "Suivre", items: [{ to: "/historique", label: "Historique", icon: IconHistory }] },
  {
    title: "Compte",
    items: [
      { to: "/abonnement", label: "Achats et abonnement", icon: IconStar },
      { to: "/parametres", label: "Paramètres", icon: IconSettings },
    ],
  },
];

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside
      className="hidden md:flex flex-col gap-[22px] w-[248px] shrink-0 px-3.5 py-4 sticky top-0 self-start max-h-screen overflow-auto"
      style={{ background: "var(--t-surface)", borderRight: "1px solid var(--t-line-soft)", minHeight: "100vh" }}
    >
      <NavLink to="/dashboard" className="flex items-center gap-2.5 px-2 py-1.5 rounded-[var(--t-r-md)]" style={{ color: "var(--t-ink)" }}>
        <CatLogo size={34} />
        <span className="font-bold text-[20px]" style={{ fontFamily: "var(--t-display)" }}>
          ATSme
        </span>
        {Boolean(user?.is_admin) && (
          <span
            className="ml-auto font-semibold text-[10px] tracking-[0.12em] px-1.5 py-0.5 rounded-[var(--t-r-pill)]"
            style={{ background: "var(--t-warn-soft)", color: "var(--t-warn-ink)" }}
          >
            ADMIN
          </span>
        )}
      </NavLink>

      <nav aria-label="Navigation principale" className="flex flex-col gap-[18px]">
        {GROUPS.map((grp, gi) => (
          <div key={gi} className="flex flex-col gap-0.5">
            {grp.title && (
              <div
                className="px-3 pb-1.5 font-semibold text-[11px] uppercase"
                style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.14em", color: "var(--t-muted)" }}
              >
                {grp.title}
              </div>
            )}
            {grp.items.map((item) => (
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
          </div>
        ))}
      </nav>

      <div
        className="mt-auto p-3.5 rounded-[var(--t-r-md)] flex flex-col gap-1.5"
        style={{ background: "var(--t-bg)", border: "1px solid var(--t-line-soft)" }}
      >
        <div className="flex justify-between items-baseline gap-2">
          <span className="font-semibold text-sm">Crédits d'export</span>
        </div>
        <span className="text-[13px]" style={{ color: "var(--t-muted)" }}>
          1 € par CV exporté
        </span>
        <NavLink
          to="/abonnement"
          className="self-start text-[14px] font-semibold underline underline-offset-[3px]"
          style={{ color: "var(--t-accent)" }}
        >
          Gérer mon offre
        </NavLink>
      </div>

      <p className="text-[11px] text-center px-2" style={{ color: "var(--t-faint)" }}>
        <NavLink to="/confidentialite" style={{ color: "var(--t-faint)" }}>
          Confidentialité
        </NavLink>
        {" · "}
        <NavLink to="/mentions-legales" style={{ color: "var(--t-faint)" }}>
          Mentions légales
        </NavLink>
      </p>
    </aside>
  );
}
