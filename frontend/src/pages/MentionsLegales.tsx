import { Link } from "react-router-dom";
import CatLogo from "../components/CatLogo.tsx";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="p-6 rounded-[var(--t-r-lg)] flex flex-col gap-2.5" style={{ background: "var(--t-surface)", border: "1px solid var(--t-line-soft)" }}>
      <h2 className="font-black text-xl m-0" style={{ fontFamily: "var(--t-display)" }}>
        {title}
      </h2>
      <div className="flex flex-col gap-2 text-[15px] leading-[1.6]" style={{ color: "var(--t-ink2)" }}>
        {children}
      </div>
    </section>
  );
}

export default function MentionsLegales() {
  return (
    <div className="min-h-screen px-5 py-10" style={{ background: "var(--t-bg)", color: "var(--t-ink)" }}>
      <div className="mx-auto flex flex-col gap-6" style={{ maxWidth: 760 }}>
        <Link to="/" className="flex items-center gap-2.5" style={{ color: "var(--t-ink)" }}>
          <CatLogo size={34} />
          <span className="font-black text-lg" style={{ fontFamily: "var(--t-display)" }}>
            ATSme
          </span>
        </Link>

        <header>
          <p className="font-semibold text-xs uppercase m-0" style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.14em", color: "var(--t-muted)" }}>
            Informations légales
          </p>
          <h1 className="font-black m-0 mt-2" style={{ fontFamily: "var(--t-display)", fontSize: "clamp(28px,3vw,36px)" }}>
            Mentions légales
          </h1>
        </header>

        <Section title="Éditeur">
          <p>
            Contact :{" "}
            <a href="mailto:admin@atsme.ressane.fr" style={{ color: "var(--t-accent)", fontWeight: 600 }}>
              admin@atsme.ressane.fr
            </a>
          </p>
        </Section>

        <Section title="Hébergement">
          <p>
            Hostinger International Ltd.
            <br />
            61 Lordou Vironos Street, 6023 Larnaca, Chypre
            <br />
            <a href="https://www.hostinger.fr" target="_blank" rel="noreferrer" style={{ color: "var(--t-accent)", fontWeight: 600 }}>
              www.hostinger.fr
            </a>
          </p>
        </Section>

        <Section title="Propriété intellectuelle">
          <p>
            La marque « ATSme », les textes, la charte graphique et la scène illustrée de l'accueil sont la propriété de l'éditeur du site.
            Les CV que vous créez ou importez restent votre propriété : leur usage nous est concédé uniquement dans la mesure nécessaire au
            fonctionnement du service (génération, analyse, export).
          </p>
        </Section>

        <Section title="Responsabilité">
          <p>
            ATSme fournit une aide à l'optimisation de CV pour les systèmes de suivi de candidatures (ATS) et une analyse indicative. Aucune
            garantie n'est donnée quant à un résultat de recrutement : le score et les recommandations affichés restent des estimations.
          </p>
        </Section>

        <p className="text-sm text-center" style={{ color: "var(--t-muted)" }}>
          Voir aussi la{" "}
          <Link to="/confidentialite" style={{ color: "var(--t-accent)", fontWeight: 600 }}>
            politique de confidentialité
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
