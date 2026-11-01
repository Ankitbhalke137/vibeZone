import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    const item = await db.lostAndFound.findUnique({ where: { id } });
    if (!item || item.userId !== user.id) {
      return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
    }

    await db.lostAndFound.update({
      where: { id },
      data: { status: "resolved", resolvedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to resolve item" }, { status: 500 });
  }
}
