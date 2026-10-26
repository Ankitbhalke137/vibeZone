import { createHash } from "node:crypto";

/**
 * All scheduling in VibeZone uses IST (PRD NFR-011). Keep the helpers here so
 * the weekly leaderboard, daily points caps and poll windows can never disagree.
 */
export const IST_OFFSET_MIN = 330;

export function istParts(date = new Date()) {
  const shifted = new Date(date.getTime() + IST_OFFSET_MIN * 60_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    weekday: shifted.getUTCDay(), // 0 = Sunday
  };
}

/** YYYY-MM-DD in IST. */
export function istDayKey(date = new Date()): string {
  const p = istParts(date);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** UTC instant for 00:00 IST on the given day. */
export function startOfDayIST(date = new Date()): Date {
  const p = istParts(date);
  return new Date(Date.UTC(p.year, p.month - 1, p.day, 0, 0, 0) - IST_OFFSET_MIN * 60_000);
}

/** UTC instant for the next 00:00 IST after `date`. */
export function endOfDayIST(date = new Date()): Date {
  const start = startOfDayIST(date);
  return new Date(start.getTime() + 24 * 60 * 60_000);
}

/** Monday 00:00 IST of the week containing `date` (leaderboard window, FR-PLAY-005). */
export function startOfWeekIST(date = new Date()): Date {
  const start = startOfDayIST(date);
  const p = istParts(start);
  const daysSinceMonday = (p.weekday + 6) % 7;
  return new Date(start.getTime() - daysSinceMonday * 24 * 60 * 60_000);
}

export function nextMondayIST(date = new Date()): Date {
  const start = startOfWeekIST(date);
  return new Date(start.getTime() + 7 * 24 * 60 * 60_000);
}

/**
 * Deterministic UUID from an arbitrary string. Used as the nullable `ref_id`
 * dedupe key in point_ledger for daily / once-per-user actions.
 */
export function uuidFromString(input: string): string {
  const h = createHash("sha256").update(input).digest("hex");
  const variant = ((parseInt(h[16]!, 16) & 0x3) | 0x8).toString(16);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-${variant}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

/** 07:00 / 23:00 IST windows for the daily poll (FR-PLAY-001). */
export function todayPollWindow(date = new Date()) {
  const start = startOfDayIST(date);
  return {
    opensAt: new Date(start.getTime() + 7 * 60 * 60_000),
    closesAt: new Date(start.getTime() + 23 * 60 * 60_000),
  };
}

/** Human-friendly IST timestamp used in server-rendered pages. */
export function formatIST(date: Date, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  }).format(date);
}

export function formatISTTime(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
