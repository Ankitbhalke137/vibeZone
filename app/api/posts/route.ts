import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { listPosts } from "@/lib/posts";
import { awardPoints } from "@/lib/points";

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
  body: z.string().trim().min(1, "Write something first.").max(1200),
  imageUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https:\/\/\S+$/.test(v), "Image must be an https:// URL.")
    .optional(),
  visibility: z.enum(["campus", "public"]).optional(),
  tags: z.array(z.string().trim().min(1).max(20)).max(5).optional(),
});

export async function GET(req: Request) {
  try {
    const me = await requireUser();
    const url = new URL(req.url);
    const parsed = Query.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query." }, { status: 400 });
    }
    const data = await listPosts({
      viewerId: me.id,
      cursor: parsed.data.cursor,
      take: parsed.data.take ?? 10,
      query: parsed.data.q,
      authorId: parsed.data.author,
      bookmarkedBy: parsed.data.saved === "1" ? me.id : undefined,
      limitComments: 2,
    });
    return NextResponse.json(data);
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const input = await parseJson(req, Create);

    const post = await db.post.create({
      data: {
        authorId: me.id,
        body: input.body,
        imageUrl: input.imageUrl || null,
        visibility: input.visibility ?? "campus",
        tags: input.tags ?? [],
      },
      select: { id: true, createdAt: true },
    });

    void awardPoints(me.id, "post_create", { refType: "post", refId: post.id });

    return NextResponse.json({ post: { id: post.id, createdAt: post.createdAt.toISOString() } }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
