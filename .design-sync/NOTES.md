# Notes de synchronisation — ATSme design system

## Contexte

`ui-kit/` (`@atsme/ui-kit`) est un paquet de composants créé spécifiquement pour cette
synchronisation, extrait du code réel de l'app `frontend/`. L'app elle-même n'importe pas
encore `@atsme/ui-kit` — les deux vivent en parallèle pour l'instant (voir "Risques de
re-synchronisation" plus bas).

## BrandOrb exclue du paquet synchronisé

`BrandOrb` (l'entité 3D de marque, `frontend/src/components/BrandOrb.tsx`) n'est **pas**
exportée par `@atsme/ui-kit` et n'a donc pas de carte dans ce projet Design.

**Raison** : `BrandOrb` utilise `@react-three/fiber`, qui embarque son propre moteur de
rendu React (`react-reconciler` + `scheduler`) pour piloter la scène Three.js,
indépendamment de React DOM. L'outil de synchronisation a un garde-fou anti-fuite dans
`lib/bundle.mjs` (fichier qu'il est interdit de forker — "définit le contrat avec
l'auto-vérification côté serveur") : tout import direct de `scheduler` est traité comme
une fuite de `react-dom` dans le bundle et stubé par une exception. Comme tous les
composants du paquet sont bundlés ensemble en un seul IIFE, cette exception cassait le
rendu des **12 composants**, pas seulement BrandOrb.

Décision (validée avec l'utilisateur) : exclure BrandOrb de ce paquet plutôt que de forker
le fichier interdit. Les fichiers `ui-kit/src/BrandOrb.tsx` et `BrandOrbScene.tsx` ont été
supprimés (pas seulement désexportés) pour que les dépendances `@react-three/fiber`,
`@react-three/drei`, `three` ne soient même plus dans `package.json` — un composant qui
casserait le bundle de la même façon ne doit pas non plus gonfler sa taille pour rien.

**Si une future demande veut resynchroniser BrandOrb** : il n'existe actuellement aucun
override de config pour ce cas précis (`grep ASSUMPTION` sur les scripts du convertisseur
ne remonte rien qui s'applique à `react-reconciler`/`scheduler`). Les pistes possibles,
aucune testée :
- Un paquet Design **séparé** dédié aux entités 3D, avec son propre garde-fou désactivé si
  l'outil le permet un jour.
- Vérifier si une version plus récente de l'outil de sync ajoute un override pour ce cas
  (composants Canvas/WebGL avec leur propre reconciler).

## Avertissement Modal bénin (RENDER_THIN, maxHeight: 0)

`package-validate.mjs` signale `Modal` avec `collapsed: true` / `maxHeight: 0` sur son
unique cellule `ExportCv`. Le composant utilise `position: fixed; inset: 0` (recouvrement
plein écran, comme toute vraie modale) — un point de mesure DOM classique qui collapse
pour un contenu positionné hors du flux normal. Le rendu réel est confirmé correct dans
`_screenshots/general__Modal.png` (capture render-check pleine page) : titre, description,
deux options de format, bouton d'export — texte extrait confirmé dans
`.render-check.json` (`texts: ["Exporter mon CV×Choisissez le format..."]`).

La capture de notation isolée (`_screenshots/review/general__Modal.png`, via `?story=`)
montre en revanche un cadre blanc malgré l'override `cardMode: single, viewport: 520x420`
correctement appliqué (confirmé present dans `Modal.html`, ligne `@dsCard ...
viewport="520x420"`) — semble être une interaction entre `position: fixed` et le pipeline
de capture isolée de `package-capture.mjs` (qui réinitialise à une fenêtre 1000×700 à un
moment du flux, ligne ~214 du script). Gradé `good` sur la base de la preuve du
render-check, pas de la capture isolée. **Known render warns** : ce `RENDER_THIN` sur
Modal est attendu à chaque re-sync tant que le composant garde son overlay `position:
fixed` — ne pas le traiter comme un nouvel avertissement.

## Écrans "Screen" (16 pages, deuxième vague de sync)

En plus des 11 composants d'origine, `ui-kit/src/screens/*.tsx` contient des contreparties
"design system" découplées des 16 pages réelles de l'app (13 pages utilisateur + 3 pages
admin), plus 5 pièces de support (`BrandMark`, `AuthLayout`, `AppFrame`, `AdminFrame`,
`CvPreviewCard`) — total 31 composants synchronisés. Règles suivies pour chaque Screen :

- Pas de `react-router-dom` — navigation via une prop optionnelle
  `onNavigate?: (path: string) => void`, appelée avec la route réelle exacte.
- Pas d'import de `frontend/src/lib/*` — types dupliqués dans `screens/types.ts`, données
  d'exemple dans `screens/sampleData.ts`, icônes portées dans `screens/icons.tsx` (usage
  interne, non exporté du paquet).
- Pas d'appel réseau réel — état local `useState` initialisé avec les données d'exemple,
  mutations synchrones locales pour les actions (suppression, duplication, etc).
- Pas de `window.confirm()`/`prompt()`.

**Ces 20 fichiers (`screens/*.tsx` + les 5 pièces de support) sont une deuxième copie
adaptée du produit réel, tout comme les 11 composants d'origine** — même risque de dérive
documenté ci-dessous, décuplé par le volume. Toute modification faite dans Claude Design
sur ces écrans doit être reportée à la main dans `frontend/src/pages/*` (et vice-versa).

## Piège : prop optionnelle de type tableau et fallback "floor card"

Le rendu de secours utilisé par l'outil pour un composant sans preview auteure construit
des props factices depuis la forme du `.d.ts`. Pour une prop **optionnelle de type
tableau** (ex. `resumes?: ResumeSummary[]`), il passe explicitement `[]` plutôt que
d'omettre la prop — c'est une vraie valeur, pas `undefined`, donc elle **contourne
silencieusement les valeurs par défaut JS** (`resumes: ResumeSummary[] = sampleResumeList`
ne s'applique jamais). Une prop optionnelle de type objet n'a pas ce problème. Conséquence
concrète : ~8 écrans rendaient leur état vide par défaut avant que ça ne soit repéré.
**Parade appliquée** : chaque Screen a une preview auteure (`.design-sync/previews/*.tsx`)
qui passe ses props explicitement — jamais de dépendance aux valeurs par défaut JS pour
quoi que ce soit de significatif à l'écran.

## Piège : import de sous-chemin dans les previews auteures

Une preview sous `.design-sync/previews/` ne peut importer que le spécificateur public
`@atsme/ui-kit` (externalisé vers `window.ATSmeUIKit` à la compilation) — un import de
sous-chemin comme `@atsme/ui-kit/screens/sampleData` ne se résout **pas** dans ce contexte
de compilation. Toute donnée d'exemple référencée par une preview doit être recopiée
directement dans le fichier de preview (verbeux mais nécessaire).

## Piège : capture scoped `--components X` qui purge les autres captures

Un run de `package-capture.mjs --components X` (au niveau orchestrateur, hors du driver
`resync.mjs`) a supprimé les captures de **tous les autres** composants dans
`_screenshots/review/` — pas seulement celles du composant ciblé — alors que les fichiers
d'état `.grade.json` des autres composants restaient en place. Contredit la description
attendue ("une purge complète efface tout ; une capture scoped ne devrait pas"). **Parade** :
préférer `resync.mjs` (qui gère son propre lot scoped en interne sans ce problème observé)
plutôt qu'un appel manuel `package-capture.mjs --components ...` ; si un appel manuel scoped
est malgré tout nécessaire, relancer ensuite un `package-capture.mjs` complet sans filtre
pour régénérer toutes les planches (les composants déjà gradés sont "carried forward" à
coût nul).

## Piège : layout `lg:grid-cols-*` qui perd du contenu à la capture

`AtsAnalysisScreen` (`grid lg:grid-cols-3`), `SettingsScreen` (pile verticale haute) et
`TemplatesScreen` (`grid sm:grid-cols-2 lg:grid-cols-5`) perdaient du contenu réel dans
leur capture de notation par défaut : en dessous de la largeur de rupture `lg` (1024px), la
grille se replie et le contenu poussé plus bas sort du cadre de capture à hauteur fixe —
`AtsAnalysisScreen` perdait entièrement sa 3e colonne (points forts / à améliorer +
bouton), `SettingsScreen` coupait la carte "Offre" et "Mot de passe", `TemplatesScreen`
n'affichait que 2 des 5 gabarits sans leurs étiquettes. **Parade** : override
`cardMode: "single"` + `viewport` explicite forçant la largeur (et hauteur pour
`SettingsScreen`) nécessaire dans `.design-sync/config.json`. Un composant avec un layout
responsive à plusieurs colonnes ou une pile verticale haute doit systématiquement être
vérifié à sa taille de capture par défaut avant d'être gradé "good" — un rendu tronqué peut
paraître propre sur la portion visible tout en cachant un vrai défaut.

## Risques de re-synchronisation

- **`ui-kit/` n'est pas (encore) consommé par `frontend/`.** Les composants y ont été
  dupliqués/adaptés depuis le code de l'app (mêmes noms, même style, props généralisées —
  ex. `ScoreGauge` prend `tone`/`label` explicites au lieu de dériver un score via
  `scoreTone()`/`scoreLabel()` importés de `lib/resumeApi.ts`). Un changement visuel fait
  directement dans `frontend/src/components/*` ou `frontend/src/pages/*` ne se propage
  **pas** automatiquement ici — il faut répercuter le changement à la main dans
  `ui-kit/src/*.tsx` avant de relancer la sync, sous peine de laisser le design system
  dériver du produit réel. **Ceci s'applique dans les deux sens** : les changements faits
  dans Claude Design (UI/UX) ne se répercutent pas non plus automatiquement dans le code —
  ils doivent être rapportés et portés à la main.
- **Aucun `docsDir` n'est configuré** — les `.prompt.md` sont entièrement synthétisés
  depuis le JSDoc + les props extraites du `.d.ts`, pas de documentation dédiée par
  composant.
- **Toolchain** : build testé avec `tsup@8.5.1`, `tailwindcss@4.3.3`
  (`@tailwindcss/cli@4.3.3`), Node fourni par l'environnement (`~22.x`). Playwright
  `1.63.0` (chromium build 1243) utilisé pour le render check — un changement de version
  Playwright peut nécessiter une nouvelle installation de chromium.
