import { redirect } from "next/navigation";
import { CheckCircle2, Clock3, Inbox, LockKeyhole } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { FeedbackManager } from "@/components/admin/feedback-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Feedback · Admin" };

export default async function AdminFeedbackPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/admin/feedback");
  if (!hasRole(me, "admin")) redirect("/admin");

  const feedback = await db.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      category: true,
      message: true,
      year: true,
      branch: true,
      status: true,
      internalNote: true,
      createdAt: true,
      reviewedAt: true,
      reviewer: { select: { handle: true } },
    },
  });

  const open = feedback.filter((item) => item.status === "open").length;
  const inReview = feedback.filter((item) => item.status === "in_review").length;
  const resolved = feedback.filter((item) => item.status === "resolved").length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Trust & safety"
        title="Anonymous feedback"
        description="Read what students really think. Submissions are never linked to an account, session or email."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-[11px] font-semibold text-success">
            <LockKeyhole size={12} /> Admin only
          </span>
        }
      />

      <section className="grid grid-cols-3 gap-2.5">
        <Stat icon={Inbox} label="Open" value={open} tone="bg-warning/10 text-amber-600 dark:text-amber-400" />
        <Stat icon={Clock3} label="In review" value={inReview} tone="bg-primary/10 text-primary" />
        <Stat icon={CheckCircle2} label="Resolved" value={resolved} tone="bg-success/10 text-success" />
      </section>

      <FeedbackManager
        initial={feedback.map((item) => ({
          id: item.id,
          category: item.category,
          message: item.message,
          year: item.year,
          branch: item.branch,
          status: item.status,
          internalNote: item.internalNote,
          createdAt: item.createdAt.toISOString(),
          reviewedAt: item.reviewedAt?.toISOString() ?? null,
          reviewer: item.reviewer?.handle ?? null,
        }))}
      />
    </div>
  );
}

function Stat({
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
