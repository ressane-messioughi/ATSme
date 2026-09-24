import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { type ResumeSummary, listResumes, listVersions, scoreTone } from "../lib/resumeApi";

type VersionRow = { id: number; label: string | null; ats_score: number | null; created_at: string };

const toneClass = { good: "text-[var(--good)]", warn: "text-[var(--warn)]", danger: "text-[var(--danger)]" };

export default function History() {
  const [resumes, setResumes] = useState<ResumeSummary[] | null>(null);
  const [versionsByResume, setVersionsByResume] = useState<Record<number, VersionRow[]>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listResumes()
      .then(async (list) => {
        setResumes(list);
        const entries = await Promise.all(
          list.map(async (r) => [r.id, await listVersions(r.id).catch(() => [])] as const)
        );
        setVersionsByResume(Object.fromEntries(entries));
      })
      .catch(() => setError("Impossible de charger l'historique."));
  }, []);

  const withHistory = (resumes || []).filter((r) => (versionsByResume[r.id] || []).length > 0);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Historique</h1>
      <p className="text-[var(--text-dim)] text-sm mb-6">Suivez la progression de votre score ATS à chaque version enregistrée.</p>

      {error && <p className="text-sm text-[var(--danger)] mb-4">{error}</p>}

      {resumes && withHistory.length === 0 && (
        <div className="border border-dashed border-[var(--border)] rounded-xl px-6 py-14 text-center">
          <p className="text-sm text-[var(--text-dim)]">
            Aucune version enregistrée pour l'instant. Ouvrez un CV et cliquez sur « + Nouvelle » dans le bloc Versions pour
            commencer à suivre sa progression.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {withHistory.map((r) => {
          const versions = [...(versionsByResume[r.id] || [])].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          return (
            <div key={r.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <Link to={`/cv/${r.id}`} className="text-sm font-semibold hover:text-[var(--violet-soft)] transition-colors">
                  {r.title}
                </Link>
                <span className={`font-[var(--ff-mono)] text-sm font-medium ${toneClass[scoreTone(r.ats_score)]}`}>
                  Actuel : {r.ats_score ?? "—"}/100
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {versions.map((v, i) => (
                  <div key={v.id} className="flex items-center gap-2">
                    <div className="flex flex-col items-center bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 min-w-[84px]">
                      <span className="text-[10px] text-[var(--text-faint)]">{v.label || `Version ${i + 1}`}</span>
                      <span className={`font-[var(--ff-mono)] text-sm font-semibold ${toneClass[scoreTone(v.ats_score)]}`}>
                        {v.ats_score ?? "—"}
                      </span>
                      <span className="text-[10px] text-[var(--text-faint)]">{new Date(v.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                    {i < versions.length - 1 && <span className="text-[var(--text-faint)]">→</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
