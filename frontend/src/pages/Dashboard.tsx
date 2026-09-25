import { type DragEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { type ResumeSummary, importResume, listResumes, scoreTone } from "../lib/resumeApi";
import { useAuth } from "../lib/auth.tsx";
import BrandOrb from "../components/BrandOrb.tsx";
import { IconBriefcase, IconBulb, IconChart, IconLayers, IconPlusCircle, IconUpload } from "../components/icons.tsx";
import { btnPrimaryCls, cardCls } from "../lib/ui.ts";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.05, ease: "easeOut" } }),
};

const ringColor = { good: "var(--good)", warn: "var(--warn)", danger: "var(--danger)" };

const QUICK_ACTIONS = [
  { to: "/cv/nouveau", label: "Nouveau CV", desc: "Partir d'une page blanche", icon: IconPlusCircle },
  { to: "/templates", label: "Templates", desc: "Changer de mise en forme", icon: IconLayers },
  { to: "/analyse", label: "Analyse ATS", desc: "Comprendre votre score", icon: IconChart },
  { to: "/offres", label: "Offres d'emploi", desc: "Comparer à une annonce", icon: IconBriefcase },
];

// Un conseil différent chaque jour plutôt qu'au hasard à chaque rendu : deux visites la
// même journée montrent le même conseil, ce qui le rend crédible plutôt qu'aléatoire.
const ATS_TIPS = [
  "Reprenez les mots-clés exacts de l'offre (intitulé de poste, outils, compétences) : un ATS compare du texte, pas des synonymes.",
  "Préférez les intitulés de section classiques (« Expérience », « Formation ») aux formulations originales, plus difficiles à reconnaître automatiquement.",
  "Chiffrez vos réalisations quand c'est possible : « augmenté les ventes de 24% » convainc plus, et se repère mieux, que « amélioré les ventes ».",
  "Évitez les tableaux et colonnes multiples dans un CV destiné à un ATS : l'ordre de lecture du texte peut s'en trouver mélangé.",
  "Un verbe d'action en début de ligne (« piloté », « conçu », « déployé ») rend chaque réalisation plus lisible, pour un ATS comme pour qui la lit ensuite.",
  "Visez 300 à 800 mots de contenu utile : assez pour matcher une offre en détail, assez court pour rester lisible d'un coup d'œil.",
  "Renseignez systématiquement entreprise, poste et dates pour chaque expérience : un champ manquant est un champ qu'un ATS ne peut pas extraire.",
  "Une photo de profil n'affecte pas votre score ATS sur ATSme tant qu'elle reste décorative — c'est justement comme ça qu'elle est placée dans vos exports.",
];

