import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const { id } = await context.params;

    try {
      await db.postLike.create({ data: { postId: id, userId: me.id } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return NextResponse.json({ ok: true, liked: true });
      }
      throw err;
    }

    return NextResponse.json({ ok: true, liked: true });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const { id } = await context.params;
    await db.postLike.deleteMany({ where: { postId: id, userId: me.id } });
    return NextResponse.json({ ok: true, liked: false });
  } catch (e) {
    return apiError(e);
  }
}
