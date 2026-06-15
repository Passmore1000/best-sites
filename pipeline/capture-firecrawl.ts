import type { CaptureResult } from "./types";
import { createAdminClient, MEDIA_BUCKET } from "@/lib/supabase/admin";
import { domainFromUrl, slugify } from "@/lib/utils";

const FIRECRAWL_API = "https://api.firecrawl.dev/v2/scrape";

type ScreenshotRequest = {
  mobile?: boolean;
  viewport: { width: number; height: number };
  fullPage?: boolean;
  filename: string;
};

export const canUseFirecrawl = () => Boolean(process.env.FIRECRAWL_API_KEY?.trim());

export async function captureWithFirecrawl(url: string): Promise<CaptureResult> {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is required for screenshots on Vercel.");
  }

  const domain = slugify(domainFromUrl(url)) || "site";
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const root = `captures/${domain}/${stamp}`;

  const shots: Array<ScreenshotRequest & { kind: CaptureResult["media"][number]["kind"] }> = [
    {
      kind: "desktop_shot",
      filename: "desktop.png",
      viewport: { width: 1440, height: 900 },
    },
    {
      kind: "mobile_shot",
      filename: "mobile.png",
      mobile: true,
      viewport: { width: 390, height: 844 },
    },
  ];

  const media: CaptureResult["media"] = [];

  for (const shot of shots) {
    const screenshotUrl = await requestScreenshot(url, apiKey, shot);
    if (!screenshotUrl) continue;

    const uploaded = await downloadAndUpload(url, screenshotUrl, `${root}/${shot.filename}`);
    if (!uploaded) continue;

    media.push({
      kind: shot.kind,
      storagePath: uploaded.path,
      width: shot.viewport.width,
      height: shot.viewport.height,
    });
  }

  if (media.length === 0) {
    throw new Error("Firecrawl did not return any screenshots for this URL.");
  }

  return { media };
}

async function requestScreenshot(
  url: string,
  apiKey: string,
  shot: ScreenshotRequest,
): Promise<string | null> {
  const response = await fetch(FIRECRAWL_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url,
      formats: [
        {
          type: "screenshot",
          fullPage: shot.fullPage ?? false,
          viewport: shot.viewport,
          quality: 90,
        },
      ],
      onlyMainContent: false,
      waitFor: 5000,
      mobile: shot.mobile ?? false,
    }),
  });

  const payload = (await response.json()) as {
    success?: boolean;
    error?: string;
    data?: { screenshot?: string };
  };

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? `Firecrawl screenshot failed (${response.status})`);
  }

  return payload.data?.screenshot ?? null;
}

async function downloadAndUpload(
  pageUrl: string,
  imageUrl: string,
  storagePath: string,
): Promise<{ path: string } | null> {
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

    return { path: storagePath };
  } catch (error) {
    console.warn(`[capture] Could not persist screenshot for ${pageUrl}:`, error);
    return null;
  }
}
