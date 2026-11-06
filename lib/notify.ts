import "server-only";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export type NotificationType =
  | "dm"
  | "announcement"
  | "event_reminder"
  | "poll_open"
  | "mentorship"
  | "moderation"
  | "club_application"
  | "system";

type NotifyInput = {
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
  /** Skip these users (e.g. the actor who triggered the event). */
  excludeUserIds?: string[];
};

type PushSub = { endpoint: string; p256dh: string; auth: string; userId: string };

/**
 * Creates in-app notifications (FR-NOTIF-001) and, when VAPID is configured,
 * sends Web Push to each user's subscriptions (FR-NOTIF-002).
 * Per-category opt-outs are respected.
 */
export async function notifyUsers(userIds: string[], input: NotifyInput): Promise<number> {
  const ids = [...new Set(userIds)].filter((id) => !input.excludeUserIds?.includes(id));
  if (ids.length === 0) return 0;

  try {
    const prefs = await db.notificationPref.findMany({
      where: { userId: { in: ids }, category: input.type },
      select: { userId: true, inappEnabled: true, pushEnabled: true, emailEnabled: true },
    });
    const prefMap = new Map(prefs.map((p) => [p.userId, p]));

    const inappTargets = ids.filter((id) => prefMap.get(id)?.inappEnabled ?? true);
    if (inappTargets.length > 0) {
      await db.notification.createMany({
        data: inappTargets.map((userId) => ({
          userId,
          type: input.type,
          title: input.title,
          body: input.body ?? null,
          link: input.link ?? null,
        })),
      });
    }

    if (env.vapidPublicKey && env.vapidPrivateKey) {
      const pushTargets = ids.filter((id) => prefMap.get(id)?.pushEnabled ?? true);
      if (pushTargets.length > 0) {
        await sendPush(pushTargets, {
          title: input.title,
          body: input.body ?? "",
          url: input.link ?? "/notifications",
        });
      }
    }

    return inappTargets.length;
  } catch (err) {
    // Notifications are best-effort — never break the action that caused them.
    console.error("[notify] failed:", err);
    return 0;
  }
}

export async function notifyUser(userId: string, input: NotifyInput): Promise<number> {
  return notifyUsers([userId], input);
}

/** Fan-out helper used by announcements, polls and the VM scheduler. */
export async function notifyEveryone(input: NotifyInput): Promise<number> {
  const users = await db.user.findMany({
    where: { status: "active" },
    select: { id: true },
  });
  return notifyUsers(
    users.map((u) => u.id),
    input,
  );
}

async function sendPush(userIds: string[], payload: { title: string; body: string; url: string }) {
  const subs = (await db.pushSubscription.findMany({
    where: { userId: { in: userIds } },
    select: { endpoint: true, p256dh: true, auth: true, userId: true },
  })) as PushSub[];
  if (subs.length === 0) return;

  const webpush = await import("web-push");
  webpush.default.setVapidDetails(env.vapidSubject, env.vapidPublicKey!, env.vapidPrivateKey!);

  await Promise.allSettled(
    subs.map(async (s) => {
      try {
        await webpush.default.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
        );
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await db.pushSubscription.delete({ where: { endpoint: s.endpoint } }).catch(() => {});
        } else {
          console.error("[push] send failed:", status ?? err);
        }
      }
    }),
  );
}
