import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(5000),
  category: z.string().trim().min(1).max(50).default("general"),
  tags: z.array(z.string().trim().min(1).max(50)).max(5).optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const questions = await db.question.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        author: { select: { id: true, name: true, handle: true, avatarUrl: true } },
        _count: { select: { answers: true } },
      },
    });

    return NextResponse.json({ questions });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = Body.parse(await req.json());

    const question = await db.question.create({
      data: {
        title: body.title,
        body: body.body,
        category: body.category,
        tags: body.tags,
        authorId: user.id,
      },
      include: {
        author: { select: { id: true, name: true, handle: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
