import { AdminFrame, Card } from "@atsme/ui-kit";

export function Default() {
  return (
    <AdminFrame active="dashboard">
      <Card style={{ padding: 20, maxWidth: 420 }}>
        <p style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>Vue d'ensemble</p>
        <p style={{ fontSize: 13, color: "var(--text-dim)", margin: 0 }}>Statistiques réelles de la plateforme ATSme.</p>
      </Card>
    </AdminFrame>
  );
}
