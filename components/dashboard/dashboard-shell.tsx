"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar, type DashMe } from "./sidebar";
import { Topbar } from "./topbar";

const THEME_KEY = "vz-dash-theme";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<DashMe>(null);
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => {
        if (alive) setMe(d.user ?? null);
      })
      .catch(() => {
        if (alive) setMe(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Dashboard appearance is local: it always starts dark (matching the
  // reference design) and remembers an explicit light preference.
  useEffect(() => {
    try {
      if (localStorage.getItem(THEME_KEY) === "light") setLight(true);
    } catch {
      /* storage blocked — stay dark */
    }
  }, []);

  function toggleTheme() {
    setLight((v) => {
      const next = !v;
      try {
        localStorage.setItem(THEME_KEY, next ? "light" : "dark");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <div className={cn("vz-dash min-h-dvh", light && "vz-light")}>
      <div className="flex min-h-dvh">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-dvh w-[236px] shrink-0 border-r border-[var(--vz-border)] bg-[var(--vz-bg-soft)] lg:block">
          <Sidebar me={me} />
        </aside>

        {/* Mobile drawer */}
        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-[268px] border-r border-[var(--vz-border)] bg-[var(--vz-bg-soft)] shadow-2xl">
              <Sidebar me={me} onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        ) : null}

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar me={me} onMenu={() => setOpen(true)} light={light} onToggleTheme={toggleTheme} />
          <div className="flex-1 px-3 pb-8 pt-4 sm:px-5 lg:px-6">{children}</div>
          <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-[var(--vz-border)] px-5 py-4 text-[10px] text-[var(--vz-muted-2)] lg:px-6">
            <span>VibeZone · Built by students, for students.</span>
            <div className="flex items-center gap-4">
              <Link href="/feedback" className="transition hover:text-[var(--vz-text)]">
                Community guidelines
              </Link>
              <Link href="/feedback" className="transition hover:text-[var(--vz-text)]">
                Privacy
              </Link>
              <Link href="/feedback" className="transition hover:text-[var(--vz-text)]">
                Report an issue
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
