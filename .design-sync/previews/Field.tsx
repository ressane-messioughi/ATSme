import { Field, Input, Textarea } from "@atsme/ui-kit";

// Champs réels du formulaire d'informations personnelles — CvEditor.tsx, onglet
// "Informations".
export function TextField() {
  return (
    <div style={{ width: 280 }}>
      <Field label="Nom complet">
        <Input defaultValue="Ressane Messioughi" />
      </Field>
    </div>
  );
}

export function EmailField() {
  return (
    <div style={{ width: 280 }}>
      <Field label="Email">
        <Input type="email" placeholder="vous@exemple.com" />
      </Field>
    </div>
  );
}

export function TextareaField() {
  return (
    <div style={{ width: 320 }}>
      <Field label="Résumé professionnel">
        <Textarea rows={3} placeholder="2 à 4 phrases résumant votre profil et vos objectifs." />
      </Field>
    </div>
  );
}
