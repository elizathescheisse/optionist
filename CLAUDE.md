# Claude instructions for this project

## How to talk to Eliza

**Explain things at the level of a thoughtful UX designer / product thinker, not a developer.** Eliza reasons fluently about users, product tradeoffs, and design — she is *not* assumed to know code internals or algorithm jargon. The goal is translation, never dumbing down.

- **Lead with what it means** for the user, the product, or the decision — not with the mechanism. Mention the mechanism only if it matters, and only after the plain-language point.
- **Avoid jargon. If a technical term is genuinely unavoidable, define it in one plain sentence right there**, ideally with an everyday analogy.
- **Use concrete examples and analogies** over abstract description.
- **Watch for confusion as a signal.** If Eliza says "I don't understand," the previous explanation was pitched too high — re-explain more simply, don't just restate.
- It's fine to go deeper into mechanics **when she explicitly asks how something works** — match the depth she's asking for, then return to the plain-language default.

---

## HUMAN.md

At the start of each session, read `HUMAN.md`. If a reminder in it is directly relevant to what we're currently doing, surface it quietly at the bottom of your response under a `---` divider. Only surface a reminder when it genuinely applies — not on every response.

---

## Loose threads

Never leave a discussed idea, problem, or decision unresolved without capturing it. Specifically:
- If a discussion reaches a natural "do you want me to file a GitHub issue?" moment and the conversation moves on before confirming, **file the issue anyway** — don't wait for confirmation. An extra issue is easier to close than a lost idea is to recover.
- If multiple topics are in flight and one gets dropped when the user pivots, flag the unresolved thread at the bottom of the next response before it gets lost.
- At the end of a session, if anything was discussed but not captured in a GitHub issue or committed code, call it out explicitly.

**When filing a proactive (unconfirmed) issue:**
1. Prefix the title with `[loose thread]`
2. In the issue body, include what was said and why it wasn't explicitly confirmed

---

## Is this worth it? (internal check before every action)

Before making any change — code, config, or documentation — pause and ask internally:
- Is this necessary right now?
- Does it meaningfully improve the product or the process?
- Could it be batched with related changes rather than committed alone?
- Is this the right time, or does something else need to happen first?

A change that's technically correct but premature, unnecessary, or too granular is still a bad change. This is not a question to ask Eliza — it's a check to run silently before acting.

---

## Before building anything new

Always check whether what's being asked for already exists, partially or fully, before writing any code. Search the codebase for related components, utilities, or patterns first. Building on top of what's there is almost always better than duplicating it.

---

## Dead code

If a refactor, removal, or pivot leaves code that nothing references anymore — unused props, dead functions, leftover imports, unreachable branches — **remove it.** Don't leave it sitting around "in case we need it later."

The one exception: if there's a specific, near-term reason to keep something, leave it with an inline comment:

```ts
// KEEP: needed for the batch-import flow landing in #34
```

Without that comment, it's dead code and goes.

---

## "Is this worth building?"

When Eliza asks whether something is worth doing, treat it as a genuine product design question, not a request for validation. Answer from the perspective of user experience and product quality — not from what Eliza seems to want. It's okay to say "I don't think this serves users well because..." even if she's clearly enthusiastic.

Give a grounded answer:
- **Effort**: rough sense of how much work (one-liner / afternoon / multi-session)
- **Value**: what problem it actually solves and for whom
- **Unlocks / blocks**: does it enable future features, or does something else need to happen first?

Enthusiasm is not useful here. An honest "this is low value for the effort" is more helpful than reflexive encouragement.

---

## Project-specific gotchas

These are non-obvious rules that aren't in the standard docs for any of these tools — they come from decisions made during this project. Read these before touching the relevant files.

- **Zustand selectors must return stable references.** Never call `.map()`, `.filter()`, `Object.values()`, or `.sort()` inside a selector — it creates a new reference on every render and causes infinite loops. Do those transforms in the component body after selecting the raw data.
- **Use `useMatch` not `useParams` in Header.** Header renders inside AppShell which wraps `<Routes>`, so it's outside the Route element tree. `useParams` returns `{}` there. Use `useMatch("/projects/:projectId")` and `useMatch("/projects/:projectId/review/:decisionId")` instead.
- **`key={decisionId}` on DecisionNotesPanel.** The panel has local draft state for its fields. Without the key, switching decisions leaves stale draft values on screen. The key forces a remount when the selected decision changes.
- **Keyboard shortcuts must not fire while typing.** All shortcut handlers check `isTypingTarget()` from `utils/keyboard.ts` before acting. Any new shortcuts must respect this guard.
- **Height chain for the filmstrip.** The filmstrip stays pinned at the bottom via a CSS height chain: `height: 100%` on html/body/#root → `h-full` on AppShell → `overflow-hidden` on main → `flex-1 overflow-hidden` on OptionViewer. Don't change these to `min-h-*` or the filmstrip will scroll off-screen when large images load.

---

## Shorthand commands

### `gh <topic>`
When the user types `gh <topic>` (e.g. `gh add dark mode`, `gh filmstrip flickers on resize`), create a GitHub issue for this project using the `gh` CLI.

- Use the topic as the basis for a clear, concise issue title
- Write a short body describing the problem or request in more detail
- Use appropriate labels if they exist in the repo (bug, enhancement, etc.)
- Confirm the issue URL after creating it

Example: `gh keyboard shortcut for deleting an option` → creates an issue titled something like "Add keyboard shortcut for deleting an option"

---

## GitHub Workflow

### Branching and pull requests

Whenever a new branch is pushed to origin, always open a pull request immediately — do not leave a branch without a PR.

- Create the PR against `main` as the base
- Title should be a short imperative phrase describing the change
- Body should include a Summary (bullet points) and a Test plan (checklist)
- Before creating the PR, run `gh issue list --state open` and include `closes #N` (or `relates to #N`) in the body if the changes relate to any open issue
- Return the PR URL after creating it

### When to nudge about a PR

After 2+ commits on a non-main branch, or when the user says something like "ok that looks good" / "let's move on" / "what's next" — check whether there's an open branch with un-PR'd commits and remind the user. Don't wait to be asked.

### Never manually close issues for unmerged work

Never use `gh issue close` unless the code that resolves it is already in `main`. Put `closes #N` in the PR description — GitHub closes the issue automatically on merge. The one exception: issues that are genuinely invalidated (e.g. the feature was removed), not just "resolved by a pending PR."

### Staying in sync with main

Proactively pull from origin/main whenever there's any reason to think remote might be ahead of local — after a merge, starting a new task, or any gap in conversation. When in doubt, check:

```
git checkout main && git pull
git branch -vv
```

Never start a new branch or commit new work on a stale local main.

**After creating or updating a PR**: at the start of the very next response, silently check if it merged with `gh pr view <N> --json state -q .state`. If merged: pull main and delete the local branch immediately.

### Branch cleanup

Delete local branches as soon as their PR merges — proactively, without being asked. Run `git branch -vv` to spot stale ones (shown as `[origin/...: gone]`). Delete with `git branch -d <name>`.

### Issue labels in use

- `bug` — something is broken
- `enhancement` — new feature or improvement
- `ux` — UI and interaction design
- `someday` — good idea, low priority, revisit later
- `loose-thread` — idea captured from conversation without explicit confirmation
