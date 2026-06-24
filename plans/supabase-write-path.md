# Supabase write path — PR 2

## What + Why

Wire all create/update/delete actions to Supabase so changes made in the app persist to the database. PR 1 loaded data from Supabase; PR 2 makes the app fully live — edits survive a reload and are visible to other org members.

## Changes

- `supabase/migrations/20260624000000_work_data_write_path.sql` — RLS write policies for all four tables, `can_edit_project()` helper, Storage write policies, and `create_project_with_owner` RPC that atomically inserts project + owner membership row
- `src/services/workWrites.ts` — all DB write functions: create/update/delete for projects, decisions, options; Storage upload/signed-URL for option images; `dbMarkOptionFinal`
- `src/store/useAppStore.ts` — dual-mode write actions: in supabase mode each action updates local state synchronously (optimistic) then fires a DB write via `fireAndForget`; `addOption` is async because it must upload to Storage first
- `src/components/options/OptionUploader.tsx` — passes raw `file` to `addOption` and awaits the now-async call
- `src/utils/demoSeed.ts` — updated for async `addOption` using `void .then()` (demo mode never reaches Storage)
- Test files (5) — all `addOption` calls made async to match the new signature
- `supabase/seed/demo_work_data.sql` — fixed org/user lookup to join through `organization_members` so seed targets the same org as the app

## Skipping

- Fully async write actions (most remain optimistic; only `addOption` must await Storage)
- Activity events / audit log — deferred to a later phase
- Soft delete — hard delete for now; undo/recover is a later change

## Verify

- Create a project in the app → clear localStorage → reload → project still appears
- Upload an option image → reload → image loads from Storage (signed URL, not base64)
- Finalize a decision → check Supabase `decisions` table → `final_option_id`, `status: finalized`, `finalized_at` are set
- `npm run build` clean, `npx vitest run` all green (189 tests)
