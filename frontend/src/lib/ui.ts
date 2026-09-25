// Classes partagées pour que champs, boutons et cartes aient exactement le même rendu
// (rayon, transitions, halo de focus) partout dans l'app plutôt que redéfinis à chaque
// page avec de petites variations qui finissent par se voir.

export const inputCls =
  "w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] outline-none transition-all duration-150 placeholder:text-[var(--text-faint)] hover:border-[var(--text-faint)] focus:border-[var(--violet-soft)] focus:ring-[3px] focus:ring-[var(--violet-glow)]";

export const labelCls = "text-[11px] font-[var(--ff-mono)] font-medium uppercase tracking-[0.08em] text-[var(--text-faint)]";

export const cardCls = "bg-[var(--surface)] border border-[var(--border)] rounded-xl transition-colors duration-150";

export const chipCls =
  "inline-flex items-center gap-1.5 bg-[var(--violet-glow)] border border-[var(--violet-soft)]/25 text-[var(--violet-soft)] text-xs font-medium rounded-full pl-3 pr-1.5 py-1";

export const chipRemoveCls =
  "grid place-items-center w-4 h-4 rounded-full text-[var(--violet-soft)]/70 hover:text-white hover:bg-[var(--violet-soft)]/50 transition-colors cursor-pointer text-[13px] leading-none";

export const btnPrimaryCls =
  "inline-flex items-center justify-center gap-2 bg-[var(--violet)] hover:bg-[var(--violet-soft)] active:scale-[0.97] transition-all duration-150 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-[0_2px_12px_-2px_var(--violet-glow)] disabled:opacity-60 disabled:active:scale-100 disabled:cursor-not-allowed cursor-pointer";

export const btnSecondaryCls =
  "inline-flex items-center justify-center gap-2 bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--violet-soft)] active:scale-[0.97] transition-all duration-150 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--text)] disabled:opacity-60 disabled:active:scale-100 disabled:cursor-not-allowed cursor-pointer";

export const btnGhostCls =
  "inline-flex items-center justify-center gap-1.5 text-[var(--violet-soft)] hover:text-[var(--text)] text-xs font-medium transition-colors cursor-pointer";

export const dashedAddCls =
  "flex items-center justify-center gap-2 border border-dashed border-[var(--border)] hover:border-[var(--violet-soft)] hover:bg-[var(--violet-glow)] transition-colors duration-150 rounded-xl py-3 text-sm text-[var(--text-dim)] cursor-pointer";
