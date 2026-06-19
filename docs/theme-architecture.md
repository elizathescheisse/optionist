# Theme Architecture

How Optionist resolves and applies light/dark mode across auth, app shell, and design previews.

## Types

| Type | Values | Purpose |
|------|--------|---------|
| `ThemePreference` | `light`, `dark`, `system` | What the user selects in Settings |
| `ResolvedTheme` | `light`, `dark` | What the UI actually renders (`data-theme` on `<html>`) |

Implementation: [`src/lib/theme.ts`](../src/lib/theme.ts)

## Storage

| Location | Key / column | Notes |
|----------|--------------|-------|
| localStorage | `optionist.settings` → `theme` | Demo mode and pre-hydration fallback |
| Supabase | `user_settings.theme` | Authoritative for authenticated users; default `light` |

Missing, null, or invalid values resolve to **`light`**.

## Route policy

| Area | Behavior |
|------|----------|
| `/login`, `/signup`, `/forgot-password`, `/auth/callback` | Forced light via `AuthThemeBoundary` |
| `/profile/setup`, `/onboarding` | Forced light (pre-app onboarding) |
| App shell (`/dashboard`, `/projects`, `/settings`, …) | User `ThemePreference` |
| Design system preview | Independent `darkPreview` toggle on preview panel only |

### Auth forced-light

[`AuthThemeBoundary`](../src/components/auth/AuthThemeBoundary.tsx) sets `data-theme-scope="auth"` and `data-theme="light"` on `<html>`. It does **not** write to localStorage or Supabase.

While auth scope is active, `applyAppTheme()` updates internal state but skips DOM changes. On unmount, the saved preference is re-applied.

Boot on auth paths uses `applyThemeForCurrentPath()` in `useAuthStore.hydrate()` to avoid a dark flash before React mounts.

## Resolution order (authenticated app)

1. Supabase `user_settings.theme` (after workspace load)
2. localStorage `optionist.settings.theme`
3. Default: `light`

When preference is `system`, `resolveRenderedTheme()` reads `prefers-color-scheme`. The OS listener (`useSystemThemeListener`) runs only inside `AppLayout` when preference is `system`.

## Settings

Only [`SettingsRoute`](../src/routes/SettingsRoute.tsx) persists theme changes. Signup and auth flows do not expose or save theme preference.

## Preview vs app chrome

- **App chrome theme** — navigation, settings, dashboard shell (`data-theme` on `<html>`)
- **Preview treatment** — scoped `data-theme` on the design system preview panel in `DesignSystemRoute`

Changing one does not change the other.

## QA scenarios

1. OS dark mode → visit `/signup` → always light
2. OS dark mode → visit `/login`, `/forgot-password`, `/auth/callback` → always light
3. New signup → app opens in light; Settings shows Light selected
4. Set Dark in Settings → app dark; logout → login still light
5. Set System in Settings → app follows OS; auth pages stay light
6. Guest entry from login → auth pages light; dashboard uses light default
7. Design system preview toggle → does not change app shell theme

## Related issues

Epic #191 and child issues #192–#199.
