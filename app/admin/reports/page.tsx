import { Flag, Mail, MessageSquare, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { ReportQueue } from "@/components/admin/report-queue";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reports · Admin" };

const TYPE_LABEL: Record<string, string> = {
  message: "Chat message",
  note: "Note resource",
  lost_found: "Lost & Found",
  announcement: "Announcement",
};

export default async function AdminReportsPage() {
  const [messageReports, contentReports] = await Promise.all([
    db.messageReport.findMany({
      where: { status: "open" },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        message: { select: { body: true } },
        reporter: { select: { handle: true } },
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

  const total = messageReports.length + contentReports.length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Moderation"
        title="Reports"
        description="Review flagged messages and campus resources. Resolve reports within 24 hours and keep the audit trail clean."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted">
            <ShieldCheck size={12} className="text-primary" /> Moderator access
          </span>
        }
      />

      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <StatCard
          icon={Flag}
          label="Open reports"
          value={total}
          tone="bg-primary/10 text-primary"
        />
        <StatCard
          icon={MessageSquare}
          label="Messages"
          value={messageReports.length}
          tone="bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400"
        />
        <StatCard
          icon={Mail}
          label="Content"
          value={contentReports.length}
          tone="bg-cyan-500/10 text-cyan-700 dark:text-cyan-400"
        />
      </section>

      <ReportQueue
        messageReports={messageReports.map((r) => ({
          id: r.id,
          contentId: r.messageId,
          reporter: `@${r.reporter.handle}`,
          reason: r.reason,
          status: r.status,
          context: r.message.body,
          createdAt: r.createdAt.toISOString(),
        }))}
        contentReports={contentReports.map((r) => ({
          id: r.id,
          contentType: r.contentType,
          contentId: r.contentId,
          reporter: r.reporter ? `@${r.reporter.handle}` : "anonymous",
          reason: r.reason,
          detail: r.detail,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
        }))}
      />

      <p className="text-center text-[10px] text-muted-2">
        Content types:{" "}
        {Object.values(TYPE_LABEL).join(" · ")}. Alias reveals are handled with a mandatory reason
        and a separate audit entry.
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ size?: number | string }>;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="vz-panel flex items-center gap-2.5 p-3">
      <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${tone}`}>
        <Icon size={16} />
      </span>
      <div>
        <p className="text-lg font-black leading-none">{value}</p>
        <p className="mt-0.5 text-[10px] text-muted">{label}</p>
      </div>
    </div>
  );
}
