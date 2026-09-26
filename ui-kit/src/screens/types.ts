// Types partagés par les écrans du design system, dupliqués (volontairement, en version
// allégée) depuis frontend/src/lib/resumeApi.ts et lib/adminApi.ts plutôt qu'importés :
// ce paquet ne doit dépendre d'aucune logique réseau de l'app, seulement de formes de
// données. Voir .design-sync/NOTES.md — un changement de forme côté app doit être répercuté
// ici à la main.

export type NavigateFn = (path: string) => void;

export type Experience = {
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  achievements: string[];
};
export type Education = { school: string; degree: string; field?: string; date?: string; startDate?: string; endDate?: string; description?: string };
export type Project = { id?: string; name: string; description?: string; url?: string };
export type Link = { label?: string; url: string };
export type NamedItem = { id?: string; name: string; level?: string };
export type Certification = { id?: string; name: string; issuer?: string; date?: string };

export type ResumeData = {
  personal: { fullName: string; title: string; email: string; phone: string; location: string; links: Link[]; photoUrl?: string };
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: NamedItem[];
  languages: NamedItem[];
  certifications: Certification[];
  projects: Project[];
  achievements: string[];
  interests: string[];
};

export type ScoreBreakdown = { keywords: number; structure: number; readability: number; sections: number; atsCompat: number };
export type Recommendation = { issue: string; why: string; fix: string };

export type Resume = {
  id: number;
  title: string;
  template: string;
  source: string;
  hasOriginal: boolean;
  atsScore: number | null;
  scoreBreakdown: ScoreBreakdown | null;
  recommendations: Recommendation[] | null;
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
};

export type ResumeSummary = {
  id: number;
  title: string;
  template: string;
  source: string;
  ats_score: number | null;
  updated_at: string;
  created_at: string;
};

export type VersionRow = { id: number; label: string | null; ats_score: number | null; created_at: string };

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  is_admin: number | boolean;
  plan: string;
  resumeCount: number;
  avgScore: number | null;
  created_at: string;
  last_seen_at: string | null;
};

export type AdminResume = {
  id: number;
  title: string;
  userName: string;
  userEmail: string;
  source: string;
  hasOriginal: boolean;
  ats_score: number | null;
  updated_at: string;
};

export function scoreLabel(score: number | null): string {
  if (score == null) return "—";
  if (score < 40) return "Très faible";
  if (score < 60) return "Faible";
  if (score < 70) return "Moyen";
  if (score < 80) return "Bon";
  if (score < 90) return "Très bon";
  return "Excellent";
}

export function scoreTone(score: number | null): "danger" | "warn" | "good" {
  if (score == null) return "warn";
  if (score < 60) return "danger";
  if (score < 80) return "warn";
  return "good";
}
