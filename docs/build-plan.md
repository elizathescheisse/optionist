# docs/build-plan.md

# Build Plan

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
