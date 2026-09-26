import { type DragEvent, useRef, useState } from "react";

// Contrepartie "design system" de frontend/src/pages/CvNew.tsx : découplée du routeur et
// de l'upload réel (lib/resumeApi.ts). Les deux parcours (import / création à partir de
// zéro) restent visuellement et interactivement complets (glisser-déposer, états de
// survol) mais aboutissent à un appel local à `onNavigate` plutôt qu'à un vrai import ou
// une vraie création. Toute modification faite dans Claude Design doit être reportée à la
// main dans le fichier réel.

type ImportState = "idle" | "uploading" | "processing" | "error";

const ACCEPTED = /\.(pdf|docx)$/i;
const MAX_SIZE = 10 * 1024 * 1024;

export type CvNewScreenProps = {
  /** Appelé avec la route d'origine de l'app une fois un CV "créé" ou "importé". */
  onNavigate?: (path: string) => void;
};

export function CvNewScreen({ onNavigate }: CvNewScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [state, setState] = useState<ImportState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  function handleFile(file: File) {
    setError(null);
    if (!ACCEPTED.test(file.name)) {
      setError("Format non supporté — seuls les fichiers PDF et DOCX sont acceptés.");
      setState("error");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Fichier trop volumineux (10 Mo maximum).");
      setState("error");
      return;
    }
    if (file.size === 0) {
      setError("Le fichier est vide.");
      setState("error");
      return;
    }
    setState("uploading");
    setTimeout(() => {
      setState("processing");
      setTimeout(() => onNavigate?.("/cv/1"), 400);
    }, 300);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onCreateBlank() {
    setCreating(true);
    setTimeout(() => onNavigate?.("/cv/1"), 300);
  }

  return (
    <div className="max-w-3xl">
      <p className="font-[var(--ff-mono)] text-xs uppercase tracking-widest text-[var(--violet-soft)] mb-2">Créer un CV</p>
      <h1 className="text-2xl font-bold mb-8">Comment souhaitez-vous démarrer ?</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl px-6 py-10 text-center transition-colors cursor-pointer ${
            dragOver ? "border-[var(--violet-soft)] bg-[var(--violet-glow)]" : "border-[var(--border)]"
          }`}
          onClick={() => state !== "uploading" && state !== "processing" && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <p className="text-sm font-medium mb-1.5">Importer un CV existant</p>
          <p className="text-xs text-[var(--text-dim)] mb-4">Glissez-déposez un PDF ou DOCX, ou cliquez pour parcourir.</p>

          {state === "idle" && <p className="text-xs font-[var(--ff-mono)] text-[var(--text-faint)]">PDF · DOCX · 10 Mo max</p>}
          {state === "uploading" && <p className="text-xs font-[var(--ff-mono)] text-[var(--violet-soft)]">Envoi du fichier...</p>}
          {state === "processing" && <p className="text-xs font-[var(--ff-mono)] text-[var(--violet-soft)]">Extraction et analyse en cours...</p>}
          {state === "error" && error && <p className="text-xs text-[var(--danger)]">{error}</p>}
        </div>

        <button
          type="button"
          onClick={onCreateBlank}
          disabled={creating}
          className="border border-[var(--border)] hover:border-[var(--violet-soft)] transition-colors rounded-xl px-6 py-10 text-center disabled:opacity-60 cursor-pointer"
        >
          <p className="text-sm font-medium mb-1.5">Créer à partir de zéro</p>
          <p className="text-xs text-[var(--text-dim)]">Démarrez avec un CV vierge et remplissez chaque section vous-même.</p>
          {creating && <p className="text-xs font-[var(--ff-mono)] text-[var(--violet-soft)] mt-4">Création...</p>}
        </button>
      </div>
    </div>
  );
}
