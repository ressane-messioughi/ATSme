// Classes partagées pour que champs, boutons et cartes aient exactement le même rendu
// (rayon, transitions, halo de focus) partout dans l'app plutôt que redéfinis à chaque
// page avec de petites variations qui finissent par se voir.
// Jetons --t-* (nouvelle DA, voir frontend/src/lib/theme3d.ts) — seul CvEditor.tsx
// consomme encore ce fichier, les autres pages migrées stylent en inline var(--t-*).

export const inputCls =
  "w-full bg-[var(--t-field)] border border-[var(--t-field-line)] rounded-[var(--t-r-md)] px-4 py-2.5 text-sm text-[var(--t-ink)] outline-none transition-all duration-150 placeholder:text-[var(--t-faint)] hover:border-[var(--t-line)] focus:border-[var(--t-accent)] focus:ring-[3px] focus:ring-[var(--t-ring)]";

export const labelCls = "text-[11px] font-[var(--t-mono)] font-medium uppercase tracking-[0.08em] text-[var(--t-muted)]";

export const cardCls = "bg-[var(--t-surface)] border border-[var(--t-line-soft)] rounded-[var(--t-r-lg)] transition-colors duration-150";

export const chipCls =
  "inline-flex items-center gap-1.5 bg-[var(--t-accent-soft)] border border-[var(--t-accent-line)] text-[var(--t-accent-ink)] text-xs font-medium rounded-full pl-3 pr-1.5 py-1";

export const chipRemoveCls =
  "grid place-items-center w-4 h-4 rounded-full text-[var(--t-accent-ink)]/70 hover:text-[var(--t-on-accent)] hover:bg-[var(--t-accent)]/60 transition-colors cursor-pointer text-[13px] leading-none";

export const btnPrimaryCls =
  "inline-flex items-center justify-center gap-2 bg-[var(--t-accent)] hover:bg-[var(--t-accent-hover)] active:scale-[0.97] transition-all duration-150 rounded-[var(--t-r-md)] px-4 py-2.5 text-sm font-semibold text-[var(--t-on-accent)] shadow-[0_2px_0_var(--t-shadow)] disabled:opacity-60 disabled:active:scale-100 disabled:cursor-not-allowed cursor-pointer";

export const btnSecondaryCls =
  "inline-flex items-center justify-center gap-2 bg-[var(--t-surface)] border border-[var(--t-field-line)] hover:border-[var(--t-line)] active:scale-[0.97] transition-all duration-150 rounded-[var(--t-r-md)] px-4 py-2.5 text-sm font-semibold text-[var(--t-ink)] disabled:opacity-60 disabled:active:scale-100 disabled:cursor-not-allowed cursor-pointer";

export const btnGhostCls =
  "inline-flex items-center justify-center gap-1.5 text-[var(--t-accent)] hover:text-[var(--t-ink)] text-xs font-semibold transition-colors cursor-pointer";

export const dashedAddCls =
  "flex items-center justify-center gap-2 border border-dashed border-[var(--t-field-line)] hover:border-[var(--t-accent)] hover:bg-[var(--t-accent-soft)] transition-colors duration-150 rounded-[var(--t-r-md)] py-3 text-sm text-[var(--t-ink2)] cursor-pointer";
