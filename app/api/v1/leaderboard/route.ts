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

    const weekly = await db.pointLedger.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      _sum: { points: true },
      orderBy: { _sum: { points: "desc" } },
      take: 20,
    });

    const allTime = await db.pointLedger.groupBy({
      by: ["userId"],
      _sum: { points: true },
      orderBy: { _sum: { points: "desc" } },
      take: 20,
    });

    const users = await db.user.findMany({
      where: { id: { in: [...weekly.map((r) => r.userId), ...allTime.map((r) => r.userId)] } },
      select: { id: true, name: true, handle: true, avatarUrl: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return NextResponse.json({
      weekly: weekly.map((r, i) => ({ rank: i + 1, ...userMap.get(r.userId), points: r._sum.points })),
      allTime: allTime.map((r, i) => ({ rank: i + 1, ...userMap.get(r.userId), points: r._sum.points })),
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}
