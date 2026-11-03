import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  category: z.enum(["exam", "assignment", "holiday", "event", "deadline"]),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  location: z.string().optional(),
  isAllDay: z.boolean().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const events = await db.academicCalendar.findMany({
      orderBy: { startsAt: "asc" },
      take: 100,
    });

    return NextResponse.json({ events });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load calendar" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = Body.parse(await req.json());

    const event = await db.academicCalendar.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        startsAt: new Date(body.startsAt),
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
        location: body.location,
        isAllDay: body.isAllDay || false,
        createdBy: user.id,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
