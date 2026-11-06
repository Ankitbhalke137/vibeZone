import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/uuid";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/club-applications/positions/[pid] — position + club for the apply page. */
export async function GET(req: Request, { params }: { params: Promise<{ pid: string }> }) {
  try {
    const { pid } = await params;
    if (!isUuid(pid)) {
      return NextResponse.json({ error: "Invalid position id." }, { status: 400 });
    }

    const position = await db.clubPosition.findUnique({
      where: { id: pid },
      include: {
        club: true,
        _count: { select: { applications: true } },
      },
    });

    if (!position) {
      return NextResponse.json({ error: "Position not found." }, { status: 404 });
    }

    // Optional auth: tell the page whether this student already applied.
    const me = await getCurrentUser();
    const existing = me
      ? await db.clubApplication.findUnique({
          where: { positionId_userId: { positionId: pid, userId: me.id } },
          select: { id: true },
        })
      : null;

    return NextResponse.json({
      position: {
        id: position.id,
        title: position.title,
        eligibleYear: position.eligibleYear,
        description: position.description,
        status: position.status,
        applicationCount: position._count.applications,
        applied: !!existing,
      },
      club: {
        id: position.club.id,
        name: position.club.name,
        slug: position.club.slug,
        description: position.club.description,
        category: position.club.category,
        icon: position.club.icon,
      },
    });
  } catch (e) {
    // Reuse the shared error handler pattern without importing it here
    console.error("[api] club position error:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
