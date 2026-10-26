import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  contentType: z.enum(["message", "note", "lost_found", "announcement"]),
  contentId: z.string(),
  action: z.enum(["dismiss", "delete", "warn", "ban"]),
  reason: z.string().trim().max(300).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    assertSameOrigin(req);
    const me = await requireUser("moderator");
    const { id } = await params;
    const d = await parseJson(req, Body);

    if (d.action === "warn" || d.action === "ban") {
      if (!d.reason) {
        return NextResponse.json({ error: "Reason required." }, { status: 400 });
      }
    }

    if (d.contentType === "message") {
      const report = await db.messageReport.findUnique({ where: { id } });
      if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });

      const message = await db.message.findUnique({ where: { id: report.messageId } });
      if (!message) return NextResponse.json({ error: "Message not found." }, { status: 404 });

      await db.messageReport.update({ where: { id }, data: { status: "actioned", handledBy: me.id, handledAt: new Date() } });

      if (d.action === "delete") {
        await db.message.update({ where: { id: message.id }, data: { deletedAt: new Date() } });
        await audit({ actorId: me.id, action: "delete_msg", targetType: "message", targetId: message.id, reason: d.reason });
      } else if (d.action === "warn") {
        await db.userWarning.create({ data: { userId: message.senderId, issuedBy: me.id, reason: d.reason ?? "", reportId: id } });
        const warns = await db.userWarning.count({ where: { userId: message.senderId } });
        if (warns >= 3) {
          await db.user.update({ where: { id: message.senderId }, data: { status: "banned", sessionVersion: { increment: 1 } } });
          await audit({ actorId: me.id, action: "ban", targetType: "user", targetId: message.senderId, reason: "3-strike auto-ban" });
        }
        await audit({ actorId: me.id, action: "warn", targetType: "user", targetId: message.senderId, reason: d.reason });
      } else {
        await audit({ actorId: me.id, action: "report_dismiss", targetType: "message", targetId: message.id, reason: d.reason });
      }
    } else {
      const report = await db.contentReport.findUnique({ where: { id } });
      if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });

      await db.contentReport.update({ where: { id }, data: { status: "actioned", handledBy: me.id, handledAt: new Date() } });

      if (d.action === "delete") {
        if (d.contentType === "note") {
          await db.note.update({ where: { id: report.contentId }, data: { removedAt: new Date() } });
        } else if (d.contentType === "lost_found") {
          await db.lostAndFound.update({ where: { id: report.contentId }, data: { status: "resolved", resolvedAt: new Date() } });
        } else if (d.contentType === "announcement") {
          await db.announcement.update({ where: { id: report.contentId }, data: { archivedAt: new Date() } });
        }
        await audit({ actorId: me.id, action: "delete_content", targetType: d.contentType, targetId: report.contentId, reason: d.reason });
      } else if (d.action === "warn") {
        const contentOwner = await db.user.findFirst({
          where: { OR: [{ id: report.contentId }] },
          select: { id: true },
        });
        if (contentOwner) {
          await db.userWarning.create({ data: { userId: contentOwner.id, issuedBy: me.id, reason: d.reason ?? "", reportId: id } });
          await audit({ actorId: me.id, action: "warn", targetType: "user", targetId: contentOwner.id, reason: d.reason });
        }
      } else {
        await audit({ actorId: me.id, action: "report_dismiss", targetType: d.contentType, targetId: report.contentId, reason: d.reason });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
