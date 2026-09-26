import { BrandMark } from "@atsme/ui-kit";

export function Sizes() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <BrandMark size={24} />
      <BrandMark size={40} />
      <BrandMark size={72} />
    </div>
  );
}

export function Emerald() {
  return <BrandMark size={56} accent="#10b981" />;
}
