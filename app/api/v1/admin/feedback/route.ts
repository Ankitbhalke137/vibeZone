import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Query = z.object({
  status: z.enum(["open", "in_review", "resolved", "all"]).optional(),
});

export async function GET(req: Request) {
  try {
    await requireUser("admin");
    const url = new URL(req.url);
    const parsed = Query.safeParse(Object.fromEntries(url.searchParams));
    const status = parsed.data?.status || "all";

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
        createdAt: true,
        reviewer: { select: { handle: true } },
      },
    });

    return NextResponse.json({
      feedback: feedback.map((entry) => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
        reviewer: entry.reviewer?.handle ?? null,
      })),
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load feedback" }, { status: 500 });
  }
}
