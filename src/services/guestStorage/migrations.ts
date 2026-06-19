import { clearGuestAppState, loadGuestAppState } from "./appState";
import { clearGuestSession, loadGuestSession } from "./session";

export type GuestStorageRecoveryAction = "retry" | "clear";

/** Returns null when storage is healthy; otherwise a user-facing message. */
export function getGuestStorageError(): string | null {
  try {
    const session = loadGuestSession();
    if (session) {
      loadGuestAppState();
    }
    return null;
  } catch {
    return "Guest workspace data could not be read. You can retry or clear local guest data.";
  }
}

export function recoverGuestStorage(action: GuestStorageRecoveryAction): void {
  if (action === "clear") {
    clearGuestAppState();
    clearGuestSession();
    return;
  }
  // retry: no-op — next load attempt re-reads storage
}
