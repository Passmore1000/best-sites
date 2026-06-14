import {
  claimNextPipelineJob,
  completePipelineJob,
  failPipelineJob,
  toGenerateOptions,
} from "@/lib/jobs";
import type { PipelineJobResult, PipelineJobRow } from "@/lib/types";
import { generateListing } from "@/pipeline";

export async function processPipelineJob(job: PipelineJobRow): Promise<PipelineJobResult | null> {
  try {
    const result = await generateListing(job.url, toGenerateOptions(job.options));
    await completePipelineJob(job.id, result);
    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Pipeline failed";
    await failPipelineJob(job.id, message);
    return null;
  }
}

export async function runNextPipelineJob(): Promise<{
  job: PipelineJobRow;
  result: PipelineJobResult | null;
} | null> {
  const job = await claimNextPipelineJob();
  if (!job) return null;
  const result = await processPipelineJob(job);
  return { job, result };
}
