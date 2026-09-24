import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.tsx";
import { ApiError } from "../lib/api.ts";
import AuthLayout from "../components/AuthLayout.tsx";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Connexion impossible");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Bon retour" subtitle="Connectez-vous pour retrouver vos CV.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-[var(--ff-mono)] uppercase tracking-wider text-[var(--text-faint)]">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[var(--violet-soft)] transition-colors"
            placeholder="vous@exemple.com"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-[var(--ff-mono)] uppercase tracking-wider text-[var(--text-faint)]">Mot de passe</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[var(--violet-soft)] transition-colors"
            placeholder="••••••••"
          />
        </label>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 bg-[var(--violet)] hover:bg-[var(--violet-soft)] transition-colors rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
        >
          {submitting ? "Connexion..." : "Se connecter"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--text-dim)]">
        Pas encore de compte ?{" "}
        <Link to="/inscription" className="text-[var(--violet-soft)] hover:underline">
          Créer un compte
        </Link>
      </p>
    </AuthLayout>
  );
}
