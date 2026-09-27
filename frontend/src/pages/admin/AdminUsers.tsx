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
    <div className="max-w-5xl flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <div
          className="font-semibold text-[11px] uppercase"
          style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.14em", color: "var(--t-warn-ink)" }}
        >
          Administration
        </div>
        <h1 className="font-black leading-[1.15] m-0" style={{ fontFamily: "var(--t-display)", fontSize: "clamp(28px,3vw,36px)" }}>
          Utilisateurs
        </h1>
        <p className="text-sm m-0" style={{ color: "var(--t-ink2)" }}>
          {users ? `${users.length} compte(s)` : "Chargement..."}
        </p>
      </header>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher par nom ou email…"
        aria-label="Rechercher"
        className="max-w-[360px] min-h-11 px-3 rounded-[var(--t-r-md)] outline-none"
        style={{ border: "1.5px solid var(--t-field-line)", background: "var(--t-field)", color: "var(--t-ink)", fontSize: 15 }}
      />

      {error && <p style={{ color: "var(--t-danger)" }}>{error}</p>}

      {filtered && (
        <div className="overflow-auto rounded-[var(--t-r-lg)]" style={{ background: "var(--t-surface)", border: "1px solid var(--t-line-soft)" }}>
          <table className="w-full border-collapse text-sm" style={{ minWidth: 640 }}>
            <thead>
              <tr style={{ background: "var(--t-bg)", textAlign: "left" }}>
                {["Utilisateur", "Statut", "Offre", "CV", "Score moyen", "Inscrit le"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="py-3 px-4 font-semibold text-[11px] uppercase"
                    style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.12em", color: "var(--t-muted)", borderBottom: "1.5px solid var(--t-line)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const online = isOnline(u.last_seen_at);
                return (
                  <tr key={u.id} style={{ borderBottom: "1px dashed var(--t-line-soft)" }}>
                    <th scope="row" className="py-3 px-4 text-left font-normal">
                      <p className="font-semibold m-0">
                        {u.name}{" "}
                        {Boolean(u.is_admin) && (
                          <span
                            className="text-[10px] font-semibold ml-1"
                            style={{ fontFamily: "var(--t-mono)", color: "var(--t-warn-ink)" }}
                          >
                            ADMIN
                          </span>
                        )}
                      </p>
                      <p className="text-xs m-0" style={{ color: "var(--t-muted)" }}>
                        {u.email}
                      </p>
                    </th>
                    <td className="py-3 px-4">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs"
                        style={{ color: online ? "var(--t-accent)" : "var(--t-muted)" }}
                      >
                        <span
                          aria-hidden="true"
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: online ? "var(--t-accent)" : "var(--t-muted)" }}
                        />
                        {online ? "En ligne" : u.last_seen_at ? `Vu le ${new Date(u.last_seen_at).toLocaleDateString("fr-FR")}` : "Jamais connecté"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="inline-flex px-2.5 py-1 rounded-[var(--t-r-pill)] font-semibold text-[13px] capitalize"
                        style={{ background: "var(--t-accent-soft)", color: "var(--t-accent-ink)" }}
                      >
                        {u.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4" style={{ fontFamily: "var(--t-mono)" }}>
                      {u.resumeCount}
                    </td>
                    <td className="py-3 px-4" style={{ fontFamily: "var(--t-mono)" }}>
                      {u.avgScore != null ? `${u.avgScore}/100` : "—"}
                    </td>
                    <td className="py-3 px-4 text-xs" style={{ color: "var(--t-muted)" }}>
                      {new Date(u.created_at).toLocaleDateString("fr-FR")}
                    </td>
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
