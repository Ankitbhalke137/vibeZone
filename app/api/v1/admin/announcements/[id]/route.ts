import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  body: z.string().trim().min(1).max(20000).optional(),
  category: z.string().trim().min(1).max(20).optional(),
  imageUrl: z.string().optional(),
  pinned: z.boolean().optional(),
  publishAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  archived: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser("moderator");
    const { id } = await params;
    const body = Body.parse(await req.json());

    const announcement = await db.announcement.update({
      where: { id },
      data: {
        ...(body.title ? { title: body.title } : {}),
        ...(body.body ? { body: body.body } : {}),
        ...(body.category ? { category: body.category } : {}),
        ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {}),
        ...(body.pinned !== undefined ? { pinned: body.pinned } : {}),
        ...(body.publishAt ? { publishAt: new Date(body.publishAt) } : {}),
        ...(body.expiresAt ? { expiresAt: new Date(body.expiresAt) } : {}),
        ...(body.archived ? { archivedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ announcement });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser("moderator");
    const { id } = await params;

    await db.announcement.update({
      where: { id },
      data: { archivedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to archive announcement" }, { status: 500 });
  }
}
