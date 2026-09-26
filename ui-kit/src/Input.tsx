import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldCls =
  "field w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] outline-none transition-all duration-150 placeholder:text-[var(--text-faint)] hover:border-[var(--text-faint)] focus:border-[var(--violet-soft)]";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

/**
 * Champ de saisie texte, avec halo de focus violet.
 *
 * @example
 * <Field label="Email"><Input type="email" placeholder="vous@exemple.com" /></Field>
 */
export function Input({ className = "", ...props }: InputProps) {
  return <input className={`${fieldCls} ${className}`} {...props} />;
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Zone de texte multi-lignes, même style que `Input`.
 *
 * @example
 * <Field label="Résumé professionnel"><Textarea rows={4} placeholder="2 à 4 phrases..." /></Field>
 */
export function Textarea({ className = "", ...props }: TextareaProps) {
  return <textarea className={`${fieldCls} resize-y ${className}`} {...props} />;
}
