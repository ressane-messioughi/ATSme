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
export const PLANS = ["free", "pro", "premium", "entreprise"] as const;
export type Plan = (typeof PLANS)[number];
export function updateUserPlan(userId: number, plan: Plan) {
  return api<{ id: number; plan: string }>(`/admin/users/${userId}/plan`, {
    method: "PATCH",
    body: JSON.stringify({ plan }),
  });
}
export function listAdminResumes() {
  return api<AdminResume[]>("/admin/resumes");
}

export type PromoCode = {
  id: number;
  code: string;
  kind: "plan" | "resumes";
  plan_value: string | null;
  resumes_value: number | null;
  max_redemptions: number | null;
  redemptions_count: number;
  active: number;
  expires_at: string | null;
  created_at: string;
};
export function listPromoCodes() {
  return api<PromoCode[]>("/admin/promo-codes");
}
export function createPromoCode(input: {
  code: string;
  kind: "plan" | "resumes";
  planValue?: Plan;
  resumesValue?: number;
  maxRedemptions?: number | null;
  expiresAt?: string | null;
}) {
  return api<PromoCode>("/admin/promo-codes", { method: "POST", body: JSON.stringify(input) });
}
export function setPromoCodeActive(id: number, active: boolean) {
  return api<PromoCode>(`/admin/promo-codes/${id}`, { method: "PATCH", body: JSON.stringify({ active }) });
}
export function deletePromoCode(id: number) {
  return api<{ ok: boolean }>(`/admin/promo-codes/${id}`, { method: "DELETE" });
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
