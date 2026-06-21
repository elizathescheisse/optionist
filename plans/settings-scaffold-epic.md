# Scaffold Optionist Settings Experience

## What + Why

Replace the single-column Settings screen with a scalable SaaS layout: secondary nav grouped by Personal / Workspace / Product / Admin, child routes for each section, and shared placeholder components. Theme, logout, and reset demo data move into dedicated sections and keep working.

**This PR:** full scaffold + preserved behavior. Settings stays auth-only; guest-access metadata is wired but not activated.

## Changes

- `src/components/settings/` — SettingsLayout, SettingsNav, shared card/row/toggle/badge/table components, nav config, access model, reset hook
- `src/routes/settings/` — 18 section route pages (5 functional, 13 placeholder)
- `src/App.tsx` — nested `/settings/*` routes with profile redirect
- Remove `src/routes/SettingsRoute.tsx`

## Skipping

- Opening Settings to guests (metadata only)
- Real auth providers, billing, integrations, role editing
- Route guards beyond nav badges

## Verify

- `/settings` redirects to `/settings/profile`
- All settings routes render; active subnav matches route
- Theme, logout, reset demo data still work (reset has confirmation modal)
- Responsive layout at mobile width
- `npm run build`, `npm run lint`, `npm test` pass
