## Conventions ATSme

**Pas de wrapper/provider requis.** Aucun composant ne lit de contexte React — ils lisent
directement les variables CSS `var(--*)` du DOM. Il suffit d'importer `styles.css` (déjà
fourni à chaque design) ; aucun `<ThemeProvider>` à poser autour de l'arbre.

**Changer de thème = un attribut, pas un composant.** Quatre thèmes existent, tous
définis dans `tokens.css` : le défaut (violet, sombre, `:root` sans attribut), et trois
variantes activées en posant `data-theme="emerald"`, `data-theme="amber"` ou
`data-theme="light"` sur un élément ancêtre (typiquement le conteneur racine de l'écran).
`light` est le seul thème clair ; les trois autres sont sombres.

**L'idiome de style : classes Tailwind à valeur arbitraire liées aux jetons CSS**, jamais
de couleur en dur. Chaque composant accepte `className` pour composer par-dessus son
style de base. Famille de jetons réels (voir `styles.css` → `tokens.css`) :

| Rôle | Jeton | Usage typique |
|---|---|---|
| Fond de page | `--bg` | `bg-[var(--bg)]` |
| Fond de carte | `--surface` | `bg-[var(--surface)]` |
| Fond de champ/survol | `--surface-2` | `bg-[var(--surface-2)]` |
| Bordure | `--border` | `border-[var(--border)]` |
| Texte principal | `--text` | `text-[var(--text)]` |
| Texte secondaire | `--text-dim` | `text-[var(--text-dim)]` |
| Texte discret | `--text-faint` | `text-[var(--text-faint)]` |
| Accent (couleur du thème) | `--violet` / `--violet-soft` / `--violet-glow` | `bg-[var(--violet)]`, halos `ring-[var(--violet-glow)]` |
| Succès / Alerte / Erreur | `--good` / `--warn` / `--danger` | jamais renommés par thème, juste retons |
| Police titres / corps / mono | `--ff-display` / `--ff-body` / `--ff-mono` | `font-[var(--ff-mono)]` pour les libellés en petites capitales |

`--violet`/`--violet-soft`/`--violet-glow` gardent ce nom historique dans les quatre
thèmes : elles portent toujours la couleur d'accent active (émeraude, ambre...), jamais
littéralement violet une fois un autre thème choisi.

**Où trouver la vérité** : `styles.css` à la racine du projet (import Tailwind + tous les
jetons, y compris ceux définis par thème) et `_ds_bundle.css` (styles compilés des
composants, atteignable uniquement via l'import de `styles.css`). Chaque composant a son
propre `<Name>.d.ts` (contrat de props exact) et `<Name>.prompt.md` (usage).

**Composition type** — une carte de formulaire, dans l'idiome réel du produit :

```tsx
<Card style={{ padding: 20, width: 320 }}>
  <Field label="Nom complet">
    <Input placeholder="Votre nom" />
  </Field>
  <div style={{ marginTop: 16 }}>
    <Button variant="primary">Enregistrer</Button>
  </div>
</Card>
```
