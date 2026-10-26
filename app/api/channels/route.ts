import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { ensureGlobalMembership } from "@/lib/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/channels — global channels + my DMs/mentorship rooms (FR-CHAT-001/004). */
export async function GET() {
  try {
    const me = await requireUser();
    await ensureGlobalMembership(me.id);

    const channels = await db.channel.findMany({
      where: {
        archivedAt: null,
        OR: [
          { type: "global" },
          { type: { in: ["dm", "mentorship"] }, members: { some: { userId: me.id } } },
        ],
      },
      orderBy: [{ type: "asc" }, { createdAt: "asc" }],
      include: {
        members: { where: { userId: me.id }, select: { aliasActive: true, aliasName: true, lastReadAt: true } },
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { body: true, createdAt: true, senderId: true },
        },
        _count: { select: { messages: true } },
      },
    });

    return NextResponse.json({
      channels: channels.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        type: c.type,
        topic: c.topic,
        aliasActive: c.members[0]?.aliasActive ?? false,
        aliasName: c.members[0]?.aliasName ?? null,
        lastMessage: c.messages[0]
          ? {
              body: c.messages[0].body.slice(0, 90),
              createdAt: c.messages[0].createdAt.toISOString(),
            }
          : null,
        messageCount: c._count.messages,
      })),
    });
  } catch (e) {
    return apiError(e);
  }
}

const CreateBody = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,40}$/),
  name: z.string().trim().min(1).max(60),
  topic: z.string().trim().max(200).optional(),
});

/** POST /api/channels — admin creates a global channel (FR-CHAT-001). */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const me = await requireUser("admin");
    const d = await parseJson(req, CreateBody);
    const channel = await db.channel.create({
      data: {
        slug: d.slug,
        name: d.name,
        topic: d.topic ?? null,
        type: "global",
        createdBy: me.id,
      },
    });
    return NextResponse.json({ channel: { id: channel.id, slug: channel.slug } }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
