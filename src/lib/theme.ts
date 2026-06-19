import { useEffect } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const DEFAULT_THEME_PREFERENCE: ThemePreference = "light";

export const AUTH_THEME_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/auth/callback",
  "/profile/setup",
  "/onboarding",
] as const;

let lastAppliedPreference: ThemePreference = DEFAULT_THEME_PREFERENCE;

export function isAuthThemePath(pathname: string = window.location.pathname): boolean {
  return AUTH_THEME_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function resolveThemePreference(raw?: string | null): ThemePreference {
  if (raw === "light" || raw === "dark" || raw === "system") {
    return raw;
  }
  return DEFAULT_THEME_PREFERENCE;
}

/**
 * The DB previously defaulted to system. Until onboarding is complete, treat that
 * legacy value as light so first-time login lands in light mode.
 */
export function coalesceLegacyDefaultTheme(
  stored: string | null | undefined,
  onboardingComplete: boolean,
): ThemePreference {
  const preference = resolveThemePreference(stored);
  if (preference === "system" && !onboardingComplete) {
    return DEFAULT_THEME_PREFERENCE;
  }
  return preference;
}

export function getSystemIsDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveRenderedTheme(
  preference: ThemePreference,
  systemDark = getSystemIsDark(),
): ResolvedTheme {
  if (preference === "system") {
    return systemDark ? "dark" : "light";
  }
  return preference;
}

export function getLastAppliedPreference(): ThemePreference {
  return lastAppliedPreference;
}

export function isAuthThemeScopeActive(): boolean {
  return document.documentElement.dataset.themeScope === "auth";
}

/** Apply user theme preference to the document (skipped while auth scope is active). */
export function applyAppTheme(preference: ThemePreference): void {
  const resolved = resolveThemePreference(preference);
  lastAppliedPreference = resolved;

  if (isAuthThemeScopeActive()) {
    return;
  }

  const rendered = resolveRenderedTheme(resolved);
  document.documentElement.setAttribute("data-theme", rendered);
}

/** Force light treatment for pre-auth routes without mutating stored preference. */
export function enterAuthThemeScope(): void {
  document.documentElement.dataset.themeScope = "auth";
  document.documentElement.setAttribute("data-theme", "light");
}

/** Restore app theme after leaving an auth route. */
export function exitAuthThemeScope(): void {
  delete document.documentElement.dataset.themeScope;
  applyAppTheme(lastAppliedPreference);
}

/** Boot-time helper: auth paths get forced light before React mounts. */
export function applyThemeForCurrentPath(preference: ThemePreference): void {
  if (isAuthThemePath()) {
    lastAppliedPreference = resolveThemePreference(preference);
    enterAuthThemeScope();
    return;
  }
  applyAppTheme(preference);
}

/** Listen for OS theme changes only when user chose system mode in the app. */
export function useSystemThemeListener(preference: ThemePreference | undefined): void {
  useEffect(() => {
    const resolved = resolveThemePreference(preference);
    if (resolved !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (isAuthThemeScopeActive()) {
        return;
      }
      applyAppTheme("system");
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [preference]);
}
