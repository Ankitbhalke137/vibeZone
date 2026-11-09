/**
 * Best-effort in-memory rate limiter (per serverless instance).
 * The DB-level OTP resend cap (lib/otp) is the authoritative guard (FR-AUTH-001).
 * Redis-backed limiter is a v1.5 item if abuse appears.
 */
type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

/** Returns false when the caller exceeded `limit` within `windowMs`. */
export function hit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = store.get(key);
  if (!b || b.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  b.count += 1;
  if (store.size > 5_000) store.clear(); // safety valve
  return b.count <= limit;
}

/** Increments the bucket and returns the new count (used for security counters). */
export function bump(key: string, windowMs: number): number {
  const now = Date.now();
  const b = store.get(key);
  if (!b || b.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return 1;
  }
  b.count += 1;
  return b.count;
}
