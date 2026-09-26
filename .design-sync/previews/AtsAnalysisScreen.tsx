import { AtsAnalysisScreen } from "@atsme/ui-kit";

const resume = {
  id: 1,
  title: "Développeur Full-Stack",
  template: "violet",
  source: "scratch",
  hasOriginal: false,
  atsScore: 83,
  scoreBreakdown: { keywords: 24, structure: 17, readability: 16, sections: 18, atsCompat: 8 },
  recommendations: [
    {
      issue: "Le résumé pourrait être légèrement plus détaillé.",
      why: "Un résumé de 50 à 500 caractères donne suffisamment de contexte à un recruteur comme à un ATS.",
      fix: "Ajoutez une phrase sur vos objectifs de carrière.",
    },
  ],
  data: {
    personal: { fullName: "Ressane Messioughi", title: "Développeur Full-Stack", email: "ressane@example.com", phone: "", location: "Paris", links: [] },
    summary: "",
    experiences: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
    achievements: [],
    interests: [],
  },
  createdAt: "2026-08-03T09:00:00Z",
  updatedAt: "2026-09-24T10:00:00Z",
};

const resumes = [
  { id: 1, title: "Développeur Full-Stack", template: "violet", source: "scratch", ats_score: 83, updated_at: "2026-09-24T10:00:00Z", created_at: "2026-08-03T09:00:00Z" },
  { id: 2, title: "Lead Developer — candidature Acme", template: "obsidian", source: "import", ats_score: 61, updated_at: "2026-09-20T14:00:00Z", created_at: "2026-08-10T09:00:00Z" },
];

export function Default() {
  return <AtsAnalysisScreen resume={resume} resumes={resumes} />;
}
