"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Hash, Lock, MessagesSquare, Search, Users } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ChatListItem = {
  id: string;
  slug: string;
  name: string;
  type: string;
  topic: string | null;
  unread: number;
  memberCount: number;
  lastMessage: string | null;
  timeLabel: string | null;
  other: {
    name: string;
    handle: string;
    avatarUrl: string | null;
  } | null;
};

export function ChatDirectory({ items }: { items: ChatListItem[] }) {
  const [tab, setTab] = useState<"all" | "channels" | "dms">("all");
  const [query, setQuery] = useState("");

  const channels = items.filter((item) => item.type === "global");
  const dms = items.filter((item) => item.type !== "global");

  const visible = useMemo(() => {
    return items.filter((item) => {
      if (tab === "channels" && item.type !== "global") return false;
      if (tab === "dms" && item.type === "global") return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [item.name, item.topic ?? "", item.other?.name ?? "", item.other?.handle ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, query, tab]);

  return (
    <div className="vz-panel overflow-hidden">
      <div className="flex flex-col gap-2.5 border-b border-border p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-2"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search channels or people…"
            aria-label="Search chats"
            className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-[11px] outline-none transition placeholder:text-muted-2 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
          />
        </div>
        <Tabs
          value={tab}
          onChange={(value) => setTab(value as typeof tab)}
          size="sm"
          className="sm:ml-auto sm:border-0 sm:bg-transparent sm:p-0"
          items={[
            { value: "all", label: "All", count: items.length },
            { value: "channels", label: "Channels", count: channels.length },
            { value: "dms", label: "Direct", count: dms.length },
          ]}
        />
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <MessagesSquare size={21} />
          </span>
          <h3 className="mt-3 text-sm font-bold">
            {query ? "No conversations match" : "No conversations yet"}
          </h3>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">
            {query
              ? "Try a shorter search or switch filters."
              : "Join a campus channel, or open a classmate's profile to start a direct message."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {visible.map((item) => {
            const isChannel = item.type === "global";
            return (
              <li key={item.id}>
                <Link
                  href={`/chat/${item.slug}`}
                  className="group flex items-center gap-3 px-4 py-3 transition hover:bg-accent/40"
                >
                  {isChannel ? (
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Hash size={17} />
                    </span>
                  ) : item.other ? (
                    <span className="relative shrink-0">
                      <Avatar
                        name={item.other.name}
                        handle={item.other.handle}
                        avatarUrl={item.other.avatarUrl}
                        size="md"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full border border-card bg-card text-muted">
                        <Lock size={8} />
                      </span>
                    </span>
                  ) : (
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-primary">
                      <Lock size={15} />
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={cn(
                          "truncate text-[12px]",
                          item.unread > 0 ? "font-bold" : "font-semibold",
                        )}
                      >
                        {isChannel ? `#${item.name}` : item.other?.name ?? item.name}
                      </p>
                      {item.type === "mentorship" ? (
                        <Badge tone="cyan" className="normal-case tracking-normal">
                          mentor
                        </Badge>
                      ) : null}
                      {item.unread > 0 ? (
                        <span className="ml-auto grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[8px] font-bold leading-4 text-white">
                          {item.unread > 99 ? "99+" : item.unread}
                        </span>
                      ) : null}
                    </div>
                    <p
                      className={cn(
                        "mt-0.5 truncate text-[10.5px]",
                        item.unread > 0 ? "text-foreground/80" : "text-muted",
                      )}
                    >
                      {item.lastMessage ??
                        (isChannel ? item.topic ?? "No messages yet" : "Say hello 👋")}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    {item.timeLabel ? (
                      <span className="text-[9px] text-muted-2">{item.timeLabel}</span>
                    ) : null}
                    {isChannel ? (
                      <span className="inline-flex items-center gap-0.5 text-[8.5px] text-muted-2">
                        <Users size={8} /> {item.memberCount}
                      </span>
                    ) : (
                      <span className="text-[8.5px] text-muted-2">direct</span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
