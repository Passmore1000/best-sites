import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

/**
 * Service-role Supabase client. Bypasses RLS — server-only, never import into a
 * Client Component. Used by the pipeline/admin to read drafts and write listings,
 * media and the storage bucket.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — set them in .env.local",
    );
  }
  return createSupabaseClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const MEDIA_BUCKET = "website-media";

/** Resolve a stored media path to a renderable URL. Passes through full http(s) URLs
 *  (used by seed/placeholder data) and builds a Storage public URL otherwise. */
export function mediaUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null;
  if (/^https?:\/\//.test(storagePath)) return storagePath;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${storagePath}`;
}
