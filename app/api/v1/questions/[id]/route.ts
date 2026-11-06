import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const question = await db.question.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, handle: true, avatarUrl: true, branch: true, year: true } },
        answers: {
          orderBy: [{ isAccepted: "desc" }, { createdAt: "asc" }],
          include: {
            author: { select: { id: true, name: true, handle: true, avatarUrl: true, role: true } },
          },
        },
        _count: { select: { answers: true } },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ question });
  } catch (e) {
    console.error("[questions] load failed:", e);
    return NextResponse.json({ error: "Failed to load question" }, { status: 500 });
  }
}
