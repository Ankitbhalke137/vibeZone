import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { awardPoints } from "@/lib/points";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ optionIndex: z.number().int().min(0).max(5) });

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const { id } = await params;
    const { optionIndex } = await parseJson(req, Body);

    const poll = await db.poll.findUnique({ where: { id } });
    if (!poll) return NextResponse.json({ error: "Poll not found." }, { status: 404 });
    if (poll.status !== "open") {
      return NextResponse.json({ error: "Poll is not open." }, { status: 409 });
    }
    const now = new Date();
    if (poll.opensAt && now < poll.opensAt) {
      return NextResponse.json({ error: "Poll not yet open." }, { status: 409 });
    }
    if (poll.closesAt && now > poll.closesAt) {
      return NextResponse.json({ error: "Poll has closed." }, { status: 409 });
    }

    const options = (poll.options as string[]).length;
    if (optionIndex < 0 || optionIndex >= options) {
      return NextResponse.json({ error: "Invalid option." }, { status: 400 });
    }

    const existing = await db.pollVote.findUnique({
      where: { pollId_userId: { pollId: id, userId: me.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "You already voted on this poll." }, { status: 409 });
    }

    await db.pollVote.create({ data: { pollId: id, userId: me.id, optionIndex } });
    await awardPoints(me.id, "poll_vote", { refType: "poll", refId: id });

    const votes = await db.pollVote.findMany({ where: { pollId: id } });
    const total = votes.length;
    const tallies = new Array(options).fill(0);
    for (const v of votes) tallies[v.optionIndex]++;

    return NextResponse.json({
      ok: true,
      voted: true,
      tallies: tallies.map((t, i) => ({ index: i, count: t, percent: total ? Math.round((t / total) * 100) : 0 })),
      total,
    });
  } catch (e) {
    return apiError(e);
  }
}
