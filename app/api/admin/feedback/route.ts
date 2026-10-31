import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Query = z.object({
  status: z.enum(["open", "in_review", "resolved", "all"]).default("all"),
});

/** GET /api/admin/feedback — anonymous feedback is admin-only (never linked to users). */
export async function GET(req: Request) {
  try {
    await requireUser("admin");
    const url = new URL(req.url);
    const parsed = Query.safeParse(Object.fromEntries(url.searchParams));
    const status = parsed.success ? parsed.data.status : "all";

    const feedback = await db.feedback.findMany({
      where: status === "all" ? {} : { status },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        category: true,
        message: true,
        year: true,
        branch: true,
        status: true,
        internalNote: true,
        reviewedAt: true,
        createdAt: true,
        reviewer: { select: { handle: true } },
      },
    });

    return NextResponse.json({
      feedback: feedback.map((entry) => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
        reviewedAt: entry.reviewedAt?.toISOString() ?? null,
        reviewer: entry.reviewer?.handle ?? null,
      })),
    });
  } catch (e) {
    return apiError(e);
  }
}
