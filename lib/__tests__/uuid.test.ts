/**
 * Unit tests for uuid.ts (shared UUID guard).
 * Runs with: npx vitest run --no-file-parallelism lib/__tests__/uuid.test.ts
 */
import fc from "fast-check";
import { UUID_RE, isUuid } from "@/lib/uuid";

// fast-check v4 has no `hexaString`; build hex strings from char constants.
const hex = fc.constantFrom("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");
const hexArb = (len: number) => fc.array(hex, { minLength: len, maxLength: len }).map((c) => c.join(""));

// Any 8-4-4-4-12 hex string matches the guard (it does not enforce a version).
const uuidArb = fc
  .tuple(hexArb(8), hexArb(4), hexArb(4), hexArb(4), hexArb(12))
  .map(([a, b, c, d, e]) => `${a}-${b}-${c}-${d}-${e}`);

describe("UUID_RE / isUuid", () => {
  it("accepts valid UUIDs (any case)", () => {
    fc.assert(
      fc.property(uuidArb, (uuid) => {
        expect(UUID_RE.test(uuid)).toBe(true);
        expect(isUuid(uuid)).toBe(true);
        expect(isUuid(uuid.toUpperCase())).toBe(true);
      }),
    );
  });

  it("accepts a nil UUID", () => {
    expect(isUuid("00000000-0000-0000-0000-000000000000")).toBe(true);
    expect(isUuid("ffffffff-ffff-ffff-ffff-ffffffffffff")).toBe(true);
  });

  it("rejects non-strings", () => {
    fc.assert(
      fc.property(fc.oneof(fc.constant(null), fc.constant(undefined), fc.integer(), fc.boolean()), (value) => {
        expect(isUuid(value)).toBe(false);
      }),
    );
  });

  it("rejects malformed strings", () => {
    const bad = [
      "",
      "not-a-uuid",
      "2f1c9a6e3b7d4b0e9c1a8d5e6f7a8b9c",
      "2f1c9a6e-3b7d-4b0e-9c1a-8d5e6f7a8b9c-extra",
      "gggggggg-gggg-gggg-gggg-gggggggggggg",
      "2f1c9a6e-3b7d-4b0e-9c1a-8d5e6f7a8b9g", // 'g' is not hex
      "2f1c9a6e-3b7d-4b0e-9c1a-8d5e6f7a8b9", // 11 final chars
    ];
    fc.assert(
      fc.property(fc.constantFrom(...bad), (value) => {
        expect(isUuid(value)).toBe(false);
        expect(UUID_RE.test(value)).toBe(false);
      }),
    );
  });

  it("narrows the type: after isUuid returns true the value is a string", () => {
    fc.assert(
      fc.property(uuidArb, (uuid) => {
        if (isUuid(uuid)) {
          expect(typeof uuid).toBe("string");
          expect(uuid).toHaveLength(36);
        }
      }),
    );
  });
});
