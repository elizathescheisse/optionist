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

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage can throw if storage is full; fail silently
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
