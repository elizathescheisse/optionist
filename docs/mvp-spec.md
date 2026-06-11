# docs/mvp-spec.md
# Design Decision Compare Tool — MVP Engineering Spec
## 1. What it is — one declarative sentence
A local-first desktop web app that helps individual product/UX designers compare design options, make decisions, and preserve decision rationale.
---
## 2. MVP goal + the hard rules
The MVP prioritizes one fast, high-value workflow: create a project, add design decisions, upload option screenshots, compare options in a Lightroom-like review interface, reject weak options, choose a final option, and record rationale in under 5 minutes. It deliberately avoids collaboration, accounts, AI, Figma integration, voting, permissions, and backend infrastructure until the core workflow is validated.
### Non-negotiable constraints
1. **The app must be local-first only.**
   * All project data is stored in browser `localStorage`.
   * No backend.
   * No external database.
   * No network calls.
2. **The app must never pretend data exists.**
   * Empty projects, empty decisions, and missing images must show honest empty states.
   * Do not use mock/demo data in production app state.
3. **The app must preserve user-created data unless the user explicitly deletes it.**
   * Deleting a project, decision, or option must require a confirmation.
   * Rejected options are not deleted.
   * Finalized decisions are not deleted; they move into finalized/archive views.
4. **The app must support export and import.**
   * Users must be able to download all app data as a JSON file.
   * Users must be able to reupload a previously exported JSON file.
   * Imported data must be validated before replacing or merging with current data.
5. **The app must not upload images anywhere.**
   * Uploaded screenshots are stored locally as data URLs in app state.
   * The app must clearly behave as a local-only tool.
6. **Keyboard shortcuts must not fire while typing.**
   * If focus is inside an `input`, `textarea`, or editable element, shortcuts are disabled.
7. **The review workflow must be fast.**
   * Spacebar and arrow-key option switching must feel immediate.
   * Avoid unnecessary animations or heavy re-rendering.
8. **The UI is desktop-first.**
   * Optimize for laptop/desktop screens.
   * Tablet widths should not break.
   * Mobile-specific layouts are out of scope.
9. **The app must not add paid services or API dependencies.**
   * No paid APIs.
   * No AI APIs.
   * No analytics services.
10. **The app must maintain data integrity.**
    * IDs must be stable.
    * Exported JSON must round-trip back into the app without data loss.
    * Invalid imported JSON must be rejected with a clear error.
---
## 3. Explicitly out of scope (MVP)
Do NOT include:
* User authentication
* User accounts
* Cloud sync
* Backend database
* Multi-user collaboration
* Stakeholder voting
* Comment threads
* Permissions or roles
* Figma plugin
* Figma API integration
* AI analysis
* AI-generated rationale
* Design-system impact analysis
* Component dependency mapping
* Analytics
* Mobile app
* Mobile-first responsive redesign
* Real-time presentation mode
* PDF export
* Image annotation tools
* Version control beyond local project data
* Drag-and-drop reordering unless trivial after core flow is complete
* Custom theming
* Templates
* Paid services
All of these are intentionally deferred until the core workflow is validated.
---
## 4. Tech stack decisions
### Core stack
* **Framework:** Vite
* **UI library:** React
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **State management:** Zustand
* **Persistence:** `localStorage`
* **Routing:** React Router
* **Testing:** Vitest + React Testing Library
* **ID generation:** `crypto.randomUUID()`
* **Date storage:** ISO strings via `new Date().toISOString()`
### Data import/export
* Use native browser file APIs.
* Export as one JSON file.
* Import from one JSON file.
* Validate imported JSON before applying it.
### Image handling
* Uploaded images are converted to base64 data URLs.
* Accepted image types:
  * `image/png`
  * `image/jpeg`
  * `image/webp`
  * `image/gif`
