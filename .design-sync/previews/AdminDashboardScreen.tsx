import { AdminDashboardScreen } from "@atsme/ui-kit";

const stats = {
  totalUsers: 128,
  onlineNow: 6,
  newUsers7d: 14,
  activeUsers30d: 74,
  totalResumes: 241,
  importedResumes: 96,
  analyzedResumes: 183,
  avgScore: 68,
};

export function Default() {
  return <AdminDashboardScreen stats={stats} />;
}
