import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    assertSameOrigin(_req as Request);
    const me = await requireUser();
    const { id } = await params;

    const note = await db.note.findUnique({ where: { id } });
    if (!note || note.removedAt) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    await db.note.update({ where: { id }, data: { openCount: { increment: 1 } } });

    return NextResponse.json({
      externalLink: note.externalLink,
      title: note.title,
    });
  } catch (e) {
    return apiError(e);
  }
}

export async function PATCH(_req: Request, { params }: Params) {
  try {
    assertSameOrigin(_req as Request);
    const me = await requireUser();
    const { id } = await params;

    const note = await db.note.findUnique({ where: { id } });
    if (!note) return NextResponse.json({ error: "Note not found." }, { status: 404 });

    const isAuthor = note.uploadedBy === me.id;
    const isMod = me.role === "moderator" || me.role === "admin";
    if (!isAuthor && !isMod) {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    }

    await db.note.update({ where: { id }, data: { removedAt: new Date() } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
