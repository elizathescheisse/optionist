import { create } from "zustand";
import { isSupabaseConfigured } from "../lib/supabase";
import {
  fetchOrganizationsForUser,
  fetchProfile,
  fetchUserSettings,
  updateProfile,
  updateUserSettings,
} from "../services/workspace";
import type {
  OnboardingData,
  OrganizationWithRole,
  Profile,
  UserSettings,
} from "../types/workspace";
import { getItem, STORAGE_KEYS } from "../services/storage";
import type { OnboardingAnswers } from "./useAuthStore";

type WorkspaceStatus = "idle" | "loading" | "ready" | "error";

type WorkspaceStore = {
  status: WorkspaceStatus;
  error: string | null;
  profile: Profile | null;
  settings: UserSettings | null;
  organizations: OrganizationWithRole[];
  currentOrganizationId: string | null;
  currentRole: OrganizationWithRole["role"] | null;
  load: (userId: string) => Promise<void>;
  reset: () => void;
  setCurrentOrganization: (orgId: string) => void;
  refreshProfile: (userId: string) => Promise<void>;
  saveProfile: (
    userId: string,
    patch: Partial<Pick<Profile, "full_name" | "avatar_url" | "job_title" | "onboarding_status">>,
  ) => Promise<void>;
  saveSettings: (
    userId: string,
    patch: Partial<Pick<UserSettings, "theme" | "onboarding_data" | "dismissed_onboarding">>,
  ) => Promise<void>;
  /** Demo/local fallback when Supabase is not configured. */
  hydrateDemo: () => void;
};

function applyTheme(theme: "light" | "dark" | "system") {
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  document.documentElement.setAttribute("data-theme", resolved);
}

function demoOnboarding(): OnboardingData | null {
  const answers = getItem<OnboardingAnswers>(STORAGE_KEYS.onboarding);
  if (!answers) return null;
  return {
    role: answers.role,
    useCase: answers.useCase,
    audience: answers.audience,
    decisionStyle: answers.decisionStyle,
    workspaceName: answers.workspaceName,
    comparingFirst: answers.comparingFirst,
    completedAt: answers.completedAt,
  };
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  status: "idle",
  error: null,
  profile: null,
  settings: null,
  organizations: [],
  currentOrganizationId: null,
  currentRole: null,

  reset: () =>
    set({
      status: "idle",
      error: null,
      profile: null,
      settings: null,
      organizations: [],
      currentOrganizationId: null,
      currentRole: null,
    }),

  hydrateDemo: () => {
    const onboarding = demoOnboarding();
    set({
      status: "ready",
      profile: null,
      settings: null,
      organizations: [],
      currentOrganizationId: null,
      currentRole: null,
    });
    if (onboarding?.workspaceName) {
      // Demo workspace name shown via auth store onboarding — no org record.
    }
  },

  load: async (userId) => {
    if (!isSupabaseConfigured) {
      get().hydrateDemo();
      return;
    }

    set({ status: "loading", error: null });
    try {
      const [profile, settings, organizations] = await Promise.all([
        fetchProfile(userId),
        fetchUserSettings(userId),
        fetchOrganizationsForUser(userId),
      ]);

      const defaultOrgId =
        profile?.default_organization_id ??
        organizations[0]?.id ??
        null;
      const current = organizations.find((o) => o.id === defaultOrgId) ?? organizations[0] ?? null;

      if (settings?.theme) applyTheme(settings.theme);

      set({
        status: "ready",
        profile,
        settings,
        organizations,
        currentOrganizationId: current?.id ?? null,
        currentRole: current?.role ?? null,
      });
    } catch (err) {
      set({
        status: "error",
        error: err instanceof Error ? err.message : "Failed to load workspace",
      });
    }
  },

  setCurrentOrganization: (orgId) => {
    const org = get().organizations.find((o) => o.id === orgId);
    if (!org) return;
    set({ currentOrganizationId: org.id, currentRole: org.role });
    const userId = get().profile?.id;
    if (userId && isSupabaseConfigured) {
      void updateProfile(userId, { default_organization_id: orgId });
    }
  },

  refreshProfile: async (userId) => {
    const profile = await fetchProfile(userId);
    set({ profile });
  },

  saveProfile: async (userId, patch) => {
    const profile = await updateProfile(userId, patch);
    set({ profile });
  },

  saveSettings: async (userId, patch) => {
    const settings = await updateUserSettings(userId, patch);
    if (patch.theme) applyTheme(patch.theme);
    set({ settings });
  },
}));

export function currentOrganization(state: WorkspaceStore): OrganizationWithRole | null {
  if (!state.currentOrganizationId) return null;
  return state.organizations.find((o) => o.id === state.currentOrganizationId) ?? null;
}
