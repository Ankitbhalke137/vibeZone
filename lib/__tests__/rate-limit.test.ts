/**
 * Unit tests for rate-limit.ts (best-effort in-memory limiter).
 * Pure function of `Date.now()` — driven with fake timers, no DB needed.
 * Runs with: npx vitest run --no-file-parallelism lib/__tests__/rate-limit.test.ts
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hit } from "@/lib/rate-limit";

describe("hit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first hit in a fresh window and counts it", () => {
    const key = "k1";
    expect(hit(key, 3, 1000)).toBe(true);
    expect(hit(key, 3, 1000)).toBe(true);
    expect(hit(key, 3, 1000)).toBe(true);
  });

  it("returns false once the limit is exceeded within the window", () => {
    const key = "k2";
    hit(key, 2, 1000);
    hit(key, 2, 1000);
    expect(hit(key, 2, 1000)).toBe(false);
    expect(hit(key, 2, 1000)).toBe(false);
  });

  it("resets to a fresh window once windowMs elapses", () => {
    const key = "k3";
    hit(key, 1, 1000);
    expect(hit(key, 1, 1000)).toBe(false);

    vi.setSystemTime(1000);
    expect(hit(key, 1, 1000)).toBe(true);
    expect(hit(key, 1, 1000)).toBe(false);

    vi.setSystemTime(2000);
    expect(hit(key, 1, 1000)).toBe(true);
  });

  it("keeps different keys independent", () => {
    expect(hit("key-a", 1, 1000)).toBe(true);
    expect(hit("key-a", 1, 1000)).toBe(false);
    expect(hit("key-b", 1, 1000)).toBe(true);
    expect(hit("key-b", 1, 1000)).toBe(false);
  });

  it("limit of 0 allows the first hit then rejects the rest in the window", () => {
    const key = "k4";
    expect(hit(key, 0, 1000)).toBe(true);
    expect(hit(key, 0, 1000)).toBe(false);
    expect(hit(key, 0, 1000)).toBe(false);
  });

  it("safety valve clears the store once it grows past 5,000 keys", () => {
    for (let i = 0; i < 5_001; i++) {
      hit(`key-${i}`, 1, 1000);
    }
    // Store was cleared on the 5001st insertion, so a fresh key is allowed again.
    expect(hit("fresh-key", 1, 1000)).toBe(true);
    expect(hit("fresh-key", 1, 1000)).toBe(false);
  });
});
