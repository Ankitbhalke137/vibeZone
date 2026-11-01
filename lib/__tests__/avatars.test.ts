/**
 * Property-based tests for avatar utilities.
 * Runs with: npx tsx lib/__tests__/avatars.test.ts
 */
import fc from "fast-check";
import { isValidAvatarUrl, presetStyle, AVATAR_PRESETS, PRESET_KEYS } from "@/lib/avatars";

describe("isValidAvatarUrl", () => {
  it("should accept preset: URLs for known keys", () => {
    fc.assert(
      fc.property(fc.constantFrom(...PRESET_KEYS), (key) => {
        expect(isValidAvatarUrl(`preset:${key}`)).toBe(true);
      }),
    );
  });

  it("should reject preset: URLs for unknown keys", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 50 }).filter((s) => !PRESET_KEYS.includes(s)), (key) => {
        expect(isValidAvatarUrl(`preset:${key}`)).toBe(false);
      }),
    );
  });

  it("should accept https:// URLs", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 100 }).filter((s) => /^\S+$/.test(s)), (domain) => {
        const url = `https://${domain}`;
        expect(isValidAvatarUrl(url)).toBe(true);
      }),
    );
  });

  it("should reject non-https URLs", () => {
    const badSchemes = ["http://example.com", "ftp://example.com", "data:image/png;base64,abc", "javascript:alert(1)", ""];
    fc.assert(
      fc.property(fc.constantFrom(...badSchemes), (url) => {
        expect(isValidAvatarUrl(url)).toBe(false);
      }),
    );
  });

  it("should reject empty strings", () => {
    expect(isValidAvatarUrl("")).toBe(false);
  });
});

describe("presetStyle", () => {
  it("should return the correct style for known keys", () => {
    fc.assert(
      fc.property(fc.constantFrom(...PRESET_KEYS), (key) => {
        const style = presetStyle(key);
        const expected = AVATAR_PRESETS.find((p) => p.key === key)!;
        expect(style.from).toBe(expected.from);
        expect(style.to).toBe(expected.to);
      }),
    );
  });

  it("should fall back to the first preset for unknown keys", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 50 }).filter((s) => !PRESET_KEYS.includes(s)), (key) => {
        const style = presetStyle(key);
        const expected = AVATAR_PRESETS[0];
        expect(style.from).toBe(expected.from);
        expect(style.to).toBe(expected.to);
      }),
    );
  });

  it("should always return valid color strings (hex format)", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 50 }), (key) => {
        const style = presetStyle(key);
        expect(/^#[0-9a-fA-F]{6}$/.test(style.from)).toBe(true);
        expect(/^#[0-9a-fA-F]{6}$/.test(style.to)).toBe(true);
      }),
    );
  });
});

describe("PRESET_KEYS", () => {
  it("should match the keys from AVATAR_PRESETS", () => {
    expect(PRESET_KEYS.sort()).toStrictEqual(AVATAR_PRESETS.map((p) => p.key).sort());
  });

  it("should have 8 presets", () => {
    expect(PRESET_KEYS.length).toBe(8);
    expect(AVATAR_PRESETS.length).toBe(8);
  });
});
