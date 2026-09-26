import { Button } from "@atsme/ui-kit";

// Boutons principaux d'un CV — usage réel dans CvEditor.tsx (barre du haut) et
// Dashboard.tsx (carte "Analyse rapide").
export function Primary() {
  return <Button variant="primary">Nouveau CV</Button>;
}

export function Secondary() {
  return <Button variant="secondary">Enregistrer</Button>;
}

export function Ghost() {
  return <Button variant="ghost">Voir tous mes CV</Button>;
}

export function Danger() {
  return <Button variant="danger">Retirer</Button>;
}

export function Sizes() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button size="sm">Petit</Button>
      <Button size="md">Moyen</Button>
      <Button size="lg">Grand</Button>
    </div>
  );
}

export function Disabled() {
  return <Button disabled>Export en cours...</Button>;
}
