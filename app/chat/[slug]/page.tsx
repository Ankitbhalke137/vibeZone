import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSession, signRealtimeToken } from "@/lib/session";
import { serializeMessage } from "@/lib/chat";
import { ChatRoom } from "@/components/chat/chat-room";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `#${slug}` };
}

export default async function ChannelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const me = await getCurrentUser();
  if (!me) redirect(`/login?next=/chat/${slug}`);

  const channel = await db.channel.findUnique({
    where: { slug },
    include: { members: { where: { userId: me.id }, take: 1 } },
  });
  if (!channel || channel.archivedAt) notFound();

  if (channel.type === "global" && channel.members.length === 0) {
    await db.channelMember.create({
      data: { channelId: channel.id, userId: me.id },
    }).catch(() => {});
  }
  if (channel.type !== "global" && channel.members.length === 0) notFound();

  const [rows, member, session] = await Promise.all([
    db.message.findMany({
      where: { channelId: channel.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { sender: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
    }),
    db.channelMember.findUnique({
      where: { channelId_userId: { channelId: channel.id, userId: me.id } },
    }),
    getSession(),
  ]);

  await db.channelMember.updateMany({
    where: { channelId: channel.id, userId: me.id },
    data: { lastReadAt: new Date() },
  });

  const realtimeToken = session ? await signRealtimeToken(session) : "";
  const messages = rows.reverse().map((m) => serializeMessage(m));
  const nextCursor = rows.length === 50 ? rows[0]!.createdAt.toISOString() : null;

  return (
    <div className="py-4">
      <Link
        href="/chat"
        className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground"
      >
        <ArrowLeft size={13} aria-hidden /> All chats
      </Link>
      <ChatRoom
        channel={{
          id: channel.id,
          slug: channel.slug,
          name: channel.name,
          type: channel.type,
          topic: channel.topic,
        }}
        me={{ id: me.id, name: me.name, handle: me.handle, avatarUrl: me.avatarUrl }}
        initialMessages={messages}
        nextCursor={nextCursor}
        initialAliasActive={member?.aliasActive ?? false}
        initialAliasName={member?.aliasName ?? null}
        realtimeUrl={process.env.NEXT_PUBLIC_REALTIME_URL?.trim() || null}
        realtimeToken={realtimeToken}
      />
    </div>
  );
}
