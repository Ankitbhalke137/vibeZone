import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  messageId: z.string(),
  reason: z.string().trim().min(1).max(500),
});

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const me = await requireUser("moderator");
    const d = await parseJson(req, Body);

    const message = await db.message.findUnique({
      where: { id: d.messageId },
      include: { sender: { select: { id: true, handle: true, name: true } }, channel: { select: { id: true, slug: true, name: true } } },
    });
    if (!message) return NextResponse.json({ error: "Message not found." }, { status: 404 });
    if (!message.aliasName) {
      return NextResponse.json({ error: "Message was not posted under an alias." }, { status: 400 });
    }

    await audit({
      actorId: me.id,
      action: "reveal_alias",
      targetType: "message",
      targetId: message.id,
      reason: d.reason,
      metadata: { channelId: message.channelId, channelSlug: message.channel.slug, aliasName: message.aliasName, revealedTo: me.handle },
    });

    return NextResponse.json({
      ok: true,
      revealed: {
        userId: message.senderId,
        name: message.sender.name,
        handle: message.sender.handle,
        alias: message.aliasName,
      },
    });
  } catch (e) {
    return apiError(e);
  }
}
