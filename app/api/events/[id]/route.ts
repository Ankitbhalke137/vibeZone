import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { audit } from "@/lib/audit";
import { awardPoints } from "@/lib/points";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Patch = z.object({
  title: z.string().trim().min(3).max(160).optional(),
  description: z.string().trim().max(10_000).nullable().optional(),
  category: z.string().trim().max(30).nullable().optional(),
  location: z.string().trim().max(160).nullable().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  capacity: z.number().int().min(1).max(10_000).nullable().optional(),
  coverImageUrl: z.string().trim().max(500).nullable().optional(),
  externalStreamUrl: z.string().trim().max(500).nullable().optional(),
  status: z.enum(["draft", "published", "cancelled"]).optional(),
  /** Organizer closes RSVP and marks attendees present (J5). */
  closeRsvp: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

/** GET /api/events/[id] — public detail. */
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const event = await db.event.findUnique({
      where: { id },
      include: {
        creator: { select: { name: true, handle: true } },
        rsvps: { where: { status: "going" }, select: { userId: true } },
      },
    });
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        location: event.location,
        startsAt: event.startsAt.toISOString(),
        endsAt: event.endsAt?.toISOString() ?? null,
        capacity: event.capacity,
        going: event.rsvps.length,
        coverImageUrl: event.coverImageUrl,
        externalStreamUrl: event.externalStreamUrl,
        status: event.status,
        rsvpClosedAt: event.rsvpClosedAt?.toISOString() ?? null,
        creator: event.creator,
      },
    });
  } catch (e) {
    return apiError(e);
  }
}

/** PATCH /api/events/[id] — edit / close RSVP (moderator+). */
export async function PATCH(req: Request, { params }: Params) {
  try {
    assertSameOrigin(req);
    const me = await requireUser("moderator");
    const { id } = await params;
    const existing = await db.event.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    const d = await parseJson(req, Patch);

    const data: Record<string, unknown> = {};
    if (d.title !== undefined) data.title = d.title;
    if (d.description !== undefined) data.description = d.description;
    if (d.category !== undefined) data.category = d.category;
    if (d.location !== undefined) data.location = d.location;
    if (d.startsAt !== undefined) data.startsAt = new Date(d.startsAt);
    if (d.endsAt !== undefined) data.endsAt = d.endsAt ? new Date(d.endsAt) : null;
    if (d.capacity !== undefined) data.capacity = d.capacity;
    if (d.coverImageUrl !== undefined) data.coverImageUrl = d.coverImageUrl;
    if (d.externalStreamUrl !== undefined) data.externalStreamUrl = d.externalStreamUrl;
    if (d.status !== undefined) data.status = d.status;
    if (d.closeRsvp === true) data.rsvpClosedAt = new Date();

    const event = await db.event.update({ where: { id }, data });

    if (d.closeRsvp === true) {
      const going = await db.eventRsvp.findMany({
        where: { eventId: id, status: "going" },
        select: { userId: true },
      });
      await Promise.all(
        going.map((r) =>
          awardPoints(r.userId, "attend_event", { refType: "event", refId: id }),
        ),
      );
      await audit({
        actorId: me.id,
        action: "event_close",
        targetType: "event",
        targetId: id,
        metadata: { title: event.title, attendees: going.length },
      });
    } else {
      await audit({
        actorId: me.id,
        action: "event_edit",
        targetType: "event",
        targetId: id,
        metadata: { fields: Object.keys(data) },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
