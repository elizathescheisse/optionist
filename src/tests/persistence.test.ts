import { describe, it, expect, beforeEach } from "vitest";
import { loadState, saveState, clearState, EMPTY_STATE } from "../store/persistence";
import type { AppState } from "../types/domain";

const STORAGE_KEY = "design-decision-tool:v1";

describe("persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty state when localStorage has no entry", () => {
    expect(loadState()).toEqual(EMPTY_STATE);
  });

  it("returns the saved state when localStorage has valid data", () => {
    const state: AppState = {
      ...EMPTY_STATE,
      currentProjectId: "abc",
    };
    saveState(state);
    expect(loadState()).toEqual(state);
  });

  it("falls back to empty state when localStorage contains corrupted JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not valid json}");
    expect(loadState()).toEqual(EMPTY_STATE);
  });

  it("does not throw when localStorage is corrupt", () => {
    localStorage.setItem(STORAGE_KEY, "null");
    expect(() => loadState()).not.toThrow();
  });

  it("saveState writes serialized state to localStorage", () => {
    saveState(EMPTY_STATE);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual(EMPTY_STATE);
  });

  it("clearState removes the entry from localStorage", () => {
    saveState(EMPTY_STATE);
    clearState();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("loadState after clearState returns empty state", () => {
    saveState({ ...EMPTY_STATE, currentProjectId: "xyz" });
    clearState();
    expect(loadState()).toEqual(EMPTY_STATE);
  });
});
