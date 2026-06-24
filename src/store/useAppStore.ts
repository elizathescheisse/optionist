import { create } from "zustand";
import type {
  AppState,
  Project,
  Decision,
  DesignOption,
  ReviewViewMode,
  ID,
} from "../types/domain";
import type { ExportedAppData } from "../types/importExport";
import { loadState, saveState, EMPTY_STATE, getStorageMode } from "./persistence";
import { createId } from "../utils/ids";
import { now } from "../utils/dates";
import { GUEST_LIMITS } from "../config/guestLimits";
import { trackGuestEvent } from "../services/guestAnalytics";
import {
  fetchProjectsForOrg,
  fetchDecisionsForProjects,
  fetchOptionsForDecisions,
} from "../services/work";
import { signOptionImagePaths } from "../services/optionImages";
import { buildWorkState } from "../types/work";

export const GUEST_LIMIT_EVENT = "optionist:guest-limit";

function emitGuestLimit(message: string): void {
  window.dispatchEvent(new CustomEvent(GUEST_LIMIT_EVENT, { detail: message }));
}

function checkGuestProjectLimit(state: AppState): boolean {
  if (getStorageMode() !== "guest") return true;
  if (Object.keys(state.projects).length >= GUEST_LIMITS.maxProjects) {
    emitGuestLimit(
      `Guest mode allows up to ${GUEST_LIMITS.maxProjects} projects. Create an account to save more.`,
    );
    return false;
  }
  return true;
}

function checkGuestDecisionLimit(state: AppState): boolean {
  if (getStorageMode() !== "guest") return true;
  if (Object.keys(state.decisions).length >= GUEST_LIMITS.maxDecisions) {
    emitGuestLimit(
      `Guest mode allows up to ${GUEST_LIMITS.maxDecisions} decisions. Create an account to save more.`,
    );
    return false;
  }
  return true;
}

function checkGuestOptionLimit(state: AppState): boolean {
  if (getStorageMode() !== "guest") return true;
  if (Object.keys(state.options).length >= GUEST_LIMITS.maxOptions) {
    emitGuestLimit(
      `Guest mode allows up to ${GUEST_LIMITS.maxOptions} design options. Create an account to save more.`,
    );
    return false;
  }
  return true;
}

type AppStore = AppState & {
  createProject: (input: { name: string; description?: string }) => ID;
  updateProject: (projectId: ID, patch: Partial<Pick<Project, "name" | "description">>) => void;
  deleteProject: (projectId: ID) => void;
  setCurrentProject: (projectId: ID | null) => void;

  createDecision: (projectId: ID, input: { title: string; description?: string }) => ID;
  updateDecision: (decisionId: ID, patch: Partial<Pick<Decision, "title" | "description" | "notes" | "finalRationale">>) => void;
  deleteDecision: (decisionId: ID) => void;
  archiveDecision: (decisionId: ID) => void;
  postponeDecision: (decisionId: ID) => void;
  reactivateDecision: (decisionId: ID) => void;
  setCurrentDecision: (decisionId: ID | null) => void;

  addOption: (decisionId: ID, input: { name: string; imageDataUrl: string; imageMimeType: DesignOption["imageMimeType"] }) => ID;
  updateOption: (optionId: ID, patch: Partial<Pick<DesignOption, "name" | "notes">>) => void;
  deleteOption: (optionId: ID) => void;
  rejectOption: (optionId: ID) => void;
  restoreOption: (optionId: ID) => void;
  markOptionFinal: (optionId: ID) => void;
  setCurrentOption: (optionId: ID | null) => void;
  goToNextOption: () => void;
  goToPreviousOption: () => void;

  setReviewViewMode: (mode: ReviewViewMode) => void;

  exportData: () => ExportedAppData;
  importDataReplace: (data: ExportedAppData) => void;
  resetAllData: () => void;
  reloadFromStorage: () => void;
  resetToEmpty: () => void;

  loadFromDb: (organizationId: ID) => Promise<void>;
};

function persist<T>(state: AppState, extra: T): AppState & T {
  saveState(state);
  return { ...state, ...extra } as AppState & T;
}