### Deferred backend
A backend may exist later, but do not implement now. Keep state and type boundaries clean enough that local persistence can later be replaced by server persistence.
---
## 5. Architecture + repo layout
### Data flow
UI → Zustand actions → app state → localStorage persistence → JSON export/import
### Repo layout
```txt
docs/
  mvp-spec.md                 ← source-of-truth product and engineering spec
  build-plan.md               ← step-by-step implementation order
  decisions.md                ← dated technical/product decision log
src/
  main.tsx                    ← React app entry point
  App.tsx                     ← route shell and top-level app wiring
  routes/
    ProjectsRoute.tsx         ← project list / create / import-export surface
    ProjectRoute.tsx          ← selected project workspace
    ReviewRoute.tsx           ← focused review mode for one decision
    NotFoundRoute.tsx         ← fallback route
  components/
    layout/
      AppShell.tsx            ← app frame with header and content area
      Header.tsx              ← app title, project nav, import/export controls
      EmptyState.tsx          ← reusable honest empty state component
    projects/
      ProjectList.tsx         ← list of projects
      ProjectCard.tsx         ← single project summary
      CreateProjectForm.tsx   ← create project form
      ImportExportControls.tsx← export all data and import JSON
    decisions/
      DecisionSidebar.tsx     ← active/finalized/archived decision list
      DecisionListItem.tsx    ← single decision row
      CreateDecisionForm.tsx  ← add decision to project
      DecisionStatusBadge.tsx ← active/finalized/archived label
      DecisionNotesPanel.tsx  ← notes + final rationale editor
    options/
      OptionUploader.tsx      ← upload images to a decision
      OptionFilmstrip.tsx     ← bottom thumbnail tray
      OptionThumbnail.tsx     ← thumbnail with rejected/final/current state
      OptionViewer.tsx        ← large focused image viewer
      OptionStatusBadge.tsx   ← active/rejected/final label
    review/
      ReviewWorkspace.tsx     ← full review surface for one decision
      ReviewToolbar.tsx       ← fit/full view toggle and current option controls
      KeyboardShortcutHelp.tsx ← visible shortcut reference
    shared/
      Button.tsx              ← simple local button component
      TextInput.tsx           ← simple input wrapper
      Textarea.tsx            ← simple textarea wrapper
      Modal.tsx               ← confirmation modal
      FileInput.tsx           ← styled file input wrapper
  store/
    useAppStore.ts            ← Zustand store, actions, selectors, persistence hook
    persistence.ts            ← localStorage load/save/import/export helpers
  types/
    domain.ts                 ← Project, Decision, Option, AppState types
    importExport.ts           ← exported JSON envelope types
  utils/
    ids.ts                    ← createId helper
    dates.ts                  ← timestamp helpers
    files.ts                  ← file-to-data-url helpers and file validation
    validation.ts             ← import schema validation and sanitization helpers
    keyboard.ts               ← typing-target detection for shortcuts
  tests/
    store.test.ts             ← action correctness and data integrity tests
    persistence.test.ts       ← localStorage and JSON round-trip tests
    importExport.test.ts      ← import validation and malformed JSON tests
    keyboard.test.ts          ← shortcut gating tests
```
---
## 6. Data model
```ts
export type ID = string;
export type ISODateString = string;
export type AppDataVersion = 1;
export type Project = {
  id: ID;
  name: string;
  description: string;
  decisionIds: ID[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
export type DecisionStatus = "active" | "finalized" | "archived" | "postponed";
export type Decision = {
  id: ID;
  projectId: ID;
  title: string;
  description: string;
  status: DecisionStatus;
  optionIds: ID[];
  selectedOptionId: ID | null;
  notes: string;
  finalRationale: string;
  decidedAt: ISODateString | null;
  archivedAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
export type OptionStatus = "active" | "rejected" | "final";
export type DesignOption = {
  id: ID;
  decisionId: ID;
  name: string;
  imageDataUrl: string;
  imageMimeType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
  status: OptionStatus;
  notes: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
export type ReviewViewMode = "fit-width" | "full-image";
export type AppState = {
  projects: Record<ID, Project>;
  decisions: Record<ID, Decision>;
  options: Record<ID, DesignOption>;
  currentProjectId: ID | null;
  currentDecisionId: ID | null;
  currentOptionId: ID | null;
  reviewViewMode: ReviewViewMode;
  dataVersion: AppDataVersion;
};
```
### Unique keys
* `Project.id`: generated with `crypto.randomUUID()`.
* `Decision.id`: generated with `crypto.randomUUID()`.
* `DesignOption.id`: generated with `crypto.randomUUID()`.
### Ordering
* Project decision order is stored in `Project.decisionIds`.
* Decision option order is stored in `Decision.optionIds`.
* The filmstrip uses `Decision.optionIds` order.
### Valid values
* `Decision.status`
  * `active`: decision is still being reviewed.
  * `finalized`: final option has been chosen.
  * `archived`: decision is no longer active and should appear in archive.
  * `postponed`: decision was not made and may be revisited later.
