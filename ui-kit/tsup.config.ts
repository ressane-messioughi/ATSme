import { defineConfig } from "tsup";

// La CSS n'est pas gérée ici : dist/styles.css est produit séparément par la CLI
// Tailwind (voir package.json "build"), seule façon de compiler les vraies classes
// utilitaires que les composants utilisent en dur (bg-[var(--surface-2)] etc.).
export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: true,
  sourcemap: false,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ["react", "react-dom"],
});
