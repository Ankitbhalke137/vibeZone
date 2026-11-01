import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Query = z.object({
  cursor: z.string().optional(),
  take: z.coerce.number().int().min(1).max(30).optional(),
  q: z.string().trim().max(80).optional(),
  saved: z.string().optional(),
  author: z.string().optional(),
});

const Create = z.object({
  body: z.string().trim().min(1).max(1200),
  imageUrl: z.string().trim().max(500).optional(),
  visibility: z.enum(["campus", "public"]).optional(),
  tags: z.array(z.string().trim().min(1).max(20)).max(5).optional(),
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
      return NextResponse.json({ error: "Invalid query." }, { status: 400 });
    }

    const data = await db.post.findMany({
      where: {
        deletedAt: null,
        ...(parsed.data.author ? { authorId: parsed.data.author } : {}),
        ...(parsed.data.saved ? { bookmarks: { some: { userId: user.id } } } : {}),
        ...(parsed.data.q
          ? {
              OR: [
                { body: { contains: parsed.data.q, mode: "insensitive" as const } },
                { tags: { has: parsed.data.q } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: (parsed.data.take ?? 10) + 1,
      ...(parsed.data.cursor ? { cursor: { id: parsed.data.cursor }, skip: 1 } : {}),
      include: {
        author: {
          select: { id: true, name: true, handle: true, avatarUrl: true, branch: true, year: true, role: true },
        },
        _count: { select: { likes: true, comments: { where: { deletedAt: null } } } },
        ...(user.id ? {
          likes: { where: { userId: user.id }, select: { userId: true } },
          bookmarks: { where: { userId: user.id }, select: { userId: true } },
        } : {}),
        comments: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          take: 2,
          include: { author: { select: { id: true, name: true, handle: true, avatarUrl: true, branch: true, year: true, role: true } } },
        },
      },
    });

    const hasMore = rows.length > (parsed.data.take ?? 10);
    const page = hasMore ? rows.slice(0, parsed.data.take ?? 10) : rows;

    return NextResponse.json({
      posts: page.map((row) => ({
        id: row.id,
        body: row.body,
        imageUrl: row.imageUrl,
        visibility: row.visibility,
        tags: row.tags,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        author: row.author,
        likeCount: row._count.likes,
        commentCount: row._count.comments,
        liked: row.likes?.length > 0,
        bookmarked: row.bookmarks?.length > 0,
        comments: row.comments.map((c) => ({
          id: c.id,
          body: c.body,
          createdAt: c.createdAt.toISOString(),
          author: c.author,
        })),
      })),
      nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = Create.parse(await req.json());

    const post = await db.post.create({
      data: {
        authorId: user.id,
        body: body.body,
        imageUrl: body.imageUrl || null,
        visibility: body.visibility ?? "campus",
        tags: body.tags ?? [],
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({ post: { id: post.id, createdAt: post.createdAt.toISOString() } }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
