import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const bookmarks = await db.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        post: {
          include: {
            author: { select: { id: true, name: true, handle: true, avatarUrl: true } },
            _count: { select: { likes: true, comments: { where: { deletedAt: null } } } },
          },
        },
      },
    });

    return NextResponse.json({ bookmarks });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load bookmarks" }, { status: 500 });
  }
}
