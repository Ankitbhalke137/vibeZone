import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin } from "@/lib/api";
import { notifyUser } from "@/lib/notify";
import { awardPoints } from "@/lib/points";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const ReviewBody = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional().nullable(),
});

/** GET /api/notes/[id]/reviews — list reviews for a note (public). */
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const note = await db.note.findUnique({
      where: { id },
      select: {
        id: true,
        _count: { select: { reviews: true, votes: true } },
        reviews: {
          orderBy: [{ createdAt: "desc" }],
          take: 20,
          include: {
            user: { select: { id: true, name: true, handle: true, year: true, branch: true } },
          },
        },
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    const ratings = note.reviews.map((r) => r.rating);
    const avgRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : 0;

    return NextResponse.json({
      noteId: id,
      reviewCount: note._count.reviews,
      voteCount: note._count.votes,
      avgRating,
      reviews: note.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
      })),
    });
  } catch (e) {
    return apiError(e);
  }
}

/** POST /api/notes/[id]/reviews — submit or update a review (authenticated). */
export async function POST(req: Request, { params }: Params) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const { id } = await params;

    const note = await db.note.findUnique({ where: { id } });
    if (!note || note.removedAt) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    const d = await req.json();
    const parsed = ReviewBody.safeParse(d);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
    }

    const existing = await db.noteReview.findUnique({
      where: { noteId_userId: { noteId: id, userId: me.id } },
    });

    const review = await db.noteReview.upsert({
      where: { noteId_userId: { noteId: id, userId: me.id } },
      update: { rating: d.rating, comment: d.comment ?? null },
      create: { noteId: id, userId: me.id, rating: d.rating, comment: d.comment ?? null },
    });

    // Notify the note uploader (best effort — don't break the review)
    if (note.uploadedBy !== me.id) {
      try {
        const stars = "★".repeat(d.rating) + "☆".repeat(5 - d.rating);
        await notifyUser(note.uploadedBy, {
          type: "system",
          title: "New review on your resource",
          body: `${me.name} rated "${note.title}" ${stars}`,
          link: `/notes`,
        });
      } catch {
        // notifications must not break the review
      }
    }

    // Award points only on first review, not on edits
    if (!existing) {
      await awardPoints(me.id, "note_review", { refType: "note", refId: id });
    }

    return NextResponse.json({ ok: true, review });
  } catch (e) {
    return apiError(e);
  }
}
