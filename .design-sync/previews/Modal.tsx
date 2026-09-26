import { Modal, Button } from "@atsme/ui-kit";

// Fenêtre d'export d'un CV — CvEditor.tsx, ExportModal.
export function ExportCv() {
  return (
    <Modal title="Exporter mon CV" onClose={() => {}} maxWidth="28rem">
      <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16 }}>Choisissez le format qui vous convient le mieux.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        <div style={{ border: "1px solid var(--violet-soft)", background: "var(--violet-glow)", borderRadius: 12, padding: "10px 14px" }}>
          <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: "var(--text)" }}>PDF (Recommandé)</p>
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "10px 14px" }}>
          <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: "var(--text)" }}>DOCX</p>
        </div>
      </div>
      <Button variant="primary" className="w-full">
        Exporter le CV
      </Button>
    </Modal>
  );
}
