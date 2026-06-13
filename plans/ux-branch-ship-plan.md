# UX Branch — Ship Plan (executed locally)

## Commits on `UX` (not pushed)

1. `1b7fc5e` — UX foundation (tokens, auth, `/app` routes, design system)
2. `b1144c6` — Login polish + modal focus fix + login video MP4
3. `4fd7dfc` — Pre-PR screenshot + screenshot script auth update

## Blocked

Push denied for `dilasciodev` on `elizathescheisse/optionist`. Eliza must add collaborator Write access.

## Once access is granted

```bash
git push -u origin UX
gh pr create --base main --title "Add UX foundation: design system, auth shell, and login polish" --body-file - <<'EOF'
## Summary
- Design token system (Geist Sans, colors, auth-panel purple for login)
- Auth flow: login, signup, onboarding, forgot-password (`test@test.com` / `test`)
- Protected `/app/*` routes: dashboard, projects, comparisons, design system, settings
- Login panel: video background, social/email icons
- Fix: Create Comparison modal inputs no longer lose focus while typing
- Pre-PR screenshot included

## Test plan
- [ ] `/login` — video + icons on desktop; sign in with test@test.com / test
- [ ] Signup → onboarding → lands on `/app` with sample comparisons
- [ ] Create Comparison modal — type in all fields and submit
- [ ] Open demo project — filmstrip pinned, options/notes work
- [ ] `/app/design-system` loads

## Notes
- Includes ~2.3MB video at `public/auth/login-bg.mp4`
EOF
```

Rename screenshot to PR number after merge if desired: `screenshots/2026-06-13-prUX.jpg`