* `DesignOption.status`
  * `active`: option is still under consideration.
  * `rejected`: option was eliminated.
  * `final`: option was chosen as final.
* `ReviewViewMode`
  * `fit-width`: image scales to available viewport width.
  * `full-image`: image displays at natural size inside a scrollable viewer.
### Sanitization and injection risks
The app ingests user-provided text fields:
* project name
* project description
* decision title
* decision description
* decision notes
* final rationale
* option name
* option notes
Rules:
* Render all user text as text, never as raw HTML.
* Do not use `dangerouslySetInnerHTML`.
* Trim leading/trailing whitespace on save.
* Preserve line breaks in notes/rationale using CSS, not HTML injection.
The app ingests image files:
* Only allow approved image MIME types.
* Reject non-image files.
* Reject empty files.
* Reject files larger than 10 MB per image.
* Store images as data URLs only.
---
## 7. App state
### Zustand store shape
```ts
type AppStore = AppState & {
  createProject: (input: { name: string; description?: string }) => ID;
  updateProject: (projectId: ID, patch: Partial<Pick<Project, "name" | "description">>) => void;
  deleteProject: (projectId: ID) => void;
  setCurrentProject: (projectId: ID | null) => void;
  createDecision: (
    projectId: ID,
    input: { title: string; description?: string }
  ) => ID;
  updateDecision: (
    decisionId: ID,
    patch: Partial<Pick<Decision, "title" | "description" | "notes" | "finalRationale">>
  ) => void;
  deleteDecision: (decisionId: ID) => void;
  archiveDecision: (decisionId: ID) => void;
  postponeDecision: (decisionId: ID) => void;
  reactivateDecision: (decisionId: ID) => void;
  setCurrentDecision: (decisionId: ID | null) => void;
  addOption: (
    decisionId: ID,
    input: {
      name: string;
      imageDataUrl: string;
      imageMimeType: DesignOption["imageMimeType"];
    }
  ) => ID;
  updateOption: (
    optionId: ID,
    patch: Partial<Pick<DesignOption, "name" | "notes">>
  ) => void;
  deleteOption: (optionId: ID) => void;
  rejectOption: (optionId: ID) => void;
  restoreOption: (optionId: ID) => void;
  markOptionFinal: (optionId: ID) => void;
  setCurrentOption: (optionId: ID | null) => void;
  goToNextOption: () => void;
  goToPreviousOption: () => void;
  setReviewViewMode: (mode: ReviewViewMode) => void;
  exportData: () => ExportedAppData;
  importDataReplace: (data: ExportedAppData) => void;
  resetAllData: () => void;
};
```
### Persistence
* Persistence happens in `store/persistence.ts`.
* The store loads initial state from `localStorage` on app startup.
* Any state-changing action writes the full state snapshot to `localStorage`.
* Storage key: `design-decision-tool:v1`.
### Export envelope
```ts
export type ExportedAppData = {
  appName: "design-decision-tool";
  dataVersion: 1;
  exportedAt: ISODateString;
  projects: Record<ID, Project>;
  decisions: Record<ID, Decision>;
  options: Record<ID, DesignOption>;
};
```
### Import behavior
For MVP, import is **replace-only**, not merge.
When a valid JSON file is imported:
1. Validate envelope.
2. Validate all project, decision, and option records.
3. Validate references:
   * every `project.decisionIds` item exists
   * every `decision.projectId` exists
   * every `decision.optionIds` item exists
   * every `option.decisionId` exists
   * every `decision.selectedOptionId`, if present, exists
