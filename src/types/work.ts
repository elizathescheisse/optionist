// Database row shapes for the work-data tables (snake_case, as Supabase returns
// them) plus pure mappers into the app's existing camelCase domain types. Keeping
// the mappers pure means the model-translation decisions — dropping `archived`,
// and deriving a "final" option from `decisions.final_option_id` — are unit
// testable without a live database.

import type {
  Project,
  Decision,
  DecisionStatus,
  DesignOption,
  ID,
} from "./domain";

export type ProjectVisibility = "private" | "organization";
export type ProjectRole = "owner" | "editor" | "reviewer" | "viewer";

export type ProjectRow = {
  id: ID;
  organization_id: ID;
  name: string;
  description: string | null;
  visibility: ProjectVisibility;
  created_by: ID;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DecisionRow = {
  id: ID;
  project_id: ID;
  title: string;
  description: string | null;
  working_notes: string | null;
  status: "active" | "finalized" | "postponed";
  final_option_id: ID | null;
  final_rationale: string | null;
  finalized_at: string | null;
  finalized_by: ID | null;
  created_by: ID;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DecisionOptionRow = {
  id: ID;
  decision_id: ID;
  label: string | null;
  storage_path: string;
  original_filename: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  sort_order: number;
  status: "active" | "rejected";
  rejection_reason: string | null;
  rejected_at: string | null;
  rejected_by: ID | null;
  created_by: ID;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

const ALLOWED_MIME: DesignOption["imageMimeType"][] = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

function coerceMime(mime: string | null): DesignOption["imageMimeType"] {
  return (ALLOWED_MIME as string[]).includes(mime ?? "")
    ? (mime as DesignOption["imageMimeType"])
    : "image/png";
}

/**
 * Map one option row to the domain shape. `imageUrl` is a resolved (signed)
 * Storage URL that goes into the existing `imageDataUrl` field, so the render
 * path is unchanged. `isFinal` (the decision points at this option) surfaces as
 * the app's `"final"` option status, which has no column of its own in the DB.
 */
export function mapOption(
  row: DecisionOptionRow,
  imageUrl: string,
  isFinal: boolean,
): DesignOption {
  return {
    id: row.id,
    decisionId: row.decision_id,
    name: row.label ?? "",
    imageDataUrl: imageUrl,
    imageMimeType: coerceMime(row.mime_type),
    status: isFinal ? "final" : row.status,
    notes: row.rejection_reason ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Map one decision row + its option ids (in sort order) to the domain shape. */
export function mapDecision(row: DecisionRow, optionIds: ID[]): Decision {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description ?? "",
    // DB never emits "archived"; the union still allows it for the local model.
    status: row.status as DecisionStatus,
    optionIds,
    selectedOptionId: row.final_option_id,
    notes: row.working_notes ?? "",
    finalRationale: row.final_rationale ?? "",
    decidedAt: row.finalized_at,
    archivedAt: null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Map one project row + its decision ids to the domain shape. */
export function mapProject(row: ProjectRow, decisionIds: ID[]): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    decisionIds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Assemble the keyed records the app store holds from raw DB rows. `imageUrlById`
 * maps an option id to its resolved signed URL (resolved by the caller, since
 * signing is async). Pure and deterministic — this is what the mapping test
 * pins down.
 */
export function buildWorkState(
  projectRows: ProjectRow[],
  decisionRows: DecisionRow[],
  optionRows: DecisionOptionRow[],
  imageUrlById: Record<ID, string>,
): {
  projects: Record<ID, Project>;
  decisions: Record<ID, Decision>;
  options: Record<ID, DesignOption>;
} {
  const optionsByDecision: Record<ID, DecisionOptionRow[]> = {};
  for (const o of optionRows) {
    (optionsByDecision[o.decision_id] ??= []).push(o);
  }
  for (const list of Object.values(optionsByDecision)) {
    list.sort((a, b) => a.sort_order - b.sort_order);
  }

  const decisionsByProject: Record<ID, DecisionRow[]> = {};
  for (const d of decisionRows) {
    (decisionsByProject[d.project_id] ??= []).push(d);
  }

  const options: Record<ID, DesignOption> = {};
  const decisions: Record<ID, Decision> = {};
  for (const d of decisionRows) {
    const optRows = optionsByDecision[d.id] ?? [];
    for (const o of optRows) {
      options[o.id] = mapOption(o, imageUrlById[o.id] ?? "", o.id === d.final_option_id);
    }
    decisions[d.id] = mapDecision(d, optRows.map((o) => o.id));
  }

  const projects: Record<ID, Project> = {};
  for (const p of projectRows) {
    const decIds = (decisionsByProject[p.id] ?? [])
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((d) => d.id);
    projects[p.id] = mapProject(p, decIds);
  }

  return { projects, decisions, options };
}
