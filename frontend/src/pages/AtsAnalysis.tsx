import { useEffect, useMemo, useState } from "react";
import { type Resume, type ResumeSummary, getResume, listResumes } from "../lib/resumeApi";
import ScoreGauge from "../components/ScoreGauge.tsx";
import { IconCheck, IconWarn } from "../components/icons.tsx";

const AXES: { key: keyof NonNullable<Resume["scoreBreakdown"]>; label: string; max: number }[] = [
  { key: "keywords", label: "Mots-clés", max: 30 },
  { key: "structure", label: "Structure", max: 20 },
  { key: "readability", label: "Lisibilité", max: 20 },
  { key: "sections", label: "Sections", max: 20 },
  { key: "atsCompat", label: "Format", max: 10 },
];

function polygonPoints(values: number[], cx: number, cy: number, radius: number) {
  return values
    .map((v, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / values.length;
      const r = radius * Math.max(0, Math.min(1, v));
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    })
    .join(" ");
}

function RadarChart({ ratios, labels }: { ratios: number[]; labels: string[] }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 92;
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings.map((r) => (
        <polygon key={r} points={polygonPoints(new Array(ratios.length).fill(r), cx, cy, radius)} fill="none" stroke="var(--border)" strokeWidth="1" />
      ))}
      {ratios.map((_, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / ratios.length;
        return (
          <line key={i} x1={cx} y1={cy} x2={cx + radius * Math.cos(angle)} y2={cy + radius * Math.sin(angle)} stroke="var(--border)" strokeWidth="1" />
        );
      })}
      <polygon points={polygonPoints(ratios, cx, cy, radius)} fill="var(--violet-glow)" stroke="var(--violet-soft)" strokeWidth="2" />
      {ratios.map((v, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / ratios.length;
        const r = radius * v;
        return <circle key={i} cx={cx + r * Math.cos(angle)} cy={cy + r * Math.sin(angle)} r="3" fill="var(--violet-soft)" />;
      })}
      {labels.map((label, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / labels.length;
        const lx = cx + (radius + 22) * Math.cos(angle);
        const ly = cy + (radius + 22) * Math.sin(angle);
        return (
          <text key={label} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="var(--text-dim)">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

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

  const ratios = useMemo(() => AXES.map((a) => (resume?.scoreBreakdown ? resume.scoreBreakdown[a.key] / a.max : 0)), [resume]);
  const strengths = useMemo(
    () => (resume?.scoreBreakdown ? AXES.filter((a) => resume.scoreBreakdown![a.key] / a.max >= 0.75).map((a) => a.label) : []),
    [resume]
  );

  function downloadReport() {
    if (!resume) return;
    const lines = [
      `Rapport d'analyse ATS — ${resume.title}`,
      `Score global : ${resume.atsScore}/100`,
      "",
      "Répartition :",
      ...AXES.map((a) => `- ${a.label} : ${resume.scoreBreakdown?.[a.key] ?? 0}/${a.max}`),
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

  if (resumes && resumes.length === 0) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold mb-3">Analyse ATS</h1>
        <div className="border border-dashed border-[var(--border)] rounded-xl px-6 py-14 text-center">
          <p className="text-sm text-[var(--text-dim)]">Importez ou créez un CV pour obtenir une analyse détaillée.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <h1 className="text-2xl font-bold">Analyse ATS détaillée</h1>
        {resumes && resumes.length > 0 && (
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--violet-soft)]"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.ats_score ?? "—"}/100)
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <p className="text-sm text-[var(--danger)] mb-4">{error}</p>}
      {!resume && <p className="text-sm text-[var(--text-faint)]">Chargement...</p>}

      {resume && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <ScoreGauge score={resume.atsScore} size={140} />
            <p className="text-xs text-[var(--text-dim)] mt-3">Votre CV est bien optimisé pour les systèmes ATS.</p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 flex flex-col items-center">
            <p className="text-xs font-[var(--ff-mono)] uppercase tracking-widest text-[var(--text-faint)] mb-2 self-start">Répartition des scores</p>
            <RadarChart ratios={ratios} labels={AXES.map((a) => a.label)} />
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <p className="text-xs font-[var(--ff-mono)] uppercase tracking-widest text-[var(--good)] mb-3">Points forts</p>
              {strengths.length === 0 && <p className="text-xs text-[var(--text-faint)]">Aucune catégorie au-dessus de 75% pour l'instant.</p>}
              <div className="flex flex-col gap-2">
                {strengths.map((s) => (
                  <div key={s} className="flex items-center gap-2 text-sm">
                    <IconCheck className="w-4 h-4 text-[var(--good)] shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <p className="text-xs font-[var(--ff-mono)] uppercase tracking-widest text-[var(--warn)] mb-3">À améliorer</p>
              {(!resume.recommendations || resume.recommendations.length === 0) && (
                <p className="text-xs text-[var(--text-faint)]">Aucune recommandation — votre CV est bien optimisé.</p>
              )}
              <div className="flex flex-col gap-2">
                {(resume.recommendations || []).map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <IconWarn className="w-4 h-4 text-[var(--warn)] shrink-0 mt-0.5" />
                    {r.issue}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {resume && (
        <div className="flex justify-center mt-6">
          <button
            onClick={downloadReport}
            className="bg-[var(--violet)] hover:bg-[var(--violet-soft)] transition-colors rounded-lg px-5 py-2.5 text-sm font-medium text-white cursor-pointer"
          >
            Télécharger le rapport
          </button>
        </div>
      )}
    </div>
  );
}
