import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, hasRole, type SafeUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { audit } from "@/lib/audit";

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

const CreateBody = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(60).refine((v) => /^[a-z0-9-]+$/.test(v), "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().max(2000).optional(),
  category: ClubCategory,
  icon: z.string().trim().max(40).optional(),
  coverImageUrl: z.string().trim().max(500).optional(),
  status: z.enum(["active", "archived"]).optional(),
});

/** GET /api/clubs — public club list (positions included). */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status") ?? "active";

    const clubs = await db.club.findMany({
      where: {
        status,
        ...(category ? { category } : {}),
      },
      orderBy: [{ name: "asc" }],
      include: {
        positions: {
          where: { status: "open" },
          orderBy: [{ title: "asc" }],
        },
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json({
      clubs: clubs.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        category: c.category,
        icon: c.icon,
        coverImageUrl: c.coverImageUrl,
        status: c.status,
        positions: c.positions.map((p) => ({
          id: p.id,
          title: p.title,
          eligibleYear: p.eligibleYear,
          description: p.description,
          status: p.status,
        })),
        applicationCount: c._count.applications,
      })),
    });
  } catch (e) {
    return apiError(e);
  }
}

/** POST /api/clubs — create a club (moderator+). */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const me = await requireUser("moderator");
    const d = await parseJson(req, CreateBody);

    const existing = await db.club.findUnique({ where: { slug: d.slug } });
    if (existing) {
      return NextResponse.json({ error: "A club with this slug already exists." }, { status: 409 });
    }

    const club = await db.club.create({
      data: {
        name: d.name,
        slug: d.slug,
        description: d.description ?? null,
        category: d.category,
        icon: d.icon ?? null,
        coverImageUrl: d.coverImageUrl ?? null,
        status: d.status ?? "active",
        createdBy: me.id,
      },
    });

    await audit({
      actorId: me.id,
      action: "club_create",
      targetType: "club",
      targetId: club.id,
      metadata: { name: club.name, slug: club.slug },
    });

    return NextResponse.json({ club: { id: club.id, slug: club.slug } }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
