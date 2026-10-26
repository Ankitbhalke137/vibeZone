import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [users, announcements, openAnnouncements, recentAudit, byRole] = await Promise.all([
    db.user.count(),
    db.announcement.count({ where: { archivedAt: null } }),
    db.announcement.count({ where: { archivedAt: null, pinned: true } }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    db.user.groupBy({ by: ["role"], _count: true }),
  ]);

  const actorIds = recentAudit.map((a) => a.actorId).filter(Boolean) as string[];
  const actors = actorIds.length
    ? await db.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, handle: true } })
    : [];
  const actorMap = new Map(actors.map((a) => [a.id, a.handle]));

  const stats = [
    { label: "Users", value: users, href: "/admin/users" },
    { label: "Live announcements", value: announcements, href: "/admin/announcements" },
    { label: "Pinned", value: openAnnouncements, href: "/admin/announcements" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <section className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"
          >
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="mt-0.5 text-xs text-muted">{s.label}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Roles</h2>
        <div className="flex flex-wrap gap-2">
          {byRole.length === 0 ? (
            <p className="text-xs text-muted">No users yet.</p>
          ) : (
            byRole.map((r) => (
              <span
                key={r.role}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-xs"
              >
                <span className="font-semibold">{r._count}</span>{" "}
                <span className="text-muted">{r.role}</span>
              </span>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Recent audit log</h2>
        {recentAudit.length === 0 ? (
          <p className="text-xs text-muted">No privileged actions yet — good.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-xs">
            {recentAudit.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-2">
                <code className="rounded bg-background px-1.5 py-0.5 text-[11px]">{a.action}</code>
                <span className="text-muted">
                  {a.actorId ? `@${actorMap.get(a.actorId) ?? "unknown"}` : "system"}
                  {a.targetId ? ` → ${a.targetType ?? "target"}` : ""}
                </span>
                <span className="ml-auto text-muted">
                  {a.createdAt.toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-muted">
        Moderation console (reports, bans, alias reveal) arrives in Week 5 per the delivery plan.
      </p>
    </div>
  );
}