export const useAppStore = create<AppStore>((set, get) => ({
  ...loadState(),

  // --- Projects ---
  createProject: ({ name, description = "" }) => {
    const current = get();
    if (!checkGuestProjectLimit(current)) return "";
    const id = createId();
    const ts = now();
    const project: Project = {
      id,
      name: name.trim(),
      description: description.trim(),
      decisionIds: [],
      createdAt: ts,
      updatedAt: ts,
    };
    set((s) => {
      const next = { ...s, projects: { ...s.projects, [id]: project } };
      saveState(next);
      if (getStorageMode() === "guest") {
        trackGuestEvent("guest_project_created");
      }
      return next;
    });
    return id;
  },

  updateProject: (projectId, patch) => {
    set((s) => {
      const project = s.projects[projectId];
      if (!project) return s;
      const updated = { ...project, ...patch, updatedAt: now() };
      const next = { ...s, projects: { ...s.projects, [projectId]: updated } };
      saveState(next);
      return next;
    });
  },

  deleteProject: (projectId) => {
    set((s) => {
      const project = s.projects[projectId];
      if (!project) return s;

      const decisionsToDelete = new Set(project.decisionIds);
      const optionsToDelete = new Set<ID>();
      for (const dId of decisionsToDelete) {
        const d = s.decisions[dId];
        if (d) d.optionIds.forEach((oId) => optionsToDelete.add(oId));
      }

      const projects = { ...s.projects };
      delete projects[projectId];
      const decisions = { ...s.decisions };
      decisionsToDelete.forEach((id) => delete decisions[id]);
      const options = { ...s.options };
      optionsToDelete.forEach((id) => delete options[id]);

      const next = {
        ...s,
        projects,
        decisions,
        options,
        currentProjectId: s.currentProjectId === projectId ? null : s.currentProjectId,
        currentDecisionId: decisionsToDelete.has(s.currentDecisionId ?? "") ? null : s.currentDecisionId,
        currentOptionId: optionsToDelete.has(s.currentOptionId ?? "") ? null : s.currentOptionId,
      };
      saveState(next);
      return next;
    });
  },

  setCurrentProject: (projectId) => {
    set((s) => persist({ ...s, currentProjectId: projectId }, {}));
  },

  // --- Decisions ---
  createDecision: (projectId, { title, description = "" }) => {
    const current = get();
    if (!checkGuestDecisionLimit(current)) return "";
    const id = createId();
    const ts = now();
    const decision: Decision = {
      id,
      projectId,
      title: title.trim(),
      description: description.trim(),
      status: "active",
      optionIds: [],
      selectedOptionId: null,
      notes: "",
      finalRationale: "",
      decidedAt: null,
      archivedAt: null,
      createdAt: ts,
      updatedAt: ts,
    };
    set((s) => {
      const project = s.projects[projectId];
      if (!project) return s;
      const updatedProject = {
        ...project,
        decisionIds: [...project.decisionIds, id],
        updatedAt: now(),
      };
      const next = {
        ...s,
        decisions: { ...s.decisions, [id]: decision },
        projects: { ...s.projects, [projectId]: updatedProject },
      };
      saveState(next);
      if (getStorageMode() === "guest") {
        trackGuestEvent("guest_decision_created", { projectId });
      }
      return next;
    });
    return id;
  },

  updateDecision: (decisionId, patch) => {
    set((s) => {
      const decision = s.decisions[decisionId];
      if (!decision) return s;
      const updated = { ...decision, ...patch, updatedAt: now() };
      const next = { ...s, decisions: { ...s.decisions, [decisionId]: updated } };
      saveState(next);
      return next;
    });
  },

  deleteDecision: (decisionId) => {
    set((s) => {
      const decision = s.decisions[decisionId];
      if (!decision) return s;
      const optionsToDelete = new Set(decision.optionIds);
      const project = s.projects[decision.projectId];

      const decisions = { ...s.decisions };
      delete decisions[decisionId];
      const options = { ...s.options };
      optionsToDelete.forEach((id) => delete options[id]);
      const projects = project
        ? {
            ...s.projects,
            [project.id]: {
              ...project,
              decisionIds: project.decisionIds.filter((id) => id !== decisionId),
              updatedAt: now(),
            },
          }
        : s.projects;

      const next = {
        ...s,
        decisions,
        options,
        projects,
        currentDecisionId: s.currentDecisionId === decisionId ? null : s.currentDecisionId,
        currentOptionId: optionsToDelete.has(s.currentOptionId ?? "") ? null : s.currentOptionId,
      };
      saveState(next);
      return next;
    });
  },

  archiveDecision: (decisionId) => {
    set((s) => {
      const decision = s.decisions[decisionId];
      if (!decision) return s;
      const updated = { ...decision, status: "archived" as const, archivedAt: now(), updatedAt: now() };
      const next = { ...s, decisions: { ...s.decisions, [decisionId]: updated } };
      saveState(next);
      return next;
    });
  },

  postponeDecision: (decisionId) => {
    set((s) => {
      const decision = s.decisions[decisionId];
      if (!decision) return s;
      const updated = { ...decision, status: "postponed" as const, updatedAt: now() };
      const next = { ...s, decisions: { ...s.decisions, [decisionId]: updated } };
      saveState(next);
      return next;
    });
  },

  reactivateDecision: (decisionId) => {
    set((s) => {
      const decision = s.decisions[decisionId];
      if (!decision) return s;
      const updated = { ...decision, status: "active" as const, archivedAt: null, updatedAt: now() };
      const next = { ...s, decisions: { ...s.decisions, [decisionId]: updated } };
      saveState(next);
      return next;
    });
  },

  setCurrentDecision: (decisionId) => {
    set((s) => {
      const decision = decisionId ? s.decisions[decisionId] : null;
      const firstOptionId = decision?.optionIds[0] ?? null;
      const next = { ...s, currentDecisionId: decisionId, currentOptionId: firstOptionId };
      saveState(next);
      return next;
    });
  },

  // --- Options ---
  addOption: (decisionId, { name, imageDataUrl, imageMimeType }) => {
    const current = get();
    if (!checkGuestOptionLimit(current)) return "";
    const id = createId();
    const ts = now();
    const option: DesignOption = {
      id,
      decisionId,
      name: name.trim(),
      imageDataUrl,
      imageMimeType,
      status: "active",
      notes: "",
      createdAt: ts,
      updatedAt: ts,
    };
    set((s) => {
      const decision = s.decisions[decisionId];
      if (!decision) return s;
      const updatedDecision = {
        ...decision,
        optionIds: [...decision.optionIds, id],
        updatedAt: now(),
      };
      const isFirst = decision.optionIds.length === 0;
      const next = {
        ...s,
        options: { ...s.options, [id]: option },
        decisions: { ...s.decisions, [decisionId]: updatedDecision },
        currentOptionId: isFirst && !s.currentOptionId ? id : s.currentOptionId,
      };
      saveState(next);
      if (getStorageMode() === "guest") {
        trackGuestEvent("guest_upload_added", { decisionId });
      }
      return next;
    });
    return id;
  },

  updateOption: (optionId, patch) => {
    set((s) => {
      const option = s.options[optionId];
      if (!option) return s;
      const updated = { ...option, ...patch, updatedAt: now() };
      const next = { ...s, options: { ...s.options, [optionId]: updated } };
      saveState(next);
      return next;
    });
  },

  deleteOption: (optionId) => {
    set((s) => {
      const option = s.options[optionId];
      if (!option) return s;
      const decision = s.decisions[option.decisionId];
      const options = { ...s.options };
      delete options[optionId];
      const decisions = decision
        ? {
            ...s.decisions,
            [decision.id]: {
              ...decision,
              optionIds: decision.optionIds.filter((id) => id !== optionId),
              selectedOptionId: decision.selectedOptionId === optionId ? null : decision.selectedOptionId,
              updatedAt: now(),
            },
          }
        : s.decisions;

      const next = {
        ...s,
        options,
        decisions,
        currentOptionId: s.currentOptionId === optionId ? null : s.currentOptionId,
      };
      saveState(next);
      return next;
    });
  },

  rejectOption: (optionId) => {
    set((s) => {
      const option = s.options[optionId];
      if (!option || option.status === "final") return s;
      const updated = { ...option, status: "rejected" as const, updatedAt: now() };
      const next = { ...s, options: { ...s.options, [optionId]: updated } };
      saveState(next);
      return next;
    });
  },

  restoreOption: (optionId) => {
    set((s) => {
      const option = s.options[optionId];
      if (!option || option.status !== "rejected") return s;
      const updated = { ...option, status: "active" as const, updatedAt: now() };
      const next = { ...s, options: { ...s.options, [optionId]: updated } };
      saveState(next);
      return next;
    });
  },

  markOptionFinal: (optionId) => {
    set((s) => {
      const option = s.options[optionId];
      if (!option) return s;
      const decision = s.decisions[option.decisionId];
      if (!decision) return s;

      const updatedOptions = { ...s.options };
      for (const oId of decision.optionIds) {
        const o = s.options[oId];
        if (!o) continue;
        if (oId === optionId) {
          updatedOptions[oId] = { ...o, status: "final", updatedAt: now() };
        } else if (o.status !== "rejected") {
          updatedOptions[oId] = { ...o, status: "active", updatedAt: now() };
        }
      }

      const updatedDecision: Decision = {
        ...decision,
        status: "finalized",
        selectedOptionId: optionId,
        decidedAt: now(),
        updatedAt: now(),
      };

      const next = {
        ...s,
        options: updatedOptions,
        decisions: { ...s.decisions, [decision.id]: updatedDecision },
      };
      saveState(next);
      return next;
    });
  },

  setCurrentOption: (optionId) => {
    set((s) => persist({ ...s, currentOptionId: optionId }, {}));
  },

  goToNextOption: () => {
    set((s) => {
      const decision = s.currentDecisionId ? s.decisions[s.currentDecisionId] : null;
      if (!decision || decision.optionIds.length === 0) return s;
      const navigable = decision.optionIds.filter((id) => s.options[id]?.status !== "rejected");
      if (navigable.length === 0) return s;
      const idx = navigable.indexOf(s.currentOptionId ?? "");
      const nextIdx = (idx + 1) % navigable.length;
      const next = { ...s, currentOptionId: navigable[nextIdx] };
      saveState(next);
      return next;
    });
  },

  goToPreviousOption: () => {
    set((s) => {
      const decision = s.currentDecisionId ? s.decisions[s.currentDecisionId] : null;
      if (!decision || decision.optionIds.length === 0) return s;
      const navigable = decision.optionIds.filter((id) => s.options[id]?.status !== "rejected");
      if (navigable.length === 0) return s;
      const idx = navigable.indexOf(s.currentOptionId ?? "");
      const prevIdx = (idx - 1 + navigable.length) % navigable.length;
      const next = { ...s, currentOptionId: navigable[prevIdx] };
      saveState(next);
      return next;
    });
  },

  setReviewViewMode: (mode) => {
    set((s) => persist({ ...s, reviewViewMode: mode }, {}));
  },

  // --- Import / Export ---
  exportData: () => {
    const s = get();
    return {
      appName: "design-decision-tool",
      dataVersion: 1,
      exportedAt: now(),
      projects: s.projects,
      decisions: s.decisions,
      options: s.options,
    };
  },

  importDataReplace: (data) => {
    set((s) => {
      const next: AppState = {
        ...EMPTY_STATE,
        projects: data.projects,
        decisions: data.decisions,
        options: data.options,
        currentProjectId: s.currentProjectId,
        currentDecisionId: null,
        currentOptionId: null,
      };
      saveState(next);
      return next;
    });
  },

  resetAllData: () => {
    set(() => {
      saveState(EMPTY_STATE);
      return EMPTY_STATE;
    });
  },

  reloadFromStorage: () => {
    set(loadState());
  },

  resetToEmpty: () => {
    set(() => {
      saveState(EMPTY_STATE);
      return { ...EMPTY_STATE };
    });
  },

  // Read path for logged-in users with Supabase configured: pull the org's
  // projects/decisions/options from the database (three batched queries), sign
  // the option images, and replace the store. localStorage is untouched (the
  // store is in "supabase" mode, so saveState is a no-op).
  loadFromDb: async (organizationId) => {
    const projectRows = await fetchProjectsForOrg(organizationId);
    const decisionRows = await fetchDecisionsForProjects(projectRows.map((p) => p.id));
    const optionRows = await fetchOptionsForDecisions(decisionRows.map((d) => d.id));

    const urlByPath = await signOptionImagePaths(optionRows.map((o) => o.storage_path));
    const imageUrlById: Record<ID, string> = {};
    for (const o of optionRows) {
      const url = urlByPath[o.storage_path];
      if (url) imageUrlById[o.id] = url;
    }

    const { projects, decisions, options } = buildWorkState(
      projectRows,
      decisionRows,
      optionRows,
      imageUrlById,
    );
    set((s) => ({
      ...s,
      projects,
      decisions,
      options,
      currentProjectId: null,
      currentDecisionId: null,
      currentOptionId: null,
    }));
  },
}));
