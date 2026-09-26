// Contrepartie design-system de frontend/src/pages/admin/AdminUsers.tsx — découplée du
// réseau (la vraie liste vient de GET /admin/users côté app). Toute modification faite
// dans Claude Design doit être reportée à la main dans le fichier réel.
import { useMemo, useState } from "react";
import type { AdminUser } from "./types.js";
import { sampleAdminUsers } from "./sampleData.js";

// Même seuil que lib/adminApi.ts isOnline() : 5 minutes.
function isOnline(lastSeenAt: string | null): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < 5 * 60 * 1000;
}

export type AdminUsersScreenProps = {
  users?: AdminUser[];
};

/**
 * Liste des utilisateurs d'ATSme, avec recherche par nom ou email — panneau
 * d'administration.
 *
 * @example
 * <AdminUsersScreen />
 */
export function AdminUsersScreen({ users: initialUsers = sampleAdminUsers }: AdminUsersScreenProps) {
  const [users] = useState<AdminUser[]>(initialUsers);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, query]);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Utilisateurs</h1>
      <p className="text-[var(--text-dim)] text-sm mb-6">{`${users.length} compte(s)`}</p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher par nom ou email..."
        className="w-full max-w-sm bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[var(--violet-soft)] transition-colors mb-6"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-xs text-[var(--text-faint)] border-b border-[var(--border)]">
              <th className="py-2 pr-4 font-normal">Utilisateur</th>
              <th className="py-2 pr-4 font-normal">Statut</th>
              <th className="py-2 pr-4 font-normal">Offre</th>
              <th className="py-2 pr-4 font-normal">CV</th>
              <th className="py-2 pr-4 font-normal">Score moyen</th>
              <th className="py-2 pr-4 font-normal">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const online = isOnline(u.last_seen_at);
              return (
                <tr key={u.id} className="border-b border-[var(--border)]">
                  <td className="py-3 pr-4">
                    <p className="font-medium">
                      {u.name} {Boolean(u.is_admin) && <span className="text-[10px] text-[var(--violet-soft)] font-[var(--ff-mono)]">ADMIN</span>}
                    </p>
                    <p className="text-xs text-[var(--text-faint)]">{u.email}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs ${online ? "text-[var(--good)]" : "text-[var(--text-faint)]"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-[var(--good)]" : "bg-[var(--text-faint)]"}`} />
                      {online ? "En ligne" : u.last_seen_at ? `Vu le ${new Date(u.last_seen_at).toLocaleDateString("fr-FR")}` : "Jamais connecté"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 capitalize">{u.plan}</td>
                  <td className="py-3 pr-4 font-[var(--ff-mono)]">{u.resumeCount}</td>
                  <td className="py-3 pr-4 font-[var(--ff-mono)]">{u.avgScore != null ? `${u.avgScore}/100` : "—"}</td>
                  <td className="py-3 pr-4 text-[var(--text-faint)] text-xs">{new Date(u.created_at).toLocaleDateString("fr-FR")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
