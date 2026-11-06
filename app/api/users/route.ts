import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/users — active users (for admin selectors). Moderator+. */
export async function GET(req: Request) {
  try {
    await requireUser("moderator");
    const users = await db.user.findMany({
      where: { status: "active" },
      select: {
        id: true,
        name: true,
        handle: true,
        email: true,
        role: true,
        year: true,
        branch: true,
        avatarUrl: true,
      },
      orderBy: [{ name: "asc" }],
    });
    return NextResponse.json({ users });
  } catch (e) {
    return apiError(e);
  }
}
