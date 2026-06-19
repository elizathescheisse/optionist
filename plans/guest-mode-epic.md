# Guest Mode / Local-Only Trial Experience — Decision Record

GitHub parent epic: **#69**

## What + Why

Allow users to enter Optionist without signing up or logging in, create temporary local projects and decisions, and experience core product value before creating an account. Guest work lives in browser storage only (localStorage + IndexedDB). Users can later convert to a real account and migrate local work into their Supabase-backed workspace.

## Product principles

1. **No-account entry** — Continue as Guest; no name, email, password, OAuth, or onboarding form.
2. **Local-only storage** — localStorage for session metadata; IndexedDB for projects, decisions, uploads.
3. **Clear temporary-data messaging** — work is device-only; create an account to save and sync.
4. **Upgrade path** — Save my work → signup → migration (Phase 2 full import).

## Guest data model

Do not create fake Supabase users. App-level guest session in localStorage:

```
guest_session
- guestSessionId (local uuid)
- createdAt
- lastActiveAt
- storageVersion
- hasSeenGuestNotice
```

Guest entities use local IDs. On migration, map `local_*` → Supabase IDs.

Domain vocabulary: **Project → Decision → Option** (not comparison sessions).

## V1 release cut

Ship first:

- Guest entry (#149)
- Guest session + local storage (#150)
- Guest app experience + limits (#151)
- Identity state machine (#155)
- Guest data controls — clear + recovery (#152)
- Save-work CTA + preserve data + migration detection (#153 stories #166–#167)

## Phase 2

- Full migration review + Supabase import (#153 stories #168–#171) — **blocked until project/decision cloud schema exists**
- Analytics (#154)
- Optional JSON export (#180)

## Verification

Run alongside implementation: #156 (#183–#186)

## Build order

1. Add guest identity state (#155)
2. Add Continue as Guest (#149)
3. Create guest session locally (#149)
4. Build guest storage adapter (#150)
5. Route project/decision creation through local adapter when guest (#150)
6. Add guest app shell label and local-only notice (#151)
7. Add guest limits (#151)
8. Add Save my work CTA (#153)
9. Add post-signup migration detection (#153)
10. Build migration review and import flow (Phase 2)
11. Add guest data clearing (#152)
12. QA OAuth redirects, refreshes, storage errors (#156)

## Epics & stories

| Epic | Issue | Phase | Stories |
|------|-------|-------|---------|
| Guest Entry Point | #149 | V1 | #157, #158, #159 |
| Local Storage Architecture | #150 | V1 | #161–#165 |
| Guest App Experience | #151 | V1 | #160, #172–#174 |
| Convert Guest to Account | #153 | V1 partial / Phase 2 full | #166–#171 |
| Guest/Auth State Management | #155 | V1 | #175–#177 |
| Guest Data Controls | #152 | V1 + someday | #178–#180 |
| Guest Analytics and Conversion Signals | #154 | Phase 2 | #181, #182 |
| QA, Security, and Browser Behavior | #156 | Verification | #183–#186 |

## Related issues

- **#88** — Supabase auth foundation (parallel; guest bypasses Supabase until migration)
- **#73** — shared multi-user projects (future; guest stays local-first)
- **#81** — comparisons module (deferred; guest uses Decision flow)

## Skipping (v1)

- Full Supabase migration before project/decision tables exist
- Analytics funnel (#154)
- JSON export (#180)
- Fake Supabase guest users

## Verify (when implementing)

- Guest mode never writes to Supabase except migration flow
- Guest and authenticated data namespaces stay separate
- Refresh restores guest session and local work
- Signup/OAuth preserves guest data until user chooses migrate/discard/keep