4. Replace current app state.
5. Persist replacement state.
If validation fails, do not modify current state.
---
## 8. Screen-by-screen specs
## Route: `/`
### Purpose
Show all projects and provide entry points to create, import, export, open, and delete projects.
### Layout
* App header at top.
* Main content area with project list.
* Empty state if no projects exist.
### Regions
#### Header
Shows:
* App name: `Decision Compare`
* Export JSON button
* Import JSON button
#### Project list area
Shows:
* Create project form
* Project cards
Each project card shows:
* Project name
* Description if present
* Number of decisions
* Number of finalized decisions
* Last updated date
* Open button
* Delete button
### Controls
* `Create project`
* `Open project`
* `Delete project`
* `Export JSON`
* `Import JSON`
---
## Route: `/projects/:projectId`
### Purpose
Manage one project and its decisions.
### Layout
Three-column desktop layout:
```txt
┌────────────────────────────────────────────────────────────┐
│ Header                                                     │
├───────────────┬────────────────────────────┬───────────────┤
│ Decisions     │ Current decision review    │ Notes         │
│ sidebar       │ preview                    │ panel         │
└───────────────┴────────────────────────────┴───────────────┘
```
### Left sidebar: Decisions
Shows grouped decision lists:
1. Active
2. Finalized
3. Postponed
4. Archived
Each decision row shows:
* title
* status badge
* number of options
* final marker if finalized
Controls:
* Create decision
* Select decision
* Archive decision
* Postpone decision
* Reactivate decision
* Delete decision
### Center: Current decision preview
If no decision selected:
* Show empty state: `Select or create a decision.`
If decision selected but no options:
* Show empty state: `Upload screenshots for this decision.`
* Show option uploader.
If decision selected with options:
* Show large current option image.
* Show bottom filmstrip.
* Show review controls.
* Show button to enter focused review route.
### Right panel: Notes
Shows for selected decision:
* Decision title input
* Decision description textarea
* Decision notes textarea
* Final rationale textarea
* Current selected final option, if any
* Status controls
---
## Route: `/projects/:projectId/review/:decisionId`
### Purpose
Focused Lightroom-like review mode for one decision.
### Layout
Full-screen app surface:
```txt
┌────────────────────────────────────────────────────────────┐
│ Review toolbar                                             │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Large image viewer                                         │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ Filmstrip thumbnails                                       │
└────────────────────────────────────────────────────────────┘
```
### Review toolbar
Shows:
* Back to project button
* Decision title
* Decision status badge
* Current option count: `2 / 5`
* View mode toggle:
  * Fit width
  * Full image
