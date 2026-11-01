/**
 * Property-based tests for format.ts date/time helpers.
 * Runs with: npx vitest run
 */
import fc from "fast-check";
import { timeAgo, fullDate, clockTime } from "@/lib/format";

const REFERENCE_NOW = new Date("2026-01-15T12:00:00Z");

describe("timeAgo", () => {
  it("should return 'just now' for sub-minute times", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 59 }), (seconds) => {
        const date = new Date(REFERENCE_NOW.getTime() - seconds * 1000);
        const result = timeAgo(date, REFERENCE_NOW);
        const min = Math.floor(seconds * 1000 / 60_000);
        if (min < 1) {
          expect(result).toBe("just now");
        } else {
          expect(result).toBe(`${min}m`);
        }
      }),
    );
  });

  it("should return minutes for under an hour", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 59 }), (minutes) => {
        const date = new Date(REFERENCE_NOW.getTime() - minutes * 60_000);
        const result = timeAgo(date, REFERENCE_NOW);
        expect(result).toBe(`${minutes}m`);
      }),
    );
  });

  it("should return hours for under a day", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 23 }), (hours) => {
        const date = new Date(REFERENCE_NOW.getTime() - hours * 60 * 60_000);
        const result = timeAgo(date, REFERENCE_NOW);
        expect(result).toBe(`${hours}h`);
      }),
    );
  });

  it("should return days for under a week", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 6 }), (days) => {
        const date = new Date(REFERENCE_NOW.getTime() - days * 24 * 60 * 60_000);
        const result = timeAgo(date, REFERENCE_NOW);
        if (days === 1) {
          expect(result).toBe("Yesterday");
        } else {
          expect(result).toBe(`${days}d`);
        }
      }),
    );
  });

  it("should return a date string for over a week", () => {
    fc.assert(
      fc.property(fc.integer({ min: 7, max: 365 }), (days) => {
        const date = new Date(REFERENCE_NOW.getTime() - days * 24 * 60 * 60_000);
        const result = timeAgo(date, REFERENCE_NOW);
        expect(result).toMatch(/\d{1,2} \w{3}/);
      }),
    );
  });

  it("should handle invalid dates gracefully", () => {
    const result = timeAgo(new Date("invalid"));
    expect(result).toBe("");
  });
});

describe("fullDate", () => {
  it("should always return a non-empty string", () => {
    fc.assert(
      fc.property(fc.date({ min: new Date(2000, 0, 1), max: new Date(2030, 0, 1) }).filter((d) => !isNaN(d.getTime())), (date) => {
        const result = fullDate(date);
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      }),
    );
  });

  it("should include year, month, and day", () => {
    fc.assert(
      fc.property(fc.date({ min: new Date(2000, 0, 1), max: new Date(2030, 0, 1) }).filter((d) => !isNaN(d.getTime())), (date) => {
        const result = fullDate(date);
        expect(result).toMatch(/\d/);
        expect(result).toMatch(/\d{4}/);
      }),
    );
  });

  it("should handle invalid dates", () => {
    const result = fullDate(new Date("invalid"));
    expect(typeof result).toBe("string");
  });
});

describe("clockTime", () => {
  it("should always return a non-empty string", () => {
    fc.assert(
      fc.property(fc.date({ min: new Date(2000, 0, 1), max: new Date(2030, 0, 1) }).filter((d) => !isNaN(d.getTime())), (date) => {
        const result = clockTime(date);
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      }),
    );
  });

  it("should contain a colon separator", () => {
    fc.assert(
      fc.property(fc.date({ min: new Date(2000, 0, 1), max: new Date(2030, 0, 1) }).filter((d) => !isNaN(d.getTime())), (date) => {
        const result = clockTime(date);
        expect(result).toMatch(/:/);
      }),
    );
  });

  it("should handle invalid dates", () => {
    const result = clockTime(new Date("invalid"));
    expect(typeof result).toBe("string");
  });
});
