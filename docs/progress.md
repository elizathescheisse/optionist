# docs/progress.md
# Progress Log — Session-Start Reference

> Before starting a session: read this file to know what's real, what's stubbed, and what step is next.
> Update this file at the end of every step.

---

## Current step
**Up next: Step 13 — Polish pass**

---

## What's real (fully implemented)

### Infrastructure
- Vite + React + TypeScript + Tailwind CSS v4
- Zustand store with all actions implemented (`useAppStore.ts`)
- `localStorage` persistence — loads on startup, saves on every action, storage key `design-decision-tool:v1`
- Export envelope type (`ExportedAppData`)
- React Router with four routes wired up
- Vitest + React Testing Library configured, 98 tests passing

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
- Center panel shows `OptionViewer` + reject/final controls + `OptionFilmstrip` when options exist
- Right panel shows `DecisionNotesPanel` for the selected decision (remounted per decision via `key`)

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

### Keyboard navigation (`useReviewKeyboard` hook + `getReviewKeyAction`)
- Space / ArrowRight → next option, ArrowLeft → previous option
- R → reject/restore current option, F → mark current option final
- Escape → return to project route (review route only), ? → toggle shortcut help
- Wraparound handled by store actions (last→first, first→last)
- Window-level listener, enabled when a decision has options
- Typing guard: shortcuts never fire while focus is in an input, textarea, or contenteditable element (`isTypingTarget`)
- `preventDefault` on matched keys (stops Space from scrolling the page)
- R/F/Escape/? only act when their handlers are supplied — callers that omit them are unaffected
- Pure `getReviewKeyAction(event)` resolver lives in `utils/keyboard.ts` for independent unit testing
- Hook lives in `src/hooks/` (added directory — see decisions.md)

### Focused review route (`/projects/:id/review/:decisionId`)
- Full-screen layout: `ReviewToolbar` / `OptionViewer` / reject+final controls / `OptionFilmstrip`
- `ReviewToolbar`: back button (← Back → project route), decision title + status badge, option count (e.g., 2 / 5), view-mode toggle (Fit width / Full size), shortcut help toggle
- `ReviewWorkspace`: wires all keyboard handlers including Escape (navigate back) and ? (toggle help)
- `KeyboardShortcutHelp`: fixed overlay listing all shortcuts; closes on backdrop click, × button, or Escape
- Route validates project + decision params and redirects to `/` or `/projects/:id` if either is missing
- Sets `currentProjectId` and `currentDecisionId` on mount via the same pattern as `ProjectRoute`
- Reject/restore and mark-final controls identical to the `ProjectRoute` center panel

### Reject and final selection
- Center panel review controls (between viewer and filmstrip): Reject/Restore button + Mark final button, with R/F key hints
- Reject toggle: active → rejected, rejected → active, final → no-op (button disabled)
- Mark final: sets option to final, decision `selectedOptionId` + status `finalized` + `decidedAt`; other non-rejected options reset to active; rejected options stay rejected
- Re-marking a different option final moves the final flag and resets the previous final to active
- Finalized decisions already surface in the sidebar's "Finalized" group (Step 4)

### Decision notes panel (`DecisionNotesPanel`)
- Editable title (won't persist empty — reverts to stored value), description, notes, and final rationale fields
- Persists on blur via `updateDecision` (only when changed)
- Remounted per decision via `key={decisionId}` so local draft state resets when switching decisions
- Shows the selected final option (thumbnail + name) when one is chosen
- Incomplete-finalized warning: shown when status is finalized but final rationale is empty
- Status controls: Postpone/Archive (active), Archive (finalized), Reactivate (postponed/archived)
- All user text rendered as text (React escaping); no `dangerouslySetInnerHTML`

### JSON export/import (`ImportExportControls`)
- Export: calls `store.exportData()`, serializes to JSON, triggers browser download as `optionist-export-YYYY-MM-DD.json` via a blob URL — no network
- Import: hidden `<input type="file">`, reads file as text, parses JSON, runs `validateImportedData()`, shows inline error on failure
- Confirmation modal ("Replace all data?") before calling `importDataReplace` — all existing data is replaced
- Error display inline below buttons (e.g., "File is not valid JSON.", "Invalid appName.", etc.)
- `validateImportedData()` enforces: correct appName/dataVersion, all record fields present and typed correctly, full reference integrity (project↔decision↔option cross-references)

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

---

## Test coverage

| File | Tests | Covers |
|---|---|---|
| `persistence.test.ts` | 7 | loadState, saveState, clearState, corrupt JSON fallback |
| `store.test.ts` | 76 | create/update/delete project + decision + option, cascade delete, status transitions (all source statuses, data preservation, round trips), currentId lifecycle, current option select/next/previous + wraparound, reject/restore rules, mark-final rules (selectedOptionId/status/decidedAt/others reset/re-mark), reviewViewMode, file validation |
| `importExport.test.ts` | 19 | validateImportedData (valid data, envelope errors, record-level errors, reference integrity), exportData/importDataReplace round trip |
| `keyboard.test.ts` | 28 | getReviewKeyAction key mapping (incl R/F/Escape/?) + typing guard (incl Escape/?), isTypingTarget, useReviewKeyboard wiring/reject/final/escape/help/disabled/unmount |
| `notesPanel.test.tsx` | 9 | notes/rationale persist on blur, empty title reverts, line breaks preserved, incomplete-finalized warning show/hide, script-like text rendered as text |

---

## Known issues / decisions made this session
- Fixed infinite render loop in `ProjectList`: Zustand selectors must not call `Object.values().sort()` — select raw data, transform in component body.
- Fixed stale `currentOptionId` when switching decisions: `setCurrentDecision` now resets `currentOptionId` to the first option of the new decision.
- Fixed `isTypingTarget` crash on non-Element keydown targets (window/document have no `tagName`) — caught by the keyboard hook integration test.
- Added `src/hooks/` directory for the shared keyboard hook (see decisions.md).
