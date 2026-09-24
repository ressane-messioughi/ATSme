import { type DragEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { type ResumeSummary, importResume, listResumes, scoreTone } from "../lib/resumeApi";
import { useAuth } from "../lib/auth.tsx";
import { IconPlusCircle, IconUpload } from "../components/icons.tsx";

const ringColor = { good: "var(--good)", warn: "var(--warn)", danger: "var(--danger)" };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listResumes()
      .then(setResumes)
      .catch(() => setError("Impossible de charger votre tableau de bord."));
  }, []);

  const scored = (resumes || []).filter((r) => r.ats_score != null);
  const avgScore = scored.length ? Math.round(scored.reduce((s, r) => s + (r.ats_score || 0), 0) / scored.length) : null;
  const bestScore = scored.length ? Math.max(...scored.map((r) => r.ats_score || 0)) : null;

  async function handleFile(file: File) {
    setError(null);
    if (!/\.(pdf|docx)$/i.test(file.name)) {
      setError("Format non supporté — PDF ou DOCX uniquement.");
      return;
    }
    setImporting(true);
    try {
      const resume = await importResume(file);
      navigate(`/cv/${resume.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'import a échoué.");
      setImporting(false);
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Bonjour {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-[var(--text-dim)] text-sm mt-1">Créez un CV optimisé et maximisez vos chances d'être recruté.</p>
        </div>
        <button
          onClick={() => navigate("/cv/nouveau")}
          className="flex items-center gap-2 bg-[var(--violet)] hover:bg-[var(--violet-soft)] transition-colors rounded-lg px-4 py-2.5 text-sm font-medium text-white cursor-pointer"
        >
          <IconPlusCircle className="w-4 h-4" />
          Nouveau CV
        </button>
      </div>

      {error && <p className="text-sm text-[var(--danger)] mb-6">{error}</p>}

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Mes CV récents</h2>
            <Link to="/cv" className="text-xs text-[var(--violet-soft)] hover:underline">
              Voir tous mes CV
            </Link>
          </div>
          {resumes && resumes.length === 0 && (
            <p className="text-sm text-[var(--text-faint)] py-6 text-center">Aucun CV pour l'instant.</p>
          )}
          <div className="flex flex-col gap-1">
            {(resumes || []).slice(0, 4).map((r) => (
              <Link
                key={r.id}
                to={`/cv/${r.id}`}
                className="flex items-center justify-between gap-3 px-2 py-2.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-9 h-9 rounded-full grid place-items-center text-xs font-[var(--ff-mono)] font-semibold shrink-0"
                    style={{
                      border: `2px solid ${r.ats_score != null ? ringColor[scoreTone(r.ats_score)] : "var(--border)"}`,
                      color: r.ats_score != null ? ringColor[scoreTone(r.ats_score)] : "var(--text-faint)",
                    }}
                  >
                    {r.ats_score ?? "—"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.title}</p>
                    <p className="text-xs text-[var(--text-faint)]">
                      Modifié le {new Date(r.updated_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div
          onDragOver={(e: DragEvent) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e: DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 flex flex-col"
        >
          <h2 className="text-sm font-semibold mb-4">Analyse rapide</h2>
          <div
            onClick={() => !importing && inputRef.current?.click()}
            className={`flex-1 border-2 border-dashed rounded-xl px-6 py-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
              dragOver ? "border-[var(--violet-soft)] bg-[var(--violet-glow)]" : "border-[var(--border)]"
            }`}
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
            <IconUpload className="w-6 h-6 text-[var(--text-faint)] mb-3" />
            <p className="text-sm mb-1">Importez votre CV pour l'analyser</p>
            <p className="text-xs text-[var(--text-faint)] mb-4">Glissez-déposez votre fichier ici, ou</p>
            <span className="inline-flex items-center gap-2 bg-[var(--violet)] hover:bg-[var(--violet-soft)] transition-colors rounded-lg px-4 py-2 text-xs font-medium text-white">
              {importing ? "Import en cours..." : "Choisir un fichier"}
            </span>
            <p className="text-[11px] text-[var(--text-faint)] mt-4">Formats acceptés : PDF, DOCX</p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
        <h2 className="text-sm font-semibold mb-4">Vos statistiques</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="CV créés" value={resumes ? String(resumes.length) : "—"} />
          <Stat label="Score moyen" value={avgScore != null ? `${avgScore}/100` : "—"} />
          <Stat label="Meilleur score" value={bestScore != null ? `${bestScore}/100` : "—"} />
          <Stat label="Analyses" value={resumes ? String(scored.length) : "—"} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-4">
      <p className="text-xs text-[var(--text-faint)] mb-2">{label}</p>
      <p className="font-[var(--ff-mono)] text-xl font-medium">{value}</p>
    </div>
  );
}
