"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ModalShellProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
  dark?: boolean;
};

export const ModalShell = ({
  open,
  onClose,
  children,
  className,
  labelledBy,
  dark = false,
}: ModalShellProps) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        onClick={onClose}
        className={cn(
          "absolute inset-0 backdrop-blur-md",
          dark ? "bg-black/60" : "bg-foreground/20",
        )}
        aria-label="Close dialog"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(
          "relative flex max-h-[min(88vh,900px)] w-full flex-col overflow-hidden shadow-2xl",
          dark
            ? "rounded-2xl border border-white/10 bg-[#1a1a1a] text-white"
            : "rounded-2xl border border-border bg-background text-foreground",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
};
