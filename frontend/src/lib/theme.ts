import { createContext, useContext } from "react";

export type ThemeId = "violet" | "emerald" | "amber" | "light";

export const THEMES: { id: ThemeId; label: string; description: string; swatch: [string, string, string] }[] = [
  { id: "violet", label: "Violet Nuit", description: "Le thème original d'ATSme.", swatch: ["#0b0b10", "#7c3aed", "#9d7bfb"] },
  { id: "emerald", label: "Émeraude Nuit", description: "Même ambiance sombre, accent émeraude.", swatch: ["#0b0b10", "#10b981", "#34d399"] },
  { id: "amber", label: "Ambre Nuit", description: "Même ambiance sombre, accent chaleureux.", swatch: ["#0b0b10", "#d97706", "#fbbf24"] },
  { id: "light", label: "Aurore Claire", description: "Fond clair, pour qui préfère le jour.", swatch: ["#f6f5fa", "#7c3aed", "#6d28d9"] },
];

// Même valeurs que --violet / --violet-soft dans index.css, dupliquées ici parce que
// BrandOrbScene (Three.js) a besoin de vraies couleurs JS, pas de var(--...) — un canvas
// WebGL ne lit pas les custom properties CSS. Only 4 thèmes, changés rarement : le risque
// de désynchronisation est faible face à la complexité d'une lecture DOM à chaque rendu.
export const THEME_ACCENT: Record<ThemeId, { base: string; soft: string }> = {
  violet: { base: "#7c3aed", soft: "#9d7bfb" },
  emerald: { base: "#10b981", soft: "#34d399" },
  amber: { base: "#d97706", soft: "#fbbf24" },
  light: { base: "#7c3aed", soft: "#6d28d9" },
};

const STORAGE_KEY = "atsme-theme";

export function isThemeId(value: string | null): value is ThemeId {
  return THEMES.some((t) => t.id === value);
}

// Appliqué au tout premier rendu (voir main.tsx), avant que React ne monte quoi que ce
// soit : sans ça, la page peignait d'abord le thème par défaut puis basculait au thème
// enregistré une fraction de seconde plus tard, un flash visible à chaque chargement.
export function applyStoredTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  const theme = isThemeId(stored) ? stored : "violet";
  document.documentElement.dataset.theme = theme;
  return theme;
}

export function persistTheme(theme: ThemeId) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}

export const ThemeContext = createContext<{ theme: ThemeId; setTheme: (t: ThemeId) => void } | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme doit être utilisé sous ThemeProvider");
  return ctx;
}
