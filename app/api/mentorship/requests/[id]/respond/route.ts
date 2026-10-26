import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { awardPoints } from "@/lib/points";
import { notifyUser } from "@/lib/notify";
import { mentorshipSlug } from "@/lib/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  action: z.enum(["accept", "reject"]),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const { id } = await params;
    const { action } = await parseJson(req, Body);

    const mentorshipReq = await db.mentorshipRequest.findUnique({ where: { id } });
    if (!mentorshipReq) return NextResponse.json({ error: "Request not found." }, { status: 404 });
    if (mentorshipReq.seniorId !== me.id) {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    }
    if (mentorshipReq.status !== "pending") {
      return NextResponse.json({ error: "Already responded." }, { status: 409 });
    }

    const updated = await db.mentorshipRequest.update({
      where: { id },
      data: { status: action === "accept" ? "accepted" : "rejected", respondedAt: new Date() },
    });

    if (action === "accept") {
      const channel = await db.channel.create({
        data: { slug: mentorshipSlug(id), name: `Mentor: @${mentorshipReq.studentId.slice(0, 6)}`, type: "mentorship", createdBy: me.id },
      });
      await db.mentorshipRequest.update({ where: { id }, data: { channelId: channel.id } });
      await awardPoints(me.id, "mentorship_accept");
      await awardPoints(mentorshipReq.studentId, "mentorship_accept");
      await notifyUser(mentorshipReq.studentId, {
        type: "mentorship",
        title: "Mentorship request accepted",
        body: `@${me.handle} accepted your request. A chat channel is open.`,
        link: `/chat/${channel.slug}`,
      });
      await notifyUser(me.id, {
        type: "mentorship",
        title: "Mentorship started",
        body: "You're now connected with your junior.",
        link: `/chat/${channel.slug}`,
      });
    }

    return NextResponse.json({ ok: true, status: updated.status });
  } catch (e) {
    return apiError(e);
  }
}
