import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  status: z.enum(["going", "maybe", "not_going"]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const body = Body.parse(await req.json());

    const rsvp = await db.eventRsvp.upsert({
      where: { eventId_userId: { eventId: id, userId: user.id } },
      create: { eventId: id, userId: user.id, status: body.status },
      update: { status: body.status },
    });

    return NextResponse.json({ rsvp });
  } catch (e) {
    return NextResponse.json({ error: "Failed to RSVP" }, { status: 500 });
  }
}
