import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  itemName: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(2000),
  type: z.enum(["lost", "found"]),
  location: z.string().optional(),
  occurredOn: z.string().datetime().optional(),
  contactInfo: z.string().optional(),
  imageUrl: z.string().optional(),
});

export async function GET() {
  try {
    const items = await db.lostAndFound.findMany({
      where: { removedAt: null, status: "open" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = Body.parse(await req.json());

    const item = await db.lostAndFound.create({
      data: {
        itemName: body.itemName,
        description: body.description,
        type: body.type,
        location: body.location || null,
        occurredOn: body.occurredOn ? new Date(body.occurredOn) : null,
        contactInfo: body.contactInfo || null,
        imageUrl: body.imageUrl || null,
        userId: user.id,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
