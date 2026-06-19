import { describe, it, expect } from "vitest";
import {
  filterNavForAccess,
  getSettingsAccessContext,
} from "../components/settings/settingsAccess";
import { ALL_SETTINGS_PATHS, SETTINGS_NAV } from "../components/settings/settingsNavConfig";

describe("settings nav config", () => {
  it("defines a route for each settings section", () => {
    expect(ALL_SETTINGS_PATHS).toHaveLength(17);
    expect(ALL_SETTINGS_PATHS).toContain("/settings/profile");
    expect(ALL_SETTINGS_PATHS).toContain("/settings/theme");
    expect(ALL_SETTINGS_PATHS).toContain("/settings/danger-zone");
  });
});

describe("settings access filtering", () => {
  const allItems = SETTINGS_NAV.flatMap((g) => g.items);

  it("shows all nav items for authenticated users", () => {
    const ctx = getSettingsAccessContext(false, true, "owner");
    expect(filterNavForAccess(allItems, ctx)).toHaveLength(allItems.length);
  });

  it("filters nav to guest-visible sections for guest users", () => {
    const ctx = getSettingsAccessContext(true, false, null);
    const filtered = filterNavForAccess(allItems, ctx);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((item) => item.access === "guest")).toBe(true);
  });
});
