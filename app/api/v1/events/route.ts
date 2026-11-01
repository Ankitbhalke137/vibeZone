import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  capacity: z.number().optional(),
  coverImageUrl: z.string().optional(),
  externalStreamUrl: z.string().optional(),
});

export async function GET() {
  try {
    const events = await db.event.findMany({
      where: { status: "published" },
      orderBy: { startsAt: "asc" },
      take: 100,
      include: { _count: { select: { rsvps: { where: { status: "going" } } } } },
    });
    return NextResponse.json({ events });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser("moderator");
    const body = Body.parse(await req.json());

    const event = await db.event.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        location: body.location,
        startsAt: new Date(body.startsAt),
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
        capacity: body.capacity,
        coverImageUrl: body.coverImageUrl,
        externalStreamUrl: body.externalStreamUrl,
        status: "published",
        createdBy: user.id,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
