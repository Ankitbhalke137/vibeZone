import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * Server-side sanitizer for announcement bodies (FR-ANN-001 "sanitized rich-text").
 * Whitelist approach: anything not listed is stripped, attributes limited,
 * links forced to https + noopener. Applied on write AND read (defense in depth).
 */
export function sanitizeBody(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [
      "b", "strong", "i", "em", "u", "s", "p", "br", "ul", "ol", "li",
      "a", "h3", "h4", "blockquote", "code", "pre", "span", "hr",
    ],
    allowedAttributes: {
      a: ["href", "title"],
      span: ["class"],
    },
    allowedSchemes: ["https", "mailto"],
    allowedClasses: { span: ["vz-highlight"] },
    disallowedTagsMode: "discard",
    transformTags: {
      a: sanitizeHtml.simpleTransform(
        "a",
        { rel: "noopener noreferrer nofollow", target: "_blank" },
        true,
      ),
    },
  });
}

/** Plain-text fallback for previews / meta descriptions. */
export function stripTags(html: string): string {
  // Block-level tags separate words — without this, `</p><p>` glues
  // sentences together ("code.Be kind").
  const spaced = html
    .replace(/<\/(p|div|li|h[1-6]|blockquote|tr|ul|ol)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ");
  return sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}
