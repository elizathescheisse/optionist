# Optionist

**[optionist.vercel.app](https://optionist.vercel.app)**

A local-first desktop web app for comparing design options, making decisions, and preserving decision rationale.

---

## What it does

Optionist gives designers a fast, structured workflow for design review:

1. Create a project (e.g. "Brand Refresh")
2. Add decisions within the project (e.g. "Hero illustration", "Nav bar color")
3. Upload screenshots for each decision
4. Review options Lightroom-style — large viewer + bottom filmstrip
5. Reject weak options, mark one final
6. Record rationale so the decision is preserved

All data lives in your browser's `localStorage`. Nothing is uploaded anywhere.

---

## Features

- **Local-first** — no backend, no accounts, no network calls
- **Project + decision + option hierarchy** — organize work into projects with multiple decisions per project
- **Image upload** — PNG, JPEG, WebP, GIF up to 10 MB each; stored as base64 data URLs
- **Keyboard-driven review** — Space/→ next, ← previous, R reject/restore, F mark final, Esc back, ? shortcuts help
- **Focused review mode** — full-screen `/review` route with fit-width / full-size toggle
- **Decision status** — active → finalized / postponed / archived
- **Notes + rationale** — per-decision notes and final rationale fields
- **JSON export/import** — download all data as a single JSON file and reimport it later; validated before replacing state
- **Confirmation modals** — deleting a project, decision, or import requires explicit confirmation

---

## Stack

| | |
|---|---|
| Framework | Vite + React + TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Routing | React Router v7 |
| Persistence | `localStorage` (key: `design-decision-tool:v1`) |
| Tests | Vitest + React Testing Library (142 tests) |

---

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

---

## Running tests

```bash
npm test
```

---

## Sharing with seed data

You can bundle your Optionist data with the project so someone else gets your workspace pre-loaded when they run the app locally — no manual import needed.

**To share your data:**

1. In Optionist, click **Export JSON** — this downloads `optionist-export-YYYY-MM-DD.json`
2. Rename the file to `seed.json` and place it in the `public/` folder
3. Share the project folder (zip, repo, etc.)

**For the recipient:**

```bash
npm install && npm run dev
```

The app opens with your data already loaded. From that point on it's theirs — they can edit freely and the seed file is never used again (it only loads when localStorage is empty).

> `public/seed.json` is gitignored by default so private design work isn't accidentally committed to a public repo. If you intentionally want to commit it (e.g. a team repo), remove it from `.gitignore`.

---

## Deploying

This is a pure static site. To deploy to Vercel:

1. Push to GitHub (already done)
2. Go to [vercel.com](https://vercel.com) → Add New Project → import this repo
3. Build command: `npm run build` · Output directory: `dist`
4. Deploy — every push to `main` redeploys automatically

---

## Project structure

```
src/
  routes/          # ProjectsRoute, ProjectRoute, ReviewRoute, NotFoundRoute
  components/
    layout/        # AppShell, Header, EmptyState
    projects/      # ProjectList, ProjectCard, CreateProjectForm, ImportExportControls
    decisions/     # DecisionSidebar, DecisionListItem, DecisionNotesPanel, …
    options/       # OptionUploader, OptionViewer, OptionFilmstrip, OptionThumbnail, …
    review/        # ReviewWorkspace, ReviewToolbar, KeyboardShortcutHelp
    shared/        # Button, TextInput, Textarea, Modal, FileInput
  store/           # Zustand store + localStorage persistence
  types/           # Domain types + import/export envelope
  utils/           # IDs, dates, file validation, import validation, keyboard
  tests/           # 142 tests across 5 files
docs/
  mvp-spec.md      # Full product + engineering spec
  build-plan.md    # 14-step implementation order
  decisions.md     # Dated technical/product decision log
  progress.md      # Session-start reference: what's built, test coverage
```

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Space` / `→` | Next option |
| `←` | Previous option |
| `R` | Reject / restore current option |
| `F` | Mark current option final |
| `Esc` | Return to project (from review mode) |
| `?` | Toggle shortcut help |

Shortcuts are disabled while focus is inside any input, textarea, or editable element.
