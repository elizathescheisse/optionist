import type { ExportedAppData } from "../types/importExport";

export type GuestMigrationResult =
  | { ok: true }
  | { ok: false; reason: "cloud_sync_unavailable" | "not_authenticated" };

/**
 * Cloud import requires Supabase project/decision tables (not in schema yet).
 * UI should offer JSON export until project sync ships.
 */
export async function migrateGuestWorkToAccount(): Promise<GuestMigrationResult> {
  return { ok: false, reason: "cloud_sync_unavailable" };
}

export function guestExportMetadata(data: ExportedAppData) {
  return {
    projectCount: Object.keys(data.projects).length,
    decisionCount: Object.keys(data.decisions).length,
    optionCount: Object.keys(data.options).length,
  };
}
