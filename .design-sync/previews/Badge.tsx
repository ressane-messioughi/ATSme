import { Badge } from "@atsme/ui-kit";

export function Neutral() {
  return <Badge>Free</Badge>;
}

export function Good() {
  return <Badge tone="good">Actif</Badge>;
}

export function Warn() {
  return <Badge tone="warn">Score moyen</Badge>;
}

export function Danger() {
  return <Badge tone="danger">Score faible</Badge>;
}

export function Accent() {
  return <Badge tone="accent">Pro</Badge>;
}
