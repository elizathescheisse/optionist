import { getSupabase, isSupabaseConfigured } from "../lib/supabase";

// Option images live in the private "decision-assets" bucket. The browser can't
// read a private object directly, so we mint a short-lived *signed* URL — a
// temporary link that proves the request is allowed. The resolved URL drops into
// the option's existing imageDataUrl field, so nothing in the render path changes.

const BUCKET = "decision-assets";
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

/**
 * Sign many option image paths in one round trip. Returns a map of storage_path
 * -> signed URL. Paths that fail to sign are simply omitted (the image just
 * doesn't load); a missing image must never break the whole read.
 */
export async function signOptionImagePaths(
  paths: string[],
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  if (!isSupabaseConfigured || paths.length === 0) return result;

  const { data, error } = await getSupabase()
    .storage.from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  if (error) throw error;

  for (const entry of data ?? []) {
    if (entry.signedUrl && entry.path) {
      result[entry.path] = entry.signedUrl;
    }
  }
  return result;
}
