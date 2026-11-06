import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type AuditAction =
  | "reveal_alias"
  | "ban"
  | "unban"
  | "delete_msg"
  | "delete_content"
  | "warn"
  | "role_change"
  | "announcement_create"
  | "announcement_edit"
  | "announcement_archive"
  | "event_create"
  | "event_edit"
  | "event_close"
  | "channel_edit"
  | "poll_create"
  | "poll_close"
  | "feedback_review"
  | "report_dismiss"
  | "report_action"
  | "mentorship_accept"
  | "mentorship_reject"
  | "club_create"
  | "club_position_create"
  | "club_application_review";

/** Every privileged action lands in audit_logs (PRD §10, Week 5 compliance gate). */
export async function audit(entry: {
  actorId: string | null;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        targetType: entry.targetType ?? null,
        targetId: entry.targetId ?? null,
        reason: entry.reason ?? null,
        metadata: (entry.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });
  } catch (err) {
    // Auditing must never break the primary action — but it is loud.
    console.error("[audit] failed to write log entry:", err);
  }
}
