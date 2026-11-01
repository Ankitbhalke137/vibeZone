import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().optional(),
  subject: z.string().trim().min(1).max(80),
  branch: z.string().trim().min(1).max(50),
  year: z.number().int().min(1).max(4).optional(),
  semester: z.number().int().min(1).max(10).optional(),
  type: z.string().trim().min(1).max(12).default("Notes"),
  externalLink: z.string().trim().max(500).optional(),
});

export async function GET() {
  try {
    const notes = await db.note.findMany({
      where: { removedAt: null },
      orderBy: [{ openCount: "desc" }, { createdAt: "desc" }],
      take: 50,
      include: { uploader: { select: { name: true, handle: true } } },
    });
    return NextResponse.json({ notes });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load notes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = Body.parse(await req.json());

    const note = await db.note.create({
      data: {
        title: body.title,
        description: body.description,
        subject: body.subject,
        branch: body.branch,
        year: body.year,
        semester: body.semester,
        type: body.type,
        externalLink: body.externalLink || "",
        uploadedBy: user.id,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
