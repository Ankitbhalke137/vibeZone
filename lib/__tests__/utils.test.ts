/**
 * Property-based tests for utility functions.
 * Runs with: npx tsx lib/__tests__/utils.test.ts
 */
import fc from "fast-check";
import { nameFromEmail, autoHandle, cn } from "@/lib/utils";

describe("nameFromEmail", () => {
  it("should always return a non-empty string", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.includes("@")), (email) => {
        const name = nameFromEmail(email);
        expect(typeof name).toBe("string");
        expect(name.length).toBeGreaterThan(0);
        expect(name.length).toBeLessThanOrEqual(100);
      }),
    );
  });

  it("should capitalize the first letter of each part", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-z]+$/.test(s)),
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-z]+$/.test(s)),
        (first, last) => {
          const email = `${first}.${last}@pwioi.com`;
          const name = nameFromEmail(email);
          expect(name).toBe(`${first.charAt(0).toUpperCase()}${first.slice(1)} ${last.charAt(0).toUpperCase()}${last.slice(1)}`);
        },
      ),
    );
  });

  it("should handle dots, underscores, plus, and hyphens as separators", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-z]+$/.test(s)),
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-z]+$/.test(s)),
        fc.constantFrom(".", "_", "+", "-"),
        (first, last, sep) => {
          const email = `${first}${sep}${last}@pwioi.com`;
          const name = nameFromEmail(email);
          expect(name).toBe(`${first.charAt(0).toUpperCase()}${first.slice(1)} ${last.charAt(0).toUpperCase()}${last.slice(1)}`);
        },
      ),
    );
  });

  it("should truncate to 100 characters max", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 200 }).filter((s) => /^[a-z]+$/.test(s)), (part) => {
        const email = `${part.repeat(150)}@pwioi.com`;
        const name = nameFromEmail(email);
        expect(name.length).toBeLessThanOrEqual(100);
      }),
    );
  });

  it("should default to 'Student' when no parseable parts exist", () => {
    // An email like "@pwioi.com" has empty local part
    expect(nameFromEmail("@pwioi.com")).toBe("Student");
    expect(nameFromEmail("...@pwioi.com")).toBe("Student");
  });
});

describe("autoHandle", () => {
  it("should always start with 'u'", () => {
    fc.assert(
      fc.property(fc.nat(100), () => {
        const handle = autoHandle();
        expect(handle.startsWith("u")).toBe(true);
      }),
    );
  });

  it("should always be 8 characters total (u + 7 base36 chars)", () => {
    fc.assert(
      fc.property(fc.nat(100), () => {
        const handle = autoHandle();
        expect(handle.length).toBe(8);
      }),
    );
  });

  it("should contain only base36 characters after the 'u' prefix", () => {
    fc.assert(
      fc.property(fc.nat(100), () => {
        const handle = autoHandle();
        expect(/^u[0-9a-z]{7}$/.test(handle)).toBe(true);
      }),
    );
  });

  it("should produce different handles across calls (high entropy)", () => {
    const handles = new Set<string>();
    for (let i = 0; i < 50; i++) {
      handles.add(autoHandle());
    }
    // 36^7 is a huge space, so 50 draws should be nearly all unique
    expect(handles.size).toBeGreaterThan(45);
  });
});

describe("cn", () => {
  it("should merge conflicting Tailwind classes (last wins)", () => {
    fc.assert(
      fc.property(fc.constantFrom("px-1", "px-2", "px-4", "px-8"), fc.constantFrom("px-1", "px-2", "px-4", "px-8"), (a, b) => {
        const result = cn(a, b, a);
        // Last occurrence of a conflicting class wins, so cn(a, b, a) = cn(a)
        expect(result).toBe(a);
      }),
    );
  });

  it("should handle undefined and null inputs gracefully", () => {
    expect(cn()).toBe("");
    expect(cn(undefined)).toBe("");
    expect(cn(null)).toBe("");
    expect(cn("foo", undefined, "bar")).toBe("foo bar");
  });

  it("should be idempotent: cn(cn(a, b)) === cn(a, b)", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 20 }), fc.string({ minLength: 1, maxLength: 20 }), (a, b) => {
        expect(cn(cn(a, b))).toBe(cn(a, b));
      }),
    );
  });
});
