import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Crown, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const club = await db.club.findUnique({ where: { slug } });
  return {
    title: club ? `Club Elections — ${club.name}` : "Club Elections",
    description: club ? club.description ?? "Student leadership positions." : undefined,
  };
}

export default async function ClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const club = await db.club.findUnique({
    where: { slug },
    include: {
      positions: {
        orderBy: [{ title: "asc" }],
        include: {
          holder: { select: { id: true, name: true, handle: true, year: true, branch: true } },
        },
      },
    },
  });

  if (!club || club.status !== "active") notFound();

  const openPositions = club.positions.filter((p) => p.status === "open");
  const filledPositions = club.positions.filter((p) => p.status === "filled");

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Campus life · Club elections"
        title={club.name}
        description={club.description ?? "Student leadership positions."}
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

      {club.positions.length === 0 ? (
        <div className="vz-panel p-6 text-center">
          <Users size={28} className="mx-auto mb-3 text-muted-2" />
          <h3 className="text-sm font-semibold">No positions</h3>
          <p className="mt-1 text-xs text-muted">
            No leadership roles defined for {club.name} yet.
          </p>
        </div>
      ) : (
        <>
          {filledPositions.length > 0 && (
            <section className="mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                Current leadership
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filledPositions.map((position) => (
                  <FilledPositionCard key={position.id} position={position} club={club} />
                ))}
              </div>
            </section>
          )}

          {openPositions.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                Open positions
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {openPositions.map((position) => (
                  <OpenPositionCard key={position.id} position={position} club={club} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function FilledPositionCard({ position, club }: { position: any; club: any }) {
  const eligible =
    position.eligibleYear === null ? "Any year" : `20${30 - position.eligibleYear} Batch only`;
  const h = position.holder;
  return (
    <Link
      href={`/clubs/${club.slug}`}
      className="vz-panel vz-card-hover group flex flex-col overflow-hidden p-0"
    >
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[14px] font-bold leading-snug transition group-hover:text-primary">
            {position.title}
          </h3>
          <Badge tone="green" className="text-[9px] uppercase">
            Filled
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 mb-2 text-[10px] text-muted">
          <span>{eligible}</span>
          <span className="w-px h-3 bg-border mx-0.5" />
          <span>{club.name}</span>
        </div>
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[11px] font-semibold">{h?.name}</span>
          <span className="text-[10px] text-muted">@{h?.handle}</span>
        </div>
        <p className="text-[10px] text-muted">
          {h?.year ? `20${30 - h.year}` : "N/A"} · {h?.branch}
        </p>
      </div>
    </Link>
  );
}

function OpenPositionCard({ position, club }: { position: any; club: any }) {
  const eligible =
    position.eligibleYear === null ? "Any year" : `20${30 - position.eligibleYear} Batch only`;
  return (
    <Link
      href={`/clubs/${club.slug}`}
      className="vz-panel vz-card-hover group flex flex-col overflow-hidden p-0"
    >
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[14px] font-bold leading-snug transition group-hover:text-primary">
            {position.title}
          </h3>
          <Badge tone="violet" className="text-[9px] uppercase">
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
          <span>Elected by college</span>
          <span className="text-muted">
            Assigned by admin <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
