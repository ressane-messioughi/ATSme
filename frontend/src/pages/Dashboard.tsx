import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { type ResumeSummary, type ScoreBreakdown, getResume, listResumes, scoreLabel } from "../lib/resumeApi";
import { useAuth } from "../lib/auth.tsx";
import { IconPlusCircle } from "../components/icons.tsx";

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

type Todo = { title: string; hint: string; cta: string; to: string };

function buildTodos(resumes: ResumeSummary[] | null): Todo[] {
  if (!resumes) return [];
  if (resumes.length === 0) {
    return [{ title: "Créer votre premier CV", hint: "Un CV optimisé ATS en quelques minutes", cta: "Créer", to: "/cv/nouveau" }];
  }
  const todos: Todo[] = [];
  const weakest = [...resumes].filter((r) => r.ats_score != null).sort((a, b) => (a.ats_score ?? 0) - (b.ats_score ?? 0))[0];
  if (weakest && (weakest.ats_score ?? 100) < 85) {
    todos.push({
      title: `Améliorer « ${weakest.title} »`,
      hint: `Score actuel : ${weakest.ats_score}/100 — ${scoreLabel(weakest.ats_score)}`,
      cta: "Corriger",
      to: `/cv/${weakest.id}`,
    });
  }
  todos.push({ title: "Comparer à une offre d'emploi", hint: "Voyez quels mots-clés manquent à votre CV", cta: "Comparer", to: "/offres" });
  if (todos.length < 3) todos.push({ title: "Explorer les modèles", hint: "Changez la mise en forme de votre CV", cta: "Voir", to: "/templates" });
  return todos.slice(0, 3);
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeSummary[] | null>(null);
  const [breakdown, setBreakdown] = useState<ScoreBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listResumes()
      .then(setResumes)
      .catch(() => setError("Impossible de charger votre tableau de bord."));
  }, []);

  const best = useMemo(() => {
    const scored = (resumes || []).filter((r) => r.ats_score != null);
    return scored.length ? scored.reduce((a, b) => ((a.ats_score ?? 0) >= (b.ats_score ?? 0) ? a : b)) : null;
  }, [resumes]);

  useEffect(() => {
    if (!best) return;
    getResume(best.id)
      .then((full) => setBreakdown(full.scoreBreakdown))
      .catch(() => setBreakdown(null));
  }, [best]);

  const todos = buildTodos(resumes);
  const recent = (resumes || []).slice(0, 3);

  return (
    <div className="max-w-[1080px] mx-auto flex flex-col gap-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <h1 className="font-black leading-[1.15] m-0" style={{ fontFamily: "var(--t-display)", fontSize: "clamp(28px,3vw,36px)" }}>
            Bonjour {user?.name?.split(" ")[0]}
          </h1>
          <p className="m-0 text-base leading-[1.55] max-w-[62ch]" style={{ color: "var(--t-ink2)" }}>
            {best
              ? `Votre CV principal est à ${best.ats_score} sur 100. ${
                  todos[0] ? "Une action suffit pour l'améliorer." : "Continuez comme ça."
                }`
              : "Créez votre premier CV optimisé pour les systèmes de recrutement automatisés."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/cv/nouveau")}
          className="inline-flex items-center justify-center gap-2 min-h-11 px-[18px] rounded-[var(--t-r-md)] font-semibold text-[15px] cursor-pointer"
          style={{ border: "1.5px solid var(--t-line)", background: "var(--t-accent)", color: "var(--t-on-accent)", boxShadow: "0 2px 0 var(--t-shadow)" }}
        >
          <IconPlusCircle className="w-[18px] h-[18px]" />
          Nouveau CV
        </button>
      </header>

      {error && <p style={{ color: "var(--t-danger)" }}>{error}</p>}

      <div className="grid gap-5 items-start" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))" }}>
        <section
          aria-labelledby="todo-h"
          className="p-6 rounded-[var(--t-r-lg)] flex flex-col gap-4 min-w-0"
          style={{ background: "var(--t-surface)", border: "1px solid var(--t-line-soft)" }}
        >
          <h2 id="todo-h" className="font-black text-xl leading-tight m-0" style={{ fontFamily: "var(--t-display)" }}>
            À faire
          </h2>
          <ol className="list-none m-0 p-0 flex flex-col">
            {todos.map((td, i) => (
              <li
                key={td.title}
                className="flex items-center gap-3.5 py-3"
                style={{ borderTop: i === 0 ? "none" : "1px solid var(--t-line-soft)" }}
              >
                <span
                  aria-hidden="true"
                  className="w-[30px] h-[30px] rounded-full grid place-items-center font-bold text-sm shrink-0"
                  style={{ background: "var(--t-accent-soft)", color: "var(--t-accent-ink)" }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[15px]">{td.title}</div>
                  <div className="text-[13px]" style={{ color: "var(--t-muted)" }}>
                    {td.hint}
                  </div>
                </div>
                <Link
                  to={td.to}
                  aria-label={`${td.cta} : ${td.title}`}
                  className="inline-flex items-center justify-center gap-2 min-h-10 px-3.5 rounded-[var(--t-r-md)] font-semibold text-sm"
                  style={{ border: "1.5px solid var(--t-field-line)", background: "var(--t-surface)", color: "var(--t-ink)" }}
                >
                  {td.cta}
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="score-h"
          className="p-6 rounded-[var(--t-r-lg)] flex flex-col gap-4 min-w-0"
          style={{ background: "var(--t-surface)", border: "1px solid var(--t-line-soft)" }}
        >
          <div className="flex justify-between items-baseline gap-3">
            <h2 id="score-h" className="font-black text-xl leading-tight m-0" style={{ fontFamily: "var(--t-display)" }}>
              Score ATS
            </h2>
            {best && (
              <span className="text-[13px] truncate" style={{ color: "var(--t-muted)" }}>
                {best.title}
              </span>
            )}
          </div>
          {best ? (
            <>
              <div className="flex flex-wrap gap-[22px] items-center">
                <div
                  role="img"
                  aria-label={`Score ATS : ${best.ats_score} sur 100`}
                  className="w-[120px] h-[120px] rounded-full grid place-items-center shrink-0"
                  style={{ background: `conic-gradient(var(--t-accent) ${((best.ats_score ?? 0) / 100) * 360}deg, var(--t-track) 0)` }}
                >
                  <div className="w-[94px] h-[94px] rounded-full grid place-items-center text-center" style={{ background: "var(--t-surface)" }}>
                    <div>
                      <div className="font-black text-4xl leading-none" style={{ fontFamily: "var(--t-display)" }}>
                        {best.ats_score}
                      </div>
                      <div className="text-xs" style={{ color: "var(--t-muted)" }}>
                        sur 100
                      </div>
                    </div>
                  </div>
                </div>
                {breakdown && (
                  <div className="flex-1 flex flex-col gap-3 min-w-[180px]">
                    {[
                      ["Mots-clés", breakdown.keywords],
                      ["Structure", breakdown.structure],
                      ["Lisibilité", breakdown.readability],
                    ].map(([label, v]) => (
                      <div key={label} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[15px]">
                          <span>{label}</span>
                          <span className="font-semibold">{v}</span>
                        </div>
                        <div aria-hidden="true" className="h-2 rounded overflow-hidden" style={{ background: "var(--t-track)" }}>
                          <div className="h-full" style={{ width: `${v}%`, background: "var(--t-accent)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Link to="/analyse" className="self-start font-semibold text-[15px] underline underline-offset-[3px]" style={{ color: "var(--t-accent)" }}>
                Voir l'analyse complète
              </Link>
            </>
          ) : (
            <p className="text-sm" style={{ color: "var(--t-muted)" }}>
              Créez un CV pour voir apparaître son score ATS ici.
            </p>
          )}
        </section>
      </div>

      <section
        aria-labelledby="recent-h"
        className="p-6 rounded-[var(--t-r-lg)] flex flex-col gap-4 min-w-0"
        style={{ background: "var(--t-surface)", border: "1px solid var(--t-line-soft)" }}
      >
        <div className="flex justify-between items-center gap-3">
          <h2 id="recent-h" className="font-black text-xl leading-tight m-0" style={{ fontFamily: "var(--t-display)" }}>
            CV récents
          </h2>
          <Link to="/cv" className="font-semibold text-[15px] underline underline-offset-[3px]" style={{ color: "var(--t-accent)" }}>
            Tous les CV
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm py-4" style={{ color: "var(--t-muted)" }}>
            Aucun CV pour l'instant.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[15px]" style={{ minWidth: 480 }}>
              <caption className="sr-only">Vos CV les plus récents</caption>
              <thead>
                <tr>
                  {["Nom", "Modifié", "Score", ""].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="text-left py-2.5 px-3 font-semibold text-xs uppercase"
                      style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.1em", color: "var(--t-muted)", borderBottom: "1px solid var(--t-line-soft)" }}
                    >
                      {h || <span className="sr-only">Action</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <th scope="row" className="text-left font-semibold py-3.5 px-3" style={{ borderBottom: "1px solid var(--t-line-soft)" }}>
                      {r.title}
                    </th>
                    <td className="py-3.5 px-3" style={{ borderBottom: "1px solid var(--t-line-soft)", color: "var(--t-ink2)" }}>
                      {new Date(r.updated_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3.5 px-3" style={{ borderBottom: "1px solid var(--t-line-soft)" }}>
                      {r.ats_score != null && (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--t-r-pill)] font-semibold text-[13px] whitespace-nowrap"
                          style={{ background: "var(--t-accent-soft)", color: "var(--t-accent-ink)" }}
                        >
                          {r.ats_score}
                          <span className="font-normal"> / 100</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right" style={{ borderBottom: "1px solid var(--t-line-soft)" }}>
                      <Link
                        to={`/cv/${r.id}`}
                        aria-label={`Ouvrir ${r.title}`}
                        className="inline-flex items-center min-h-10 font-semibold text-[15px] underline underline-offset-[3px]"
                        style={{ color: "var(--t-accent)" }}
                      >
                        Ouvrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section
        aria-labelledby="tip-h"
        className="p-6 rounded-[var(--t-r-lg)] flex flex-col items-center gap-3.5 text-center"
        style={{ background: "var(--t-note)", border: "1px solid var(--t-line-soft)" }}
      >
        <div
          className="w-full rounded-[var(--t-r-md)] overflow-hidden"
          style={{ maxWidth: 560, aspectRatio: "16/9", border: "1px solid var(--t-line-soft)", background: "var(--t-surface)" }}
        >
          <iframe
            src="/accueil/vignette.html"
            title=""
            aria-hidden="true"
            tabIndex={-1}
            style={{ colorScheme: "light", display: "block", width: "100%", height: "100%", border: 0, pointerEvents: "none" }}
          />
        </div>
        <h2
          id="tip-h"
          className="font-semibold text-xs uppercase m-0"
          style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.14em", color: "var(--t-warn-ink)", marginTop: 4 }}
        >
          Conseil du jour
        </h2>
        <p className="m-0 text-lg leading-[1.5]" style={{ maxWidth: "46ch", textWrap: "balance" }}>
          {tipOfTheDay()}
        </p>
      </section>
    </div>
  );
}
