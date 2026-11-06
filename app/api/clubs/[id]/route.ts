import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { audit } from "@/lib/audit";
import { isUuid } from "@/lib/uuid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ClubCategory = z.enum([
  "tech",
  "robotics",
  "sports",
  "business",
  "cultural",
  "content",
  "social-welfare",
]);

const UpdateBody = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(2000).optional(),
  category: ClubCategory.optional(),
  icon: z.string().trim().max(40).optional().nullable(),
  coverImageUrl: z.string().trim().max(500).optional().nullable(),
  status: z.enum(["active", "archived"]).optional(),
});

/** GET /api/clubs/[id] — public single club with positions. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid club id." }, { status: 400 });
    }

    const club = await db.club.findUnique({
      where: { id },
      include: {
        positions: {
          where: { status: "open" },
          orderBy: [{ title: "asc" }],
          include: { holder: { select: { name: true, handle: true } } },
        },
        creator: { select: { name: true, handle: true } },
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found." }, { status: 404 });
    }

    return NextResponse.json({
      club: {
        id: club.id,
        name: club.name,
        slug: club.slug,
        description: club.description,
        category: club.category,
        icon: club.icon,
        coverImageUrl: club.coverImageUrl,
        status: club.status,
        createdAt: club.createdAt.toISOString(),
        creator: club.creator,
        positions: club.positions.map((p) => ({
          id: p.id,
          title: p.title,
          eligibleYear: p.eligibleYear,
          description: p.description,
          status: p.status,
          holder: p.holder,
        })),
      },
    });
  } catch (e) {
    return apiError(e);
  }
}

/** PUT /api/clubs/[id] — update a club (moderator+). */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const me = await requireUser("moderator");
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid club id." }, { status: 400 });
    }

    const club = await db.club.findUnique({ where: { id } });
    if (!club) {
      return NextResponse.json({ error: "Club not found." }, { status: 404 });
    }

    const d = await parseJson(req, UpdateBody);

    const updated = await db.club.update({
      where: { id },
      data: {
        name: d.name ?? undefined,
        description: d.description ?? undefined,
        category: d.category ?? undefined,
        icon: d.icon ?? undefined,
        coverImageUrl: d.coverImageUrl ?? undefined,
        status: d.status ?? undefined,
      },
    });

    await audit({
      actorId: me.id,
      action: "event_edit",
      targetType: "club",
      targetId: id,
      metadata: { name: updated.name, slug: updated.slug },
    });

    return NextResponse.json({ club: { id: updated.id } });
  } catch (e) {
    return apiError(e);
  }
}

/** DELETE /api/clubs/[id] — archive a club (moderator+). */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    await requireUser("moderator");
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid club id." }, { status: 400 });
    }

    const club = await db.club.findUnique({ where: { id } });
    if (!club) {
      return NextResponse.json({ error: "Club not found." }, { status: 404 });
    }

    await db.club.update({
      where: { id },
      data: { status: "archived" },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
