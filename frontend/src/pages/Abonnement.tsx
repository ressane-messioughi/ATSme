import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.tsx";
import { IconCheck } from "../components/icons.tsx";

const PLAN_LABELS: Record<string, string> = { free: "Free", pro: "Pro", premium: "Premium", entreprise: "Entreprise" };

const sectionStyle = { background: "var(--t-surface)", border: "1px solid var(--t-line-soft)", borderRadius: "var(--t-r-lg)" };
const fieldBtnStyle = { border: "1.5px solid var(--t-field-line)", background: "var(--t-surface)", color: "var(--t-ink)" };

type Example = {
  name: string;
  title: string;
  contact: string[];
  summary: string;
  experience: { role: string; company: string; place: string; dates: string; bullets: string[] }[];
  skills: { group: string; items: string }[];
};

// Contenu fictif d'exemple (mêmes profils que design_handoff_atsme_3d/GAbonnement.dc.html) —
// jamais présenté comme les documents de l'utilisateur, seulement comme un aperçu de rendu.
const EXAMPLES: Example[] = [
  {
    name: "Corentin Nador",
    title: "Développeur Full-stack",
    contact: ["Lyon (69)", "corentin.nador@email.fr", "06 12 34 56 78"],
    summary:
      "Développeur full-stack avec 6 ans d'expérience sur des produits web à fort trafic. Conception d'API fiables et d'interfaces rapides en React et Node.js.",
    experience: [
      {
        role: "Lead Developer",
        company: "Studio Nord",
        place: "Lyon · CDI",
        dates: "2022 – aujourd'hui",
        bullets: ["Conception de l'API de paiement : 2 M de transactions par mois.", "Encadrement de 4 développeurs."],
      },
      {
        role: "Développeur Front-end",
        company: "Kumo Voyages",
        place: "Villeurbanne · CDI",
        dates: "2019 – 2022",
        bullets: ["Refonte du tunnel de réservation : +18 % de conversion sur mobile."],
      },
    ],
    skills: [
      { group: "Langages", items: "TypeScript, JavaScript, SQL, Python" },
      { group: "Front-end", items: "React, Next.js, Tailwind" },
    ],
  },
  {
    name: "Léa Fontaine",
    title: "Chargée de marketing digital",
    contact: ["Paris (75)", "lea.fontaine@email.fr", "07 98 76 54 32"],
    summary: "Chargée de marketing digital avec 5 ans d'expérience en acquisition et fidélisation pour des marques grand public.",
    experience: [
      {
        role: "Chargée de marketing digital",
        company: "Maison Céleste",
        place: "Paris · CDI",
        dates: "2021 – aujourd'hui",
        bullets: ["Pilotage d'un budget média de 450 k€ par an.", "Coût d'acquisition réduit de 27 % en 12 mois."],
      },
    ],
    skills: [
      { group: "Acquisition", items: "SEA, Social Ads, SEO, emailing" },
      { group: "Analyse", items: "GA4, Looker Studio, tests A/B" },
    ],
  },
  {
    name: "Thomas Nguyen",
    title: "Data Analyst",
    contact: ["Nantes (44)", "thomas.nguyen@email.fr", "06 45 67 89 01"],
    summary: "Data analyst avec 4 ans d'expérience dans le retail et l'énergie, transforme des données brutes en recommandations concrètes.",
    experience: [
      {
        role: "Data Analyst",
        company: "Énergie Ouest",
        place: "Nantes · CDI",
        dates: "2022 – aujourd'hui",
        bullets: ["Modèle de prévision de consommation : erreur moyenne réduite de 14 %.", "Formation de 30 collaborateurs à Power BI."],
      },
    ],
    skills: [
      { group: "Langages", items: "SQL, Python, R" },
      { group: "Visualisation", items: "Power BI, Tableau, Looker Studio" },
    ],
  },
];

const PACKS = [1, 3, 5, 10];

