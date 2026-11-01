/**
 * Property-based tests for OTP generation and verification.
 * Runs with: npx tsx lib/__tests__/otp.test.ts
 */
import fc from "fast-check";
import { makeOtp, hashOtp, otpMatches } from "@/lib/otp";

describe("makeOtp", () => {
  it("should always produce a 6-digit numeric string", () => {
    fc.assert(
      fc.property(fc.nat(1000), () => {
        const otp = makeOtp();
        expect(/^\d{6}$/.test(otp)).toBe(true);
      }),
    );
  });

  it("should never produce leading zeros that get dropped", () => {
    fc.assert(
      fc.property(fc.nat(1000), () => {
        const otp = makeOtp();
        expect(otp.length).toBe(6);
        expect(Number(otp)).toBeGreaterThanOrEqual(0);
        expect(Number(otp)).toBeLessThan(1_000_000);
      }),
    );
  });

  it("should produce different codes across calls (no trivial collisions)", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(makeOtp());
    }
    // With 1M possible codes, 100 draws should have some variety.
    // We don't assert uniqueness (collisions are possible) but we assert
    // that not all codes are identical.
    expect(codes.size).toBeGreaterThan(1);
  });
});

describe("hashOtp", () => {
  it("should be deterministic: same code + same secret = same hash", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 100 }), (code) => {
        const h1 = hashOtp(code);
        const h2 = hashOtp(code);
        expect(h1).toBe(h2);
        expect(typeof h1).toBe("string");
        expect(h1.length).toBeGreaterThan(0);
      }),
    );
  });

  it("should produce different hashes for different codes", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (a, b) => {
          fc.pre(a !== b);
          expect(hashOtp(a)).not.toBe(hashOtp(b));
        },
      ),
    );
  });
});

describe("otpMatches", () => {
  it("should return true when code matches its own hash", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 100 }), (code) => {
        const hash = hashOtp(code);
        expect(otpMatches(code, hash)).toBe(true);
      }),
    );
  });

  it("should return false when code does not match hash", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (a, b) => {
          fc.pre(a !== b);
          expect(otpMatches(a, hashOtp(b))).toBe(false);
        },
      ),
    );
  });

  it("should be symmetric: otpMatches(code, hashOtp(code)) is always true", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 100 }), (code) => {
        expect(otpMatches(code, hashOtp(code))).toBe(true);
      }),
    );
  });
});
