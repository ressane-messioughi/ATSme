import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type ResumeSummary, listResumes, updateResume } from "../lib/resumeApi";

const CATEGORIES = ["Tous", "Moderne", "Classique", "Créatif", "Minimaliste"] as const;

const TEMPLATES: { value: string; label: string; category: (typeof CATEGORIES)[number]; accent: string; base: string }[] = [
  { value: "violet", label: "Violet", category: "Moderne", accent: "#7c3aed", base: "#15121f" },
  { value: "obsidian", label: "Obsidian", category: "Classique", accent: "#9d7bfb", base: "#111114" },
  { value: "nightfall", label: "Nightfall", category: "Créatif", accent: "#5b21b6", base: "#0e0e17" },
  { value: "purple-minimal", label: "Purple Minimal", category: "Minimaliste", accent: "#a78bfa", base: "#141418" },
  { value: "dark-elegant", label: "Dark Elegant", category: "Classique", accent: "#8b5cf6", base: "#121016" },
];

function TemplateThumb({ accent, base }: { accent: string; base: string }) {
  return (
    <div className="rounded-[var(--t-r-md)] overflow-hidden" style={{ background: base, aspectRatio: "3/4", border: "1px solid var(--t-line-soft)" }}>
      <div className="p-3 flex flex-col gap-2 h-full">
        <div className="h-2 w-2/3 rounded" style={{ background: accent }} />
        <div className="h-1.5 w-1/3 rounded bg-white/15" />
        <div className="mt-2 h-1 w-full rounded bg-white/10" />
        <div className="h-1 w-5/6 rounded bg-white/10" />
        <div className="h-1 w-4/6 rounded bg-white/10" />
        <div className="mt-2 h-1.5 w-1/2 rounded" style={{ background: accent, opacity: 0.7 }} />
        <div className="h-1 w-full rounded bg-white/10" />
        <div className="h-1 w-3/4 rounded bg-white/10" />
        <div className="mt-auto flex gap-1 flex-wrap">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-1.5 w-6 rounded-full" style={{ background: accent, opacity: 0.4 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Templates() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Tous");
  const [resumes, setResumes] = useState<ResumeSummary[] | null>(null);
  const [targetId, setTargetId] = useState<string>("");
  const [applying, setApplying] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    listResumes()
      .then(setResumes)
      .catch(() => {});
  }, []);

  const filtered = category === "Tous" ? TEMPLATES : TEMPLATES.filter((t) => t.category === category);

  async function apply(value: string) {
    setMessage(null);
    if (!targetId) {
      localStorage.setItem("atsme_default_template", value);
      navigate(`/cv/nouveau?template=${value}`);
      return;
    }
    setApplying(value);
    try {
      await updateResume(targetId, { template: value });
      setMessage(`Modèle appliqué à « ${resumes?.find((r) => String(r.id) === targetId)?.title} ».`);
    } catch {
      setMessage("Impossible d'appliquer ce modèle.");
    } finally {
      setApplying(null);
    }
  }

  return (
    <div className="max-w-[1080px] mx-auto flex flex-col gap-7">
      <header className="flex flex-wrap items-end justify-between gap-3.5">
        <div className="flex flex-col gap-1.5">
          <div className="font-semibold text-xs uppercase" style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.14em", color: "var(--t-muted)" }}>
            Créer
          </div>
          <h1 className="font-black leading-[1.15] m-0" style={{ fontFamily: "var(--t-display)", fontSize: "clamp(28px,3vw,36px)" }}>
            Choisissez une mise en page
          </h1>
          <p className="m-0 text-[15px]" style={{ color: "var(--t-ink2)" }}>
            Tous les modèles sont lisibles par les logiciels de recrutement.
          </p>
        </div>
        {resumes && resumes.length > 0 && (
          <label className="flex flex-col gap-1.5 font-semibold text-sm" style={{ color: "var(--t-ink)" }}>
            Appliquer à un CV existant
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="min-h-11 px-3 rounded-[var(--t-r-md)] outline-none"
              style={{ border: "1.5px solid var(--t-field-line)", background: "var(--t-field)", color: "var(--t-ink)" }}
            >
              <option value="">Nouveau CV</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </header>

      {message && (
        <p role="status" className="text-sm m-0" style={{ color: "var(--t-accent)" }}>
          {message}
        </p>
      )}

      <div role="radiogroup" aria-label="Catégories" className="flex gap-2 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={category === c}
            onClick={() => setCategory(c)}
            className="min-h-[38px] px-3.5 rounded-[var(--t-r-md)] font-semibold text-sm cursor-pointer"
            style={
              category === c
                ? { background: "var(--t-surface)", color: "var(--t-ink)", boxShadow: "0 1px 2px rgba(0,0,0,.12)" }
                : { background: "transparent", color: "var(--t-ink2)" }
            }
          >
            {c}
          </button>
        ))}
      </div>

      <div role="radiogroup" aria-label="Modèles" className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
        {filtered.map((t) => (
          <div key={t.value} className="flex flex-col gap-2">
            <TemplateThumb accent={t.accent} base={t.base} />
            <button
              type="button"
              role="radio"
              aria-checked={false}
              onClick={() => apply(t.value)}
              disabled={applying === t.value}
              className="min-h-11 rounded-[var(--t-r-md)] font-semibold text-sm cursor-pointer disabled:opacity-60"
              style={{ border: "1.5px solid var(--t-field-line)", background: "var(--t-surface)", color: "var(--t-ink)" }}
            >
              {applying === t.value ? "..." : t.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
