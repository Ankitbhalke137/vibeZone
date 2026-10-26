import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { awardPoints } from "@/lib/points";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CreateBody = z.object({
  question: z.string().trim().min(5).max(300),
  options: z.array(z.string().trim().min(1).max(100)).min(2).max(6),
  opensAt: z.string().datetime().optional(),
  closesAt: z.string().datetime().optional(),
});

export async function GET() {
  try {
    const polls = await db.poll.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { _count: { select: { votes: true } } },
    });

    return NextResponse.json({
      polls: polls.map((p) => ({
        id: p.id,
        question: p.question,
        options: p.options as string[],
        status: p.status,
        opensAt: p.opensAt?.toISOString() ?? null,
        closesAt: p.closesAt?.toISOString() ?? null,
        voteCount: p._count.votes,
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const me = await requireUser("moderator");
    const d = await parseJson(req, CreateBody);
    const poll = await db.poll.create({
      data: {
        question: d.question,
        options: d.options,
        status: "draft",
        opensAt: d.opensAt ? new Date(d.opensAt) : null,
        closesAt: d.closesAt ? new Date(d.closesAt) : null,
        createdBy: me.id,
      },
    });
    return NextResponse.json({ poll: { id: poll.id } }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
