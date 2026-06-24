import type { AppState } from "../types/domain";

export const STORAGE_KEY = "design-decision-tool:v1";

export const EMPTY_STATE: AppState = {
  projects: {},
  decisions: {},
  options: {},
  currentProjectId: null,
  currentDecisionId: null,
  currentOptionId: null,
  reviewViewMode: "fit-width",
  dataVersion: 1,
};

// "supabase" = the database is the source of truth (logged-in users with
// Supabase configured). In that mode we never read or write localStorage; the
// store is filled by loadFromDb instead.
export type StorageMode = "authenticated" | "guest" | "supabase";

let activeStorageMode: StorageMode = "authenticated";

export function getStorageMode(): StorageMode {
  return activeStorageMode;
}

export function setStorageMode(mode: StorageMode): void {
  activeStorageMode = mode;
}

function storageKeyForMode(mode: StorageMode): string {
  return mode === "guest" ? "optionist:guest-app:v1" : STORAGE_KEY;
}

export function loadState(mode: StorageMode = activeStorageMode): AppState {
  if (mode === "supabase") return { ...EMPTY_STATE };
  try {
    const raw = localStorage.getItem(storageKeyForMode(mode));
    if (!raw) return { ...EMPTY_STATE };
    return JSON.parse(raw) as AppState;
  } catch {
    return { ...EMPTY_STATE };
  }
}

// Fired when a save fails because localStorage is full. A listener in the UI
// (StorageQuotaWatcher) turns this into a visible toast so data loss is never
// silent. Using a window event keeps this module free of any React/UI imports.
export const STORAGE_FULL_EVENT = "optionist:storage-full";

function isQuotaError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === "QuotaExceededError" ||
      // Firefox uses a different name for the same condition.
      err.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}

export function saveState(state: AppState, mode: StorageMode = activeStorageMode): void {
  // Database-backed mode: the DB is authoritative, so don't mirror to localStorage.
  if (mode === "supabase") return;
  try {
    localStorage.setItem(storageKeyForMode(mode), JSON.stringify(state));
  } catch (err) {
    if (isQuotaError(err)) {
      window.dispatchEvent(new CustomEvent(STORAGE_FULL_EVENT));
    }
    // Any other failure is still swallowed — nothing useful to do here.
  }
}

export function clearState(mode: StorageMode = "authenticated"): void {
  localStorage.removeItem(storageKeyForMode(mode));
}
