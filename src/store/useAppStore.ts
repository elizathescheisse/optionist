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
import {
  dbCreateProject,
  dbUpdateProject,
  dbDeleteProject,
  dbCreateDecision,
  dbUpdateDecision,
  dbDeleteDecision,
  dbUploadOptionImage,
  dbSignOptionImageUrl,
  dbCreateOption,
  dbUpdateOption,
  dbDeleteOption,
  dbRejectOption,
  dbRestoreOption,
  dbMarkOptionFinal,
} from "../services/workWrites";
import { useWorkspaceStore } from "./useWorkspaceStore";
import { isSupabaseConfigured } from "../lib/supabase";

export const GUEST_LIMIT_EVENT = "optionist:guest-limit";

// Tracks in-flight project creation RPCs so dependent writes (decisions, options)
// can wait for project_members to exist before hitting the DB.
const pendingProjectCreates = new Map<string, Promise<void>>();

function fireAndForget(promise: Promise<void>, label: string): void {
  promise.catch((err) => console.error(`[workWrites] ${label}:`, err));
}

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

  addOption: (decisionId: ID, input: { name: string; imageDataUrl: string; imageMimeType: DesignOption["imageMimeType"]; file?: File }) => Promise<ID>;
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
    if (isSupabaseConfigured && getStorageMode() === "supabase") {
      const orgId = useWorkspaceStore.getState().currentOrganizationId ?? "";
      const p = dbCreateProject(id, orgId, name.trim(), (description ?? "").trim())
        .catch((err) => console.error("[workWrites] createProject:", err));
      pendingProjectCreates.set(id, p);
      p.finally(() => pendingProjectCreates.delete(id));
    }
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
    if (isSupabaseConfigured && getStorageMode() === "supabase") {
      fireAndForget(dbUpdateProject(projectId, patch), "updateProject");
    }
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
    if (isSupabaseConfigured && getStorageMode() === "supabase") {
      fireAndForget(dbDeleteProject(projectId), "deleteProject");
    }
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
    if (isSupabaseConfigured && getStorageMode() === "supabase") {
      const after = pendingProjectCreates.get(projectId) ?? Promise.resolve();
      fireAndForget(after.then(() => dbCreateDecision(id, projectId, title.trim(), (description ?? "").trim())), "createDecision");
    }
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
    if (isSupabaseConfigured && getStorageMode() === "supabase") {
      const dbPatch: Record<string, string | null> = {};
      if (patch.title !== undefined) dbPatch.title = patch.title;
      if (patch.description !== undefined) dbPatch.description = patch.description;
      if (patch.notes !== undefined) dbPatch.working_notes = patch.notes;
      if (patch.finalRationale !== undefined) dbPatch.final_rationale = patch.finalRationale;
      fireAndForget(dbUpdateDecision(decisionId, dbPatch), "updateDecision");
    }
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
    if (isSupabaseConfigured && getStorageMode() === "supabase") {
      fireAndForget(dbDeleteDecision(decisionId), "deleteDecision");
    }
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
    if (isSupabaseConfigured && getStorageMode() === "supabase") {
      fireAndForget(dbUpdateDecision(decisionId, { status: "postponed" }), "postponeDecision");
    }
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
    if (isSupabaseConfigured && getStorageMode() === "supabase") {
      fireAndForget(dbUpdateDecision(decisionId, { status: "active" }), "reactivateDecision");
    }
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
  addOption: async (decisionId, { name, imageDataUrl, imageMimeType, file }) => {
    const current = get();
    if (!checkGuestOptionLimit(current)) return "";
    const id = createId();
    const ts = now();

    if (isSupabaseConfigured && getStorageMode() === "supabase" && file) {
      // Upload to Storage first, then insert the DB row and update local state
      // with a signed URL so the image displays immediately.
      const decision = current.decisions[decisionId];
      if (!decision) return "";
      const project = current.projects[decision.projectId];
      if (!project) return "";
      const orgId = useWorkspaceStore.getState().currentOrganizationId ?? "";
      const sortOrder = decision.optionIds.length;

      try {
        const storagePath = await dbUploadOptionImage(file, orgId, project.id, decisionId, id);
        const signedUrl = await dbSignOptionImageUrl(storagePath);
        await dbCreateOption(id, decisionId, name.trim(), storagePath, imageMimeType ?? file.type, file.size, sortOrder);

        set((s) => {
          const dec = s.decisions[decisionId];
          if (!dec) return s;
          const option: DesignOption = {
            id,
            decisionId,
            name: name.trim(),
            imageDataUrl: signedUrl,
            imageMimeType,
            status: "active",
            notes: "",
            createdAt: ts,
            updatedAt: ts,
          };
          const updatedDecision = { ...dec, optionIds: [...dec.optionIds, id], updatedAt: now() };
          const isFirst = dec.optionIds.length === 0;
          return {
            ...s,
            options: { ...s.options, [id]: option },
            decisions: { ...s.decisions, [decisionId]: updatedDecision },
            currentOptionId: isFirst && !s.currentOptionId ? id : s.currentOptionId,
          };
        });
      } catch (err) {
        console.error("[workWrites] addOption:", err);
      }
      return id;
    }

    // Local / guest path: use the base64 dataUrl directly.
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
    if (isSupabaseConfigured && getStorageMode() === "supabase") {
      const dbPatch: Record<string, string> = {};
      if (patch.name !== undefined) dbPatch.label = patch.name;
      fireAndForget(dbUpdateOption(optionId, dbPatch), "updateOption");
    }
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
    if (isSupabaseConfigured && getStorageMode() === "supabase") {
      fireAndForget(dbDeleteOption(optionId), "deleteOption");
    }
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
    if (isSupabaseConfigured && getStorageMode() === "supabase") {
      fireAndForget(dbRejectOption(optionId), "rejectOption");
    }
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
    if (isSupabaseConfigured && getStorageMode() === "supabase") {
      fireAndForget(dbRestoreOption(optionId), "restoreOption");
    }
  },

  markOptionFinal: (optionId) => {
    let decisionId = "";
    set((s) => {
      const option = s.options[optionId];
      if (!option) return s;
      const decision = s.decisions[option.decisionId];
      if (!decision) return s;
      decisionId = decision.id;

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
    if (isSupabaseConfigured && getStorageMode() === "supabase" && decisionId) {
      const userId = useWorkspaceStore.getState().profile?.id ?? "";
      fireAndForget(dbMarkOptionFinal(optionId, decisionId, userId), "markOptionFinal");
    }
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
