import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const now = new Date();
    const poll = await db.poll.findFirst({
      where: { status: "open", opensAt: { lte: now }, closesAt: { gt: now } },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { votes: true } } },
    });

    if (!poll) {
      return NextResponse.json({ poll: null });
    }

    const vote = await db.pollVote.findUnique({
      where: { pollId_userId: { pollId: poll.id, userId: user.id } },
    });

    return NextResponse.json({
      poll: {
        ...poll,
        voteCount: poll._count.votes,
        votedIndex: vote?.optionIndex ?? null,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load poll" }, { status: 500 });
  }
}
