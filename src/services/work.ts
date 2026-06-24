import { getSupabase, isSupabaseConfigured } from "../lib/supabase";
import type { ProjectRow, DecisionRow, DecisionOptionRow } from "../types/work";

// Read-only access to the work-data tables. Writes (and the atomic invariant
// functions) land in PR 2. Each function is gated by isSupabaseConfigured and
// throws on error, mirroring src/services/workspace.ts. RLS does the access
// filtering server-side, so these queries only return rows the user may read.

export async function fetchProjectsForOrg(organizationId: string): Promise<ProjectRow[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await getSupabase()
    .from("projects")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProjectRow[];
}

export async function fetchDecisionsForProjects(projectIds: string[]): Promise<DecisionRow[]> {
  if (!isSupabaseConfigured || projectIds.length === 0) return [];
  const { data, error } = await getSupabase()
    .from("decisions")
    .select("*")
    .in("project_id", projectIds);
  if (error) throw error;
  return (data ?? []) as DecisionRow[];
}

export async function fetchOptionsForDecisions(decisionIds: string[]): Promise<DecisionOptionRow[]> {
  if (!isSupabaseConfigured || decisionIds.length === 0) return [];
  const { data, error } = await getSupabase()
    .from("decision_options")
    .select("*")
    .in("decision_id", decisionIds)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DecisionOptionRow[];
}
