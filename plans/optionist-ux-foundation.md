# Optionist UX Foundation — Font Audit (Story 1.1)

## Findings

- **Web fonts:** None before this work — system UI stack only
- **Google Font imports:** None in `index.html`
- **CSS type variables:** None
- **Tailwind config:** Tailwind v4 with no `@theme` block
- **Hardcoded sizes:** `text-xs` through `text-lg` scattered; one `text-[10px]` in OptionThumbnail

## Inconsistencies

- Mixed neutral palettes (`gray-*` + one `zinc-300`)
- Body background `#f4f4f5` vs component `bg-gray-50`
- No semantic color naming

## Decision

- **Primary font:** Geist Sans (single family for MVP)
- **Token system:** `src/styles/tokens.css` with Tailwind v4 `@theme inline`
- **Dark mode:** Tokens defined on `[data-theme="dark"]`; light ships first
