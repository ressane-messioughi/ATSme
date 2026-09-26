import { Chip } from "@atsme/ui-kit";

// Puces de compétences — l'onglet "Compétences" de l'éditeur de CV.
export function Static() {
  return <Chip>React</Chip>;
}

export function Removable() {
  return <Chip onRemove={() => {}}>TypeScript</Chip>;
}

export function Group() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <Chip onRemove={() => {}}>React</Chip>
      <Chip onRemove={() => {}}>Node.js</Chip>
      <Chip onRemove={() => {}}>TypeScript</Chip>
      <Chip onRemove={() => {}}>PostgreSQL</Chip>
    </div>
  );
}
