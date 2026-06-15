"use client";

import { useEffect, useMemo, useState } from "react";
import { Code2, Search } from "lucide-react";
import { ModalShell } from "@/components/modal-shell";
import { cn } from "@/lib/utils";
import {
  EMPTY_FILTERS,
  FILTER_TABS,
  type FilterCatalog,
  type FilterSelection,
  type FilterTab,
  type QuickPill,
  deriveQuickPills,
  isFilterValueActive,
  isQuickPillActive,
  toggleFilterValue,
  toggleQuickPill,
} from "@/lib/filters";

type FilterDialogProps = {
  open: boolean;
  catalog: FilterCatalog;
  applied: FilterSelection;
  onClose: () => void;
  onApply: (selection: FilterSelection) => void;
};

export const FilterDialog = ({
  open,
  catalog,
  applied,
  onClose,
  onApply,
}: FilterDialogProps) => {
  const [draft, setDraft] = useState<FilterSelection>(applied);
  const [activeTab, setActiveTab] = useState<FilterTab>("types");

  const quickPills = useMemo(() => deriveQuickPills(catalog), [catalog]);
  const tabOptions = catalog[activeTab];

  useEffect(() => {
    if (open) {
      setDraft(applied);
      setActiveTab("types");
    }
  }, [open, applied]);

  const handleDone = () => {
    onApply(draft);
    onClose();
  };

  const handleToggle = (tab: FilterTab, value: string) => {
    setDraft((current) => toggleFilterValue(current, tab, value));
  };

  const handlePillToggle = (pill: QuickPill) => {
    setDraft((current) => toggleQuickPill(current, pill));
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      dark
      className="max-w-2xl"
      labelledBy="filter-dialog-title"
    >
      <div id="filter-dialog-title" className="sr-only">
        Filter websites
      </div>

      <div className="space-y-4 border-b border-white/10 p-5 sm:p-6">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            value={draft.query}
            onChange={(event) =>
              setDraft((current) => ({ ...current, query: event.target.value }))
            }
            placeholder="Minimal, Inter, etc."
            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/25"
          />
        </label>

        {quickPills.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {quickPills.map((pill) => {
              const active = isQuickPillActive(draft, pill);
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => handlePillToggle(pill)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-white bg-white text-black"
                      : "border-white/20 text-white/80 hover:border-white/40 hover:text-white",
                  )}
                >
                  <PillIcon label={pill.label} />
                  {pill.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-white/10 px-5 sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTER_TABS.map((tab) => {
          const count = catalog[tab.id].length;
          if (count === 0) return null;

          const selectedCount = draft[tab.id].length;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-4 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-white text-white"
                  : "border-transparent text-white/45 hover:text-white/70",
              )}
            >
              <Code2 className="h-3.5 w-3.5" />
              {tab.label}
              {selectedCount > 0 && (
                <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] text-white/80">
                  {selectedCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2 sm:px-6">
        {tabOptions.length === 0 ? (
          <p className="py-10 text-center text-sm text-white/40">No tags in this group yet.</p>
        ) : (
          <ul>
            {tabOptions.map((option) => {
              const active = isFilterValueActive(draft, activeTab, option.value);
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => handleToggle(activeTab, option.value)}
                    className={cn(
                      "flex w-full items-center justify-between gap-4 rounded-lg px-2 py-3 text-left text-sm transition-colors",
                      active ? "bg-white/10 text-white" : "text-white/85 hover:bg-white/5",
                    )}
                  >
                    <span>{option.label}</span>
                    <span className="text-white/35">{option.count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-white/10 p-5 sm:p-6">
        <button
          type="button"
          onClick={() => setDraft(EMPTY_FILTERS)}
          className="text-sm text-white/45 transition-colors hover:text-white/75"
        >
          Clear all
        </button>
        <button
          type="button"
          onClick={handleDone}
          className="inline-flex h-11 items-center rounded-full bg-white px-8 text-sm font-semibold text-black transition-opacity hover:opacity-90"
        >
          Done
        </button>
      </div>
    </ModalShell>
  );
};

const PillIcon = ({ label }: { label: string }) => {
  const initial = label.charAt(0).toUpperCase();
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px] font-semibold">
      {initial}
    </span>
  );
};
