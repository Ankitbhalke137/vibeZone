import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Query = z.object({
  archived: z.enum(["true", "false"]).optional(),
});

const Body = z.object({
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(20000),
  category: z.string().trim().min(1).max(20),
  imageUrl: z.string().optional(),
  pinned: z.boolean().optional(),
  publishAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const url = new URL(req.url);
    const parsed = Query.safeParse(Object.fromEntries(url.searchParams));
    const archived = parsed.data?.archived === "true";

    const announcements = await db.announcement.findMany({
      where: { archivedAt: archived ? { not: null } : null },
      orderBy: [{ pinned: "desc" }, { publishAt: "desc" }],
      take: 100,
      include: { author: { select: { handle: true, name: true } } },
    });

    return NextResponse.json({ announcements });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load announcements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser("moderator");
    const body = Body.parse(await req.json());

    const announcement = await db.announcement.create({
      data: {
        title: body.title,
        body: body.body,
        category: body.category,
        imageUrl: body.imageUrl || null,
        pinned: body.pinned || false,
        publishAt: body.publishAt ? new Date(body.publishAt) : new Date(),
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        authorId: user.id,
      },
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
