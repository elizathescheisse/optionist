import { getSupabase, isSupabaseConfigured } from "../lib/supabase";

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function dbCreateProject(
  id: string,
  organizationId: string,
  name: string,
  description: string,
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await getSupabase().rpc("create_project_with_owner", {
    p_id: id,
    p_organization_id: organizationId,
    p_name: name,
    p_description: description,
    p_visibility: "private",
  });
  if (error) throw error;
}

export async function dbUpdateProject(
  id: string,
  patch: { name?: string; description?: string },
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await getSupabase().from("projects").update(patch).eq("id", id);
  if (error) throw error;
}

export async function dbDeleteProject(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await getSupabase().from("projects").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Decisions
// ---------------------------------------------------------------------------

export async function dbCreateDecision(
  id: string,
  projectId: string,
  title: string,
  description: string,
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await getSupabase()
    .from("decisions")
    .insert({ id, project_id: projectId, title, description, status: "active", created_by: (await getSupabase().auth.getUser()).data.user?.id });
  if (error) throw error;
}

export async function dbUpdateDecision(
  id: string,
  patch: { title?: string; description?: string; working_notes?: string; final_rationale?: string; status?: string; final_option_id?: string | null; finalized_at?: string | null; finalized_by?: string | null },
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await getSupabase().from("decisions").update(patch).eq("id", id);
  if (error) throw error;
}

export async function dbDeleteDecision(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await getSupabase().from("decisions").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

/** Upload an image file to Storage and return the storage path. */
export async function dbUploadOptionImage(
  file: File,
  orgId: string,
  projectId: string,
  decisionId: string,
  optionId: string,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `organization/${orgId}/project/${projectId}/decision/${decisionId}/option/${optionId}/image.${ext}`;
  const { error } = await getSupabase().storage.from("decision-assets").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

/** Generate a 1-hour signed URL for a storage path. */
export async function dbSignOptionImageUrl(path: string): Promise<string> {
  const { data, error } = await getSupabase()
    .storage.from("decision-assets")
    .createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) throw error ?? new Error("No signed URL returned");
  return data.signedUrl;
}

export async function dbCreateOption(
  id: string,
  decisionId: string,
  label: string,
  storagePath: string,
  mimeType: string,
  fileSize: number,
  sortOrder: number,
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const userId = (await getSupabase().auth.getUser()).data.user?.id;
  const { error } = await getSupabase().from("decision_options").insert({
    id,
    decision_id: decisionId,
    label,
    storage_path: storagePath,
    mime_type: mimeType,
    file_size_bytes: fileSize,
    sort_order: sortOrder,
    status: "active",
    created_by: userId,
  });
  if (error) throw error;
}

export async function dbUpdateOption(
  id: string,
  patch: { label?: string },
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await getSupabase().from("decision_options").update(patch).eq("id", id);
  if (error) throw error;
}

export async function dbDeleteOption(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await getSupabase().from("decision_options").delete().eq("id", id);
  if (error) throw error;
}

export async function dbRejectOption(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await getSupabase()
    .from("decision_options")
    .update({ status: "rejected", rejected_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function dbRestoreOption(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await getSupabase()
    .from("decision_options")
    .update({ status: "active", rejected_at: null, rejected_by: null, rejection_reason: null })
    .eq("id", id);
  if (error) throw error;
}

export async function dbMarkOptionFinal(
  optionId: string,
  decisionId: string,
  finalizedBy: string,
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await getSupabase()
    .from("decisions")
    .update({
      final_option_id: optionId,
      status: "finalized",
      finalized_at: new Date().toISOString(),
      finalized_by: finalizedBy,
    })
    .eq("id", decisionId);
  if (error) throw error;
}
