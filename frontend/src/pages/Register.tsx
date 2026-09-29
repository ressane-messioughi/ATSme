import { type CSSProperties, type FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
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

export default function Register() {
  const { user, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  if (user) return <Navigate to="/dashboard" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await register(email, password, name);
      setSentTo(res.email);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Inscription impossible");
    } finally {
      setSubmitting(false);
    }
  }

  async function onResend() {
    if (!sentTo) return;
    setResendState("sending");
    try {
      await api("/auth/resend-verification", { method: "POST", body: JSON.stringify({ email: sentTo }) });
    } finally {
      setResendState("sent");
      setTimeout(() => setResendState("idle"), 4000);
    }
  }

  if (sentTo) {
    return (
      <AuthLayout title="Vérifiez votre boîte mail" subtitle="Un lien de confirmation vient d'être envoyé.">
        <div className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: "var(--t-ink2)" }}>
            Nous avons envoyé un email à <strong>{sentTo}</strong>. Ouvrez-le et cliquez sur le lien pour activer votre
            compte (valable 24h). Pensez à vérifier vos spams.
          </p>
          <button
            type="button"
            onClick={onResend}
            disabled={resendState === "sending"}
            className="self-start font-semibold text-sm underline underline-offset-[3px] cursor-pointer disabled:opacity-60"
            style={{ color: "var(--t-accent)" }}
          >
            {resendState === "sending" ? "Envoi..." : resendState === "sent" ? "Email renvoyé ✓" : "Renvoyer l'email"}
          </button>
          <Link to="/connexion" className="text-sm font-semibold underline underline-offset-[3px]" style={{ color: "var(--t-ink2)" }}>
            Retour à la connexion
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Créer un compte" subtitle="Optimisez votre premier CV en quelques minutes.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 font-semibold text-[13px]" style={{ color: "var(--t-ink2)" }}>
          Nom complet
          <input
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={fieldStyle}
            placeholder="Votre nom"
          />
        </label>
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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={fieldStyle}
            placeholder="8 caractères minimum"
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
          {submitting ? "Création..." : "Créer mon compte"}
        </button>
      </form>
      <p className="mt-2 text-center text-sm" style={{ color: "var(--t-ink2)" }}>
        Déjà un compte ?{" "}
        <Link to="/connexion" className="font-semibold underline underline-offset-[3px]" style={{ color: "var(--t-accent)" }}>
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  );
}
