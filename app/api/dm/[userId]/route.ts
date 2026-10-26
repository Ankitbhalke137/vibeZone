import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin } from "@/lib/api";
import { dmSlug } from "@/lib/chat";
import { startOfDayIST } from "@/lib/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/dm/[userId] — open (or create) the 1:1 DM channel (FR-CHAT-004).
 * Starting more than 10 new DM threads per IST day is blocked (FR-CHAT-006).
 */
export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const { userId } = await params;
    if (userId === me.id) return NextResponse.json({ error: "You can't DM yourself." }, { status: 400 });

    const other = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, handle: true, name: true, status: true },
    });
    if (!other || other.status !== "active") {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const blocked = await db.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: me.id, blockedId: userId },
          { blockerId: userId, blockedId: me.id },
        ],
      },
    });
    if (blocked) return NextResponse.json({ error: "This user is unavailable." }, { status: 403 });

    const existing = await db.channel.findFirst({
      where: {
        type: "dm",
        AND: [
          { members: { some: { userId: me.id } } },
          { members: { some: { userId } } },
        ],
      },
      include: { _count: { select: { members: true } } },
    });
    if (existing && existing._count.members === 2) {
      return NextResponse.json({ channel: { id: existing.id, slug: existing.slug } });
    }

    const startedToday = await db.channel.count({
      where: { type: "dm", createdBy: me.id, createdAt: { gte: startOfDayIST() } },
    });
    if (startedToday >= 10) {
      return NextResponse.json(
        { error: "You've started 10 new DMs today — try again tomorrow." },
        { status: 429 },
      );
    }

    const channel = await db.channel.create({
      data: {
        slug: dmSlug(me.id, userId),
        name: other.name,
        type: "dm",
        createdBy: me.id,
        members: {
          createMany: { data: [{ userId: me.id }, { userId }] },
        },
      },
    });

    return NextResponse.json({ channel: { id: channel.id, slug: channel.slug } }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
