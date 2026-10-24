"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Home, CalendarDays, MessagesSquare, BookOpen, User, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

type Me = { handle: string; role: string; onboardedAt: string | null } | null;

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/chat", label: "Chat", icon: MessagesSquare },
  { href: "/notes", label: "Notes", icon: BookOpen },
  { href: "/profile", label: "Me", icon: User },
];

export function ShellNav() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [me, setMe] = useState<Me>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setMe(d.user))
      .catch(() => setMe(null));
  }, [pathname]);

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="grid size-7 place-items-center rounded-lg bg-primary text-sm text-primary-foreground">
              V
            </span>
            VibeZone
          </Link>

          <div className="flex items-center gap-2">
            {me ? (
              <span className="hidden max-w-[9rem] truncate text-xs text-muted sm:block">
                @{me.handle}
                {me.role !== "student" ? ` · ${me.role}` : ""}
              </span>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                Sign in
              </Link>
            )}
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="grid size-8 place-items-center rounded-lg border border-border text-muted transition hover:text-foreground"
            >
              {mounted && (resolvedTheme === "dark" ? <Sun size={15} /> : <Moon size={15} />)}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <ul className="mx-auto flex max-w-3xl items-stretch justify-around">
          {nav.map((n) => {
            const active = pathname === n.href;
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className={cn(
                    "flex min-w-14 flex-col items-center gap-0.5 px-2 py-2.5 text-[11px]",
                    active ? "font-semibold text-primary" : "text-muted",
                  )}
                >
                  <n.icon size={19} aria-hidden />
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
