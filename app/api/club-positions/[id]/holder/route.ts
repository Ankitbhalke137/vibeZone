import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin } from "@/lib/api";
import { isUuid } from "@/lib/uuid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PUT /api/club-positions/[id]/holder — assign or remove the holder (moderator+).
 * Body: { holderId: string | null }
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    await requireUser("moderator");
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid position id." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const holderId = body.holderId ?? null;

    const position = await db.clubPosition.findUnique({ where: { id } });
    if (!position) {
      return NextResponse.json({ error: "Position not found." }, { status: 404 });
    }

    // If assigning a holder, verify they exist and are active
    if (holderId) {
      const user = await db.user.findUnique({
        where: { id: holderId, status: "active" },
      });
      if (!user) {
        return NextResponse.json({ error: "Student not found or inactive." }, { status: 404 });
      }
      // Eligibility check on year
      if (
        position.eligibleYear !== null &&
        user.year !== null &&
        user.year !== position.eligibleYear
      ) {
        return NextResponse.json(
          { error: "Student is not eligible for this position." },
          { status: 403 },
        );
      }
    }

    const updated = await db.clubPosition.update({
      where: { id },
      data: {
        holderId,
        status: holderId ? "filled" : "open",
      },
      include: {
        holder: { select: { id: true, name: true, handle: true, year: true, branch: true } },
        club: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json({
      position: {
        id: updated.id,
        title: updated.title,
        status: updated.status,
        holderId: updated.holderId,
        holder: updated.holder,
        club: updated.club,
      },
    });
  } catch (e) {
    return apiError(e);
  }
}

/** GET /api/club-positions/[id]/holder — position + current holder (public). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid position id." }, { status: 400 });
    }

    const position = await db.clubPosition.findUnique({
      where: { id },
      include: {
        holder: { select: { id: true, name: true, handle: true, year: true, branch: true } },
        club: { select: { name: true, slug: true } },
      },
    });

    if (!position) {
      return NextResponse.json({ error: "Position not found." }, { status: 404 });
    }

    return NextResponse.json({
      position: {
        id: position.id,
        title: position.title,
        status: position.status,
        holderId: position.holderId,
        holder: position.holder,
        club: position.club,
      },
    });
  } catch (e) {
    return apiError(e);
  }
}
