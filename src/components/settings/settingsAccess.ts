import type { OrgRole } from "../../types/workspace";

export type SettingsAccess =
  | "guest"
  | "user"
  | "workspace-member"
  | "workspace-admin"
  | "workspace-owner";

export type SettingsAccessContext = {
  isGuest: boolean;
  isAuthenticated: boolean;
  role: OrgRole | null;
};

/** Sections visible to guest users when Settings is opened to guests (not active yet). */
export const GUEST_VISIBLE_PATHS = [
  "/settings/theme",
  "/settings/preferences",
  "/settings/design-defaults",
  "/settings/export",
  "/settings/data-privacy",
  "/settings/danger-zone",
] as const;

export function getSettingsAccessContext(
  isGuest: boolean,
  isAuthenticated: boolean,
  role: OrgRole | null,
): SettingsAccessContext {
  return { isGuest, isAuthenticated, role };
}

function meetsAccessRequirement(
  required: SettingsAccess,
  ctx: SettingsAccessContext,
): boolean {
  if (ctx.isGuest) {
    return required === "guest";
  }

  switch (required) {
    case "guest":
      return true;
    case "user":
      return ctx.isAuthenticated;
    case "workspace-member":
      return ctx.isAuthenticated;
    case "workspace-admin":
      return (
        ctx.isAuthenticated &&
        (ctx.role === "owner" || ctx.role === "admin")
      );
    case "workspace-owner":
      return ctx.isAuthenticated && ctx.role === "owner";
    default:
      return false;
  }
}

export function filterNavForAccess<
  T extends { path: string; access: SettingsAccess },
>(items: T[], ctx: SettingsAccessContext): T[] {
  if (!ctx.isGuest) return items;
  return items.filter((item) => meetsAccessRequirement(item.access, ctx));
}
