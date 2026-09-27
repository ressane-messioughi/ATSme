import { useEffect, useState } from "react";
import { type ResumeSummary, jobMatch, listResumes } from "../lib/resumeApi";
import { IconCheck, IconWarn } from "../components/icons.tsx";

export default function JobOffers() {
  const [resumes, setResumes] = useState<ResumeSummary[] | null>(null);
  const [resumeId, setResumeId] = useState("");
  const [jobText, setJobText] = useState("");
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; matched: string[]; missing: string[] } | null>(null);

  useEffect(() => {
    listResumes()
      .then((list) => {
        setResumes(list);
        if (list[0]) setResumeId(String(list[0].id));
      })
      .catch(() => setError("Impossible de charger vos CV."));
  }, []);

  async function analyze() {
    if (!resumeId || !jobText.trim()) return;
    setMatching(true);
    setError(null);
    try {
      const res = await jobMatch(resumeId, jobText);
      setResult(res);
    } catch {
      setError("L'analyse a échoué.");
    } finally {
      setMatching(false);
    }
  }

  const eyebrow = (
    <div className="font-semibold text-xs uppercase" style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.14em", color: "var(--t-muted)" }}>
      Optimiser
    </div>
  );

  if (resumes && resumes.length === 0) {
    return (
      <div className="max-w-[720px] flex flex-col gap-2">
        {eyebrow}
        <h1 className="font-black text-3xl m-0" style={{ fontFamily: "var(--t-display)" }}>
          Offres d'emploi
        </h1>
        <div className="rounded-[var(--t-r-lg)] px-6 py-14 text-center mt-4" style={{ border: "1px dashed var(--t-line-soft)" }}>
          <p className="text-sm" style={{ color: "var(--t-ink2)" }}>
            Créez ou importez un CV pour pouvoir le comparer à une offre.
          </p>
        </div>
      </div>
    );
  }

  const fieldStyle = {
    minHeight: 44,
    padding: "10px 12px",
    borderRadius: "var(--t-r-md)",
    border: "1.5px solid var(--t-field-line)",
    background: "var(--t-field)",
    color: "var(--t-ink)",
    outline: "none",
  } as const;

  return (
    <div className="max-w-[1080px] flex flex-col gap-7">
      <header className="flex flex-col gap-2">
        {eyebrow}
        <h1 className="font-black leading-[1.15] m-0" style={{ fontFamily: "var(--t-display)", fontSize: "clamp(28px,3vw,36px)" }}>
          Offres d'emploi
        </h1>
        <p className="m-0 text-base max-w-[62ch]" style={{ color: "var(--t-ink2)" }}>
          Collez le texte d'une offre. ATSme repère les mots-clés attendus et ceux qui manquent à votre CV.
        </p>
      </header>

      {error && <p style={{ color: "var(--t-danger)" }}>{error}</p>}

      <div className="grid gap-5 items-start" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))" }}>
        <section
          aria-labelledby="of-in"
          className="p-6 rounded-[var(--t-r-lg)] flex flex-col gap-4"
          style={{ background: "var(--t-surface)", border: "1px solid var(--t-line-soft)" }}
        >
          <h2 id="of-in" className="font-black text-xl m-0" style={{ fontFamily: "var(--t-display)" }}>
            Offre
          </h2>
          {resumes && (
            <label className="flex flex-col gap-1.5 font-semibold text-sm" style={{ color: "var(--t-ink)" }}>
              CV comparé
              <select value={resumeId} onChange={(e) => setResumeId(e.target.value)} style={fieldStyle}>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="flex flex-col gap-1.5 font-semibold text-sm" style={{ color: "var(--t-ink)" }}>
            Texte de l'offre
            <textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Collez ici la description complète du poste..."
              rows={12}
              style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.55, fontWeight: 400 }}
            />
          </label>
          <button
            type="button"
            onClick={analyze}
            disabled={matching || !jobText.trim() || !resumeId}
            className="inline-flex items-center justify-center gap-2 min-h-11 px-[18px] rounded-[var(--t-r-md)] font-semibold text-[15px] cursor-pointer disabled:opacity-50"
            style={{ border: "1.5px solid var(--t-line)", background: "var(--t-accent)", color: "var(--t-on-accent)", boxShadow: "0 2px 0 var(--t-shadow)" }}
          >
            {matching ? "Analyse en cours..." : "Analyser le matching"}
          </button>
        </section>

        <section
          aria-labelledby="of-res"
          aria-live="polite"
          className="p-6 rounded-[var(--t-r-lg)] flex flex-col gap-4"
          style={{ background: "var(--t-surface)", border: "1px solid var(--t-line-soft)" }}
        >
          <h2 id="of-res" className="font-black text-xl m-0" style={{ fontFamily: "var(--t-display)" }}>
            Résultat
          </h2>
          {!result && (
            <p className="text-sm" style={{ color: "var(--t-muted)" }}>
              Collez une offre et lancez l'analyse pour voir le résultat ici.
            </p>
          )}
          {result && (
            <>
              <div className="flex flex-wrap gap-5 items-center">
                <div
                  role="img"
                  aria-label={`Correspondance : ${result.score} %`}
                  className="w-[120px] h-[120px] rounded-full grid place-items-center shrink-0"
                  style={{
                    background: `conic-gradient(${
                      result.score >= 80 ? "var(--t-accent)" : result.score >= 50 ? "var(--t-warn)" : "var(--t-danger)"
                    } ${result.score * 3.6}deg, var(--t-track) 0)`,
                  }}
                >
                  <div
                    className="w-[94px] h-[94px] rounded-full grid place-items-center font-black text-[28px]"
                    style={{ background: "var(--t-surface)", fontFamily: "var(--t-display)" }}
                  >
                    {result.score}%
                  </div>
                </div>
                <div className="flex-1 min-w-[160px] flex flex-col gap-1.5">
                  <div className="font-bold text-lg">
                    {result.matched.length} mot{result.matched.length > 1 ? "s" : ""}-clé{result.matched.length > 1 ? "s" : ""} sur{" "}
                    {result.matched.length + result.missing.length}
                  </div>
                </div>
              </div>

              {result.matched.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[15px] m-0 mb-2">Présents dans votre CV</h3>
                  <ul className="list-none m-0 p-0 flex flex-wrap gap-2">
                    {result.matched.map((k) => (
                      <li
                        key={k}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--t-r-pill)] font-semibold text-[13px] whitespace-nowrap"
                        style={{ background: "var(--t-accent-soft)", color: "var(--t-accent-ink)" }}
                      >
                        <IconCheck className="w-[14px] h-[14px]" />
                        {k}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.missing.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[15px] m-0 mb-2">Manquants</h3>
                  <ul className="list-none m-0 p-0 flex flex-wrap gap-2">
                    {result.missing.map((k) => (
                      <li
                        key={k}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--t-r-pill)] font-semibold text-[13px] whitespace-nowrap"
                        style={{ background: "var(--t-warn-soft)", color: "var(--t-warn-ink)" }}
                      >
                        <IconWarn className="w-[14px] h-[14px]" />
                        {k}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.matched.length > 0 && result.missing.length === 0 && (
                <p className="m-0 text-[15px]" style={{ color: "var(--t-ink2)" }}>
                  Aucun mot-clé manquant.
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
