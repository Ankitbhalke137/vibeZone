import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/users", label: "Users" },
];

/**
 * FR-AUTH-005 — server-side role gate for the whole /admin tree.
 * Session must exist (middleware) AND role must be moderator+ (checked here,
 * fresh from the DB, not from the possibly-stale JWT claim).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");

  if (!hasRole(user, "moderator")) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-danger/10 text-danger">
          <Shield size={22} aria-hidden />
        </span>
        <h1 className="text-xl font-bold">Admins only</h1>
        <p className="max-w-sm text-sm text-muted">
          Your account doesn&apos;t have moderator or admin rights. Ask a campus admin to grant
          access.
        </p>
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          ← Back home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Admin dashboard</h1>
          <p className="mt-0.5 text-sm text-muted">
            Signed in as <span className="font-medium text-foreground">@{user.handle}</span> ·{" "}
            {user.role}
          </p>
        </div>
      </header>

      <nav className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium text-muted transition hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
