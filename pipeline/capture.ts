import type { CaptureResult } from "./types";
import { createAdminClient, MEDIA_BUCKET } from "@/lib/supabase/admin";
import { domainFromUrl, slugify } from "@/lib/utils";
import { extractMetadata } from "./metadata";

/**
 * Website capture.
 *
 * Uses Playwright when available (local dev / worker). Falls back to a lightweight
 * metadata + OG-image capture on serverless hosts like Vercel where Chromium cannot run.
 */
export async function captureWebsite(url: string): Promise<CaptureResult> {
  if (await canUsePlaywright()) {
    try {
      return await captureWithPlaywright(url);
    } catch (error) {
      console.warn("[capture] Playwright failed, falling back to lite capture:", error);
    }
  }

  return captureLite(url);
}

const canUsePlaywright = async () => {
  if (process.env.CAPTURE_MODE === "lite") return false;
  if (process.env.CAPTURE_MODE === "playwright") return true;
  if (process.env.VERCEL) return false;

  try {
    await import("playwright");
    return true;
  } catch {
    return false;
  }
};

async function captureLite(url: string): Promise<CaptureResult> {
  const metadata = await extractMetadata(url);
  const media: CaptureResult["media"] = [];

  if (metadata.ogImageUrl) {
    const uploaded = await tryUploadRemoteImage(url, metadata.ogImageUrl, "desktop-og");
    media.push({
      kind: "desktop_shot",
      storagePath: uploaded ?? metadata.ogImageUrl,
      width: 1200,
      height: 630,
    });
  }

  return { media };
}

async function tryUploadRemoteImage(
  pageUrl: string,
  imageUrl: string,
  filename: string,
): Promise<string | null> {
  try {
    const response = await fetch(imageUrl, {
      headers: { "user-agent": "BestSitesBot/1.0 (+https://bestsites.io)" },
      redirect: "follow",
    });
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") ?? "image/png";
    if (!contentType.startsWith("image/")) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    const db = createAdminClient();
    const domain = slugify(domainFromUrl(pageUrl)) || "site";
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const extension = contentType.includes("jpeg") ? "jpg" : contentType.includes("webp") ? "webp" : "png";
    const path = `captures/${domain}/${stamp}/${filename}.${extension}`;

    const { error } = await db.storage.from(MEDIA_BUCKET).upload(path, buffer, {
      contentType,
      upsert: true,
    });
    if (error) throw error;

    return path;
  } catch (error) {
    console.warn("[capture] Could not upload remote preview image:", error);
    return null;
  }
}

async function captureWithPlaywright(url: string): Promise<CaptureResult> {
  const { chromium } = await import("playwright");

  const db = createAdminClient();
  const domain = slugify(domainFromUrl(url)) || "site";
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const root = `captures/${domain}/${stamp}`;
  const browser = await chromium.launch({ headless: true });

  try {
    const desktop = await capturePage(browser, url, {
      width: 1280,
      height: 800,
      fullPage: false,
    });
    const mobile = await capturePage(browser, url, {
      width: 390,
      height: 844,
      isMobile: true,
      fullPage: false,
    });
    const fullPage = await capturePage(browser, url, {
      width: 1280,
      height: 900,
      fullPage: true,
    });

    const uploads = [
      { kind: "desktop_shot" as const, ...desktop, path: `${root}/desktop.png` },
      { kind: "mobile_shot" as const, ...mobile, path: `${root}/mobile.png` },
      { kind: "fullpage_shot" as const, ...fullPage, path: `${root}/fullpage.png` },
    ];

    for (const upload of uploads) {
      const { error } = await db.storage
        .from(MEDIA_BUCKET)
        .upload(upload.path, upload.buffer, {
          contentType: "image/png",
          upsert: true,
        });
      if (error) throw error;
    }

    return {
      media: uploads.map((upload) => ({
        kind: upload.kind,
        storagePath: upload.path,
        width: upload.width,
        height: upload.height,
      })),
    };
  } finally {
    await browser.close();
  }
}

async function capturePage(
  browser: import("playwright").Browser,
  url: string,
  options: {
    width: number;
    height: number;
    fullPage: boolean;
    isMobile?: boolean;
  },
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const context = await browser.newContext({
    viewport: { width: options.width, height: options.height },
    deviceScaleFactor: 1,
    isMobile: options.isMobile ?? false,
    userAgent: "BestSitesBot/1.0 (+https://bestsites.io)",
  });
  const page = await context.newPage();

  try {
    await gotoSettled(page, url);
    const buffer = await page.screenshot({
      type: "png",
      fullPage: options.fullPage,
      animations: "disabled",
      caret: "hide",
    });
    const dimensions = options.fullPage
      ? await page.evaluate(() => ({
          width: Math.ceil(document.documentElement.scrollWidth),
          height: Math.ceil(document.documentElement.scrollHeight),
        }))
      : { width: options.width, height: options.height };

    return { buffer, width: dimensions.width, height: dimensions.height };
  } finally {
    await context.close();
  }
}

async function gotoSettled(page: import("playwright").Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined);
  await page.waitForTimeout(750);
}
