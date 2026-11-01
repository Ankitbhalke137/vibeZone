import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  optionIndex: z.number().int().min(0),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const body = Body.parse(await req.json());

    const poll = await db.poll.findUnique({ where: { id } });
    if (!poll || poll.status !== "open") {
      return NextResponse.json({ error: "Poll not found or closed" }, { status: 404 });
    }

    if (!poll.closesAt || new Date(poll.closesAt) <= new Date()) {
      return NextResponse.json({ error: "Poll is closed" }, { status: 400 });
    }

    const existingVote = await db.pollVote.findUnique({
      where: { pollId_userId: { pollId: id, userId: user.id } },
    });

    if (existingVote) {
      return NextResponse.json({ error: "Already voted" }, { status: 400 });
    }

    await db.pollVote.create({
      data: { pollId: id, userId: user.id, optionIndex: body.optionIndex },
    });

    const tallies = await db.pollVote.groupBy({
      by: ["optionIndex"],
      where: { pollId: id },
      _count: true,
    });

    const total = await db.pollVote.count({ where: { pollId: id } });

    return NextResponse.json({
      tallies: tallies.map((t) => ({
        index: t.optionIndex,
        count: t._count,
        percent: total > 0 ? Math.round((t._count / total) * 100) : 0,
      })),
      total,
      votedIndex: body.optionIndex,
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
