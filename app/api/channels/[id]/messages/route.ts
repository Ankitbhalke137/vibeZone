import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { ensureChannelAccess, resolveChannel, serializeMessage } from "@/lib/chat";
import { filterChatBody } from "@/lib/profanity";
import { awardOncePerDay, awardPoints } from "@/lib/points";
import { publishRealtime } from "@/lib/realtime";
import { notifyUser } from "@/lib/notify";
import { hit } from "@/lib/rate-limit";
import { generateAlias } from "@/lib/alias";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/channels/[id]/messages?before=ISO — cursor pagination, 50/page (FR-CHAT-003). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireUser();
    const { id } = await params;

    const url = new URL(req.url);
    const beforeRaw = url.searchParams.get("before");
    const before = beforeRaw ? new Date(beforeRaw) : null;
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 50);

    const channel = await resolveChannel(id);
    if (!channel) return NextResponse.json({ error: "Channel not found." }, { status: 404 });
    const access = await ensureChannelAccess(me.id, channel.id);
    if (!access) return NextResponse.json({ error: "Channel not found." }, { status: 404 });

    const rows = await db.message.findMany({
      where: {
        channelId: channel.id,
        ...(before && !Number.isNaN(before.getTime()) ? { createdAt: { lt: before } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { sender: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
    });

    await db.channelMember.updateMany({
      where: { channelId: channel.id, userId: me.id },
      data: { lastReadAt: new Date() },
    });

    const ordered = rows.reverse();
    return NextResponse.json({
      messages: ordered.map((m) => serializeMessage(m)),
      nextCursor: rows.length === limit ? rows[0]!.createdAt.toISOString() : null,
    });
  } catch (e) {
    return apiError(e);
  }
}

const SendBody = z.object({
  body: z.string().trim().min(1, "Message can't be empty.").max(4000),
  alias: z.boolean().optional(),
});

/** POST /api/channels/[id]/messages — send (rate-limited, filtered, scored). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const { id } = await params;

    // FR-CHAT-006 — 20/min and 10/10s burst, per user per channel.
    if (!hit(`msg:${me.id}:${id}:min`, 20, 60_000) || !hit(`msg:${me.id}:${id}:burst`, 10, 10_000)) {
      return NextResponse.json(
        { error: "You're sending messages too fast — take a breath and try again." },
        { status: 429 },
      );
    }

    const channel = await resolveChannel(id);
    if (!channel) return NextResponse.json({ error: "Channel not found." }, { status: 404 });
    const access = await ensureChannelAccess(me.id, channel.id);
    if (!access) return NextResponse.json({ error: "Channel not found." }, { status: 404 });

    const { body, alias } = await parseJson(req, SendBody);
    const { body: cleanBody, flagged } = filterChatBody(body);

    let member = await db.channelMember.findUnique({
      where: { channelId_userId: { channelId: channel.id, userId: me.id } },
    });
    if (!member) {
      member = await db.channelMember.create({ data: { channelId: channel.id, userId: me.id } });
    }

    // Alias mode is per channel and persistent (FR-CHAT-005).
    let aliasName: string | null = null;
    if (channel.type === "global" && (alias === true || member.aliasActive)) {
      const name = member.aliasName ?? generateAlias(me.id, channel.id);
      aliasName = name;
      if (alias !== undefined || !member.aliasName) {
        member = await db.channelMember.update({
          where: { channelId_userId: { channelId: channel.id, userId: me.id } },
          data: { aliasName: name, aliasActive: true },
        });
      }
    }

    const message = await db.message.create({
      data: {
        channelId: channel.id,
        senderId: me.id,
        body: cleanBody,
        aliasName,
        isFlagged: flagged,
      },
      include: { sender: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
    });

    // Gamification (Appendix A): 1/message capped at 10/day + first-message bonus.
    await awardPoints(me.id, "msg_send", { refType: "message", refId: message.id });
    await awardOncePerDay(me.id, "first_msg_day");

    const dto = serializeMessage(message);

    // DM / mentorship rooms notify the other participant (FR-NOTIF-001).
    if (channel.type !== "global") {
      const others = await db.channelMember.findMany({
        where: { channelId: channel.id, userId: { not: me.id } },
        select: { userId: true },
      });
      await notifyUser(others[0]?.userId ?? "", {
        type: channel.type === "mentorship" ? "mentorship" : "dm",
        title: aliasName ? `New message in ${channel.name}` : `@${me.handle} sent you a message`,
        body: cleanBody.slice(0, 120),
        link: `/chat/${channel.slug}`,
      });
    }

    await publishRealtime(channel.id, "message:created", { message: dto });

    return NextResponse.json({ message: dto }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
