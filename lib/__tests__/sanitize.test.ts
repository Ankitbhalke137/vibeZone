/**
 * Property-based tests for sanitize.ts.
 * Runs with: npx vitest run
 */
import fc from "fast-check";
import { stripTags, sanitizeBody } from "@/lib/sanitize";

const SAFE_TEXT = fc
  .string({ minLength: 1, maxLength: 100 })
  .map((s) => s.replace(/\s+/g, " ").trim())
  .filter((s) => s.length > 0 && !/<|>|&|"|'/.test(s) && /[a-zA-Z0-9]/.test(s));

// The sanitizer only allows https links, so keep generated URLs https.
const SAFE_URL = fc
  .webUrl({ withFragments: false, withQueryParameters: false })
  .map((url) => url.replace(/^http:/, "https:"));

describe("stripTags", () => {
  it("should return empty string for empty input", () => {
    expect(stripTags("")).toBe("");
  });

  it("should strip all HTML tags", () => {
    fc.assert(
      fc.property(SAFE_TEXT, (text) => {
        const result = stripTags(`<p>${text}</p>`);
        expect(result).toBe(text);
      }),
    );
  });

  it("should remove block-level tags and separate with space", () => {
    fc.assert(
      fc.property(SAFE_TEXT, SAFE_TEXT, (a, b) => {
        const result = stripTags(`<p>${a}</p><p>${b}</p>`);
        expect(result).toBe(`${a} ${b}`);
      }),
    );
  });

  it("should convert line breaks to spaces", () => {
    fc.assert(
      fc.property(SAFE_TEXT, SAFE_TEXT, (a, b) => {
        const result = stripTags(`${a}<br>${b}`);
        expect(result).toBe(`${a} ${b}`);
      }),
    );
  });

  it("should trim whitespace", () => {
    fc.assert(
      fc.property(SAFE_TEXT, (text) => {
        const result = stripTags(`  ${text}  `);
        expect(result).toBe(text);
      }),
    );
  });

  it("should handle nested tags", () => {
    fc.assert(
      fc.property(SAFE_TEXT, (text) => {
        const result = stripTags(`<div><p><span>${text}</span></p></div>`);
        expect(result).toBe(text);
      }),
    );
  });
});

describe("sanitizeBody", () => {
  it("should return empty string for empty input", () => {
    expect(sanitizeBody("")).toBe("");
  });

  it("should preserve allowed tags", () => {
    fc.assert(
      fc.property(SAFE_TEXT, (text) => {
        const result = sanitizeBody(`<b>${text}</b>`);
        expect(result).toContain(text);
        expect(result).toContain("<b>");
        expect(result).toContain("</b>");
      }),
    );
  });

  it("should strip disallowed tags but keep their text", () => {
    fc.assert(
      fc.property(SAFE_TEXT, (text) => {
        const result = sanitizeBody(`<marquee>${text}</marquee>`);
        expect(result).not.toContain("<marquee>");
        expect(result).toContain(text);
      }),
    );
  });

  it("should drop script content entirely", () => {
    fc.assert(
      fc.property(SAFE_TEXT, (text) => {
        const result = sanitizeBody(`<script>${text}</script>`);
        expect(result).not.toContain("<script>");
        expect(result).not.toContain(text);
      }),
    );
  });

  it("should add rel attributes to links", () => {
    fc.assert(
      fc.property(SAFE_URL, (url) => {
        const result = sanitizeBody(`<a href="${url}">link</a>`);
        expect(result).toContain("rel=");
        expect(result).toContain("noopener");
        expect(result).toContain("noreferrer");
        expect(result).toContain("nofollow");
        expect(result).toContain('target="_blank"');
      }),
    );
  });

  it("should strip attributes not in allowlist", () => {
    fc.assert(
      fc.property(SAFE_TEXT, (text) => {
        const result = sanitizeBody(`<b onclick="alert(1)">${text}</b>`);
        expect(result).toContain(text);
        expect(result).not.toContain("onclick");
      }),
    );
  });

  it("should allow span with vz-highlight class", () => {
    fc.assert(
      fc.property(SAFE_TEXT, (text) => {
        const result = sanitizeBody(`<span class="vz-highlight">${text}</span>`);
        expect(result).toContain(text);
        expect(result).toContain("vz-highlight");
      }),
    );
  });

  it("should strip span classes other than vz-highlight", () => {
    fc.assert(
      fc.property(SAFE_TEXT, (text) => {
        const result = sanitizeBody(`<span class="other">${text}</span>`);
        expect(result).toContain(text);
        expect(result).not.toContain('class="other"');
      }),
    );
  });
});
