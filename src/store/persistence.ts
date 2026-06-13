import type { AppState, Decision, DesignOption } from "../types/domain";
import { DEFAULT_PRESENTATION_SETTINGS } from "../types/domain";

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

function backfillDecision(d: Decision): Decision {
  if (d.openConcerns === undefined) d.openConcerns = "";
  if (d.nextSteps === undefined) d.nextSteps = "";
  if (d.audience === undefined) d.audience = "";
  if (d.dueDate === undefined) d.dueDate = "";
  if (d.owner === undefined) d.owner = "";
  if (d.summary === undefined) d.summary = "";
  if (d.compareMode === undefined) d.compareMode = "grid";
  if (d.decisionStatus === undefined) {
    d.decisionStatus =
      d.status === "finalized" ? "decided" : d.status === "active" ? "in_review" : "not_started";
  }
  if (d.presentationSettings === undefined) {
    d.presentationSettings = { ...DEFAULT_PRESENTATION_SETTINGS };
  }
  return d;
}

function backfillOption(o: DesignOption): DesignOption {
  if (o.displayStatus === undefined) {
    if (o.status === "final") o.displayStatus = "selected";
    else if (o.status === "rejected") o.displayStatus = "rejected";
    else o.displayStatus = "ready";
  }
  if (o.summary === undefined) o.summary = "";
  if (o.pros === undefined) o.pros = "";
  if (o.risks === undefined) o.risks = "";
  return o;
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as AppState;
    for (const id of Object.keys(parsed.decisions ?? {})) {
      parsed.decisions[id] = backfillDecision(parsed.decisions[id]);
    }
    for (const id of Object.keys(parsed.options ?? {})) {
      parsed.options[id] = backfillOption(parsed.options[id]);
    }
    return parsed;
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
