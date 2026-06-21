# Claude instructions for this project

## How to talk to Eliza

**Explain things at the level of a thoughtful UX designer / product thinker, not a developer.** Eliza reasons fluently about users, product tradeoffs, and design — she is *not* assumed to know code internals or algorithm jargon. The goal is translation, never dumbing down.

- **Lead with what it means** for the user, the product, or the decision — not with the mechanism. Mention the mechanism only if it matters, and only after the plain-language point.
- **Avoid jargon. If a technical term is genuinely unavoidable, define it in one plain sentence right there**, ideally with an everyday analogy.
- **Use concrete examples and analogies** over abstract description.
- **Watch for confusion as a signal.** If Eliza says "I don't understand," the previous explanation was pitched too high — re-explain more simply, don't just restate.
- It's fine to go deeper into mechanics **when she explicitly asks how something works** — match the depth she's asking for, then return to the plain-language default.
- **Lead with mechanism, not verdict.** "It can cause conflicts" is not an explanation. Show the specific failure: what breaks, how, and why it matters. Eliza can't act on a warning label — she needs the causal chain.
- **Always place new information on the map first.** Before introducing a detail, answer: where does this live, where did it come from, how does it connect to what Eliza already knows? Detail without location doesn't land.

---

## Helping Eliza stay close to the code

Eliza is working to close the gap between product/design thinking and engineering awareness. These habits help her build a mental model of what's actually being built.

**When creating a new file:** give one sentence answering "what is this thing's job, and why does it live here instead of somewhere else?"

**When making a change:** give 1–2 sentences on what got added, what got removed, and confirm it matches the reason given.

**After building something:** answer "what would break if we deleted this?" — name the specific things that depend on it. This is how Eliza builds a map of how pieces connect.

**When opening a PR:** remind Eliza to look at the diff, and ask her 1–2 questions to check understanding — not about syntax, but about job and consequence. For example: "For this file in this PR — what's its job, who calls it, and what would break without it?"

---

## Plans

Plans should be short enough that Eliza will actually read them. The goal is a decision record, not a spec document.

**Format:**
- **What + Why** — 2–3 sentences max. What are we building and what problem does it solve?
- **Changes** — a short bulleted list: file name + one-line description of what changes. No code snippets, no prose explaining how it works.
- **Skipping** — only include this section if there's a real deliberate decision worth flagging (e.g. "not doing X because Y"). Max 3–4 items, inline not a table.
- **Verify** — 2–3 bullets on how to confirm it worked.

**Rules:**
- No code snippets in plans. Those belong in implementation.
- Don't repeat context already established in conversation.
- If a plan is getting long, it's a sign the scope is too big — split it, or cut what isn't essential for Eliza to approve.
- The plan exists so Eliza can say yes or no with confidence. If she can't read it, it isn't working.

---

## HUMAN.md

At the start of each session, read `HUMAN.md`. If a reminder in it is directly relevant to what we're currently doing, surface it quietly at the bottom of your response under a `---` divider. Only surface a reminder when it genuinely applies — not on every response.

---

## Loose threads

Two goals in tension: **never lose Eliza's thinking**, and **never take an unrequested action on her behalf.** Which way to lean depends on *who raised it* and *whether it captures her work or changes the product/process.*

**Capture proactively — don't wait for a second yes.** Here, losing the thought is the worse outcome, and an unwanted issue is one click to close.
- If Eliza flags something as possibly issue-worthy ("should we file this?", "this might be a bug"), that *is* the go-ahead. File it. Don't reply "want me to file it?" and wait — she has likely already moved on and won't see the question, and the idea dies. Her raising it already counts as "yes."
- If a problem gets real thinking — you and Eliza reason through or plan something substantial — and she gets pulled away before it's captured, file that thinking as a GitHub issue so she can return to it. Don't let invested work evaporate.
- Prefix `[loose thread]` when it wasn't fully fleshed out, so she can tell at a glance which issues are speculative and prune them.

**Wait for an explicit yes — silence is not consent.** Here, acting unbidden is the violation.
- If *you* propose an action Eliza didn't ask for — a new rule, a refactor, a feature, a config change — and she doesn't answer, that is a **no**. She may reasonably assume you wouldn't act unprompted. Do not do it. Re-surface it later if it still matters.

The dividing line: **capturing her ideas or work → act; changing the product or process on your own initiative → ask first, and wait.**

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

## Tests for new code

When you add or change code, write a test for it **if it encodes a behavior or a deliberate decision** — a toggle, a guard, a grouping/sorting rule, a validation, a default value, a permission check. The test must fail if the decision is reverted. This is the only thing that reliably stops a deliberate decision from being silently flattened by a later PR that rewrites the same file — a doc note can't, because it doesn't turn a check red.

**Skip** tests for purely presentational changes (colors, spacing, icon swaps, static copy). Asserting on CSS classes is brittle, cries wolf on every refactor, and protects nothing real.

Tests live in `src/tests/` (Vitest + Testing Library). Run `npx vitest run` before opening a PR.

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

## Plans

When a plan is made for work to be implemented in this project, save it as a markdown file in the `plans/` folder at the project root. Use a descriptive kebab-case filename (e.g. `plans/add-keyboard-shortcuts.md`). Keep plans there even after the work is done — they're a useful record of decisions.

---

## Shorthand commands

### `pb <prompt>`
When the user types `pb <prompt>`, append a new bullet point to `docs/PromptsBacklog.md` with the prompt text exactly as written. Confirm what was added. Do not act on the prompt — just save it for later.

At the start of each session, if `docs/PromptsBacklog.md` has items in it, quietly mention it so Eliza knows there are queued prompts to work through.

---

### `gh <topic>`
When the user types `gh <topic>` (e.g. `gh add dark mode`, `gh filmstrip flickers on resize`), create a GitHub issue for this project using the `gh` CLI.

- Use the topic as the basis for a clear, concise issue title
- Write a short body describing the problem or request in more detail
- Use appropriate labels if they exist in the repo (bug, enhancement, etc.)
- Confirm the issue URL after creating it

Example: `gh keyboard shortcut for deleting an option` → creates an issue titled something like "Add keyboard shortcut for deleting an option"

---

## GitHub Workflow

### Pre-PR screenshot

Before opening every PR, take a screenshot of the app with demo data and save it to `screenshots/`:

```bash
node scripts/make-demo-seed.js          # writes public/seed.json from demodata/
node scripts/screenshot-demo.js <pr-n>  # saves screenshots/YYYY-MM-DD-pr<N>.jpg
```

The screenshot script launches a headless browser, clears localStorage, reloads the app (which picks up seed.json), navigates into the demo project, selects the first decision, and saves the result. Commit the screenshot as part of the same PR branch.

Also run `npm run build` before every PR to catch TypeScript errors before Vercel does.

### Branching and pull requests

**Never commit directly to `main`.** Every change — no matter how small — goes on a new branch first. Create the branch before writing any code or making any edits. The pattern is always: `git checkout -b <branch-name>` → make changes → commit → push → open PR.

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
