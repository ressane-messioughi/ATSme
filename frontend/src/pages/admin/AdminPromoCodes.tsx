import { type FormEvent, useEffect, useState } from "react";
import {
  type Plan,
  type PromoCode,
  PLANS,
  createPromoCode,
  deletePromoCode,
  listPromoCodes,
  setPromoCodeActive,
} from "../../lib/adminApi";
import { ApiError } from "../../lib/api.ts";

const PLAN_LABELS: Record<Plan, string> = { free: "Free", pro: "Pro", premium: "Premium", entreprise: "Entreprise" };

const fieldStyle = {
  minHeight: 44,
  padding: "10px 12px",
  borderRadius: "var(--t-r-md)",
  border: "1.5px solid var(--t-field-line)",
  background: "var(--t-field)",
  color: "var(--t-ink)",
  outline: "none",
} as const;

export default function AdminPromoCodes() {
  const [codes, setCodes] = useState<PromoCode[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [kind, setKind] = useState<"plan" | "resumes">("resumes");
  const [planValue, setPlanValue] = useState<Plan>("pro");
  const [resumesValue, setResumesValue] = useState(5);
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    listPromoCodes()
      .then(setCodes)
      .catch(() => setError("Impossible de charger les codes promo."));
  }
  useEffect(load, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setFormError(null);
    try {
      await createPromoCode({
        code,
        kind,
        planValue: kind === "plan" ? planValue : undefined,
        resumesValue: kind === "resumes" ? resumesValue : undefined,
        maxRedemptions: maxRedemptions.trim() ? Number(maxRedemptions) : null,
      });
      setCode("");
      setMaxRedemptions("");
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Création impossible.");
    } finally {
      setCreating(false);
    }
  }

  async function onToggle(c: PromoCode) {
    setCodes((list) => list && list.map((x) => (x.id === c.id ? { ...x, active: c.active ? 0 : 1 } : x)));
    try {
      await setPromoCodeActive(c.id, !c.active);
    } catch {
      load();
    }
  }

  async function onDelete(c: PromoCode) {
    if (!confirm(`Supprimer le code ${c.code} ?`)) return;
    setCodes((list) => list && list.filter((x) => x.id !== c.id));
    try {
      await deletePromoCode(c.id);
    } catch {
      load();
    }
  }

  return (
    <div className="max-w-5xl flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <div
          className="font-semibold text-[11px] uppercase"
          style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.14em", color: "var(--t-warn-ink)" }}
        >
          Administration
        </div>
        <h1 className="font-black leading-[1.15] m-0" style={{ fontFamily: "var(--t-display)", fontSize: "clamp(28px,3vw,36px)" }}>
          Codes promo
        </h1>
        <p className="text-sm m-0" style={{ color: "var(--t-ink2)" }}>
          Un code peut soit passer un compte sur une offre, soit ajouter un nombre de CV bonus.
        </p>
      </header>

      <form
        onSubmit={onCreate}
        className="p-5 rounded-[var(--t-r-lg)] flex flex-col gap-4"
        style={{ background: "var(--t-surface)", border: "1px solid var(--t-line-soft)" }}
      >
        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          <label className="flex flex-col gap-1.5 font-semibold text-[13px]" style={{ color: "var(--t-ink2)" }}>
            Code
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required placeholder="LANCEMENT5" style={fieldStyle} />
          </label>
          <label className="flex flex-col gap-1.5 font-semibold text-[13px]" style={{ color: "var(--t-ink2)" }}>
            Type
            <select value={kind} onChange={(e) => setKind(e.target.value as "plan" | "resumes")} style={fieldStyle}>
              <option value="resumes">CV bonus</option>
              <option value="plan">Changement d'offre</option>
            </select>
          </label>
          {kind === "plan" ? (
            <label className="flex flex-col gap-1.5 font-semibold text-[13px]" style={{ color: "var(--t-ink2)" }}>
              Offre accordée
              <select value={planValue} onChange={(e) => setPlanValue(e.target.value as Plan)} style={fieldStyle}>
                {PLANS.map((p) => (
                  <option key={p} value={p}>
                    {PLAN_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="flex flex-col gap-1.5 font-semibold text-[13px]" style={{ color: "var(--t-ink2)" }}>
              Nombre de CV bonus
              <input
                type="number"
                min={1}
                max={1000}
                value={resumesValue}
                onChange={(e) => setResumesValue(Number(e.target.value))}
                style={fieldStyle}
              />
            </label>
          )}
          <label className="flex flex-col gap-1.5 font-semibold text-[13px]" style={{ color: "var(--t-ink2)" }}>
            Limite d'utilisation (optionnel)
            <input
              type="number"
              min={1}
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value)}
              placeholder="Illimité"
              style={fieldStyle}
            />
          </label>
        </div>
        {formError && <p style={{ color: "var(--t-danger)" }}>{formError}</p>}
        <button
          type="submit"
          disabled={creating || !code.trim()}
          className="self-start min-h-11 px-5 rounded-[var(--t-r-md)] font-semibold text-[15px] cursor-pointer disabled:opacity-50"
          style={{ border: "1.5px solid var(--t-line)", background: "var(--t-accent)", color: "var(--t-on-accent)", boxShadow: "0 2px 0 var(--t-shadow)" }}
        >
          {creating ? "Création..." : "Créer le code"}
        </button>
      </form>

      {error && <p style={{ color: "var(--t-danger)" }}>{error}</p>}

      {codes && (
        <div className="overflow-auto rounded-[var(--t-r-lg)]" style={{ background: "var(--t-surface)", border: "1px solid var(--t-line-soft)" }}>
          <table className="w-full border-collapse text-sm" style={{ minWidth: 720 }}>
            <thead>
              <tr style={{ background: "var(--t-bg)", textAlign: "left" }}>
                {["Code", "Effet", "Utilisations", "Statut", ""].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="py-3 px-4 font-semibold text-[11px] uppercase"
                    style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.12em", color: "var(--t-muted)", borderBottom: "1.5px solid var(--t-line)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codes.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center" style={{ color: "var(--t-muted)" }}>
                    Aucun code promo pour l'instant.
                  </td>
                </tr>
              )}
              {codes.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px dashed var(--t-line-soft)" }}>
                  <td className="py-3 px-4 font-semibold" style={{ fontFamily: "var(--t-mono)" }}>
                    {c.code}
                  </td>
                  <td className="py-3 px-4">
                    {c.kind === "plan" ? `Offre → ${PLAN_LABELS[c.plan_value as Plan] || c.plan_value}` : `+${c.resumes_value} CV`}
                  </td>
                  <td className="py-3 px-4" style={{ fontFamily: "var(--t-mono)" }}>
                    {c.redemptions_count}
                    {c.max_redemptions != null ? ` / ${c.max_redemptions}` : ""}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => onToggle(c)}
                      className="min-h-8 px-2.5 rounded-[var(--t-r-pill)] font-semibold text-[12px] cursor-pointer"
                      style={
                        c.active
                          ? { background: "var(--t-accent-soft)", color: "var(--t-accent-ink)", border: "1px solid var(--t-accent-line)" }
                          : { background: "var(--t-field)", color: "var(--t-muted)", border: "1px solid var(--t-line-soft)" }
                      }
                    >
                      {c.active ? "Actif" : "Désactivé"}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(c)}
                      className="text-xs font-medium cursor-pointer"
                      style={{ color: "var(--t-danger)" }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
