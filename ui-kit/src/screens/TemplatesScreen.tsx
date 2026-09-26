import { useState } from "react";
import { type ResumeSummary } from "./types.js";
import { sampleResumeList } from "./sampleData.js";

// Contrepartie "design system" de frontend/src/pages/Templates.tsx : découplée du
// routeur et de l'API réelle. "Appliquer" un modèle à un CV existant se contente de
// mettre à jour le message local ; sans CV ciblé, elle redirige (localement) vers la
// création d'un nouveau CV. Toute modification faite dans Claude Design doit être
// reportée à la main dans le fichier réel.

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
    <div className="rounded-lg overflow-hidden border border-[var(--border)]" style={{ background: base, aspectRatio: "3/4" }}>
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

export type TemplatesScreenProps = {
  resumes?: ResumeSummary[];
  onNavigate?: (path: string) => void;
};

export function TemplatesScreen({ resumes = sampleResumeList, onNavigate }: TemplatesScreenProps) {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Tous");
  const [targetId, setTargetId] = useState<string>("");
  const [applying, setApplying] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = category === "Tous" ? TEMPLATES : TEMPLATES.filter((t) => t.category === category);

  function apply(value: string) {
    setMessage(null);
    if (!targetId) {
      onNavigate?.("/cv/nouveau");
      return;
    }
    setApplying(value);
    setTimeout(() => {
      setMessage(`Modèle appliqué à "${resumes.find((r) => String(r.id) === targetId)?.title}".`);
      setApplying(null);
    }, 300);
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-[var(--text-dim)] text-sm mt-1">Choisissez un modèle et personnalisez-le selon votre profil.</p>
        </div>
        {resumes.length > 0 && (
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--violet-soft)]"
          >
            <option value="">Appliquer à un nouveau CV</option>
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                Appliquer à « {r.title} »
              </option>
            ))}
          </select>
        )}
      </div>

      {message && <p className="text-sm text-[var(--violet-soft)] mb-4">{message}</p>}

      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`text-xs font-medium rounded-full px-3.5 py-1.5 transition-colors cursor-pointer ${
              category === c ? "bg-[var(--violet)] text-white" : "bg-[var(--surface-2)] text-[var(--text-dim)] hover:text-[var(--text)]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {filtered.map((t) => (
          <div key={t.value} className="flex flex-col gap-2">
            <TemplateThumb accent={t.accent} base={t.base} />
            <button
              type="button"
              onClick={() => apply(t.value)}
              disabled={applying === t.value}
              className="text-xs font-[var(--ff-mono)] uppercase tracking-wider border border-[var(--border)] hover:border-[var(--violet-soft)] rounded-lg py-2 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {applying === t.value ? "..." : t.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
