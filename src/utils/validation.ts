import type { ExportedAppData } from "../types/importExport";
import type { Project, Decision, DesignOption, ID } from "../types/domain";
import { ALLOWED_MIME_TYPES } from "./files";

export type ValidationResult =
  | { ok: true; data: ExportedAppData }
  | { ok: false; error: string };

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function validateProject(v: unknown): v is Project {
  if (!isRecord(v)) return false;
  return (
    isString(v.id) &&
    isString(v.name) &&
    isString(v.description) &&
    Array.isArray(v.decisionIds) &&
    v.decisionIds.every(isString) &&
    isString(v.createdAt) &&
    isString(v.updatedAt)
  );
}

function validateDecision(v: unknown): v is Decision {
  if (!isRecord(v)) return false;
  const validStatuses = ["active", "finalized", "archived", "postponed"];
  return (
    isString(v.id) &&
    isString(v.projectId) &&
    isString(v.title) &&
    isString(v.description) &&
    validStatuses.includes(v.status as string) &&
    Array.isArray(v.optionIds) &&
    v.optionIds.every(isString) &&
    (v.selectedOptionId === null || isString(v.selectedOptionId)) &&
    isString(v.notes) &&
    isString(v.finalRationale) &&
    (v.decidedAt === null || isString(v.decidedAt)) &&
    (v.archivedAt === null || isString(v.archivedAt)) &&
    isString(v.createdAt) &&
    isString(v.updatedAt)
  );
}

function validateOption(v: unknown): v is DesignOption {
  if (!isRecord(v)) return false;
  const validStatuses = ["active", "rejected", "final"];
  return (
    isString(v.id) &&
    isString(v.decisionId) &&
    isString(v.name) &&
    isString(v.imageDataUrl) &&
    (ALLOWED_MIME_TYPES as string[]).includes(v.imageMimeType as string) &&
    validStatuses.includes(v.status as string) &&
    isString(v.notes) &&
    isString(v.createdAt) &&
    isString(v.updatedAt)
  );
}

export function validateImportedData(raw: unknown): ValidationResult {
  if (!isRecord(raw)) return { ok: false, error: "Invalid JSON structure." };
  if (raw.appName !== "design-decision-tool")
    return { ok: false, error: "Invalid appName." };
  if (raw.dataVersion !== 1)
    return { ok: false, error: "Unsupported dataVersion." };
  if (!isRecord(raw.projects) || !isRecord(raw.decisions) || !isRecord(raw.options))
    return { ok: false, error: "Missing projects, decisions, or options." };

  const projects = raw.projects as Record<ID, unknown>;
  const decisions = raw.decisions as Record<ID, unknown>;
  const options = raw.options as Record<ID, unknown>;

  for (const p of Object.values(projects)) {
    if (!validateProject(p)) return { ok: false, error: "Invalid project record." };
  }
  for (const d of Object.values(decisions)) {
    if (!validateDecision(d)) return { ok: false, error: "Invalid decision record." };
  }
  for (const o of Object.values(options)) {
    if (!validateOption(o)) return { ok: false, error: "Invalid option record." };
  }

  // Reference integrity
  for (const p of Object.values(projects) as Project[]) {
    for (const dId of p.decisionIds) {
      if (!decisions[dId]) return { ok: false, error: `Decision ${dId} referenced by project ${p.id} does not exist.` };
    }
  }
  for (const d of Object.values(decisions) as Decision[]) {
    if (!projects[d.projectId]) return { ok: false, error: `Project ${d.projectId} referenced by decision ${d.id} does not exist.` };
    for (const oId of d.optionIds) {
      if (!options[oId]) return { ok: false, error: `Option ${oId} referenced by decision ${d.id} does not exist.` };
    }
    if (d.selectedOptionId && !options[d.selectedOptionId])
      return { ok: false, error: `Selected option ${d.selectedOptionId} in decision ${d.id} does not exist.` };
  }
  for (const o of Object.values(options) as DesignOption[]) {
    if (!decisions[o.decisionId]) return { ok: false, error: `Decision ${o.decisionId} referenced by option ${o.id} does not exist.` };
  }

  return { ok: true, data: raw as ExportedAppData };
}
