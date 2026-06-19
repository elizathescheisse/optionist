import type { OrgRole } from "../types/workspace";

export function isOwner(role: OrgRole | null | undefined): boolean {
  return role === "owner";
}

export function isAdmin(role: OrgRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function isMember(role: OrgRole | null | undefined): boolean {
  return role === "member";
}

export function isViewer(role: OrgRole | null | undefined): boolean {
  return role === "viewer";
}

/** Can change org settings and manage members (not assign owner). */
export function canManageOrganization(role: OrgRole | null | undefined): boolean {
  return isAdmin(role);
}

/** Can access normal edit surfaces (not read-only viewer). */
export function canEditWorkspace(role: OrgRole | null | undefined): boolean {
  return role === "owner" || role === "admin" || role === "member";
}

/** Read-only participant. */
export function canOnlyView(role: OrgRole | null | undefined): boolean {
  return role === "viewer";
}

export function canSeeOrgSettings(role: OrgRole | null | undefined): boolean {
  return isAdmin(role);
}
