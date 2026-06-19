import type { AppState } from "../../types/domain";
import { EMPTY_STATE, STORAGE_FULL_EVENT } from "../../store/persistence";

export const GUEST_APP_STORAGE_KEY = "optionist:guest-app:v1";

function isQuotaError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}

export function loadGuestAppState(): AppState {
  try {
    const raw = localStorage.getItem(GUEST_APP_STORAGE_KEY);
    if (!raw) return { ...EMPTY_STATE };
    return JSON.parse(raw) as AppState;
  } catch {
    return { ...EMPTY_STATE };
  }
}

export function saveGuestAppState(state: AppState): void {
  try {
    localStorage.setItem(GUEST_APP_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    if (isQuotaError(err)) {
      window.dispatchEvent(new CustomEvent(STORAGE_FULL_EVENT));
    }
  }
}

export function clearGuestAppState(): void {
  localStorage.removeItem(GUEST_APP_STORAGE_KEY);
}

export function hasGuestAppData(): boolean {
  const state = loadGuestAppState();
  return Object.keys(state.projects).length > 0;
}
