import { useEffect, useMemo, useState } from "react";
import { type AdminResume, downloadAdminExport, downloadAdminOriginal, listAdminResumes } from "../../lib/adminApi";
import { scoreTone } from "../../lib/resumeApi";

const toneClass = { good: "text-[var(--good)]", warn: "text-[var(--warn)]", danger: "text-[var(--danger)]" };

export default function AdminResumes() {
  const [resumes, setResumes] = useState<AdminResume[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    listAdminResumes()
      .then(setResumes)
      .catch(() => setError("Impossible de charger les CV."));
  }, []);

  const filtered = useMemo(() => {
    if (!resumes) return null;
    const q = query.trim().toLowerCase();
    if (!q) return resumes;
    return resumes.filter((r) => r.title.toLowerCase().includes(q) || r.userName.toLowerCase().includes(q) || r.userEmail.toLowerCase().includes(q));
  }, [resumes, query]);

  async function onOriginal(r: AdminResume) {
    setBusyId(r.id);
    try {
      await downloadAdminOriginal(r.id, r.title);
    } catch {
      setError("Aucun fichier original pour ce CV.");
    } finally {
      setBusyId(null);
    }
  }

  async function onExport(r: AdminResume) {
    setBusyId(r.id);
    try {
      await downloadAdminExport(r.id, "pdf", r.title);
    } catch {
      setError("L'export a échoué.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">CV</h1>
      <p className="text-[var(--text-dim)] text-sm mb-6">{resumes ? `${resumes.length} document(s)` : "Chargement..."}</p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher par titre, nom ou email..."
        className="w-full max-w-sm bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[var(--violet-soft)] transition-colors mb-6"
      />

      {error && <p className="text-sm text-[var(--danger)] mb-4">{error}</p>}

      {filtered && (
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
                    <button
                      disabled={busyId === r.id}
                      onClick={() => onOriginal(r)}
                      className="text-xs font-[var(--ff-mono)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--violet-soft)] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Original
                    </button>
                  )}
                  <button
                    disabled={busyId === r.id}
                    onClick={() => onExport(r)}
                    className="text-xs font-[var(--ff-mono)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--violet-soft)] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
