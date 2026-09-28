import { createContext, useContext, useEffect, useState } from "react";

// Jetons des 4 thèmes de la nouvelle direction artistique (design_handoff_atsme_3d/,
// copiés depuis Landing3d.dc.html / themes.json). Clé de stockage partagée avec l'accueil
// 3D (public/accueil/theme3d.js lit/écrit la même clé localStorage) : changer de thème
// ici ou sur "/" reste cohérent d'une page à l'autre.
export type Theme3DId = "ghibli" | "cyber" | "tech" | "vinyle";

export const THEME3D_META: { id: Theme3DId; label: string; swatch: string }[] = [
  { id: "ghibli", label: "Ghibli", swatch: "linear-gradient(135deg,#4f7f52 50%,#f3ead8 50%)" },
  { id: "cyber", label: "Cyberpunk", swatch: "linear-gradient(135deg,#ff2a6d 50%,#fcee0a 50%)" },
  { id: "tech", label: "Tech dark", swatch: "linear-gradient(135deg,#4c8dff 50%,#0d1117 50%)" },
  { id: "vinyle", label: "Vinyle", swatch: "linear-gradient(135deg,#1ed760 50%,#121212 50%)" },
];

export const THEMES3D: Record<Theme3DId, Record<string, string>> = {
  ghibli: {
    bg: "#f3ead8", surface: "#fbf6ea", surface2: "#efe5cf", field: "#fffdf7", hover: "#f1e7d2",
    ink: "#3b2f25", ink2: "#5e4f40", muted: "#7d6a55", faint: "#a8977e",
    accent: "#4f7f52", "accent-hover": "#46744a", "accent-soft": "#dfe9d6", "accent-ink": "#2f5a33", "accent-line": "#b9d0ae", "on-accent": "#ffffff",
    line: "#3b2f25", "line-soft": "#e2d4b6", "field-line": "#d9c9a6", shadow: "#3b2f25", ring: "#dfe9d6", track: "#e4d7bb",
    note: "#fff6de", warn: "#b7771f", "warn-soft": "#f6e3c6", "warn-ink": "#8a5a12", "warn-line": "#e9c98f",
    danger: "#b84a3a", "danger-soft": "#f6d9d2", pop: "#e8913f", info: "#6f8fb8", sky1: "#dcebf5", sky2: "#eef3e2",
    display: "'Zen Maru Gothic',serif", body: "'IBM Plex Sans',system-ui,sans-serif", mono: "'IBM Plex Mono',monospace",
    "r-lg": "18px", "r-md": "12px", "r-pill": "999px",
    cat: "#e8913f", "cat-light": "#fff1dc", "cat-stripe": "#c46e28", "cat-eye": "#2a1d16", "cat-pink": "#f4a6a6", collar: "#4f7f52", bell: "#e8c14a",
  },
  cyber: {
    bg: "#0a0614", surface: "#140c24", surface2: "#1d1233", field: "#0e0820", hover: "#22163d",
    ink: "#f3efff", ink2: "#cfc6ee", muted: "#a89fd0", faint: "#6f639a",
    accent: "#fcee0a", "accent-hover": "#fff45c", "accent-soft": "#0f2a33", "accent-ink": "#05d9e8", "accent-line": "#05d9e8", "on-accent": "#0a0614",
    line: "#ff2a6d", "line-soft": "#3a2458", "field-line": "#4b3070", shadow: "#ff2a6d", ring: "#0b4a55", track: "#2a1d45",
    note: "#1f0f2a", warn: "#ff9f1c", "warn-soft": "#3a2410", "warn-ink": "#ffb347", "warn-line": "#6b4318",
    danger: "#ff2a6d", "danger-soft": "#3a0f20", pop: "#05d9e8", info: "#05d9e8", sky1: "#1a0b33", sky2: "#3a0f40",
    display: "'Chakra Petch',sans-serif", body: "'IBM Plex Sans',system-ui,sans-serif", mono: "'IBM Plex Mono',monospace",
    "r-lg": "4px", "r-md": "2px", "r-pill": "2px",
    cat: "#5a4590", "cat-light": "#b8a8e8", "cat-stripe": "#2a1d4a", "cat-eye": "#05d9e8", "cat-pink": "#ff2a6d", collar: "#fcee0a", bell: "#fcee0a",
  },
  tech: {
    bg: "#0d1117", surface: "#161b22", surface2: "#1c2230", field: "#0d1117", hover: "#1f2630",
    ink: "#e6edf3", ink2: "#b8c1cc", muted: "#8b949e", faint: "#6e7681",
    accent: "#4c8dff", "accent-hover": "#6aa1ff", "accent-soft": "#16263f", "accent-ink": "#9cc2ff", "accent-line": "#264a7a", "on-accent": "#0d1117",
    line: "#30363d", "line-soft": "#262c35", "field-line": "#3a424d", shadow: "transparent", ring: "#1f3a66", track: "#262c35",
    note: "#1a2130", warn: "#d29922", "warn-soft": "#2b2211", "warn-ink": "#e3b341", "warn-line": "#5a4516",
    danger: "#f85149", "danger-soft": "#3a1614", pop: "#a371f7", info: "#4c8dff", sky1: "#0f1a2b", sky2: "#111827",
    display: "'Space Grotesk',sans-serif", body: "'IBM Plex Sans',system-ui,sans-serif", mono: "'IBM Plex Mono',monospace",
    "r-lg": "12px", "r-md": "8px", "r-pill": "999px",
    cat: "#8b949e", "cat-light": "#e6edf3", "cat-stripe": "#57606a", "cat-eye": "#0d1117", "cat-pink": "#f4a6a6", collar: "#4c8dff", bell: "#d29922",
  },
  vinyle: {
    bg: "#121212", surface: "#181818", surface2: "#202020", field: "#242424", hover: "#2a2a2a",
    ink: "#ffffff", ink2: "#d6d6d6", muted: "#a7a7a7", faint: "#7a7a7a",
    accent: "#1ed760", "accent-hover": "#3be477", "accent-soft": "#16331f", "accent-ink": "#1ed760", "accent-line": "#1f5a33", "on-accent": "#000000",
    line: "#2a2a2a", "line-soft": "#262626", "field-line": "#3e3e3e", shadow: "transparent", ring: "#1f5a33", track: "#3e3e3e",
    note: "#1e1e1e", warn: "#f59b23", "warn-soft": "#33240f", "warn-ink": "#ffb54a", "warn-line": "#5a3f16",
    danger: "#f3727f", "danger-soft": "#3a1a1d", pop: "#1ed760", info: "#509bf5", sky1: "#1f3a2a", sky2: "#121212",
    display: "'Figtree',sans-serif", body: "'Figtree',system-ui,sans-serif", mono: "'IBM Plex Mono',monospace",
    "r-lg": "12px", "r-md": "8px", "r-pill": "999px",
    cat: "#3a3a3a", "cat-light": "#d0d0d0", "cat-stripe": "#1a1a1a", "cat-eye": "#1ed760", "cat-pink": "#f3727f", collar: "#1ed760", bell: "#e8c14a",
  },
};

