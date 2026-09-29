import { type FormEvent, useEffect, useState } from "react";
import { useAuth } from "../lib/auth.tsx";
import { api, ApiError } from "../lib/api.ts";
import { listResumes } from "../lib/resumeApi";
import { THEME3D_META, useTheme3D, type Theme3DId } from "../lib/theme3d.ts";
import { AVATARS, Avatar, type AvatarId } from "../lib/avatars.tsx";

const PLAN_LABELS: Record<string, string> = { free: "Free", pro: "Pro", premium: "Premium", entreprise: "Entreprise" };
const PLAN_LIMITS: Record<string, number> = { free: 5, pro: 30, premium: 100, entreprise: Infinity };

const THEME_DESCRIPTIONS: Record<Theme3DId, string> = {
  ghibli: "Papier crème, vert mousse, contours dessinés",
  cyber: "Nuit violette, néons magenta et jaune",
  tech: "Gris ardoise, bleu électrique, sobre",
  vinyle: "Noir profond, vert vif, formes pilule",
};

const sectionStyle = { background: "var(--t-surface)", border: "1px solid var(--t-line-soft)", borderRadius: "var(--t-r-lg)" };
const fieldStyle = { border: "1.5px solid var(--t-field-line)", background: "var(--t-field)", color: "var(--t-ink)" };

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme3D();
  const [name, setName] = useState(user?.name || "");
  const [nameState, setNameState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwState, setPwState] = useState<"idle" | "saving" | "saved">("idle");

  const [resumeCount, setResumeCount] = useState<number | null>(null);
  const [avatarState, setAvatarState] = useState<"idle" | "saving">("idle");

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

  async function onPickAvatar(avatar: AvatarId) {
    setAvatarState("saving");
    try {
      await api("/me", { method: "PUT", body: JSON.stringify({ avatar }) });
      await refreshUser();
    } finally {
      setAvatarState("idle");
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
  const baseLimit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const limit = baseLimit === Infinity ? baseLimit : baseLimit + (user?.bonus_resumes || 0);
  const pct = resumeCount != null && limit !== Infinity ? Math.min(100, (resumeCount / limit) * 100) : 0;

  return (
    <div className="max-w-[1080px] mx-auto flex flex-col gap-7">
      <header className="flex flex-col gap-1.5">
        <div className="font-semibold text-xs uppercase" style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.14em", color: "var(--t-muted)" }}>
          Compte
        </div>
        <h1 className="font-black leading-[1.15] m-0" style={{ fontFamily: "var(--t-display)", fontSize: "clamp(28px,3vw,36px)" }}>
          Paramètres
        </h1>
      </header>

      <section aria-labelledby="theme-h" className="p-[22px] flex flex-col gap-3.5" style={sectionStyle}>
        <h2 id="theme-h" className="font-black text-[22px] m-0" style={{ fontFamily: "var(--t-display)" }}>
          Thème
        </h2>
        <div role="radiogroup" aria-label="Thème de l'interface" className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
          {THEME3D_META.map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTheme(t.id)}
                className="min-h-11 flex flex-col gap-2.5 p-3 rounded-[var(--t-r-md)] text-left cursor-pointer"
                style={
                  active
                    ? { border: "1.5px solid var(--t-accent)", background: "var(--t-accent-soft)", color: "var(--t-ink)" }
                    : { border: "1.5px solid var(--t-line-soft)", background: "var(--t-field)", color: "var(--t-ink)" }
                }
              >
                <span className="h-[54px] rounded-[var(--t-r-md)]" style={{ background: t.swatch, border: "1.5px solid var(--t-line)" }} />
                <span className="font-bold text-[15px]">{t.label}</span>
                <span className="text-[13px]" style={{ color: "var(--t-muted)" }}>
                  {THEME_DESCRIPTIONS[t.id]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="avatar-h" className="p-[22px] flex flex-col gap-3.5" style={sectionStyle}>
        <h2 id="avatar-h" className="font-black text-[22px] m-0" style={{ fontFamily: "var(--t-display)" }}>
          Avatar
        </h2>
        <div role="radiogroup" aria-label="Icône de profil" className="flex flex-wrap gap-3">
          <button
            type="button"
            role="radio"
            aria-checked={!user?.avatar}
            aria-label="Aucun avatar (initiale)"
            onClick={() => onPickAvatar(null as unknown as AvatarId)}
            disabled={avatarState === "saving"}
            className="w-14 h-14 rounded-full grid place-items-center cursor-pointer disabled:opacity-60"
            style={{ outline: !user?.avatar ? "2.5px solid var(--t-accent)" : "2.5px solid transparent", outlineOffset: 2 }}
          >
            <Avatar avatar={null} name={user?.name} size={56} />
          </button>
          {AVATARS.map((a) => (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={user?.avatar === a.id}
              aria-label={a.label}
              title={a.label}
              onClick={() => onPickAvatar(a.id)}
              disabled={avatarState === "saving"}
              className="w-14 h-14 rounded-full grid place-items-center cursor-pointer disabled:opacity-60"
              style={{ outline: user?.avatar === a.id ? "2.5px solid var(--t-accent)" : "2.5px solid transparent", outlineOffset: 2 }}
            >
              <Avatar avatar={a.id} size={56} />
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="profile-h" className="p-[22px] flex flex-col gap-3.5" style={sectionStyle}>
        <h2 id="profile-h" className="font-black text-[22px] m-0" style={{ fontFamily: "var(--t-display)" }}>
          Profil
        </h2>
        <form onSubmit={onSaveName} className="flex flex-col gap-4">
          <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <label className="flex flex-col gap-1.5 font-semibold text-[13px]" style={{ color: "var(--t-ink2)" }}>
              Email
              <input value={user?.email || ""} disabled className="min-h-11 px-3 rounded-[var(--t-r-md)] text-[15px] outline-none opacity-70" style={fieldStyle} />
            </label>
            <label className="flex flex-col gap-1.5 font-semibold text-[13px]" style={{ color: "var(--t-ink2)" }}>
              Nom
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="min-h-11 px-3 rounded-[var(--t-r-md)] text-[15px] outline-none"
                style={fieldStyle}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={nameState === "saving" || !name.trim()}
            className="self-start inline-flex items-center justify-center min-h-11 px-4 rounded-[var(--t-r-md)] font-semibold text-sm cursor-pointer disabled:opacity-60"
            style={{ border: "1.5px solid var(--t-line)", background: "var(--t-accent)", color: "var(--t-on-accent)" }}
          >
            {nameState === "saving" ? "Enregistrement..." : nameState === "saved" ? "✓ Enregistré" : "Enregistrer"}
          </button>
          {nameState === "error" && <p style={{ color: "var(--t-danger)" }}>Échec de l'enregistrement.</p>}
        </form>
      </section>

      <section aria-labelledby="plan-h" className="p-[22px] flex flex-col gap-3" style={sectionStyle}>
        <h2 id="plan-h" className="font-black text-[22px] m-0" style={{ fontFamily: "var(--t-display)" }}>
          Offre
        </h2>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">{PLAN_LABELS[plan] || plan}</span>
          <span className="text-xs" style={{ fontFamily: "var(--t-mono)", color: "var(--t-ink2)" }}>
            {resumeCount ?? "-"} / {limit === Infinity ? "∞" : limit} CV
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--t-track)" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--t-accent)" }} />
        </div>
        {Boolean(user?.bonus_resumes) && (
          <p className="m-0 text-xs" style={{ color: "var(--t-accent)" }}>
            dont {user?.bonus_resumes} CV bonus (code promo)
          </p>
        )}
        <a
          href="/abonnement"
          className="self-start mt-1 inline-flex items-center min-h-11 px-4 rounded-[var(--t-r-md)] font-semibold text-sm"
          style={{ border: "1.5px solid var(--t-line)", background: "var(--t-surface)", color: "var(--t-ink)" }}
        >
          Gérer mon offre
        </a>
      </section>

      <section aria-labelledby="pw-h" className="p-[22px] flex flex-col gap-3.5" style={sectionStyle}>
        <h2 id="pw-h" className="font-black text-[22px] m-0" style={{ fontFamily: "var(--t-display)" }}>
          Mot de passe
        </h2>
        <form onSubmit={onChangePassword} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 font-semibold text-[13px]" style={{ color: "var(--t-ink2)" }}>
            Mot de passe actuel
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="min-h-11 px-3 rounded-[var(--t-r-md)] text-[15px] outline-none"
              style={fieldStyle}
            />
          </label>
          <label className="flex flex-col gap-1.5 font-semibold text-[13px]" style={{ color: "var(--t-ink2)" }}>
            Nouveau mot de passe
            <input
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="min-h-11 px-3 rounded-[var(--t-r-md)] text-[15px] outline-none"
              style={fieldStyle}
            />
          </label>
          {pwError && <p style={{ color: "var(--t-danger)" }}>{pwError}</p>}
          <button
            type="submit"
            disabled={pwState === "saving" || !currentPassword || newPassword.length < 8}
            className="self-start inline-flex items-center justify-center min-h-11 px-4 rounded-[var(--t-r-md)] font-semibold text-sm cursor-pointer disabled:opacity-60"
            style={{ border: "1.5px solid var(--t-field-line)", background: "var(--t-surface)", color: "var(--t-ink)" }}
          >
            {pwState === "saving" ? "Modification..." : pwState === "saved" ? "✓ Modifié" : "Changer le mot de passe"}
          </button>
        </form>
      </section>
    </div>
  );
}
