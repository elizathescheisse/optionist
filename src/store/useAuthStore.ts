import { create } from "zustand";
import type { Provider, Session } from "@supabase/supabase-js";
import { getItem, setItem, removeItem, STORAGE_KEYS } from "../services/storage";
import { mapSupabaseUser } from "../lib/authUser";
import { authRedirectUrl, getSupabase, isSupabaseConfigured } from "../lib/supabase";
import { useWorkspaceStore } from "./useWorkspaceStore";
import { useAppStore } from "./useAppStore";
import { setStorageMode } from "./persistence";
import {
  clearGuestAppState,
  clearGuestSession,
  createGuestSession,
  hasGuestAppData,
  loadGuestSession,
  touchGuestSession,
  updateGuestSession,
} from "../services/guestStorage";
import { trackGuestEvent } from "../services/guestAnalytics";
import { applyAppTheme, applyThemeForCurrentPath } from "../lib/theme";

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

export type AuthStatus = "loading" | "unauthenticated" | "guest" | "authenticated";

type AuthStore = {
  status: AuthStatus;
  session: Session | null;
  user: AuthUser | null;
  onboarding: OnboardingAnswers | null;
  settings: AppSettings;
  authError: string | null;
  guestSessionId: string | null;
  hasSeenGuestNotice: boolean;
  pendingGuestMigration: boolean;
  guestLimitMessage: string | null;
  guestStorageError: string | null;
  isAuthenticated: () => boolean;
  isGuest: () => boolean;
  canAccessApp: () => boolean;
  /** Load session from Supabase (or localStorage demo when unconfigured). */
  initialize: () => Promise<void>;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  clearGuestWorkspace: () => void;
  dismissGuestNotice: () => void;
  showGuestNoticeAgain: () => void;
  dismissGuestMigration: () => void;
  checkGuestDataAfterAuth: () => void;
  signInWithPassword: (email: string, password: string) => Promise<boolean>;
  signInWithOAuth: (provider: Provider) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<boolean>;
  resetPasswordForEmail: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
  clearGuestLimitMessage: () => void;
  setGuestLimitMessage: (message: string) => void;
  retryGuestStorage: () => void;
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

function loadPendingGuestMigration(): boolean {
  return getItem<boolean>(STORAGE_KEYS.pendingGuestMigration) ?? false;
}

function setPendingGuestMigration(value: boolean): void {
  if (value) {
    setItem(STORAGE_KEYS.pendingGuestMigration, true);
  } else {
    removeItem(STORAGE_KEYS.pendingGuestMigration);
  }
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

function activateGuestMode(
  set: (partial: Partial<AuthStore> | ((state: AuthStore) => Partial<AuthStore>)) => void,
  sessionId: string,
): void {
  setStorageMode("guest");
  useAppStore.getState().reloadFromStorage();
  const session = loadGuestSession();
  set({
    status: "guest",
    user: null,
    session: null,
    guestSessionId: sessionId,
    hasSeenGuestNotice: session?.hasSeenGuestNotice ?? false,
    authError: null,
  });
}

function activateAuthenticatedMode(
  set: (partial: Partial<AuthStore> | ((state: AuthStore) => Partial<AuthStore>)) => void,
  user: AuthUser | null,
  session: Session | null,
): void {
  setStorageMode("authenticated");
  useAppStore.getState().reloadFromStorage();
  set({
    status: user ? "authenticated" : "unauthenticated",
    user,
    session,
    guestSessionId: null,
    hasSeenGuestNotice: false,
  });
}

function restoreGuestSessionIfPresent(
  set: (partial: Partial<AuthStore> | ((state: AuthStore) => Partial<AuthStore>)) => void,
): boolean {
  const session = loadGuestSession();
  if (!session) return false;
  touchGuestSession();
  activateGuestMode(set, session.guestSessionId);
  return true;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  status: "loading",
  session: null,
  user: null,
  onboarding: null,
  settings: { theme: "light" },
  authError: null,
  guestSessionId: null,
  hasSeenGuestNotice: false,
  pendingGuestMigration: false,
  guestLimitMessage: null,
  guestStorageError: null,

  isAuthenticated: () => get().status === "authenticated" && get().user !== null,

  isGuest: () => get().status === "guest",

  canAccessApp: () => get().isAuthenticated() || get().isGuest(),

  clearAuthError: () => set({ authError: null }),

  clearGuestLimitMessage: () => set({ guestLimitMessage: null }),

  setGuestLimitMessage: (message) => set({ guestLimitMessage: message }),

  hydrate: () => {
    const settings = loadSettings();
    applyThemeForCurrentPath(settings.theme);
    set({
      onboarding: loadOnboarding(),
      settings,
      pendingGuestMigration: loadPendingGuestMigration(),
    });
  },

  initialize: async () => {
    get().hydrate();

    if (!isSupabaseConfigured) {
      const demoUser = loadDemoAuth();
      if (demoUser) {
        activateAuthenticatedMode(set, demoUser, null);
        return;
      }
      if (restoreGuestSessionIfPresent(set)) return;
      setStorageMode("authenticated");
      set({ status: "unauthenticated", user: null, session: null, guestSessionId: null });
      return;
    }

    const supabase = getSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      activateAuthenticatedMode(set, mapSupabaseUser(session.user), session);
      get().checkGuestDataAfterAuth();
    } else if (restoreGuestSessionIfPresent(set)) {
      // guest restored
    } else {
      setStorageMode("authenticated");
      set({ status: "unauthenticated", user: null, session: null, guestSessionId: null });
    }

    supabase.auth.onAuthStateChange((_event, nextSession) => {
      const wasGuest = get().isGuest();
      if (nextSession?.user) {
        activateAuthenticatedMode(set, mapSupabaseUser(nextSession.user), nextSession);
        if (wasGuest || hasGuestAppData()) {
          get().checkGuestDataAfterAuth();
        }
      } else if (!get().isGuest()) {
        activateAuthenticatedMode(set, null, null);
      }
    });
  },

  enterGuestMode: () => {
    const existing = loadGuestSession();
    const session = existing ?? createGuestSession();
    touchGuestSession();
    trackGuestEvent("guest_started", { resumed: Boolean(existing) });
    activateGuestMode(set, session.guestSessionId);
  },

  exitGuestMode: () => {
    // End the active guest session but keep guest app data on this device.
    clearGuestSession();
    setStorageMode("authenticated");
    useAppStore.getState().reloadFromStorage();
    set({ status: "unauthenticated", guestSessionId: null, hasSeenGuestNotice: false });
  },

  clearGuestWorkspace: () => {
    trackGuestEvent("guest_clear_data");
    clearGuestAppState();
    clearGuestSession();
    if (get().isGuest()) {
      useAppStore.getState().resetToEmpty();
      const session = createGuestSession();
      set({
        guestSessionId: session.guestSessionId,
        hasSeenGuestNotice: false,
        guestStorageError: null,
      });
    }
  },

  dismissGuestNotice: () => {
    updateGuestSession({ hasSeenGuestNotice: true });
    set({ hasSeenGuestNotice: true });
  },

  showGuestNoticeAgain: () => {
    updateGuestSession({ hasSeenGuestNotice: false });
    set({ hasSeenGuestNotice: false });
  },

  dismissGuestMigration: () => {
    setPendingGuestMigration(false);
    set({ pendingGuestMigration: false });
  },

  checkGuestDataAfterAuth: () => {
    if (hasGuestAppData()) {
      trackGuestEvent("signup_completed");
      setPendingGuestMigration(true);
      set({ pendingGuestMigration: true });
    }
  },

  retryGuestStorage: () => {
    try {
      loadGuestSession();
      set({ guestStorageError: null });
      if (get().isGuest()) {
        useAppStore.getState().reloadFromStorage();
      }
    } catch {
      set({
        guestStorageError:
          "Guest workspace data could not be read. You can retry or clear local guest data.",
      });
    }
  },

  signInWithPassword: async (email, password) => {
    set({ authError: null });
    if (!isSupabaseConfigured) {
      const ok = get().login(email, password);
      if (ok) get().checkGuestDataAfterAuth();
      return ok;
    }
    const { error } = await getSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      set({ authError: friendlyAuthError(error.message) });
      return false;
    }
    get().checkGuestDataAfterAuth();
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
    setStorageMode("authenticated");
    useAppStore.getState().reloadFromStorage();
    set({
      user: null,
      session: null,
      status: "unauthenticated",
      authError: null,
      guestSessionId: null,
    });
  },

  login: (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const valid = normalizedEmail === "test@test.com" && password === "test";
    if (!valid) return false;
    const user: AuthUser = { email: "test@test.com", name: "Demo User" };
    setItem(STORAGE_KEYS.auth, user);
    activateAuthenticatedMode(set, user, null);
    return true;
  },

  loginFromOnboarding: (answers) => {
    const user: AuthUser = {
      email: "demo@optionist.app",
      name: answers.role,
    };
    setItem(STORAGE_KEYS.auth, user);
    setItem(STORAGE_KEYS.onboarding, answers);
    activateAuthenticatedMode(set, user, null);
    set({ onboarding: answers });
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
    if (patch.theme) applyAppTheme(patch.theme);
    set({ settings });
  },
}));
