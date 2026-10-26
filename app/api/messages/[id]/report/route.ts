import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { notifyUsers } from "@/lib/notify";
import { hit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  reason: z.enum(["abuse", "spam", "explicit", "other"]),
  detail: z.string().trim().max(500).optional(),
});

/** POST /api/messages/[id]/report — one-tap report → moderation queue (FR-CHAT-008). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    if (!hit(`report:${me.id}`, 20, 3_600_000)) {
      return NextResponse.json({ error: "Too many reports — try later." }, { status: 429 });
    }
    const { id } = await params;
    const message = await db.message.findUnique({
      where: { id },
      include: { sender: { select: { id: true, handle: true } }, channel: { select: { slug: true } } },
    });
    if (!message) return NextResponse.json({ error: "Message not found." }, { status: 404 });
    if (message.senderId === me.id) {
      return NextResponse.json({ error: "You can't report your own message." }, { status: 400 });
    }

    const { reason } = await parseJson(req, Body);
    const report = await db.messageReport.create({
      data: { messageId: id, reporterId: me.id, reason },
    });

    const moderators = await db.user.findMany({
      where: { role: { in: ["moderator", "admin"] }, status: "active" },
      select: { id: true },
    });
    await notifyUsers(
      moderators.map((m) => m.id),
      {
        type: "moderation",
        title: "New message report",
        body: `#${message.channel.slug} · @${message.sender.handle} · ${reason}`,
        link: "/admin/reports",
      },
    );

    return NextResponse.json({ ok: true, reportId: report.id }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "You already reported this message." }, { status: 409 });
    }
    return apiError(e);
  }
}