const STORAGE_KEY = "atsme-theme";

export function readTheme3D(): Theme3DId {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v && v in THEMES3D ? (v as Theme3DId) : "ghibli";
  } catch {
    return "ghibli";
  }
}

export function applyTheme3D(id: Theme3DId) {
  const tokens = THEMES3D[id];
  const style = document.documentElement.style;
  for (const [k, v] of Object.entries(tokens)) style.setProperty(`--t-${k}`, v);
  document.documentElement.style.colorScheme = id === "ghibli" ? "light" : "dark";
  // Couleur de la barre d'adresse (mobile) assortie au thème actif.
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", tokens.accent);
}

// Appliqué avant le premier rendu React (voir main.tsx) pour éviter un flash du thème par
// défaut suivi d'un saut vers le thème enregistré.
export function applyStoredTheme3D(): Theme3DId {
  const id = readTheme3D();
  applyTheme3D(id);
  return id;
}

export const Theme3DContext = createContext<{ theme: Theme3DId; setTheme: (id: Theme3DId) => void } | null>(null);

export function useTheme3D() {
  const ctx = useContext(Theme3DContext);
  if (!ctx) throw new Error("useTheme3D doit être utilisé sous Theme3DProvider");
  return ctx;
}

// Diffuse le changement aux iframes (accueil 3D embarqué dans une future itération) et
// écoute les changements faits depuis un autre onglet (événement storage natif).
export function useTheme3DState(initial: Theme3DId) {
  const [theme, setThemeState] = useState<Theme3DId>(initial);

  function setTheme(id: Theme3DId) {
    if (id === theme) return;
    applyTheme3D(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* stockage indisponible */
    }
    setThemeState(id);
  }

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue && e.newValue in THEMES3D) {
        applyTheme3D(e.newValue as Theme3DId);
        setThemeState(e.newValue as Theme3DId);
      }
    }
    addEventListener("storage", onStorage);
    return () => removeEventListener("storage", onStorage);
  }, []);

  return { theme, setTheme };
}
