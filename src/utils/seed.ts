import { STORAGE_KEY, EMPTY_STATE } from "../store/persistence";
import { validateImportedData } from "./validation";

/**
 * If localStorage is empty, attempt to fetch /seed.json and load it as the
 * initial app state. Called once at startup, before the store initialises.
 *
 * Silently no-ops if:
 *  - localStorage already has data (existing user — never overwrite)
 *  - /seed.json doesn't exist (404)
 *  - The file fails to parse or fails validation
 */
export async function loadSeedIfEmpty(): Promise<void> {
  // Don't touch existing data
  if (localStorage.getItem(STORAGE_KEY) !== null) return;

  try {
    const response = await fetch("/seed.json");
    if (!response.ok) return; // No seed file present — that's fine

    const raw: unknown = await response.json();
    const result = validateImportedData(raw);
    if (!result.ok) return; // Invalid seed — start empty rather than error

    const state = {
      ...EMPTY_STATE,
      projects: result.data.projects,
      decisions: result.data.decisions,
      options: result.data.options,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // fetch failed, JSON.parse threw, or anything else — start empty
  }
}
