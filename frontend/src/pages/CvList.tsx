import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  type ResumeSummary,
  deleteResume,
  downloadExport,
  duplicateResume,
  listResumes,
  scoreLabel,
  scoreTone,
  updateResume,
} from "../lib/resumeApi";
import { IconPencil, IconTrash } from "../components/icons.tsx";

const toneClass = { good: "text-[var(--good)]", warn: "text-[var(--warn)]", danger: "text-[var(--danger)]" };

export default function CvList() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");

  function refresh() {
    listResumes()
      .then(setResumes)
      .catch(() => setError("Impossible de charger vos CV."));
  }

  useEffect(refresh, []);

  const filtered = useMemo(() => {
    if (!resumes) return null;
    const q = query.trim().toLowerCase();
    if (!q) return resumes;
    return resumes.filter((r) => r.title.toLowerCase().includes(q));
  }, [resumes, query]);

  async function onDuplicate(id: number) {
    setBusyId(id);
    try {
      await duplicateResume(id);
      refresh();
    } catch {
      setError("La duplication a échoué.");
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(id: number, title: string) {
    if (!confirm(`Supprimer définitivement "${title}" ?`)) return;
    setBusyId(id);
    try {
      await deleteResume(id);
      refresh();
    } catch {
      setError("La suppression a échoué.");
    } finally {
      setBusyId(null);
    }
  }

  async function onExport(id: number, title: string) {
    setBusyId(id);
    try {
      await downloadExport(id, "pdf", title);
    } catch {
      setError("L'export a échoué.");
    } finally {
      setBusyId(null);
    }
  }

  function startRename(r: ResumeSummary) {
    setRenamingId(r.id);
    setRenameValue(r.title);
  }

  async function commitRename(id: number) {
    const title = renameValue.trim();
    setRenamingId(null);
    if (!title) return;
    setResumes((prev) => prev && prev.map((r) => (r.id === id ? { ...r, title } : r)));
    try {
      await updateResume(id, { title });
    } catch {
      setError("Le renommage a échoué.");
      refresh();
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="font-[var(--ff-mono)] text-xs uppercase tracking-widest text-[var(--violet-soft)] mb-2">Mes CV</p>
          <h1 className="text-2xl font-bold">Vos documents</h1>
        </div>
        <button
          onClick={() => navigate("/cv/nouveau")}
          className="bg-[var(--violet)] hover:bg-[var(--violet-soft)] transition-colors rounded-lg px-4 py-2.5 text-sm font-medium text-white cursor-pointer"
        >
          + Nouveau CV
        </button>
      </div>

      {resumes && resumes.length > 0 && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un CV par nom..."
          className="w-full max-w-sm bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[var(--violet-soft)] transition-colors mb-6"
        />
      )}

      {error && <p className="text-sm text-[var(--danger)] mb-4">{error}</p>}

      {resumes && resumes.length === 0 && (
        <div className="border border-dashed border-[var(--border)] rounded-xl px-6 py-14 text-center">
          <p className="text-sm text-[var(--text-dim)] mb-4">
            Vous n'avez pas encore de CV. Importez-en un ou créez-en un pour obtenir votre score ATS.
          </p>
          <Link
            to="/cv/nouveau"
            className="inline-block bg-[var(--violet)] hover:bg-[var(--violet-soft)] transition-colors rounded-lg px-4 py-2.5 text-sm font-medium text-white"
          >
            Commencer
          </Link>
        </div>
      )}

      {filtered && filtered.length === 0 && resumes && resumes.length > 0 && (
        <p className="text-sm text-[var(--text-faint)] py-8 text-center">Aucun CV ne correspond à « {query} ».</p>
      )}

      {filtered && filtered.length > 0 && (
        <div className="flex flex-col gap-2">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                {renamingId === r.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => commitRename(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename(r.id);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    className="bg-[var(--surface-2)] border border-[var(--violet-soft)] rounded-md px-2 py-1 text-sm outline-none w-full max-w-xs"
                  />
                ) : (
                  <Link to={`/cv/${r.id}`} className="group flex items-center gap-2 min-w-0">
                    <p className="text-sm font-medium truncate">{r.title}</p>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        startRename(r);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-[var(--text-faint)] hover:text-[var(--text)] transition-opacity shrink-0"
                      title="Renommer"
                    >
                      <IconPencil className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                )}
                <p className="text-xs text-[var(--text-faint)] mt-1">
                  {r.source === "import" ? "Importé" : "Créé"} · maj{" "}
                  {new Date(r.updated_at).toLocaleDateString("fr-FR")} · {r.template}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className={`font-[var(--ff-mono)] text-sm font-medium ${toneClass[scoreTone(r.ats_score)]}`}>
                  {r.ats_score != null ? `${r.ats_score}/100` : "—"}
                </span>
                <span className="text-xs text-[var(--text-faint)] hidden md:inline">{scoreLabel(r.ats_score)}</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={busyId === r.id}
                    onClick={() => onExport(r.id, r.title)}
                    title="Exporter en PDF"
                    className="text-xs font-[var(--ff-mono)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--violet-soft)] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    PDF
                  </button>
                  <button
                    disabled={busyId === r.id}
                    onClick={() => onDuplicate(r.id)}
                    title="Dupliquer"
                    className="text-xs font-[var(--ff-mono)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--violet-soft)] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Dupliquer
                  </button>
                  <button
                    disabled={busyId === r.id}
                    onClick={() => onDelete(r.id, r.title)}
                    title="Supprimer"
                    className="text-[var(--text-dim)] hover:text-[var(--danger)] transition-colors cursor-pointer disabled:opacity-50 border border-[var(--border)] hover:border-[var(--danger)] rounded-md p-1.5"
                  >
                    <IconTrash className="w-3.5 h-3.5" />
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
