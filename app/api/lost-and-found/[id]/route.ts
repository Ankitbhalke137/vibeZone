import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Patch = z.object({
  status: z.enum(["open", "resolved"]).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_req: Request, { params }: Params) {
  try {
    assertSameOrigin(_req as Request);
    const me = await requireUser();
    const { id } = await params;
    const d = await parseJson(_req, Patch);

    const item = await db.lostAndFound.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Item not found." }, { status: 404 });

    const isAuthor = item.userId === me.id;
    const isMod = me.role === "moderator" || me.role === "admin";
    if (!isAuthor && !isMod) {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    }

    const data: Record<string, unknown> = {};
    if (d.status !== undefined) data.status = d.status;
    if (d.status === "resolved") data.resolvedAt = new Date();

    await db.lostAndFound.update({ where: { id }, data });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
