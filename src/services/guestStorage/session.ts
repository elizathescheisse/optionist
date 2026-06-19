import { getItem, setItem, removeItem, STORAGE_KEYS } from "../storage";
import { createId } from "../../utils/ids";
import { now } from "../../utils/dates";
import type { GuestSession } from "./types";
import { GUEST_SESSION_STORAGE_VERSION } from "./types";

export function loadGuestSession(): GuestSession | null {
  const session = getItem<GuestSession>(STORAGE_KEYS.guestSession);
  if (!session) return null;
  if (session.storageVersion !== GUEST_SESSION_STORAGE_VERSION) return null;
  return session;
}

export function createGuestSession(): GuestSession {
  const ts = now();
  const session: GuestSession = {
    guestSessionId: `local_${createId()}`,
    createdAt: ts,
    lastActiveAt: ts,
    storageVersion: GUEST_SESSION_STORAGE_VERSION,
    hasSeenGuestNotice: false,
    lastOpenedProjectId: null,
  };
  setItem(STORAGE_KEYS.guestSession, session);
  return session;
}

export function saveGuestSession(session: GuestSession): void {
  setItem(STORAGE_KEYS.guestSession, session);
}

export function touchGuestSession(): void {
  const session = loadGuestSession();
  if (!session) return;
  saveGuestSession({ ...session, lastActiveAt: now() });
}

export function updateGuestSession(patch: Partial<GuestSession>): GuestSession | null {
  const session = loadGuestSession();
  if (!session) return null;
  const next = { ...session, ...patch, lastActiveAt: now() };
  saveGuestSession(next);
  return next;
}

export function clearGuestSession(): void {
  removeItem(STORAGE_KEYS.guestSession);
}
