-- Optionist v1 auth & workspace schema (Epics 2, 3, 5, 6)

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  username text unique,
  job_title text,
  onboarding_status text not null default 'not_started'
    check (onboarding_status in ('not_started', 'profile_incomplete', 'onboarding_incomplete', 'complete')),
  default_organization_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid references public.profiles (id) on delete set null,
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_default_organization_id_fkey
  foreign key (default_organization_id) references public.organizations (id) on delete set null;

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner', 'admin', 'member', 'viewer')),
  status text not null default 'active'
    check (status in ('invited', 'active', 'removed')),
  invited_by uuid references public.profiles (id) on delete set null,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  theme text not null default 'system'
    check (theme in ('light', 'dark', 'system')),
  default_view text,
  dismissed_onboarding boolean not null default false,
  email_notifications_enabled boolean not null default true,
  onboarding_data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Phase 2-ready tables (schema only, minimal RLS)
create table public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  role text not null default 'member'
    check (role in ('owner', 'admin', 'member', 'viewer')),
  token text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'expired', 'revoked')),
  invited_by uuid references public.profiles (id) on delete set null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete set null,
  actor_user_id uuid references public.profiles (id) on delete set null,
  event_type text not null,
  event_data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.get_org_role(org_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select m.role
  from public.organization_members m
  where m.organization_id = org_id
    and m.user_id = auth.uid()
    and m.status = 'active'
  limit 1;
$$;

create or replace function public.is_org_admin(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_org_role(org_id) in ('owner', 'admin');
$$;

create or replace function public.shares_org_with(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members mine
    join public.organization_members theirs
      on mine.organization_id = theirs.organization_id
    where mine.user_id = auth.uid()
      and theirs.user_id = target_user_id
      and mine.status = 'active'
      and theirs.status = 'active'
  );
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.user_settings enable row level security;
alter table public.organization_invitations enable row level security;
alter table public.audit_events enable row level security;

-- profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_org_peers"
  on public.profiles for select
  using (public.shares_org_with(id));

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- organizations
create policy "organizations_select_member"
  on public.organizations for select
  using (public.is_org_member(id));

create policy "organizations_update_admin"
  on public.organizations for update
  using (public.is_org_admin(id))
  with check (public.is_org_admin(id));

create policy "organizations_delete_owner"
  on public.organizations for delete
  using (public.get_org_role(id) = 'owner');

-- organization_members
create policy "organization_members_select_member"
  on public.organization_members for select
  using (public.is_org_member(organization_id));

create policy "organization_members_insert_admin"
  on public.organization_members for insert
  with check (public.is_org_admin(organization_id));

create policy "organization_members_update_admin"
  on public.organization_members for update
  using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

create policy "organization_members_delete_admin"
  on public.organization_members for delete
  using (public.is_org_admin(organization_id));

-- user_settings
create policy "user_settings_select_own"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "user_settings_update_own"
  on public.user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- organization_invitations (admin-only for now)
create policy "organization_invitations_select_admin"
  on public.organization_invitations for select
  using (public.is_org_admin(organization_id));

create policy "organization_invitations_insert_admin"
  on public.organization_invitations for insert
  with check (public.is_org_admin(organization_id));

create policy "organization_invitations_update_admin"
  on public.organization_invitations for update
  using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

-- audit_events (owners/admins read org events)
create policy "audit_events_select_admin"
  on public.audit_events for select
  using (
    organization_id is not null
    and public.is_org_admin(organization_id)
  );

create policy "audit_events_insert_authenticated"
  on public.audit_events for insert
  with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- New user provisioning
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  org_name text;
  org_slug text;
  display_name text;
  avatar text;
  initial_status text;
begin
  display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), '')
  );
  avatar := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'picture'), '')
  );

  initial_status := case
    when display_name is null then 'profile_incomplete'
    else 'onboarding_incomplete'
  end;

  org_name := case
    when display_name is not null then display_name || '''s Workspace'
    else 'My Workspace'
  end;

  org_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g'))
    || '-'
    || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);

  insert into public.profiles (id, email, full_name, avatar_url, onboarding_status)
  values (new.id, coalesce(new.email, ''), display_name, avatar, initial_status);

  insert into public.organizations (name, slug, created_by)
  values (org_name, org_slug, new.id)
  returning id into new_org_id;

  insert into public.organization_members (organization_id, user_id, role, status, joined_at)
  values (new_org_id, new.id, 'owner', 'active', now());

  insert into public.user_settings (user_id)
  values (new.id);

  update public.profiles
  set default_organization_id = new_org_id
  where id = new.id;

  insert into public.audit_events (organization_id, actor_user_id, event_type, event_data)
  values (
    new_org_id,
    new.id,
    'profile.created',
    jsonb_build_object('email', new.email)
  );

  insert into public.audit_events (organization_id, actor_user_id, event_type, event_data)
  values (
    new_org_id,
    new.id,
    'organization.created',
    jsonb_build_object('name', org_name)
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
