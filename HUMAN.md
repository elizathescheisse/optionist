# HUMAN.md — Reminders for Eliza

> Claude reads this at the start of each session. When a reminder is directly relevant to what we're doing, Claude surfaces it quietly at the bottom of the response under a `---` divider. Not on every response — only when it genuinely applies.
>
> Add to this file whenever something comes up that you want to remember later but know you'll forget.

---

## Active reminders

- **Merge the sticky-filmstrip PR (#11)** when you're happy with it — it's open but not merged into main yet.

- **Issue #6 (sidebar hover actions feel cramped)** — don't make the sidebar interaction worse in the meantime. Any sidebar work should move toward a less jumpy, more stable hover pattern, not away from it.

- **The filmstrip height chain is fragile.** It relies on `height: 100%` on html/body/#root + `h-full` on AppShell + `overflow-hidden` on main. If the filmstrip ever starts scrolling off-screen again, check that none of these got changed to `min-h-*`.

- **Issue #1 (rejected options should be skipped when cycling)** is filed but not implemented. If keyboard navigation feels off during testing, this is probably why.
