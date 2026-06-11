# docs/progress.md
# Progress Log — Session-Start Reference

> Before starting a session: read this file to know what's real, what's stubbed, and what step is next.
> Update this file at the end of every step.

---

## Current step
**Up next: Step 5 — Image upload and option creation**

---

## What's real (fully implemented)

### Infrastructure
- Vite + React + TypeScript + Tailwind CSS v4
- Zustand store with all actions implemented (`useAppStore.ts`)
- `localStorage` persistence — loads on startup, saves on every action, storage key `design-decision-tool:v1`
- Export envelope type (`ExportedAppData`)
- React Router with four routes wired up
- Vitest + React Testing Library configured, 31 tests passing

### Data model
- All types defined: `Project`, `Decision`, `DesignOption`, `AppState`, `ExportedAppData`
- All store actions implemented and tested: create/update/delete for projects, decisions, and options; archive/postpone/reactivate for decisions; reject/restore/markFinal for options; goToNextOption/goToPreviousOption; importDataReplace/exportData/resetAllData

### Route: `/` — Projects list
- Create project form (name input, trim + validate, navigates to new project)
- Project cards (name, description, decision count, finalized count, last updated date)
- Open project (navigates to `/projects/:id`)
- Delete project with confirmation modal (cascades to decisions + options)
- Empty state when no projects exist
- Import/Export buttons visible but **not yet wired** (Step 12)
- Projects sorted by `updatedAt` descending

### Route: `/projects/:projectId` — Project workspace
- Three-column layout: sidebar / center / right panel
- Redirects to `/` if project ID is invalid
- Sets `currentProjectId` in store on mount

### Decision sidebar (left column)
- Decisions grouped by status: Active / Finalized / Postponed / Archived
- Empty groups are hidden
- Click to select a decision (sets `currentDecisionId`)
- Create decision form (title input, trim + validate, auto-selects new decision)
- Hover to reveal actions per decision:
  - Active → Postpone, Archive, Delete
  - Finalized → Archive, Delete
  - Postponed → Reactivate, Delete
  - Archived → Reactivate, Delete
- Delete decision with confirmation modal (cascades to options)
- `DecisionStatusBadge` — color-coded per status

### Header
- "Decision Compare" link back to `/`
- Breadcrumb shows project name when inside a project route

### Shared components (all real)
- `Button` — primary / secondary / danger variants
- `TextInput`, `Textarea` — styled inputs
- `Modal` — confirmation dialog with confirm/cancel
- `FileInput` — styled file input wrapper
- `EmptyState` — message + optional detail line

### Utilities (all real)
- `createId()` — `crypto.randomUUID()`
- `now()` — `new Date().toISOString()`
- `validateImageFile()` — checks MIME type, size, empty file
- `fileToDataUrl()` — File → base64 data URL
- `isTypingTarget()` — detects input/textarea/contenteditable focus
- `validateImportedData()` — full reference-integrity validation for import JSON

---

## What's stubbed (placeholder only)

| Component / Route | Status | Implemented in |
|---|---|---|
| Center panel — option viewer | Shows empty state placeholder | Step 6 |
| Right panel — notes panel | Shows "Notes panel coming soon" | Step 9 |
| `OptionViewer` | Empty `<div />` | Step 6 |
| `OptionFilmstrip` | Empty `<div />` | Step 6 |
| `OptionThumbnail` | Empty `<div />` | Step 6 |
| `OptionUploader` | Empty `<div />` | Step 5 |
| `OptionStatusBadge` | Empty `<div />` | Step 6 |
| `ReviewWorkspace` | Empty `<div />` | Step 10 |
| `ReviewToolbar` | Empty `<div />` | Step 10 |
| `KeyboardShortcutHelp` | Empty `<div />` | Step 10 |
| `DecisionNotesPanel` | Empty `<div />` | Step 9 |
| Route `/projects/:id/review/:decisionId` | Empty `<div />` | Step 10 |
| Import/Export buttons | Visible, not wired | Step 12 |
| Keyboard shortcuts | Not implemented | Step 7 |
| Reject / mark final actions | Store actions exist, no UI | Step 8 |

---

## Test coverage

| File | Tests | Covers |
|---|---|---|
| `persistence.test.ts` | 7 | loadState, saveState, clearState, corrupt JSON fallback |
| `store.test.ts` | 24 | create/update/delete project + decision, cascade delete, status transitions, currentId lifecycle |
| `importExport.test.ts` | 0 | Placeholder — Step 12 |
| `keyboard.test.ts` | 0 | Placeholder — Step 7 |

---

## Known issues / decisions made this session
- Fixed infinite render loop in `ProjectList`: Zustand selectors must not call `Object.values().sort()` — select raw data, transform in component body.
