-- Default new users to light theme instead of system.
-- Backfill any null values (safety; column is NOT NULL today).

alter table public.user_settings
  alter column theme set default 'light';

update public.user_settings
set theme = 'light'
where theme is null;

-- Legacy rows used the old DB default of system before users could choose a preference.
update public.user_settings
set theme = 'light'
where theme = 'system';

-- Ensure handle_new_user explicitly sets light for new rows.
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

  insert into public.user_settings (user_id, theme)
  values (new.id, 'light');

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
