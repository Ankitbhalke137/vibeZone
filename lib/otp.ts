import "server-only";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const OTP_TTL_MIN = 10; // FR-AUTH-001
export const OTP_MAX_RESENDS = 3;
export const OTP_MAX_ATTEMPTS = 5;

export function makeOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Peppered SHA-256 — codes are never stored in plaintext. */
export function hashOtp(code: string): string {
  return createHash("sha256").update(`${code}:${env.sessionSecret}`).digest("hex");
}

export function otpMatches(code: string, hash: string): boolean {
  const a = Buffer.from(hashOtp(code));
  const b = Buffer.from(hash);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** FR-AUTH-001: max 3 codes per email per 10 min. Returns false when throttled. */
export async function canRequestOtp(email: string): Promise<boolean> {
  const since = new Date(Date.now() - OTP_TTL_MIN * 60_000);
  const recent = await db.emailOtp.count({ where: { email, createdAt: { gte: since } } });
  return recent < OTP_MAX_RESENDS;
}

export async function issueOtp(email: string): Promise<string> {
  await db.emailOtp.deleteMany({ where: { email } }); // one live code per email
  const code = makeOtp();
  await db.emailOtp.create({
    data: { email, codeHash: hashOtp(code), expiresAt: new Date(Date.now() + OTP_TTL_MIN * 60_000) },
  });
  return code;
}

export type OtpCheck =
  | { ok: true }
  | { ok: false; error: string; status: 400 | 401 | 429 | 410 };

/** Verifies and consumes an OTP. Failed attempts are counted (lockout after 5). */
export async function verifyOtp(email: string, code: string): Promise<OtpCheck> {
  const row = await db.emailOtp.findFirst({ where: { email }, orderBy: { createdAt: "desc" } });

  if (!row) return { ok: false, status: 401, error: "No code requested — request a new one." };
  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    await db.emailOtp.deleteMany({ where: { email } });
    return { ok: false, status: 429, error: "Too many wrong tries — request a new code." };
  }
  if (row.expiresAt < new Date()) {
    await db.emailOtp.delete({ where: { id: row.id } }).catch(() => {});
    return { ok: false, status: 410, error: "That code expired — request a new one." };
  }
  if (!otpMatches(code, row.codeHash)) {
    await db.emailOtp.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, status: 401, error: "Wrong code — try again." };
  }

  await db.emailOtp.deleteMany({ where: { email } }); // consume
  return { ok: true };
}
