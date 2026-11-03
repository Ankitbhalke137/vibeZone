import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  body: z.string().trim().min(1).max(5000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const body = Body.parse(await req.json());

    const question = await db.question.findUnique({
      where: { id },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const answer = await db.answer.create({
      data: {
        questionId: id,
        authorId: user.id,
        body: body.body,
      },
      include: {
        author: { select: { id: true, name: true, handle: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ answer }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create answer" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const answers = await db.answer.findMany({
      where: { questionId: id },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, handle: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ answers });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load answers" }, { status: 500 });
  }
}
