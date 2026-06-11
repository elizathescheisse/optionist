# docs/decisions.md

# Decisions Log

## 2026-06-10 — Added `src/hooks/` directory (deviation from spec layout)

Decision: Added `src/hooks/` (not in the section 5 repo layout) to hold `useReviewKeyboard.ts`.

Rationale: Keyboard navigation is needed by both the project preview (Step 7) and the focused review route (Step 10). A shared React hook is the cleanest home for it; the pure key-resolution logic stays in `utils/keyboard.ts` and is unit-tested independently. Documented here per section 15's requirement to record intentional layout changes.

---

## 2026-06-10 — Core job

Decision: The core job is to help designers compare design options, make decisions, and preserve decision rationale.

Rationale: This keeps the product centered on the durable workflow rather than only the leadership-review use case.

---

## 2026-06-10 — Primary user

Decision: The MVP is for individual product/UX designers.

Rationale: Individual designers can validate the workflow without requiring team accounts, collaboration, or stakeholder permissions.

---

## 2026-06-10 — MVP workflow

Decision: The MVP workflow is: create project → create decisions → upload option screenshots → compare options → reject weak options → choose final option → record rationale.

Rationale: This maps directly to the highest-value design review workflow and can be completed locally.

---

## 2026-06-10 — Desktop-first web app

Decision: The MVP is a desktop-first web app, responsive enough not to break on tablets.

Rationale: Designers usually review screenshots and present design options on laptop/desktop screens. Mobile would add layout complexity without validating the core workflow.

---

## 2026-06-10 — Local-first only

Decision: Store all data in browser localStorage for MVP.

Rationale: This avoids backend, auth, cost, deployment, and privacy complexity while supporting the first validation workflow.

---

## 2026-06-10 — Export/import required

Decision: The MVP must support downloading all app data as JSON and reuploading that JSON later.

Rationale: LocalStorage alone is fragile. Export/import gives the user basic portability and backup without adding a backend.

---

## 2026-06-10 — Replace-only import

Decision: Importing JSON replaces the current app data after validation.

Rationale: Merge logic adds complexity and data-conflict risk. Replace-only is simpler and safer for MVP.

---

## 2026-06-10 — Lightroom-like review model

Decision: The core review interface uses one large image viewer with a bottom filmstrip.

Rationale: This supports fast visual comparison and avoids overbuilding complex side-by-side or presentation layouts.

---

## 2026-06-10 — Keyboard shortcuts

Decision: MVP shortcuts are Space, ArrowLeft, ArrowRight, R, F, Escape, and ?.

Rationale: These support rapid design review without adding unnecessary controls.

---

## 2026-06-10 — No collaboration, AI, or Figma integration

Decision: Collaboration, AI, voting, auth, cloud sync, and Figma integration are out of scope.

Rationale: These are plausible future features but would distract from validating the core compare-decide-preserve workflow.
