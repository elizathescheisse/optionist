# Epic: App Cohesion — Unified Shell, Tokens, Components

## What + Why

The app felt like two products stitched together: sidebar disappeared on project views, colors shifted between screens, and `shared/` vs `ui/` duplicated the same jobs. This epic unifies navigation, tokens, and components. Comparisons UI is deferred (#81).

GitHub epic: #77

## Stories

| # | Issue | Scope |
|---|-------|-------|
| 1 | #82 | Unified sidebar shell (closes #70) |
| 2 | #83 | Fix Projects nav trap + active states |
| 3 | #84 | Consolidate home — `/dashboard` canonical, `/projects` list (closes #71) |
| 4 | #85 | Simplify tokens.css palette |
| 5 | #78 | Migrate legacy gray-* to tokens |
| 6 | #79 | Consolidate shared/ → ui/ |
| 7 | #80 | Single design-system surface (closes #66) |
| 8 | #81 | [someday] Wire comparisons workspace |

## Simplified token palette

**Keep:** bg, surface, surface-muted, border, text, text-muted, text-soft, primary, primary-soft, success/error/warning (+ soft), overlay, auth-panel

**Drop:** muted/subtle aliases, accent-orange/yellow/pink/rose

## Skipping

- Real auth/backend
- Comparisons implementation (#81)
- Guest mode (#69), onboarding shaping (#68)

## Verify

- Sidebar persists across all authenticated routes
- No raw gray-* in layout or form primitives
- Single EmptyState, single Button import path
- `npm run build` + tests pass
