import { Input } from "@atsme/ui-kit";

export function Empty() {
  return <Input placeholder="vous@exemple.com" style={{ width: 260 }} />;
}

export function Filled() {
  return <Input defaultValue="ressane@example.com" style={{ width: 260 }} />;
}

export function Password() {
  return <Input type="password" defaultValue="••••••••" style={{ width: 260 }} />;
}

export function Disabled() {
  return <Input disabled defaultValue="claude-qa@example.com" style={{ width: 260 }} />;
}
