#!/usr/bin/env node
// Produit dist/styles.ds.css : le CSS réservé au paquet uploadé par /design-sync
// (cfg.cssEntry pointe ici, jamais vers dist/styles.css — le paquet npm réel).
//
// --ease-out, --animate-pulse et --default-transition-duration sont ré-émis en toute fin
// de fichier avec un commentaire /* @kind other */ au-dessus de chacun, que le scanner de
// jetons de Claude Design lit pour les classer correctement (au lieu de Tailwind
// lui-même, qui les injecte sans commentaire et qu'on ne peut pas annoter à la source).
// Valeurs extraites dynamiquement du CSS déjà compilé — jamais recopiées à la main — pour
// rester justes si une mise à jour de Tailwind change les défauts.
//
// IMPORTANT : Tailwind traite tout le CSS (imports compris) via Lightning CSS, qui retire
// les commentaires ordinaires même sans --minify — un /* @kind other */ écrit dans
// src/styles.css ne survivrait donc pas à la compilation. Le bloc doit être ajouté ici, en
// texte brut, APRÈS l'appel à la CLI Tailwind, jamais dans le CSS source.
//
// Tentative abandonnée : retirer le bloc de repli @layer properties { @supports(...) }
// (redéclaration des --tw-* en syntaxe "valeur:" pour les navigateurs pré-@property) pour
// réduire le bruit --tw-* vu par le scanner de jetons. Semblait redondant avec les
// @property --tw-* (qui n'ont pas de syntaxe "valeur:" et ne devraient donc pas être lus
// comme des jetons) mais package-validate.mjs a détecté [TOKENS_MISSING] sur 4 variables
// (--tw-inset-shadow, --tw-inset-ring-shadow, --tw-ring-offset-shadow,
// --tw-ring-offset-width) une fois le bloc retiré : ces @property n'ont pas toutes une
// initial-value, et le bloc de repli est en réalité ce qui fournit la valeur neutre
// ("0 0 #0000" etc.) que la composition box-shadow/ring de Tailwind attend TOUJOURS en
// entrée, même sur un élément qui n'utilise pas explicitement ces variantes. Le retirer
// aurait pu casser silencieusement des ombres/anneaux sur des composants qui n'en
// affichent pas dans leur preview capturée. Aucun mécanisme fiable trouvé pour exclure les
// --tw-* du scanner de jetons de Claude Design sans ce risque — non traité ici.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const OUT = "dist/styles.ds.css";

execFileSync("npx", ["tailwindcss", "-i", "src/styles.css", "-o", OUT], { stdio: "inherit" });

let css = readFileSync(OUT, "utf8");

// Extraction dynamique (pas de valeurs recopiées à la main) — chaque var doit apparaître
// exactement une fois dans le thème par défaut de Tailwind avant qu'on ne l'annote.
const KIND_OTHER_VARS = ["--ease-out", "--default-transition-duration", "--animate-pulse"];
const values = {};
for (const name of KIND_OTHER_VARS) {
  const re = new RegExp(`(?<![\\w-])${name}\\s*:\\s*([^;]+);`, "g");
  const matches = [...css.matchAll(re)];
  if (matches.length === 0) {
    throw new Error(`build-ds-css: "${name}" introuvable dans le thème Tailwind compilé — mise à jour de tailwindcss ? Script à ajuster.`);
  }
  const distinct = new Set(matches.map((mm) => mm[1].trim()));
  if (distinct.size > 1) {
    throw new Error(`build-ds-css: "${name}" a plusieurs valeurs différentes (${[...distinct].join(" / ")}) — laquelle annoter ? Script à ajuster.`);
  }
  values[name] = matches[0][1].trim();
}

const annotated = [
  "",
  "/* Ré-émission non layered des jetons Tailwind par défaut ci-dessus, annotés pour le",
  "   scanner de jetons de Claude Design (voir le commentaire d'en-tête de ce script pour",
  "   le pourquoi). Valeurs identiques à celles que Tailwind vient de générer plus haut —",
  "   aucun changement de rendu. */",
  ":root {",
  ...KIND_OTHER_VARS.map((name) => `  /* @kind other */\n  ${name}: ${values[name]};`),
  "}",
  "",
].join("\n");
css += annotated;

writeFileSync(OUT, css);
console.log(`build-ds-css: ${OUT} écrit (${KIND_OTHER_VARS.length} jeton(s) annoté(s) @kind other, repli --tw-* conservé).`);
