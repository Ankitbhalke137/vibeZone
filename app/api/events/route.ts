import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CreateBody = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(10_000).optional(),
  category: z.string().trim().max(30).optional(),
  location: z.string().trim().max(160).optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable().optional(),
  capacity: z.number().int().min(1).max(10_000).nullable().optional(),
  coverImageUrl: z.string().trim().max(500).refine((v) => v === "" || /^https:\/\//.test(v), "Image must be https").optional(),
  externalStreamUrl: z.string().trim().max(500).refine((v) => v === "" || /^https:\/\//.test(v), "Stream link must be https").optional(),
  status: z.enum(["draft", "published", "cancelled"]).optional(),
});

/** GET /api/events — public list (FR-EVT-004). */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const includePast = url.searchParams.get("past") === "1";
    const now = new Date();
    const events = await db.event.findMany({
      where: {
        status: "published",
        ...(includePast ? {} : { startsAt: { gte: new Date(now.getTime() - 12 * 60 * 60_000) } }),
      },
      orderBy: { startsAt: "asc" },
      take: 100,
      include: { _count: { select: { rsvps: { where: { status: "going" } } } } },
    });
    return NextResponse.json({
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        category: e.category,
        location: e.location,
        startsAt: e.startsAt.toISOString(),
        endsAt: e.endsAt?.toISOString() ?? null,
        capacity: e.capacity,
        going: e._count.rsvps,
        coverImageUrl: e.coverImageUrl,
        externalStreamUrl: e.externalStreamUrl,
        rsvpClosedAt: e.rsvpClosedAt?.toISOString() ?? null,
      })),
    });
  } catch (e) {
    return apiError(e);
  }
}

/** POST /api/events — moderator CRUD (FR-EVT-001). */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const me = await requireUser("moderator");
    const d = await parseJson(req, CreateBody);
    const event = await db.event.create({
      data: {
        title: d.title,
        description: d.description || null,
        category: d.category || null,
        location: d.location || null,
        startsAt: new Date(d.startsAt),
        endsAt: d.endsAt ? new Date(d.endsAt) : null,
        capacity: d.capacity ?? null,
        coverImageUrl: d.coverImageUrl || null,
        externalStreamUrl: d.externalStreamUrl || null,
        status: d.status ?? "published",
        createdBy: me.id,
      },
    });
    await audit({
      actorId: me.id,
      action: "event_create",
      targetType: "event",
      targetId: event.id,
      metadata: { title: event.title, startsAt: event.startsAt.toISOString() },
    });
    return NextResponse.json({ event: { id: event.id } }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
