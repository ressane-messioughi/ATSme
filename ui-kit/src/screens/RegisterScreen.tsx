// Contrepartie présentationnelle de frontend/src/pages/Register.tsx pour le design
// system : découplée du routeur et du réseau (pas d'appel à /auth/register). Toute
// modification visuelle faite ici dans Claude Design doit être reportée à la main dans le
// vrai fichier.
import { type FormEvent, useState } from "react";
import { AuthLayout } from "../AuthLayout.js";
import { Button } from "../Button.js";
import { Field } from "../Field.js";
import { Input } from "../Input.js";

export type RegisterScreenProps = {
  /** Appelé avec la route cible quand un lien de navigation est cliqué. */
  onNavigate?: (path: string) => void;
};

/**
 * Écran d'inscription : nom, email, mot de passe, lien vers la connexion.
 *
 * @example
 * <RegisterScreen onNavigate={(path) => console.log(path)} />
 */
export function RegisterScreen({ onNavigate }: RegisterScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitting(false);
  }

  return (
    <AuthLayout title="Créer un compte" subtitle="Optimisez votre premier CV en quelques minutes.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Nom">
          <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" />
        </Field>
        <Field label="Email">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" />
        </Field>
        <Field label="Mot de passe">
          <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8 caractères minimum" />
        </Field>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <Button type="submit" disabled={submitting} className="mt-2 py-2.5 w-full">
          {submitting ? "Création..." : "Créer mon compte"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--text-dim)]">
        Déjà un compte ?{" "}
        <button onClick={() => onNavigate?.("/connexion")} className="text-[var(--violet-soft)] hover:underline cursor-pointer">
          Se connecter
        </button>
      </p>
    </AuthLayout>
  );
}
