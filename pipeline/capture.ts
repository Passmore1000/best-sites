import type { CaptureResult } from "./types";
import { CAPTURE_INJECTED_STYLES } from "./capture-storage";
import { canUseFirecrawl, captureWithFirecrawl } from "./capture-firecrawl";
import { canUseMicrolink, captureWithMicrolink } from "./capture-microlink";

/**
 * Website capture.
 *
 * Priority:
 * 1. Playwright (local / worker) — full desktop, mobile, and full-page shots
 * 2. Microlink (Vercel / serverless) — clean viewport screenshots
 * 3. Firecrawl — fallback when Microlink fails
 */
export async function captureWebsite(url: string): Promise<CaptureResult> {
  if (await canUsePlaywright()) {
    try {
      return await captureWithPlaywright(url);
    } catch (error) {
      console.warn("[capture] Playwright failed:", error);
    }
  }

  if (canUseMicrolink()) {
    try {
      return await captureWithMicrolink(url);
    } catch (error) {
      console.warn("[capture] Microlink failed:", error);
      if (canUseFirecrawl()) {
        return captureWithFirecrawl(url);
      }
      throw error;
    }
  }

  if (canUseFirecrawl()) {
    return captureWithFirecrawl(url);
  }

  throw new Error(
    "No capture provider available. Run locally with Playwright or configure Microlink/Firecrawl.",
  );
}

const canUsePlaywright = async () => {
  if (process.env.CAPTURE_MODE === "microlink" || process.env.CAPTURE_MODE === "firecrawl") {
    return false;
  }
  if (process.env.CAPTURE_MODE === "playwright") return true;
  if (process.env.VERCEL) return false;

  try {
    await import("playwright");
    return true;
  } catch {
    return false;
  }
};

async function captureWithPlaywright(url: string): Promise<CaptureResult> {
  const { chromium } = await import("playwright");
  const { createAdminClient, MEDIA_BUCKET } = await import("@/lib/supabase/admin");
  const { domainFromUrl, slugify } = await import("@/lib/utils");

  const db = createAdminClient();
  const domain = slugify(domainFromUrl(url)) || "site";
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const root = `captures/${domain}/${stamp}`;
  const browser = await chromium.launch({ headless: true });

  try {
    const desktop = await capturePage(browser, url, {
      width: 1440,
      height: 900,
      fullPage: false,
    });
    const mobile = await capturePage(browser, url, {
      width: 390,
      height: 844,
      isMobile: true,
      fullPage: false,
    });
    const fullPage = await capturePage(browser, url, {
      width: 1440,
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
    await page.addStyleTag({ content: CAPTURE_INJECTED_STYLES });
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
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined);
  await page.waitForTimeout(1000);
}