* Shortcut help button
### Large image viewer
Shows:
* Current option image
* Option name
* Option status badge
* Honest empty state if no option exists
### Filmstrip
Shows all options in the selected decision.
Each thumbnail shows:
* image thumbnail
* option name
* rejected overlay if rejected
* final indicator if final
* current selection outline
### Controls
* Click thumbnail to select option.
* Spacebar to advance.
* Left/right arrows to navigate.
* `R` to reject/restore current option.
* `F` to mark current option final.
* View mode toggle.
* Back button.
---
## 9. Components + the build-as-vertical-slices rule
### Layout components
* `AppShell`
* `Header`
* `EmptyState`
### Project components
* `ProjectList`
* `ProjectCard`
* `CreateProjectForm`
* `ImportExportControls`
### Decision components
* `DecisionSidebar`
* `DecisionListItem`
* `CreateDecisionForm`
* `DecisionStatusBadge`
* `DecisionNotesPanel`
### Option components
* `OptionUploader`
* `OptionFilmstrip`
* `OptionThumbnail`
* `OptionViewer`
* `OptionStatusBadge`
### Review components
* `ReviewWorkspace`
* `ReviewToolbar`
* `KeyboardShortcutHelp`
### Shared components
* `Button`
* `TextInput`
* `Textarea`
* `Modal`
* `FileInput`
Build vertical slices, not horizontal layers. NOT all-models-then-all-components-then-all-pages. YES: feature → complete → review → refine. After each slice, ask the agent to explain its architecture decisions, state flow, and which components own which state.
---
## 10. Interaction rules / keyboard shortcuts / animation
## Interaction rules
### Create project
When user submits project form:
1. Trim name.
2. If name is empty, show validation error.
3. Create project.
4. Set it as current project.
5. Navigate to `/projects/:projectId`.
### Delete project
When user clicks delete:
1. Show confirmation modal.
2. If confirmed:
   * delete project
   * delete all child decisions
   * delete all child options
   * persist state
3. If canceled, do nothing.
### Create decision
When user submits decision form:
1. Trim title.
2. If title is empty, show validation error.
3. Create decision under current project.
4. Select new decision.
5. Show empty option upload state.
### Upload options
When user uploads images:
1. Validate file type.
2. Validate file size.
3. Convert each file to data URL.
4. Create one option per image.
5. If the decision has no current option, select the first uploaded option.
6. Persist state.
### Select option
When user clicks a thumbnail:
1. Set `currentOptionId` to clicked option ID.
2. Keep decision unchanged.
3. Do not change rejected/final status.
### Next option
When user presses Space or ArrowRight:
1. Find current decision.
2. Find current option index in `decision.optionIds`.
3. Move to next option.
4. Wrap to first option after the last option.
### Previous option
When user presses ArrowLeft:
1. Find current decision.
2. Find current option index in `decision.optionIds`.
3. Move to previous option.
4. Wrap to last option before the first option.
### Reject option
When user presses `R` or clicks reject:
* If current option is `active`, set it to `rejected`.
* If current option is `rejected`, restore it to `active`.
* If current option is `final`, do not reject it unless another option is first made final.
* Rejected options remain visible in the filmstrip.
### Mark final
When user presses `F` or clicks mark final:
1. Set every option in the decision to:
   * `final` for the selected option
   * unchanged if already rejected
   * `active` for non-rejected, non-final options
