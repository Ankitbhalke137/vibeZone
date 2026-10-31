import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  ChevronRight,
  Flag,
  Gauge,
  Megaphone,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

const ACTION_LABEL: Record<string, string> = {
  ban: "Suspended an account",
  unban: "Restored an account",
  warn: "Issued a warning",
  delete_msg: "Deleted a message",
  delete_content: "Removed content",
  role_change: "Changed a role",
  announcement_create: "Published an announcement",
  announcement_edit: "Edited an announcement",
  announcement_archive: "Archived an announcement",
  report_dismiss: "Dismissed a report",
  feedback_review: "Reviewed feedback",
  reveal_alias: "Revealed an alias",
  event_create: "Created an event",
  event_edit: "Edited an event",
  event_close: "Closed an event",
  poll_create: "Created a poll",
  poll_close: "Closed a poll",
  channel_edit: "Edited a channel",
  mentorship_accept: "Accepted a mentorship request",
  mentorship_reject: "Declined a mentorship request",
};

export default async function AdminOverview() {
  const [
    users,
    activeUsers,
    announcements,
    pinnedAnnouncements,
    openMessageReports,
    openContentReports,
    openFeedback,
    events,
    recentAudit,
    byRole,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { status: "active" } }),
    db.announcement.count({ where: { archivedAt: null } }),
    db.announcement.count({ where: { archivedAt: null, pinned: true } }),
    db.messageReport.count({ where: { status: "open" } }),
    db.contentReport.count({ where: { status: "open" } }),
    db.feedback.count({ where: { status: "open" } }),
    db.event.count({ where: { startsAt: { gte: new Date() }, status: "published" } }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    db.user.groupBy({ by: ["role"], _count: true }),
  ]);

  const actorIds = [...new Set(recentAudit.map((a) => a.actorId).filter(Boolean))] as string[];
  const actors = actorIds.length
    ? await db.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, handle: true },
      })
    : [];
  const actorMap = new Map(actors.map((a) => [a.id, a.handle]));
  const openReports = openMessageReports + openContentReports;
  const roles = [...byRole].sort((a, b) => b._count - a._count);
  const maxRole = Math.max(1, ...roles.map((r) => r._count));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Staff console"
        title="Control room"
        description="A live view of campus health, moderation load and the decisions your team has made."
        actions={
          <>
            <Link
              href="/admin/reports"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-[11px] font-semibold text-muted transition hover:text-foreground"
            >
              <Flag size={13} /> Open reports
            </Link>
            <Link
              href="/admin/announcements"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-[11px] font-semibold text-white transition hover:brightness-110"
            >
              <Megaphone size={13} /> New announcement
            </Link>
          </>
        }
      />

      <section className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        <Stat
          href="/admin/users"
          icon={Users}
          label="Campus members"
          value={users}
          hint={`${activeUsers} active`}
          tone="bg-primary/10 text-primary"
        />
        <Stat
          href="/admin/reports"
          icon={Flag}
          label="Open reports"
          value={openReports}
          hint={openReports === 0 ? "Queue is clear" : "Needs review"}
          tone="bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400"
        />
        <Stat
          href="/admin/feedback"
          icon={MessageSquareText}
          label="Open feedback"
          value={openFeedback}
          hint="Anonymous submissions"
          tone="bg-cyan-500/10 text-cyan-700 dark:text-cyan-400"
        />
        <Stat
          href="/admin/announcements"
          icon={BellRing}
          label="Live announcements"
          value={announcements}
          hint={`${pinnedAnnouncements} pinned`}
          tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <section className="vz-panel vz-soft-gradient overflow-hidden">
            <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25">
                <ShieldCheck size={21} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                  Moderation queue
                </p>
                <h2 className="mt-0.5 text-base font-black">
                  {openReports === 0 ? "Everything is clear" : `${openReports} report${openReports === 1 ? "" : "s"} waiting`}
                </h2>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                  {openReports === 0
                    ? "No open reports right now. New flags will appear here instantly."
                    : "Review messages and content before the 24-hour response target."}
                </p>
              </div>
              <Link
                href="/admin/reports"
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-[11px] font-bold text-white transition hover:brightness-110"
              >
                Review queue <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-card/60">
              <MiniStat label="Messages" value={openMessageReports} />
              <MiniStat label="Content" value={openContentReports} />
              <MiniStat label="Feedback" value={openFeedback} />
            </div>
          </section>

          <section className="vz-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <SectionHeader
                title="Recent audit log"
                description="Privileged actions across the campus"
                icon={<Gauge size={14} />}
              />
              <Link
                href="/admin/users"
                className="hidden items-center gap-1 text-[10px] font-semibold text-primary hover:underline sm:inline-flex"
              >
                Manage users <ChevronRight size={10} />
              </Link>
            </div>
            {recentAudit.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <span className="grid size-10 place-items-center rounded-xl bg-accent text-muted">
                  <Sparkles size={18} />
                </span>
                <p className="mt-2 text-xs font-semibold">No privileged actions yet</p>
                <p className="mt-0.5 text-[10.5px] text-muted">
                  Role changes, bans and moderation actions will show up here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentAudit.map((entry) => (
                  <li key={entry.id.toString()} className="flex items-start gap-2.5 px-4 py-2.5">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11.5px] font-semibold">
                        {ACTION_LABEL[entry.action] ?? entry.action.replaceAll("_", " ")}
                      </p>
                      <p className="truncate text-[9.5px] text-muted">
                        {entry.actorId ? `@${actorMap.get(entry.actorId) ?? "unknown"}` : "System"}
                        {entry.targetType ? ` · ${entry.targetType}` : ""}
                        {entry.reason ? ` · ${entry.reason}` : ""}
                      </p>
                    </div>
                    <time className="shrink-0 text-[9px] text-muted-2">
                      {entry.createdAt.toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <section className="vz-panel p-4">
            <SectionHeader title="Community mix" description="Accounts by role" icon={<Users size={14} />} />
            <div className="mt-3 flex flex-col gap-2.5">
              {roles.length === 0 ? (
                <p className="text-[11px] text-muted">No accounts yet.</p>
              ) : (
                roles.map((role) => (
                  <div key={role.role}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10.5px] font-semibold capitalize">{role.role}</span>
                      <span className="text-[10px] font-bold text-muted">{role._count}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-accent">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.max(5, (role._count / maxRole) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="vz-panel p-4">
            <SectionHeader title="Upcoming campus" description="Published events on the calendar" icon={<CalendarDays size={14} />} />
            <p className="mt-3 text-3xl font-black leading-none">{events}</p>
            <p className="mt-0.5 text-[10px] text-muted">event{events === 1 ? "" : "s"} ahead</p>
            <Link
              href="/events"
              className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
            >
              View campus calendar <ArrowRight size={10} />
            </Link>
          </section>

          <section className="vz-panel p-4">
            <SectionHeader title="Quick actions" icon={<Sparkles size={14} />} />
            <div className="mt-3 flex flex-col gap-1">
              {[
                { href: "/admin/announcements", label: "Publish an announcement", icon: Megaphone },
                { href: "/admin/feedback", label: "Review anonymous feedback", icon: MessageSquareText },
                { href: "/admin/reports", label: "Clear the report queue", icon: Flag },
                { href: "/admin/users", label: "Manage roles & access", icon: Users },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-2 rounded-xl px-2 py-2 text-[11px] font-semibold text-muted transition hover:bg-accent hover:text-foreground"
                >
                  <action.icon size={13} className="text-primary" />
                  {action.label}
                  <ChevronRight size={11} className="ml-auto text-muted-2" />
                </Link>
              ))}
            </div>
          </section>

          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
            <Badge tone="violet" className="normal-case tracking-normal">
              Trust & safety
            </Badge>
            <p className="mt-2 text-[10.5px] leading-relaxed text-muted">
              Keep decisions consistent and documented. Every moderation action is stored in the
              audit log with the actor, target and reason.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({
  href,
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number | string }>;
  label: string;
  value: number;
  hint: string;
  tone: string;
}) {
  return (
    <Link href={href} className="vz-panel vz-card-hover group flex flex-col p-3.5">
      <div className="flex items-start justify-between gap-2">
        <span className={`grid size-8 place-items-center rounded-xl ${tone}`}>
          <Icon size={15} />
        </span>
        <ChevronRight size={13} className="text-muted-2 transition group-hover:text-primary" />
      </div>
      <p className="mt-2.5 text-2xl font-black leading-none tracking-tight">{value}</p>
      <p className="mt-1 text-[10.5px] font-semibold">{label}</p>
      <p className="text-[9.5px] text-muted">{hint}</p>
    </Link>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-3 py-2.5 text-center">
      <p className="text-sm font-black leading-none">{value}</p>
      <p className="mt-0.5 text-[9px] text-muted">{label}</p>
    </div>
  );
}
