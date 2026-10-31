import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Create = z.object({ body: z.string().trim().min(1, "Write a comment.").max(500) });

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
    const { id } = await context.params;
    const comments = await db.postComment.findMany({
      where: { postId: id, deletedAt: null },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: {
        author: {
          select: { id: true, name: true, handle: true, avatarUrl: true, branch: true, year: true, role: true },
        },
      },
    });

    return NextResponse.json({
      comments: comments.map((c) => ({
        id: c.id,
        body: c.body,
        createdAt: c.createdAt.toISOString(),
        author: c.author,
      })),
    });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const { id } = await context.params;
    const input = await parseJson(req, Create);

    const comment = await db.postComment.create({
      data: { postId: id, authorId: me.id, body: input.body },
      include: {
        author: {
          select: { id: true, name: true, handle: true, avatarUrl: true, branch: true, year: true, role: true },
        },
      },
    });

    return NextResponse.json(
      {
        comment: {
          id: comment.id,
          body: comment.body,
          createdAt: comment.createdAt.toISOString(),
          author: comment.author,
        },
      },
      { status: 201 },
    );
  } catch (e) {
    return apiError(e);
  }
}
