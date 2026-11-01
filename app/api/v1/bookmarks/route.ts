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

    const bookmarks = await db.postBookmark.findMany({
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

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await req.json();

    await db.postBookmark.upsert({
      where: { postId_userId: { postId: id, userId: user.id } },
      create: { postId: id, userId: user.id },
      update: {},
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to bookmark" }, { status: 500 });
  }
}
