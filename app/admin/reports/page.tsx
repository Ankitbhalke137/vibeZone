import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Flag, Shield, User, Ban, Mail, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  message: "Chat message",
  note: "Note resource",
  lost_found: "Lost & Found",
  announcement: "Announcement",
};

export default async function AdminReportsPage() {
  const me = await requireUser("moderator");
  if (!me) redirect("/login?next=/admin/reports");

  const [messageReports, contentReports] = await Promise.all([
    db.messageReport.findMany({
      where: { status: "open" },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        message: { select: { body: true, channelId: true, senderId: true, createdAt: true } },
        reporter: { select: { handle: true, name: true } },
      },
    }),
    db.contentReport.findMany({
      where: { status: "open" },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        reporter: { select: { handle: true, name: true } },
      },
    }),
  ]);

  const totalOpen = messageReports.length + contentReports.length;

  return (
    <div className="mx-auto max-w-3xl py-6">
      <nav className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Moderation Queue</h1>
            <p className="text-sm text-muted">{totalOpen} open reports · 24 h SLA</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Shield size={14} aria-hidden />
          </div>
        </div>
      </nav>

      <div className="grid gap-4">
        {/* Message reports */}
        <section className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3 flex items-center gap-2">
            <Flag size={16} aria-hidden />
            <h2 className="text-sm font-semibold">Message Reports ({messageReports.length})</h2>
          </div>
          {messageReports.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted">No open message reports.</div>
          ) : (
            <ul className="divide-y divide-border">
              {messageReports.map((r) => (
                <li key={r.id} className="flex flex-col gap-2 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Message</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold border ${
                      r.reason === "abuse" ? "border-danger/20 text-danger" : "border-muted/30 text-muted"
                    }`}>{r.reason}</span>
                    <span className="text-[10px] text-muted">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                  <p className="text-sm leading-snug">{r.message.body}</p>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>Reported by @{r.reporter.handle}</span>
                    <span>·</span>
                    <span>#{r.message.channelId}</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button className="flex-1 py-1.5 rounded-lg border border-border bg-background text-sm text-muted hover:bg-accent transition">Dismiss</button>
                    <button className="flex-1 py-1.5 rounded-lg border border-danger/20 bg-danger/50 text-danger text-sm hover:bg-danger/100 transition">Delete message</button>
                    <button className="flex-1 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-700 text-sm hover:bg-amber-200 transition">Warn user</button>
                    <button className="flex-1 py-1.5 rounded-lg border border-danger/20 bg-danger/50 text-danger text-sm hover:bg-danger/100 transition">Ban user</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Content reports */}
        <section className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3 flex items-center gap-2">
            <Mail size={16} aria-hidden />
            <h2 className="text-sm font-semibold">Content Reports ({contentReports.length})</h2>
          </div>
          {contentReports.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted">No open content reports.</div>
          ) : (
            <ul className="divide-y divide-border">
              {contentReports.map((r) => (
                <li key={r.id} className="flex flex-col gap-2 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">{TYPE_LABEL[r.contentType]}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold border ${
                      r.reason === "abuse" ? "border-danger/20 text-danger" : "border-muted/30 text-muted"
                    }`}>{r.reason}</span>
                    <span className="text-[10px] text-muted">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                  {r.detail && <p className="text-sm leading-snug">{r.detail}</p>}
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>Reported by @{r.reporter?.handle ?? "anonymous"}</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button className="flex-1 py-1.5 rounded-lg border border-border bg-background text-sm text-muted hover:bg-accent transition">Dismiss</button>
                    <button className="flex-1 py-1.5 rounded-lg border border-danger/20 bg-danger/50 text-danger text-sm hover:bg-danger/100 transition">Remove content</button>
                    <button className="flex-1 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-700 text-sm hover:bg-amber-200 transition">Warn user</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-4">
        <h3 className="mb-2 text-sm font-semibold">Reveal alias</h3>
        <p className="text-xs text-muted mb-3">
          To reveal the real identity behind an alias, use the <code className="bg-background px-1 py-0.5 rounded text-xs">reveal-alias</code> moderation action with a mandatory reason. Every reveal is written to the audit log.
        </p>
      </div>
    </div>
  );
}
