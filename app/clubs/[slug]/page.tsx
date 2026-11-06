import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Crown, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const club = await db.club.findUnique({ where: { slug } });
  return {
    title: club ? `Club Elections — ${club.name}` : "Club Elections",
    description: club ? club.description ?? "Apply for leadership positions." : undefined,
  };
}

export default async function ClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const club = await db.club.findUnique({
    where: { slug },
    include: {
      positions: {
        orderBy: [{ title: "asc" }],
      },
      applications: {
        orderBy: [{ createdAt: "desc" }],
        select: { positionId: true, userId: true },
      },
    },
  });

  if (!club || club.status !== "active") notFound();

  const me = await getCurrentUser();
  // Only the signed-in student's own applications count — never another user's.
  const alreadyApplied = new Set(
    me
      ? club.applications
          .filter((a) => a.userId === me.id)
          .map((a) => a.positionId)
      : [],
  );

  const openPositions = club.positions.filter((p) => p.status === "open");

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Campus life · Club elections"
        title={club.name}
        description={club.description ?? "Apply for leadership positions."}
        actions={
          <div className="flex items-center gap-2">
            <Badge tone={club.category as any} className="normal-case tracking-normal">
              {club.category.charAt(0).toUpperCase() + club.category.slice(1)}
            </Badge>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted">
              <Crown size={12} className="text-primary" /> {openPositions.length} open
            </span>
          </div>
        }
      />

      {openPositions.length === 0 ? (
        <div className="vz-panel p-6 text-center">
          <Users size={28} className="mx-auto mb-3 text-muted-2" />
          <h3 className="text-sm font-semibold">No open positions</h3>
          <p className="mt-1 text-xs text-muted">
            All leadership roles for {club.name} are currently filled or closed.
          </p>
        </div>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2">
          {openPositions.map((position) => (
            <PositionCard
              key={position.id}
              position={position}
              club={club}
              me={me}
              alreadyApplied={alreadyApplied.has(position.id)}
            />
          ))}
        </section>
      )}

      <section className="border-t border-border pt-6 text-[11px] text-muted">
        <Users size={12} className="mr-1.5" />
        {club.applications.length} application{club.applications.length !== 1 ? "s" : ""} received
      </section>
    </div>
  );
}

function PositionCard({
  position,
  club,
  me,
  alreadyApplied,
}: {
  position: any;
  club: any;
  me: any;
  alreadyApplied: boolean;
}) {
  const eligible =
    position.eligibleYear === null ? "Any year" : `20${30 - position.eligibleYear} Batch only`;

  const canApply = !!me && !alreadyApplied;
  const applied = !!me && alreadyApplied;

  return (
    <Link
      href={`/clubs/${club.slug}/positions/${position.id}/apply`}
      className="vz-panel vz-card-hover group flex flex-col overflow-hidden p-0"
    >
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[14px] font-bold leading-snug transition group-hover:text-primary">
            {position.title}
          </h3>
          <Badge tone="green" className="text-[9px] uppercase">
            Open
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 mb-2 text-[10px] text-muted">
          <span>{eligible}</span>
          <span className="w-px h-3 bg-border mx-0.5" />
          <span>{club.name}</span>
        </div>
        <p className="line-clamp-2 text-[11px] text-muted mb-3">
          {position.description ?? "No description available."}
        </p>
        <div className="mt-auto flex items-center justify-between text-[10px] font-medium">
          <span>{applied ? "You applied" : "Apply now"}</span>
          {canApply ? (
            <span className="text-primary">
              Start application <span aria-hidden="true">→</span>
            </span>
          ) : applied ? (
            <span className="text-muted">Already applied</span>
          ) : (
            <span className="text-muted">Sign in to apply</span>
          )}
        </div>
      </div>
    </Link>
  );
}
