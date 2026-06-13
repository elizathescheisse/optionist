import { create } from "zustand";
import type { CompareMode } from "../types/domain";
import { getItem, setItem, removeItem, STORAGE_KEYS } from "../services/storage";

export type AuthUser = {
  email: string;
  name?: string;
};

export type OnboardingAnswers = {
  role: string;
  useCase: string;
  audience: string;
  decisionStyle: string;
  workspaceName: string;
  comparingFirst?: string;
  completedAt: string;
};

export type AppSettings = {
  theme: "light" | "dark" | "system";
  name?: string;
  density?: "comfortable" | "compact";
  defaultCompareView?: CompareMode;
  reduceMotion?: boolean;
  presentationDefaults?: {
    showRecommendation: boolean;
    hideNotes: boolean;
    showExecutiveSummary: boolean;
  };
  notifications?: {
    emailDigest: boolean;
    decisionReminders: boolean;
    feedbackAlerts: boolean;
  };
  workflow?: {
    requireRationale: boolean;
    warnOnUndecided: boolean;
  };
};

type AuthStore = {
  user: AuthUser | null;
  onboarding: OnboardingAnswers | null;
  settings: AppSettings;
  isAuthenticated: () => boolean;
  login: (email: string, password: string) => boolean;
  loginFromOnboarding: (answers: OnboardingAnswers) => void;
  logout: () => void;
  setOnboarding: (answers: OnboardingAnswers) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  hydrate: () => void;
};

function loadAuth(): AuthUser | null {
  return getItem<AuthUser>(STORAGE_KEYS.auth);
}

function loadOnboarding(): OnboardingAnswers | null {
  return getItem<OnboardingAnswers>(STORAGE_KEYS.onboarding);
}

function loadSettings(): AppSettings {
  return (
    getItem<AppSettings>(STORAGE_KEYS.settings) ?? {
      theme: "light",
      density: "comfortable",
      defaultCompareView: "grid",
      reduceMotion: false,
      presentationDefaults: {
        showRecommendation: true,
        hideNotes: true,
        showExecutiveSummary: true,
      },
      notifications: {
        emailDigest: false,
        decisionReminders: true,
        feedbackAlerts: true,
      },
      workflow: {
        requireRationale: false,
        warnOnUndecided: true,
      },
    }
  );
}

function resolveTheme(theme: AppSettings["theme"]): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

function applyTheme(theme: AppSettings["theme"]) {
  document.documentElement.setAttribute("data-theme", resolveTheme(theme));
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  onboarding: null,
  settings: { theme: "light" },

  hydrate: () => {
    const settings = loadSettings();
    applyTheme(settings.theme);
    set({
      user: loadAuth(),
      onboarding: loadOnboarding(),
      settings,
    });
  },

  isAuthenticated: () => get().user !== null,

  login: (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const valid = normalizedEmail === "test@test.com" && password === "test";
    if (!valid) return false;
    const user: AuthUser = { email: "test@test.com", name: "Demo User" };
    setItem(STORAGE_KEYS.auth, user);
    set({ user });
    return true;
  },

  loginFromOnboarding: (answers) => {
    const user: AuthUser = {
      email: "demo@optionist.app",
      name: answers.role,
    };
    setItem(STORAGE_KEYS.auth, user);
    setItem(STORAGE_KEYS.onboarding, answers);
    set({ user, onboarding: answers });
  },

  logout: () => {
    removeItem(STORAGE_KEYS.auth);
    set({ user: null });
  },

  setOnboarding: (answers) => {
    setItem(STORAGE_KEYS.onboarding, answers);
    set({ onboarding: answers });
  },

  updateSettings: (patch) => {
    const settings = { ...get().settings, ...patch };
    setItem(STORAGE_KEYS.settings, settings);
    if (patch.theme) applyTheme(patch.theme);
    set({ settings });
  },
}));
