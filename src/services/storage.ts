// Generic localStorage helpers for the auth/settings layer. Kept separate from
// the main store's persistence.ts (which serializes the whole AppState) because
// auth/onboarding/settings are small independent keys, not part of AppState.

const PREFIX = "optionist";

export const STORAGE_KEYS = {
  auth: `${PREFIX}.auth`,
  onboarding: `${PREFIX}.onboarding`,
  settings: `${PREFIX}.settings`,
  guestSession: `${PREFIX}.guest-session`,
  pendingGuestMigration: `${PREFIX}.pending-guest-migration`,
  guestAnalytics: `${PREFIX}.guest-analytics`,
} as const;

export function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage can throw if storage is full
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(key);
}
