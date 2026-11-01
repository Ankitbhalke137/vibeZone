/**
 * Property-based tests for auth role hierarchy.
 * Runs with: npx tsx lib/__tests__/auth.test.ts
 */
import fc from "fast-check";
import { ROLE_RANK, hasRole } from "@/lib/auth";

const ROLES = Object.keys(ROLE_RANK) as Array<keyof typeof ROLE_RANK>;

describe("ROLE_RANK hierarchy", () => {
  it("should have a strict total order with no ties", () => {
    fc.assert(
      fc.property(fc.tuple(fc.constantFrom(...ROLES), fc.constantFrom(...ROLES)), ([a, b]) => {
        if (a === b) {
          expect(ROLE_RANK[a]).toBe(ROLE_RANK[b]);
        } else {
          expect(ROLE_RANK[a] !== ROLE_RANK[b]).toBe(true);
        }
      }),
    );
  });

  it("should be transitive: if a >= b and b >= c then a >= c", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ROLES),
        fc.constantFrom(...ROLES),
        fc.constantFrom(...ROLES),
        (a, b, c) => {
          const ra = ROLE_RANK[a];
          const rb = ROLE_RANK[b];
          const rc = ROLE_RANK[c];
          if (ra >= rb && rb >= rc) {
            expect(ra >= rc).toBe(true);
          }
        },
      ),
    );
  });

  it("should place student at the bottom and admin at the top", () => {
    expect(ROLE_RANK.student).toBe(Math.min(...Object.values(ROLE_RANK)));
    expect(ROLE_RANK.admin).toBe(Math.max(...Object.values(ROLE_RANK)));
  });

  it("should have club_leader between senior and moderator", () => {
    expect(ROLE_RANK.senior).toBeLessThan(ROLE_RANK.club_leader);
    expect(ROLE_RANK.club_leader).toBeLessThan(ROLE_RANK.moderator);
  });

  it("should have faculty between moderator and admin", () => {
    expect(ROLE_RANK.moderator).toBeLessThan(ROLE_RANK.faculty);
    expect(ROLE_RANK.faculty).toBeLessThan(ROLE_RANK.admin);
  });
});

describe("hasRole", () => {
  const makeUser = (role: keyof typeof ROLE_RANK) => ({
    id: "user-1",
    role,
  } as any);

  it("should return true when user role meets or exceeds required role", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ROLES),
        fc.constantFrom(...ROLES),
        (userRole, requiredRole) => {
          const user = makeUser(userRole);
          const expected = ROLE_RANK[userRole] >= ROLE_RANK[requiredRole];
          expect(hasRole(user, requiredRole)).toBe(expected);
        },
      ),
    );
  });

  it("should return false for null user regardless of required role", () => {
    fc.assert(
      fc.property(fc.constantFrom(...ROLES), (requiredRole) => {
        expect(hasRole(null, requiredRole)).toBe(false);
      }),
    );
  });

  it("should return true for any role when required is student (lowest)", () => {
    fc.assert(
      fc.property(fc.constantFrom(...ROLES), (userRole) => {
        const user = makeUser(userRole);
        expect(hasRole(user, "student")).toBe(true);
      }),
    );
  });

  it("should return false for student when required is admin (highest)", () => {
    const user = makeUser("student");
    expect(hasRole(user, "admin")).toBe(false);
  });
});
