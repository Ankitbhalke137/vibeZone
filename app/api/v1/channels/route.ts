import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const channels = await db.channel.findMany({
      where: {
        archivedAt: null,
        OR: [
          { type: "global" },
          { type: { in: ["dm", "mentorship"] }, members: { some: { userId: user.id } } },
        ],
      },
      orderBy: [{ type: "asc" }, { createdAt: "asc" }],
      include: {
        members: {
          where: { userId: { not: user.id } },
          take: 1,
          include: { user: { select: { name: true, handle: true, avatarUrl: true } } },
        },
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { body: true, createdAt: true, senderId: true },
        },
      },
    });

    return NextResponse.json({ channels });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load channels" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const channel = await db.channel.create({
      data: {
        name: body.name,
        slug: body.slug,
        type: body.type || "global",
        topic: body.topic || null,
        createdBy: user.id,
      },
    });

    return NextResponse.json({ channel }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create channel" }, { status: 500 });
  }
}
