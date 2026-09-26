export { Button, type ButtonProps } from "./Button.js";
export { Card, type CardProps } from "./Card.js";
export { Field, type FieldProps } from "./Field.js";
export { Input, Textarea, type InputProps, type TextareaProps } from "./Input.js";
export { Chip, type ChipProps } from "./Chip.js";
export { TagsInput, type TagsInputProps } from "./TagsInput.js";
export { Badge, type BadgeProps } from "./Badge.js";
export { ScoreGauge, type ScoreGaugeProps } from "./ScoreGauge.js";
export { ProgressBar, type ProgressBarProps } from "./ProgressBar.js";
export { Modal, type ModalProps } from "./Modal.js";

// BrandOrb (l'entité 3D) n'est délibérément PAS exportée d'ici : elle embarque son
// propre moteur de rendu React (react-three-fiber → react-reconciler → scheduler), ce
// qui casse le garde-fou anti-fuite react-dom de l'outil de synchronisation Design et
// fait échouer le rendu de TOUS les composants du paquet, pas seulement le sien. Ce
// garde-fou vit dans un fichier que l'outil interdit de modifier. Elle continue de
// vivre dans le code de l'app (frontend/src/components/BrandOrb.tsx), simplement pas
// comme brique synchronisée vers Claude Design — une scène 3D animée n'est de toute
// façon pas un élément qu'un agent de design recomposerait dans un écran généré.

// Les jetons et les classes utilitaires compilées sont dans un fichier CSS séparé
// (dist/styles.css, exporté comme "@atsme/ui-kit/styles.css") plutôt qu'importés ici :
// esbuild ne les inlinerait pas correctement dans le bundle JS.
