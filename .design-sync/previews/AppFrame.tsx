import { AppFrame, Card } from "@atsme/ui-kit";

export function Default() {
  return (
    <AppFrame active="dashboard" user={{ name: "Ressane Messioughi", email: "ressane@example.com" }}>
      <Card style={{ padding: 20, maxWidth: 420 }}>
        <p style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>Bonjour Ressane 👋</p>
        <p style={{ fontSize: 13, color: "var(--text-dim)", margin: 0 }}>Contenu de la page affiché ici.</p>
      </Card>
    </AppFrame>
  );
}
