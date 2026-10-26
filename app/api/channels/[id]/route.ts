import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Patch = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  topic: z.string().trim().max(200).nullable().optional(),
  archived: z.boolean().optional(),
});

/** PATCH /api/channels/[id] — moderator rename / archive (FR-CHAT-001). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const me = await requireUser("moderator");
    const { id } = await params;
    const d = await parseJson(req, Patch);
    const data: Record<string, unknown> = {};
    if (d.name !== undefined) data.name = d.name;
    if (d.topic !== undefined) data.topic = d.topic;
    if (d.archived !== undefined) data.archivedAt = d.archived ? new Date() : null;
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to change." }, { status: 400 });
    }
    const updated = await db.channel.update({ where: { id }, data });
    await audit({
      actorId: me.id,
      action: "channel_edit",
      targetType: "channel",
      targetId: id,
      metadata: { fields: Object.keys(data), slug: updated.slug },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
