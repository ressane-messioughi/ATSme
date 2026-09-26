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
export { BrandMark, type BrandMarkProps } from "./BrandMark.js";
export { AuthLayout, type AuthLayoutProps } from "./AuthLayout.js";
export { AppFrame, type AppFrameProps, type AppFrameActiveKey } from "./AppFrame.js";
export { AdminFrame, type AdminFrameProps, type AdminFrameActiveKey } from "./AdminFrame.js";
export { CvPreviewCard, type CvPreviewCardProps } from "./CvPreviewCard.js";

// BrandOrb (l'entité 3D) n'est délibérément PAS exportée d'ici : elle embarque son
// propre moteur de rendu React (react-three-fiber → react-reconciler → scheduler), ce
// qui casse le garde-fou anti-fuite react-dom de l'outil de synchronisation Design et
// fait échouer le rendu de TOUS les composants du paquet, pas seulement le sien. Ce
// garde-fou vit dans un fichier que l'outil interdit de modifier. Elle continue de
// vivre dans le code de l'app (frontend/src/components/BrandOrb.tsx), simplement pas
// comme brique synchronisée vers Claude Design — une scène 3D animée n'est de toute
// façon pas un élément qu'un agent de design recomposerait dans un écran généré.
// BrandMark (repli statique, ci-dessus) porte la même identité visuelle partout où ce
// paquet a besoin de représenter la marque.

// Écrans — le contenu réel de chaque page de l'app ATSme, reconstruit en composants
// autonomes (données d'exemple, pas d'appel réseau, pas de react-router) pour être
// composés et retravaillés visuellement dans Claude Design. Voir .design-sync/NOTES.md
// pour la correspondance exacte avec chaque page de frontend/src/pages/ et la marche à
// suivre pour reporter un changement visuel fait ici vers le vrai code de l'app.
export { LoginScreen, type LoginScreenProps } from "./screens/LoginScreen.js";
export { RegisterScreen, type RegisterScreenProps } from "./screens/RegisterScreen.js";
export { DashboardScreen, type DashboardScreenProps } from "./screens/DashboardScreen.js";
export { CvListScreen, type CvListScreenProps } from "./screens/CvListScreen.js";
export { CvNewScreen, type CvNewScreenProps } from "./screens/CvNewScreen.js";
export { CvEditorScreen, type CvEditorScreenProps } from "./screens/CvEditorScreen.js";
export { TemplatesScreen, type TemplatesScreenProps } from "./screens/TemplatesScreen.js";
export { AtsAnalysisScreen, type AtsAnalysisScreenProps } from "./screens/AtsAnalysisScreen.js";
export { JobOffersScreen, type JobOffersScreenProps } from "./screens/JobOffersScreen.js";
export { HistoryScreen, type HistoryScreenProps } from "./screens/HistoryScreen.js";
export { SettingsScreen, type SettingsScreenProps } from "./screens/SettingsScreen.js";
export { ComingSoonScreen, type ComingSoonScreenProps } from "./screens/ComingSoonScreen.js";
export { AdminDashboardScreen, type AdminDashboardScreenProps } from "./screens/AdminDashboardScreen.js";
export { AdminUsersScreen, type AdminUsersScreenProps } from "./screens/AdminUsersScreen.js";
export { AdminResumesScreen, type AdminResumesScreenProps } from "./screens/AdminResumesScreen.js";

// Les jetons et les classes utilitaires compilées sont dans un fichier CSS séparé
// (dist/styles.css, exporté comme "@atsme/ui-kit/styles.css") plutôt qu'importés ici :
// esbuild ne les inlinerait pas correctement dans le bundle JS.
