import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { audit } from "@/lib/audit";
import { isUuid } from "@/lib/uuid";
import { notifyUser } from "@/lib/notify";
import { awardPoints } from "@/lib/points";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SubmitBody = z.object({
  positionId: z.string(),
  fullName: z.string().trim().min(2).max(100),
  statement: z.string().trim().max(1000).optional(),
  resumeUrl: z.string().trim().max(500).optional().nullable(),
});

/** POST /api/club-applications — submit an application (authenticated students). */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const d = await parseJson(req, SubmitBody);

    if (!isUuid(d.positionId)) {
      return NextResponse.json({ error: "Invalid position id." }, { status: 400 });
    }

    const position = await db.clubPosition.findUnique({
      where: { id: d.positionId },
      include: { club: true },
    });
    if (!position || position.status !== "open") {
      return NextResponse.json({ error: "Position not found or no longer open." }, { status: 404 });
    }

    // Eligibility check on year
    if (position.eligibleYear !== null && me.year !== null && me.year !== position.eligibleYear) {
      return NextResponse.json({ error: "You are not eligible for this position." }, { status: 403 });
    }

    const existing = await db.clubApplication.findUnique({
      where: { positionId_userId: { positionId: d.positionId, userId: me.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "You already applied for this position." }, { status: 409 });
    }

    const application = await db.clubApplication.create({
      data: {
        clubId: position.clubId,
        positionId: d.positionId,
        userId: me.id,
        fullName: d.fullName,
        year: me.year ?? 1,
        branch: me.branch ?? "N/A",
        statement: d.statement ?? null,
        resumeUrl: d.resumeUrl ?? null,
        status: "submitted",
      },
    });

    await awardPoints(me.id, "club_application", {
      refType: "club_application",
      refId: application.id,
    });

    await audit({
      actorId: me.id,
      action: "club_application_review",
      targetType: "club_application",
      targetId: application.id,
      metadata: { club: position.club.name, position: position.title },
    });

    // Notify club leaders / moderators (best effort — don't fail the submit)
    try {
      const moderators = await db.user.findMany({ where: { role: { in: ["moderator", "admin"] } } });
      await Promise.all(
        moderators.map((m) =>
          notifyUser(m.id, {
            type: "club_application",
            title: "New club application",
            body: `${me.name} applied for ${position.title} at ${position.club.name}`,
            link: `/clubs/${position.club.slug}`,
          }),
        ),
      );
    } catch {
      // notifications must not break the application
    }

    return NextResponse.json({ application: { id: application.id } }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
