import { type DragEvent, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createResume, importResume, updateResume } from "../lib/resumeApi";

type ImportState = "idle" | "uploading" | "processing" | "error";

const ACCEPTED = /\.(pdf|docx)$/i;
const MAX_SIZE = 10 * 1024 * 1024;

export default function CvNew() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const defaultTemplate = params.get("template") || localStorage.getItem("atsme_default_template") || undefined;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [state, setState] = useState<ImportState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function handleFile(file: File) {
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
    try {
      setState("processing");
      const resume = await importResume(file);
      navigate(`/cv/${resume.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'import a échoué.");
      setState("error");
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  async function onCreateBlank() {
    setCreating(true);
    try {
      const resume = await createResume("Nouveau CV");
      if (defaultTemplate) await updateResume(resume.id, { template: defaultTemplate });
      navigate(`/cv/${resume.id}`);
    } catch {
      setError("La création a échoué.");
      setCreating(false);
    }
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
          {state === "uploading" && (
            <p className="text-xs font-[var(--ff-mono)] text-[var(--violet-soft)]">Envoi du fichier...</p>
          )}
          {state === "processing" && (
            <p className="text-xs font-[var(--ff-mono)] text-[var(--violet-soft)]">Extraction et analyse en cours...</p>
          )}
          {state === "error" && error && <p className="text-xs text-[var(--danger)]">{error}</p>}
        </div>

        <button
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
