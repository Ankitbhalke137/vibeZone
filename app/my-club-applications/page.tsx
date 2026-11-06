import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Clock, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Club Applications",
  description: "Track your club election applications.",
};

const STATUS_TONE: Record<string, string> = {
  submitted: "violet",
  reviewed: "cyan",
  interviewed: "amber",
  elected: "green",
  rejected: "red",
};

const STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  reviewed: "Under review",
  interviewed: "Interviewing",
  elected: "Elected!",
  rejected: "Not selected",
};

export default async function MyClubApplicationsPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/my-club-applications");

  const applications = await db.clubApplication.findMany({
    where: { userId: me.id },
    orderBy: [{ createdAt: "desc" }],
    include: {
      position: { include: { club: true } },
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Campus life · Club elections"
        title="My Club Applications"
        description="Track the status of your submitted applications."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted">
            <Users size={12} className="text-primary" /> {applications.length} application{applications.length !== 1 ? "s" : ""}
          </span>
        }
      />

      {applications.length === 0 ? (
        <EmptyState
          icon={<Clock size={24} />}
          title="No applications yet"
          description="You haven't applied for any club positions yet. Browse open clubs and submit an application."
          action={{
            label: "Browse clubs",
            href: "/clubs",
          }}
        />
      ) : (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))}
        </section>
      )}
    </div>
  );
}

function ApplicationCard({ app }: { app: any }) {
  const tone = STATUS_TONE[app.status] ?? "violet";
  const label = STATUS_LABEL[app.status] ?? app.status;

  return (
    <Link
      href={`/clubs/${app.position.club.slug}/positions/${app.position.id}/apply`}
      className="vz-panel vz-card-hover group flex flex-col overflow-hidden p-0"
    >
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[13px] font-bold leading-snug transition group-hover:text-primary">
            {app.position.title}
          </h3>
          <Badge tone={tone as any} className="text-[9px] uppercase">
            {label}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 mb-2 text-[10px] text-muted">
          <span>{app.position.club.name}</span>
          <span className="w-px h-3 bg-border mx-0.5" />
          <span>{app.year} · {app.branch}</span>
        </div>
        {app.statement ? (
          <p className="line-clamp-2 text-[11px] text-muted mb-3">
            "{app.statement}"
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between text-[10px] font-medium">
          <span>Applied {formatDate(app.createdAt)}</span>
          <span className="text-muted">
            View details <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
