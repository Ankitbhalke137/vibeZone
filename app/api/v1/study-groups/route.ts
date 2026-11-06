import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000).optional(),
  subject: z.string().trim().min(1).max(100),
  branch: z.string().trim().max(50).optional(),
  year: z.number().int().min(1).max(4).optional(),
  maxMembers: z.number().int().min(1).max(100).optional().default(20),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const groups = await db.studyGroup.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        creator: { select: { id: true, name: true, handle: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ groups });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load groups" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = Body.parse(await req.json());

    const group = await db.studyGroup.create({
      data: {
        title: body.title,
        description: body.description,
        subject: body.subject,
        branch: body.branch,
        year: body.year,
        maxMembers: body.maxMembers,
        createdBy: user.id,
      },
      include: {
        creator: { select: { id: true, name: true, handle: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
