import type { CaptureResult } from "./types";
import {
  CAPTURE_INJECTED_STYLES,
  captureStoragePath,
  downloadAndUploadScreenshot,
} from "./capture-storage";

const MICROLINK_API = "https://api.microlink.io";

type ScreenshotRequest = {
  mobile?: boolean;
  viewport: { width: number; height: number };
  filename: string;
};

export const canUseMicrolink = () => true;

export async function captureWithMicrolink(url: string): Promise<CaptureResult> {
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
    const screenshotUrl = await requestScreenshot(url, shot);
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
    throw new Error("Microlink did not return any screenshots for this URL.");
  }

  return { media };
}

async function requestScreenshot(url: string, shot: ScreenshotRequest): Promise<string | null> {
  const params = new URLSearchParams({
    url,
    screenshot: "true",
    meta: "false",
    animations: "false",
    waitForTimeout: "4000",
    "viewport.width": String(shot.viewport.width),
    "viewport.height": String(shot.viewport.height),
    "viewport.deviceScaleFactor": "1",
    "screenshot.type": "png",
    styles: CAPTURE_INJECTED_STYLES,
  });

  if (shot.mobile) {
    params.set("viewport.isMobile", "true");
  }

  const headers: HeadersInit = {};
  const apiKey = process.env.MICROLINK_API_KEY?.trim();
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  const response = await fetch(`${MICROLINK_API}?${params.toString()}`, { headers });
  const payload = (await response.json()) as {
    status?: string;
    message?: string;
    data?: { screenshot?: { url?: string } };
  };

  if (payload.status !== "success") {
    throw new Error(payload.message ?? `Microlink screenshot failed (${response.status})`);
  }

  return payload.data?.screenshot?.url ?? null;
}
