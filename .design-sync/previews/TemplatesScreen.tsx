import { TemplatesScreen } from "@atsme/ui-kit";

const resumes = [
  { id: 1, title: "Développeur Full-Stack", template: "violet", source: "scratch", ats_score: 83, updated_at: "2026-09-24T10:00:00Z", created_at: "2026-08-03T09:00:00Z" },
  { id: 2, title: "Lead Developer — candidature Acme", template: "obsidian", source: "import", ats_score: 61, updated_at: "2026-09-20T14:00:00Z", created_at: "2026-08-10T09:00:00Z" },
];

export function Default() {
  return <TemplatesScreen resumes={resumes} />;
}
