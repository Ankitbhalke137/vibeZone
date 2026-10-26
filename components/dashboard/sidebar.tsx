"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Gamepad2,
  GraduationCap,
  Home,
  LogIn,
  Megaphone,
  MessagesSquare,
  PackageSearch,
  Radio,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashAvatar } from "./ui";

export type DashMe = {
  name: string;
  handle: string;
  role: string;
  avatarUrl: string | null;
  branch: string | null;
  year: number | null;
} | null;

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  badge?: string;
  dot?: boolean;
  live?: boolean;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/announcements", label: "Announcements", icon: Megaphone, badge: "7" },
  { href: "/chat", label: "Chat & DMs", icon: MessagesSquare, dot: true },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/notes", label: "Notes", icon: BookOpen },
  { href: "/polls", label: "Games & Polls", icon: Gamepad2 },
  { href: "/events", label: "Live", icon: Radio, live: true },
  { href: "/lost-and-found", label: "Lost & Found", icon: PackageSearch },
  { href: "/mentorship", label: "Seniors Connect", icon: GraduationCap },
  { href: "/feedback", label: "Anonymous Feedback", icon: Shield },
];

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  if (item.live) return false; // decorative shortcut to /events
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function Sidebar({ me, onNavigate }: { me: DashMe; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-5 pb-5 pt-5"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#d946ef] text-sm font-black text-white shadow-lg shadow-violet-600/30">
          V
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-bold tracking-tight text-[var(--vz-text)]">VibeZone</span>
          <span className="block text-[10px] text-[var(--vz-muted)]">Campus, but cooler.</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="vz-scroll flex-1 overflow-y-auto px-3">
        <ul className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = isActive(pathname, item);
            return (
              <li key={`${item.label}-${item.href}`}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition",
                    active
                      ? "bg-[var(--vz-card-3)] text-[var(--vz-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                      : "text-[var(--vz-muted)] hover:bg-[var(--vz-card)] hover:text-[var(--vz-text)]",
                  )}
                >
                  <item.icon
                    size={16}
                    className={cn(
                      "shrink-0 transition",
                      active ? "text-[var(--vz-violet-2)]" : "text-[var(--vz-muted-2)] group-hover:text-[var(--vz-violet-2)]",
                    )}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-[var(--vz-violet)] px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">
                      {item.badge}
                    </span>
                  ) : null}
                  {item.dot ? <span className="size-1.5 rounded-full bg-[var(--vz-green)]" /> : null}
                  {item.live ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--vz-red)]/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[var(--vz-red)]">
                      <span className="size-1 rounded-full bg-[var(--vz-red)]" />
                      Live
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User card */}
      <div className="p-3">
        {me ? (
          <Link
            href="/profile"
            onClick={onNavigate}
            className="flex items-center gap-2.5 rounded-xl border border-[var(--vz-border)] bg-[var(--vz-card)] p-2.5 transition hover:border-[var(--vz-violet)]/40"
          >
            <DashAvatar name={me.name} avatarUrl={me.avatarUrl} size="md" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-[var(--vz-text)]">{me.name}</span>
              <span className="block truncate text-[10px] text-[var(--vz-muted)]">
                @{me.handle}
                {me.branch ? ` · ${me.branch}` : ""}
                {me.year ? ` '${String(me.year).padStart(2, "0")}` : ""}
              </span>
              <span className="mt-1 flex items-center gap-1 text-[9px] font-medium text-[var(--vz-green)]">
                <BadgeCheck size={10} /> Verified campus email
              </span>
            </span>
          </Link>
        ) : (
          <Link
            href="/login"
            onClick={onNavigate}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a855f7] px-3 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:opacity-90"
          >
            <LogIn size={14} /> Sign in with campus email
          </Link>
        )}
      </div>
    </div>
  );
}
