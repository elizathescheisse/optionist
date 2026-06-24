-- Optionist work-data write path (PR 2)
--
-- Adds write RLS policies for projects/decisions/options, a helper for
-- checking edit access, and the create_project_with_owner() RPC that inserts
-- a project + its first member in a single atomic transaction.

-- ---------------------------------------------------------------------------
-- RLS helper: can the current user edit this project?
-- ---------------------------------------------------------------------------

create or replace function public.can_edit_project(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.project_members m
    where m.project_id = p_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'editor')
  );
$$;

-- ---------------------------------------------------------------------------
-- projects — write policies
-- ---------------------------------------------------------------------------

-- Any internal org member (owner/admin/member) may create a project.
-- Org viewers cannot.
create policy "projects_insert_org_members"
  on public.projects for insert
  with check (
    public.get_org_role(organization_id) in ('owner', 'admin', 'member')
    and created_by = auth.uid()
  );

-- Project owners and editors may update the project metadata.
create policy "projects_update_editors"
  on public.projects for update
  using (public.can_edit_project(id))
  with check (public.can_edit_project(id));

-- Only project owners may delete a project.
create policy "projects_delete_owners"
  on public.projects for delete
  using (
    exists (
      select 1
      from public.project_members m
      where m.project_id = id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

-- ---------------------------------------------------------------------------
-- project_members — write policies
-- ---------------------------------------------------------------------------

-- Project owners may add members.
create policy "project_members_insert_owners"
  on public.project_members for insert
  with check (
    exists (
      select 1
      from public.project_members m
      where m.project_id = project_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

-- Project owners may remove members.
create policy "project_members_delete_owners"
  on public.project_members for delete
  using (
    exists (
      select 1
      from public.project_members m
      where m.project_id = project_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

-- ---------------------------------------------------------------------------
-- decisions — write policies
-- ---------------------------------------------------------------------------

create policy "decisions_insert_editors"
  on public.decisions for insert
  with check (
    public.can_edit_project(project_id)
    and created_by = auth.uid()
  );

create policy "decisions_update_editors"
  on public.decisions for update
  using (public.can_edit_project(project_id))
  with check (public.can_edit_project(project_id));

create policy "decisions_delete_editors"
  on public.decisions for delete
  using (public.can_edit_project(project_id));

-- ---------------------------------------------------------------------------
-- decision_options — write policies
-- ---------------------------------------------------------------------------

create policy "decision_options_insert_editors"
  on public.decision_options for insert
  with check (
    exists (
      select 1
      from public.decisions d
      where d.id = decision_id
        and public.can_edit_project(d.project_id)
    )
    and created_by = auth.uid()
  );

create policy "decision_options_update_editors"
  on public.decision_options for update
  using (
    exists (
      select 1 from public.decisions d
      where d.id = decision_id
        and public.can_edit_project(d.project_id)
    )
  )
  with check (
    exists (
      select 1 from public.decisions d
      where d.id = decision_id
        and public.can_edit_project(d.project_id)
    )
  );

create policy "decision_options_delete_editors"
  on public.decision_options for delete
  using (
    exists (
      select 1 from public.decisions d
      where d.id = decision_id
        and public.can_edit_project(d.project_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Storage — write policies for decision-assets bucket
-- ---------------------------------------------------------------------------

create policy "decision_assets_insert_org_members"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'decision-assets'
    and public.is_org_member(((storage.foldername(name))[2])::uuid)
  );

create policy "decision_assets_delete_org_members"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'decision-assets'
    and public.is_org_member(((storage.foldername(name))[2])::uuid)
  );

-- ---------------------------------------------------------------------------
-- create_project_with_owner — atomic project creation
--
-- Inserts a project row and immediately adds the caller as owner in
-- project_members, all in one transaction. Accepts a caller-supplied UUID so
-- the client can generate the ID locally (needed for optimistic navigation).
-- ---------------------------------------------------------------------------

create or replace function public.create_project_with_owner(
  p_id uuid,
  p_organization_id uuid,
  p_name text,
  p_description text default '',
  p_visibility text default 'private'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.get_org_role(p_organization_id) not in ('owner', 'admin', 'member') then
    raise exception 'Permission denied: not an eligible org member';
  end if;

  insert into public.projects (id, organization_id, name, description, visibility, created_by)
  values (p_id, p_organization_id, p_name, p_description, p_visibility, auth.uid());

  insert into public.project_members (project_id, user_id, role, added_by)
  values (p_id, auth.uid(), 'owner', auth.uid());

  return p_id;
end;
$$;

grant execute on function public.create_project_with_owner(uuid, uuid, text, text, text) to authenticated;
