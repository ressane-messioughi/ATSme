import { api, getToken } from "./api";

export type AdminStats = {
  totalUsers: number;
  newUsers7d: number;
  onlineNow: number;
  activeUsers30d: number;
  totalResumes: number;
  analyzedResumes: number;
  importedResumes: number;
  avgScore: number | null;
};

export type AdminUser = {
  id: number;
  email: string;
  name: string;
  plan: string;
  is_admin: number;
  created_at: string;
  last_seen_at: string | null;
  resumeCount: number;
  avgScore: number | null;
};

export type AdminResume = {
  id: number;
  title: string;
  template: string;
  source: string;
  ats_score: number | null;
  updated_at: string;
  created_at: string;
  hasOriginal: boolean;
  userId: number;
  userName: string;
  userEmail: string;
};

export function getAdminStats() {
  return api<AdminStats>("/admin/stats");
}
export function listAdminUsers() {
  return api<AdminUser[]>("/admin/users");
}
export function listAdminResumes() {
  return api<AdminResume[]>("/admin/resumes");
}

export function isOnline(lastSeenAt: string | null): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < 5 * 60 * 1000;
}

export async function downloadAdminOriginal(resumeId: number, filenameHint: string) {
  const token = getToken();
  const res = await fetch(`/api/admin/resumes/${resumeId}/original`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error("aucun fichier original");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filenameHint;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadAdminExport(resumeId: number, format: "pdf" | "docx" | "txt", filename: string) {
  const token = getToken();
  const res = await fetch(`/api/admin/resumes/${resumeId}/export/${format}`, {
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
