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

/** Resolve the author of moderated content so warnings/bans hit the right user. */
async function contentOwnerId(contentType: string, contentId: string): Promise<string | null> {
  if (contentType === "note") {
    const note = await db.note.findUnique({ where: { id: contentId }, select: { uploadedBy: true } });
    return note?.uploadedBy ?? null;
  }
  if (contentType === "lost_found") {
    const item = await db.lostAndFound.findUnique({ where: { id: contentId }, select: { userId: true } });
    return item?.userId ?? null;
  }
  if (contentType === "announcement") {
    const announcement = await db.announcement.findUnique({
      where: { id: contentId },
      select: { authorId: true },
    });
    return announcement?.authorId ?? null;
  }
  return null;
}

async function issueWarning({
  actorId,
  userId,
  reason,
  reportId,
}: {
  actorId: string;
  userId: string;
  reason: string;
  reportId: string;
}) {
  await db.userWarning.create({
    data: { userId, issuedBy: actorId, reason, reportId },
  });
  const warnings = await db.userWarning.count({ where: { userId } });
  if (warnings >= 3) {
    await db.user.update({
      where: { id: userId },
      data: { status: "banned", sessionVersion: { increment: 1 } },
    });
    await audit({
      actorId,
      action: "ban",
      targetType: "user",
      targetId: userId,
      reason: "3-strike auto-ban",
    });
  }
  await audit({ actorId, action: "warn", targetType: "user", targetId: userId, reason });
}

async function suspendUser(actorId: string, userId: string, reason: string) {
  await db.user.update({
    where: { id: userId },
    data: { status: "banned", sessionVersion: { increment: 1 } },
  });
  await audit({ actorId, action: "ban", targetType: "user", targetId: userId, reason });
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    assertSameOrigin(req);
    const me = await requireUser("moderator");
    const { id } = await params;
    const d = await parseJson(req, Body);

    if ((d.action === "warn" || d.action === "ban") && !d.reason) {
      return NextResponse.json({ error: "A reason is required." }, { status: 400 });
    }

    if (d.contentType === "message") {
      const report = await db.messageReport.findUnique({ where: { id } });
      if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });

      const message = await db.message.findUnique({ where: { id: report.messageId } });
      if (!message) return NextResponse.json({ error: "Message not found." }, { status: 404 });

      await db.messageReport.update({
        where: { id },
        data: {
          status: d.action === "dismiss" ? "dismissed" : "actioned",
          handledBy: me.id,
          handledAt: new Date(),
        },
      });

      if (d.action === "delete") {
        await db.message.update({ where: { id: message.id }, data: { deletedAt: new Date() } });
        await audit({
          actorId: me.id,
          action: "delete_msg",
          targetType: "message",
          targetId: message.id,
          reason: d.reason,
        });
      } else if (d.action === "warn") {
        await issueWarning({
          actorId: me.id,
          userId: message.senderId,
          reason: d.reason ?? "",
          reportId: id,
        });
      } else if (d.action === "ban") {
        await suspendUser(me.id, message.senderId, d.reason ?? "");
      } else {
        await audit({
          actorId: me.id,
          action: "report_dismiss",
          targetType: "message",
          targetId: message.id,
          reason: d.reason,
        });
      }
    } else {
      const report = await db.contentReport.findUnique({ where: { id } });
      if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });

      await db.contentReport.update({
        where: { id },
        data: {
          status: d.action === "dismiss" ? "dismissed" : "actioned",
          handledBy: me.id,
          handledAt: new Date(),
        },
      });

      if (d.action === "delete") {
        if (d.contentType === "note") {
          await db.note.update({ where: { id: report.contentId }, data: { removedAt: new Date() } });
        } else if (d.contentType === "lost_found") {
          await db.lostAndFound.update({
            where: { id: report.contentId },
            data: { status: "resolved", resolvedAt: new Date() },
          });
        } else if (d.contentType === "announcement") {
          await db.announcement.update({
            where: { id: report.contentId },
            data: { archivedAt: new Date() },
          });
        }
        await audit({
          actorId: me.id,
          action: "delete_content",
          targetType: d.contentType,
          targetId: report.contentId,
          reason: d.reason,
        });
      } else if (d.action === "warn" || d.action === "ban") {
        const ownerId = await contentOwnerId(d.contentType, report.contentId);
        if (!ownerId) {
          return NextResponse.json(
            { error: "The author of this content could not be resolved." },
            { status: 404 },
          );
        }
        if (d.action === "warn") {
          await issueWarning({
            actorId: me.id,
            userId: ownerId,
            reason: d.reason ?? "",
            reportId: id,
          });
        } else {
          await suspendUser(me.id, ownerId, d.reason ?? "");
        }
      } else {
        await audit({
          actorId: me.id,
          action: "report_dismiss",
          targetType: d.contentType,
          targetId: report.contentId,
          reason: d.reason,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
