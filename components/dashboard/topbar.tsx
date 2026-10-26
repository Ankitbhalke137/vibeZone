"use client";

import Link from "next/link";
import { Bell, Menu, MessageCircle, Moon, Search, Sun } from "lucide-react";
import { DashAvatar } from "./ui";
import type { DashMe } from "./sidebar";

export function Topbar({
  me,
  onMenu,
  light,
  onToggleTheme,
}: {
  me: DashMe;
  onMenu: () => void;
  light: boolean;
  onToggleTheme: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--vz-border)] bg-[var(--vz-bg)]/85 px-3 backdrop-blur-xl sm:px-5 lg:px-6">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        className="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--vz-border)] bg-[var(--vz-card)] text-[var(--vz-muted)] transition hover:text-[var(--vz-text)] lg:hidden"
      >
        <Menu size={17} />
      </button>

      {/* Search */}
      <form action="/notes" className="relative hidden w-full max-w-md sm:block">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--vz-muted-2)]"
        />
        <input
          name="search"
          type="search"
          placeholder="Search notes, events, seniors, placements…"
          className="h-9 w-full rounded-xl border border-[var(--vz-border)] bg-[var(--vz-card)] pl-9 pr-12 text-xs text-[var(--vz-text)] outline-none transition placeholder:text-[var(--vz-muted-2)] focus:border-[var(--vz-violet)]/60 focus:ring-2 focus:ring-[var(--vz-violet)]/15"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-[var(--vz-border)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--vz-muted-2)]">
          ⌘K
        </kbd>
      </form>

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/events"
          className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--vz-border)] bg-[var(--vz-card)] px-3 py-1.5 text-[10px] font-medium text-[var(--vz-muted)] transition hover:text-[var(--vz-text)] md:flex"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-[var(--vz-red)]" />
          Valorant Cup is live
        </Link>

        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative grid size-9 place-items-center rounded-xl border border-[var(--vz-border)] bg-[var(--vz-card)] text-[var(--vz-muted)] transition hover:text-[var(--vz-text)]"
        >
          <Bell size={15} />
          <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[var(--vz-violet)] text-[8px] font-bold text-white ring-2 ring-[var(--vz-bg)]">
            3
          </span>
        </Link>

        <Link
          href="/chat"
          aria-label="Messages"
          className="hidden size-9 place-items-center rounded-xl border border-[var(--vz-border)] bg-[var(--vz-card)] text-[var(--vz-muted)] transition hover:text-[var(--vz-text)] sm:grid"
        >
          <MessageCircle size={15} />
        </Link>

        <button
          type="button"
          aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
          title={light ? "Switch to dark mode" : "Switch to light mode"}
          aria-pressed={light}
          onClick={onToggleTheme}
          className="grid size-9 place-items-center rounded-xl border border-[var(--vz-border)] bg-[var(--vz-card)] text-[var(--vz-muted)] transition hover:text-[var(--vz-text)]"
        >
          {light ? <Moon size={15} /> : <Sun size={15} />}
        </button>

        <Link href={me ? "/profile" : "/login"} aria-label="Profile">
          <DashAvatar name={me?.name ?? "Guest"} avatarUrl={me?.avatarUrl} size="sm" className="ring-2 ring-[var(--vz-border)]" />
        </Link>
      </div>
    </header>
  );
}
