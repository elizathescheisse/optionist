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

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    return JSON.parse(raw) as AppState;
  } catch {
    return EMPTY_STATE;
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

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    if (isQuotaError(err)) {
      window.dispatchEvent(new CustomEvent(STORAGE_FULL_EVENT));
    }
    // Any other failure is still swallowed — nothing useful to do here.
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
