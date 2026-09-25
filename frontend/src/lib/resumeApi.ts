import { api, getToken } from "./api";

export type Experience = {
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  achievements: string[];
};
export type Education = { school: string; degree: string; date?: string };
export type Project = { id?: string; name: string; description?: string; url?: string; technologies?: string[] };
export type Link = { label?: string; url: string };
export type NamedItem = { id?: string; name: string; level?: string };
export type Certification = { id?: string; name: string; issuer?: string; date?: string };

// Les compétences/langues/certifications/liens sont des objets ({name, ...}), pas de simples
// chaînes : c'est le format déjà produit par le parsing d'import et lu par les 3 exporteurs
// (pdf.js/docx.js/txt.js utilisent .name / .url) — le front doit s'y conformer, pas l'inverse.
export function rid(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export type ResumeData = {
  // photoUrl est une data URI (image redimensionnée et compressée côté navigateur avant
  // d'être enregistrée) : jamais un fichier séparé à héberger. Elle reste purement
  // décorative dans les exports — voir la note dans CvEditor.tsx et exporters/pdf.js.
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

export type ScoreBreakdown = {
  keywords: number;
  structure: number;
  readability: number;
  sections: number;
  atsCompat: number;
};
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

export type ScoredResume = Resume & { total: number; breakdown: ScoreBreakdown; recommendations: Recommendation[] };

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

export function listResumes() {
  return api<ResumeSummary[]>("/resumes");
}
export function getResume(id: number | string) {
  return api<Resume>(`/resumes/${id}`);
}
export function createResume(title: string) {
  return api<Resume>("/resumes", { method: "POST", body: JSON.stringify({ title }) });
}
export function updateResume(id: number | string, patch: { title?: string; template?: string; data?: ResumeData }) {
  return api<ScoredResume>(`/resumes/${id}`, { method: "PUT", body: JSON.stringify(patch) });
}
export function duplicateResume(id: number | string) {
  return api<Resume>(`/resumes/${id}/duplicate`, { method: "POST" });
}
export function deleteResume(id: number | string) {
  return api<{ ok: boolean }>(`/resumes/${id}`, { method: "DELETE" });
}

export async function importResume(file: File): Promise<Resume> {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/resumes/import", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : null;
  if (!res.ok) throw new Error(body?.error || "échec de l'import");
  return body as Resume;
}

export function listVersions(id: number | string) {
  return api<{ id: number; label: string | null; ats_score: number | null; created_at: string }[]>(
    `/resumes/${id}/versions`
  );
}
export function saveVersion(id: number | string, label?: string) {
  return api<{ ok: boolean }>(`/resumes/${id}/versions`, { method: "POST", body: JSON.stringify({ label }) });
}
export function restoreVersion(id: number | string, versionId: number) {
  return api<ScoredResume>(`/resumes/${id}/versions/${versionId}/restore`, { method: "POST" });
}
export function duplicateVersion(id: number | string, versionId: number) {
  return api<Resume>(`/resumes/${id}/versions/${versionId}/duplicate`, { method: "POST" });
}

export function jobMatch(id: number | string, jobText: string) {
  return api<{ score: number; matched: string[]; missing: string[] }>(`/resumes/${id}/job-match`, {
    method: "POST",
    body: JSON.stringify({ jobText }),
  });
}
export function latestJobMatch(id: number | string) {
  return api<{ score: number; matched: string[]; missing: string[]; created_at: string } | null>(
    `/resumes/${id}/job-match/latest`
  );
}

export function exportUrl(id: number | string, format: "pdf" | "docx" | "txt", options: { singlePage?: boolean } = {}) {
  const query = options.singlePage ? "?singlePage=1" : "";
  return `/api/resumes/${id}/export/${format}${query}`;
}

export async function downloadExport(
  id: number | string,
  format: "pdf" | "docx" | "txt",
  filename: string,
  options: { singlePage?: boolean } = {}
) {
  const token = getToken();
  const res = await fetch(exportUrl(id, format, options), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error("échec de l'export");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function emptyResumeData(): ResumeData {
  return {
    personal: { fullName: "", title: "", email: "", phone: "", location: "", links: [], photoUrl: "" },
    summary: "",
    experiences: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
    achievements: [],
    interests: [],
  };
}
