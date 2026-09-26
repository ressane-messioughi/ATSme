// Contrepartie présentationnelle de frontend/src/pages/Settings.tsx pour le design
// system : découplée du réseau (pas d'appel à /me, /me/password) et du contexte de thème
// global de l'app (lib/theme.ts) — la sélection de thème ici ne fait que mettre en
// surbrillance la vignette choisie, sans repeindre tout le document. Toute modification
// visuelle faite ici dans Claude Design doit être reportée à la main dans le vrai fichier.
import { type FormEvent, useState } from "react";
import { Button } from "../Button.js";
import { Card } from "../Card.js";
import { Field } from "../Field.js";
import { Input } from "../Input.js";

type ThemeId = "violet" | "emerald" | "amber" | "light";

const THEMES: { id: ThemeId; label: string; description: string; swatch: [string, string, string] }[] = [
  { id: "violet", label: "Violet Nuit", description: "Le thème original d'ATSme.", swatch: ["#0b0b10", "#7c3aed", "#9d7bfb"] },
  { id: "emerald", label: "Émeraude Nuit", description: "Même ambiance sombre, accent émeraude.", swatch: ["#0b0b10", "#10b981", "#34d399"] },
  { id: "amber", label: "Ambre Nuit", description: "Même ambiance sombre, accent chaleureux.", swatch: ["#0b0b10", "#d97706", "#fbbf24"] },
  { id: "light", label: "Aurore Claire", description: "Fond clair, pour qui préfère le jour.", swatch: ["#f6f5fa", "#7c3aed", "#6d28d9"] },
];

const PLAN_LABELS: Record<string, string> = { free: "Free", pro: "Pro", premium: "Premium", entreprise: "Entreprise" };
const PLAN_LIMITS: Record<string, number> = { free: 5, pro: 30, premium: 100, entreprise: Infinity };

export type SettingsScreenProps = {
  user?: { name: string; email: string; plan?: string };
  resumeCount?: number;
};

/**
 * Écran de paramètres : sélecteur de thème (4 variantes), profil, offre et quota de CV,
 * changement de mot de passe.
 *
 * @example
 * <SettingsScreen user={{ name: "Ressane Messioughi", email: "ressane@example.com", plan: "free" }} resumeCount={3} />
 */
export function SettingsScreen({
  user = { name: "Ressane Messioughi", email: "ressane@example.com", plan: "free" },
  resumeCount = 3,
}: SettingsScreenProps) {
  const [theme, setTheme] = useState<ThemeId>("violet");
  const [name, setName] = useState(user.name);
  const [nameState, setNameState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwError] = useState<string | null>(null);
  const [pwState, setPwState] = useState<"idle" | "saving" | "saved">("idle");

  function onSaveName(e: FormEvent) {
    e.preventDefault();
    setNameState("saved");
    setTimeout(() => setNameState("idle"), 2000);
  }

  function onChangePassword(e: FormEvent) {
    e.preventDefault();
    setPwState("saved");
    setCurrentPassword("");
    setNewPassword("");
    setTimeout(() => setPwState("idle"), 2000);
  }

  const plan = user.plan || "free";
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const pct = limit !== Infinity ? Math.min(100, (resumeCount / limit) * 100) : 0;
  const labelCls = "text-[11px] font-[var(--ff-mono)] font-medium uppercase tracking-[0.08em] text-[var(--text-faint)]";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      <div className="flex flex-col gap-6">
        <Card className="p-5">
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
        </Card>

        <Card className="p-5">
          <p className={`${labelCls} mb-4`}>Profil</p>
          <form onSubmit={onSaveName} className="flex flex-col gap-4">
            <Field label="Email">
              <Input value={user.email} disabled />
            </Field>
            <Field label="Nom">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Button type="submit" disabled={nameState === "saving" || !name.trim()} className="self-start">
              {nameState === "saving" ? "Enregistrement..." : nameState === "saved" ? "✓ Enregistré" : "Enregistrer"}
            </Button>
            {nameState === "error" && <p className="text-sm text-[var(--danger)]">Échec de l'enregistrement.</p>}
          </form>
        </Card>

        <Card className="p-5">
          <p className={`${labelCls} mb-4`}>Offre</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{PLAN_LABELS[plan] || plan}</span>
            <span className="text-xs font-[var(--ff-mono)] text-[var(--text-dim)]">
              {resumeCount} / {limit === Infinity ? "∞" : limit} CV
            </span>
          </div>
          <div className="h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--violet)] rounded-full transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
        </Card>

        <Card className="p-5">
          <p className={`${labelCls} mb-4`}>Mot de passe</p>
          <form onSubmit={onChangePassword} className="flex flex-col gap-4">
            <Field label="Mot de passe actuel">
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </Field>
            <Field label="Nouveau mot de passe">
              <Input type="password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </Field>
            {pwError && <p className="text-sm text-[var(--danger)]">{pwError}</p>}
            <Button type="submit" variant="secondary" disabled={pwState === "saving" || !currentPassword || newPassword.length < 8} className="self-start">
              {pwState === "saving" ? "Modification..." : pwState === "saved" ? "✓ Modifié" : "Changer le mot de passe"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
