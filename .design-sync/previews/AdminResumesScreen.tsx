import { AdminResumesScreen } from "@atsme/ui-kit";

const resumes = [
  { id: 1, title: "Développeur Full-Stack", userName: "Ressane Messioughi", userEmail: "ressane@example.com", source: "scratch", hasOriginal: false, ats_score: 83, updated_at: "2026-09-24T10:00:00Z" },
  { id: 2, title: "Chargée de projet", userName: "Sofia Moreau", userEmail: "sofia.moreau@example.com", source: "import", hasOriginal: true, ats_score: 58, updated_at: "2026-09-25T11:00:00Z" },
];

export function Default() {
  return <AdminResumesScreen resumes={resumes} />;
}
