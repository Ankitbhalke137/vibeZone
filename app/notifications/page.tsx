"use client";

import { useEffect, useState } from "react";
import { Bell, Mail, Calendar, Shield, Trophy, User, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/form";
import { Avatar } from "@/components/avatar";

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
  announcement: Bell,
  event_reminder: Calendar,
  poll_open: Trophy,
  mentorship: User,
  moderation: Shield,
  system: Bell,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        setNotifications(d?.notifications ?? []);
        setUnreadCount(d?.unreadCount ?? 0);
        setLoading(false);
      });
  }, []);

  const typeIcon = (type: string) => TYPE_ICON[type] ?? Bell;

  const markAllRead = async () => {
    await fetch("/api/notifications/read", { method: "POST", body: JSON.stringify({ read: true }) });
    setNotifications((cur) => cur.map((n) => ({ ...n, readAt: new Date().toISOString() })));
    setUnreadCount(0);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-md py-12">
        <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary animate-pulse mx-auto mb-3" />
        <p className="text-center text-sm text-muted">Loading notifications…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <nav className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary underline underline-offset-4 hover:opacity-70"
            >
              Mark all as read
            </button>
          )}
        </div>
      </nav>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center text-sm text-muted">
          <Bell size={28} aria-hidden className="mx-auto mb-3 opacity-50" />
          <p>No notifications yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border space-y-1">
          {notifications.map((n) => {
            const TypeIcon = typeIcon(n.type);
            return (
              <li key={n.id} className={`group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition ${!n.readAt ? "bg-accent/40" : ""}`}>
                <div className="flex-shrink-0">
                  <TypeIcon size={18} aria-hidden className={!n.readAt ? "text-primary" : "text-muted"} />
                </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold leading-snug">{n.title}</p>
                {n.body && <p className="mt-0.5 text-sm text-muted line-clamp-2">{n.body}</p>}
                <div className="mt-1 flex items-center gap-2 text-[10px] text-muted">
                  <span>
                    {n.type.charAt(0).toUpperCase() + n.type.slice(1).replace(/_/g, " ")}
                  </span>
                  <span>·</span>
                  <span>{new Date(n.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} IST</span>
                </div>
              </div>
              <ArrowRight size={14} className="text-muted opacity-0 group-hover:opacity-100" aria-hidden />
            </li>
          );
        })}
        </ul>
      )}
    </div>
  );
}
