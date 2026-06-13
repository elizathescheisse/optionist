# Plan: Guided Decision Flow + Layout Restructure

## Context

The current layout scatters related actions across panels without a clear hierarchy. The goal is a four-zone layout with a single responsibility per zone and exactly two primary buttons on screen at all times:

- **Left panel**: navigate between decisions + "Review" (primary)
- **Center**: view the option at full size (no chrome, no buttons)
- **Bar above filmstrip**: option name/status + "Reject" (secondary) + "Mark final" (primary)
- **Right panel**: everything about this decision — upload screenshots, edit title/notes/rationale, Delete/Postpone (both secondary, no primary)
- **Header**: breadcrumb + "View History" (top right, placeholder for Issue #4)

The guided flow: Mark final → Finalize modal (add rationale) → decision looks "decided" in sidebar → when ready, click Review → Session Review modal shows all finalized decisions → done for today.

---

## Layout Changes

### ProjectRoute.tsx — major restructure

**Remove:**
- The center panel header bar (currently shows decision title + "Add screenshots" + "Review" link)
- The action buttons row between viewer and filmstrip

**Add:**
- A single **option actions bar** (`shrink-0`) directly above the filmstrip:
  - Left: current option name + status badge (from OptionViewer's current bottom bar)
  - Right: "Reject/Restore" (secondary) + "Mark final" (primary) — or "Finalized ✓" (disabled) if decision is already finalized

**New center panel structure (top to bottom):**
```
[OptionViewer — flex-1, overflow-hidden]
[OptionActionsBar — shrink-0]   ← new, merges name/status + action buttons
[OptionFilmstrip — shrink-0]
```

**OptionViewer:** Remove the bottom name/status bar it currently renders (that moves to OptionActionsBar).

---

### Right panel — DecisionNotesPanel.tsx

Merge the OptionUploader into the right panel. The right panel now owns:
1. Title (editable, auto-save on blur)
2. Description (editable, auto-save on blur)
3. **OptionUploader** — always visible, compact drop zone style regardless of option count
4. Notes textarea (editable, auto-save on blur)
5. Final rationale textarea (editable, auto-save on blur) — shown always, not just after finalization
6. "Delete" + "Postpone" (both secondary) — no primary buttons

Remove OptionUploader from center panel entirely. The center panel shows an empty state ("Select an option from the filmstrip") if no options have been uploaded yet, directing attention to the right panel.

---

### Left sidebar — DecisionSidebar.tsx

**Replace** the always-visible CreateDecisionForm (text input + Add button) with a **"+" icon button** in the sidebar header. Clicking it opens a small inline form (expand-in-place, not a modal) to type the decision title and press Enter or "Add".

**Add** a **"Review" primary button** (`variant="primary"`) pinned to the bottom of the sidebar. It is:
- Fully active when ≥1 decision is finalized in this project
- Muted/disabled when no decisions are finalized yet (with a tooltip or label "Finalize a decision first")

**Decided visual treatment** for finalized decisions in the list:
- Shown in a "Decided" section below active decisions, visually separated by a subtle divider
- Checkmark prefix, chosen option name as subtitle, muted text colors
- Hover actions: Archive + Delete only (no Postpone)

---

### Header.tsx

Add a **"View History" button** (secondary, top-right) that navigates to `/history` — a stub route for now that renders a "History coming soon" placeholder. This wires the navigation point so it's real when Issue #4 ships.

---

## New Components

### FinalizeDecisionModal.tsx
Triggered when user clicks "Mark final" (or presses F in review route).

- Shows: chosen option thumbnail + name
- Final rationale textarea (pre-populated from `decision.finalRationale`)
- Primary: **"Finalize"** → `markOptionFinal(optionId)` + `updateDecision(decisionId, { finalRationale })` → close
- Secondary: **"Skip for now"** → `markOptionFinal(optionId)` only → close
- Dismiss (×): close without any action

### SessionReviewModal.tsx
Triggered by "Review" primary button in sidebar.

- Lists all finalized decisions in the project
- Each entry: decision title, chosen option thumbnail + name, final rationale (or "No rationale added" placeholder)
- "Done" button closes modal (version/approve concept deferred to Issue #3)

---

## Files to Change

| File | Change |
|------|--------|
| `src/routes/ProjectRoute.tsx` | Remove center header bar; add OptionActionsBar above filmstrip; `handleFinal` opens FinalizeDecisionModal; restructure center panel layout |
| `src/components/options/OptionViewer.tsx` | Remove bottom name/status bar (moves to OptionActionsBar) |
| `src/components/options/OptionActionsBar.tsx` | **New** — option name + status badge + Reject + Mark final |
| `src/components/decisions/DecisionNotesPanel.tsx` | Add OptionUploader; add Final rationale (always visible); keep Delete/Postpone secondary; no primary buttons |
| `src/components/decisions/DecisionSidebar.tsx` | Replace inline form with "+" button; pin "Review" primary at bottom; "Decided" section with divider |
| `src/components/decisions/DecisionListItem.tsx` | Finalized item visual treatment (checkmark, chosen option name, muted) |
| `src/components/decisions/CreateDecisionForm.tsx` | Adapt to inline-expand mode triggered by "+" button |
| `src/components/decisions/FinalizeDecisionModal.tsx` | **New** |
| `src/components/decisions/SessionReviewModal.tsx` | **New** |
| `src/components/layout/Header.tsx` | Add "View History" placeholder button |
| `src/routes/HistoryRoute.tsx` | **New stub** — "History coming soon" |
| `src/App.tsx` | Add `/history` route |
| `src/components/review/ReviewWorkspace.tsx` | `handleFinal` (F key) → opens FinalizeDecisionModal |

---

## What's Deferred

- **Session tracking** ("today's" decisions) — needs data model changes → Issue #3
- **"Approve → becomes a version"** — the "Done" in Session Review just closes for now → Issue #3
- **History view** — HistoryRoute is a stub only → Issue #4
- **Decided decisions disappearing from main panel** — tied to version system → Issue #3/4

---

## Verification

1. `npx vitest run` — 142 tests pass (store logic unchanged)
2. `npm run build` — TypeScript clean
3. `node scripts/make-demo-seed.js && node scripts/screenshot-demo.js <PR#>` — screenshot confirms two primary buttons only (Mark final in center, Review in sidebar)
4. Manual checks:
   - Upload screenshots from right panel drop zone ✓
   - Click "Mark final" → Finalize modal appears ✓
   - "Finalize" → decision moves to Decided section in sidebar ✓
   - "Review" button disabled until a decision is finalized ✓
   - "Review" opens Session Review modal ✓
   - F key in fullscreen review route → Finalize modal ✓
   - Right panel has no primary buttons ✓
   - Center panel is view-only (no upload zone, no stray buttons) ✓
