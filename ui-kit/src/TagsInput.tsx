import { useState, type KeyboardEvent } from "react";
import { Chip } from "./Chip.js";

export type TagsInputProps = {
  /** Valeurs actuelles. */
  values: string[];
  /** Appelé avec la nouvelle liste à chaque ajout ou retrait. */
  onChange: (values: string[]) => void;
  /** Texte affiché dans le champ de saisie quand la liste est vide. */
  placeholder?: string;
};

/**
 * Saisie de valeurs multiples sous forme de puces — Entrée ou virgule valide une entrée.
 *
 * @example
 * <TagsInput values={["React", "TypeScript"]} onChange={setSkills} placeholder="Ajouter une compétence" />
 */
export function TagsInput({ values, onChange, placeholder }: TagsInputProps) {
  const [draft, setDraft] = useState("");

  function commit() {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    }
  }

  return (
    <div className="field flex flex-wrap items-center gap-1.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2.5 transition-all duration-150 hover:border-[var(--text-faint)] focus-within:border-[var(--violet-soft)]">
      {values.map((v, i) => (
        <Chip key={v + i} onRemove={() => onChange(values.filter((_, idx) => idx !== i))}>
          {v}
        </Chip>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        placeholder={values.length ? "" : placeholder}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm py-0.5"
      />
    </div>
  );
}
