import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/api";
import { startOfWeekIST } from "@/lib/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const me = await requireUser();
    const period = (url.searchParams.get("period") ?? "week") as "week" | "all";

    const where: Record<string, unknown> = {};
    if (period === "week") {
      const weekStart = startOfWeekIST();
      where.bucketDate = { gte: new Date(`${weekStart.toISOString().slice(0, 10)}T00:00:00.000Z`) };
    }

    const rows = await db.pointLedger.groupBy({
      by: ["userId"],
      where,
      _sum: { points: true },
      orderBy: { _sum: { points: "desc" } },
      take: 50,
    });

    const userIds = rows.map((r) => r.userId);
    const users = await db.user.findMany({
      where: { id: { in: userIds }, status: "active" },
      select: { id: true, handle: true, name: true, avatarUrl: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const leaderboard = rows
      .map((r, idx) => {
        const u = userMap.get(r.userId);
        if (!u) return null;
        return {
          rank: idx + 1,
          userId: u.id,
          handle: u.handle,
          name: u.name,
          avatarUrl: u.avatarUrl,
          points: r._sum.points ?? 0,
        };
      })
      .filter(Boolean);

    const myPointsRow = rows.find((r) => r.userId === me.id);
    const myPoints = myPointsRow?._sum.points ?? 0;
    const myRank = leaderboard.findIndex((l) => l?.userId === me.id) + 1;

    return NextResponse.json({
      period,
      leaderboard: leaderboard.slice(0, 10),
      yourRank: myRank > 0 ? myRank : null,
      yourPoints: myPoints,
    });
  } catch (e) {
    return apiError(e);
  }
}
