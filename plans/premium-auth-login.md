# Premium Login Auth Upgrade

## What + Why

The login had split layout and video but read as a prototype — flat right panel, single overlay, toggled social/email flow. This upgrade adds premium hero depth, a centered auth card, and reusable auth components while keeping the existing video and brand colors.

## Changes

- `src/styles/tokens.css` — auth layout tokens (card width, padding, field/button height, radii, shadow)
- `src/styles/auth.css` — hero overlays, vignette, dot grid, curved accent, auth card class
- `src/components/auth/AuthHero.tsx` — left panel content (logo, 3-line headline, bullets, tagline)
- `src/components/auth/AuthBackgroundVideo.tsx` — layered overlay; reduced-motion pauses video
- `src/components/auth/AuthLayout.tsx` — 50/50 split desktop, stack mobile
- `src/components/auth/AuthCard.tsx`, `AuthDivider.tsx`, `AuthFooterLink.tsx`, `AuthInput.tsx`, `PasswordInput.tsx`, `SocialAuthButtons.tsx`
- `src/routes/auth/LoginRoute.tsx` — full premium flow (Google/Apple, OR, email/password, remember me, loading/validation)
- `src/routes/auth/SignupRoute.tsx`, `ForgotPasswordRoute.tsx`, `OnboardingRoute.tsx` — wrapped in AuthCard
- Removed `SocialLoginButtons.tsx` (Facebook removed)

## Skipping

- Real OAuth, Facebook sign-in, remember-me persistence, product mockup on hero

## Verify

- Video on left at desktop; readable text over overlay
- Right card ~540px, shadow, border, full login flow
- Demo login: `test@test.com` / `test`
- `npm run build` + `npm test`
- Responsive: split desktop, stack mobile
