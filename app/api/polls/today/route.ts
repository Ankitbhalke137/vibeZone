import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { apiError } from "@/lib/api";
import { todayPollWindow } from "@/lib/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const me = await getCurrentUser();
    const { opensAt, closesAt } = todayPollWindow();
    const now = new Date();

    let poll = await db.poll.findFirst({
      where: {
        status: "open",
        opensAt: { lte: now },
        closesAt: { gt: now },
      },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { votes: true } } },
    });

    if (!poll) {
      poll = await db.poll.create({
        data: {
          question: "How is your day going on campus?",
          options: ["Great 😄", "Okay 🙂", "Rough 😐", "Terrible 😔"],
          status: "open",
          opensAt,
          closesAt,
          createdBy: null,
        },
        include: { _count: { select: { votes: true } } },
      });
    }

    const votes = await db.pollVote.findMany({
      where: { pollId: poll.id },
      select: { optionIndex: true, userId: true },
    });
    const total = votes.length;
    const options = poll.options as string[];
    const tallies = options.map((_, index) => {
      const count = votes.filter((v) => v.optionIndex === index).length;
      return { index, count, percent: total ? Math.round((count / total) * 100) : 0 };
    });
    const mine = me ? votes.find((v) => v.userId === me.id) : undefined;

    return NextResponse.json({
      poll: {
        id: poll.id,
        question: poll.question,
        options: options.map((o, i) => ({ text: o, index: i })),
        status: poll.status,
        closesAt: poll.closesAt?.toISOString() ?? null,
        voteCount: poll._count.votes,
        votedIndex: mine?.optionIndex ?? null,
        tallies,
      },
    });
  } catch (e) {
    return apiError(e);
  }
}
