import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { awardPoints } from "@/lib/points";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Query = z.object({
  type: z.enum(["lost", "found"]).optional(),
  location: z.string().optional(),
  sort: z.enum(["newest", "resolved"]).default("newest"),
});

const CreateBody = z.object({
  itemName: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(2000),
  type: z.enum(["lost", "found"]),
  location: z.string().trim().max(120).optional(),
  occurredOn: z.string().datetime().optional(),
  contactInfo: z.string().trim().max(120).optional(),
  imageUrl: z.string().trim().max(500).refine((v) => v === "" || /^https:\/\//.test(v), "Image must be https").optional(),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = Query.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid filters." }, { status: 400 });
    }
    const f = parsed.data;

    const items = await db.lostAndFound.findMany({
      where: {
        removedAt: null,
        ...(f.type ? { type: f.type } : {}),
        ...(f.location ? { location: { contains: f.location, mode: "insensitive" } } : {}),
      },
      orderBy: f.sort === "resolved" ? [{ status: "asc" }, { createdAt: "desc" }] : [{ createdAt: "desc" }],
      take: 50,
      include: { user: { select: { name: true, handle: true } } },
    });

    return NextResponse.json({
      items: items.map((i) => ({
        id: i.id,
        itemName: i.itemName,
        description: i.description,
        type: i.type,
        location: i.location,
        occurredOn: i.occurredOn?.toISOString() ?? null,
        contactInfo: i.contactInfo,
        imageUrl: i.imageUrl,
        status: i.status,
        userId: i.userId,
        userName: i.user.name,
        userHandle: i.user.handle,
        createdAt: i.createdAt.toISOString(),
        resolvedAt: i.resolvedAt?.toISOString() ?? null,
      })),
    });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const d = await parseJson(req, CreateBody);
    const item = await db.lostAndFound.create({
      data: {
        itemName: d.itemName,
        description: d.description,
        type: d.type,
        location: d.location ?? null,
        occurredOn: d.occurredOn ? new Date(d.occurredOn) : null,
        contactInfo: d.contactInfo ?? null,
        imageUrl: d.imageUrl ?? null,
        userId: me.id,
      },
    });
    await awardPoints(me.id, "lostfound_post", { refType: "lost_found", refId: item.id });
    return NextResponse.json({ item: { id: item.id } }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