2. Set decision `selectedOptionId`.
3. Set decision status to `finalized`.
4. Set `decidedAt`.
5. Keep the decision visible in the current project, under Finalized.
6. Require final rationale before the decision is considered fully complete in UI.
### Archive decision
When user archives decision:
1. Set status to `archived`.
2. Set `archivedAt`.
3. Keep all options and rationale.
4. Move decision to Archived group.
### Postpone decision
When user postpones decision:
1. Set status to `postponed`.
2. Keep all options and notes.
3. Do not require selected final option.
### Reactivate decision
When user reactivates decision:
1. Set status to `active`.
2. Clear `archivedAt`.
3. Keep selected final option unless user changes it later.
### Edit notes/rationale
When user edits notes or rationale:
1. Update field on blur or debounced change.
2. Persist state.
3. Render line breaks safely as text.
---
## Keyboard shortcuts
Keyboard shortcuts are active only in review surfaces and must not fire while typing in an input, textarea, or editable element.
| Key          | Scope                                                      | Action                               |
| ------------ | ---------------------------------------------------------- | ------------------------------------ |
| `Space`      | Review mode and project preview when option viewer focused | Next option                          |
| `ArrowRight` | Review mode and project preview when option viewer focused | Next option                          |
| `ArrowLeft`  | Review mode and project preview when option viewer focused | Previous option                      |
| `R`          | Review mode                                                | Toggle reject/restore current option |
| `F`          | Review mode                                                | Mark current option as final         |
| `Escape`     | Review mode                                                | Return to project route              |
| `?`          | Review mode                                                | Toggle shortcut help                 |
---
## Animation
Keep motion subtle and utility-focused.
* Thumbnail selection outline transition: `150ms ease-out`
* Rejected overlay fade: `150ms ease-out`
* Final badge appearance: `150ms ease-out`
* Modal open/close: `150ms ease-out`
* Do not animate large image switching by default.
* Do not add complex page transitions.
* Respect `prefers-reduced-motion`.
---
## 11. Anti-abstraction constraints
Optimize for clarity and simplicity over abstraction. Do not create reusable systems until a pattern repeats at least 3 times. Do not add features outside MVP scope. If you think the spec needs to change, ask first — do not "improve" unilaterally.
---
## 12. Doc structure — the three source-of-truth files
The agent must create and maintain:
```txt
docs/
  mvp-spec.md    ← this spec (requirements + constraints)
  build-plan.md  ← the step-by-step build order from section 13
  decisions.md   ← running log of technical/product decisions, dated
```
Standing instruction to give the agent each session:
> Before implementing, read docs/mvp-spec.md and docs/build-plan.md. Implement only the current step. Do not add features outside the MVP.
---
## 13. Exact implementation order
1. **Project setup only**
   * Scaffold Vite + React + TypeScript app.
   * Install Tailwind, Zustand, React Router, Vitest, React Testing Library.
   * Create repo layout.
   * Add domain types.
   * Add Zustand store skeleton with no completed UI features.
   * Add empty routes.
   * Add docs files.
   * Stop.
2. **Local persistence foundation**
   * Implement localStorage load/save.
   * Implement initial empty app state.
   * Implement export envelope type.
   * Add persistence tests.
   * Show honest empty project list.
3. **Project creation and project list**
   * Build `/` route.
   * Create project form.
   * Project cards.
   * Open project navigation.
   * Delete project with confirmation.
   * Tests for create/delete project.
4. **Decision creation and project workspace**
   * Build `/projects/:projectId`.
   * Decision sidebar.
   * Create decision form.
   * Select decision.
   * Group decisions by status.
   * Tests for create/select/update/delete decision.
5. **Image upload and option creation**
   * Build option uploader.
   * Validate image MIME type and file size.
   * Convert images to data URLs.
   * Add options to selected decision.
   * Show first uploaded option.
   * Tests for file validation and option creation.
6. **Large option viewer and filmstrip**
   * Build `OptionViewer`.
   * Build `OptionFilmstrip`.
   * Click thumbnails to switch current option.
   * Show option status badges.
   * Tests for current option state.
7. **Keyboard navigation**
   * Implement Space, ArrowRight, ArrowLeft.
   * Add typing-target guard.
   * Add wraparound behavior.
   * Tests for shortcut behavior and input/textarea exclusion.
8. **Reject and final selection**
   * Implement `R` reject/restore.
   * Implement `F` mark final.
   * Update decision status to finalized.
   * Show finalized decisions separately.
   * Tests for reject/final rules.
9. **Decision notes and final rationale**
   * Build notes panel.
   * Support decision notes and final rationale.
   * Show incomplete finalized decision warning if final rationale is empty.
   * Tests for notes/rationale persistence and safe rendering.
10. **Focused review route**
    * Build `/projects/:projectId/review/:decisionId`.
    * Full review toolbar.
    * Large image viewer.
    * Bottom filmstrip.
    * View mode toggle.
    * Shortcut help.
    * Escape returns to project route.
11. **Archive, postpone, reactivate**
    * Implement archive decision.
    * Implement postpone decision.
    * Implement reactivate decision.
    * Keep data intact.
    * Tests for status transitions.
12. **JSON export/import**
    * Export all app data to JSON.
    * Import replace-only JSON.
    * Validate before replacing state.
    * Reject malformed data.
    * Tests for round-trip fidelity and invalid import safety.
