import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, hasRole } from "@/lib/auth";
import { apiError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional(),
  streamUrl: z.string().url().max(500),
  thumbnailUrl: z.string().url().max(500).optional(),
  status: z.enum(["live", "upcoming", "ended"]).default("upcoming"),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
});

export async function GET() {
  try {
    const broadcasts = await db.broadcast.findMany({
      orderBy: [{ startsAt: "desc" }],
      take: 40,
      include: { host: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
    });

    return NextResponse.json({
      live: broadcasts.find((b) => b.status === "live") ?? null,
      upcoming: broadcasts
        .filter((b) => b.status === "upcoming")
        .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime()),
      past: broadcasts.filter((b) => b.status === "ended"),
    });
  } catch (e) {
    console.error("[live] list failed:", e);
    return NextResponse.json({ live: null, upcoming: [], past: [] });
  }
}

export async function POST(req: Request) {
  try {
    const me = await requireUser("club_leader");
    if (!hasRole(me, "moderator")) {
      return NextResponse.json({ error: "Only moderators can schedule broadcasts." }, { status: 403 });
    }

    const body = Body.parse(await req.json());
    const broadcast = await db.broadcast.create({
      data: {
        title: body.title,
        description: body.description,
        streamUrl: body.streamUrl,
        thumbnailUrl: body.thumbnailUrl,
        status: body.status,
        startsAt: new Date(body.startsAt),
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
        hostedBy: me.id,
      },
    });

    return NextResponse.json({ broadcast }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
