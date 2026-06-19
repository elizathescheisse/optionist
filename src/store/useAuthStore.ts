import { create } from "zustand";
import type { Provider, Session } from "@supabase/supabase-js";
import { getItem, setItem, removeItem, STORAGE_KEYS } from "../services/storage";
import { mapSupabaseUser } from "../lib/authUser";
import { authRedirectUrl, getSupabase, isSupabaseConfigured } from "../lib/supabase";
import { useWorkspaceStore } from "./useWorkspaceStore";

export type AuthUser = {
  id?: string;
  email: string;
  name?: string;
  avatarUrl?: string;
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
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthStore = {
  status: AuthStatus;
  session: Session | null;
  user: AuthUser | null;
  onboarding: OnboardingAnswers | null;
  settings: AppSettings;
  authError: string | null;
  isAuthenticated: () => boolean;
  /** Load session from Supabase (or localStorage demo when unconfigured). */
  initialize: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<boolean>;
  signInWithOAuth: (provider: Provider) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<boolean>;
  resetPasswordForEmail: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
  /** Demo-only login when Supabase env vars are missing. */
  login: (email: string, password: string) => boolean;
  loginFromOnboarding: (answers: OnboardingAnswers) => void;
  logout: () => void;
  setOnboarding: (answers: OnboardingAnswers) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  hydrate: () => void;
};

function loadOnboarding(): OnboardingAnswers | null {
  return getItem<OnboardingAnswers>(STORAGE_KEYS.onboarding);
}

function loadSettings(): AppSettings {
  return getItem<AppSettings>(STORAGE_KEYS.settings) ?? { theme: "light" };
}

function loadDemoAuth(): AuthUser | null {
  return getItem<AuthUser>(STORAGE_KEYS.auth);
}

function applyTheme(theme: AppSettings["theme"]) {
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  document.documentElement.setAttribute("data-theme", resolved);
}

function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }
  if (lower.includes("user already registered")) {
    return "An account with this email already exists. Try signing in.";
  }
  return message;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  status: "loading",
  session: null,
  user: null,
  onboarding: null,
  settings: { theme: "light" },
  authError: null,

  isAuthenticated: () => get().status === "authenticated" && get().user !== null,

  clearAuthError: () => set({ authError: null }),

  hydrate: () => {
    const settings = loadSettings();
    applyTheme(settings.theme);
    set({
      onboarding: loadOnboarding(),
      settings,
    });
  },

  initialize: async () => {
    get().hydrate();

    if (!isSupabaseConfigured) {
      const demoUser = loadDemoAuth();
      set({
        status: demoUser ? "authenticated" : "unauthenticated",
        user: demoUser,
        session: null,
      });
      return;
    }

    const supabase = getSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    set({
      session,
      user: session?.user ? mapSupabaseUser(session.user) : null,
      status: session?.user ? "authenticated" : "unauthenticated",
    });

    supabase.auth.onAuthStateChange((_event, nextSession) => {
      set({
        session: nextSession,
        user: nextSession?.user ? mapSupabaseUser(nextSession.user) : null,
        status: nextSession?.user ? "authenticated" : "unauthenticated",
      });
    });
  },

  signInWithPassword: async (email, password) => {
    set({ authError: null });
    if (!isSupabaseConfigured) {
      return get().login(email, password);
    }
    const { error } = await getSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      set({ authError: friendlyAuthError(error.message) });
      return false;
    }
    return true;
  },

  signInWithOAuth: async (provider) => {
    set({ authError: null });
    if (!isSupabaseConfigured) {
      set({ authError: "Social login requires Supabase configuration." });
      return;
    }
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider,
      options: { redirectTo: authRedirectUrl() },
    });
    if (error) {
      set({ authError: friendlyAuthError(error.message) });
    }
  },

  signUpWithPassword: async (email, password) => {
    set({ authError: null });
    if (!isSupabaseConfigured) {
      set({ authError: "Account creation requires Supabase configuration." });
      return false;
    }
    const { error } = await getSupabase().auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: authRedirectUrl() },
    });
    if (error) {
      set({ authError: friendlyAuthError(error.message) });
      return false;
    }
    return true;
  },

  resetPasswordForEmail: async (email) => {
    set({ authError: null });
    if (!isSupabaseConfigured) {
      // Demo: pretend success without revealing whether email exists
      return true;
    }
    const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: authRedirectUrl("/forgot-password"),
    });
    if (error) {
      set({ authError: friendlyAuthError(error.message) });
      return false;
    }
    return true;
  },

  signOut: async () => {
    if (isSupabaseConfigured) {
      await getSupabase().auth.signOut();
    }
    removeItem(STORAGE_KEYS.auth);
    useWorkspaceStore.getState().reset();
    set({ user: null, session: null, status: "unauthenticated", authError: null });
  },

  login: (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const valid = normalizedEmail === "test@test.com" && password === "test";
    if (!valid) return false;
    const user: AuthUser = { email: "test@test.com", name: "Demo User" };
    setItem(STORAGE_KEYS.auth, user);
    set({ user, status: "authenticated" });
    return true;
  },

  loginFromOnboarding: (answers) => {
    const user: AuthUser = {
      email: "demo@optionist.app",
      name: answers.role,
    };
    setItem(STORAGE_KEYS.auth, user);
    setItem(STORAGE_KEYS.onboarding, answers);
    set({ user, onboarding: answers, status: "authenticated" });
  },

  logout: () => {
    void get().signOut();
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
