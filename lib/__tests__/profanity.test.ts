/**
 * Property-based tests for the profanity filter.
 * Runs with: npx tsx lib/__tests__/profanity.test.ts
 */
import fc from "fast-check";
import { filterChatBody } from "@/lib/profanity";

const PROFANE_WORDS = ["idiot", "stupid", "bastard", "asshole", "bitch", "fuck", "shit", "slut", "whore", "retard"];

describe("filterChatBody", () => {
  it("should not flag clean text", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 200 }).filter((s) => !PROFANE_WORDS.some((w) => s.toLowerCase().includes(w))), (text) => {
        const result = filterChatBody(text);
        expect(result.flagged).toBe(false);
        expect(result.body).toBe(text);
      }),
    );
  });

  it("should flag text containing any profane word", () => {
    fc.assert(
      fc.property(fc.constantFrom(...PROFANE_WORDS), fc.string({ minLength: 0, maxLength: 50 }), fc.string({ minLength: 0, maxLength: 50 }), (word, prefix, suffix) => {
        const text = `${prefix} ${word} ${suffix}`;
        const result = filterChatBody(text);
        expect(result.flagged).toBe(true);
        expect(result.body).not.toContain(word);
      }),
    );
  });

  it("should redact profane words with asterisks (min 3 chars)", () => {
    fc.assert(
      fc.property(fc.constantFrom(...PROFANE_WORDS), (word) => {
        const result = filterChatBody(word);
        expect(result.flagged).toBe(true);
        const redacted = result.body;
        expect(redacted).not.toBe(word);
        expect(redacted.length).toBeGreaterThanOrEqual(3);
        expect(/^\*+$/.test(redacted)).toBe(true);
      }),
    );
  });

  it("should be case-insensitive", () => {
    fc.assert(
      fc.property(fc.constantFrom(...PROFANE_WORDS), (word) => {
        const upper = word.toUpperCase();
        const mixed = word.split("").map((c, i) => (i % 2 === 0 ? c.toUpperCase() : c.toLowerCase())).join("");
        expect(filterChatBody(upper).flagged).toBe(true);
        expect(filterChatBody(mixed).flagged).toBe(true);
        expect(filterChatBody(word).flagged).toBe(true);
      }),
    );
  });

  it("should handle multiple profane words in one message", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PROFANE_WORDS),
        fc.constantFrom(...PROFANE_WORDS),
        fc.string({ minLength: 1, maxLength: 30 }).filter((s) => !/\w/.test(s)),
        (w1, w2, sep) => {
          fc.pre(w1 !== w2);
          const text = `${w1}${sep}${w2}`;
          const result = filterChatBody(text);
          expect(result.flagged).toBe(true);
          expect(result.body).not.toContain(w1);
          expect(result.body).not.toContain(w2);
        },
      ),
    );
  });

  it("should not flag words that merely contain profane substrings (word boundary)", () => {
    // "classic" contains "assic" - not profane. "scissor" contains "siss" - not profane.
    // But we test that normal words aren't falsely flagged.
    const cleanWords = ["classroom", "brilliant", "assistant", "hustle", "bass", "fish"];
    fc.assert(
      fc.property(fc.constantFrom(...cleanWords), (word) => {
        const result = filterChatBody(word);
        // These shouldn't be flagged unless they exactly match a profane word
        if (!PROFANE_WORDS.includes(word.toLowerCase())) {
          expect(result.flagged).toBe(false);
        }
      }),
    );
  });
});
