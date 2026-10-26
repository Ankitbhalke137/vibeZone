import "server-only";
import { db } from "@/lib/db";

/** Joins the user to every global channel (FR-CHAT-001). Idempotent. */
export async function ensureGlobalMembership(userId: string): Promise<void> {
  const channels = await db.channel.findMany({
    where: { type: "global", archivedAt: null },
    select: { id: true },
  });
  if (channels.length === 0) return;
  await db.channelMember.createMany({
    data: channels.map((c) => ({ channelId: c.id, userId })),
    skipDuplicates: true,
  });
}

export async function isMember(userId: string, channelId: string): Promise<boolean> {
  const member = await db.channelMember.findUnique({
    where: { channelId_userId: { channelId, userId } },
    select: { channelId: true },
  });
  return !!member;
}

/** Membership gate used by every message route. Global channels auto-join. */
export async function ensureChannelAccess(userId: string, channelId: string) {
  const channel = await db.channel.findUnique({
    where: { id: channelId },
    include: { members: { where: { userId }, take: 1 } },
  });
  if (!channel || channel.archivedAt) return null;
  if (channel.type === "global" && channel.members.length === 0) {
    await db.channelMember.create({
      data: { channelId: channel.id, userId },
    }).catch(() => {});
  }
  if (channel.type !== "global" && channel.members.length === 0) return null;
  return channel;
}

/** Resolves a channel id or slug to the channel row. URLs use slugs; DB ids are UUIDs. */
export async function resolveChannel(idOrSlug: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug);
  return isUuid
    ? await db.channel.findUnique({ where: { id: idOrSlug } })
    : await db.channel.findUnique({ where: { slug: idOrSlug } });
}

export function dmSlug(a: string, b: string): string {
  const sorted = [a, b].sort();
  // deterministic, 40-char slug limit
  return `dm-${sorted[0]!.replace(/-/g, "").slice(0, 12)}${sorted[1]!.replace(/-/g, "").slice(0, 12)}`;
}

export function mentorshipSlug(requestId: string): string {
  return `mt-${requestId.replace(/-/g, "").slice(0, 30)}`;
}

/** Public shape for messages (never leaks the sender when an alias is active). */
export function serializeMessage(
  m: {
    id: string;
    channelId: string;
    senderId: string;
    aliasName: string | null;
    body: string;
    isFlagged: boolean;
    editedAt: Date | null;
    deletedAt: Date | null;
    createdAt: Date;
    sender?: { id: string; name: string; handle: string; avatarUrl: string | null } | null;
  },
  opts: { revealSender?: boolean } = {},
) {
  const aliased = !!m.aliasName;
  return {
    id: m.id,
    channelId: m.channelId,
    senderId: aliased && !opts.revealSender ? null : m.senderId,
    displayName: aliased ? m.aliasName! : (m.sender?.name ?? "Student"),
    handle: aliased && !opts.revealSender ? null : (m.sender?.handle ?? null),
    avatarUrl: aliased && !opts.revealSender ? null : (m.sender?.avatarUrl ?? null),
    aliased,
    body: m.deletedAt ? "This message was deleted." : m.body,
    isFlagged: m.isFlagged,
    editedAt: m.editedAt?.toISOString() ?? null,
    deletedAt: m.deletedAt?.toISOString() ?? null,
    createdAt: m.createdAt.toISOString(),
  };
}
