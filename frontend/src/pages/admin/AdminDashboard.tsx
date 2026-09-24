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
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Vue d'ensemble</h1>
      <p className="text-[var(--text-dim)] text-sm mb-6">Statistiques réelles de la plateforme ATSme.</p>

      {error && <p className="text-sm text-[var(--danger)] mb-4">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Utilisateurs" value={stats?.totalUsers} />
        <Stat label="En ligne maintenant" value={stats?.onlineNow} accent />
        <Stat label="Nouveaux (7 jours)" value={stats?.newUsers7d} />
        <Stat label="Actifs (30 jours)" value={stats?.activeUsers30d} />
        <Stat label="CV totaux" value={stats?.totalResumes} />
        <Stat label="CV importés" value={stats?.importedResumes} />
        <Stat label="CV analysés" value={stats?.analyzedResumes} />
        <Stat label="Score ATS moyen" value={stats?.avgScore != null ? `${stats.avgScore}/100` : undefined} />
      </div>

      <p className="text-xs text-[var(--text-faint)]">
        Le statut « en ligne » reflète une activité authentifiée réelle dans les 5 dernières minutes — jamais simulé.
      </p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number | undefined; accent?: boolean }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-4">
      <p className="text-xs text-[var(--text-faint)] mb-2">{label}</p>
      <p className={`font-[var(--ff-mono)] text-xl font-medium ${accent ? "text-[var(--good)]" : ""}`}>{value ?? "—"}</p>
    </div>
  );
}
