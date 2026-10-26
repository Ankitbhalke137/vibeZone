import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { awardPoints } from "@/lib/points";
import { notifyUser } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ status: z.enum(["going", "maybe", "not_going"]).optional() });

/** POST /api/events/[id]/rsvp — toggle RSVP with capacity + unique guard (FR-EVT-002). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const { id } = await params;
    const event = await db.event.findUnique({ where: { id } });
    if (!event || event.status !== "published") {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }
    if (event.rsvpClosedAt) {
      return NextResponse.json({ error: "RSVP is closed for this event." }, { status: 409 });
    }

    const body = await parseJson(req, Body).catch(() => ({ status: undefined }));
    const existing = await db.eventRsvp.findUnique({
      where: { eventId_userId: { eventId: id, userId: me.id } },
    });
    // Default behaviour is a toggle: going → not_going, otherwise → going.
    const nextStatus =
      body.status ?? (existing?.status === "going" ? "not_going" : "going");

    if (nextStatus === "going" && existing?.status !== "going" && event.capacity) {
      const going = await db.eventRsvp.count({ where: { eventId: id, status: "going" } });
      if (going >= event.capacity) {
        return NextResponse.json({ error: "This event is full." }, { status: 409 });
      }
    }

    const rsvp = await db.eventRsvp.upsert({
      where: { eventId_userId: { eventId: id, userId: me.id } },
      update: { status: nextStatus },
      create: { eventId: id, userId: me.id, status: nextStatus },
    });

    if (nextStatus === "going") {
      await awardPoints(me.id, "rsvp", { refType: "event", refId: id });
      await notifyUser(me.id, {
        type: "event_reminder",
        title: `You're going: ${event.title}`,
        body: `Reminders will arrive 24h and 1h before ${event.startsAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST.`,
        link: `/events/${event.id}`,
      });
    }

    const going = await db.eventRsvp.count({ where: { eventId: id, status: "going" } });
    return NextResponse.json({ ok: true, status: rsvp.status, going, capacity: event.capacity });
  } catch (e) {
    return apiError(e);
  }
}
