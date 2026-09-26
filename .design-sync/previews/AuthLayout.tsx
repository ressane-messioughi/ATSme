import { AuthLayout, Button, Field, Input } from "@atsme/ui-kit";

export function Login() {
  return (
    <AuthLayout title="Bon retour" subtitle="Connectez-vous pour retrouver vos CV.">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="Email">
          <Input type="email" placeholder="vous@exemple.com" />
        </Field>
        <Field label="Mot de passe">
          <Input type="password" placeholder="••••••••" />
        </Field>
        <Button variant="primary" style={{ marginTop: 8 }}>
          Se connecter
        </Button>
      </div>
    </AuthLayout>
  );
}
