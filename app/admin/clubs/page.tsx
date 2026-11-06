import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Crown, Users } from "lucide-react";
import PositionCard from "./position-card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Club Elections · Admin",
  description: "Assign students to club leadership positions.",
};

type Club = {
  id: string;
  name: string;
  slug: string;
  category: string;
  positions: Array<{
    id: string;
    title: string;
    eligibleYear: number | null;
    description: string | null;
    status: string;
    holderId: string | null;
    holder: {
      id: string;
      name: string;
      handle: string;
      year: number | null;
      branch: string | null;
    } | null;
  }>;
};

type Student = {
  id: string;
  name: string;
  handle: string;
  year: number | null;
  branch: string | null;
};

export default async function AdminClubsPage() {
  const [clubs, students] = await Promise.all([
    db.club.findMany({
      where: { status: "active" },
      orderBy: [{ name: "asc" }],
      include: {
        positions: {
          orderBy: [{ title: "asc" }],
          include: {
            holder: { select: { id: true, name: true, handle: true, year: true, branch: true } },
          },
        },
      },
    }),
    db.user.findMany({
      where: { status: "active" },
      select: { id: true, name: true, handle: true, year: true, branch: true },
      orderBy: [{ name: "asc" }],
    }),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Campus life · Club elections · Admin"
        title="Club Elections"
        description="Assign students to leadership positions. The college declares final results — VibeZone only records the holder."
        actions={
          <Badge tone="violet" className="normal-case tracking-normal">
            Admin only
          </Badge>
        }
      />

      <section className="grid gap-4">
        {clubs.map((club) => (
          <div key={club.id} className="vz-panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <Crown size={16} className="text-primary" />
              <h2 className="text-lg font-bold">{club.name}</h2>
              <Badge tone={club.category as any} className="normal-case tracking-normal">
                {club.category.charAt(0).toUpperCase() + club.category.slice(1)}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {club.positions.length > 0 ? (
                club.positions.map((position) => (
                  <PositionCard
                    key={position.id}
                    position={position as any}
                    students={students as any}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-xs text-muted">
                  No positions defined for this club.
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
