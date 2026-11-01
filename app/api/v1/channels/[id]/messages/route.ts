import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { serializeMessage } from "@/lib/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  body: z.string().trim().min(1).max(4000),
  alias: z.boolean().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const rows = await db.message.findMany({
      where: { channelId: id, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        sender: { select: { id: true, name: true, handle: true, avatarUrl: true } },
      },
    });

    const messages = rows.reverse().map((m) => serializeMessage(m));

    return NextResponse.json({ messages });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

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

    const message = await db.message.create({
      data: {
        channelId: id,
        senderId: user.id,
        body: body.body,
        aliasName: body.alias ? user.name : null,
      },
      include: { sender: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
    });

    const dto = serializeMessage(message);

    return NextResponse.json({ message: dto }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
