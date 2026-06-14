/**
 * Pipeline worker.
 *
 *   pnpm pipeline <url>     Run capture synchronously for one URL (CLI shortcut).
 *   pnpm worker             Poll the job queue and process pending captures.
 *
 * Loads env from .env.local. Playwright runs here — not on Vercel serverless.
 */
import { config } from "dotenv";
import { generateListing } from "../pipeline";
import { runNextPipelineJob } from "./process";

config({ path: ".env.local" });

const POLL_MS = 3_000;

async function runOnce(url: string) {
  console.log(`▶ Generating listing for ${url} ...`);
  const result = await generateListing(url);
  console.log(`✓ Draft created: ${result.name}`);
  console.log(`  id:   ${result.id}`);
  console.log(`  slug: ${result.slug}`);
  console.log(`  Review at /admin/${result.id}`);
}

async function runDaemon() {
  console.log("▶ Pipeline worker started — waiting for jobs …");
  for (;;) {
    try {
      const outcome = await runNextPipelineJob();
      if (outcome) {
        const label = outcome.result?.name ?? outcome.job.url;
        if (outcome.result) {
          console.log(`✓ Job ${outcome.job.id.slice(0, 8)} completed: ${label}`);
        } else {
          console.error(`✗ Job ${outcome.job.id.slice(0, 8)} failed: ${outcome.job.url}`);
        }
        continue;
      }
    } catch (e) {
      console.error("✗ Worker error:", (e as Error).message);
    }
    await sleep(POLL_MS);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const args = process.argv.slice(2);
  const daemon = args.includes("--daemon") || args[0] === "daemon" || process.env.npm_lifecycle_event === "worker";
  const url = args.find((arg) => !arg.startsWith("-") && arg !== "daemon");

  if (daemon) {
    await runDaemon();
    return;
  }

  if (!url) {
    console.error("Usage:");
    console.error("  pnpm pipeline <url>   Capture one URL immediately");
    console.error("  pnpm worker           Process queued jobs from /admin/new");
    process.exit(1);
  }

  await runOnce(url);
}

main().catch((err) => {
  console.error("✗ Pipeline failed:", err);
  process.exit(1);
});
