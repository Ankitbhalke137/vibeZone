import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { resolveChannel } from "@/lib/chat";
import { generateAlias } from "@/lib/alias";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ active: z.boolean() });

/** POST /api/channels/[id]/alias — toggle alias mode for this channel (FR-CHAT-005). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const { id } = await params;
    const channel = await resolveChannel(id);
    if (!channel) return NextResponse.json({ error: "Channel not found." }, { status: 404 });
    if (channel.type !== "global") {
      return NextResponse.json({ error: "Aliases are only available in campus channels." }, { status: 400 });
    }
    const { active } = await parseJson(req, Body);

    const existing = await db.channelMember.findUnique({
      where: { channelId_userId: { channelId: channel.id, userId: me.id } },
    });
    const aliasName = existing?.aliasName ?? generateAlias(me.id, channel.id);

    const member = await db.channelMember.upsert({
      where: { channelId_userId: { channelId: channel.id, userId: me.id } },
      update: { aliasActive: active, aliasName },
      create: { channelId: channel.id, userId: me.id, aliasActive: active, aliasName },
    });

    return NextResponse.json({ aliasActive: member.aliasActive, aliasName: member.aliasName });
  } catch (e) {
    return apiError(e);
  }
}
