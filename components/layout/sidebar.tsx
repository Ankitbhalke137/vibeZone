"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, LogIn, Plus, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/avatar";
import { ADMIN_NAV, MAIN_NAV, isItemActive } from "./nav";

export type ShellUser = {
  id: string;
  name: string;
  handle: string;
  role: string;
  avatarUrl: string | null;
  branch: string | null;
  year: number | null;
} | null;

export function Sidebar({
  me,
  badges,
  collapsed,
  onToggleCollapse,
  onNavigate,
  admin,
}: {
  me: ShellUser;
  badges: { messages: number; notifications: number };
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  admin?: boolean;
}) {
  const pathname = usePathname();
  const sections = admin ? ADMIN_NAV : MAIN_NAV;
  const canAdmin = me && ["moderator", "admin"].includes(me.role);

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center gap-2.5 px-4 pb-4 pt-5", collapsed && "justify-center px-2")}>
        <Link href={admin ? "/admin" : "/home"} onClick={onNavigate} className="flex items-center gap-2.5">
          <span className="vz-brand-gradient grid size-9 shrink-0 place-items-center rounded-xl text-sm font-black text-white shadow-lg shadow-primary/25">
            V
          </span>
          {!collapsed ? (
            <span className="leading-tight">
              <span className="block text-sm font-extrabold tracking-tight">VibeZone</span>
              <span className="block text-[10px] text-muted">Campus, but cooler.</span>
            </span>
          ) : null}
        </Link>
      </div>

      {!collapsed ? (
        <Link
          href="/create"
          onClick={onNavigate}
          className="mx-3 mb-3 flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-white shadow-[0_10px_24px_-14px_rgba(112,71,245,0.9)] transition hover:brightness-110"
        >
          <Plus size={14} /> Create
        </Link>
      ) : (
        <Link
          href="/create"
          onClick={onNavigate}
          aria-label="Create"
          className="mx-auto mb-3 grid size-9 place-items-center rounded-xl bg-primary text-white transition hover:brightness-110"
        >
          <Plus size={15} />
        </Link>
      )}

      <nav className="vz-scroll flex-1 overflow-y-auto px-2.5">
        {sections.map((section, sIndex) => (
          <div key={section.label ?? sIndex} className={cn(sIndex > 0 && "mt-4")}>
            {section.label && !collapsed ? (
              <p className="mb-1.5 px-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-2">
                {section.label}
              </p>
            ) : null}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = isItemActive(pathname, item);
                const count = item.badgeKey ? badges[item.badgeKey] : 0;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      aria-label={item.label}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted hover:bg-accent hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-lg transition",
                          active
                            ? "bg-primary text-white shadow-[0_6px_14px_-8px_rgba(112,71,245,0.9)]"
                            : "text-muted-2 group-hover:text-primary",
                        )}
                      >
                        <item.icon size={15} />
                      </span>
                      {!collapsed ? <span className="flex-1 truncate">{item.label}</span> : null}
                      {!collapsed && count > 0 ? (
                        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">
                          {count > 99 ? "99+" : count}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {canAdmin && !admin ? (
          <div className="mt-4">
            {!collapsed ? (
              <p className="mb-1.5 px-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-2">
                Staff
              </p>
            ) : null}
            <Link
              href="/admin"
              onClick={onNavigate}
              title={collapsed ? "Admin" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium text-muted transition hover:bg-accent hover:text-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-2">
                <Shield size={15} />
              </span>
              {!collapsed ? <span className="flex-1">Admin panel</span> : null}
            </Link>
          </div>
        ) : null}
      </nav>

      <div className="mt-auto border-t border-border p-2.5">
        {me ? (
          <Link
            href="/profile"
            onClick={onNavigate}
            title={collapsed ? me.name : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border border-border bg-card p-2 transition hover:border-primary/30",
              collapsed && "justify-center border-0 bg-transparent p-0",
            )}
          >
            <Avatar name={me.name} avatarUrl={me.avatarUrl} size="sm" status="online" />
            {!collapsed ? (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold">{me.name}</span>
                <span className="block truncate text-[10px] text-muted">
                  @{me.handle}
                  {me.branch ? ` · ${me.branch}` : ""}
                </span>
              </span>
            ) : null}
          </Link>
        ) : (
          <Link
            href="/login"
            onClick={onNavigate}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-white transition hover:brightness-110",
              collapsed && "size-9 p-0",
            )}
          >
            <LogIn size={14} /> {!collapsed ? "Sign in" : null}
          </Link>
        )}

        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-medium text-muted-2 transition hover:bg-accent hover:text-foreground",
              collapsed && "px-0",
            )}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            {!collapsed ? "Collapse" : null}
          </button>
        ) : null}
      </div>
    </div>
  );
}
