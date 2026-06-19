import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../store/useAuthStore";
import { useAppStore } from "../store/useAppStore";
import {
  clearGuestAppState,
  clearGuestSession,
  createGuestSession,
  hasGuestAppData,
  loadGuestSession,
  summarizeGuestWork,
} from "../services/guestStorage";
import { listGuestAnalyticsEvents } from "../services/guestAnalytics";
import { migrateGuestWorkToAccount } from "../services/guestMigration";
import {
  clearState,
  loadState,
  setStorageMode,
  STORAGE_KEY,
} from "../store/persistence";
import { GUEST_APP_STORAGE_KEY } from "../services/guestStorage/appState";

describe("guest mode", () => {
  beforeEach(() => {
    localStorage.clear();
    clearGuestAppState();
    clearGuestSession();
    setStorageMode("authenticated");
    useAuthStore.setState({
      status: "unauthenticated",
      user: null,
      session: null,
      guestSessionId: null,
      pendingGuestMigration: false,
    });
    useAppStore.setState({
      ...loadState(),
    });
  });

  it("creates a persistent guest session on enterGuestMode", () => {
    useAuthStore.getState().enterGuestMode();
    expect(useAuthStore.getState().isGuest()).toBe(true);
    expect(loadGuestSession()?.guestSessionId).toMatch(/^local_/);
  });

  it("stores guest projects in a separate localStorage key", () => {
    useAuthStore.getState().enterGuestMode();
    useAppStore.getState().createProject({ name: "Guest project" });
    expect(localStorage.getItem(GUEST_APP_STORAGE_KEY)).toContain("Guest project");
    expect(localStorage.getItem(STORAGE_KEY) ?? "").not.toContain("Guest project");
  });

  it("enforces guest project limits", () => {
    useAuthStore.getState().enterGuestMode();
    const store = useAppStore.getState();
    store.createProject({ name: "P1" });
    store.createProject({ name: "P2" });
    store.createProject({ name: "P3" });
    const blocked = store.createProject({ name: "P4" });
    expect(blocked).toBe("");
    expect(Object.keys(useAppStore.getState().projects)).toHaveLength(3);
  });

  it("detects guest data after authentication", () => {
    useAuthStore.getState().enterGuestMode();
    useAppStore.getState().createProject({ name: "Keep me" });
    useAuthStore.setState({ status: "authenticated", user: { email: "a@b.com" } });
    setStorageMode("authenticated");
    useAuthStore.getState().checkGuestDataAfterAuth();
    expect(useAuthStore.getState().pendingGuestMigration).toBe(true);
    expect(hasGuestAppData()).toBe(true);
  });

  it("summarizes guest work for migration review", () => {
    createGuestSession();
    setStorageMode("guest");
    const projectId = useAppStore.getState().createProject({ name: "Alpha" });
    useAppStore.getState().createDecision(projectId, { title: "Pick a logo" });
    const summary = summarizeGuestWork();
    expect(summary.projectCount).toBe(1);
    expect(summary.decisionCount).toBe(1);
  });

  it("records anonymous guest analytics events", () => {
    createGuestSession();
    useAuthStore.getState().enterGuestMode();
    useAuthStore.getState().enterGuestMode();
    const events = listGuestAnalyticsEvents();
    expect(events.some((e) => e.name === "guest_started")).toBe(true);
    expect(events[0]?.guestSessionId).toMatch(/^local_/);
  });

  it("reports cloud migration unavailable until project sync exists", async () => {
    const result = await migrateGuestWorkToAccount();
    expect(result).toEqual({ ok: false, reason: "cloud_sync_unavailable" });
  });

  it("clears guest workspace without touching authenticated storage", () => {
    saveAuthenticatedMarker();
    useAuthStore.getState().enterGuestMode();
    useAppStore.getState().createProject({ name: "Guest only" });
    useAuthStore.getState().clearGuestWorkspace();
    expect(hasGuestAppData()).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("authenticated-marker");
  });
});

function saveAuthenticatedMarker() {
  clearState("authenticated");
  localStorage.setItem(STORAGE_KEY, "authenticated-marker");
}
