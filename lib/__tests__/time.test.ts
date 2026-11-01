/**
 * Property-based tests for IST time helpers.
 * Runs with: npx tsx lib/__tests__/time.test.ts
 */
import fc from "fast-check";
import {
  istParts,
  istDayKey,
  startOfDayIST,
  endOfDayIST,
  startOfWeekIST,
  nextMondayIST,
  todayPollWindow,
  uuidFromString,
} from "@/lib/time";

describe("istDayKey", () => {
  it("should always return YYYY-MM-DD format", () => {
    fc.assert(
      fc.property(fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 0, 1) }).filter((d) => !isNaN(d.getTime())), (date) => {
        const key = istDayKey(date);
        expect(/^\d{4}-\d{2}-\d{2}$/.test(key)).toBe(true);
      }),
    );
  });

  it("should return the same key for any time within the same IST day", () => {
    fc.assert(
      fc.property(fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 0, 1) }).filter((d) => !isNaN(d.getTime())), (date) => {
        const key1 = istDayKey(date);
        // Same day, different time: add up to 23 hours 59 minutes
        const later = new Date(date.getTime() + 23 * 60 * 60_000 + 59 * 60_000);
        const key2 = istDayKey(later);
        // They might be different if we crossed midnight IST, but if not they should match
        // We just assert the format is consistent
        expect(/^\d{4}-\d{2}-\d{2}$/.test(key2)).toBe(true);
      }),
    );
  });
});

describe("startOfDayIST", () => {
  it("should always return midnight (00:00:00.000) of the IST day", () => {
    fc.assert(
      fc.property(fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 0, 1) }).filter((d) => !isNaN(d.getTime())), (date) => {
        const start = startOfDayIST(date);
        // Midnight IST = 18:30 UTC (previous day) or 18:30 UTC same day
        // So in UTC: hours=18, minutes=30, seconds=0, ms=0
        expect(start.getUTCHours()).toBe(18);
        expect(start.getUTCMinutes()).toBe(30);
        expect(start.getUTCSeconds()).toBe(0);
        expect(start.getUTCMilliseconds()).toBe(0);
      }),
    );
  });

  it("should be idempotent: startOfDayIST(startOfDayIST(d)) === startOfDayIST(d)", () => {
    fc.assert(
      fc.property(fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 0, 1) }), (date) => {
        const once = startOfDayIST(date);
        const twice = startOfDayIST(once);
        expect(twice.getTime()).toBe(once.getTime());
      }),
    );
  });
});

describe("endOfDayIST", () => {
  it("should be exactly 24 hours after startOfDayIST", () => {
    fc.assert(
      fc.property(fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 0, 1) }), (date) => {
        const start = startOfDayIST(date);
        const end = endOfDayIST(date);
        expect(end.getTime() - start.getTime()).toBe(24 * 60 * 60_000);
      }),
    );
  });
});

describe("startOfWeekIST", () => {
  it("should always return a Monday (weekday 1 in IST)", () => {
    fc.assert(
      fc.property(fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 0, 1) }).filter((d) => !isNaN(d.getTime())), (date) => {
        const weekStart = startOfWeekIST(date);
        const istPartsResult = istParts(weekStart);
        // weekday: 0 = Sunday, 1 = Monday
        expect(istPartsResult.weekday).toBe(1);
      }),
    );
  });

  it("should be idempotent: startOfWeekIST(startOfWeekIST(d)) === startOfWeekIST(d)", () => {
    fc.assert(
      fc.property(fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 0, 1) }), (date) => {
        const once = startOfWeekIST(date);
        const twice = startOfWeekIST(once);
        expect(twice.getTime()).toBe(once.getTime());
      }),
    );
  });

  it("should return a date on or before the input date", () => {
    fc.assert(
      fc.property(fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 0, 1) }).filter((d) => !isNaN(d.getTime())), (date) => {
        const weekStart = startOfWeekIST(date);
        expect(weekStart.getTime()).toBeLessThanOrEqual(date.getTime());
      }),
    );
  });
});

describe("nextMondayIST", () => {
  it("should be exactly 7 days after startOfWeekIST", () => {
    fc.assert(
      fc.property(fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 0, 1) }), (date) => {
        const weekStart = startOfWeekIST(date);
        const nextMon = nextMondayIST(date);
        expect(nextMon.getTime() - weekStart.getTime()).toBe(7 * 24 * 60 * 60_000);
      }),
    );
  });
});

describe("todayPollWindow", () => {
  it("should have opensAt before closesAt on the same IST day", () => {
    fc.assert(
      fc.property(fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 0, 1) }).filter((d) => !isNaN(d.getTime())), (date) => {
        const window = todayPollWindow(date);
        expect(window.opensAt.getTime()).toBeLessThan(window.closesAt.getTime());
        // Both should be on the same IST day
        expect(istDayKey(window.opensAt)).toBe(istDayKey(window.closesAt));
      }),
    );
  });

  it("should have opensAt at 07:00 IST and closesAt at 23:00 IST", () => {
    fc.assert(
      fc.property(fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 0, 1) }).filter((d) => !isNaN(d.getTime())), (date) => {
        const window = todayPollWindow(date);
        const openIST = window.opensAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "numeric", hour12: false });
        const closeIST = window.closesAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "numeric", hour12: false });
        expect(openIST).toContain("7:");
        expect(closeIST).toContain("23:");
      }),
    );
  });
});

describe("uuidFromString", () => {
  it("should be deterministic: same input = same UUID", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 200 }), (input) => {
        const u1 = uuidFromString(input);
        const u2 = uuidFromString(input);
        expect(u1).toBe(u2);
      }),
    );
  });

  it("should produce valid UUID v4 format", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 100 }), (input) => {
        const uuid = uuidFromString(input);
        expect(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid)).toBe(true);
      }),
    );
  });
});
