import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

/**
 * Cookieless anon client for public, read-only content. Because it doesn't touch
 * request cookies, pages that use it can be statically generated / ISR-cached — which
 * is what we want for the SEO surface (homepage, collection and detail pages).
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
