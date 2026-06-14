import { createAdminClient } from "@/lib/supabase/admin";
import type {
  PipelineJobOptions,
  PipelineJobResult,
  PipelineJobRow,
  PipelineJobStatus,
} from "@/lib/types";
import type { GenerateListingOptions } from "@/pipeline";

export type { PipelineJobOptions, PipelineJobResult, PipelineJobRow, PipelineJobStatus };

export function toGenerateOptions(options: PipelineJobOptions): GenerateListingOptions {
  return {
    industry: options.industry,
    summary: options.summary,
    styles: options.styles,
    sections: options.sections,
    publish: options.publish,
  };
}

export async function createPipelineJob(
  url: string,
  options: PipelineJobOptions = {},
  createdBy?: string | null,
): Promise<PipelineJobRow> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("pipeline_jobs")
    .insert({
      url: url.trim(),
      options,
      created_by: createdBy ?? null,
    })
    .select("*")
    .single();
  if (error || !data) throw error ?? new Error("Failed to create pipeline job");
  return data;
}

export async function getPipelineJob(id: string): Promise<PipelineJobRow | null> {
  const db = createAdminClient();
  const { data, error } = await db.from("pipeline_jobs").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

/** Atomically claim the oldest pending job for the worker. */
export async function claimNextPipelineJob(): Promise<PipelineJobRow | null> {
  const db = createAdminClient();
  const { data: pending, error: selectError } = await db
    .from("pipeline_jobs")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (selectError) throw selectError;
  if (!pending) return null;

  const startedAt = new Date().toISOString();
  const { data: claimed, error: updateError } = await db
    .from("pipeline_jobs")
    .update({ status: "running", started_at: startedAt })
    .eq("id", pending.id)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();
  if (updateError) throw updateError;
  return claimed;
}

export async function completePipelineJob(
  id: string,
  result: PipelineJobResult,
): Promise<void> {
  const db = createAdminClient();
  const { error } = await db
    .from("pipeline_jobs")
    .update({
      status: "completed",
      result,
      error: null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function failPipelineJob(id: string, message: string): Promise<void> {
  const db = createAdminClient();
  const { error } = await db
    .from("pipeline_jobs")
    .update({
      status: "failed",
      error: message,
      completed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function listRecentPipelineJobs(limit = 10): Promise<PipelineJobRow[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("pipeline_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export function jobStatusLabel(status: PipelineJobStatus): string {
  switch (status) {
    case "pending":
      return "Queued";
    case "running":
      return "Capturing";
    case "completed":
      return "Done";
    case "failed":
      return "Failed";
  }
}
