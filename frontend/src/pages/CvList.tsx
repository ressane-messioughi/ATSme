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

const toneStyle = {
  good: { background: "var(--t-accent-soft)", color: "var(--t-accent-ink)" },
  warn: { background: "var(--t-warn-soft)", color: "var(--t-warn-ink)" },
  danger: { background: "var(--t-danger-soft)", color: "var(--t-danger)" },
};

const btnCls = "inline-flex items-center justify-center gap-2 min-h-10 px-3.5 rounded-[var(--t-r-md)] font-semibold text-sm cursor-pointer disabled:opacity-50";
const btnStyle = { border: "1.5px solid var(--t-field-line)", background: "var(--t-surface)", color: "var(--t-ink)" };

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
    <div className="max-w-[1080px] mx-auto flex flex-col gap-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="font-semibold text-xs uppercase" style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.14em", color: "var(--t-muted)" }}>
            Créer
          </div>
          <h1 className="font-black leading-[1.15] m-0" style={{ fontFamily: "var(--t-display)", fontSize: "clamp(28px,3vw,36px)" }}>
            Mes CV
          </h1>
          <p className="m-0 text-base leading-[1.55] max-w-[62ch]" style={{ color: "var(--t-ink2)" }}>
            Retrouvez, modifiez et analysez vos CV.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link to="/templates" className={btnCls} style={btnStyle}>
            Modèles
          </Link>
          <button
            type="button"
            onClick={() => navigate("/cv/nouveau")}
            className="inline-flex items-center justify-center gap-2 min-h-11 px-[18px] rounded-[var(--t-r-md)] font-semibold text-[15px] cursor-pointer"
            style={{ border: "1.5px solid var(--t-line)", background: "var(--t-accent)", color: "var(--t-on-accent)", boxShadow: "0 2px 0 var(--t-shadow)" }}
          >
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nouveau CV
          </button>
        </div>
      </header>

      {error && <p style={{ color: "var(--t-danger)" }}>{error}</p>}

      <section
        aria-label="Liste des CV"
        className="rounded-[var(--t-r-lg)] flex flex-col min-w-0"
        style={{ background: "var(--t-surface)", border: "1px solid var(--t-line-soft)" }}
      >
        {resumes && resumes.length > 0 && (
          <div className="p-5" style={{ borderBottom: "1px solid var(--t-line-soft)" }}>
            <label className="flex flex-col gap-1.5 font-semibold text-sm max-w-[360px]" style={{ color: "var(--t-ink)" }}>
              Rechercher
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nom du CV"
                className="min-h-11 px-3 rounded-[var(--t-r-md)] outline-none"
                style={{ border: "1.5px solid var(--t-field-line)", background: "var(--t-field)", color: "var(--t-ink)", fontSize: 16 }}
              />
            </label>
          </div>
        )}

        {resumes && resumes.length === 0 && (
          <div className="flex flex-col items-center gap-4 text-center px-6 py-14">
            <p className="text-sm m-0" style={{ color: "var(--t-ink2)" }}>
              Vous n'avez pas encore de CV. Importez-en un ou créez-en un pour obtenir votre score ATS.
            </p>
            <Link
              to="/cv/nouveau"
              className="inline-flex items-center justify-center min-h-11 px-[18px] rounded-[var(--t-r-md)] font-semibold text-[15px]"
              style={{ border: "1.5px solid var(--t-line)", background: "var(--t-accent)", color: "var(--t-on-accent)" }}
            >
              Commencer
            </Link>
          </div>
        )}

        {filtered && filtered.length > 0 && (
          <>
            <div role="status" className="px-6 pt-3 text-[13px]" style={{ color: "var(--t-muted)" }}>
              {filtered.length} CV
            </div>
            <ul className="list-none m-0 px-3 py-3 flex flex-col">
              {filtered.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-3.5 px-3 py-3.5 rounded-[var(--t-r-md)]">
                  <div
                    aria-hidden="true"
                    className="w-10 h-[52px] rounded-md p-1.5 flex flex-col gap-1 shrink-0"
                    style={{ border: "1px solid var(--t-line-soft)", background: "var(--t-field)" }}
                  >
                    <div className="h-1 w-[70%] rounded-sm" style={{ background: "var(--t-ink)" }} />
                    <div className="h-[3px] w-[45%] rounded-sm" style={{ background: "var(--t-accent)" }} />
                    <div className="h-[2px] mt-1" style={{ background: "var(--t-line-soft)" }} />
                    <div className="h-[2px]" style={{ background: "var(--t-line-soft)" }} />
                    <div className="h-[2px] w-[80%]" style={{ background: "var(--t-line-soft)" }} />
                  </div>

                  <div className="flex-1 min-w-[200px] min-w-0">
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
                        className="rounded-md px-2 py-1 text-sm outline-none w-full max-w-xs"
                        style={{ background: "var(--t-field)", border: "1.5px solid var(--t-accent)" }}
                      />
                    ) : (
                      <div className="group flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-base truncate">{r.title}</span>
                        <button
                          type="button"
                          onClick={() => startRename(r)}
                          aria-label={`Renommer ${r.title}`}
                          className="opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
                          style={{ color: "var(--t-muted)" }}
                        >
                          <IconPencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <div className="text-[13px]" style={{ color: "var(--t-muted)" }}>
                      {r.source === "import" ? "Importé" : "Créé"} · modifié le {new Date(r.updated_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>

                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--t-r-pill)] font-semibold text-[13px] whitespace-nowrap"
                    style={r.ats_score != null ? toneStyle[scoreTone(r.ats_score)] : { background: "var(--t-surface2)", color: "var(--t-muted)" }}
                  >
                    {r.ats_score != null ? `Score ${r.ats_score}` : scoreLabel(r.ats_score)}
                  </span>

                  <div className="flex flex-wrap gap-2">
                    <Link to={`/cv/${r.id}`} aria-label={`Modifier ${r.title}`} className={btnCls} style={btnStyle}>
                      Modifier
                    </Link>
                    <Link to="/analyse" aria-label={`Analyser ${r.title}`} className={btnCls} style={btnStyle}>
                      Analyser
                    </Link>
                    <button type="button" disabled={busyId === r.id} onClick={() => onExport(r.id, r.title)} className={btnCls} style={btnStyle}>
                      PDF
                    </button>
                    <button type="button" disabled={busyId === r.id} onClick={() => onDuplicate(r.id)} className={btnCls} style={btnStyle}>
                      Dupliquer
                    </button>
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => onDelete(r.id, r.title)}
                      aria-label={`Supprimer ${r.title}`}
                      className="min-w-11 min-h-11 grid place-items-center rounded-[var(--t-r-md)] cursor-pointer disabled:opacity-50"
                      style={{ border: "1.5px solid var(--t-field-line)", color: "var(--t-ink2)" }}
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {filtered && filtered.length === 0 && resumes && resumes.length > 0 && (
          <div className="flex flex-col items-start gap-2.5 px-6 pt-2 pb-7">
            <p className="m-0 text-[15px]" style={{ color: "var(--t-ink2)" }}>
              Aucun CV ne correspond à votre recherche.
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="inline-flex items-center min-h-11 font-semibold text-[15px] underline underline-offset-[3px] cursor-pointer"
              style={{ color: "var(--t-accent)" }}
            >
              Effacer la recherche
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
