import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { type Resume, type ResumeSummary, getResume, listResumes, scoreLabel } from "../lib/resumeApi";
import ScoreGauge from "../components/ScoreGauge.tsx";
import { IconCheck, IconWarn } from "../components/icons.tsx";

const AXES: { key: keyof NonNullable<Resume["scoreBreakdown"]>; label: string }[] = [
  { key: "keywords", label: "Mots-clés" },
  { key: "structure", label: "Structure" },
  { key: "readability", label: "Lisibilité" },
  { key: "sections", label: "Sections" },
  { key: "atsCompat", label: "Format" },
];

export default function AtsAnalysis() {
  const [resumes, setResumes] = useState<ResumeSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [resume, setResume] = useState<Resume | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listResumes()
      .then((list) => {
        setResumes(list);
        const scored = list.filter((r) => r.ats_score != null);
        const best = scored[0] || list[0];
        if (best) setSelectedId(String(best.id));
      })
      .catch(() => setError("Impossible de charger vos CV."));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    getResume(selectedId)
      .then(setResume)
      .catch(() => setError("CV introuvable."));
  }, [selectedId]);

  const strengths = useMemo(
    () => (resume?.scoreBreakdown ? AXES.filter((a) => resume.scoreBreakdown![a.key] >= 75).map((a) => a.label) : []),
    [resume]
  );

  function downloadReport() {
    if (!resume) return;
    const lines = [
      `Rapport d'analyse ATS — ${resume.title}`,
      `Score global : ${resume.atsScore}/100`,
      "",
      "Répartition :",
      ...AXES.map((a) => `- ${a.label} : ${resume.scoreBreakdown?.[a.key] ?? 0}/100`),
      "",
      "Points forts :",
      ...(strengths.length ? strengths.map((s) => `- ${s}`) : ["- (aucun point au-dessus de 75% pour l'instant)"]),
      "",
      "À améliorer :",
      ...(resume.recommendations?.length
        ? resume.recommendations.map((r) => `- ${r.issue} → ${r.fix}`)
        : ["- Aucune recommandation, votre CV est bien optimisé."]),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analyse-ats-${resume.title}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const eyebrow = (
    <div className="font-semibold text-xs uppercase" style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.14em", color: "var(--t-muted)" }}>
      Optimiser
    </div>
  );

  if (resumes && resumes.length === 0) {
    return (
      <div className="max-w-[720px] flex flex-col gap-2">
        {eyebrow}
        <h1 className="font-black text-3xl m-0" style={{ fontFamily: "var(--t-display)" }}>
          Analyse ATS
        </h1>
        <div className="rounded-[var(--t-r-lg)] px-6 py-14 text-center mt-4" style={{ border: "1px dashed var(--t-line-soft)" }}>
          <p className="text-sm" style={{ color: "var(--t-ink2)" }}>
            Importez ou créez un CV pour obtenir une analyse détaillée.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1080px] flex flex-col gap-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          {eyebrow}
          <h1 className="font-black leading-[1.15] m-0" style={{ fontFamily: "var(--t-display)", fontSize: "clamp(28px,3vw,36px)" }}>
            Analyse ATS
          </h1>
          <p className="m-0 text-base" style={{ color: "var(--t-ink2)" }}>
            {resume ? `Résultat pour « ${resume.title} ».` : "Choisissez un CV à analyser."}
          </p>
        </div>
        {resumes && resumes.length > 0 && (
          <label className="flex flex-col gap-1.5">
            <span className="sr-only">CV à analyser</span>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="min-h-11 px-3 rounded-[var(--t-r-md)] text-[15px] outline-none"
              style={{ border: "1.5px solid var(--t-field-line)", background: "var(--t-field)", color: "var(--t-ink)" }}
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.ats_score ?? "—"}/100)
                </option>
              ))}
            </select>
          </label>
        )}
      </header>

      {error && <p style={{ color: "var(--t-danger)" }}>{error}</p>}
      {!resume && !error && (
        <p className="text-sm" style={{ color: "var(--t-muted)" }}>
          Chargement...
        </p>
      )}

      {resume && (
        <>
          <section
            className="p-6 rounded-[var(--t-r-lg)] flex flex-wrap items-center gap-7"
            style={{ background: "var(--t-surface)", border: "1px solid var(--t-line-soft)" }}
          >
            <ScoreGauge score={resume.atsScore} size={150} stroke={10} showLabel={false} />
            <div className="flex-1 min-w-[220px] flex flex-col gap-2">
              <h2 className="font-black text-2xl m-0" style={{ fontFamily: "var(--t-display)" }}>
                {scoreLabel(resume.atsScore)}
              </h2>
              <p className="m-0 text-base" style={{ color: "var(--t-ink2)" }}>
                Votre CV est optimisé pour les systèmes de recrutement automatisés selon {AXES.length} critères.
              </p>
            </div>
          </section>

          <div className="grid gap-5 items-start" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))" }}>
            <section
              aria-labelledby="an-crit"
              className="p-6 rounded-[var(--t-r-lg)] flex flex-col gap-4"
              style={{ background: "var(--t-surface)", border: "1px solid var(--t-line-soft)" }}
            >
              <h2 id="an-crit" className="font-black text-xl m-0" style={{ fontFamily: "var(--t-display)" }}>
                Détail par critère
              </h2>
              {AXES.map((a) => {
                const v = resume.scoreBreakdown?.[a.key] ?? 0;
                return (
                  <div key={a.key} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[15px]">
                      <span>{a.label}</span>
                      <span className="font-semibold">{v}</span>
                    </div>
                    <div aria-hidden="true" className="h-2 rounded overflow-hidden" style={{ background: "var(--t-track)" }}>
                      <div className="h-full" style={{ width: `${v}%`, background: v >= 75 ? "var(--t-accent)" : "var(--t-warn)" }} />
                    </div>
                  </div>
                );
              })}
            </section>

            <section
              aria-labelledby="an-list"
              className="p-6 rounded-[var(--t-r-lg)] flex flex-col"
              style={{ background: "var(--t-surface)", border: "1px solid var(--t-line-soft)" }}
            >
              <h2 id="an-list" className="font-black text-xl m-0 mb-2" style={{ fontFamily: "var(--t-display)" }}>
                Points relevés
              </h2>
              <ul className="list-none m-0 p-0">
                {(resume.recommendations || []).map((r, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-3 py-3.5" style={{ borderTop: "1px solid var(--t-line-soft)" }}>
                    <span className="shrink-0 flex" style={{ color: "var(--t-warn)" }}>
                      <IconWarn className="w-[18px] h-[18px]" />
                    </span>
                    <span className="flex-1 min-w-[220px] text-[15px] leading-[1.45]">{r.issue}</span>
                    <Link
                      to={`/cv/${resume.id}`}
                      className="inline-flex items-center justify-center gap-2 min-h-10 px-4 rounded-[var(--t-r-md)] font-semibold text-sm"
                      style={{ border: "1.5px solid var(--t-field-line)", background: "var(--t-surface)", color: "var(--t-ink)" }}
                    >
                      Corriger
                    </Link>
                  </li>
                ))}
                {strengths.map((s) => (
                  <li key={s} className="flex flex-wrap items-center gap-3 py-3.5" style={{ borderTop: "1px solid var(--t-line-soft)" }}>
                    <span className="shrink-0 flex" style={{ color: "var(--t-accent)" }}>
                      <IconCheck className="w-[18px] h-[18px]" />
                    </span>
                    <span className="flex-1 min-w-[220px] text-[15px] leading-[1.45]">{s} au-dessus de 75/100.</span>
                  </li>
                ))}
                {(resume.recommendations?.length ?? 0) === 0 && strengths.length === 0 && (
                  <li className="py-3.5 text-sm" style={{ color: "var(--t-muted)" }}>
                    Aucun point notable pour l'instant.
                  </li>
                )}
              </ul>
            </section>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={downloadReport}
              className="inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-[var(--t-r-md)] font-semibold text-[15px] cursor-pointer"
              style={{ border: "1.5px solid var(--t-line)", background: "var(--t-accent)", color: "var(--t-on-accent)", boxShadow: "0 2px 0 var(--t-shadow)" }}
            >
              Télécharger le rapport
            </button>
          </div>
        </>
      )}
    </div>
  );
}
