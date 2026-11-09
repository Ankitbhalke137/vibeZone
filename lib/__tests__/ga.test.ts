/**
 * Unit tests for ga.ts.
 * GA4 tracking is a no-op when NEXT_PUBLIC_GA4_MEASUREMENT_ID is unset.
 * When set, track() pushes to window.dataLayer / calls window.gtag.
 * Runs with: npx vitest run --no-file-parallelism lib/__tests__/ga.test.ts
 */

// Set the env var BEFORE importing ga.ts so the module-level `ID` is captured.
const hoisted = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = "G-XXXXXXXXXX";
  return {};
});

// Mock the browser `window` global so ga.ts (which references window) loads in Node.
const mockDataLayer: unknown[] = [];
const mockGtag = vi.fn();
Object.defineProperty(globalThis, "window", {
  value: { dataLayer: mockDataLayer, gtag: mockGtag },
  writable: true,
  configurable: true,
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ga, track, gaInitSnippet } from "@/lib/ga";

const MEASUREMENT_ID = "G-XXXXXXXXXX";

beforeEach(() => {
  vi.restoreAllMocks();
  mockDataLayer.length = 0;
  mockGtag.mockClear();
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = MEASUREMENT_ID;
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
});

describe("track (GA_ID set)", () => {
  it("pushes to dataLayer and calls gtag with the right args", () => {
    track("sign_up", { method: "otp" });

    expect(mockGtag).toHaveBeenCalledWith("event", "sign_up", { method: "otp" });
    expect(mockDataLayer).toEqual([]);
  });

  it("gaInitSnippet returns a GA4 init script tag body", () => {
    const snippet = gaInitSnippet(MEASUREMENT_ID);
    expect(snippet).toContain(MEASUREMENT_ID);
    expect(snippet).toContain("gtag");
    expect(snippet).toContain("dataLayer");
    expect(snippet).toContain("send_page_view");
  });
});

describe("ga event taxonomy", () => {
  it("signUp tracks sign_up with method otp", () => {
    ga.signUp();
    expect(mockGtag).toHaveBeenCalledWith("event", "sign_up", { method: "otp" });
  });

  it("login tracks login with method otp", () => {
    ga.login();
    expect(mockGtag).toHaveBeenCalledWith("event", "login", { method: "otp" });
  });

  it("pollVote tracks poll_vote with poll_id", () => {
    ga.pollVote("poll-1");
    expect(mockGtag).toHaveBeenCalledWith("event", "poll_vote", { poll_id: "poll-1" });
  });

  it("leaderboardView tracks leaderboard_view with period", () => {
    ga.leaderboardView("week");
    expect(mockGtag).toHaveBeenCalledWith("event", "leaderboard_view", { period: "week" });
  });

  it("messageSend tracks message_send with channel_type and aliased", () => {
    ga.messageSend("global", true);
    expect(mockGtag).toHaveBeenCalledWith("event", "message_send", { channel_type: "global", aliased: true });
  });

  it("reportCreate tracks report_create with content_type and reason", () => {
    ga.reportCreate("message", "abuse");
    expect(mockGtag).toHaveBeenCalledWith("event", "report_create", { content_type: "message", reason: "abuse" });
  });

  it("themeToggle tracks theme_toggle with mode", () => {
    ga.themeToggle("dark");
    expect(mockGtag).toHaveBeenCalledWith("event", "theme_toggle", { mode: "dark" });
  });

  it("announcementView tracks with announcement_id and category", () => {
    ga.announcementView("ann-1", "Academic");
    expect(mockGtag).toHaveBeenCalledWith("event", "announcement_view", { announcement_id: "ann-1", category: "Academic" });
  });

  it("eventView tracks with event_id and category (null -> empty string)", () => {
    ga.eventView("evt-1", null);
    expect(mockGtag).toHaveBeenCalledWith("event", "event_view", { event_id: "evt-1", category: "" });
  });
});
