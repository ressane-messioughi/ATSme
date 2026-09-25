import { type FormEvent, useEffect, useState } from "react";
import { useAuth } from "../lib/auth.tsx";
import { api, ApiError } from "../lib/api.ts";
import { listResumes } from "../lib/resumeApi";
import { THEMES, useTheme } from "../lib/theme.ts";
import { btnPrimaryCls, btnSecondaryCls, cardCls, inputCls, labelCls } from "../lib/ui.ts";

const PLAN_LABELS: Record<string, string> = { free: "Free", pro: "Pro", premium: "Premium", entreprise: "Entreprise" };
const PLAN_LIMITS: Record<string, number> = { free: 5, pro: 30, premium: 100, entreprise: Infinity };

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [nameState, setNameState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwState, setPwState] = useState<"idle" | "saving" | "saved">("idle");

  const [resumeCount, setResumeCount] = useState<number | null>(null);

  useEffect(() => {
    setName(user?.name || "");
  }, [user?.name]);

  useEffect(() => {
    listResumes()
      .then((list) => setResumeCount(list.length))
      .catch(() => {});
  }, []);

  async function onSaveName(e: FormEvent) {
    e.preventDefault();
    setNameState("saving");
    try {
      await api("/me", { method: "PUT", body: JSON.stringify({ name }) });
      await refreshUser();
      setNameState("saved");
      setTimeout(() => setNameState("idle"), 2000);
    } catch {
      setNameState("error");
    }
  }

  async function onChangePassword(e: FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwState("saving");
    try {
      await api("/me/password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) });
      setPwState("saved");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPwState("idle"), 2000);
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : "Le changement de mot de passe a échoué.");
      setPwState("idle");
    }
  }

  const plan = user?.plan || "free";
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const pct = resumeCount != null && limit !== Infinity ? Math.min(100, (resumeCount / limit) * 100) : 0;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      <div className="flex flex-col gap-6">
        <div className={`${cardCls} p-5`}>
          <p className={`${labelCls} mb-4`}>Apparence</p>
          <p className="text-sm text-[var(--text-dim)] mb-4">Choisissez le thème qui vous convient le mieux — appliqué immédiatement, à tout l'espace de travail.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                aria-pressed={theme === t.id}
                className={`text-left rounded-xl border-2 p-3 transition-all duration-150 cursor-pointer ${
                  theme === t.id ? "border-[var(--violet-soft)]" : "border-[var(--border)] hover:border-[var(--text-faint)]"
                }`}
              >
                <span className="flex h-9 rounded-lg overflow-hidden mb-2.5 ring-1 ring-[var(--border)]">
                  {t.swatch.map((c, i) => (
                    <span key={i} className="flex-1" style={{ background: c }} />
                  ))}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-xs font-medium">{t.label}</span>
                  {theme === t.id && <span className="w-1.5 h-1.5 rounded-full bg-[var(--violet-soft)]" />}
                </span>
                <span className="text-[11px] text-[var(--text-faint)] leading-snug block mt-0.5">{t.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={`${cardCls} p-5`}>
          <p className={`${labelCls} mb-4`}>Profil</p>
          <form onSubmit={onSaveName} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Email</span>
              <input className={inputCls} value={user?.email || ""} disabled />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Nom</span>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <button type="submit" disabled={nameState === "saving" || !name.trim()} className={`${btnPrimaryCls} self-start`}>
              {nameState === "saving" ? "Enregistrement..." : nameState === "saved" ? "✓ Enregistré" : "Enregistrer"}
            </button>
            {nameState === "error" && <p className="text-sm text-[var(--danger)]">Échec de l'enregistrement.</p>}
          </form>
        </div>

        <div className={`${cardCls} p-5`}>
          <p className={`${labelCls} mb-4`}>Offre</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{PLAN_LABELS[plan] || plan}</span>
            <span className="text-xs font-[var(--ff-mono)] text-[var(--text-dim)]">
              {resumeCount ?? "—"} / {limit === Infinity ? "∞" : limit} CV
            </span>
          </div>
          <div className="h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--violet)] rounded-full transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className={`${cardCls} p-5`}>
          <p className={`${labelCls} mb-4`}>Mot de passe</p>
          <form onSubmit={onChangePassword} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Mot de passe actuel</span>
              <input type="password" className={inputCls} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Nouveau mot de passe</span>
              <input type="password" minLength={8} className={inputCls} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </label>
            {pwError && <p className="text-sm text-[var(--danger)]">{pwError}</p>}
            <button
              type="submit"
              disabled={pwState === "saving" || !currentPassword || newPassword.length < 8}
              className={`${btnSecondaryCls} self-start`}
            >
              {pwState === "saving" ? "Modification..." : pwState === "saved" ? "✓ Modifié" : "Changer le mot de passe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
