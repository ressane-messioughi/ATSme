import type { ResumeData } from "./screens/types.js";

const VIOLET = "#5b21b6";
const INK = "#1c1a24";
const DIM = "#5c5870";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold tracking-wide mb-1.5 pb-1 border-b" style={{ color: VIOLET, borderColor: "#d8d4e8" }}>
      {children}
    </p>
  );
}

export type CvPreviewCardProps = { data: ResumeData };

/**
 * Aperçu fidèle d'un CV tel qu'il sera exporté (mêmes couleurs, mêmes règles de mise en
 * page que le PDF généré côté serveur) — feuille blanche, format lettre. La photo, quand
 * il y en a une, est purement décorative et alignée sur le nom sans jamais empiéter sur
 * le texte qui suit.
 *
 * @example
 * <CvPreviewCard data={{ personal: { fullName: "Ressane Messioughi", title: "Développeur", email: "", phone: "", location: "", links: [] }, summary: "", experiences: [], education: [], skills: [], languages: [], certifications: [], projects: [], achievements: [], interests: [] }} />
 */
export function CvPreviewCard({ data }: CvPreviewCardProps) {
  const contact = [data.personal.email, data.personal.phone, data.personal.location, ...data.personal.links.map((l) => l.url)].filter(Boolean);

  return (
    <div className="bg-white text-[13px] leading-snug rounded-lg shadow-sm p-8 min-h-[400px]" style={{ color: INK }}>
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-xl font-bold" style={{ color: INK }}>
            {data.personal.fullName || "Votre nom"}
          </h1>
          {data.personal.title && (
            <p className="text-sm mt-0.5" style={{ color: VIOLET }}>
              {data.personal.title}
            </p>
          )}
          {contact.length > 0 && (
            <p className="text-[11px] mt-1.5" style={{ color: DIM }}>
              {contact.join("   •   ")}
            </p>
          )}
        </div>

        {data.personal.photoUrl && (
          <img src={data.personal.photoUrl} alt="" aria-hidden="true" className="shrink-0 w-20 h-20 rounded-full object-cover border-2" style={{ borderColor: "#d8d4e8" }} />
        )}
      </div>

      {data.summary && (
        <div className="mt-4">
          <SectionTitle>PROFIL</SectionTitle>
          <p style={{ color: INK }}>{data.summary}</p>
        </div>
      )}

      {data.experiences.length > 0 && (
        <div className="mt-4">
          <SectionTitle>EXPÉRIENCE PROFESSIONNELLE</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {data.experiences.map((e, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold">
                    {e.role || "Poste"}
                    {e.company ? ` — ${e.company}` : ""}
                  </p>
                  <p className="text-[11px] shrink-0" style={{ color: DIM }}>
                    {[e.startDate, e.endDate || "présent"].filter(Boolean).join(" – ")}
                  </p>
                </div>
                {e.description && <p style={{ color: INK }}>{e.description}</p>}
                {e.achievements.length > 0 && (
                  <ul className="list-disc ml-4 mt-0.5">
                    {e.achievements.map((a, j) => (
                      <li key={j}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.education.length > 0 && (
        <div className="mt-4">
          <SectionTitle>FORMATION</SectionTitle>
          <div className="flex flex-col gap-1">
            {data.education.map((ed, i) => (
              <div key={i} className="flex items-baseline justify-between gap-2">
                <p className="font-medium">
                  {ed.degree}
                  {ed.school ? ` — ${ed.school}` : ""}
                </p>
                {ed.date && (
                  <p className="text-[11px] shrink-0" style={{ color: DIM }}>
                    {ed.date}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.skills.length > 0 && (
        <div className="mt-4">
          <SectionTitle>COMPÉTENCES</SectionTitle>
          <p>{data.skills.map((s) => s.name).join("   •   ")}</p>
        </div>
      )}

      {data.languages.length > 0 && (
        <div className="mt-4">
          <SectionTitle>LANGUES</SectionTitle>
          <p>{data.languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join("   •   ")}</p>
        </div>
      )}

      {data.certifications.length > 0 && (
        <div className="mt-4">
          <SectionTitle>CERTIFICATIONS</SectionTitle>
          <div className="flex flex-col gap-0.5">
            {data.certifications.map((c, i) => (
              <p key={i}>{[c.name, c.issuer, c.date].filter(Boolean).join("  —  ")}</p>
            ))}
          </div>
        </div>
      )}

      {data.projects.length > 0 && (
        <div className="mt-4">
          <SectionTitle>PROJETS</SectionTitle>
          <div className="flex flex-col gap-1.5">
            {data.projects.map((p, i) => (
              <div key={i}>
                <p className="font-semibold">{p.name}</p>
                {p.description && <p style={{ color: INK }}>{p.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.interests.length > 0 && (
        <div className="mt-4">
          <SectionTitle>CENTRES D'INTÉRÊT</SectionTitle>
          <p>{data.interests.join("   •   ")}</p>
        </div>
      )}
    </div>
  );
}
