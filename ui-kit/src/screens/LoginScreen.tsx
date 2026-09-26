// Contrepartie présentationnelle de frontend/src/pages/Login.tsx pour le design system :
// découplée du routeur et du réseau (pas d'appel à /auth/login). Toute modification
// visuelle faite ici dans Claude Design doit être reportée à la main dans le vrai fichier.
import { type FormEvent, useState } from "react";
import { AuthLayout } from "../AuthLayout.js";
import { Button } from "../Button.js";
import { Field } from "../Field.js";
import { Input } from "../Input.js";

export type LoginScreenProps = {
  /** Appelé avec la route cible quand un lien de navigation est cliqué. */
  onNavigate?: (path: string) => void;
};

/**
 * Écran de connexion : email, mot de passe, lien vers l'inscription.
 *
 * @example
 * <LoginScreen onNavigate={(path) => console.log(path)} />
 */
export function LoginScreen({ onNavigate }: LoginScreenProps) {
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
    <AuthLayout title="Bon retour" subtitle="Connectez-vous pour retrouver vos CV.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Email">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" />
        </Field>
        <Field label="Mot de passe">
          <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </Field>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <Button type="submit" disabled={submitting} className="mt-2 py-2.5 w-full">
          {submitting ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--text-dim)]">
        Pas encore de compte ?{" "}
        <button onClick={() => onNavigate?.("/inscription")} className="text-[var(--violet-soft)] hover:underline cursor-pointer">
          Créer un compte
        </button>
      </p>
    </AuthLayout>
  );
}
