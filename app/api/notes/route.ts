import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Query = z.object({
  search: z.string().optional(),
  subject: z.string().optional(),
  branch: z.string().optional(),
  year: z.string().optional(),
  type: z.string().optional(),
  sort: z.enum(["newest", "top"]).default("newest"),
});

const CreateBody = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(500).optional(),
  subject: z.string().trim().min(1).max(80),
  branch: z.string().trim().min(1).max(50),
  year: z.number().int().min(1).max(4).optional(),
  semester: z.number().int().min(1).max(10).optional(),
  type: z.enum(["Notes", "PYQ", "Lab", "Slides", "Other"]).default("Notes"),
  external_link: z.string().trim().refine((v) => /^https:\/\//.test(v), "Link must be https"),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = Query.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid filters." }, { status: 400 });
    }
    const f = parsed.data;

    const notes = await db.note.findMany({
      where: {
        removedAt: null,
        ...(f.search ? { title: { contains: f.search, mode: "insensitive" } } : {}),
        ...(f.subject ? { subject: f.subject } : {}),
        ...(f.branch ? { branch: f.branch } : {}),
        ...(f.year ? { year: Number(f.year) } : {}),
        ...(f.type ? { type: f.type } : {}),
      },
      orderBy: f.sort === "top" ? [{ openCount: "desc" }] : [{ createdAt: "desc" }],
      take: 50,
      include: {
        _count: { select: { votes: true, reviews: true } },
        reviews: { select: { rating: true } },
        uploader: { select: { name: true, handle: true } },
      },
    });

    return NextResponse.json({
      notes: notes.map((n) => {
        const ratings = n.reviews.map((r) => r.rating);
        const avgRating =
          ratings.length > 0
            ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
            : 0;
        return {
          id: n.id,
          title: n.title,
          description: n.description,
          subject: n.subject,
          branch: n.branch,
          year: n.year,
          semester: n.semester,
          type: n.type,
          externalLink: n.externalLink,
          openCount: n.openCount,
          voteCount: n._count.votes,
          reviewCount: n._count.reviews,
          avgRating,
          uploadedBy: n.uploader.name,
          uploadedByHandle: n.uploader.handle,
          createdAt: n.createdAt.toISOString(),
        };
      }),
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
    const note = await db.note.create({
      data: {
        title: d.title,
        description: d.description ?? null,
        subject: d.subject,
        branch: d.branch,
        year: d.year ?? null,
        semester: d.semester ?? null,
        type: d.type,
        externalLink: d.external_link,
        uploadedBy: me.id,
      },
    });
    return NextResponse.json({ note: { id: note.id } }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
