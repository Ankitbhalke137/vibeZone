import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError } from "@/lib/api";
import { todayPollWindow } from "@/lib/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
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

    return NextResponse.json({
      poll: {
        id: poll.id,
        question: poll.question,
        options: (poll.options as string[]).map((o, i) => ({ text: o, index: i })),
        status: poll.status,
        closesAt: poll.closesAt?.toISOString() ?? null,
        voteCount: poll._count.votes,
      },
    });
  } catch (e) {
    return apiError(e);
  }
}
