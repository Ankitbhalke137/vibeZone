/**
 * Tests for daily-drop.ts.
 * `getDailyDrop` is tested by mocking global `fetch`, so no network or DB is needed.
 * `fallbackForToday` is module-private; its behavior is covered through the fetch-failure path.
 * Runs with: npx vitest run --no-file-parallelism lib/__tests__/daily-drop.test.ts
 */
import fc from "fast-check";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getDailyDrop } from "@/lib/daily-drop";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function stubFetch(status: number, body: unknown) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response);
}

describe("getDailyDrop", () => {
  it("returns a joke from the Official Joke API when upstream responds OK", async () => {
    stubFetch(200, {
      setup: "Why did the dev cross the road?",
      punchline: "To get to the other branch.",
    });
    const drop = await getDailyDrop();
    expect(drop.kind).toBe("joke");
    expect(drop.setup).toBe("Why did the dev cross the road?");
    expect(drop.punchline).toBe("To get to the other branch.");
    expect(drop.source).toBe("Official Joke API");
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(String(url)).toBe("https://official-joke-api.appspot.com/random_joke");
  });

  it("falls back when the upstream returns non-OK", async () => {
    stubFetch(500, {});
    const drop = await getDailyDrop();
    expect(drop.source).not.toBe("Official Joke API");
    expect(["Campus fallback", "Daily prompt"]).toContain(drop.source);
    expect(drop.setup.length).toBeGreaterThan(0);
  });

  it("falls back when setup/punchline are missing or not strings", async () => {
    stubFetch(200, { setup: "hello" });
    expect((await getDailyDrop()).source).not.toBe("Official Joke API");

    stubFetch(200, { punchline: 123 });
    expect((await getDailyDrop()).source).not.toBe("Official Joke API");

    stubFetch(200, null);
    expect((await getDailyDrop()).source).not.toBe("Official Joke API");
  });

  it("falls back when fetch throws (network down / abort)", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError("failed to fetch"));
    const drop = await getDailyDrop();
    expect(drop.source).not.toBe("Official Joke API");
    expect(drop.setup.length).toBeGreaterThan(0);
  });

  it("fallback drops are deterministic within a day (same failed fetch → same drop)", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError("down"));
    const a = await getDailyDrop();
    const b = await getDailyDrop();
    expect(a).toEqual(b);
  });

  it("fallback drops are well shaped (repeated calls, same day)", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError("down"));
    for (let i = 0; i < 10; i++) {
      const drop = await getDailyDrop();
      expect(["joke", "prompt"]).toContain(drop.kind);
      expect(drop.setup.length).toBeGreaterThan(0);
      if (drop.kind === "joke") {
        expect(drop.punchline?.length).toBeGreaterThan(0);
      }
      expect(["Campus fallback", "Daily prompt"]).toContain(drop.source);
    }
  });
});
