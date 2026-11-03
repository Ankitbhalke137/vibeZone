import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  title: z.string().trim().min(1).max(200),
  company: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().min(1).max(50),
  url: z.string().url().optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(5).optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const resources = await db.placementResource.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        creator: { select: { id: true, name: true, handle: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ resources });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load resources" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = Body.parse(await req.json());

    const resource = await db.placementResource.create({
      data: {
        title: body.title,
        company: body.company,
        description: body.description,
        category: body.category,
        url: body.url,
        tags: body.tags,
        createdBy: user.id,
      },
      include: {
        creator: { select: { id: true, name: true, handle: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create resource" }, { status: 500 });
  }
}
