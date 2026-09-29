import { type CSSProperties, type FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setSubmitting(true);
    try {
      await api("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword: password }) });
      navigate("/connexion", { replace: true, state: { resetOk: true } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lien invalide ou expiré.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Lien invalide" subtitle="Ce lien de réinitialisation est incomplet.">
        <Link to="/mot-de-passe-oublie" className="text-sm font-semibold underline underline-offset-[3px]" style={{ color: "var(--t-accent)" }}>
          Demander un nouveau lien
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Nouveau mot de passe" subtitle="Choisissez un mot de passe pour votre compte.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 font-semibold text-[13px]" style={{ color: "var(--t-ink2)" }}>
          Nouveau mot de passe
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
        <label className="flex flex-col gap-1.5 font-semibold text-[13px]" style={{ color: "var(--t-ink2)" }}>
          Confirmer le mot de passe
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
          {submitting ? "Enregistrement..." : "Réinitialiser le mot de passe"}
        </button>
      </form>
    </AuthLayout>
  );
}
