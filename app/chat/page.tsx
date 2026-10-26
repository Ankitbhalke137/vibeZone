import Link from "next/link";
import { redirect } from "next/navigation";
import { Hash, MessagesSquare, Lock, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ensureGlobalMembership } from "@/lib/chat";
import { Avatar } from "@/components/avatar";
import { formatISTTime } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata = { title: "Chat" };

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
    },
  });

  const mine = await db.channelMember.findMany({
    where: { userId: me.id },
    select: { channelId: true, lastReadAt: true },
  });
  const readMap = new Map(mine.map((m) => [m.channelId, m.lastReadAt]));

  const unread = await Promise.all(
    channels.map(async (c) => {
      const last = readMap.get(c.id);
      return db.message.count({
        where: {
          channelId: c.id,
          deletedAt: null,
          senderId: { not: me.id },
          ...(last ? { createdAt: { gt: last } } : {}),
        },
      });
    }),
  );

  const rows = channels.map((c, i) => ({
    ...c,
    unread: unread[i] ?? 0,
    other: c.members[0]?.user ?? null,
  }));
  const globals = rows.filter((c) => c.type === "global");
  const dms = rows.filter((c) => c.type !== "global");

  return (
    <div className="flex flex-col gap-5 py-6">
      <header>
        <h1 className="text-2xl font-bold">Chat</h1>
        <p className="mt-1 text-sm text-muted">
          Campus channels and direct messages · alias mode available in channels
        </p>
      </header>

      <section>
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Hash size={14} aria-hidden /> Channels
        </h2>
        <ul className="overflow-hidden rounded-2xl border border-border bg-card">
          {globals.map((c) => (
            <li key={c.id} className="border-b border-border last:border-b-0">
              <Link
                href={`/chat/${c.slug}`}
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-accent/60"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                  <Hash size={16} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    #{c.name}
                    {c.unread > 0 ? (
                      <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                        {c.unread}
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {c.messages[0]
                      ? c.messages[0].body.slice(0, 80)
                      : (c.topic ?? "No messages yet")}
                  </p>
                </div>
                {c.messages[0] ? (
                  <span className="shrink-0 text-[10px] text-muted">
                    {formatISTTime(c.messages[0].createdAt)}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <MessagesSquare size={14} aria-hidden /> Direct & mentorship
        </h2>
        {dms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted">
            No DMs yet. Open a classmate&apos;s profile or accept a mentorship request to start one.
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-border bg-card">
            {dms.map((c) => (
              <li key={c.id} className="border-b border-border last:border-b-0">
                <Link
                  href={`/chat/${c.slug}`}
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-accent/60"
                >
                  {c.other ? (
                    <Avatar name={c.other.name} handle={c.other.handle} avatarUrl={c.other.avatarUrl} size="sm" />
                  ) : (
                    <span className="grid size-8 place-items-center rounded-full bg-accent text-primary">
                      <Lock size={14} aria-hidden />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      {c.other?.name ?? c.name}
                      {c.type === "mentorship" ? (
                        <span className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary">
                          mentor
                        </span>
                      ) : null}
                      {c.unread > 0 ? (
                        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                          {c.unread}
                        </span>
                      ) : null}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {c.messages[0]?.body ?? "Say hello 👋"}
                    </p>
                  </div>
                  {c.messages[0] ? (
                    <span className="shrink-0 text-[10px] text-muted">
                      {formatISTTime(c.messages[0].createdAt)}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="flex items-center justify-center gap-1 text-center text-xs text-muted">
        <Plus size={11} aria-hidden /> Find people through Seniors Connect or their profile.
      </p>
    </div>
  );
}
