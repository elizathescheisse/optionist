# Theme Mode Signup Fix

**Epic:** #191

## What + Why

Signup and pre-auth pages inherit global theme resolution, so OS dark mode and Supabase's `system` default cause auth screens to render dark. We force light on auth routes, default new users to light, and centralize theme resolution for the authenticated app.

## Audit Summary

- Theme applied via duplicate `applyTheme()` in `useAuthStore` and `useWorkspaceStore` → `document.documentElement[data-theme]`
- Storage: `optionist.settings.theme` (local); `user_settings.theme` (Supabase, default was `system`)
- No ThemeProvider; no CSS `@media (prefers-color-scheme)` — system resolved in JS
- Auth routes have no theme boundary; workspace load during callback/onboarding overrides to system

## Theme Contract

| Type | Values | Stored where |
|------|--------|--------------|
| ThemePreference | light, dark, system | `user_settings.theme`, `optionist.settings` |
| ResolvedTheme | light, dark | DOM `data-theme` only |

| Area | Behavior |
|------|----------|
| Login, signup, forgot-password, auth callback | Forced light |
| Profile setup, onboarding | Forced light |
| Authenticated app | Saved preference → local fallback → light |
| System mode | App shell only when preference is `system` |
| Design system preview | Independent `darkPreview` on preview panel |

## Changes

- `src/lib/theme.ts` — central resolver, auth scope, system listener hook
- `src/components/auth/AuthThemeBoundary.tsx` — force light on auth routes
- `src/App.tsx` — wrap auth routes
- `src/store/useAuthStore.ts`, `useWorkspaceStore.ts` — use theme lib
- `src/components/layout/AppLayout.tsx` — system theme listener
- `src/routes/SettingsRoute.tsx` — sync local after Supabase save
- `supabase/migrations/20260619200000_theme_default_light.sql` — default light + backfill
- `docs/theme-architecture.md` — developer documentation

## Skipping

- No rename to `theme_preference` — keep `user_settings.theme`
- No `/reset-password` route — reset links go to `/forgot-password`
- No broad variable renames in DesignSystemRoute — `darkPreview` is already clear

## Verify

- OS dark mode: signup/login stay light
- New user: Settings shows Light; DB `theme = light`
- Dark/system preference in app works; auth pages stay light after logout
- `npm run build` passes

## Issues

- #191 Epic tracker
- #192 Audit
- #193 Contract
- #194 AuthThemeBoundary
- #195 Supabase default
- #196 Central resolver
- #197 Preview separation
- #198 QA checklist
- #199 Documentation
