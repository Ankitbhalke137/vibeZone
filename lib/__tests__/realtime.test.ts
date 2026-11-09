/**
 * Unit tests for realtime.ts.
 * publishRealtime posts to the Socket.IO gateway /publish endpoint. When the
 * gateway URL or secret is unset it no-ops. Uses mocked fetch.
 * Runs with: npx vitest run --no-file-parallelism lib/__tests__/realtime.test.ts
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "@/lib/env";
import { publishRealtime } from "@/lib/realtime";

const CHANNEL_ID = "2f1c9a6e-3b7d-4b0e-9c1a-8d5e6f7a8b9c";

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  delete (process.env as Record<string, string | undefined>).NEXT_PUBLIC_REALTIME_URL;
  delete (process.env as Record<string, string | undefined>).REALTIME_SECRET;
  delete (process.env as Record<string, string | undefined>).NODE_ENV;
});

describe("publishRealtime no-op", () => {
  it("returns early when NEXT_PUBLIC_REALTIME_URL is unset", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await publishRealtime(CHANNEL_ID, "message:created", { foo: "bar" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns early when REALTIME_SECRET is unset", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("NEXT_PUBLIC_REALTIME_URL", "http://localhost:3002");
    await publishRealtime(CHANNEL_ID, "message:created", { foo: "bar" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("publishRealtime to gateway", () => {
  it("POSTs /publish with the correct room, event and payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("NEXT_PUBLIC_REALTIME_URL", "http://localhost:3002");
    vi.stubEnv("REALTIME_SECRET", "vz-test-secret");

    await publishRealtime(CHANNEL_ID, "message:edited", { id: "msg-1", body: "hi" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/publish", {
      body: JSON.stringify({
        room: `channel:${CHANNEL_ID}`,
        event: "message:edited",
        payload: { id: "msg-1", body: "hi" },
      }),
      cache: "no-store",
      headers: {
        "content-type": "application/json",
        "x-realtime-secret": "vz-test-secret",
      },
      method: "POST",
    });
  });

  it("swallows fetch errors and never throws", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("gateway down"));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("NEXT_PUBLIC_REALTIME_URL", "http://localhost:3002");
    vi.stubEnv("REALTIME_SECRET", "vz-test-secret");

    await expect(
      publishRealtime(CHANNEL_ID, "message:deleted", { id: "msg-1" }),
    ).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(
      "[realtime] publish failed:",
      expect.any(Error),
    );
  });

  it("supports all four event types", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("NEXT_PUBLIC_REALTIME_URL", "http://localhost:3002");
    vi.stubEnv("REALTIME_SECRET", "vz-test-secret");

    const events: Array<"message:created" | "message:edited" | "message:deleted" | "channel:updated"> = [
      "message:created",
      "message:edited",
      "message:deleted",
      "channel:updated",
    ];

    for (const event of events) {
      await publishRealtime(CHANNEL_ID, event, {});
    }

    expect(fetchMock).toHaveBeenCalledTimes(4);
    const calls = fetchMock.mock.calls.map((c) =>
      JSON.parse((c[1] as { body: string }).body),
    );
    expect(calls.map((c) => c.event)).toEqual(events);
  });
});
