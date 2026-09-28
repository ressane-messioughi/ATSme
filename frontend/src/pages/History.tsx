import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { type ResumeSummary, listResumes, listVersions, scoreTone } from "../lib/resumeApi";

type VersionRow = { id: number; label: string | null; ats_score: number | null; created_at: string };
type Event = { key: string; resumeId: number; resumeTitle: string; label: string | null; score: number | null; date: Date };

const DOT_COLOR = { good: "var(--t-accent)", warn: "var(--t-warn)", danger: "var(--t-danger)" };

function dayLabel(date: Date): string {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

export default function History() {
  const [resumes, setResumes] = useState<ResumeSummary[] | null>(null);
  const [versionsByResume, setVersionsByResume] = useState<Record<number, VersionRow[]>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listResumes()
      .then(async (list) => {
        setResumes(list);
        const entries = await Promise.all(list.map(async (r) => [r.id, await listVersions(r.id).catch(() => [])] as const));
        setVersionsByResume(Object.fromEntries(entries));
      })
      .catch(() => setError("Impossible de charger l'historique."));
  }, []);

  const days = useMemo(() => {
    const events: Event[] = [];
    for (const r of resumes || []) {
      for (const v of versionsByResume[r.id] || []) {
        events.push({
          key: `${r.id}-${v.id}`,
          resumeId: r.id,
          resumeTitle: r.title,
          label: v.label,
          score: v.ats_score,
          date: new Date(v.created_at),
        });
      }
    }
    events.sort((a, b) => b.date.getTime() - a.date.getTime());
    const groups = new Map<string, Event[]>();
    for (const ev of events) {
      const key = dayLabel(ev.date);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(ev);
    }
    return [...groups.entries()];
  }, [resumes, versionsByResume]);

  const eyebrow = (
    <div className="font-semibold text-xs uppercase" style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.14em", color: "var(--t-muted)" }}>
      Suivre
    </div>
  );

  return (
    <div className="max-w-[1080px] flex flex-col gap-7">
      <header className="flex flex-col gap-1.5">
        {eyebrow}
        <h1 className="font-black leading-[1.15] m-0" style={{ fontFamily: "var(--t-display)", fontSize: "clamp(28px,3vw,36px)" }}>
          Ce qui s'est passé
        </h1>
      </header>

      {error && <p style={{ color: "var(--t-danger)" }}>{error}</p>}

      {resumes && days.length === 0 && (
        <div className="rounded-[var(--t-r-lg)] px-6 py-14 text-center" style={{ border: "1px dashed var(--t-line-soft)" }}>
          <p className="text-sm" style={{ color: "var(--t-ink2)" }}>
            Aucune version enregistrée pour l'instant. Ouvrez un CV et cliquez sur « + Nouvelle » dans le bloc Versions pour commencer à
            suivre sa progression.
          </p>
        </div>
      )}

      {days.map(([label, events]) => (
        <section key={label} className="flex flex-col gap-2.5">
          <div
            className="font-semibold text-xs uppercase"
            style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.12em", color: "var(--t-muted)" }}
          >
            {label}
          </div>
          <div className="rounded-[var(--t-r-lg)] px-[18px]" style={{ background: "var(--t-surface)", border: "1px solid var(--t-line-soft)" }}>
            {events.map((ev, i) => (
              <div
                key={ev.key}
                className="flex gap-3.5 items-start py-3.5"
                style={{ borderBottom: i < events.length - 1 ? "1px dashed var(--t-line-soft)" : "none" }}
              >
                <span
                  aria-hidden="true"
                  className="w-3 h-3 rounded-full shrink-0 mt-1.5"
                  style={{ background: DOT_COLOR[scoreTone(ev.score)], border: "1.5px solid var(--t-line)" }}
                />
                <div className="flex-1 min-w-0">
                  <Link to={`/cv/${ev.resumeId}`} className="font-semibold text-[15px] hover:underline">
                    {ev.label || "Version enregistrée"} · {ev.resumeTitle}
                  </Link>
                  <div className="text-sm" style={{ color: "var(--t-ink2)" }}>
                    {ev.score != null ? `Score ${ev.score}/100` : "Score non calculé"}
                  </div>
                </div>
                <div className="text-[13px] shrink-0" style={{ color: "var(--t-muted)" }}>
                  {ev.date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
