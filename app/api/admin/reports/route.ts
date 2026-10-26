import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Query = z.object({
  contentType: z.enum(["message", "note", "lost_found", "announcement", "all"]).default("all"),
  status: z.enum(["open", "dismissed", "actioned", "all"]).default("open"),
});

export async function GET(req: Request) {
  try {
    const me = await requireUser("moderator");
    const url = new URL(req.url);
    const parsed = Query.safeParse(Object.fromEntries(url.searchParams));
    const ct = parsed?.data?.contentType ?? "all";
    const status = parsed?.data?.status ?? "open";

    const messageReports = await db.messageReport.findMany({
      where: status !== "all" ? { status } : {},
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        message: { select: { body: true, channelId: true, senderId: true, createdAt: true } },
        reporter: { select: { handle: true, name: true } },
        handler: { select: { handle: true } },
      },
    });

    const contentReports = await db.contentReport.findMany({
      where: status !== "all" ? { status } : {},
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        reporter: { select: { handle: true, name: true } },
        handler: { select: { handle: true } },
      },
    });

    return NextResponse.json({
      messageReports: messageReports.map((r) => ({
        id: r.id,
        contentType: "message",
        contentId: r.messageId,
        reporter: r.reporter ? `@${r.reporter.handle}` : "unknown",
        reason: r.reason,
        status: r.status,
        handledBy: r.handler ? `@${r.handler.handle}` : null,
        context: r.message ? r.message.body.slice(0, 200) : "",
        createdAt: r.createdAt.toISOString(),
      })),
      contentReports: contentReports.map((r) => ({
        id: r.id,
        contentType: r.contentType,
        contentId: r.contentId,
        reporter: r.reporter ? `@${r.reporter.handle}` : "unknown",
        reason: r.reason,
        detail: r.detail,
        status: r.status,
        handledBy: r.handler ? `@${r.handler.handle}` : null,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    return apiError(e);
  }
}
