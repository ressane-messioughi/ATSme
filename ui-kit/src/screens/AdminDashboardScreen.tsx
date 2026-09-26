// Contrepartie design-system de frontend/src/pages/admin/AdminDashboard.tsx — découplée
// du réseau (les vraies stats viennent de GET /admin/stats côté app). Toute modification
// faite dans Claude Design doit être reportée à la main dans le fichier réel.
import { sampleAdminStats } from "./sampleData.js";

export type AdminDashboardScreenProps = {
  stats?: typeof sampleAdminStats;
};

/**
 * Vue d'ensemble de l'administration ATSme — statistiques agrégées de la plateforme.
 *
 * @example
 * <AdminDashboardScreen />
 */
export function AdminDashboardScreen({ stats = sampleAdminStats }: AdminDashboardScreenProps) {
  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Vue d'ensemble</h1>
      <p className="text-[var(--text-dim)] text-sm mb-6">Statistiques réelles de la plateforme ATSme.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Utilisateurs" value={stats.totalUsers} />
        <Stat label="En ligne maintenant" value={stats.onlineNow} accent />
        <Stat label="Nouveaux (7 jours)" value={stats.newUsers7d} />
        <Stat label="Actifs (30 jours)" value={stats.activeUsers30d} />
        <Stat label="CV totaux" value={stats.totalResumes} />
        <Stat label="CV importés" value={stats.importedResumes} />
        <Stat label="CV analysés" value={stats.analyzedResumes} />
        <Stat label="Score ATS moyen" value={stats.avgScore != null ? `${stats.avgScore}/100` : undefined} />
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
