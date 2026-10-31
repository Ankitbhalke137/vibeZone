import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { istDayKey, uuidFromString } from "@/lib/time";

/**
 * Points engine (PRD Appendix A / FR-PLAY-004). Server-side only.
 * `point_ledger` is append-only; every award is deduped by
 * (user, action, ref_type, ref_id) and optionally capped per IST day.
 */
export const POINTS = {
  verify_otp: { points: 20, cap: null },
  profile_complete: { points: 20, cap: null },
  poll_vote: { points: 5, cap: 1 },
  msg_send: { points: 1, cap: 10 },
  first_msg_day: { points: 3, cap: 1 },
  login: { points: 2, cap: 1 },
  rsvp: { points: 10, cap: null },
  attend_event: { points: 15, cap: null },
  note_upload: { points: 10, cap: 3 },
  note_upvote: { points: 1, cap: 5 },
  note_upvoted: { points: 2, cap: 10 },
  lostfound_post: { points: 5, cap: 1 },
  post_create: { points: 2, cap: 5 },
  quiz_complete: { points: 25, cap: null },
  mentorship_accept: { points: 15, cap: null },
  report_actioned: { points: 5, cap: 2 },
} as const;

export type PointAction = keyof typeof POINTS;

/** `point_ledger.bucket_date` is a DATE column — use UTC midnight for the IST day key. */
function bucketFor(date = new Date()): Date {
  return new Date(`${istDayKey(date)}T00:00:00.000Z`);
}

/**
 * Award points for an action. Returns false when deduped or the daily cap is hit.
 * Never throws: points must not break the user's primary action.
 */
export async function awardPoints(
  userId: string,
  action: PointAction,
  opts: {
    refType?: string;
    /** Stable id used by the unique dedupe index. */
    refId?: string;
    points?: number;
    /** Override the Appendix A cap (null = uncapped). */
    cap?: number | null;
    date?: Date;
  } = {},
): Promise<boolean> {
  const cfg = POINTS[action];
  const bucketDate = bucketFor(opts.date);
  const refType = opts.refType ?? null;
  const refId = opts.refId ?? null;
  const cap = opts.cap !== undefined ? opts.cap : cfg.cap;
  const points = opts.points ?? cfg.points;

  try {
    if (cap !== null && cap !== undefined) {
      const used = await db.pointLedger.count({
        where: { userId, action, bucketDate },
      });
      if (used >= cap) return false;
    }

    await db.pointLedger.create({
      data: { userId, action, points, refType, refId, bucketDate },
    });
    return true;
  } catch (err) {
    // P2002 = unique dedupe hit — perfectly normal for repeated actions.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return false;
    }
    console.error(`[points] award ${action} failed:`, err);
    return false;
  }
}

/**
 * Daily actions that should only score once per day regardless of who triggers
 * them (login, first message of the day). Uses a deterministic UUID ref id.
 */
export async function awardOncePerDay(
  userId: string,
  action: Extract<PointAction, "login" | "first_msg_day">,
  date = new Date(),
): Promise<boolean> {
  return awardPoints(userId, action, {
    refType: "day",
    refId: uuidFromString(`${action}:${userId}:${istDayKey(date)}`),
    date,
  });
}

export async function pointsTotal(userId: string): Promise<number> {
  const agg = await db.pointLedger.aggregate({ _sum: { points: true }, where: { userId } });
  return agg._sum.points ?? 0;
}
