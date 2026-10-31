"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Crown, Medal, Sparkles, Trophy, User } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

type Entry = {
  rank: number;
  userId: string;
  handle: string;
  name: string;
  avatarUrl: string | null;
  points: number;
};

type Resp = {
  period: string;
  leaderboard: Entry[];
  yourRank: number | null;
  yourPoints: number;
};

export default function LeaderboardPage() {
  const [weekly, setWeekly] = useState<Entry[]>([]);
  const [allTime, setAllTime] = useState<Entry[]>([]);
  const [myWeekly, setMyWeekly] = useState<{ rank: number | null; points: number }>({ rank: null, points: 0 });
  const [myAllTime, setMyAllTime] = useState<{ rank: number | null; points: number }>({ rank: null, points: 0 });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "all">("week");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}`, { cache: "no-store" })
      .then(async (r) => (r.ok ? (r.json() as Promise<Resp>) : null))
      .then((d) => {
        if (!alive || !d) return;
        if (period === "week") {
          setWeekly(d.leaderboard);
          setMyWeekly({ rank: d.yourRank, points: d.yourPoints });
        } else {
          setAllTime(d.leaderboard);
          setMyAllTime({ rank: d.yourRank, points: d.yourPoints });
        }
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [period]);

  const list = period === "week" ? weekly : allTime;
  const mine = period === "week" ? myWeekly : myAllTime;
  const podium = list.slice(0, 3);
  const rest = list.slice(3);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <PageHeader
        eyebrow="Campus points"
        title="Leaderboard"
        description="Points reset weekly on Monday at 00:00 IST. All-time never resets."
        actions={
          <Tabs
            size="sm"
            value={period}
            onChange={(v) => setPeriod(v as "week" | "all")}
            items={[
              { value: "week", label: "Weekly" },
              { value: "all", label: "All-time" },
            ]}
          />
        }
      />

      {/* Your rank */}
      <section className="vz-panel vz-soft-gradient flex flex-wrap items-center gap-4 p-4">
        <span className="grid size-11 place-items-center rounded-2xl bg-primary text-white shadow-[0_10px_24px_-14px_rgba(112,71,245,0.9)]">
          <Trophy size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-2">Your rank</p>
          <p className="text-lg font-black leading-tight">
            {mine.rank ? `#${mine.rank} campus-wide` : "Not ranked yet"}
          </p>
          <p className="text-[10.5px] text-muted">
            {period === "week" ? "This week" : "All-time"} · {mine.points.toLocaleString("en-IN")} points
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/polls"
            className="rounded-xl border border-border bg-card px-3 py-2 text-[10px] font-semibold transition hover:bg-accent"
          >
            Vote for points
          </Link>
          <Link
            href="/create"
            className="rounded-xl bg-primary px-3 py-2 text-[10px] font-bold text-white transition hover:brightness-110"
          >
            Post something
          </Link>
        </div>
      </section>

      {loading ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
          <div className="vz-panel space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Trophy size={20} />}
          title="No ranked users yet"
          description="Earn your first points by voting in the daily poll, posting, or RSVPing to an event."
          action={{ label: "Open today's poll", href: "/polls" }}
        />
      ) : (
        <>
          {/* Podium */}
          <section className="grid grid-cols-3 items-end gap-2">
            {[podium[1], podium[0], podium[2]].map((entry, i) => {
              if (!entry) return <div key={i} />;
              const place = entry.rank;
              const isFirst = place === 1;
              return (
                <Link
                  key={entry.userId}
                  href={`/u/${entry.handle}`}
                  className={cn(
                    "vz-panel vz-card-hover relative flex flex-col items-center px-2 pb-3 text-center",
                    isFirst ? "pt-4 ring-2 ring-primary/20" : "pt-3",
                  )}
                >
                  <span
                    className={cn(
                      "absolute -top-2 grid size-6 place-items-center rounded-full text-[9px] font-black text-white shadow",
                      isFirst ? "bg-primary" : place === 2 ? "bg-fuchsia-500" : "bg-amber-500",
                    )}
                  >
                    {place}
                  </span>
                  <Avatar name={entry.name} handle={entry.handle} avatarUrl={entry.avatarUrl} size={isFirst ? "lg" : "md"} />
                  <p className="mt-1.5 w-full truncate text-[11px] font-bold">{entry.name}</p>
                  <p className="w-full truncate text-[9px] text-muted">@{entry.handle}</p>
                  <p className={cn("mt-1 text-[11px] font-black", isFirst ? "text-primary" : "text-muted")}>
                    {entry.points.toLocaleString("en-IN")}
                  </p>
                  {isFirst ? <Crown size={13} className="mt-0.5 text-amber-500" /> : null}
                </Link>
              );
            })}
          </section>

          {/* Rest */}
          <section className="vz-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <h2 className="flex items-center gap-1.5 text-[11px] font-bold">
                <Medal size={12} className="text-primary" /> Top {list.length}
              </h2>
              <span className="text-[9.5px] text-muted">{period === "week" ? "This week" : "All-time"}</span>
            </div>
            <ul className="divide-y divide-border">
              {rest.map((entry) => (
                <li key={entry.userId}>
                  <Link
                    href={`/u/${entry.handle}`}
                    className="group flex items-center gap-3 px-4 py-2.5 transition hover:bg-accent/40"
                  >
                    <span className="w-6 shrink-0 text-center text-[11px] font-bold text-muted">{entry.rank}</span>
                    <Avatar name={entry.name} handle={entry.handle} avatarUrl={entry.avatarUrl} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11.5px] font-semibold group-hover:text-primary">{entry.name}</p>
                      <p className="truncate text-[9.5px] text-muted">@{entry.handle}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-primary">
                      {entry.points.toLocaleString("en-IN")}
                      <span className="text-[9px] font-medium text-muted">pts</span>
                    </span>
                    <ArrowUpRight size={12} className="shrink-0 text-muted-2 group-hover:text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <section className="grid gap-2 sm:grid-cols-3">
        {[
          { icon: Sparkles, label: "Post or comment", value: "+2 pts", hint: "up to 5 posts/day" },
          { icon: Trophy, label: "Vote in a poll", value: "+5 pts", hint: "once per poll" },
          { icon: User, label: "RSVP to an event", value: "+10 pts", hint: "per accepted RSVP" },
        ].map((item) => (
          <div key={item.label} className="vz-panel flex items-center gap-2.5 p-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <item.icon size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-[10.5px] font-semibold">{item.label}</p>
              <p className="text-[9px] text-muted">
                <span className="font-bold text-primary">{item.value}</span> · {item.hint}
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
