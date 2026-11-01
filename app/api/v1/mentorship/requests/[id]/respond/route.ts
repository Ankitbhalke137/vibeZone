import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  status: z.enum(["accepted", "rejected"]),
});

export async function PATCH(
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

    const request = await db.mentorshipRequest.findUnique({ where: { id } });
    if (!request || request.seniorId !== user.id) {
      return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
    }

    await db.mentorshipRequest.update({
      where: { id },
      data: { status: body.status },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to respond" }, { status: 500 });
  }
}
