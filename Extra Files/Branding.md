# Branding / Theme System — Design Doc

> Status: **Design only. Not for immediate implementation.**
> Purpose: lock the foundation so future branding features are *additive*, never a rewrite.

---

## 1. Core principle

Treat branding as a first-class concept — a **Brand Kit** — not a "color setting".
Internally everything lives under `branding`, even though Version 1 only fills in three colors.

```
Restaurant
├── Menu
├── Branding (Brand Kit)
│   ├── Colors        ← V1
│   ├── Typography    ← future (curated font pairs)
│   ├── Theme Preset  ← future
│   ├── Background    ← future
│   ├── Seasonal      ← future
│   └── AI Theme      ← future
└── Settings
```

## 2. The decision that actually matters

The expensive-to-change layer is **NOT** the database schema or the naming — those migrate easily.
It is the **semantic CSS token contract** that components consume. Once many components reference
a token, renaming or re-meaning it is a painful sweep. So this is the part we lock now.

**Rule: components consume semantic tokens (roles), never raw colors.**

Locked token vocabulary (includes accessibility `on-*` pairs):

```
--brand-primary      / --brand-on-primary
--brand-accent       / --brand-on-accent
--brand-surface      / --brand-on-surface
```

Every future feature (presets, seasonal, AI themes) is just **a different way of filling these
same variables**. That is what makes the whole future vision additive.

## 3. Storage — single JSONB `branding` column

- One nullable `branding` JSONB column on `restaurants` (Supabase/Postgres).
- `NULL` → falls back to the default theme. Existing restaurants are untouched.
- No relational queries on colors, so JSONB is the right fit — and new fields need **no migration**.
- Validate the blob with a TypeScript/Zod schema **at the server-component fetch boundary**
  (that is the "DB constraint" substitute).
- Keep a `version` field inside the JSON, but **do not** build version-migration machinery yet.
- The real "don't break existing restaurants" guarantee is: **every new field is optional with a default.**

## 4. TypeScript model (V1 shape, forward-compatible)

```ts
type Branding = {
  version: 1;
  colors: { primary: string; secondary: string; accent: string };

  // reserved — present in the type, NOT in the V1 UI, unused for now:
  fontPairId?: string;   // resolves to a curated next/font pair; defaults to "default"
  presetKey?: string;    // resolves to a code-defined preset
  background?: unknown;
  seasonal?: unknown;
};
```

- **Editable/populated in V1:** the three colors only.
- **In the type, not in the product:** everything else — shape is future-ready, product stays MVP.

## 5. Resolution — ONE pure function (no cascade engine yet)

```ts
resolveTheme(branding: Branding): TokenMap   // → { "--brand-primary": "#…", "--brand-on-primary": "#…", … }
```

- One function. No preset inheritance / seasonal override / AI-merge layering until a real second case exists.
- Auto-derive each `--brand-on-*` from luminance (pick black/white) so owner-picked colors stay readable.
- When seasonal/presets actually arrive, *this function* grows a merge step. Nothing else changes.

## 6. Next.js integration (fits current stack: Next 16, Tailwind v4, server components)

- Page already fetches the restaurant **before render**, so inject tokens as an inline `style`
  on the root wrapper: `<main style={resolveTheme(branding)}>`.
- Because it is server-rendered, there is **zero flash** of the wrong theme.
- Tailwind v4: map tokens into the theme once in `globals.css`, then use normal utilities:

```css
@theme {
  --color-brand:         var(--brand-primary,  #18181b);
  --color-brand-accent:  var(--brand-accent,   #f59e0b);
  --color-brand-surface: var(--brand-surface,  #ffffff);
}
```
→ components write `bg-brand`, `text-brand-accent`, etc. Never `bg-[${dynamic}]`.

## 7. Fonts — curated pairs only, never uploads

- Hard technical reason: `next/font` requires fonts to be **statically known at build time**.
  Curated pairs are the only architecture that gets font optimization.
- DB stores a `fontPairId` key; a **code registry** resolves it to real fonts.
- V1: default pair only.

## 8. Presets — code, not DB rows (for now)

- A preset ("Modern", "Luxury", "Cafe", "Minimal", "Rustic") is a named object that produces a
  default Brand Kit. Define them in a **static code registry**.
- DB stores `presetKey` + any overrides.
- Promote presets to DB rows only when per-tenant custom presets are needed (enterprise tier).

## 9. V1 vs reserved — summary

| Concern              | V1                          | Reserved (type-only / deferred)        |
|----------------------|-----------------------------|----------------------------------------|
| Colors               | ✅ 3 colors, editable        | —                                      |
| `on-*` contrast      | ✅ auto-derived              | —                                      |
| Token contract       | ✅ **locked now**            | —                                      |
| Storage              | ✅ JSONB `branding` column   | —                                      |
| Resolver             | ✅ one pure function         | merge/cascade engine                   |
| Typography           | default pair only           | curated font pairs, picker UI          |
| Theme presets        | —                           | code registry → later DB rows          |
| Background artwork    | —                           | ✅ reserved field                       |
| Seasonal themes      | —                           | Christmas / Ramadan / Diwali           |
| AI-generated themes  | —                           | derive Brand Kit from logo             |

## 10. What to get right now vs. what is cheap later

- **Lock now (expensive to reverse):** semantic token names + `on-*` roles; the rule that
  components consume tokens, not raw values.
- **Cheap to change later:** DB shape (JSONB), preset contents, font registry, naming.

**One-line guidance:** Nail the semantic token contract, keep resolution one pure function, and let
the DB be a flexible JSONB blob. Then every future-vision item becomes additive, not a rewrite.
