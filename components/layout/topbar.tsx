"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Bell,
  Bookmark,
  ChevronDown,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Plus,
  Search,
  Settings,
  Shield,
  Sun,
  UserRound,
  FileUp,
  PackagePlus,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Dropdown } from "@/components/ui/dropdown";
import type { ShellUser } from "./sidebar";

export function Topbar({
  me,
  unread,
  onMenu,
  admin,
}: {
  me: ShellUser;
  unread: number;
  onMenu: () => void;
  admin?: boolean;
}) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/");
    router.refresh();
  }

  const canAdmin = me && ["moderator", "admin"].includes(me.role);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2.5 border-b border-border bg-background/85 px-3 backdrop-blur-xl sm:gap-3 sm:px-5 lg:px-6">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open navigation"
        className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-card text-muted transition hover:text-foreground lg:hidden"
      >
        <Menu size={17} />
      </button>

      <Link href="/home" className="flex shrink-0 items-center gap-2 lg:hidden">
        <span className="vz-brand-gradient grid size-8 place-items-center rounded-lg text-xs font-black text-white">
          V
        </span>
      </Link>

      <form action="/explore" role="search" className="relative hidden w-full max-w-md sm:block">
        <Search
          size={14}
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2"
        />
        <input
          name="q"
          type="search"
          placeholder="Search people, notes, events, tags…"
          className="h-9 w-full rounded-xl border border-border bg-card pl-9 pr-14 text-xs text-foreground outline-none transition placeholder:text-muted-2 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border px-1.5 py-0.5 text-[9px] font-medium text-muted-2">
          ⌘K
        </kbd>
      </form>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <Link
          href="/explore"
          aria-label="Search"
          className="grid size-9 place-items-center rounded-xl border border-border bg-card text-muted transition hover:text-foreground sm:hidden"
        >
          <Search size={16} />
        </Link>

        <Dropdown
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-2.5 text-xs font-semibold text-white shadow-[0_8px_20px_-12px_rgba(112,71,245,0.9)] transition hover:brightness-110 sm:px-3.5"
            >
              <Plus size={15} /> <span className="hidden sm:inline">Create</span>
              <ChevronDown size={12} className="hidden sm:block" />
            </button>
          )}
        >
          {(close) => (
            <div className="flex flex-col">
              <Link
                href="/create"
                onClick={close}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition hover:bg-accent"
              >
                <Plus size={14} className="text-primary" /> New post
              </Link>
              <Link
                href="/create?tab=note"
                onClick={close}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition hover:bg-accent"
              >
                <FileUp size={14} className="text-primary" /> Share notes
              </Link>
              <Link
                href="/create?tab=lost"
                onClick={close}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition hover:bg-accent"
              >
                <PackagePlus size={14} className="text-primary" /> Lost &amp; found
              </Link>
              <Link
                href="/bookmarks"
                onClick={close}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition hover:bg-accent"
              >
                <Bookmark size={14} className="text-primary" /> Saved items
              </Link>
            </div>
          )}
        </Dropdown>

        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative grid size-9 place-items-center rounded-xl border border-border bg-card text-muted transition hover:text-foreground"
        >
          <Bell size={16} />
          {unread > 0 ? (
            <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[8px] font-bold leading-4 text-white ring-2 ring-background">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Link>

        <Link
          href="/chat"
          aria-label="Messages"
          className="hidden size-9 place-items-center rounded-xl border border-border bg-card text-muted transition hover:text-foreground sm:grid"
        >
          <MessageCircle size={16} />
        </Link>

        <button
          type="button"
          aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="hidden size-9 place-items-center rounded-xl border border-border bg-card text-muted transition hover:text-foreground sm:grid"
        >
          {mounted && resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <Dropdown
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-label="Account menu"
              className="ml-0.5 rounded-full ring-2 ring-primary/20 transition hover:ring-primary/40"
            >
              <Avatar name={me?.name ?? "Guest"} avatarUrl={me?.avatarUrl} size="sm" />
            </button>
          )}
        >
          {(close) => (
            <div className="flex flex-col">
              {me ? (
                <div className="mb-1 border-b border-border px-2.5 pb-2 pt-1">
                  <p className="truncate text-xs font-semibold">{me.name}</p>
                  <p className="truncate text-[10px] text-muted">@{me.handle}</p>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={close}
                  className="mb-1 rounded-lg bg-primary px-2.5 py-2 text-center text-xs font-semibold text-white"
                >
                  Sign in
                </Link>
              )}
              <Link href="/profile" onClick={close} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition hover:bg-accent">
                <UserRound size={14} /> Profile
              </Link>
              <Link href="/bookmarks" onClick={close} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition hover:bg-accent">
                <Bookmark size={14} /> Saved
              </Link>
              <Link href="/settings" onClick={close} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition hover:bg-accent">
                <Settings size={14} /> Settings
              </Link>
              {canAdmin || admin ? (
                <Link href="/admin" onClick={close} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition hover:bg-accent">
                  <Shield size={14} /> Admin panel
                </Link>
              ) : null}
              {me ? (
                <button
                  type="button"
                  onClick={() => {
                    close();
                    void signOut();
                  }}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-danger transition hover:bg-danger/10"
                >
                  <LogOut size={14} /> Sign out
                </button>
              ) : null}
            </div>
          )}
        </Dropdown>
      </div>
    </header>
  );
}
