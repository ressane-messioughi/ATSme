import { useState } from "react";
import { type ResumeSummary, type VersionRow, scoreTone } from "./types.js";
import { sampleResumeList, sampleVersions } from "./sampleData.js";

// Contrepartie "design system" de frontend/src/pages/History.tsx : découplée du routeur
// et de l'API réelle — les versions par CV viennent d'une correspondance locale plutôt
// que d'un Promise.all sur listVersions(). Toute modification faite dans Claude Design
// doit être reportée à la main dans le fichier réel.

const toneClass = { good: "text-[var(--good)]", warn: "text-[var(--warn)]", danger: "text-[var(--danger)]" };

export type HistoryScreenProps = {
  resumes?: ResumeSummary[];
  /** Versions enregistrées, par identifiant de CV — un CV absent de cette table n'a
   * simplement aucun historique, comme dans l'app réelle. */
  versionsByResume?: Record<number, VersionRow[]>;
  onNavigate?: (path: string) => void;
};

export function HistoryScreen({
  resumes = sampleResumeList,
  versionsByResume = { [sampleResumeList[0].id]: sampleVersions },
  onNavigate,
}: HistoryScreenProps) {
  const [versions] = useState(versionsByResume);
  const withHistory = resumes.filter((r) => (versions[r.id] || []).length > 0);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Historique</h1>
      <p className="text-[var(--text-dim)] text-sm mb-6">Suivez la progression de votre score ATS à chaque version enregistrée.</p>

      {withHistory.length === 0 && (
        <div className="border border-dashed border-[var(--border)] rounded-xl px-6 py-14 text-center">
          <p className="text-sm text-[var(--text-dim)]">
            Aucune version enregistrée pour l'instant. Ouvrez un CV et cliquez sur « + Nouvelle » dans le bloc Versions pour
            commencer à suivre sa progression.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {withHistory.map((r) => {
          const rows = [...(versions[r.id] || [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          return (
            <div key={r.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => onNavigate?.(`/cv/${r.id}`)}
                  className="text-sm font-semibold hover:text-[var(--violet-soft)] transition-colors cursor-pointer"
                >
                  {r.title}
                </button>
                <span className={`font-[var(--ff-mono)] text-sm font-medium ${toneClass[scoreTone(r.ats_score)]}`}>
                  Actuel : {r.ats_score ?? "—"}/100
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {rows.map((v, i) => (
                  <div key={v.id} className="flex items-center gap-2">
                    <div className="flex flex-col items-center bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 min-w-[84px]">
                      <span className="text-[10px] text-[var(--text-faint)]">{v.label || `Version ${i + 1}`}</span>
                      <span className={`font-[var(--ff-mono)] text-sm font-semibold ${toneClass[scoreTone(v.ats_score)]}`}>{v.ats_score ?? "—"}</span>
                      <span className="text-[10px] text-[var(--text-faint)]">{new Date(v.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                    {i < rows.length - 1 && <span className="text-[var(--text-faint)]">→</span>}
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
