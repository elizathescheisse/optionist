import { getItem, setItem } from "./storage";

export type TimelineEventType =
  | "comparison_created"
  | "option_uploaded"
  | "decision_captured"
  | "feedback_added"
  | "comparison_reopened";

export type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  decisionId: string;
  projectId?: string;
  label: string;
  createdAt: string;
};

const KEY = "optionist.timeline";

function load(): TimelineEvent[] {
  return getItem<TimelineEvent[]>(KEY) ?? [];
}

function save(events: TimelineEvent[]) {
  setItem(KEY, events.slice(0, 200));
}

export function logTimelineEvent(
  event: Omit<TimelineEvent, "id" | "createdAt"> & { id?: string },
) {
  const entry: TimelineEvent = {
    id: event.id ?? crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    type: event.type,
    decisionId: event.decisionId,
    projectId: event.projectId,
    label: event.label,
  };
  save([entry, ...load()]);
}

export function getTimelineEvents(decisionId?: string): TimelineEvent[] {
  const all = load();
  if (!decisionId) return all;
  return all.filter((e) => e.decisionId === decisionId);
}

export function clearTimeline() {
  setItem(KEY, []);
}
