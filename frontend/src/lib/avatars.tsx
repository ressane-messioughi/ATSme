// Icônes de profil pré-établies (sélectionnables dans Paramètres) : glyphes plats simples,
// une teinte de fond fixe par icône (indépendante du thème 3D actif) pour rester
// reconnaissables partout où l'avatar s'affiche.

export type AvatarId = "cat" | "fox" | "owl" | "bear" | "robot" | "star" | "rocket" | "plant" | "coffee" | "book";

type AvatarDef = { id: AvatarId; label: string; bg: string; icon: React.ReactNode };

const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const AVATARS: AvatarDef[] = [
  {
    id: "cat",
    label: "Chat",
    bg: "#e8913f",
    icon: (
      <svg viewBox="0 0 24 24" width="60%" height="60%" {...s}>
        <path d="M5 9 4 3l4 3" /><path d="M19 9l1-6-4 3" />
        <path d="M4.5 12a7.5 7 0 1 0 15 0 7.5 7 0 1 0-15 0Z" />
        <circle cx="9.5" cy="12" r="0.8" fill="currentColor" /><circle cx="14.5" cy="12" r="0.8" fill="currentColor" />
        <path d="M11 14.5h2l-1 1.2z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "fox",
    label: "Renard",
    bg: "#d97706",
    icon: (
      <svg viewBox="0 0 24 24" width="60%" height="60%" {...s}>
        <path d="M4 8 3 3l5 3.2" /><path d="M20 8l1-5-5 3.2" />
        <path d="M4.5 13c0-5 3.3-8.5 7.5-8.5S19.5 8 19.5 13c0 4-3 7-7.5 7s-7.5-3-7.5-7Z" />
        <path d="M12 12.5 9.5 16h5z" />
        <circle cx="9" cy="11.5" r="0.8" fill="currentColor" /><circle cx="15" cy="11.5" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "owl",
    label: "Hibou",
    bg: "#7c5a3a",
    icon: (
      <svg viewBox="0 0 24 24" width="60%" height="60%" {...s}>
        <path d="M6 10a6 7 0 1 1 12 0c0 5-2 9-6 9s-6-4-6-9Z" />
        <circle cx="9.3" cy="10" r="2.1" /><circle cx="14.7" cy="10" r="2.1" />
        <circle cx="9.3" cy="10" r="0.6" fill="currentColor" /><circle cx="14.7" cy="10" r="0.6" fill="currentColor" />
        <path d="M11.3 12.5 12 14l0.7-1.5" />
        <path d="M4 6l3 2M20 6l-3 2" />
      </svg>
    ),
  },
  {
    id: "bear",
    label: "Ours",
    bg: "#8b5e34",
    icon: (
      <svg viewBox="0 0 24 24" width="60%" height="60%" {...s}>
        <circle cx="6.3" cy="6.3" r="2" /><circle cx="17.7" cy="6.3" r="2" />
        <path d="M4.5 13a7.5 6.5 0 1 0 15 0 7.5 6.5 0 1 0-15 0Z" />
        <circle cx="9.5" cy="13" r="0.8" fill="currentColor" /><circle cx="14.5" cy="13" r="0.8" fill="currentColor" />
        <ellipse cx="12" cy="15.6" rx="1.6" ry="1.1" />
      </svg>
    ),
  },
  {
    id: "robot",
    label: "Robot",
    bg: "#4c8dff",
    icon: (
      <svg viewBox="0 0 24 24" width="60%" height="60%" {...s}>
        <rect x="5" y="8" width="14" height="11" rx="3" />
        <path d="M12 8V5" /><circle cx="12" cy="4" r="1" fill="currentColor" />
        <circle cx="9" cy="13.5" r="1.1" fill="currentColor" /><circle cx="15" cy="13.5" r="1.1" fill="currentColor" />
        <path d="M9 17h6" /><path d="M2 12h3M19 12h3" />
      </svg>
    ),
  },
  {
    id: "star",
    label: "Étoile",
    bg: "#e8c14a",
    icon: (
      <svg viewBox="0 0 24 24" width="62%" height="62%" {...s} strokeLinejoin="round">
        <path d="M12 3.5 14.6 9l6 .8-4.4 4 1.3 6-5.5-3-5.5 3 1.3-6-4.4-4 6-.8Z" />
      </svg>
    ),
  },
  {
    id: "rocket",
    label: "Fusée",
    bg: "#c0392b",
    icon: (
      <svg viewBox="0 0 24 24" width="60%" height="60%" {...s}>
        <path d="M12 2c3 2 4.5 6 4 10l-4 4-4-4c-.5-4 1-8 4-10Z" />
        <circle cx="12" cy="9" r="1.3" />
        <path d="M8.5 14 6 16.5l1 3 3-1" /><path d="M15.5 14 18 16.5l-1 3-3-1" />
      </svg>
    ),
  },
  {
    id: "plant",
    label: "Plante",
    bg: "#4f7f52",
    icon: (
      <svg viewBox="0 0 24 24" width="58%" height="58%" {...s}>
        <path d="M12 21v-9" />
        <path d="M12 12c0-4-3-6-6-6 0 4 2.5 6 6 6Z" />
        <path d="M12 9c0-3.5 2.5-5.5 5.5-5.5C17.5 7 15 9 12 9Z" />
        <path d="M8.5 21h7" />
      </svg>
    ),
  },
  {
    id: "coffee",
    label: "Café",
    bg: "#6b4228",
    icon: (
      <svg viewBox="0 0 24 24" width="60%" height="60%" {...s}>
        <path d="M5 9h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z" />
        <path d="M16 10.5h1.5a2 2 0 1 1 0 4H16" />
        <path d="M8 5.5c0 1-1 1-1 2M11.5 5.5c0 1-1 1-1 2" />
      </svg>
    ),
  },
  {
    id: "book",
    label: "Livre",
    bg: "#5b4fae",
    icon: (
      <svg viewBox="0 0 24 24" width="58%" height="58%" {...s}>
        <path d="M12 6.5c-1.5-1-4-1.5-7-1v13c3 -0.5 5.5 0 7 1 1.5-1 4-1.5 7-1v-13c-3-0.5-5.5 0-7 1Z" />
        <path d="M12 6.5v13" />
      </svg>
    ),
  },
];

const AVATAR_MAP = new Map(AVATARS.map((a) => [a.id, a]));

export function Avatar({ avatar, name, size = 34 }: { avatar?: string | null; name?: string; size?: number }) {
  const def = avatar ? AVATAR_MAP.get(avatar as AvatarId) : undefined;
  if (!def) {
    return (
      <span
        aria-hidden="true"
        className="rounded-full grid place-items-center font-bold shrink-0"
        style={{ width: size, height: size, background: "var(--t-pop)", color: "var(--t-on-accent)", fontSize: size * 0.42 }}
      >
        {(name || "?").slice(0, 1).toUpperCase()}
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="rounded-full grid place-items-center shrink-0"
      style={{ width: size, height: size, background: def.bg, color: "#fff" }}
    >
      {def.icon}
    </span>
  );
}
