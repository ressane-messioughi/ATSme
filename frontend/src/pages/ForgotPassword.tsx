import { type CSSProperties, type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.ts";
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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
    } finally {
      setSubmitting(false);
      setSent(true);
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Vérifiez votre boîte mail" subtitle="Si un compte existe, un lien vient d'être envoyé.">
        <p className="text-sm" style={{ color: "var(--t-ink2)" }}>
          Si un compte est associé à <strong>{email}</strong>, vous recevrez un lien de réinitialisation valable 1
          heure. Pensez à vérifier vos spams.
        </p>
        <Link to="/connexion" className="mt-4 inline-block text-sm font-semibold underline underline-offset-[3px]" style={{ color: "var(--t-accent)" }}>
          Retour à la connexion
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Mot de passe oublié" subtitle="On vous envoie un lien pour en choisir un nouveau.">
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
          {submitting ? "Envoi..." : "Envoyer le lien"}
        </button>
      </form>
      <p className="mt-2 text-center text-sm" style={{ color: "var(--t-ink2)" }}>
        <Link to="/connexion" className="font-semibold underline underline-offset-[3px]" style={{ color: "var(--t-accent)" }}>
          Retour à la connexion
        </Link>
      </p>
    </AuthLayout>
  );
}