function tipOfTheDay(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return ATS_TIPS[dayOfYear % ATS_TIPS.length];
}

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
      <motion.div
        initial="hidden"
        animate="show"
        custom={0}
        variants={fadeUp}
        className="flex items-start justify-between gap-4 mb-8 flex-wrap"
      >
        <div className="flex items-center gap-4">
          <BrandOrb size={72} className="hidden sm:block shrink-0 drop-shadow-[0_8px_24px_var(--violet-glow)]" />
          <div>
            <h1 className="text-2xl font-bold">Bonjour {user?.name?.split(" ")[0]} 👋</h1>
            <p className="text-[var(--text-dim)] text-sm mt-1">Créez un CV optimisé et maximisez vos chances d'être recruté.</p>
          </div>
        </div>
        <button onClick={() => navigate("/cv/nouveau")} className={btnPrimaryCls}>
          <IconPlusCircle className="w-4 h-4" />
          Nouveau CV
        </button>
      </motion.div>

      {error && <p className="text-sm text-[var(--danger)] mb-6">{error}</p>}

      <motion.div initial="hidden" animate="show" custom={1} variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className={`${cardCls} group flex flex-col gap-2.5 p-4 hover:border-[var(--violet-soft)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-8px_var(--violet-glow)]`}
          >
            <span className="w-9 h-9 rounded-lg bg-[var(--violet-glow)] text-[var(--violet-soft)] grid place-items-center group-hover:scale-105 transition-transform">
              <a.icon className="w-[18px] h-[18px]" />
            </span>
            <span>
              <span className="text-sm font-medium block">{a.label}</span>
              <span className="text-[11px] text-[var(--text-faint)] block mt-0.5">{a.desc}</span>
            </span>
          </Link>
        ))}
      </motion.div>

      <motion.div
        initial="hidden"
        animate="show"
        custom={1.5}
        variants={fadeUp}
        className={`${cardCls} flex items-start gap-3 p-4 mb-6`}
      >
        <span className="shrink-0 w-8 h-8 rounded-lg bg-[var(--warn)]/12 text-[var(--warn)] grid place-items-center">
          <IconBulb className="w-4 h-4" />
        </span>
        <div>
          <p className="text-xs font-[var(--ff-mono)] uppercase tracking-widest text-[var(--text-faint)] mb-1">Conseil du jour</p>
          <p className="text-sm text-[var(--text-dim)] leading-relaxed">{tipOfTheDay()}</p>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="show" custom={2} variants={fadeUp} className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className={`${cardCls} p-5`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Mes CV récents</h2>
            <Link to="/cv" className="text-xs text-[var(--violet-soft)] hover:underline">
              Voir tous mes CV
            </Link>
          </div>
          {resumes && resumes.length === 0 && (
            <div className="flex flex-col items-center text-center py-8 gap-3">
              <span className="w-11 h-11 rounded-full bg-[var(--violet-glow)] text-[var(--violet-soft)] grid place-items-center">
                <IconPlusCircle className="w-5 h-5" />
              </span>
              <div>
                <p className="text-sm">Aucun CV pour l'instant.</p>
                <p className="text-xs text-[var(--text-faint)] mt-0.5">Créez le premier en quelques minutes.</p>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1">
            {(resumes || []).slice(0, 4).map((r) => (
              <Link
                key={r.id}
                to={`/cv/${r.id}`}
                className="flex items-center justify-between gap-3 px-2 py-2.5 rounded-lg hover:bg-[var(--surface-2)] hover:translate-x-0.5 transition-all"
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
          className={`${cardCls} p-5 flex flex-col`}
        >
          <h2 className="text-sm font-semibold mb-4">Analyse rapide</h2>
          <div
            onClick={() => !importing && inputRef.current?.click()}
            className={`flex-1 border-2 border-dashed rounded-xl px-6 py-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 ${
              dragOver ? "border-[var(--violet-soft)] bg-[var(--violet-glow)] scale-[1.01]" : "border-[var(--border)] hover:border-[var(--text-faint)]"
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
            <span className="inline-flex items-center gap-2 bg-[var(--violet)] rounded-lg px-4 py-2 text-xs font-medium text-white shadow-[0_2px_12px_-2px_var(--violet-glow)]">
              {importing ? "Import en cours..." : "Choisir un fichier"}
            </span>
            <p className="text-[11px] text-[var(--text-faint)] mt-4">Formats acceptés : PDF, DOCX</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="show" custom={3} variants={fadeUp} className={`${cardCls} p-5`}>
        <h2 className="text-sm font-semibold mb-4">Vos statistiques</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="CV créés" value={resumes ? String(resumes.length) : "—"} />
          <Stat label="Score moyen" value={avgScore != null ? `${avgScore}/100` : "—"} tone={avgScore != null ? scoreTone(avgScore) : undefined} />
          <Stat label="Meilleur score" value={bestScore != null ? `${bestScore}/100` : "—"} tone={bestScore != null ? scoreTone(bestScore) : undefined} />
          <Stat label="Analyses" value={resumes ? String(scored.length) : "—"} />
        </div>
      </motion.div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "warn" | "danger" }) {
  return (
    <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-4 hover:border-[var(--text-faint)] transition-colors">
      <p className="text-xs text-[var(--text-faint)] mb-2">{label}</p>
      <p className="font-[var(--ff-mono)] text-xl font-medium" style={tone ? { color: ringColor[tone] } : undefined}>
        {value}
      </p>
    </div>
  );
}
