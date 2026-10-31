import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z
  .object({
    status: z.enum(["open", "in_review", "resolved"]).optional(),
    internalNote: z.string().trim().max(2000).nullable().optional(),
  })
  .refine((value) => value.status !== undefined || value.internalNote !== undefined, {
    message: "Nothing to update.",
  });

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/admin/feedback/[id] — admins triage anonymous feedback (FR-FEEDBACK). */
export async function PATCH(req: Request, { params }: Params) {
  try {
    assertSameOrigin(req);
    const me = await requireUser("admin");
    const { id } = await params;
    const d = await parseJson(req, Body);

    const existing = await db.feedback.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Feedback not found." }, { status: 404 });

    const feedback = await db.feedback.update({
      where: { id },
      data: {
        ...(d.status ? { status: d.status } : {}),
        ...(d.internalNote !== undefined ? { internalNote: d.internalNote } : {}),
        ...(d.status === "resolved" || d.status === "in_review"
          ? { reviewedBy: me.id, reviewedAt: new Date() }
          : {}),
      },
    });

    await audit({
      actorId: me.id,
      action: "feedback_review",
      targetType: "feedback",
      targetId: feedback.id,
      metadata: { from: existing.status, to: feedback.status },
    });

    return NextResponse.json({
      ok: true,
      feedback: { id: feedback.id, status: feedback.status, internalNote: feedback.internalNote },
    });
  } catch (e) {
    return apiError(e);
  }
}
