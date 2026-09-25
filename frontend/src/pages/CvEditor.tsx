import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
import { IconChevronDown, IconChevronUp, IconPlusCircle, IconTrash } from "../components/icons.tsx";
import { resizePhotoToDataUrl } from "../lib/photo.ts";
import { btnPrimaryCls, btnSecondaryCls, chipCls, chipRemoveCls, dashedAddCls, inputCls, labelCls } from "../lib/ui.ts";

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
const barClass = { good: "bg-[var(--good)]", warn: "bg-[var(--warn)]", danger: "bg-[var(--danger)]" };

function toneOf(value: number, max: number): "good" | "warn" | "danger" {
  const pct = value / max;
  if (pct >= 0.75) return "good";
  if (pct >= 0.45) return "warn";
  return "danger";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

const tagsWrapCls =
  "flex flex-wrap items-center gap-1.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2.5 transition-all duration-150 hover:border-[var(--text-faint)] focus-within:border-[var(--violet-soft)] focus-within:ring-[3px] focus-within:ring-[var(--violet-glow)]";
const tagsInputCls = "flex-1 min-w-[120px] bg-transparent outline-none text-sm py-0.5";

function TagsInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  function commit() {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  }
  return (
    <div className={tagsWrapCls}>
      {values.map((v, i) => (
        <span key={v + i} className={chipCls}>
          {v}
          <button type="button" onClick={() => onChange(values.filter((_, idx) => idx !== i))} className={chipRemoveCls} aria-label={`Retirer ${v}`}>
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
        className={tagsInputCls}
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
    <div className={tagsWrapCls}>
      {items.map((item, i) => (
        <span key={i} className={chipCls}>
          {getLabel(item)}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className={chipRemoveCls}
            aria-label={`Retirer ${getLabel(item)}`}
          >
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
        className={tagsInputCls}
      />
    </div>
  );
}

function PhotoField({ photoUrl, onChange }: { photoUrl?: string; onChange: (dataUrl: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(file: File | undefined) {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      setError("Formats acceptés : JPEG, PNG ou WebP.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const dataUrl = await resizePhotoToDataUrl(file);
      onChange(dataUrl);
    } catch {
      setError("La photo n'a pas pu être traitée.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Field label="Photo (facultatif)">
      <div className="flex items-center gap-4 p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="group relative shrink-0 w-[68px] h-[68px] rounded-full border-2 border-dashed border-[var(--border)] hover:border-[var(--violet-soft)] focus-visible:border-[var(--violet-soft)] transition-colors overflow-hidden grid place-items-center cursor-pointer bg-[var(--surface)] disabled:opacity-60"
        >
          {photoUrl ? (
            <>
              <img src={photoUrl} alt="" className="w-full h-full object-cover" />
              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors grid place-items-center text-[10px] font-medium text-white opacity-0 group-hover:opacity-100">
                Changer
              </span>
            </>
          ) : (
            <span className="text-[var(--text-faint)] group-hover:text-[var(--violet-soft)] transition-colors">
              <IconPlusCircle className="w-5 h-5" />
            </span>
          )}
        </button>
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="text-xs font-medium text-[var(--violet-soft)] hover:text-[var(--text)] transition-colors cursor-pointer disabled:opacity-60"
            >
              {busy ? "Traitement..." : photoUrl ? "Changer la photo" : "Choisir une photo"}
            </button>
            {photoUrl && (
              <button type="button" onClick={() => onChange("")} className="text-xs font-medium text-[var(--danger)] hover:opacity-80 transition-opacity cursor-pointer">
                Retirer
              </button>
            )}
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--text-faint)] max-w-[280px]">
            Purement décorative dans l'export : elle n'entre jamais dans le texte analysé, donc n'affecte pas votre score ATS.
          </p>
          {error && <p className="text-[11px] text-[var(--danger)]">{error}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            onPick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    </Field>
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
    <div className="flex flex-col rounded-lg border border-[var(--border)] overflow-hidden shrink-0">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(-1)}
        aria-label="Monter"
        className="p-1 text-[var(--text-faint)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] disabled:opacity-25 cursor-pointer disabled:cursor-default transition-colors"
      >
        <IconChevronUp className="w-3.5 h-3.5" />
      </button>
      <div className="h-px bg-[var(--border)]" />
      <button
        type="button"
        disabled={index === length - 1}
        onClick={() => onMove(1)}
        aria-label="Descendre"
        className="p-1 text-[var(--text-faint)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] disabled:opacity-25 cursor-pointer disabled:cursor-default transition-colors"
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
          <button onClick={() => navigate("/cv")} className="flex items-center gap-1 text-xs font-[var(--ff-mono)] text-[var(--text-faint)] hover:text-[var(--text)] mb-2 cursor-pointer transition-colors">
            <span aria-hidden="true">←</span> Mes CV
          </button>
          <div className="flex items-center gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold bg-transparent outline-none rounded-md -mx-1.5 px-1.5 py-0.5 transition-colors focus:bg-[var(--surface-2)]"
            />
            <span className="flex items-center gap-1.5 text-xs text-[var(--text-faint)] font-[var(--ff-mono)]">
              {saveState === "saving" && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--warn)] animate-pulse" /> Enregistrement...
                </>
              )}
              {saveState === "saved" && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--good)]" /> Enregistré
                </>
              )}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="lg:hidden text-xs font-[var(--ff-mono)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[var(--text-dim)] hover:border-[var(--violet-soft)] transition-colors cursor-pointer"
          >
            {showPreview ? "Éditeur" : "Aperçu"}
          </button>
          <button onClick={onSave} disabled={saveState === "saving"} className={btnSecondaryCls}>
            Enregistrer
          </button>
          <button onClick={() => setExportOpen(true)} className={btnPrimaryCls}>
            Exporter
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-[var(--danger)] mb-4">{error}</p>}

      <div className="relative flex gap-1 border-b border-[var(--border)] mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative px-3.5 py-2.5 text-sm whitespace-nowrap transition-colors cursor-pointer ${
              tab === t.key ? "text-[var(--text)] font-medium" : "text-[var(--text-faint)] hover:text-[var(--text-dim)]"
            }`}
          >
            {t.label}
            {tab === t.key && (
              <motion.span layoutId="cv-editor-tab-underline" className="absolute left-0 right-0 -bottom-px h-0.5 bg-[var(--violet)] rounded-full" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
            )}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr_300px] gap-6">
        <div className={`min-w-0 ${showPreview ? "hidden lg:block" : ""}`}>
          {tab === "informations" && (
            <div className="flex flex-col gap-5">
              <PhotoField photoUrl={data.personal.photoUrl} onChange={(v) => updatePersonal("photoUrl", v)} />
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
            <div className="flex justify-center mb-5">
              <ScoreGauge score={score} size={110} />
            </div>
            {breakdown && (
              <div className="flex flex-col gap-3.5">
                <p className="text-xs font-[var(--ff-mono)] uppercase tracking-widest text-[var(--text-faint)] -mb-1">Détails de l'analyse</p>
                {(Object.keys(BREAKDOWN_LABELS) as (keyof ScoreBreakdown)[]).map((key) => {
                  const [label, max] = BREAKDOWN_LABELS[key];
                  const value = breakdown[key] ?? 0;
                  const tone = toneOf(value, max);
                  return (
                    <div key={key} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-dim)]">{label}</span>
                        <span className={`font-[var(--ff-mono)] font-medium ${toneClass[tone]}`}>
                          {value}/{max}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${barClass[tone]}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(value / max) * 100}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {recommendations.length > 0 && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <p className="text-xs font-[var(--ff-mono)] uppercase tracking-widest text-[var(--text-faint)] mb-3">Recommandations</p>
              <div className="flex flex-col gap-3.5">
                {recommendations.map((r, i) => (
                  <div key={i} className="rounded-lg bg-[var(--warn)]/8 border border-[var(--warn)]/20 p-3">
                    <p className="text-sm font-medium mb-1.5">{r.issue}</p>
                    <p className={`text-xs leading-relaxed ${toneClass.good}`}>→ {r.fix}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-[var(--ff-mono)] uppercase tracking-widest text-[var(--text-faint)]">Versions</p>
              <button onClick={onSaveVersion} className="flex items-center gap-1 text-xs font-medium text-[var(--violet-soft)] hover:text-[var(--text)] transition-colors cursor-pointer">
                <IconPlusCircle className="w-3.5 h-3.5" /> Nouvelle
              </button>
            </div>
            {versions.length === 0 && <p className="text-xs text-[var(--text-faint)]">Aucune version enregistrée.</p>}
            <div className="flex flex-col gap-1 -mx-2">
              {versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors">
                  <span className="text-[var(--text-dim)] truncate pr-2">
                    {v.label || new Date(v.created_at).toLocaleDateString("fr-FR")} · {v.ats_score ?? "—"}/100
                  </span>
                  <span className="flex items-center gap-2.5 shrink-0">
                    <button onClick={() => onRestore(v.id)} className="font-medium text-[var(--violet-soft)] hover:text-[var(--text)] transition-colors cursor-pointer">
                      Restaurer
                    </button>
                    <button onClick={() => onDuplicateVersion(v.id)} className="text-[var(--text-faint)] hover:text-[var(--text-dim)] transition-colors cursor-pointer">
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
            <button onClick={onJobMatch} disabled={matching || !jobText.trim()} className={`${btnPrimaryCls} w-full mb-3`}>
              {matching ? "Analyse..." : "Analyser le matching"}
            </button>
            {matchResult && (
              <div>
                <div className="flex items-baseline gap-2 mb-2.5">
                  <p className="font-[var(--ff-mono)] text-2xl font-bold">{matchResult.score}%</p>
                  <p className="text-xs text-[var(--text-faint)]">de correspondance</p>
                </div>
                {matchResult.missing.length > 0 && (
                  <>
                    <p className={`${labelCls} mb-1.5`}>Mots-clés manquants</p>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.missing.slice(0, 8).map((k) => (
                        <span key={k} className="text-xs bg-[var(--danger)]/10 border border-[var(--danger)]/25 text-[var(--danger)] rounded-full px-2 py-0.5">
                          {k}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {exportOpen && (
          <ExportModal
            resumeId={resume.id}
            title={title}
            data={data}
            onClose={() => setExportOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ExportModal({ resumeId, title, data, onClose }: { resumeId: number; title: string; data: ResumeData; onClose: () => void }) {
  const [format, setFormat] = useState<"pdf" | "docx" | "txt">("pdf");
  const [singlePage, setSinglePage] = useState(false);
  const [exporting, setExporting] = useState(false);
  const options = [
    { value: "pdf" as const, label: "PDF (Recommandé)", desc: "Format universel, idéal pour les candidatures en ligne." },
    { value: "docx" as const, label: "DOCX", desc: "Format modifiable, parfait pour les modifications futures." },
    { value: "txt" as const, label: "TXT", desc: "Format texte brut, compatible avec tous les systèmes ATS." },
  ];

  async function onExport() {
    setExporting(true);
    try {
      await downloadExport(resumeId, format, title || "cv", { singlePage: format === "pdf" && singlePage });
      onClose();
    } catch {
      setExporting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 max-w-3xl w-full grid md:grid-cols-[1fr_260px] gap-6 max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold">Exporter mon CV</h2>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="grid place-items-center w-7 h-7 rounded-full text-[var(--text-faint)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer text-xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-[var(--text-dim)] mb-5">Choisissez le format qui vous convient le mieux.</p>
          <div className="flex flex-col gap-2.5 mb-5">
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => setFormat(o.value)}
                className={`flex items-start gap-3 text-left border rounded-xl px-4 py-3 transition-all duration-150 cursor-pointer ${
                  format === o.value ? "border-[var(--violet-soft)] bg-[var(--violet-glow)]" : "border-[var(--border)] hover:border-[var(--text-faint)]"
                }`}
              >
                <span
                  className={`mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 grid place-items-center transition-colors ${
                    format === o.value ? "border-[var(--violet-soft)]" : "border-[var(--border)]"
                  }`}
                >
                  {format === o.value && <span className="w-2 h-2 rounded-full bg-[var(--violet-soft)]" />}
                </span>
                <span>
                  <p className="text-sm font-medium mb-0.5">{o.label}</p>
                  <p className="text-xs text-[var(--text-dim)]">{o.desc}</p>
                </span>
              </button>
            ))}
          </div>

          {format === "pdf" && (
            <label className="flex items-start gap-2.5 mb-5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={singlePage}
                onChange={(e) => setSinglePage(e.target.checked)}
                className="mt-0.5 accent-[var(--violet)] cursor-pointer"
              />
              <span>
                <span className="text-sm block">Format compact — tient sur une seule page</span>
                <span className="text-xs text-[var(--text-dim)] block mt-0.5">
                  Réduit légèrement les tailles de police et les marges si besoin. N'affecte ni votre contenu, ni votre score ATS.
                </span>
              </span>
            </label>
          )}

          <button onClick={onExport} disabled={exporting} className={`${btnPrimaryCls} w-full py-2.5`}>
            {exporting ? "Export en cours..." : "Exporter le CV"}
          </button>
        </div>
        <div className="hidden md:block">
          <p className="text-xs font-[var(--ff-mono)] uppercase tracking-widest text-[var(--text-faint)] mb-2">Aperçu</p>
          <div className="scale-[0.85] origin-top-left w-[118%] rounded-lg overflow-hidden ring-1 ring-[var(--border)]">
            <CvPreview data={data} />
          </div>
        </div>
      </motion.div>
    </motion.div>
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
        <div key={i} className="bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--text-faint)] transition-colors rounded-xl p-4">
          <div className="flex justify-between items-center mb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center w-5 h-5 rounded-full bg-[var(--violet-glow)] text-[var(--violet-soft)] text-[10px] font-[var(--ff-mono)] font-bold">
                {i + 1}
              </span>
              <ReorderButtons index={i} length={experiences.length} onMove={(dir) => onChange(move(experiences, i, i + dir))} />
            </div>
            <button
              onClick={() => remove(i)}
              aria-label="Supprimer cette expérience"
              className="grid place-items-center w-7 h-7 rounded-lg text-[var(--text-faint)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors cursor-pointer"
            >
              <IconTrash className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3.5 mb-3.5">
            <Field label="Poste">
              <input className={inputCls} value={exp.role} onChange={(e) => update(i, { role: e.target.value })} />
            </Field>
            <Field label="Entreprise">
              <input className={inputCls} value={exp.company} onChange={(e) => update(i, { company: e.target.value })} />
            </Field>
            <Field label="Localisation">
              <input className={inputCls} value={exp.location || ""} onChange={(e) => update(i, { location: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3.5">
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
          <div className="mt-3.5">
            <Field label="Réalisations">
              <TagsInput values={exp.achievements} onChange={(v) => update(i, { achievements: v })} placeholder="Ajouter une réalisation chiffrée" />
            </Field>
          </div>
        </div>
      ))}
      <button onClick={add} className={dashedAddCls}>
        <IconPlusCircle className="w-4 h-4" /> Ajouter une expérience
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
    <div className="flex flex-col gap-3.5">
      {education.map((ed, i) => (
        <div key={i} className="bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--text-faint)] transition-colors rounded-xl p-4 flex gap-3.5">
          <ReorderButtons index={i} length={education.length} onMove={(dir) => onChange(move(education, i, i + dir))} />
          <div className="flex-1 grid sm:grid-cols-3 gap-3.5">
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
              <button
                onClick={() => remove(i)}
                aria-label="Supprimer cette formation"
                className="grid place-items-center w-9 h-9 rounded-lg text-[var(--text-faint)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors cursor-pointer shrink-0"
              >
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
      <button onClick={add} className={dashedAddCls}>
        <IconPlusCircle className="w-4 h-4" /> Ajouter une formation
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
    <div className="flex flex-col gap-3.5">
      {projects.map((p, i) => (
        <div key={i} className="bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--text-faint)] transition-colors rounded-xl p-4">
          <div className="flex justify-between items-center mb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center w-5 h-5 rounded-full bg-[var(--violet-glow)] text-[var(--violet-soft)] text-[10px] font-[var(--ff-mono)] font-bold">
                {i + 1}
              </span>
              <ReorderButtons index={i} length={projects.length} onMove={(dir) => onChange(move(projects, i, i + dir))} />
            </div>
            <button
              onClick={() => remove(i)}
              aria-label="Supprimer ce projet"
              className="grid place-items-center w-7 h-7 rounded-lg text-[var(--text-faint)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors cursor-pointer"
            >
              <IconTrash className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3.5 mb-3.5">
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
      <button onClick={add} className={dashedAddCls}>
        <IconPlusCircle className="w-4 h-4" /> Ajouter un projet
      </button>
    </div>
  );
}
