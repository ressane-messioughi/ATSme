// Données d'exemple partagées par les écrans — réalistes, jamais "lorem" ou "test", pour
// que chaque écran se présente déjà rempli quand on l'ouvre dans Claude Design.
import type { AdminResume, AdminUser, Resume, ResumeSummary } from "./types.js";

export const sampleResumeData: Resume["data"] = {
  personal: {
    fullName: "Ressane Messioughi",
    title: "Développeur Full-Stack",
    email: "ressane@example.com",
    phone: "06 12 34 56 78",
    location: "Paris, France",
    links: [{ label: "LinkedIn", url: "https://linkedin.com/in/ressane" }],
    photoUrl: "",
  },
  summary:
    "Développeur Full-Stack expérimenté, spécialisé en React et Node.js, avec un fort accent sur la performance et la fiabilité des systèmes déployés en production.",
  experiences: [
    {
      company: "ATSme",
      role: "Développeur Full-Stack",
      location: "Paris",
      startDate: "2024",
      endDate: "",
      current: true,
      description: "Conception et développement de la plateforme de création de CV optimisés ATS.",
      achievements: ["Réduit le temps de génération d'un CV de 40%", "Mis en place l'export PDF/DOCX/TXT", "Conçu le moteur de score ATS déterministe"],
    },
    {
      company: "TechCorp",
      role: "Développeur Frontend",
      location: "Lyon",
      startDate: "2021",
      endDate: "2024",
      description: "Développement d'interfaces React pour une plateforme SaaS B2B.",
      achievements: ["Migré l'application vers TypeScript", "Amélioré le score Lighthouse de 62 à 94"],
    },
  ],
  education: [{ school: "École 42", degree: "Formation développeur", date: "2020" }],
  skills: [{ name: "React" }, { name: "TypeScript" }, { name: "Node.js" }, { name: "PostgreSQL" }, { name: "Tailwind CSS" }],
  languages: [{ name: "Français", level: "natif" }, { name: "Anglais", level: "courant" }],
  certifications: [{ name: "AWS Certified Developer", issuer: "Amazon", date: "2023" }],
  projects: [{ name: "ATSme", description: "SaaS de création de CV optimisés ATS.", url: "https://atsme.ressane.fr" }],
  achievements: [],
  interests: ["Course à pied", "Photographie"],
};

export const sampleScoreBreakdown = { keywords: 24, structure: 17, readability: 16, sections: 18, atsCompat: 8 };

export const sampleRecommendations = [
  {
    issue: "Le résumé pourrait être légèrement plus détaillé.",
    why: "Un résumé de 50 à 500 caractères donne suffisamment de contexte à un recruteur comme à un ATS.",
    fix: "Ajoutez une phrase sur vos objectifs de carrière.",
  },
];

export const sampleResume: Resume = {
  id: 1,
  title: "Développeur Full-Stack",
  template: "violet",
  source: "scratch",
  hasOriginal: false,
  atsScore: 83,
  scoreBreakdown: sampleScoreBreakdown,
  recommendations: sampleRecommendations,
  data: sampleResumeData,
  createdAt: "2026-08-03T09:00:00Z",
  updatedAt: "2026-09-24T10:00:00Z",
};

export const sampleResumeList: ResumeSummary[] = [
  { id: 1, title: "Développeur Full-Stack", template: "violet", source: "scratch", ats_score: 83, updated_at: "2026-09-24T10:00:00Z", created_at: "2026-08-03T09:00:00Z" },
  { id: 2, title: "Lead Developer — candidature Acme", template: "obsidian", source: "import", ats_score: 61, updated_at: "2026-09-20T14:00:00Z", created_at: "2026-08-10T09:00:00Z" },
  { id: 3, title: "CV version courte", template: "purple-minimal", source: "scratch", ats_score: null, updated_at: "2026-09-18T09:30:00Z", created_at: "2026-09-18T09:30:00Z" },
];

export const sampleVersions = [
  { id: 1, label: "Premier jet", ats_score: 52, created_at: "2026-08-05T09:00:00Z" },
  { id: 2, label: "Après retours", ats_score: 71, created_at: "2026-08-20T09:00:00Z" },
  { id: 3, label: null, ats_score: 83, created_at: "2026-09-24T10:00:00Z" },
];

export const sampleJobMatch = {
  score: 78,
  matched: ["React", "TypeScript", "Node.js", "API REST"],
  missing: ["GraphQL", "Kubernetes", "Terraform"],
};

export const sampleAdminUsers: AdminUser[] = [
  { id: 1, name: "Ressane Messioughi", email: "ressane@example.com", is_admin: 1, plan: "pro", resumeCount: 3, avgScore: 76, created_at: "2026-07-01T09:00:00Z", last_seen_at: "2026-09-26T09:50:00Z" },
  { id: 2, name: "Sofia Moreau", email: "sofia.moreau@example.com", is_admin: 0, plan: "free", resumeCount: 1, avgScore: 58, created_at: "2026-08-12T09:00:00Z", last_seen_at: "2026-09-25T18:20:00Z" },
  { id: 3, name: "Yanis Belkacem", email: "yanis.belkacem@example.com", is_admin: 0, plan: "free", resumeCount: 2, avgScore: null, created_at: "2026-09-02T09:00:00Z", last_seen_at: null },
];

export const sampleAdminResumes: AdminResume[] = [
  { id: 1, title: "Développeur Full-Stack", userName: "Ressane Messioughi", userEmail: "ressane@example.com", source: "scratch", hasOriginal: false, ats_score: 83, updated_at: "2026-09-24T10:00:00Z" },
  { id: 2, title: "Chargée de projet", userName: "Sofia Moreau", userEmail: "sofia.moreau@example.com", source: "import", hasOriginal: true, ats_score: 58, updated_at: "2026-09-25T11:00:00Z" },
];

export const sampleAdminStats = {
  totalUsers: 128,
  onlineNow: 6,
  newUsers7d: 14,
  activeUsers30d: 74,
  totalResumes: 241,
  importedResumes: 96,
  analyzedResumes: 183,
  avgScore: 68,
};
