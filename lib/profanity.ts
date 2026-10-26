import "server-only";
import { env } from "@/lib/env";

/**
 * Lightweight keyword filter (FR-CHAT-007). The list is configurable through
 * CHAT_FILTER_WORDS; messages that hit it are stored with `is_flagged = true`
 * and the matched words are redacted so the channel stays readable while
 * moderators review the full context.
 */
const DEFAULT_WORDS = [
  "idiot",
  "stupid",
  "bastard",
  "asshole",
  "bitch",
  "fuck",
  "shit",
  "slut",
  "whore",
  "retard",
];

function words(): string[] {
  const configured = env.profanityList;
  return (configured.length > 0 ? configured : DEFAULT_WORDS).filter(Boolean);
}

export function filterChatBody(input: string): { body: string; flagged: boolean } {
  let flagged = false;
  let body = input;
  for (const word of words()) {
    const re = new RegExp(`\\b${escapeRegExp(word)}\\b`, "gi");
    if (re.test(body)) {
      flagged = true;
      body = body.replace(re, (m) => "*".repeat(Math.max(3, m.length)));
    }
  }
  return { body, flagged };
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
