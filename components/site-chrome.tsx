"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const SiteHeader = () => {
  const pathname = usePathname();
  const isDetailPage = pathname.startsWith("/sites/");

  if (isDetailPage) return null;

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center px-5 sm:px-8">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          BestSites
        </Link>
      </div>
    </header>
  );
};

export const SiteFooter = () => (
  <footer className="border-t border-border">
    <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <span>Web design inspiration</span>
      <span>© {new Date().getFullYear()} BestSites</span>
    </div>
  </footer>
);
