import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/announcements/[id]/track — FR-ANN-005 impressions + click-through.
 * Body: { event: "view" | "click" }. Public (guests can read the board).
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hit(`ann-track:${clientIp(req.headers)}`, 60, 60_000)) {
    return NextResponse.json({ ok: true }); // silently drop — tracking must never block UX
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const event = body?.event === "click" ? "click" : "view";

  try {
    await db.announcement.update({
      where: { id },
      data: event === "click" ? { clickCount: { increment: 1 } } : { viewCount: { increment: 1 } },
    });
  } catch {
    // unknown id or race — tracking is best-effort
  }

  return NextResponse.json({ ok: true });
}
