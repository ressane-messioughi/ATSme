import { SettingsScreen } from "@atsme/ui-kit";

export function Default() {
  return <SettingsScreen user={{ name: "Ressane Messioughi", email: "ressane@example.com", plan: "free" }} resumeCount={3} />;
}
