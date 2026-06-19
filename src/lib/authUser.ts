import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { AuthUser } from "../store/useAuthStore";

/** Map Supabase auth user → app AuthUser (provider-agnostic). */
export function mapSupabaseUser(user: SupabaseUser): AuthUser {
  const meta = user.user_metadata ?? {};
  const name =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    undefined;

  return {
    id: user.id,
    email: user.email ?? "",
    name,
    avatarUrl:
      (typeof meta.avatar_url === "string" && meta.avatar_url) ||
      (typeof meta.picture === "string" && meta.picture) ||
      undefined,
  };
}
