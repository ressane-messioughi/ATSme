import { type CSSProperties, type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.tsx";
import { ApiError } from "../lib/api.ts";
import AuthLayout from "../components/AuthLayout.tsx";

const fieldStyle: CSSProperties = {
  minHeight: 44,
  padding: "10px 12px",
  borderRadius: "var(--t-r-md)",
  border: "1.5px solid var(--t-field-line)",
  background: "var(--t-field)",
  color: "var(--t-ink)",
  fontSize: 15,
  outline: "none",
};

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

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
        <label className="flex flex-col gap-1.5 font-semibold text-[13px]" style={{ color: "var(--t-ink2)" }}>
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={fieldStyle}
            placeholder="vous@exemple.com"
          />
        </label>
        <label className="flex flex-col gap-1.5 font-semibold text-[13px]" style={{ color: "var(--t-ink2)" }}>
          Mot de passe
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={fieldStyle}
            placeholder="••••••••"
          />
        </label>
        {error && (
          <p className="text-sm" style={{ color: "var(--t-danger)" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="mt-1 font-semibold text-base cursor-pointer disabled:opacity-60"
          style={{
            minHeight: 44,
            padding: 13,
            borderRadius: "var(--t-r-md)",
            border: "1.5px solid var(--t-line)",
            background: "var(--t-accent)",
            color: "var(--t-on-accent)",
            boxShadow: "0 3px 0 var(--t-shadow)",
          }}
        >
          {submitting ? "Connexion..." : "Se connecter"}
        </button>
      </form>
      <p className="mt-2 text-center text-sm" style={{ color: "var(--t-ink2)" }}>
        Pas encore de compte ?{" "}
        <Link to="/inscription" className="font-semibold underline underline-offset-[3px]" style={{ color: "var(--t-accent)" }}>
          Créer un compte
        </Link>
      </p>
    </AuthLayout>
  );
}
