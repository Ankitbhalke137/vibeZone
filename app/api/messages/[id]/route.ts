import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hasRole, requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { ensureChannelAccess } from "@/lib/chat";
import { filterChatBody } from "@/lib/profanity";
import { publishRealtime } from "@/lib/realtime";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Patch = z.object({ body: z.string().trim().min(1).max(4000) });
type Params = { params: Promise<{ id: string }> };

/** PATCH /api/messages/[id] — author edit within 15 minutes (FR-CHAT-003). */
export async function PATCH(req: Request, { params }: Params) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const { id } = await params;
    const message = await db.message.findUnique({ where: { id } });
    if (!message) return NextResponse.json({ error: "Message not found." }, { status: 404 });
    if (message.senderId !== me.id) {
      return NextResponse.json({ error: "You can only edit your own messages." }, { status: 403 });
    }
    if (message.deletedAt) {
      return NextResponse.json({ error: "Message was deleted." }, { status: 400 });
    }
    if (Date.now() - message.createdAt.getTime() > 15 * 60_000) {
      return NextResponse.json({ error: "Edit window (15 min) has passed." }, { status: 403 });
    }
    const channel = await ensureChannelAccess(me.id, message.channelId);
    if (!channel) return NextResponse.json({ error: "Channel not found." }, { status: 404 });

    const { body } = await parseJson(req, Patch);
    const filtered = filterChatBody(body);
    const updated = await db.message.update({
      where: { id },
      data: { body: filtered.body, isFlagged: filtered.flagged, editedAt: new Date() },
      include: { sender: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
    });

    await publishRealtime(message.channelId, "message:edited", {
      id,
      channelId: message.channelId,
      body: updated.body,
      editedAt: updated.editedAt?.toISOString(),
      isFlagged: updated.isFlagged,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}

/** DELETE /api/messages/[id] — author soft delete, moderator can remove any. */
export async function DELETE(req: Request, { params }: Params) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const { id } = await params;
    const message = await db.message.findUnique({ where: { id } });
    if (!message) return NextResponse.json({ error: "Message not found." }, { status: 404 });
    const privileged = hasRole(me, "moderator");
    if (message.senderId !== me.id && !privileged) {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    }
    if (message.deletedAt) return NextResponse.json({ ok: true });

    await db.message.update({ where: { id }, data: { deletedAt: new Date() } });
    await publishRealtime(message.channelId, "message:deleted", {
      id,
      channelId: message.channelId,
    });
    if (privileged && message.senderId !== me.id) {
      await audit({
        actorId: me.id,
        action: "delete_msg",
        targetType: "message",
        targetId: id,
        metadata: { channelId: message.channelId, senderId: message.senderId },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
