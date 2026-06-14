import Link from "next/link";
import { SignOutButton } from "@/components/admin/sign-out-button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-semibold">
              BestSites <span className="text-muted-foreground">Admin</span>
            </Link>
            <nav className="hidden gap-4 text-sm text-muted-foreground sm:flex">
              <Link href="/admin" className="hover:text-foreground">Listings</Link>
              <Link href="/admin/new" className="hover:text-foreground">Add inspiration</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">View site ↗</Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