13. **Polish pass**
    * Desktop layout refinement.
    * Tablet-safe responsive behavior.
    * Empty states.
    * Error states.
    * Confirmation modals.
    * Reduced-motion check.
14. **Final regression test pass**
    * Ensure all required tests exist.
    * Run full test suite.
    * Fix failures.
    * Update docs to match live system.
---
## 14. The test suite — define before "done"
The agent must implement regression tests before considering the MVP complete.
### Store/action correctness
Test:
* create project
* update project
* delete project cascades child decisions and options
* create decision
* update decision
* delete decision cascades child options
* add option
* update option
* delete option
* select current project/decision/option
### Review behavior
Test:
* next option advances current option
* previous option goes backward
* next wraps from last to first
* previous wraps from first to last
* clicking thumbnail selects option
* rejected options remain visible
* final option updates decision `selectedOptionId`
* marking final sets decision status to `finalized`
### Keyboard behavior
Test:
* Space triggers next option in review mode
* ArrowRight triggers next option
* ArrowLeft triggers previous option
* `R` toggles reject/restore
* `F` marks final
* shortcuts do not fire while typing in `input`
* shortcuts do not fire while typing in `textarea`
### Persistence
Test:
* state saves to localStorage after action
* state loads from localStorage on startup
* missing localStorage data creates empty state
* corrupted localStorage data falls back to empty state without crashing
### Import/export
Test:
* exported data includes dataVersion
* exported data includes all projects, decisions, and options
* valid exported JSON imports successfully
* import round-trip preserves IDs, references, notes, rationale, image data URLs, statuses, and timestamps
* malformed JSON is rejected
* valid-looking JSON with broken references is rejected
* invalid image MIME values are rejected
* import failure does not modify current state
### Injection resistance
Test:
* text containing `<script>` renders as text
* notes and rationale do not use raw HTML
* imported text fields are treated as plain text
### Data integrity
Test:
* project decision IDs always reference existing decisions
* decision option IDs always reference existing options
* selected final option must belong to the decision
* deleting an option clears `selectedOptionId` if needed
* finalized decision cannot point to missing option
---
## 15. Done = acceptance criteria
The MVP is done only when:
* `docs/mvp-spec.md` exists and reflects the implemented app.
* `docs/build-plan.md` exists and reflects the implemented build order.
* `docs/decisions.md` exists and includes dated technical/product choices.
* Every directory in the repo layout exists or has been intentionally omitted with a documented reason.
* The app launches with no console errors.
* The app shows an honest empty project state with no mock data.
* A user can create a project.
* A user can create multiple decisions inside a project.
* A user can upload multiple screenshots per decision.
* A user can compare options with a large viewer and bottom filmstrip.
* A user can navigate options with Space, ArrowRight, and ArrowLeft.
* A user can reject and restore options with `R`.
* A user can mark an option final with `F`.
* A finalized decision preserves the selected option and rationale.
* A user can archive, postpone, and reactivate decisions.
* A user can export all data as JSON.
* A user can import a previously exported JSON file.
* Invalid imports are rejected without modifying current data.
* All user-generated text is rendered safely as text.
* All required tests are implemented.
* The full test suite passes.
* The app works well on desktop/laptop screens.
* Tablet widths do not break the layout.
* No backend, auth, AI, collaboration, analytics, or Figma integration has been added.
---
## 16. How to invoke the agent — the first message to send
```txt
Read docs/mvp-spec.md and docs/build-plan.md. Implement Step 1 only: scaffold the Vite + React + TypeScript app, install Tailwind, Zustand, React Router, Vitest, and React Testing Library, create the repo layout, add the domain types, add the Zustand store skeleton, add empty routes, and create the docs files. Do not implement project creation, persistence, image upload, review UI, keyboard shortcuts, import/export, archive, or notes yet. Then stop and explain what you built.
```
Per-session loop:
```txt
Before implementing, read docs/mvp-spec.md and docs/build-plan.md. Implement only the current step. Do not add features outside the MVP.
```
