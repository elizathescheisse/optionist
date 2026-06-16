# Reintroduce the auth/UX foundation — additively

## Context

Your friend's PR #35 added an auth system, a UI component library, four new
routes, and a design-token system — but bundled them as one block that
**replaced** `App.tsx`, **renamed** the core `Decision` model to `Comparison`,
and **replaced** `tokens.css`. That all-or-nothing fusion is exactly why it was
reverted. You want all four pieces back, with the premium split-screen login and
the full 5-step onboarding — but **without overwriting any current styling,
layout, or content.**

The whole plan rests on one rule: **layer, don't replace.** Merge tokens (keep
existing values), add routes beside the existing ones (don't restructure paths),
and keep your `Decision`/`Option`/`Project` model untouched (skip the rename).

Reality check: this app has no backend. The reintroduced "auth" is a demo gate +
onboarding experience stored in localStorage (login is hardcoded), not real
accounts. Good for a showcase; not multi-user security.

## Changes

### A — Tokens (additive merge into existing file)
- `src/styles/tokens.css` — ADD the friend's new tokens: `primary`,
  `primary-soft`, `auth-panel`, accents (orange/yellow/pink/rose),
  `surface-muted`, `text-muted`/`text-soft`, the `*-soft` status variants,
  shadows, type scale, radii, layout spacing (sidebar/topbar/max), z-index,
  easing/durations, plus a `[data-theme="dark"]` override block. KEEP every
  existing value unchanged (e.g. `warning` stays `#a16207`). Where names overlap
  (`muted`), reuse the existing token rather than redefining.

### B — Auth store (new, touches nothing existing)
- `src/store/useAuthStore.ts` (new) — separate zustand store: `user`,
  onboarding answers, `settings.theme`; `login` / `logout` /
  `loginFromOnboarding` / `setOnboarding` / `updateSettings` / `hydrate`.
- `src/main.tsx` — add one line: `useAuthStore.getState().hydrate()` on startup.

### C — UI component library (new folder, no overwrite of `shared/`)
- `src/components/ui/*.tsx` (new): Badge, Card, Divider, EmptyState, IconButton,
  LoadingState, PageHeader, Pill, SectionHeader, Tabs. Existing `shared/`
  components stay exactly as they are.

### D — Auth experience (premium split-screen + full onboarding)
- `src/components/auth/` (new): AuthLayout, AuthBackgroundVideo, GuestOnly,
  RequireAuth, SocialLoginButtons.
- `src/routes/auth/` (new): LoginRoute, SignupRoute, OnboardingRoute (5 steps),
  ForgotPasswordRoute.
- `public/auth/login-bg.mp4` — restore the video asset from the reverted commit.
- Onboarding's demo seeding rewritten to call existing store actions
  (`createProject`/`createDecision`/`addOption`) — NOT the friend's Comparison
  format.

### E — New routes + their own shell
- `src/components/layout/AppLayout.tsx` (new sidebar shell) — used ONLY by the
  new routes. Your existing `AppShell` + `Header` stay untouched and keep serving
  the current project/decision/review views.
- `src/routes/` (new): AppDashboardRoute, SettingsRoute, DesignSystemRoute,
  PresentRoute — each rewritten to read your existing `Decision`/`DesignOption`/
  `Project` types from `useAppStore`. Dashboard speaks in current vocabulary
  ("Decisions"/"Projects"), not "Comparisons".

### F — Wire routing (the one careful edit to existing `App.tsx`)
- `src/App.tsx` — ADD public auth routes (`/login`, `/signup`, `/onboarding`,
  `/forgot-password`); wrap the existing routes in `<RequireAuth>`; add the new
  routes (`/dashboard`, `/settings`, `/design-system`, `/present/:decisionId`)
  under `AppLayout`. PRESERVE the existing route declarations (`/`,
  `/projects/:id`, review, history) and their `AppShell`. Post-login lands on
  `/dashboard`; logout lives in the `AppLayout` sidebar.

## Skipping (deliberate)
- **The `Decision → Comparison` rename**, `src/types/comparison.ts`, and the
  `decisionToComparison()` mapper — this was the main cause of the original
  conflict. New routes consume your existing domain types directly.
- **Enhancements to existing Button/Modal/TextInput/Textarea** (extra
  variants/props) — current APIs are enough for the auth forms; leave working
  components alone. Revisit only if a specific new screen needs a variant.
- **Real backend/accounts** — out of scope; auth stays a localStorage demo.
- **LegacyRedirect / `/app/*` restructuring** — unneeded, since we keep existing
  paths where they are instead of moving them.

## Known overlaps to flag (not blockers)
- **Two shells coexist**: existing views keep the header-based `AppShell`; new
  routes use the sidebar `AppLayout`. Moving between them works (dashboard →
  click a decision → existing project view) but it's a slight seam. Acceptable
  for now; worth a unifying pass later.
- **Design system shown twice**: you already have a press-"D" `DesignSystemModal`;
  the new `DesignSystemRoute` is a full-page version. Keep both for now; file a
  cleanup issue to pick one.

## Verify
- `npm run build` clean and `npm test` passes (existing tests untouched).
- `git diff src/styles/tokens.css` shows **only additions** — no existing value
  changed.
- Manual: logged-out visit to `/` redirects to `/login`; completing onboarding
  lands on `/dashboard` with seeded demo decisions; existing project/decision/
  review views render with their current layout; Settings theme toggle flips dark
  mode; press-"D" modal still works.
