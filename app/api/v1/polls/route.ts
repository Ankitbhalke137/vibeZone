import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  question: z.string().trim().min(1).max(500),
  options: z.array(z.string().trim().min(1).max(100)).min(2).max(10),
  opensAt: z.string().datetime(),
  closesAt: z.string().datetime(),
});

export async function GET() {
  try {
    const polls = await db.poll.findMany({
      where: { status: "open" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { _count: { select: { votes: true } } },
    });
    return NextResponse.json({ polls });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load polls" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = Body.parse(await req.json());

    const poll = await db.poll.create({
      data: {
        question: body.question,
        options: body.options,
        opensAt: new Date(body.opensAt),
        closesAt: new Date(body.closesAt),
        status: "open",
        createdBy: user.id,
      },
    });

    return NextResponse.json({ poll }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create poll" }, { status: 500 });
  }
}
