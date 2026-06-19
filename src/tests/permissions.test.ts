import { describe, expect, it } from "vitest";
import {
  canEditWorkspace,
  canManageOrganization,
  canOnlyView,
  canSeeOrgSettings,
  isAdmin,
  isOwner,
} from "../lib/permissions";

describe("permissions", () => {
  it("owner is admin and can manage org", () => {
    expect(isOwner("owner")).toBe(true);
    expect(isAdmin("owner")).toBe(true);
    expect(canManageOrganization("owner")).toBe(true);
    expect(canSeeOrgSettings("owner")).toBe(true);
  });

  it("admin can manage but is not owner", () => {
    expect(isOwner("admin")).toBe(false);
    expect(canManageOrganization("admin")).toBe(true);
  });

  it("member can edit workspace but not manage org", () => {
    expect(canEditWorkspace("member")).toBe(true);
    expect(canManageOrganization("member")).toBe(false);
    expect(canSeeOrgSettings("member")).toBe(false);
  });

  it("viewer is read-only", () => {
    expect(canOnlyView("viewer")).toBe(true);
    expect(canEditWorkspace("viewer")).toBe(false);
  });
});
