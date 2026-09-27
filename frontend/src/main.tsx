import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./lib/auth.tsx";
import { ThemeProvider } from "./lib/ThemeProvider.tsx";
import { applyStoredTheme } from "./lib/theme.ts";
import { Theme3DProvider } from "./lib/Theme3DProvider.tsx";
import { applyStoredTheme3D } from "./lib/theme3d.ts";

// Appliqué avant le premier rendu React : c'est ce qui évite un flash du thème par défaut
// suivi d'un saut vers le thème réellement enregistré.
const initialTheme = applyStoredTheme();
// Nouvelle DA (accueil 3D + coque/tableau de bord) : jetons --t-* séparés de l'ancien
// système --violet/--surface encore utilisé par les pages pas encore migrées.
const initialTheme3D = applyStoredTheme3D();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider initialTheme={initialTheme}>
        <Theme3DProvider initialTheme={initialTheme3D}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </Theme3DProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
