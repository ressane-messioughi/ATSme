import { useState } from "react";
import { TagsInput } from "@atsme/ui-kit";

// Saisie de compétences — CvEditor.tsx, onglet "Compétences".
export function Empty() {
  const [values, setValues] = useState<string[]>([]);
  return (
    <div style={{ width: 320 }}>
      <TagsInput values={values} onChange={setValues} placeholder="Ajouter une compétence" />
    </div>
  );
}

export function Prefilled() {
  const [values, setValues] = useState(["React", "TypeScript", "Node.js"]);
  return (
    <div style={{ width: 320 }}>
      <TagsInput values={values} onChange={setValues} placeholder="Ajouter une compétence" />
    </div>
  );
}
