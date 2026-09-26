// Contrepartie présentationnelle de frontend/src/pages/JobOffers.tsx pour le design
// system — découplée du réseau (lib/resumeApi). Toute modification faite dans Claude
// Design doit être reportée à la main dans le fichier réel de l'app.
import { useState } from "react";
import { type ResumeSummary } from "./types.js";
import { sampleJobMatch, sampleResumeList } from "./sampleData.js";

export type JobOffersScreenProps = {
  resumes?: ResumeSummary[];
};

/**
 * Comparaison d'un CV à une offre d'emploi : score de correspondance, mots-clés
 * présents et manquants.
 *
 * @example
 * <JobOffersScreen />
 */
export function JobOffersScreen({ resumes = sampleResumeList }: JobOffersScreenProps) {
  const [resumeId, setResumeId] = useState(resumes[0] ? String(resumes[0].id) : "");
  const [jobText, setJobText] = useState("");
  const [matching, setMatching] = useState(false);
  const [result, setResult] = useState<{ score: number; matched: string[]; missing: string[] } | null>(null);

  function analyze() {
    if (!resumeId || !jobText.trim()) return;
    setMatching(true);
    setResult(sampleJobMatch);
    setMatching(false);
  }

  if (resumes.length === 0) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold mb-3">Offres d'emploi</h1>
        <div className="border border-dashed border-[var(--border)] rounded-xl px-6 py-14 text-center">
          <p className="text-sm text-[var(--text-dim)]">Créez ou importez un CV pour pouvoir le comparer à une offre.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Offres d'emploi</h1>
      <p className="text-[var(--text-dim)] text-sm mb-6">
        Collez une offre d'emploi pour voir à quel point l'un de vos CV y correspond, et quels mots-clés il manque.
      </p>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-[var(--ff-mono)] uppercase tracking-wider text-[var(--text-faint)]">CV à comparer</span>
          <select
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
            className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[var(--violet-soft)]"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-[var(--ff-mono)] uppercase tracking-wider text-[var(--text-faint)]">Texte de l'offre</span>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Collez ici la description complète du poste..."
            className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[var(--violet-soft)] min-h-[160px] resize-y"
          />
        </label>
        <button
          onClick={analyze}
          disabled={matching || !jobText.trim() || !resumeId}
          className="bg-[var(--violet)] hover:bg-[var(--violet-soft)] transition-colors rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-50 cursor-pointer"
        >
          {matching ? "Analyse en cours..." : "Analyser le matching"}
        </button>
      </div>

      {result && (
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <p className="font-[var(--ff-display)] text-4xl font-bold text-[var(--violet-soft)]">{result.score}%</p>
            <p className="text-sm text-[var(--text-dim)] mt-2">de correspondance avec cette offre</p>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            {result.matched.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-[var(--ff-mono)] uppercase tracking-widest text-[var(--good)] mb-2">Mots-clés présents</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.matched.map((k) => (
                    <span key={k} className="text-xs bg-[var(--violet-glow)] text-[var(--good)] rounded px-1.5 py-0.5">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {result.missing.length > 0 && (
              <div>
                <p className="text-xs font-[var(--ff-mono)] uppercase tracking-widest text-[var(--warn)] mb-2">Mots-clés manquants</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.missing.map((k) => (
                    <span key={k} className="text-xs bg-[var(--surface-2)] text-[var(--warn)] rounded px-1.5 py-0.5">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
