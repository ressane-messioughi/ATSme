#!/usr/bin/env node
// Produit dist/styles.ds.css : le CSS réservé au paquet uploadé par /design-sync
// (cfg.cssEntry pointe ici, jamais vers dist/styles.css — le paquet npm réel).
//
// Ré-émet en fin de fichier, en texte brut, une poignée de jetons avec une annotation
// /* @kind ... */ sur la MÊME ligne, juste après le ";" — c'est le format que le scanner
// de jetons de Claude Design exige (une annotation seule sur sa propre ligne ne compte
// pas). Tailwind compile tout le CSS (imports compris, y compris nos propres fichiers
// comme tokens.css) via Lightning CSS, qui retire TOUJOURS les commentaires ordinaires,
// même sans --minify, même dans un fichier qu'on n'a pas généré nous-même — vérifié
// empiriquement, y compris pour un commentaire déjà same-line dans la source. Aucune
// annotation ne peut donc survivre si elle est écrite dans du CSS qui passe par la CLI
// Tailwind ; le bloc doit être ajouté ici, après coup, sur le fichier déjà compilé.
//
// Valeurs extraites dynamiquement du CSS déjà compilé (jamais recopiées à la main) pour
// rester justes si une mise à jour de Tailwind ou de tokens.css change un défaut.
//
// Tentative abandonnée : exclure le bruit --tw-* du scanner de jetons de Claude Design.
// Pas de levier dans .design-sync/config.json pour ça (CONFIG_KEYS de lib/common.mjs ne
// contient rien de tel). Retirer le bloc de repli @layer properties { @supports(...) }
// cassait la composition box-shadow/ring (TOKENS_MISSING confirmé). Les ~20 --tw-*
// restants sous des sélecteurs de composants (ex. --tw-ring-shadow sous
// focus-within:ring-[3px]) sont les déclarations mêmes qui font marcher ces utilitaires
// sur les composants réels du kit — pas du bruit à retirer, du CSS fonctionnel utilisé.
// Rien de sûr à faire ici ; c'est un filtre que seul Claude Design peut appliquer de son
// côté sur les noms de variables.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const OUT = "dist/styles.ds.css";

execFileSync("npx", ["tailwindcss", "-i", "src/styles.css", "-o", OUT], { stdio: "inherit" });

let css = readFileSync(OUT, "utf8");

function extractOne(name) {
  const re = new RegExp(`(?<![\\w-])${name}\\s*:\\s*([^;]+);`, "g");
  const matches = [...css.matchAll(re)];
  if (matches.length === 0) {
    throw new Error(`build-ds-css: "${name}" introuvable dans le CSS compilé — source/Tailwind a changé ? Script à ajuster.`);
  }
  const distinct = new Set(matches.map((m) => m[1].trim()));
  if (distinct.size > 1) {
    throw new Error(`build-ds-css: "${name}" a plusieurs valeurs différentes (${[...distinct].join(" / ")}) — laquelle annoter ? Script à ajuster.`);
  }
  return matches[0][1].trim();
}

const GROUPS = [
  {
    kind: "other",
    vars: ["--ease-out", "--default-transition-duration", "--default-transition-timing-function", "--animate-pulse"],
  },
  { kind: "font", vars: ["--ff-display", "--ff-body", "--ff-mono"] },
];

// Ces --tw-* ont plusieurs valeurs DIFFÉRENTES dans le fichier compilé (chaque utilitaire
// qui les touche les redéclare : --tw-scale-x vaut 105% sous hover:scale-105, 100% sous
// scale-100, 1 dans le bloc de repli universel *, ::before, ::after, ::backdrop...) —
// extractOne lèverait une ambiguïté. On fige donc la valeur neutre/par défaut de Tailwind
// (celle du bloc de repli universel pour les 8 premières — vérifiée manuellement dans
// dist/styles.ds.css ; --tw-outline-style: solid est le défaut documenté de Tailwind v4,
// absent de ce bloc dans ce build précis faute d'utilitaire outline qui le déclenche).
const HARDCODED_OTHER = {
  "--tw-border-style": "solid",
  "--tw-outline-style": "solid",
  "--tw-duration": "initial",
  "--tw-scale-x": "1",
  "--tw-scale-y": "1",
  "--tw-scale-z": "1",
  "--tw-translate-x": "0",
  "--tw-translate-y": "0",
  "--tw-translate-z": "0",
};

const lines = ["", ":root {"];
for (const { kind, vars } of GROUPS) {
  for (const name of vars) {
    const value = extractOne(name);
    lines.push(`  ${name}: ${value}; /* @kind ${kind} */`);
  }
}
for (const [name, value] of Object.entries(HARDCODED_OTHER)) {
  lines.push(`  ${name}: ${value}; /* @kind other */`);
}
lines.push("}", "");
css += lines.join("\n");

// Copies générées par des classes Tailwind précises (border-dashed, duration-150,
// duration-500, outline-none) : la déclaration vit SOUS le sélecteur de cette classe, pas
// sous :root — la ré-émission ci-dessus ne les couvre pas. On annote la déclaration DANS
// SA RÈGLE D'ORIGINE (in place, pas de doublon ailleurs) pour que l'annotation soit
// attachée à la déclaration réellement utilisée par le composant. Lookahead pour rester
// idempotent si le script tourne deux fois sur le même fichier.
const IN_PLACE_OTHER = [
  ["--tw-border-style", "dashed"],
  ["--tw-duration", "150ms"],
  ["--tw-duration", "500ms"],
  ["--tw-outline-style", "none"],
];
let inPlaceCount = 0;
for (const [name, value] of IN_PLACE_OTHER) {
  const re = new RegExp(`${name}:\\s*${value};(?!\\s*/\\* @kind)`, "g");
  const before = css;
  css = css.replace(re, (m) => {
    inPlaceCount++;
    return `${m} /* @kind other */`;
  });
  if (css === before) {
    throw new Error(`build-ds-css: "${name}: ${value};" introuvable dans ${OUT} — la classe Tailwind qui le génère a changé ? Script à ajuster.`);
  }
}

writeFileSync(OUT, css);
const total = GROUPS.reduce((n, g) => n + g.vars.length, 0) + Object.keys(HARDCODED_OTHER).length + inPlaceCount;
console.log(`build-ds-css: ${OUT} écrit (${total} jeton(s) annoté(s) same-line, repli --tw-* conservé).`);
