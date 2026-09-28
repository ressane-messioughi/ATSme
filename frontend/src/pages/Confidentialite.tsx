import { Link } from "react-router-dom";
import CatLogo from "../components/CatLogo.tsx";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="p-6 rounded-[var(--t-r-lg)] flex flex-col gap-3" style={{ background: "var(--t-surface)", border: "1px solid var(--t-line-soft)" }}>
      <h2 className="font-black text-xl m-0" style={{ fontFamily: "var(--t-display)" }}>
        {title}
      </h2>
      <div className="flex flex-col gap-2.5 text-[15px] leading-[1.6]" style={{ color: "var(--t-ink2)" }}>
        {children}
      </div>
    </section>
  );
}

const ROWS: [string, string, string][] = [
  ["Nom, email, mot de passe", "Créer votre compte et vous authentifier", "Tant que le compte existe"],
  ["Contenu de vos CV (identité, expériences, formations, compétences...)", "Générer, analyser et exporter vos documents", "Tant que le CV n'est pas supprimé"],
  ["Photo de profil (si vous en ajoutez une à un CV)", "Affichage décorative dans l'export, jamais analysée", "Tant que le CV n'est pas supprimé"],
  ["Score ATS et recommandations calculés sur vos CV", "Vous aider à améliorer vos documents", "Tant que le CV n'est pas supprimé"],
  ["Texte d'une offre d'emploi collé pour comparaison", "Calculer la correspondance mots-clés", "Le temps du calcul, non conservé ensuite"],
];

const LOCAL: [string, string, string][] = [
  ["atsme_token", "Vous garder connecté·e", "Essentiel, supprimé à la déconnexion"],
  ["atsme-theme", "Mémoriser le thème choisi (Ghibli, Cyberpunk, Tech dark, Vinyle)", "Confort, jusqu'à ce que vous le changiez"],
  ["atsme_default_template", "Mémoriser le dernier modèle de CV choisi", "Confort, jusqu'à ce que vous le changiez"],
  ["atsme-cookie-consent", "Ne pas réafficher ce bandeau à chaque visite", "Jusqu'à effacement de vos données de navigation"],
];

export default function Confidentialite() {
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
            RGPD
          </p>
          <h1 className="font-black m-0 mt-2" style={{ fontFamily: "var(--t-display)", fontSize: "clamp(28px,3vw,36px)" }}>
            Politique de confidentialité
          </h1>
          <p className="text-base mt-2" style={{ color: "var(--t-ink2)" }}>
            Ce que nous enregistrons, pourquoi, combien de temps, et comment y accéder ou tout supprimer.
          </p>
        </header>

        <Section title="Ce que nous enregistrons sur nos serveurs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm" style={{ minWidth: 480 }}>
              <thead>
                <tr>
                  {["Donnée", "Pourquoi", "Durée"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="text-left py-2 px-2.5 font-semibold text-xs uppercase"
                      style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.08em", color: "var(--t-muted)", borderBottom: "1px solid var(--t-line-soft)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([data, why, dur]) => (
                  <tr key={data}>
                    <td className="py-2.5 px-2.5 align-top font-medium" style={{ borderBottom: "1px solid var(--t-line-soft)", color: "var(--t-ink)" }}>
                      {data}
                    </td>
                    <td className="py-2.5 px-2.5 align-top" style={{ borderBottom: "1px solid var(--t-line-soft)" }}>
                      {why}
                    </td>
                    <td className="py-2.5 px-2.5 align-top" style={{ borderBottom: "1px solid var(--t-line-soft)" }}>
                      {dur}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm mt-1">
            Ces données sont hébergées en base sur notre serveur (Hostinger International Ltd.) et ne sont ni vendues, ni partagées avec des
            régies publicitaires, ni utilisées à des fins de profilage commercial.
          </p>
        </Section>

        <Section title="Ce qui est stocké dans votre navigateur">
          <p>
            ATSme ne dépose aucun cookie de suivi. Le peu que nous gardons vit dans le stockage local de votre navigateur (
            <code style={{ fontFamily: "var(--t-mono)", fontSize: 13 }}>localStorage</code>), jamais transmis automatiquement à un tiers :
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm" style={{ minWidth: 460 }}>
              <thead>
                <tr>
                  {["Clé", "Pourquoi", "Nature"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="text-left py-2 px-2.5 font-semibold text-xs uppercase"
                      style={{ fontFamily: "var(--t-mono)", letterSpacing: "0.08em", color: "var(--t-muted)", borderBottom: "1px solid var(--t-line-soft)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LOCAL.map(([key, why, nature]) => (
                  <tr key={key}>
                    <td className="py-2.5 px-2.5 align-top" style={{ borderBottom: "1px solid var(--t-line-soft)", fontFamily: "var(--t-mono)", fontSize: 13, color: "var(--t-ink)" }}>
                      {key}
                    </td>
                    <td className="py-2.5 px-2.5 align-top" style={{ borderBottom: "1px solid var(--t-line-soft)" }}>
                      {why}
                    </td>
                    <td className="py-2.5 px-2.5 align-top" style={{ borderBottom: "1px solid var(--t-line-soft)" }}>
                      {nature}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Autres connexions techniques">
          <p>
            La page charge les polices d'écriture (Zen Maru Gothic, IBM Plex Sans, IBM Plex Mono...) depuis Google Fonts : votre navigateur
            contacte alors les serveurs Google pour les récupérer, comme pour n'importe quelle ressource externe d'une page web. Aucun compte
            Google n'est requis et cette requête ne dépose pas de cookie de suivi de notre fait.
          </p>
          <p>
            Par sécurité, votre adresse IP est utilisée quelques minutes, en mémoire seulement, pour limiter les tentatives de connexion
            abusives (anti brute-force), sans jamais être enregistrée en base de données.
          </p>
        </Section>

        <Section title="Vos droits">
          <p>
            Conformément au RGPD, vous pouvez demander l'accès, la rectification, la suppression ou l'export de vos données à tout moment.
            Depuis l'application : <Link to="/parametres" style={{ color: "var(--t-accent)", fontWeight: 600 }}>Paramètres</Link> vous permet de
            modifier votre profil, et chaque CV se supprime individuellement depuis <Link to="/cv" style={{ color: "var(--t-accent)", fontWeight: 600 }}>Mes CV</Link>.
            Pour une suppression complète du compte ou toute autre demande, écrivez à{" "}
            <a href="mailto:admin@atsme.ressane.fr" style={{ color: "var(--t-accent)", fontWeight: 600 }}>
              admin@atsme.ressane.fr
            </a>
            . Vous disposez aussi du droit d'introduire une réclamation auprès de la{" "}
            <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noreferrer" style={{ color: "var(--t-accent)", fontWeight: 600 }}>
              CNIL
            </a>
            .
          </p>
        </Section>

        <p className="text-sm text-center" style={{ color: "var(--t-muted)" }}>
          Voir aussi les{" "}
          <Link to="/mentions-legales" style={{ color: "var(--t-accent)", fontWeight: 600 }}>
            mentions légales
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
