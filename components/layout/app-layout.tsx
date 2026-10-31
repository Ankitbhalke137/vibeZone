"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MobileNav } from "./mobile-nav";
import { Sidebar, type ShellUser } from "./sidebar";
import { Topbar } from "./topbar";

const COLLAPSE_KEY = "vz-sidebar-collapsed";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const admin = pathname.startsWith("/admin");
  const [me, setMe] = useState<ShellUser>(null);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => {
        if (alive) setMe(d.user ?? null);
      })
      .catch(() => {});
    fetch("/api/notifications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive) setUnread(d?.unreadCount ?? 0);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [pathname]);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* storage blocked */
    }
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="flex min-h-dvh">
        <aside
          className={cn(
            "sticky top-0 hidden h-dvh shrink-0 border-r border-border bg-[var(--vz-bg-soft)] transition-[width] duration-200 lg:block",
            collapsed ? "w-[76px]" : "w-[252px]",
          )}
        >
          <Sidebar
            me={me}
            badges={{ messages: 0, notifications: unread }}
            collapsed={collapsed}
            onToggleCollapse={toggleCollapsed}
            admin={admin}
          />
        </aside>

        {open ? (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <aside className="absolute left-0 top-0 h-full w-[280px] border-r border-border bg-[var(--vz-bg-soft)] shadow-2xl">
              <Sidebar
                me={me}
                badges={{ messages: 0, notifications: unread }}
                collapsed={false}
                onNavigate={() => setOpen(false)}
                admin={admin}
              />
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar me={me} unread={unread} onMenu={() => setOpen(true)} admin={admin} />
          <main className="vz-main-safe flex-1 px-3 py-4 sm:px-5 lg:px-6 lg:py-6">
            <div className="mx-auto w-full max-w-[1500px]">{children}</div>
          </main>
          <footer className="mt-auto border-t border-border px-4 py-4 text-[10px] text-muted-2 lg:px-6">
            <div className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center justify-between gap-2">
              <span>VibeZone · Built by students, for students.</span>
              <div className="flex items-center gap-4">
                <Link href="/feedback" className="transition hover:text-foreground">
                  Community guidelines
                </Link>
                <Link href="/settings" className="transition hover:text-foreground">
                  Privacy
                </Link>
                <Link href="/feedback" className="transition hover:text-foreground">
                  Report an issue
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
