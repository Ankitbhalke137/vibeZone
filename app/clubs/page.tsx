import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Crown, Users, Code2, Bot, Trophy, Briefcase, Drama, Camera, HeartHandshake } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Club Elections",
  description: "Clubs are recruiting. Lead, create, collaborate — make campus happen.",
};

const CLUB_META: Record<string, { color: string; Icon: React.ElementType }> = {
  tech: { color: "violet", Icon: Code2 },
  robotics: { color: "green", Icon: Bot },
  sports: { color: "amber", Icon: Trophy },
  business: { color: "cyan", Icon: Briefcase },
  cultural: { color: "magenta", Icon: Drama },
  content: { color: "red", Icon: Camera },
  "social-welfare": { color: "fuchsia", Icon: HeartHandshake },
};

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  let clubs = await db.club.findMany({
    where: {
      status: "active",
      ...(category ? { category } : {}),
    },
    orderBy: [{ name: "asc" }],
    include: {
      positions: {
        where: { status: "open" },
        orderBy: [{ title: "asc" }],
      },
      _count: { select: { applications: true } },
    },
  });

  const openPositions = clubs.reduce(
    (sum, c) => sum + c.positions.filter((p) => p.status === "open").length,
    0,
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Campus life"
        title="Club Elections Are Open!"
        description="Lead. Create. Collaborate. Make campus happen!"
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted">
            <Crown size={12} className="text-primary" /> {openPositions} positions open
          </span>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={"/clubs"}
          className={`rounded-full border px-3 py-1 text-[10px] font-semibold transition ${!category ? "bg-primary text-white border-primary" : "bg-card text-muted hover:bg-accent"}`}
        >
          All clubs
        </Link>
        {Object.entries(CLUB_META).map(([categoryKey, meta]) => (
          <Link
            key={categoryKey}
            href={`/clubs?category=${categoryKey}`}
            className={`rounded-full border px-3 py-1 text-[10px] font-semibold transition ${category === categoryKey ? "bg-primary text-white border-primary" : "bg-card text-muted hover:bg-accent"}`}
          >
            {categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}
          </Link>
        ))}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clubs.length > 0 ? (
          clubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              icon={<Users size={24} />}
              title="No clubs found"
              description="Try adjusting the filters or check back soon — new clubs open for elections every term."
            />
          </div>
        )}
      </section>

      <section className="border-t border-border pt-6 flex items-center gap-2 text-[11px] text-muted">
        <span className="flex items-center gap-1">
          <Users size={11} />
          {clubs.length} club{clubs.length !== 1 ? "s" : ""}
        </span>
        <span className="w-px h-4 bg-border mx-2" />
        <span>{openPositions} position{openPositions !== 1 ? "s" : ""} open for applications</span>
      </section>
    </div>
  );
}

function ClubCard({ club }: { club: any }) {
  const meta = CLUB_META[club.category];
  const Icon = meta ? meta.Icon : Users;
  const tone = meta ? meta.color : "violet";
  const openCount = club.positions.filter((p: any) => p.status === "open").length;

  return (
    <Link
      href={`/clubs/${club.slug}`}
      className="vz-panel vz-card-hover group flex flex-col overflow-hidden p-0"
    >
      <div className="relative h-48 overflow-hidden bg-[var(--vz-card-3)]">
        <div className="absolute inset-0 grid place-items-center text-white/70">
          <Icon size={24} />
        </div>
        <Badge tone={tone as any} className="absolute left-3 top-3 z-10">
          {club.name.split(" ")[0]} Club
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-center justify-between">
          <h3 className="line-clamp-1 text-[13px] font-bold leading-snug transition group-hover:text-primary">
            {club.name}
          </h3>
          <span className="text-[9px] font-bold text-primary">{openCount} open</span>
        </div>
        <p className="mt-1 line-clamp-2 text-[10.5px] leading-relaxed text-muted">
          {club.description ?? "No description yet."}
        </p>
        <div className="mt-2.5 flex items-center gap-1.5 border-t border-[var(--vz-border-soft)] pt-2">
          {club.positions.map((pos: any) => (
            <PositionPill key={pos.id} position={pos} />
          ))}
          {club.positions.length === 0 && (
            <span className="text-[9px] text-muted">No open positions</span>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between text-[10px] font-medium text-muted">
          <span>{club._count.applications} applied</span>
          <span className="text-primary">
            View positions <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function PositionPill({ position }: { position: any }) {
  const eligible =
    position.eligibleYear === null ? "All years" : `20${30 - position.eligibleYear} Batch`;
  return (
    <Badge tone="neutral" className="text-[8px]">
      {position.title} · {eligible}
    </Badge>
  );
}
