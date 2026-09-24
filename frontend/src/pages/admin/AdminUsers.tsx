import { useEffect, useMemo, useState } from "react";
import { type AdminUser, isOnline, listAdminUsers } from "../../lib/adminApi";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAdminUsers()
      .then(setUsers)
      .catch(() => setError("Impossible de charger les utilisateurs."));
  }, []);

  const filtered = useMemo(() => {
    if (!users) return null;
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, query]);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Utilisateurs</h1>
      <p className="text-[var(--text-dim)] text-sm mb-6">{users ? `${users.length} compte(s)` : "Chargement..."}</p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher par nom ou email..."
        className="w-full max-w-sm bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[var(--violet-soft)] transition-colors mb-6"
      />

      {error && <p className="text-sm text-[var(--danger)] mb-4">{error}</p>}

      {filtered && (
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
      )}
    </div>
  );
}
