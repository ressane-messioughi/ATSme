import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./lib/auth.tsx";
import { ThemeProvider } from "./lib/ThemeProvider.tsx";
import { applyStoredTheme } from "./lib/theme.ts";

// Appliqué avant le premier rendu React : c'est ce qui évite un flash du thème par défaut
// suivi d'un saut vers le thème réellement enregistré.
const initialTheme = applyStoredTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider initialTheme={initialTheme}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
