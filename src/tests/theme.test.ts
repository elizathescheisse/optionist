import { beforeEach, describe, expect, it } from "vitest";
import {
  applyAppTheme,
  AUTH_THEME_PATHS,
  coalesceLegacyDefaultTheme,
  DEFAULT_THEME_PREFERENCE,
  enterAuthThemeScope,
  exitAuthThemeScope,
  isAuthThemePath,
  resolveRenderedTheme,
  resolveThemePreference,
} from "../lib/theme";

describe("resolveThemePreference", () => {
  it("returns light for missing or invalid values", () => {
    expect(resolveThemePreference(null)).toBe("light");
    expect(resolveThemePreference(undefined)).toBe("light");
    expect(resolveThemePreference("")).toBe("light");
    expect(resolveThemePreference("invalid")).toBe("light");
  });

  it("returns valid preferences unchanged", () => {
    expect(resolveThemePreference("light")).toBe("light");
    expect(resolveThemePreference("dark")).toBe("dark");
    expect(resolveThemePreference("system")).toBe("system");
  });

  it("defaults to light", () => {
    expect(DEFAULT_THEME_PREFERENCE).toBe("light");
  });
});

describe("resolveRenderedTheme", () => {
  it("passes through light and dark", () => {
    expect(resolveRenderedTheme("light", true)).toBe("light");
    expect(resolveRenderedTheme("dark", false)).toBe("dark");
  });

  it("follows system preference only when preference is system", () => {
    expect(resolveRenderedTheme("system", true)).toBe("dark");
    expect(resolveRenderedTheme("system", false)).toBe("light");
  });
});

describe("coalesceLegacyDefaultTheme", () => {
  it("maps legacy system default to light before onboarding completes", () => {
    expect(coalesceLegacyDefaultTheme("system", false)).toBe("light");
  });

  it("keeps system after onboarding when explicitly chosen", () => {
    expect(coalesceLegacyDefaultTheme("system", true)).toBe("system");
  });
});

describe("isAuthThemePath", () => {
  it("matches all auth routes", () => {
    for (const path of AUTH_THEME_PATHS) {
      expect(isAuthThemePath(path)).toBe(true);
    }
  });

  it("does not match app routes", () => {
    expect(isAuthThemePath("/dashboard")).toBe(false);
    expect(isAuthThemePath("/projects")).toBe(false);
    expect(isAuthThemePath("/settings")).toBe(false);
  });
});

describe("auth theme scope", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
    });
    document.documentElement.removeAttribute("data-theme");
    delete document.documentElement.dataset.themeScope;
  });

  it("forces light on document without changing stored preference after exit", () => {
    applyAppTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    enterAuthThemeScope();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.dataset.themeScope).toBe("auth");

    applyAppTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    exitAuthThemeScope();
    expect(document.documentElement.dataset.themeScope).toBeUndefined();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
