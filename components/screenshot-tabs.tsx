"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Shot {
  key: string;
  label: string;
  url: string;
  narrow?: boolean;
}

export const ScreenshotTabs = ({ shots }: { shots: Shot[] }) => {
  const [active, setActive] = useState(shots[0]?.key);
  if (shots.length === 0) return null;

  const current = shots.find((shot) => shot.key === active) ?? shots[0];
  const showTabs = shots.length > 1;

  return (
    <div>
      {showTabs && (
        <div className="mb-6 flex flex-wrap gap-2">
          {shots.map((shot) => (
            <button
              key={shot.key}
              type="button"
              onClick={() => setActive(shot.key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                current.key === shot.key
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {shot.label}
            </button>
          ))}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl bg-muted">
        <div className={cn("mx-auto", current.narrow ? "max-w-[390px]" : "w-full")}>
          <img src={current.url} alt={`${current.label} screenshot`} className="h-auto w-full" />
        </div>
      </div>
    </div>
  );
};
