import { useEffect, useState } from "react";
import { type AdminStats, getAdminStats } from "../../lib/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => setError("Impossible de charger les statistiques."));
  }, []);

  return (
    <div className="max-w-5xl flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <div
          className="font-semibold text-[11px] uppercase"
          style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.14em", color: "var(--t-warn-ink)" }}
        >
          Administration
        </div>
        <h1 className="font-black leading-[1.15] m-0" style={{ fontFamily: "var(--t-display)", fontSize: "clamp(28px,3vw,36px)" }}>
          Vue d'ensemble
        </h1>
      </header>

      {error && <p style={{ color: "var(--t-danger)" }}>{error}</p>}

      <section className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <Stat label="Utilisateurs" value={stats?.totalUsers} />
        <Stat label="En ligne maintenant" value={stats?.onlineNow} accent sub="Activité réelle, 5 dernières minutes" />
        <Stat label="Nouveaux (7 jours)" value={stats?.newUsers7d} />
        <Stat label="Actifs (30 jours)" value={stats?.activeUsers30d} />
        <Stat label="CV totaux" value={stats?.totalResumes} />
        <Stat label="CV importés" value={stats?.importedResumes} />
        <Stat label="CV analysés" value={stats?.analyzedResumes} />
        <Stat label="Score ATS moyen" value={stats?.avgScore != null ? `${stats.avgScore}/100` : undefined} />
      </section>

      <p className="text-xs" style={{ color: "var(--t-muted)" }}>
        Le statut « en ligne » reflète une activité authentifiée réelle dans les 5 dernières minutes — jamais simulé.
      </p>
    </div>
  );
}

function Stat({ label, value, accent, sub }: { label: string; value: string | number | undefined; accent?: boolean; sub?: string }) {
  return (
    <div
      className="p-5 rounded-[var(--t-r-lg)] flex flex-col gap-1.5"
      style={{ background: "var(--t-surface)", border: "1px solid var(--t-line-soft)" }}
    >
      <div
        className="font-semibold text-[11px] uppercase"
        style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.14em", color: "var(--t-muted)" }}
      >
        {label}
      </div>
      <div className="font-black text-[34px]" style={{ fontFamily: "var(--t-display)", color: accent ? "var(--t-accent)" : "var(--t-ink)" }}>
        {value ?? "—"}
      </div>
      {sub && (
        <div className="text-[13px]" style={{ color: "var(--t-muted)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}
