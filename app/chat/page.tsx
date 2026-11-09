import Link from "next/link";
import { redirect } from "next/navigation";
import { MotionDiv } from "@/components/ui/motion";
import {
  ArrowRight,
  Hash,
  LockKeyhole,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ensureGlobalMembership } from "@/lib/chat";
import { formatIST, formatISTTime } from "@/lib/time";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { ChatDirectory, type ChatListItem } from "@/components/chat/chat-directory";

export const dynamic = "force-dynamic";
export const metadata = { title: "Chat" };

function shortStamp(date: Date) {
  const age = Date.now() - date.getTime();
  if (age < 24 * 3_600_000) return formatISTTime(date);
  return formatIST(date, { year: undefined });
}

export default async function ChatPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/chat");
  await ensureGlobalMembership(me.id);

  const channels = await db.channel.findMany({
    where: {
      archivedAt: null,
      OR: [
        { type: "global" },
        { type: { in: ["dm", "mentorship"] }, members: { some: { userId: me.id } } },
      ],
    },
    orderBy: [{ type: "asc" }, { createdAt: "asc" }],
    include: {
      members: {
        where: { userId: { not: me.id } },
        take: 1,
        include: { user: { select: { name: true, handle: true, avatarUrl: true } } },
      },
      messages: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, createdAt: true, senderId: true },
      },
      _count: { select: { members: true } },
    },
  });

  const mine = await db.channelMember.findMany({
    where: { userId: me.id },
    select: { channelId: true, lastReadAt: true },
  });
  const readMap = new Map(mine.map((m) => [m.channelId, m.lastReadAt]));

  const unread = await Promise.all(
    channels.map(async (channel) => {
      const last = readMap.get(channel.id);
      return db.message.count({
        where: {
          channelId: channel.id,
          deletedAt: null,
          senderId: { not: me.id },
          ...(last ? { createdAt: { gt: last } } : {}),
        },
      });
    }),
  );

  const items: ChatListItem[] = channels.map((channel, index) => {
    const other = channel.members[0]?.user ?? null;
    const last = channel.messages[0] ?? null;
    return {
      id: channel.id,
      slug: channel.slug,
      name: channel.name,
      type: channel.type,
      topic: channel.topic,
      unread: unread[index] ?? 0,
      memberCount: channel._count.members,
      lastMessage: last?.body ?? null,
      timeLabel: last ? shortStamp(last.createdAt) : null,
      other: other
        ? { name: other.name, handle: other.handle, avatarUrl: other.avatarUrl }
        : null,
    };
  });

  const channelCount = items.filter((item) => item.type === "global").length;
  const dmCount = items.length - channelCount;
  const totalUnread = items.reduce((sum, item) => sum + item.unread, 0);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Campus conversations"
        title="Chat"
        description="Channels for the whole campus, private DMs for the people you know, and alias mode when you want to speak up quietly."
        actions={
          totalUnread > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary">
              <MessagesSquare size={12} /> {totalUnread} unread
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted">
              <ShieldCheck size={12} className="text-success" /> You&apos;re all caught up
            </span>
          )
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="flex min-w-0 flex-col gap-3">
          <section className="grid gap-2.5 sm:grid-cols-3">
            <MotionDiv
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.4 }}
            >
              <Summary
                icon={Hash}
                label="Channels"
                value={channelCount}
                tone="bg-primary/10 text-primary"
              />
            </MotionDiv>
            <MotionDiv
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Summary
                icon={LockKeyhole}
                label="Direct"
                value={dmCount}
                tone="bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400"
              />
            </MotionDiv>
            <MotionDiv
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Summary
                icon={MessagesSquare}
                label="Unread"
                value={totalUnread}
                tone="bg-cyan-500/10 text-cyan-700 dark:text-cyan-400"
              />
            </MotionDiv>
          </section>

          <ChatDirectory items={items} />
        </div>

        <aside className="flex min-w-0 flex-col gap-3">
          <section className="vz-glass-card p-4">
            <SectionHeader
              title="Start a conversation"
              description="Find a classmate or senior"
              icon={<Users size={14} />}
            />
            <p className="mt-2 text-[10.5px] leading-relaxed text-muted">
              Open anyone&apos;s profile and tap Message. Seniors who have mentoring enabled appear in
              Seniors Connect.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Link
                href="/explore"
                className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-2.5 text-[10px] font-bold text-white transition hover:brightness-110"
              >
                Find people <ArrowRight size={10} />
              </Link>
              <Link
                href="/mentorship"
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-2.5 text-[10px] font-semibold text-muted transition hover:text-foreground"
              >
                Seniors Connect
              </Link>
            </div>
          </section>

          <section className="vz-glass-card p-4">
            <SectionHeader title="Alias mode" description="Speak without the spotlight" icon={<Sparkles size={14} />} />
            <p className="mt-2 text-[10.5px] leading-relaxed text-muted">
              Global channels let you post under a temporary alias. Your identity stays private from
              other students, but moderators can reveal it with a logged reason if a safety report is
              filed.
            </p>
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[9px] font-semibold text-success">
              <ShieldCheck size={9} /> Moderated for safety
            </p>
          </section>

          <section className="vz-glass-card p-4">
            <SectionHeader title="Keep it kind" icon={<ShieldCheck size={14} />} />
            <ul className="mt-2 flex flex-col gap-2 text-[10.5px] leading-relaxed text-muted">
              <li>No harassment, hate speech or doxxing.</li>
              <li>Report a message instead of escalating.</li>
              <li>DMs are for campus life — not spam.</li>
            </ul>
            <Link
              href="/feedback"
              className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
            >
              Share feedback privately <ArrowRight size={10} />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ size?: number | string }>;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="vz-glass-card vz-glow-inner flex items-center gap-2.5 p-3">
      <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${tone}`}>
        <Icon size={15} />
      </span>
      <div>
        <p className="text-lg font-black leading-none">{value}</p>
        <p className="mt-0.5 text-[10px] text-muted">{label}</p>
      </div>
    </div>
  );
}
