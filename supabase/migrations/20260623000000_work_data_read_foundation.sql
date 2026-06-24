-- Optionist work-data foundation (PR 1: read path)
--
-- Moves the core work — projects, decisions, options — into the database,
-- org-owned and private by default. This migration creates the tables, the
-- read-only RLS policies, and the private Storage bucket for option images.
-- Write policies and atomic invariant functions land in PR 2.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  description text,
  visibility text not null default 'private'
    check (visibility in ('private', 'organization')),
  created_by uuid not null references public.profiles (id) on delete restrict,
  -- Reserved for a future soft-delete (trash + undo). Unused in PR 1 (hard delete).
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_org_updated_idx on public.projects (organization_id, updated_at desc);
create index projects_org_visibility_idx on public.projects (organization_id, visibility);

create table public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'viewer'
    check (role in ('owner', 'editor', 'reviewer', 'viewer')),
  added_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create index project_members_user_idx on public.project_members (user_id);

create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  description text,
  working_notes text,
  status text not null default 'active'
    check (status in ('active', 'finalized', 'postponed')),
  -- FK to decision_options added below, once that table exists (circular ref).
  final_option_id uuid,
  final_rationale text,
  finalized_at timestamptz,
  finalized_by uuid references public.profiles (id) on delete set null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index decisions_project_status_idx on public.decisions (project_id, status, updated_at desc);

create table public.decision_options (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references public.decisions (id) on delete cascade,
  label text,
  storage_path text not null,
  original_filename text,
  mime_type text,
  file_size_bytes bigint,
  sort_order integer not null default 0,
  -- "final" is NOT a status here — it's decisions.final_option_id pointing at a row.
  status text not null default 'active'
    check (status in ('active', 'rejected')),
  rejection_reason text,
  rejected_at timestamptz,
  rejected_by uuid references public.profiles (id) on delete set null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (decision_id, sort_order)
);

create index decision_options_decision_idx on public.decision_options (decision_id, sort_order);

-- Circular reference: a decision's chosen option. The "must belong to the same
-- decision" invariant is enforced in PR 2's write functions, alongside the other
-- guards (always >= 1 owner, rejected can't be final).
alter table public.decisions
  add constraint decisions_final_option_id_fkey
  foreign key (final_option_id) references public.decision_options (id) on delete set null;

-- ---------------------------------------------------------------------------
-- updated_at triggers (reuse the existing set_updated_at() from the auth migration)
-- ---------------------------------------------------------------------------

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger decisions_set_updated_at
  before update on public.decisions
  for each row execute function public.set_updated_at();

create trigger decision_options_set_updated_at
  before update on public.decision_options
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS helpers (SECURITY DEFINER so policies don't recurse on the same tables)
-- ---------------------------------------------------------------------------

-- Direct membership of a specific project.
create or replace function public.is_project_member(p_id uuid)
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
  );
$$;

-- Can the current user READ this project? They can if they're a direct project
-- member, OR the project is org-visible AND they are an *internal* org member
-- (owner/admin/member). Org viewers/guests do not auto-see org-visible projects.
create or replace function public.can_read_project(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects pr
    where pr.id = p_id
      and (
        public.is_project_member(p_id)
        or (
          pr.visibility = 'organization'
          and public.get_org_role(pr.organization_id) in ('owner', 'admin', 'member')
        )
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS + read policies (writes come in PR 2)
-- ---------------------------------------------------------------------------

alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.decisions enable row level security;
alter table public.decision_options enable row level security;

create policy "projects_select_readable"
  on public.projects for select
  using (public.can_read_project(id));

create policy "project_members_select_readable"
  on public.project_members for select
  using (public.can_read_project(project_id));

create policy "decisions_select_readable"
  on public.decisions for select
  using (public.can_read_project(project_id));

create policy "decision_options_select_readable"
  on public.decision_options for select
  using (
    exists (
      select 1
      from public.decisions d
      where d.id = decision_id
        and public.can_read_project(d.project_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: private bucket for option images
-- ---------------------------------------------------------------------------
-- Path convention: organization/{org_id}/project/{project_id}/decision/{decision_id}/option/{option_id}/{filename}
-- So (storage.foldername(name))[2] is the org id. Authenticated org members can
-- read; anonymous share-link access (PR 4) goes through signed URLs from an Edge
-- Function, never a broad anon policy.

insert into storage.buckets (id, name, public)
values ('decision-assets', 'decision-assets', false)
on conflict (id) do nothing;

create policy "decision_assets_read_org_members"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'decision-assets'
    and public.is_org_member(((storage.foldername(name))[2])::uuid)
  );

-- ---------------------------------------------------------------------------
-- Grants (new tables aren't covered by the earlier blanket grant)
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.project_members to authenticated;
grant select, insert, update, delete on public.decisions to authenticated;
grant select, insert, update, delete on public.decision_options to authenticated;
