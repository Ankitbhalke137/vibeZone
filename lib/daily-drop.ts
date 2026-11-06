/**
 * Content automation (PRD §4): keep the campus feed feeling alive without a
 * daily admin chore. Pulls a random joke from the public Official Joke API and
 * caches it for an hour. If the upstream is down/slow we fall back to a local
 * rotation so the widget never blocks the page or shows an error.
 */

export type DailyDrop = {
  kind: "joke" | "prompt";
  setup: string;
  punchline?: string;
  source: string;
};

const FALLBACKS: DailyDrop[] = [
  {
    kind: "joke",
    setup: "Why did the developer go broke?",
    punchline: "Because they used up all their cache.",
    source: "Campus fallback",
  },
  {
    kind: "joke",
    setup: "Why do Java developers wear glasses?",
    punchline: "Because they don't C#.",
    source: "Campus fallback",
  },
  {
    kind: "prompt",
    setup: "What's one small win you had this week?",
    punchline: "Post it in the campus feed — someone else needs the reminder.",
    source: "Daily prompt",
  },
  {
    kind: "joke",
    setup: "There are 10 types of people in the world.",
    punchline: "Those who understand binary, and those who don't.",
    source: "Campus fallback",
  },
  {
    kind: "prompt",
    setup: "Who's a senior you'd like to thank?",
    punchline: "Send them a mentorship request or a quick DM.",
    source: "Daily prompt",
  },
];

function fallbackForToday(): DailyDrop {
  const day = Math.floor(Date.now() / 86_400_000);
  return FALLBACKS[day % FALLBACKS.length];
}

export async function getDailyDrop(): Promise<DailyDrop> {
  try {
    const res = await fetch("https://official-joke-api.appspot.com/random_joke", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(2500),
      headers: { accept: "application/json" },
    });
    if (!res.ok) return fallbackForToday();
    const data = (await res.json()) as { setup?: unknown; punchline?: unknown };
    if (typeof data.setup !== "string" || typeof data.punchline !== "string") {
      return fallbackForToday();
    }
    return {
      kind: "joke",
      setup: data.setup,
      punchline: data.punchline,
      source: "Official Joke API",
    };
  } catch {
    return fallbackForToday();
  }
}
