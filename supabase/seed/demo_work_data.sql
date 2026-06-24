-- Demo seed for the read-path PR. Run this ONCE in the Supabase SQL editor after
-- you've signed in at least once (so your profile + organization exist).
--
-- It runs as the editor/service role, so it bypasses RLS to insert the demo rows,
-- then targets your first organization and its owner automatically. Re-running is
-- safe-ish: it always adds a fresh "Demo project" (delete old ones by hand if they
-- pile up).
--
-- NOTE: the option storage_path values point at files that don't exist yet, so the
-- images won't render until PR 2 adds real uploads. The point of this seed is to
-- prove the projects -> decisions -> options read path loads from the DB.

do $$
declare
  v_org uuid;
  v_user uuid;
  v_project uuid;
  v_decision_a uuid;
  v_decision_b uuid;
  v_opt_1 uuid;
  v_opt_2 uuid;
begin
  select id into v_org from public.organizations order by created_at limit 1;
  if v_org is null then
    raise exception 'No organization found — sign in once before seeding.';
  end if;

  select user_id into v_user
  from public.organization_members
  where organization_id = v_org and role = 'owner' and status = 'active'
  limit 1;

  -- Project (org-visible so it's easy to see; creator is also a project owner).
  insert into public.projects (organization_id, name, description, visibility, created_by)
  values (v_org, 'Demo project', 'Seeded to verify the database read path.', 'organization', v_user)
  returning id into v_project;

  insert into public.project_members (project_id, user_id, role, added_by)
  values (v_project, v_user, 'owner', v_user);

  -- An active decision with two options...
  insert into public.decisions (project_id, title, description, status, created_by)
  values (v_project, 'Choose the dashboard hero layout', 'Two directions to compare.', 'active', v_user)
  returning id into v_decision_a;

  insert into public.decision_options (decision_id, label, storage_path, mime_type, sort_order, created_by)
  values (v_decision_a, 'Option A — split hero',
          'organization/' || v_org || '/project/' || v_project || '/decision/' || v_decision_a || '/option/a.png',
          'image/png', 0, v_user)
  returning id into v_opt_1;

  insert into public.decision_options (decision_id, label, storage_path, mime_type, sort_order, created_by)
  values (v_decision_a, 'Option B — full-bleed hero',
          'organization/' || v_org || '/project/' || v_project || '/decision/' || v_decision_a || '/option/b.png',
          'image/png', 1, v_user)
  returning id into v_opt_2;

  -- ...and a finalized decision, so we can verify final_option_id mapping.
  insert into public.decisions (project_id, title, description, status, final_option_id, final_rationale, finalized_at, finalized_by, created_by)
  values (v_project, 'Pick the settings nav style', 'Decided.', 'finalized', null, 'Sidebar nav tested best.', now(), v_user, v_user)
  returning id into v_decision_b;

  insert into public.decision_options (decision_id, label, storage_path, mime_type, sort_order, created_by)
  values (v_decision_b, 'Sidebar nav',
          'organization/' || v_org || '/project/' || v_project || '/decision/' || v_decision_b || '/option/sidebar.png',
          'image/png', 0, v_user)
  returning id into v_opt_1;

  update public.decisions set final_option_id = v_opt_1 where id = v_decision_b;

  raise notice 'Seeded demo project % for org %', v_project, v_org;
end $$;
