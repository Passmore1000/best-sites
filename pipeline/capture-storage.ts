import { createAdminClient, MEDIA_BUCKET } from "@/lib/supabase/admin";
import { domainFromUrl, slugify } from "@/lib/utils";

export const downloadAndUploadScreenshot = async (
  pageUrl: string,
  imageUrl: string,
  storagePath: string,
): Promise<string | null> => {
  try {
    const response = await fetch(imageUrl, { redirect: "follow" });
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") ?? "image/png";
    if (!contentType.startsWith("image/")) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    const db = createAdminClient();
    const { error } = await db.storage.from(MEDIA_BUCKET).upload(storagePath, buffer, {
      contentType,
      upsert: true,
    });
    if (error) throw error;

    return storagePath;
  } catch (error) {
    console.warn(`[capture] Could not persist screenshot for ${pageUrl}:`, error);
    return null;
  }
};

export const captureStoragePath = (pageUrl: string, filename: string) => {
  const domain = slugify(domainFromUrl(pageUrl)) || "site";
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `captures/${domain}/${stamp}/${filename}`;
};

/** CSS injected before capture to hide scrollbars and trim capture noise. */
export const CAPTURE_INJECTED_STYLES =
  "html{scrollbar-width:none}body{-ms-overflow-style:none}body::-webkit-scrollbar{display:none}";
