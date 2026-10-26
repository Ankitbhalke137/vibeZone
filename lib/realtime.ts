import "server-only";
import { env } from "@/lib/env";

/**
 * Realtime fan-out to the Socket.IO gateway on the OCI VM (FR-CHAT-002).
 * The gateway is optional in local dev — when NEXT_PUBLIC_REALTIME_URL is
 * empty, chat clients poll instead (see components/chat/chat-room.tsx).
 */
export async function publishRealtime(
  channelId: string,
  event: "message:created" | "message:edited" | "message:deleted" | "channel:updated",
  payload: Record<string, unknown>,
): Promise<void> {
  const url = env.realtimeUrl;
  if (!url || !env.realtimeSecret) return;

  try {
    await fetch(`${url}/publish`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-realtime-secret": env.realtimeSecret,
      },
      body: JSON.stringify({ room: `channel:${channelId}`, event, payload }),
      cache: "no-store",
    });
  } catch (err) {
    // Delivery failure must not fail the REST write; clients reconcile by polling.
    console.error("[realtime] publish failed:", err);
  }
}
