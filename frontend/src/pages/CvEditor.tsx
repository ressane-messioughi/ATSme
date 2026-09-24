import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  type Certification,
  type Education,
  type Experience,
  type Link,
  type NamedItem,
  type Project,
  type Recommendation,
  type Resume,
  type ResumeData,
  type ScoreBreakdown,
  downloadExport,
  duplicateVersion,
  emptyResumeData,
  getResume,
  jobMatch,
  latestJobMatch,
  listVersions,
  restoreVersion,
  rid,
  saveVersion,
  updateResume,
} from "../lib/resumeApi";
import ScoreGauge from "../components/ScoreGauge.tsx";
import CvPreview from "../components/CvPreview.tsx";
import { IconChevronDown, IconChevronUp, IconTrash } from "../components/icons.tsx";

const TABS = [
  { key: "informations", label: "Informations" },
  { key: "experience", label: "Expérience" },
  { key: "formation", label: "Formation" },
  { key: "competences", label: "Compétences" },
  { key: "langues", label: "Langues" },
  { key: "certifications", label: "Certifications" },
  { key: "projets", label: "Projets" },
  { key: "interets", label: "Centres d'intérêt" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const BREAKDOWN_LABELS: Record<keyof ScoreBreakdown, [string, number]> = {
  keywords: ["Mots-clés", 30],
  structure: ["Structure", 20],
  readability: ["Lisibilité", 20],
  sections: ["Sections", 20],
  atsCompat: ["Format", 10],
};

const toneClass = { good: "text-[var(--good)]", warn: "text-[var(--warn)]", danger: "text-[var(--danger)]" };
const dotClass = { good: "bg-[var(--good)]", warn: "bg-[var(--warn)]", danger: "bg-[var(--danger)]" };

function toneOf(value: number, max: number): "good" | "warn" | "danger" {
  const pct = value / max;
  if (pct >= 0.75) return "good";
  if (pct >= 0.45) return "warn";
  return "danger";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-[var(--ff-mono)] uppercase tracking-wider text-[var(--text-faint)]">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[var(--violet-soft)] transition-colors w-full";

function TagsInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  function commit() {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  }
  return (
    <div className="flex flex-wrap gap-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 focus-within:border-[var(--violet-soft)] transition-colors">
      {values.map((v, i) => (
        <span key={v + i} className="flex items-center gap-1.5 bg-[var(--violet-glow)] text-[var(--violet-soft)] text-xs rounded-md px-2 py-1">
          {v}
          <button type="button" onClick={() => onChange(values.filter((_, idx) => idx !== i))} className="cursor-pointer hover:text-[var(--text)]">
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
        placeholder={values.length ? "" : placeholder}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
      />
    </div>
  );
}

function ObjectTagsInput<T>({
  items,
  onChange,
  getLabel,
  makeItem,
  placeholder,
}: {
  items: T[];
  onChange: (v: T[]) => void;
  getLabel: (item: T) => string;
  makeItem: (label: string) => T;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  function commit() {
    const v = draft.trim();
    if (v) onChange([...items, makeItem(v)]);
    setDraft("");
  }
  return (
    <div className="flex flex-wrap gap-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2.5 focus-within:border-[var(--violet-soft)] transition-colors">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5 bg-[var(--violet-glow)] text-[var(--violet-soft)] text-xs rounded-md px-2 py-1">
          {getLabel(item)}
          <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="cursor-pointer hover:text-[var(--text)]">
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
        placeholder={items.length ? "" : placeholder}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
      />
    </div>
  );
}

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const copy = arr.slice();
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function ReorderButtons({ index, length, onMove }: { index: number; length: number; onMove: (dir: -1 | 1) => void }) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(-1)}
        className="text-[var(--text-faint)] hover:text-[var(--text)] disabled:opacity-25 cursor-pointer disabled:cursor-default"
      >
        <IconChevronUp className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        disabled={index === length - 1}
        onClick={() => onMove(1)}
        className="text-[var(--text-faint)] hover:text-[var(--text)] disabled:opacity-25 cursor-pointer disabled:cursor-default"
      >
        <IconChevronDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function CvEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [data, setData] = useState<ResumeData>(emptyResumeData());
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState("violet");
  const [score, setScore] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<ScoreBreakdown | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [tab, setTab] = useState<TabKey>("informations");
  // Sur mobile/tablette, l'éditeur doit être visible par défaut (pas l'aperçu vide) —
  // le bouton "Aperçu" dans la barre du haut permet de basculer.
  const [showPreview, setShowPreview] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const [jobText, setJobText] = useState("");
  const [matchResult, setMatchResult] = useState<{ score: number; matched: string[]; missing: string[] } | null>(null);
  const [matching, setMatching] = useState(false);

  const [versions, setVersions] = useState<{ id: number; label: string | null; ats_score: number | null; created_at: string }[]>([]);

  useEffect(() => {
    if (!id) return;
    getResume(id)
      .then((r) => {
        setResume(r);
        setData(r.data);
        setTitle(r.title);
        setTemplate(r.template);
        setScore(r.atsScore);
        setBreakdown(r.scoreBreakdown);
        setRecommendations(r.recommendations || []);
      })
      .catch(() => setError("CV introuvable."));
    listVersions(id).then(setVersions).catch(() => {});
    latestJobMatch(id).then(setMatchResult).catch(() => {});
  }, [id]);

  async function onSave() {
    if (!id) return;
    setSaveState("saving");
    try {
      const res = await updateResume(id, { title, template, data });
      setScore(res.total);
      setBreakdown(res.breakdown);
      setRecommendations(res.recommendations);
      setSaveState("saved");
      setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 2500);
    } catch {
      setSaveState("error");
    }
  }

  // Auto-save : sauvegarde silencieuse 1,5s après la dernière modification, sans bloquer la
  // saisie. Le bouton "Enregistrer" reste disponible pour un enregistrement immédiat.
  const loadedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!resume) return;
    if (!loadedRef.current) {
      loadedRef.current = true;
      return;
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onSave();
    }, 1500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, title, template]);

  async function onSaveVersion() {
    if (!id) return;
    const label = prompt("Nom de cette version (optionnel) :") || undefined;
    await saveVersion(id, label);
    listVersions(id).then(setVersions);
  }

  async function onRestore(versionId: number) {
    if (!id) return;
    if (!confirm("Restaurer cette version ? Les modifications non enregistrées seront perdues.")) return;
    const res = await restoreVersion(id, versionId);
    setData(res.data);
    setScore(res.total);
    setBreakdown(res.breakdown);
    setRecommendations(res.recommendations);
  }

  async function onDuplicateVersion(versionId: number) {
    if (!id) return;
    try {
      const created = await duplicateVersion(id, versionId);
      navigate(`/cv/${created.id}`);
    } catch {
      setError("La duplication de cette version a échoué.");
    }
  }

  async function onJobMatch() {
    if (!id || !jobText.trim()) return;
    setMatching(true);
    try {
      const res = await jobMatch(id, jobText);
      setMatchResult(res);
    } catch {
      setError("L'analyse de l'offre a échoué.");
    } finally {
      setMatching(false);
    }
  }

  function updateData<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }
  function updatePersonal<K extends keyof ResumeData["personal"]>(key: K, value: ResumeData["personal"][K]) {
    setData((d) => ({ ...d, personal: { ...d.personal, [key]: value } }));
  }

  if (error && !resume) return <p className="text-sm text-[var(--danger)]">{error}</p>;
  if (!resume) return null;

  return (
    <div className="max-w-[1400px]">
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <button onClick={() => navigate("/cv")} className="text-xs font-[var(--ff-mono)] text-[var(--text-faint)] hover:text-[var(--text)] mb-2 cursor-pointer">
            ← Mes CV
          </button>
          <div className="flex items-center gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold bg-transparent outline-none border-b border-transparent focus:border-[var(--border)]"
            />
            <span className="text-xs text-[var(--text-faint)] font-[var(--ff-mono)]">
              {saveState === "saving" ? "Enregistrement..." : saveState === "saved" ? "✓ Enregistré" : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="lg:hidden text-xs font-[var(--ff-mono)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text-dim)] hover:border-[var(--violet-soft)] transition-colors cursor-pointer"
          >
            {showPreview ? "Éditeur" : "Aperçu"}
          </button>
          <button
            onClick={onSave}
            disabled={saveState === "saving"}
            className="bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--violet-soft)] transition-colors rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60 cursor-pointer"
          >
            Enregistrer
          </button>
          <button
            onClick={() => setExportOpen(true)}
            className="bg-[var(--violet)] hover:bg-[var(--violet-soft)] transition-colors rounded-lg px-4 py-2 text-sm font-medium text-white cursor-pointer"
          >
            Exporter
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-[var(--danger)] mb-4">{error}</p>}

      <div className="flex gap-1 border-b border-[var(--border)] mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3.5 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer ${
              tab === t.key ? "border-[var(--violet)] text-[var(--text)] font-medium" : "border-transparent text-[var(--text-faint)] hover:text-[var(--text-dim)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr_300px] gap-6">
        <div className={`min-w-0 ${showPreview ? "hidden lg:block" : ""}`}>
          {tab === "informations" && (
            <div className="flex flex-col gap-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nom complet">
                  <input className={inputCls} value={data.personal.fullName} onChange={(e) => updatePersonal("fullName", e.target.value)} />
                </Field>
                <Field label="Titre professionnel">
                  <input className={inputCls} value={data.personal.title} onChange={(e) => updatePersonal("title", e.target.value)} />
                </Field>
                <Field label="Email">
                  <input className={inputCls} value={data.personal.email} onChange={(e) => updatePersonal("email", e.target.value)} />
                </Field>
                <Field label="Téléphone">
                  <input className={inputCls} value={data.personal.phone} onChange={(e) => updatePersonal("phone", e.target.value)} />
                </Field>
                <Field label="Localisation">
                  <input className={inputCls} value={data.personal.location} onChange={(e) => updatePersonal("location", e.target.value)} />
                </Field>
                <Field label="Liens (LinkedIn, portfolio...)">
                  <ObjectTagsInput<Link>
                    items={data.personal.links}
                    onChange={(v) => updatePersonal("links", v)}
                    getLabel={(l) => l.url}
                    makeItem={(url) => ({ label: "Lien", url: /^https?:\/\//i.test(url) ? url : `https://${url}` })}
                    placeholder="Ajouter un lien"
                  />
                </Field>
              </div>
              <Field label="Résumé professionnel">
                <textarea
                  className={`${inputCls} min-h-[110px] resize-y`}
                  value={data.summary}
                  onChange={(e) => updateData("summary", e.target.value)}
                  placeholder="2 à 4 phrases résumant votre profil et vos objectifs."
                />
              </Field>
            </div>
          )}

          {tab === "experience" && <ExperienceList experiences={data.experiences} onChange={(v) => updateData("experiences", v)} />}
          {tab === "formation" && <EducationList education={data.education} onChange={(v) => updateData("education", v)} />}
          {tab === "competences" && (
            <ObjectTagsInput<NamedItem>
              items={data.skills}
              onChange={(v) => updateData("skills", v)}
              getLabel={(s) => s.name}
              makeItem={(name) => ({ id: rid(), name, level: "" })}
              placeholder="Ajouter une compétence"
            />
          )}
          {tab === "langues" && (
            <ObjectTagsInput<NamedItem>
              items={data.languages}
              onChange={(v) => updateData("languages", v)}
              getLabel={(l) => l.name}
              makeItem={(name) => ({ id: rid(), name, level: "" })}
              placeholder="Ajouter une langue"
            />
          )}
          {tab === "certifications" && (
            <ObjectTagsInput<Certification>
              items={data.certifications}
              onChange={(v) => updateData("certifications", v)}
              getLabel={(c) => c.name}
              makeItem={(name) => ({ id: rid(), name, issuer: "", date: "" })}
              placeholder="Ajouter une certification"
            />
          )}
          {tab === "projets" && <ProjectList projects={data.projects} onChange={(v) => updateData("projects", v)} />}
          {tab === "interets" && (
            <TagsInput values={data.interests} onChange={(v) => updateData("interests", v)} placeholder="Ajouter un centre d'intérêt" />
          )}
        </div>

        <div className={`min-w-0 ${showPreview ? "" : "hidden lg:block"}`}>
          <div className="sticky top-6">
            <CvPreview data={data} />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <p className="text-xs font-[var(--ff-mono)] uppercase tracking-widest text-[var(--text-faint)] mb-4 text-center">Score ATS</p>
            <div className="flex justify-center mb-4">
              <ScoreGauge score={score} size={110} />
            </div>
            {breakdown && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-[var(--ff-mono)] uppercase tracking-widest text-[var(--text-faint)] mb-1">Détails de l'analyse</p>
                {(Object.keys(BREAKDOWN_LABELS) as (keyof ScoreBreakdown)[]).map((key) => {
                  const [label, max] = BREAKDOWN_LABELS[key];
                  const value = breakdown[key] ?? 0;
                  const tone = toneOf(value, max);
                  return (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-[var(--text-dim)]">
                        <span className={`w-1.5 h-1.5 rounded-full ${dotClass[tone]}`} />
                        {label}
                      </span>
                      <span className="font-[var(--ff-mono)]">
                        {value}/{max}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {recommendations.length > 0 && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <p className="text-xs font-[var(--ff-mono)] uppercase tracking-widest text-[var(--text-faint)] mb-3">Recommandations</p>
              <div className="flex flex-col gap-4">
                {recommendations.map((r, i) => (
                  <div key={i} className="border-l-2 border-[var(--warn)] pl-3">
                    <p className="text-sm font-medium mb-1">{r.issue}</p>
                    <p className={`text-xs ${toneClass.good}`}>{r.fix}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-[var(--ff-mono)] uppercase tracking-widest text-[var(--text-faint)]">Versions</p>
              <button onClick={onSaveVersion} className="text-xs text-[var(--violet-soft)] hover:underline cursor-pointer">
                + Nouvelle
              </button>
            </div>
            {versions.length === 0 && <p className="text-xs text-[var(--text-faint)]">Aucune version enregistrée.</p>}
            <div className="flex flex-col gap-2">
              {versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-dim)]">
                    {v.label || new Date(v.created_at).toLocaleDateString("fr-FR")} · {v.ats_score ?? "—"}/100
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <button onClick={() => onRestore(v.id)} className="text-[var(--violet-soft)] hover:underline cursor-pointer">
                      Restaurer
                    </button>
                    <button onClick={() => onDuplicateVersion(v.id)} className="text-[var(--text-dim)] hover:underline cursor-pointer">
                      Dupliquer
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <p className="text-xs font-[var(--ff-mono)] uppercase tracking-widest text-[var(--text-faint)] mb-3">Matching offre d'emploi</p>
            <textarea
              className={`${inputCls} min-h-[80px] resize-y mb-3`}
              placeholder="Collez le texte de l'offre ici..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            />
            <button
              onClick={onJobMatch}
              disabled={matching || !jobText.trim()}
              className="w-full bg-[var(--violet)] hover:bg-[var(--violet-soft)] transition-colors rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50 cursor-pointer mb-3"
            >
              {matching ? "Analyse..." : "Analyser le matching"}
            </button>
            {matchResult && (
              <div>
                <p className="font-[var(--ff-mono)] text-2xl font-bold mb-2">{matchResult.score}%</p>
                {matchResult.missing.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missing.slice(0, 8).map((k) => (
                      <span key={k} className="text-xs bg-[var(--surface-2)] text-[var(--danger)] rounded px-1.5 py-0.5">
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {exportOpen && (
        <ExportModal
          resumeId={resume.id}
          title={title}
          data={data}
          onClose={() => setExportOpen(false)}
        />
      )}
    </div>
  );
}

function ExportModal({ resumeId, title, data, onClose }: { resumeId: number; title: string; data: ResumeData; onClose: () => void }) {
  const [format, setFormat] = useState<"pdf" | "docx" | "txt">("pdf");
  const [exporting, setExporting] = useState(false);
  const options = [
    { value: "pdf" as const, label: "PDF (Recommandé)", desc: "Format universel, idéal pour les candidatures en ligne." },
    { value: "docx" as const, label: "DOCX", desc: "Format modifiable, parfait pour les modifications futures." },
    { value: "txt" as const, label: "TXT", desc: "Format texte brut, compatible avec tous les systèmes ATS." },
  ];

  async function onExport() {
    setExporting(true);
    try {
      await downloadExport(resumeId, format, title || "cv");
      onClose();
    } catch {
      setExporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 max-w-3xl w-full grid md:grid-cols-[1fr_260px] gap-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold">Exporter mon CV</h2>
            <button onClick={onClose} className="text-[var(--text-faint)] hover:text-[var(--text)] cursor-pointer text-xl leading-none">
              ×
            </button>
          </div>
          <p className="text-sm text-[var(--text-dim)] mb-5">Choisissez le format qui vous convient le mieux.</p>
          <div className="flex flex-col gap-3 mb-5">
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => setFormat(o.value)}
                className={`text-left border rounded-xl px-4 py-3 transition-colors cursor-pointer ${
                  format === o.value ? "border-[var(--violet-soft)] bg-[var(--violet-glow)]" : "border-[var(--border)] hover:border-[var(--text-faint)]"
                }`}
              >
                <p className="text-sm font-medium mb-0.5">{o.label}</p>
                <p className="text-xs text-[var(--text-dim)]">{o.desc}</p>
              </button>
            ))}
          </div>
          <button
            onClick={onExport}
            disabled={exporting}
            className="w-full bg-[var(--violet)] hover:bg-[var(--violet-soft)] transition-colors rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
          >
            {exporting ? "Export en cours..." : "Exporter le CV"}
          </button>
        </div>
        <div className="hidden md:block">
          <p className="text-xs font-[var(--ff-mono)] uppercase tracking-widest text-[var(--text-faint)] mb-2">Aperçu</p>
          <div className="scale-[0.85] origin-top-left w-[118%]">
            <CvPreview data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ExperienceList({ experiences, onChange }: { experiences: Experience[]; onChange: (v: Experience[]) => void }) {
  function update(i: number, patch: Partial<Experience>) {
    onChange(experiences.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  }
  function remove(i: number) {
    onChange(experiences.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...experiences, { company: "", role: "", location: "", startDate: "", endDate: "", description: "", achievements: [] }]);
  }
  return (
    <div className="flex flex-col gap-4">
      {experiences.map((exp, i) => (
        <div key={i} className="border border-[var(--border)] rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <ReorderButtons index={i} length={experiences.length} onMove={(dir) => onChange(move(experiences, i, i + dir))} />
            <button onClick={() => remove(i)} className="text-[var(--danger)] hover:opacity-80 cursor-pointer">
              <IconTrash className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <Field label="Poste">
              <input className={inputCls} value={exp.role} onChange={(e) => update(i, { role: e.target.value })} />
            </Field>
            <Field label="Entreprise">
              <input className={inputCls} value={exp.company} onChange={(e) => update(i, { company: e.target.value })} />
            </Field>
            <Field label="Localisation">
              <input className={inputCls} value={exp.location || ""} onChange={(e) => update(i, { location: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Début">
                <input className={inputCls} placeholder="2022-01" value={exp.startDate} onChange={(e) => update(i, { startDate: e.target.value })} />
              </Field>
              <Field label="Fin">
                <input className={inputCls} placeholder="présent" value={exp.endDate || ""} onChange={(e) => update(i, { endDate: e.target.value })} />
              </Field>
            </div>
          </div>
          <Field label="Description">
            <textarea className={`${inputCls} min-h-[70px] resize-y`} value={exp.description || ""} onChange={(e) => update(i, { description: e.target.value })} />
          </Field>
          <div className="mt-3">
            <Field label="Réalisations">
              <TagsInput values={exp.achievements} onChange={(v) => update(i, { achievements: v })} placeholder="Ajouter une réalisation chiffrée" />
            </Field>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="border border-dashed border-[var(--border)] hover:border-[var(--violet-soft)] transition-colors rounded-xl py-3 text-sm text-[var(--text-dim)] cursor-pointer"
      >
        + Ajouter une expérience
      </button>
    </div>
  );
}

function EducationList({ education, onChange }: { education: Education[]; onChange: (v: Education[]) => void }) {
  function update(i: number, patch: Partial<Education>) {
    onChange(education.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  }
  function remove(i: number) {
    onChange(education.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...education, { school: "", degree: "", date: "" }]);
  }
  return (
    <div className="flex flex-col gap-3">
      {education.map((ed, i) => (
        <div key={i} className="border border-[var(--border)] rounded-xl p-4 flex gap-3">
          <ReorderButtons index={i} length={education.length} onMove={(dir) => onChange(move(education, i, i + dir))} />
          <div className="flex-1 grid sm:grid-cols-3 gap-3">
            <Field label="Diplôme">
              <input className={inputCls} value={ed.degree} onChange={(e) => update(i, { degree: e.target.value })} />
            </Field>
            <Field label="Établissement">
              <input className={inputCls} value={ed.school} onChange={(e) => update(i, { school: e.target.value })} />
            </Field>
            <div className="flex gap-2 items-end">
              <Field label="Date">
                <input className={inputCls} value={ed.date || ""} onChange={(e) => update(i, { date: e.target.value })} />
              </Field>
              <button onClick={() => remove(i)} className="text-[var(--danger)] hover:opacity-80 cursor-pointer mb-2.5 shrink-0">
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="border border-dashed border-[var(--border)] hover:border-[var(--violet-soft)] transition-colors rounded-xl py-3 text-sm text-[var(--text-dim)] cursor-pointer"
      >
        + Ajouter une formation
      </button>
    </div>
  );
}

function ProjectList({ projects, onChange }: { projects: Project[]; onChange: (v: Project[]) => void }) {
  function update(i: number, patch: Partial<Project>) {
    onChange(projects.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }
  function remove(i: number) {
    onChange(projects.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...projects, { id: rid(), name: "", description: "", url: "" }]);
  }
  return (
    <div className="flex flex-col gap-3">
      {projects.map((p, i) => (
        <div key={i} className="border border-[var(--border)] rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <ReorderButtons index={i} length={projects.length} onMove={(dir) => onChange(move(projects, i, i + dir))} />
            <button onClick={() => remove(i)} className="text-[var(--danger)] hover:opacity-80 cursor-pointer">
              <IconTrash className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <Field label="Nom">
              <input className={inputCls} value={p.name} onChange={(e) => update(i, { name: e.target.value })} />
            </Field>
            <Field label="Lien">
              <input className={inputCls} value={p.url || ""} onChange={(e) => update(i, { url: e.target.value })} />
            </Field>
          </div>
          <Field label="Description">
            <textarea className={`${inputCls} min-h-[60px] resize-y`} value={p.description || ""} onChange={(e) => update(i, { description: e.target.value })} />
          </Field>
        </div>
      ))}
      <button
        onClick={add}
        className="border border-dashed border-[var(--border)] hover:border-[var(--violet-soft)] transition-colors rounded-xl py-3 text-sm text-[var(--text-dim)] cursor-pointer"
      >
        + Ajouter un projet
      </button>
    </div>
  );
}
