import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  seniorId: z.string().uuid(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const requests = await db.mentorshipRequest.findMany({
      where: { studentId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { senior: { select: { id: true, name: true, handle: true, avatarUrl: true, branch: true, year: true, expertise: true } } },
    });

    return NextResponse.json({ requests });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load requests" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = Body.parse(await req.json());

    const existing = await db.mentorshipRequest.findFirst({
      where: { studentId: user.id, seniorId: body.seniorId },
    });
    if (existing) {
      return NextResponse.json({ error: "Request already exists" }, { status: 400 });
    }

    const request = await db.mentorshipRequest.create({
      data: { studentId: user.id, seniorId: body.seniorId, status: "pending" },
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
}
