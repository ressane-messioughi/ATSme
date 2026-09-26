// Contrepartie design-system de frontend/src/pages/admin/AdminResumes.tsx — découplée du
// réseau (la vraie liste vient de GET /admin/resumes, les téléchargements de
// /admin/resumes/:id/original et /export/:format côté app). Toute modification faite
// dans Claude Design doit être reportée à la main dans le fichier réel.
import { useMemo, useState } from "react";
import type { AdminResume } from "./types.js";
import { scoreTone } from "./types.js";
import { sampleAdminResumes } from "./sampleData.js";

const toneClass = { good: "text-[var(--good)]", warn: "text-[var(--warn)]", danger: "text-[var(--danger)]" };

export type AdminResumesScreenProps = {
  resumes?: AdminResume[];
};

/**
 * Liste de tous les CV déposés sur ATSme, tous utilisateurs confondus, avec recherche —
 * panneau d'administration. Les boutons "Original" et "PDF" sont visuels uniquement ici :
 * le téléchargement réel se fait côté app.
 *
 * @example
 * <AdminResumesScreen />
 */
export function AdminResumesScreen({ resumes: initialResumes = sampleAdminResumes }: AdminResumesScreenProps) {
  const [resumes] = useState<AdminResume[]>(initialResumes);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resumes;
    return resumes.filter((r) => r.title.toLowerCase().includes(q) || r.userName.toLowerCase().includes(q) || r.userEmail.toLowerCase().includes(q));
  }, [resumes, query]);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">CV</h1>
      <p className="text-[var(--text-dim)] text-sm mb-6">{`${resumes.length} document(s)`}</p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher par titre, nom ou email..."
        className="w-full max-w-sm bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[var(--violet-soft)] transition-colors mb-6"
      />

      <div className="flex flex-col gap-2">
        {filtered.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{r.title}</p>
              <p className="text-xs text-[var(--text-faint)] mt-1">
                {r.userName} · {r.userEmail} · {r.source === "import" ? "Importé" : "Créé"} · maj {new Date(r.updated_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className={`font-[var(--ff-mono)] text-sm font-medium ${toneClass[scoreTone(r.ats_score)]}`}>
                {r.ats_score != null ? `${r.ats_score}/100` : "—"}
              </span>
              <div className="flex items-center gap-2">
                {r.hasOriginal && (
                  <button className="text-xs font-[var(--ff-mono)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--violet-soft)] transition-colors cursor-pointer">
                    Original
                  </button>
                )}
                <button className="text-xs font-[var(--ff-mono)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--violet-soft)] transition-colors cursor-pointer">
                  PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
