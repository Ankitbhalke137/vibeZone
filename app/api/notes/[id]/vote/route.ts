import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin } from "@/lib/api";
import { awardPoints } from "@/lib/points";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    assertSameOrigin(_req as Request);
    const me = await requireUser();
    const { id } = await params;

    const note = await db.note.findUnique({ where: { id } });
    if (!note || note.removedAt) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    const existing = await db.noteVote.findUnique({
      where: { noteId_userId: { noteId: id, userId: me.id } },
    });

    let voted = false;
    if (existing) {
      await db.noteVote.delete({ where: { noteId_userId: { noteId: id, userId: me.id } } });
    } else {
      await db.noteVote.create({ data: { noteId: id, userId: me.id } });
      voted = true;
      await awardPoints(me.id, "note_upvote", { refType: "note", refId: id });
      if (note.uploadedBy !== me.id) {
        await awardPoints(note.uploadedBy, "note_upvoted", { refType: "note", refId: id });
      }
    }

    const voteCount = await db.noteVote.count({ where: { noteId: id } });
    return NextResponse.json({ ok: true, voted, voteCount });
  } catch (e) {
    return apiError(e);
  }
}
