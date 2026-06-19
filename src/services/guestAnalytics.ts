import { getItem, setItem, STORAGE_KEYS } from "./storage";
import { loadGuestSession } from "./guestStorage/session";
import { now } from "../utils/dates";

export type GuestAnalyticsEventName =
  | "guest_started"
  | "guest_project_created"
  | "guest_decision_created"
  | "guest_upload_added"
  | "save_work_clicked"
  | "signup_started"
  | "signup_completed"
  | "migration_review_opened"
  | "migration_export_clicked"
  | "migration_keep_local"
  | "migration_discard_clicked"
  | "guest_clear_data";

export type GuestAnalyticsEvent = {
  name: GuestAnalyticsEventName;
  guestSessionId: string;
  at: string;
  meta?: Record<string, string | number | boolean>;
};

const MAX_EVENTS = 200;

function loadEvents(): GuestAnalyticsEvent[] {
  return getItem<GuestAnalyticsEvent[]>(STORAGE_KEYS.guestAnalytics) ?? [];
}

function saveEvents(events: GuestAnalyticsEvent[]): void {
  setItem(STORAGE_KEYS.guestAnalytics, events.slice(-MAX_EVENTS));
}

/** Anonymous local-only analytics — no PII, no uploaded content. */
export function trackGuestEvent(
  name: GuestAnalyticsEventName,
  meta?: Record<string, string | number | boolean>,
): void {
  const session = loadGuestSession();
  const guestSessionId = session?.guestSessionId ?? "unknown";
  const event: GuestAnalyticsEvent = {
    name,
    guestSessionId,
    at: now(),
    meta,
  };
  saveEvents([...loadEvents(), event]);
}

export function listGuestAnalyticsEvents(): GuestAnalyticsEvent[] {
  return loadEvents();
}

export function clearGuestAnalyticsEvents(): void {
  setItem(STORAGE_KEYS.guestAnalytics, []);
}
