"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellRing,
  CalendarDays,
  CheckCheck,
  Mail,
  Megaphone,
  Shield,
  Trophy,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

const TYPE_ICON: Record<string, React.ElementType> = {
  dm: Mail,
  announcement: Megaphone,
  event_reminder: CalendarDays,
  poll_open: Trophy,
  mentorship: UserRound,
  moderation: Shield,
  system: Bell,
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/notifications", { cache: "no-store" })
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => {
        setNotifications(d?.notifications ?? []);
        setUnreadCount(d?.unreadCount ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(
    () => (tab === "unread" ? notifications.filter((n) => !n.readAt) : notifications),
    [notifications, tab],
  );

  async function markAllRead() {
    if (busy || unreadCount === 0) return;
    setBusy(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      if (!res.ok) throw new Error();
      setNotifications((cur) => cur.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
      setUnreadCount(0);
      toast({ title: "All caught up", tone: "success" });
    } catch {
      toast({ title: "Couldn't mark notifications read", tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function markOne(id: string) {
    const current = notifications.find((n) => n.id === id);
    if (!current || current.readAt) return;
    setNotifications((cur) =>
      cur.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
    );
    setUnreadCount((n) => Math.max(0, n - 1));
    // Best-effort: the API marks all read, so only call when needed.
    void fetch("/api/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ read: true }),
    }).catch(() => {});
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <PageHeader
        eyebrow="Your activity"
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}` : "You're all caught up."}
        actions={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => void markAllRead()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-[10.5px] font-semibold text-muted transition hover:text-foreground disabled:opacity-50"
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          ) : null
        }
      />

      <Tabs
        value={tab}
        onChange={(v) => setTab(v as "all" | "unread")}
        items={[
          { value: "all", label: "All", count: notifications.length },
          { value: "unread", label: "Unread", count: unreadCount },
        ]}
      />

      {loading ? (
        <div className="vz-panel space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-2.5 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={tab === "unread" ? <CheckCheck size={20} /> : <Bell size={20} />}
          title={tab === "unread" ? "No unread notifications" : "No notifications yet"}
          description="Mentions, replies, event reminders and mentorship updates will show up here."
        />
      ) : (
        <ul className="vz-panel divide-y divide-border overflow-hidden">
          {visible.map((n) => {
            const Icon = TYPE_ICON[n.type] ?? BellRing;
            const unread = !n.readAt;
            const content = (
              <>
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-xl",
                    unread ? "bg-primary/10 text-primary" : "bg-accent text-muted",
                  )}
                >
                  <Icon size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-[11.5px] leading-snug", unread ? "font-bold" : "font-medium")}>
                    {n.title}
                  </p>
                  {n.body ? <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-relaxed text-muted">{n.body}</p> : null}
                  <p className="mt-1 flex items-center gap-1.5 text-[9px] text-muted-2">
                    <span className="capitalize">{n.type.replace(/_/g, " ")}</span>
                    <span>·</span>
                    <span>{timeAgo(n.createdAt)}</span>
                    {unread ? (
                      <>
                        <span>·</span>
                        <span className="font-bold text-primary">New</span>
                      </>
                    ) : null}
                  </p>
                </div>
              </>
            );

            return (
              <li key={n.id} className={cn(unread && "bg-primary/[0.03]")}>
                {n.link ? (
                  <Link
                    href={n.link}
                    onClick={() => void markOne(n.id)}
                    className="flex items-start gap-3 px-4 py-3 transition hover:bg-accent/50"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => void markOne(n.id)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-accent/50"
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
