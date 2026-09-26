import { AdminUsersScreen } from "@atsme/ui-kit";

const users = [
  { id: 1, name: "Ressane Messioughi", email: "ressane@example.com", is_admin: 1, plan: "pro", resumeCount: 3, avgScore: 76, created_at: "2026-07-01T09:00:00Z", last_seen_at: "2026-09-26T09:50:00Z" },
  { id: 2, name: "Sofia Moreau", email: "sofia.moreau@example.com", is_admin: 0, plan: "free", resumeCount: 1, avgScore: 58, created_at: "2026-08-12T09:00:00Z", last_seen_at: "2026-09-25T18:20:00Z" },
  { id: 3, name: "Yanis Belkacem", email: "yanis.belkacem@example.com", is_admin: 0, plan: "free", resumeCount: 2, avgScore: null, created_at: "2026-09-02T09:00:00Z", last_seen_at: null },
];

export function Default() {
  return <AdminUsersScreen users={users} />;
}
