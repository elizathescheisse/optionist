import { getSupabase, isSupabaseConfigured } from "../lib/supabase";
import type {
  OnboardingData,
  OrganizationMember,
  OrganizationWithRole,
  Profile,
  UserSettings,
} from "../types/workspace";

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function fetchUserSettings(userId: string): Promise<UserSettings | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await getSupabase()
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as UserSettings | null;
}

export async function fetchMemberships(userId: string): Promise<OrganizationMember[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await getSupabase()
    .from("organization_members")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active");
  if (error) throw error;
  return (data ?? []) as OrganizationMember[];
}

export async function fetchOrganizationsForUser(
  userId: string,
): Promise<OrganizationWithRole[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await getSupabase()
    .from("organization_members")
    .select("role, organizations (*)")
    .eq("user_id", userId)
    .eq("status", "active");
  if (error) throw error;

  return (data ?? []).flatMap((row) => {
    const org = row.organizations as unknown as OrganizationWithRole | OrganizationWithRole[] | null;
    if (!org) return [];
    const list = Array.isArray(org) ? org : [org];
    return list.map((o) => ({ ...o, role: row.role as OrganizationWithRole["role"] }));
  });
}

export async function updateProfile(
  userId: string,
  patch: Partial<
    Pick<Profile, "full_name" | "avatar_url" | "username" | "job_title" | "onboarding_status" | "default_organization_id">
  >,
): Promise<Profile> {
  const { data, error } = await getSupabase()
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function updateOrganization(
  orgId: string,
  patch: Partial<Pick<OrganizationWithRole, "name">>,
): Promise<void> {
  const { error } = await getSupabase().from("organizations").update(patch).eq("id", orgId);
  if (error) throw error;
}

export async function updateUserSettings(
  userId: string,
  patch: Partial<
    Pick<UserSettings, "theme" | "default_view" | "dismissed_onboarding" | "email_notifications_enabled" | "onboarding_data">
  >,
): Promise<UserSettings> {
  const { data, error } = await getSupabase()
    .from("user_settings")
    .update(patch)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data as UserSettings;
}

export async function completeOnboarding(
  userId: string,
  orgId: string,
  answers: OnboardingData,
  workspaceName?: string,
): Promise<void> {
  if (workspaceName?.trim()) {
    await updateOrganization(orgId, { name: workspaceName.trim() });
  }
  await updateUserSettings(userId, {
    onboarding_data: answers,
    dismissed_onboarding: false,
  });
  await updateProfile(userId, { onboarding_status: "complete" });
}

export async function logAuditEvent(
  organizationId: string,
  actorUserId: string,
  eventType: string,
  eventData: Record<string, unknown> = {},
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await getSupabase().from("audit_events").insert({
    organization_id: organizationId,
    actor_user_id: actorUserId,
    event_type: eventType,
    event_data: eventData,
  });
  if (error) console.error("audit_events insert failed:", error.message);
}
