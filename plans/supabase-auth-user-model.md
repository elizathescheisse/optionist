# Supabase Auth & User Model — Decision Record

GitHub parent epic: **#88**

Supabase project: `kogremaqbwrkktemfcim` (optionist)

## What + Why

Replace demo auth (`useAuthStore` localStorage gate) with real Supabase Auth and an organization-first user model. Solo users get a default workspace today; collaboration, invites, and shared projects attach to organizations later without reworking ownership.

## Access hierarchy (v1)

```
User
  → belongs to one or more Organizations (with role)
  → creates Projects inside an Organization
  → compares Options inside Projects
```

Teams (Organization → Teams → Team Members) are **designed, not built** in v1.

## Schema (initial)

| Table | Purpose |
|-------|---------|
| `auth.users` | Supabase-owned identity |
| `profiles` | App profile (display name, avatar, onboarding, default org) |
| `organizations` | Workspace container |
| `organization_members` | Role-based membership |
| `user_settings` | Theme, notifications, onboarding flags |
| `organization_invitations` | Invite flow (Phase 2) |
| `audit_events` | Admin/debug history (Phase 2) |

### Roles

`owner` · `admin` · `member` · `viewer`

### Membership statuses

`invited` · `active` · `removed`

### Auth providers (v1)

Email/password, Google, Facebook, Apple. Login UI priority: Google → Apple → Facebook → Email.

One app profile per Supabase auth user. Identity linking by email across providers.

## V1 release cut

Epics **#90–#95, #100** (Auth, Profile, Organization, Login UI, RLS, Settings, App Shell)

## Phase 2

Epics **#96–#99, #101** (Invitations, Admin, Account, Audit, Teams future-proofing)

## Build order

1. Configure Supabase Auth providers
2. Create profiles, organizations, organization_members, user_settings
3. Enable RLS and write policies
4. Trigger/function: profile on auth signup
5. Onboarding function: default organization
6. Login/signup UI
7. Protected route/session handling
8. App shell user/org loader
9. Organization switcher
10. Basic account/settings screens
11. Invitations/admin members
12. Audit events

## Epics & stories

| Epic | Issue | Phase | Stories |
|------|-------|-------|---------|
| Supabase Auth Foundation | #90 | V1 | #102, #103, #104 |
| Account Creation & Profile Provisioning | #91 | V1 | #105–#108 |
| Organization Workspace Foundation | #92 | V1 | #109–#112 |
| Login and Signup UI | #93 | V1 | #113–#116 |
| Row Level Security & Access Control | #94 | V1 | #117–#120 |
| User Settings and Preferences | #95 | V1 | #121–#123 |
| Organization Invitations | #96 | Phase 2 | #124–#126 |
| Admin User Management | #97 | Phase 2 | #127–#130 |
| Account Management | #98 | Phase 2 | #131–#134 |
| Audit, Observability, and Safety | #99 | Phase 2 | #135–#137 |
| App Shell Authorization | #100 | V1 | #138–#140 |
| Future-Proofing for Teams | #101 | Phase 2 | #141, #142 |

## Related issues

- **#73** — shared multi-user projects (blocked by this work)
- **#69** — guest mode stays independent (local-first, no account)
- **#68** — onboarding answers (Epic 6 / profile completion)
- **#75** — flexible hierarchy (coordinate with Epic 12)
- **#77** — app cohesion (sidebar shell before/parallel with app shell auth)

## Skipping (v1)

- Deep teams UX
- Client-side account deletion (server-side/admin path only)
- Full invitation email flow until Phase 2

## Verify (when implementing)

- RLS enabled on every public table before shipping
- Default org created for every new user
- Demo `useAuthStore` login replaced by Supabase session
- Guest mode (#69) unchanged