export default function Abonnement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const plan = user?.plan || "free";
  const [qty, setQty] = useState(3);
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  function setQtyClamped(v: number) {
    setQty(Math.max(1, Math.min(50, Math.round(v) || 1)));
  }

  function openExample(i: number, e: React.MouseEvent<HTMLElement>) {
    openerRef.current = e.currentTarget;
    setOpen(i);
  }
  function closeDialog() {
    setOpen(null);
    openerRef.current?.focus();
  }

  useEffect(() => {
    if (open == null) return;
    const first = dialogRef.current?.querySelector<HTMLElement>("[data-close]");
    first?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeDialog();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>('button,[href],input,[tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const list = [...focusables];
      const firstEl = list[0];
      const lastEl = list[list.length - 1];
      if (!dialogRef.current.contains(document.activeElement)) {
        e.preventDefault();
        firstEl.focus();
      } else if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className="max-w-[1080px] mx-auto flex flex-col gap-7">
      <header className="flex flex-col gap-2">
        <div className="font-semibold text-xs uppercase" style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.14em", color: "var(--t-muted)" }}>
          Compte
        </div>
        <h1 className="font-black leading-[1.15] m-0" style={{ fontFamily: "var(--t-display)", fontSize: "clamp(28px,3vw,36px)" }}>
          Achats et abonnement
        </h1>
        <p className="m-0 text-base leading-[1.55] max-w-[62ch]" style={{ color: "var(--t-ink2)" }}>
          Créer, modifier et analyser vos CV est gratuit. L'export en PDF est le seul geste payant, à 1 € par CV.
        </p>
      </header>

      <div
        role="status"
        className="px-[18px] py-3.5 rounded-[var(--t-r-md)] font-semibold text-[15px]"
        style={{ background: "var(--t-accent-soft)", color: "var(--t-accent-ink)", border: "1px solid var(--t-accent-line)" }}
      >
        Le paiement en ligne n'est pas encore activé sur ATSme — cette page montre à quoi ressemblera l'achat de crédits et l'offre Pro.
      </div>

      <div className="grid gap-5 items-stretch" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))" }}>
        <section
          aria-labelledby="buy-h"
          className="p-6 rounded-[var(--t-r-lg)] flex flex-col gap-4"
          style={{ background: "var(--t-surface)", border: "2px solid var(--t-accent)" }}
        >
          <div className="flex justify-between items-baseline gap-3 flex-wrap">
            <h2 id="buy-h" className="font-black text-[22px] m-0" style={{ fontFamily: "var(--t-display)" }}>
              Acheter des exports
            </h2>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-black leading-none" style={{ fontFamily: "var(--t-display)", fontSize: 44 }}>
              1 €
            </span>
            <span className="text-[15px]" style={{ color: "var(--t-ink2)" }}>
              par CV exporté en PDF
            </span>
          </div>
          <div role="radiogroup" aria-label="Quantité rapide" className="flex flex-wrap gap-2">
            {PACKS.map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={n === qty}
                onClick={() => setQty(n)}
                className="min-h-11 min-w-[64px] px-3.5 rounded-[var(--t-r-pill)] font-bold text-[15px] cursor-pointer"
                style={
                  n === qty
                    ? { border: "1.5px solid var(--t-accent)", background: "var(--t-accent-soft)", color: "var(--t-accent-ink)" }
                    : { border: "1.5px solid var(--t-field-line)", background: "var(--t-surface)", color: "var(--t-ink)" }
                }
              >
                {n} CV
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-3.5">
            <label className="flex flex-col gap-1.5 font-semibold text-[14px]">
              Nombre de CV
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setQtyClamped(qty - 1)}
                  aria-label="Retirer un CV"
                  className="w-11 h-11 rounded-[var(--t-r-md)] font-bold text-xl cursor-pointer"
                  style={fieldBtnStyle}
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={qty}
                  onChange={(e) => setQtyClamped(+e.target.value)}
                  className="w-[72px] min-h-11 px-2 text-center rounded-[var(--t-r-md)] font-bold text-[17px] outline-none"
                  style={{ border: "1.5px solid var(--t-field-line)", background: "var(--t-field)", color: "var(--t-ink)" }}
                />
                <button
                  type="button"
                  onClick={() => setQtyClamped(qty + 1)}
                  aria-label="Ajouter un CV"
                  className="w-11 h-11 rounded-[var(--t-r-md)] font-bold text-xl cursor-pointer"
                  style={fieldBtnStyle}
                >
                  +
                </button>
              </div>
            </label>
            <div className="ml-auto text-right">
              <div className="text-[13px]" style={{ color: "var(--t-muted)" }}>
                Total
              </div>
              <div className="font-black text-[28px]" style={{ fontFamily: "var(--t-display)" }}>
                {qty} €
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled
            title="Bientôt disponible"
            className="min-h-12 px-[18px] rounded-[var(--t-r-md)] font-bold text-base opacity-60 cursor-not-allowed"
            style={{ border: "1.5px solid var(--t-line)", background: "var(--t-accent)", color: "var(--t-on-accent)" }}
          >
            Bientôt disponible
          </button>
          <p className="m-0 text-[13px]" style={{ color: "var(--t-muted)" }}>
            Le paiement à l'unité arrive prochainement.
          </p>
        </section>

        <section aria-labelledby="pro-h" className="p-6 rounded-[var(--t-r-lg)] flex flex-col gap-3.5" style={sectionStyle}>
          <div className="flex justify-between items-center gap-3">
            <h2 id="pro-h" className="font-black text-[22px] m-0" style={{ fontFamily: "var(--t-display)" }}>
              Pro · illimité
            </h2>
            {plan === "pro" && (
              <span className="px-2.5 py-1 rounded-[var(--t-r-pill)] font-bold text-[13px]" style={{ background: "var(--t-accent-soft)", color: "var(--t-accent-ink)" }}>
                Actif
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-black leading-none text-[36px]" style={{ fontFamily: "var(--t-display)" }}>
              9 €
            </span>
            <span className="text-[15px]" style={{ color: "var(--t-ink2)" }}>
              par mois, sans engagement
            </span>
          </div>
          <p className="m-0 text-[15px]" style={{ color: "var(--t-ink2)" }}>
            Plus avantageux à partir de 10 exports par mois. Offre actuelle : <strong>{PLAN_LABELS[plan] || plan}</strong>.
          </p>
          <ul className="list-none m-0 p-0 flex flex-col gap-2.5 text-[15px]">
            {["Exports illimités", "Tous les modèles", "Comparaison illimitée avec les offres", "Suivi des candidatures"].map((f) => (
              <li key={f} className="flex gap-2.5">
                <IconCheck className="w-[18px] h-[18px] shrink-0 mt-0.5 text-[var(--t-accent)]" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-auto">
            <button
              type="button"
              disabled
              title="Bientôt disponible"
              className="w-full min-h-11 px-4 rounded-[var(--t-r-md)] font-semibold text-[15px] opacity-60 cursor-not-allowed"
              style={fieldBtnStyle}
            >
              Bientôt disponible
            </button>
          </div>
        </section>
      </div>

      <section aria-labelledby="ex-h" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 id="ex-h" className="font-black text-[22px] m-0" style={{ fontFamily: "var(--t-display)" }}>
            Exemples de CV exportés
          </h2>
          <p className="m-0 text-[15px]" style={{ color: "var(--t-ink2)" }}>
            Aperçu de rendu — ces trois profils sont fictifs, à titre d'exemple.
          </p>
        </div>
        <ul className="list-none m-0 p-0 grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {EXAMPLES.map((ex, i) => (
            <li key={ex.name}>
              <button
                type="button"
                onClick={(e) => openExample(i, e)}
                aria-label={`Voir un aperçu du CV de ${ex.name}, ${ex.title}`}
                className="w-full p-4 rounded-[var(--t-r-lg)] cursor-pointer flex flex-col items-center gap-3.5 text-center"
                style={{ border: "1px solid var(--t-line-soft)", background: "var(--t-surface)", color: "var(--t-ink)" }}
              >
                <div
                  aria-hidden="true"
                  className="w-full rounded-md flex flex-col gap-2 p-4"
                  style={{ aspectRatio: "3/4", background: "#fff", color: "#1a1a1a", boxShadow: "0 6px 18px -8px rgba(0,0,0,.45)", pointerEvents: "none" }}
                >
                  <div className="h-2 w-2/3 rounded bg-current opacity-80" />
                  <div className="h-1.5 w-1/3 rounded bg-current opacity-40" />
                  <div className="mt-2 h-1 w-full rounded bg-current opacity-20" />
                  <div className="h-1 w-5/6 rounded bg-current opacity-20" />
                  <div className="h-1 w-4/6 rounded bg-current opacity-20" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-base">{ex.name}</span>
                  <span className="text-sm" style={{ color: "var(--t-ink2)" }}>
                    {ex.title}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {open != null && (
        <div
          onClick={closeDialog}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(15,12,10,.62)" }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dlg-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full flex flex-col overflow-hidden"
            style={{ maxWidth: 720, maxHeight: "90vh", borderRadius: "var(--t-r-lg)", background: "var(--t-surface)", border: "1px solid var(--t-line-soft)" }}
          >
            <div className="flex flex-wrap items-center gap-3" style={{ borderBottom: "1px solid var(--t-line-soft)", padding: "14px 18px" }}>
              <div className="flex-1 min-w-[200px]">
                <h2 id="dlg-title" className="m-0 font-bold text-[17px]">
                  {EXAMPLES[open].name} · {EXAMPLES[open].title}
                </h2>
                <div className="text-[13px]" style={{ color: "var(--t-muted)" }}>
                  Aperçu du contenu exporté
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(null);
                  navigate("/cv/nouveau");
                }}
                className="min-h-11 px-4 rounded-[var(--t-r-md)] font-semibold text-[15px] cursor-pointer"
                style={{ border: "1.5px solid var(--t-line)", background: "var(--t-accent)", color: "var(--t-on-accent)" }}
              >
                Partir de cet exemple
              </button>
              <button
                type="button"
                data-close="1"
                onClick={closeDialog}
                className="min-h-11 px-4 rounded-[var(--t-r-md)] font-semibold text-[15px] cursor-pointer"
                style={fieldBtnStyle}
              >
                Fermer
              </button>
            </div>
            <div className="overflow-auto p-6 flex flex-col gap-4" style={{ background: "var(--t-bg)" }}>
              <div>
                <p className="text-sm" style={{ color: "var(--t-ink2)" }}>
                  {EXAMPLES[open].contact.join(" · ")}
                </p>
                <p className="text-[15px] mt-2">{EXAMPLES[open].summary}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase mb-2" style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.1em", color: "var(--t-muted)" }}>
                  Expérience
                </h3>
                <div className="flex flex-col gap-3">
                  {EXAMPLES[open].experience.map((exp) => (
                    <div key={exp.role}>
                      <p className="font-semibold text-sm m-0">
                        {exp.role} — {exp.company} <span style={{ color: "var(--t-muted)" }}>· {exp.dates}</span>
                      </p>
                      <ul className="list-disc pl-5 text-sm mt-1" style={{ color: "var(--t-ink2)" }}>
                        {exp.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase mb-2" style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.1em", color: "var(--t-muted)" }}>
                  Compétences
                </h3>
                <p className="text-sm m-0">{EXAMPLES[open].skills.map((s) => `${s.group} : ${s.items}`).join(" — ")}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
