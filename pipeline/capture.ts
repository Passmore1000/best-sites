import type { CaptureResult } from "./types";
import { chromium, type Browser, type Page } from "playwright";
import { createAdminClient, MEDIA_BUCKET } from "@/lib/supabase/admin";
import { domainFromUrl, slugify } from "@/lib/utils";

/**
 * Website capture.
 *
 * Captures the views the inspiration directory needs today: desktop, mobile, and
 * full-page screenshots. This is designed for the CLI worker/local admin flow;
 * long-term production should run it in a worker/container, not Vercel serverless.
 */
export async function captureWebsite(url: string): Promise<CaptureResult> {
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
  browser: Browser,
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

async function gotoSettled(page: Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined);
  await page.waitForTimeout(750);
}
