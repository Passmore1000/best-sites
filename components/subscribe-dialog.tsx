"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type SubscribeDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const SubscribeDialog = ({ open, onClose }: SubscribeDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
      setSubmitted(false);
      return;
    }

    dialog.close();
  }, [open]);

  const handleClose = () => {
    dialogRef.current?.close();
    onClose();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-foreground/20 backdrop:backdrop-blur-sm open:flex open:items-center open:justify-center"
      aria-labelledby="subscribe-title"
    >
      <div className="mx-5 w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="subscribe-title" className="text-xl font-semibold tracking-tight">
              Stay inspired
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              New sites, weekly. No noise.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close subscribe dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <p className="text-sm text-muted-foreground">
            You&apos;re on the list. We&apos;ll be in touch soon.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="sr-only">Email address</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="you@studio.com"
                className="h-12 w-full rounded-full border border-border bg-muted/50 px-5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
              />
            </label>
            <button
              type="submit"
              className="h-12 w-full rounded-full bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
};
