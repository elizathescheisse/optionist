# Visual QA Audit — Optionist

Audit date: 2026-06-13. Screens checked against design system tokens.

## Screens

| Screen | Background | Surfaces | Borders | Typography | Buttons | Issues |
|--------|------------|----------|---------|------------|---------|--------|
| Login | auth-panel + video | OK | OK | OK | OK | Auth polish ahead of app |
| Signup / Onboarding | auth-panel | OK | OK | OK | OK | — |
| Dashboard | app-bg | Cards white | token borders | PageHeader OK | Primary CTA OK | Stats need icons |
| Projects | app-bg | Cards | OK | OK | Secondary import/export | Flat list cards |
| Comparison workspace | surface-muted panels | Center too stark white | OK | Small labels | Present/Import OK | Long scroll inspector; no tabs |
| Create Comparison modal | Modal surface | OK | OK | OK | OK | Fixed focus bug |
| Settings | app-bg | Single column cards | OK | OK | Outline danger OK | Not tabbed admin yet |
| Design System | app-bg | Cards | OK | OK | Demos OK | Needs internal nav |
| Dark mode (settings) | app-bg dark | Preserved navy feel | OK | OK | OK | Comparison dark partial |

## Hardcoded styles to clean

- Residual `gray-*` in legacy badge maps (being migrated)
- `WorkspaceShell` Header uses mixed patterns
- OptionThumbnail `text-[10px]` arbitrary size

## Cleanup task list

1. Apply `--app-*` surface tokens app-wide
2. Unify radius to sm/md/lg/xl (8/12/18/24)
3. Button heights 32/40/48
4. Tabbed comparison inspector
5. Settings admin subnav
6. Microcopy: Screenshots → Design options
