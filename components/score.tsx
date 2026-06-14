import { cn } from "@/lib/utils";
import type { ScoreKey, Scores } from "@/lib/types";

export function scoreColor(value: number): string {
  if (value >= 85) return "text-emerald-600";
  if (value >= 70) return "text-amber-600";
  if (value > 0) return "text-stone-500";
  return "text-stone-400";
}

function scoreBg(value: number): string {
  if (value >= 85) return "bg-emerald-500";
  if (value >= 70) return "bg-amber-500";
  if (value > 0) return "bg-stone-400";
  return "bg-stone-300";
}

/** Compact overall-score chip for cards. */
export function ScoreBadge({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-card/90 px-2 py-1 text-sm font-semibold backdrop-blur",
        scoreColor(value),
        className,
      )}
    >
      {value}
      <span className="text-xs font-normal text-muted-foreground">/100</span>
    </span>
  );
}

const LABELS: Record<ScoreKey, string> = {
  design: "Design",
  mobile: "Mobile",
  trust: "Trust",
  conversion: "Conversion",
  performance: "Performance",
  overall: "Overall",
};

/** Full score breakdown used on the detail page. */
export function ScoreGrid({ scores }: { scores: Scores }) {
  const keys: ScoreKey[] = ["design", "mobile", "trust", "conversion", "performance"];
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {keys.map((key) => (
        <div key={key} className="rounded-xl border border-border bg-card p-4">
          <div className={cn("text-3xl font-semibold tabular-nums", scoreColor(scores[key]))}>
            {scores[key]}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">{LABELS[key]}</div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", scoreBg(scores[key]))}
              style={{ width: `${scores[key]}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
