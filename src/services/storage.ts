const PREFIX = "optionist";

export const STORAGE_KEYS = {
  auth: `${PREFIX}.auth`,
  onboarding: `${PREFIX}.onboarding`,
  settings: `${PREFIX}.settings`,
  comparisons: "design-decision-tool:v1",
  feedback: `${PREFIX}.feedback`,
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
