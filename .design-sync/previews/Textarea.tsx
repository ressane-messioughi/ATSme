import { Textarea } from "@atsme/ui-kit";

export function Empty() {
  return <Textarea rows={3} placeholder="Écrivez ici..." style={{ width: 320 }} />;
}

export function Filled() {
  return (
    <Textarea
      rows={4}
      style={{ width: 320 }}
      defaultValue="Développeur Full-Stack expérimenté, spécialisé en React et Node.js, avec un fort accent sur la performance et la fiabilité des systèmes déployés en production."
    />
  );
}
