import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hasRole, requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Patch = z.object({
  body: z.string().trim().min(1).max(1200).optional(),
  imageUrl: z.string().trim().max(500).optional(),
  tags: z.array(z.string().trim().min(1).max(20)).max(5).optional(),
  visibility: z.enum(["campus", "public"]).optional(),
});

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const { id } = await context.params;
    const input = await parseJson(req, Patch);

    const post = await db.post.findUnique({ where: { id }, select: { authorId: true, deletedAt: true } });
    if (!post || post.deletedAt) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    if (post.authorId !== me.id && !hasRole(me, "moderator")) {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    }

    await db.post.update({
      where: { id },
      data: {
        ...(input.body !== undefined ? { body: input.body } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl || null } : {}),
        ...(input.tags !== undefined ? { tags: input.tags } : {}),
        ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const { id } = await context.params;

    const post = await db.post.findUnique({ where: { id }, select: { authorId: true, deletedAt: true } });
    if (!post || post.deletedAt) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    if (post.authorId !== me.id && !hasRole(me, "moderator")) {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    }

    await db.post.update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
