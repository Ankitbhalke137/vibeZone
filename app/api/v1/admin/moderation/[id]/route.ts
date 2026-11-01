import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  contentType: z.enum(["message", "note", "lost_found", "announcement"]),
  contentId: z.string(),
  action: z.enum(["dismiss", "delete", "warn", "ban"]),
  reason: z.string().trim().max(300).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const me = await requireUser("moderator");
    const { id } = await params;
    const d = await req.json();
    const parsed = Body.safeParse(d);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { contentType, contentId, action, reason } = parsed.data;

    if ((action === "warn" || action === "ban") && !reason) {
      return NextResponse.json({ error: "Reason required" }, { status: 400 });
    }

    if (contentType === "message") {
      const report = await db.messageReport.findUnique({ where: { id } });
      if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
      const message = await db.message.findUnique({ where: { id: report.messageId } });
      if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });

      await db.messageReport.update({
        where: { id },
        data: { status: action === "dismiss" ? "dismissed" : "actioned", handledBy: me.id, handledAt: new Date() },
      });

      if (action === "delete") {
        await db.message.update({ where: { id: message.id }, data: { deletedAt: new Date() } });
      } else if (action === "warn") {
        await db.userWarning.create({ data: { userId: message.senderId, issuedBy: me.id, reason: reason ?? "", reportId: id } });
      } else if (action === "ban") {
        await db.user.update({ where: { id: message.senderId }, data: { status: "banned", sessionVersion: { increment: 1 } } });
      }
    } else {
      const report = await db.contentReport.findUnique({ where: { id } });
      if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

      await db.contentReport.update({
        where: { id },
        data: { status: action === "dismiss" ? "dismissed" : "actioned", handledBy: me.id, handledAt: new Date() },
      });

      if (action === "delete") {
        if (contentType === "note") await db.note.update({ where: { id: report.contentId }, data: { removedAt: new Date() } });
        else if (contentType === "lost_found") await db.lostAndFound.update({ where: { id: report.contentId }, data: { status: "resolved", resolvedAt: new Date() } });
        else if (contentType === "announcement") await db.announcement.update({ where: { id: report.contentId }, data: { archivedAt: new Date() } });
      } else if (action === "warn" || action === "ban") {
        const ownerId = await db.user.findFirst({ where: { id: report.contentId }, select: { id: true } });
        if (ownerId) {
          if (action === "warn") {
            await db.userWarning.create({ data: { userId: ownerId.id, issuedBy: me.id, reason: reason ?? "", reportId: id } });
          } else if (action === "ban") {
            await db.user.update({ where: { id: ownerId.id }, data: { status: "banned", sessionVersion: { increment: 1 } } });
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to process moderation action" }, { status: 500 });
  }
}
