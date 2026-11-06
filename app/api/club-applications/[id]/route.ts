import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, hasRole } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { audit } from "@/lib/audit";
import { isUuid } from "@/lib/uuid";
import { notifyUser } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ReviewBody = z.object({
  status: z.enum(["reviewed", "interviewed", "elected", "rejected"]),
  note: z.string().trim().max(500).optional(),
});

/** GET /api/club-applications/[id] — single application (moderator+). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireUser("moderator");
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid application id." }, { status: 400 });
    }

    const app = await db.clubApplication.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, handle: true, year: true, branch: true, email: true } },
        position: { include: { club: true } },
        reviewer: { select: { name: true, handle: true } },
      },
    });

    if (!app) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    return NextResponse.json({
      application: {
        id: app.id,
        clubId: app.clubId,
        positionId: app.positionId,
        user: app.user,
        position: app.position,
        reviewer: app.reviewer,
        fullName: app.fullName,
        year: app.year,
        branch: app.branch,
        statement: app.statement,
        resumeUrl: app.resumeUrl,
        status: app.status,
        reviewedAt: app.reviewedAt?.toISOString() ?? null,
        createdAt: app.createdAt.toISOString(),
      },
    });
  } catch (e) {
    return apiError(e);
  }
}

/** PUT /api/club-applications/[id] — review an application (moderator+). */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const me = await requireUser("moderator");
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid application id." }, { status: 400 });
    }

    const app = await db.clubApplication.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true } }, position: { include: { club: true } } },
    });
    if (!app) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const d = await parseJson(req, ReviewBody);

    const updated = await db.clubApplication.update({
      where: { id },
      data: {
        status: d.status,
        reviewedBy: me.id,
        reviewedAt: new Date(),
      },
    });

    await audit({
      actorId: me.id,
      action: "club_application_review",
      targetType: "club_application",
      targetId: id,
      metadata: {
        club: app.position.club.name,
        position: app.position.title,
        applicant: app.user.name,
        decision: d.status,
      },
    });

    // Notify the applicant (best effort)
    try {
      const messages: Record<string, string> = {
        reviewed: `Your application for ${app.position.title} at ${app.position.club.name} is being reviewed.`,
        interviewed: `You've been shortlisted for an interview for ${app.position.title} at ${app.position.club.name}!`,
        elected: `Congratulations — you've been elected as ${app.position.title} for ${app.position.club.name}!`,
        rejected: `Thank you for applying for ${app.position.title} at ${app.position.club.name}.`,
      };
      await notifyUser(app.userId, {
        type: "club_application",
        title: `Application update — ${app.position.title}`,
        body: messages[d.status],
        link: "/my-club-applications",
      });
    } catch {
      // notifications must not break the review
    }

    return NextResponse.json({ application: { id: updated.id, status: updated.status } });
  } catch (e) {
    return apiError(e);
  }
}
