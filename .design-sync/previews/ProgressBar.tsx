import { ProgressBar } from "@atsme/ui-kit";

// Utilisée pour le détail du score ATS (CvEditor.tsx) et le quota d'offre (Settings.tsx).
export function ScoreDetail() {
  return (
    <div style={{ width: 240 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-dim)", marginBottom: 4 }}>
        <span>Mots-clés</span>
        <span>24/30</span>
      </div>
      <ProgressBar value={24} max={30} tone="good" />
    </div>
  );
}

export function PlanQuota() {
  return (
    <div style={{ width: 240 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
        <span style={{ fontWeight: 500 }}>Free</span>
        <span style={{ fontFamily: "monospace", color: "var(--text-dim)" }}>3 / 5 CV</span>
      </div>
      <ProgressBar value={3} max={5} tone="accent" />
    </div>
  );
}

export function Warning() {
  return (
    <div style={{ width: 240 }}>
      <ProgressBar value={9} max={10} tone="warn" />
    </div>
  );
}

export function Low() {
  return (
    <div style={{ width: 240 }}>
      <ProgressBar value={2} max={10} tone="danger" />
    </div>
  );
}
