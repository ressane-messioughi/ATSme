import { type DragEvent, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createResume, importResume, updateResume } from "../lib/resumeApi";
import { IconUpload } from "../components/icons.tsx";

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
  const [name, setName] = useState("");

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
      const resume = await createResume(name.trim() || "Nouveau CV");
      if (defaultTemplate) await updateResume(resume.id, { template: defaultTemplate });
      navigate(`/cv/${resume.id}`);
    } catch {
      setError("La création a échoué.");
      setCreating(false);
    }
  }

  const cardStyle = { background: "var(--t-surface)", border: "1.5px solid var(--t-line-soft)" };

  return (
    <div className="max-w-[760px] mx-auto flex flex-col gap-7">
      <header className="flex flex-col gap-2">
        <div className="font-semibold text-xs uppercase" style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.14em", color: "var(--t-muted)" }}>
          Créer
        </div>
        <h1 className="font-black leading-[1.15] m-0" style={{ fontFamily: "var(--t-display)", fontSize: "clamp(28px,3vw,36px)" }}>
          Nouveau CV
        </h1>
        <p className="m-0 text-base leading-[1.55] max-w-[62ch]" style={{ color: "var(--t-ink2)" }}>
          Importez un CV existant, ou partez d'une page blanche.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-4 items-start">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => state !== "uploading" && state !== "processing" && inputRef.current?.click()}
          className="rounded-[var(--t-r-lg)] px-6 py-10 text-center cursor-pointer transition-colors"
          style={{ border: `2px dashed ${dragOver ? "var(--t-accent)" : "var(--t-field-line)"}`, background: dragOver ? "var(--t-accent-soft)" : "var(--t-field)" }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <IconUpload className="w-6 h-6 mx-auto mb-3 text-[var(--t-muted)]" />
          <p className="font-semibold text-[15px] mb-1.5">Importer un CV existant</p>
          <p className="text-[13px] mb-4" style={{ color: "var(--t-ink2)" }}>
            Glissez-déposez un PDF ou DOCX, ou cliquez pour parcourir.
          </p>

          {state === "idle" && (
            <p className="text-xs" style={{ fontFamily: "var(--t-mono)", color: "var(--t-muted)" }}>
              PDF · DOCX · 10 Mo max
            </p>
          )}
          {state === "uploading" && (
            <p className="text-xs" style={{ fontFamily: "var(--t-mono)", color: "var(--t-accent)" }}>
              Envoi du fichier...
            </p>
          )}
          {state === "processing" && (
            <p className="text-xs" style={{ fontFamily: "var(--t-mono)", color: "var(--t-accent)" }}>
              Extraction et analyse en cours...
            </p>
          )}
          {state === "error" && error && (
            <p className="text-xs" style={{ color: "var(--t-danger)" }}>
              {error}
            </p>
          )}
        </div>

        <div className="rounded-[var(--t-r-lg)] p-6 flex flex-col gap-4" style={cardStyle}>
          <div>
            <p className="font-semibold text-[15px] mb-1.5">Créer à partir de zéro</p>
            <p className="text-[13px] m-0" style={{ color: "var(--t-ink2)" }}>
              Démarrez avec un CV vierge et remplissez chaque section vous-même.
            </p>
          </div>
          <label className="flex flex-col gap-1.5 font-semibold text-sm" style={{ color: "var(--t-ink)" }}>
            Nom du CV (optionnel)
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nouveau CV"
              className="min-h-11 px-3 rounded-[var(--t-r-md)] outline-none font-normal"
              style={{ border: "1.5px solid var(--t-field-line)", background: "var(--t-field)", color: "var(--t-ink)", fontSize: 16 }}
            />
          </label>
          <button
            type="button"
            onClick={onCreateBlank}
            disabled={creating}
            className="self-start inline-flex items-center justify-center gap-2 min-h-11 px-[18px] rounded-[var(--t-r-md)] font-semibold text-[15px] cursor-pointer disabled:opacity-60"
            style={{ border: "1.5px solid var(--t-line)", background: "var(--t-accent)", color: "var(--t-on-accent)", boxShadow: "0 2px 0 var(--t-shadow)" }}
          >
            {creating ? "Création..." : "Créer le CV"}
          </button>
        </div>
      </div>
    </div>
  );
}
