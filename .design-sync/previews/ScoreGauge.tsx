import { ScoreGauge } from "@atsme/ui-kit";

// Jauge de score ATS — CvEditor.tsx, carte "Score ATS", et Dashboard.tsx (avatar de CV).
export function Excellent() {
  return <ScoreGauge score={92} label="Excellent" />;
}

export function Good() {
  return <ScoreGauge score={78} label="Bon" />;
}

export function Weak() {
  return <ScoreGauge score={34} label="Faible" />;
}

export function Empty() {
  return <ScoreGauge score={null} />;
}

export function Small() {
  return <ScoreGauge score={78} size={64} stroke={6} />;
}
