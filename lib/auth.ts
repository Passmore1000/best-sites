import "server-only";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/** Emails permitted into /admin, from the ADMIN_EMAILS env var (comma-separated). */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const allow = adminEmails();
  // If no allowlist is configured, any authenticated user is treated as admin (dev convenience).
  return allow.length === 0 || allow.includes(email.toLowerCase());
}

/** Returns the current admin user, or null if not signed in / not allowlisted. */
export async function getAdminUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user && isAdminEmail(user.email) ? user : null;
  } catch {
    return null;
  }
}
