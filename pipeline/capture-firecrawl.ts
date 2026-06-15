import type { CaptureResult } from "./types";
import {
  CAPTURE_INJECTED_STYLES,
  captureStoragePath,
  downloadAndUploadScreenshot,
} from "./capture-storage";

const FIRECRAWL_API = "https://api.firecrawl.dev/v2/scrape";

type ScreenshotRequest = {
  mobile?: boolean;
  viewport: { width: number; height: number };
  filename: string;
};

export const canUseFirecrawl = () => Boolean(process.env.FIRECRAWL_API_KEY?.trim());

export async function captureWithFirecrawl(url: string): Promise<CaptureResult> {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is required for Firecrawl capture.");
  }

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

    const storagePath = captureStoragePath(url, shot.filename);
    const uploaded = await downloadAndUploadScreenshot(url, screenshotUrl, storagePath);
    if (!uploaded) continue;

    media.push({
      kind: shot.kind,
      storagePath: uploaded,
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
  const hideScrollbarScript = `
    window.scrollTo(0, 0);
    const style = document.createElement('style');
    style.textContent = ${JSON.stringify(CAPTURE_INJECTED_STYLES)};
    document.head.appendChild(style);
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  `;

  const response = await fetch(FIRECRAWL_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url,
      onlyMainContent: false,
      waitFor: 4000,
      mobile: shot.mobile ?? false,
      actions: [
        { type: "executeJavascript", script: hideScrollbarScript },
        { type: "wait", milliseconds: 1000 },
        {
          type: "screenshot",
          fullPage: false,
          viewport: shot.viewport,
          quality: 90,
        },
      ],
    }),
  });

  const payload = (await response.json()) as {
    success?: boolean;
    error?: string;
    data?: {
      screenshot?: string;
      actions?: { screenshots?: string[] };
    };
  };

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? `Firecrawl screenshot failed (${response.status})`);
  }

  return (
    payload.data?.actions?.screenshots?.[0] ??
    payload.data?.screenshot ??
    null
  );
}
