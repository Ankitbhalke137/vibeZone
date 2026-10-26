import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Query = z.object({ unread: z.string().optional() });
const Patch = z.object({ read: z.boolean().optional() });

export async function GET(req: Request) {
  try {
    const me = await requireUser();
    const url = new URL(req.url);
    const parsed = Query.safeParse(Object.fromEntries(url.searchParams));
    const onlyUnread = parsed.success && parsed.data.unread === "1";

    const notifications = await db.notification.findMany({
      where: { userId: me.id, ...(onlyUnread ? { readAt: null } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await db.notification.count({ where: { userId: me.id, readAt: null } });

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        readAt: n.readAt?.toISOString() ?? null,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const d = await parseJson(req, Patch);

    if (d.read === true) {
      await db.notification.updateMany({
        where: { userId: me.id, readAt: null },
        data: { readAt: new Date() },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
