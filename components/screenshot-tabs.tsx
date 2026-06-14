"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Shot {
  key: string;
  label: string;
  url: string;
  /** mobile shots render in a narrow frame */
  narrow?: boolean;
}

export function ScreenshotTabs({ shots }: { shots: Shot[] }) {
  const [active, setActive] = useState(shots[0]?.key);
  if (shots.length === 0) return null;
  const current = shots.find((s) => s.key === active) ?? shots[0];

  return (
    <div>
      <div className="mb-4 inline-flex rounded-lg border border-border bg-card p-1">
        {shots.map((s) => (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              current.key === s.key ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-muted">
        <div className={cn("mx-auto", current.narrow ? "max-w-[390px]" : "w-full")}>
          <img
            src={current.url}
            alt={`${current.label} screenshot`}
            className="h-auto w-full"
          />
        </div>
      </div>
    </div>
  );
}
