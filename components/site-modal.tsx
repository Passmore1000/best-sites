"use client";

import { ArrowUpRight, X } from "lucide-react";
import { ModalShell } from "@/components/modal-shell";
import { ScreenshotTabs, type Shot } from "@/components/screenshot-tabs";
import { mediaOf } from "@/lib/queries";
import { mediaUrl } from "@/lib/supabase/admin";
import type { WebsiteWithRelations } from "@/lib/types";

type SiteModalProps = {
  site: WebsiteWithRelations | null;
  onClose: () => void;
};

export const SiteModal = ({ site, onClose }: SiteModalProps) => {
  if (!site) return null;

  const shots: Shot[] = [];
  const pushShot = (kind: Parameters<typeof mediaOf>[1], label: string, narrow?: boolean) => {
    const url = mediaUrl(mediaOf(site, kind)?.storage_path);
    if (url) shots.push({ key: kind, label, url, narrow });
  };

  pushShot("desktop_shot", "Desktop");
  pushShot("mobile_shot", "Mobile", true);
  pushShot("fullpage_shot", "Full page");

  return (
    <ModalShell
      open={!!site}
      onClose={onClose}
      className="max-w-5xl"
      labelledBy="site-modal-title"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 id="site-modal-title" className="truncate text-lg font-semibold tracking-tight">
            {site.name}
          </h2>
          {site.domain && (
            <p className="truncate text-sm text-muted-foreground">{site.domain}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Visit
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close site preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
        {shots.length > 0 ? (
          <ScreenshotTabs shots={shots} />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            No screenshot yet
          </div>
        )}
      </div>
    </ModalShell>
  );
};
