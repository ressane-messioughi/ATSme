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

## Risques de re-synchronisation

- **`ui-kit/` n'est pas (encore) consommé par `frontend/`.** Les composants y ont été
  dupliqués/adaptés depuis le code de l'app (mêmes noms, même style, props généralisées —
  ex. `ScoreGauge` prend `tone`/`label` explicites au lieu de dériver un score via
  `scoreTone()`/`scoreLabel()` importés de `lib/resumeApi.ts`). Un changement visuel fait
  directement dans `frontend/src/components/*` ou `frontend/src/pages/*` ne se propage
  **pas** automatiquement ici — il faut répercuter le changement à la main dans
  `ui-kit/src/*.tsx` avant de relancer la sync, sous peine de laisser le design system
  dériver du produit réel.
- **Aucun `docsDir` n'est configuré** — les 11 `.prompt.md` sont entièrement synthétisés
  depuis le JSDoc + les props extraites du `.d.ts`, pas de documentation dédiée par
  composant.
- **Toolchain** : build testé avec `tsup@8.5.1`, `tailwindcss@4.3.3`
  (`@tailwindcss/cli@4.3.3`), Node fourni par l'environnement (`~22.x`). Playwright
  `1.63.0` (chromium build 1243) utilisé pour le render check — un changement de version
  Playwright peut nécessiter une nouvelle installation de chromium.
