import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/auth.tsx";
import { api, ApiError } from "../lib/api.ts";
import AuthLayout from "../components/AuthLayout.tsx";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const { completeVerification } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<"checking" | "error">("checking");
  const [error, setError] = useState("Lien invalide.");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }
    api<{ token: string; user: Parameters<typeof completeVerification>[1] }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        completeVerification(res.token, res.user);
        navigate("/dashboard", { replace: true });
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Lien invalide ou expiré.");
        setState("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (state === "checking") {
    return (
      <AuthLayout title="Confirmation en cours" subtitle="Un instant...">
        <p className="text-sm text-center" style={{ color: "var(--t-ink2)" }}>
          Vérification de votre lien...
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Lien invalide" subtitle={error}>
      <div className="flex flex-col gap-3 items-center">
        <p className="text-sm text-center" style={{ color: "var(--t-ink2)" }}>
          Ce lien de confirmation n'est plus valable. Connectez-vous pour en recevoir un nouveau.
        </p>
        <Link
          to="/connexion"
          className="font-semibold text-sm underline underline-offset-[3px]"
          style={{ color: "var(--t-accent)" }}
        >
          Aller à la connexion
        </Link>
      </div>
    </AuthLayout>
  );
}
