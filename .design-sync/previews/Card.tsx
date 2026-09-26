import { Card, ScoreGauge } from "@atsme/ui-kit";

// Cartes réelles d'ATSme : la carte "Mes CV récents" du tableau de bord, et la carte
// "Score ATS" de l'éditeur — Dashboard.tsx / CvEditor.tsx.
export function Content() {
  return (
    <Card style={{ padding: 20, width: 280 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 8px" }}>Mes CV récents</p>
      <p style={{ fontSize: 13, color: "var(--text-dim)", margin: 0 }}>Directeur Technique — modifié le 24/09/2026</p>
    </Card>
  );
}

export function Interactive() {
  return (
    <Card interactive style={{ padding: 16, width: 220, cursor: "pointer" }}>
      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", margin: 0 }}>Nouveau CV</p>
      <p style={{ fontSize: 11, color: "var(--text-faint)", margin: "4px 0 0" }}>Partir d'une page blanche</p>
    </Card>
  );
}

export function WithGauge() {
  return (
    <Card style={{ padding: 20, width: 200, textAlign: "center" }}>
      <p style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-faint)", margin: "0 0 16px" }}>
        Score ATS
      </p>
      <ScoreGauge score={78} size={100} label="Bon" />
    </Card>
  );
}
