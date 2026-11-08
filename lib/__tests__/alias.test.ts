/**
 * Property-based tests for alias.ts (persistent per-channel aliases, FR-CHAT-005).
 * `generateAlias` is pure (no DB), so it can be fully tested offline.
 * Runs with: npx vitest run --no-file-parallelism lib/__tests__/alias.test.ts
 */
import fc from "fast-check";
import { generateAlias } from "@/lib/alias";

const ADJECTIVES = [
  "silent", "brave", "clever", "cosmic", "curious", "electric", "fuzzy", "gentle",
  "hidden", "lucky", "midnight", "neon", "quiet", "rapid", "sunny", "swift",
  "velvet", "wandering", "wild", "zesty",
];
const ANIMALS = [
  "fox", "otter", "panda", "tiger", "falcon", "koala", "lion", "owl", "raven",
  "seal", "shark", "sparrow", "turtle", "whale", "wolf", "yak", "zebra", "cobra",
  "dolphin", "gecko",
];
const ALIAS_RE = /^[A-Z][a-z]+[A-Z][a-z]+\d{2}$/;
function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

describe("generateAlias", () => {
  it("is deterministic: same user+channel always yields the same alias", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (userId, channelId) => {
          expect(generateAlias(userId, channelId)).toBe(
            generateAlias(userId, channelId),
          );
        },
      ),
    );
  });

  it("always matches AdjectiveAnimalNN format and stays under 30 chars", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (userId, channelId) => {
          const alias = generateAlias(userId, channelId);
          expect(ALIAS_RE.test(alias)).toBe(true);
          expect(alias.length).toBeLessThanOrEqual(30);
        },
      ),
    );
  });

  it("uses only known adjectives, animals, and a 10-99 number suffix", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (userId, channelId) => {
          const alias = generateAlias(userId, channelId);
          const number = Number(alias.slice(-2));
          expect(number).toBeGreaterThanOrEqual(10);
          expect(number).toBeLessThanOrEqual(99);
          const rest = alias.slice(0, -2);
          const adjective = ADJECTIVES.find((a) => rest.startsWith(capitalise(a)));
          expect(adjective).toBeDefined();
          const animalPart = rest.slice(capitalise(adjective!).length);
          expect(ANIMALS.some((a) => animalPart === capitalise(a))).toBe(true);
        },
      ),
    );
  });

  it("varies across channels for the same user", () => {
    const aliases = new Set<string>();
    for (let i = 0; i < 50; i++) {
      aliases.add(generateAlias("user-1", `channel-${i}`));
    }
    expect(aliases.size).toBeGreaterThan(1);
  });

  it("varies across users for the same channel", () => {
    const aliases = new Set<string>();
    for (let i = 0; i < 50; i++) {
      aliases.add(generateAlias(`user-${i}`, "channel-1"));
    }
    expect(aliases.size).toBeGreaterThan(1);
  });
});
