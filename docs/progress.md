# docs/progress.md
# Progress Log — Session-Start Reference

> Before starting a session: read this file to know what's real, what's stubbed, and what step is next.
> Update this file at the end of every step.

---

## Current step
**Up next: Step 7 — Keyboard navigation**

---

## What's real (fully implemented)

### Infrastructure
- Vite + React + TypeScript + Tailwind CSS v4
- Zustand store with all actions implemented (`useAppStore.ts`)
- `localStorage` persistence — loads on startup, saves on every action, storage key `design-decision-tool:v1`
- Export envelope type (`ExportedAppData`)
- React Router with four routes wired up
- Vitest + React Testing Library configured, 55 tests passing

### Data model
- All types defined: `Project`, `Decision`, `DesignOption`, `AppState`, `ExportedAppData`
- All store actions implemented and tested: create/update/delete for projects, decisions, and options; archive/postpone/reactivate for decisions; reject/restore/markFinal for options; goToNextOption/goToPreviousOption; importDataReplace/exportData/resetAllData
- `setCurrentDecision` resets `currentOptionId` to first option of the new decision (or null)

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
- Center panel header shows decision title + "Add screenshots" compact uploader + "Review" link when options exist
- Center panel shows full `OptionUploader` drop zone when no options
- Center panel shows `OptionViewer` (large image + name + status badge) and `OptionFilmstrip` when options exist
- Right panel stub: "Notes panel — Step 9"

### Decision sidebar (left column)
- Decisions grouped by status: Active / Finalized / Postponed / Archived
- Empty groups are hidden
- Click to select a decision (sets `currentDecisionId` + resets `currentOptionId`)
- Create decision form (title input, trim + validate, auto-selects new decision)
- Hover to reveal actions per decision:
  - Active → Postpone, Archive, Delete
  - Finalized → Archive, Delete
  - Postponed → Reactivate, Delete
  - Archived → Reactivate, Delete
- Delete decision with confirmation modal (cascades to options)
- `DecisionStatusBadge` — color-coded per status

### Option upload (`OptionUploader`)
- Full drop-zone mode (default): drag-and-drop or click to choose multiple files
- Compact mode: "Add screenshots" button for use in the center panel header
- Validates each file: MIME type (png/jpeg/webp/gif), size (≤10 MB), not empty
- Shows per-file error messages for invalid files without blocking valid ones
- Converts valid files to base64 data URLs
- Creates one option per valid file via `addOption`
- First option uploaded to a decision auto-selects as current option

### Option viewer + filmstrip (`OptionViewer`, `OptionFilmstrip`, `OptionThumbnail`, `OptionStatusBadge`)
- `OptionViewer`: large current-option image with name + status badge; respects `reviewViewMode` (fit-width vs full-image natural size); honest empty state when no option selected
- `OptionFilmstrip`: horizontal scrollable thumbnail tray, ordered by `decision.optionIds`
- `OptionThumbnail`: click to select (sets `currentOptionId`), shows index number, rejected overlay (dimmed + "Rejected" label), final indicator (✓ Final), current-selection outline, option name
- `OptionStatusBadge`: color-coded active/rejected/final label
- "Review" link in center panel header navigates to the focused review route (route itself is Step 10)

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
| Right panel — notes panel | Shows "Notes panel — Step 9" | Step 9 |
| `ReviewWorkspace` | Empty `<div />` | Step 10 |
| `ReviewToolbar` | Empty `<div />` | Step 10 |
| `KeyboardShortcutHelp` | Empty `<div />` | Step 10 |
| `DecisionNotesPanel` | Empty `<div />` | Step 9 |
| Route `/projects/:id/review/:decisionId` | Empty `<div />` | Step 10 |
| Import/Export buttons | Visible, not wired | Step 12 |
| Keyboard shortcuts | Not implemented | Step 7 |
| Reject / mark final actions | Store actions + thumbnail display exist, no trigger UI | Step 8 |

---

## Test coverage

| File | Tests | Covers |
|---|---|---|
| `persistence.test.ts` | 7 | loadState, saveState, clearState, corrupt JSON fallback |
| `store.test.ts` | 48 | create/update/delete project + decision + option, cascade delete, status transitions, currentId lifecycle, setCurrentDecision resets currentOptionId, current option select/next/previous + wraparound, rejected options remain visible, file validation |
| `importExport.test.ts` | 0 | Placeholder — Step 12 |
| `keyboard.test.ts` | 0 | Placeholder — Step 7 |

---

## Known issues / decisions made this session
- Fixed infinite render loop in `ProjectList`: Zustand selectors must not call `Object.values().sort()` — select raw data, transform in component body.
- Fixed stale `currentOptionId` when switching decisions: `setCurrentDecision` now resets `currentOptionId` to the first option of the new decision.
