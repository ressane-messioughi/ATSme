import { useEffect, useMemo, useState } from "react";
import { type AdminResume, downloadAdminExport, downloadAdminOriginal, listAdminResumes } from "../../lib/adminApi";
import { scoreTone } from "../../lib/resumeApi";

const TONE_COLOR = { good: "var(--t-accent)", warn: "var(--t-warn)", danger: "var(--t-danger)" } as const;

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
    <div className="max-w-5xl flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <div
          className="font-semibold text-[11px] uppercase"
          style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.14em", color: "var(--t-warn-ink)" }}
        >
          Administration
        </div>
        <h1 className="font-black leading-[1.15] m-0" style={{ fontFamily: "var(--t-display)", fontSize: "clamp(28px,3vw,36px)" }}>
          CV déposés
        </h1>
        <p className="text-sm m-0" style={{ color: "var(--t-ink2)" }}>
          {resumes ? `${resumes.length} document(s)` : "Chargement..."}
        </p>
      </header>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher par titre, nom ou email…"
        aria-label="Rechercher"
        className="max-w-[360px] min-h-11 px-3 rounded-[var(--t-r-md)] outline-none"
        style={{ border: "1.5px solid var(--t-field-line)", background: "var(--t-field)", color: "var(--t-ink)", fontSize: 15 }}
      />

      {error && <p style={{ color: "var(--t-danger)" }}>{error}</p>}

      {filtered && (
        <div className="flex flex-col gap-2">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-4 px-5 py-4 rounded-[var(--t-r-lg)]"
              style={{ background: "var(--t-surface)", border: "1px solid var(--t-line-soft)" }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate m-0">{r.title}</p>
                <p className="text-xs mt-1 m-0" style={{ color: "var(--t-muted)" }}>
                  {r.userName} · {r.userEmail} · {r.source === "import" ? "Importé" : "Créé"} · maj {new Date(r.updated_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-sm font-semibold" style={{ fontFamily: "var(--t-mono)", color: TONE_COLOR[scoreTone(r.ats_score)] }}>
                  {r.ats_score != null ? `${r.ats_score}/100` : "-"}
                </span>
                <div className="flex items-center gap-2">
                  {r.hasOriginal && (
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => onOriginal(r)}
                      className="text-xs font-semibold rounded-[var(--t-r-md)] px-2.5 py-1.5 cursor-pointer disabled:opacity-50"
                      style={{ fontFamily: "var(--t-mono)", border: "1.5px solid var(--t-field-line)", background: "var(--t-surface)", color: "var(--t-ink)" }}
                    >
                      Original
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => onExport(r)}
                    className="text-xs font-semibold rounded-[var(--t-r-md)] px-2.5 py-1.5 cursor-pointer disabled:opacity-50"
                    style={{ fontFamily: "var(--t-mono)", border: "1.5px solid var(--t-field-line)", background: "var(--t-surface)", color: "var(--t-ink)" }}
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
