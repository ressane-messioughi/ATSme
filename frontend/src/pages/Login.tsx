import { type CSSProperties, type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.tsx";
import { api, ApiError } from "../lib/api.ts";
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
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setNeedsVerification(true);
        setError("Votre email n'est pas encore confirmé.");
      } else {
        setError(err instanceof ApiError ? err.message : "Connexion impossible");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function onResend() {
    setResendState("sending");
    try {
      await api("/auth/resend-verification", { method: "POST", body: JSON.stringify({ email }) });
    } finally {
      setResendState("sent");
      setTimeout(() => setResendState("idle"), 4000);
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
          <span className="flex items-center justify-between gap-2">
            Mot de passe
            <Link to="/mot-de-passe-oublie" className="font-semibold text-[13px] underline underline-offset-[3px]" style={{ color: "var(--t-accent)" }}>
              Oublié ?
            </Link>
          </span>
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
        {needsVerification && (
          <button
            type="button"
            onClick={onResend}
            disabled={resendState === "sending"}
            className="self-start font-semibold text-sm underline underline-offset-[3px] cursor-pointer disabled:opacity-60 -mt-2"
            style={{ color: "var(--t-accent)" }}
          >
            {resendState === "sending" ? "Envoi..." : resendState === "sent" ? "Email renvoyé ✓" : "Renvoyer l'email de confirmation"}
          </button>
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
