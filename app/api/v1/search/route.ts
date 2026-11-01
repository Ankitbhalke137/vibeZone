import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Query = z.object({
  q: z.string().trim().min(1).max(80),
});

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const url = new URL(req.url);
    const parsed = Query.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    const q = parsed.data.q;

    const [announcements, events, notes, users, posts] = await Promise.all([
      db.announcement.findMany({
        where: { archivedAt: null, title: { contains: q, mode: "insensitive" } },
        take: 10,
        select: { id: true, title: true, category: true, publishAt: true },
      }),
      db.event.findMany({
        where: { status: "published", title: { contains: q, mode: "insensitive" } },
        take: 10,
        select: { id: true, title: true, startsAt: true, location: true },
      }),
      db.note.findMany({
        where: { removedAt: null, title: { contains: q, mode: "insensitive" } },
        take: 10,
        select: { id: true, title: true, subject: true },
      }),
      db.user.findMany({
        where: { status: "active", OR: [{ name: { contains: q, mode: "insensitive" } }, { handle: { contains: q, mode: "insensitive" } }] },
        take: 10,
        select: { id: true, name: true, handle: true, avatarUrl: true },
      }),
      db.post.findMany({
        where: { deletedAt: null, body: { contains: q, mode: "insensitive" } },
        take: 10,
        select: { id: true, body: true, createdAt: true, author: { select: { id: true, name: true, handle: true } } },
      }),
    ]);

    return NextResponse.json({
      announcements,
      events,
      notes,
      users,
      posts,
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
