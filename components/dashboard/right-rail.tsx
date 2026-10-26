"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Hash, Sparkles, Trophy, Zap } from "lucide-react";
import type { DashChannel, DashLeaderboardEntry } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { DashAvatar } from "./ui";
import { FeedbackCard } from "./feedback-card";

function rankClass(rank: number) {
  if (rank === 1) return "bg-[var(--vz-amber)] text-black";
  if (rank === 2) return "bg-slate-300 text-black";
  if (rank === 3) return "bg-amber-700 text-white";
  return "bg-[var(--vz-card-3)] text-[var(--vz-muted)]";
}

export function RightRail({
  weekly,
  allTime,
  you,
  channels,
}: {
  weekly: DashLeaderboardEntry[];
  allTime: DashLeaderboardEntry[];
  you: DashLeaderboardEntry & { branchLabel: string };
  channels: DashChannel[];
}) {
  const [tab, setTab] = useState<"week" | "all">("week");
  const list = tab === "week" ? weekly : allTime;
  const channel = channels[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Leaderboard */}
      <section className="vz-panel p-4">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-[var(--vz-amber)]/15 text-[var(--vz-amber)]">
            <Trophy size={14} />
          </span>
          <h2 className="text-[13px] font-semibold">Leaderboard</h2>
          <div className="ml-auto flex rounded-lg border border-[var(--vz-border)] bg-[var(--vz-card-2)] p-0.5">
            <button
              type="button"
              onClick={() => setTab("week")}
              className={cn(
                "rounded-md px-2 py-1 text-[9px] font-semibold transition",
                tab === "week" ? "bg-[var(--vz-violet)] text-white" : "text-[var(--vz-muted)] hover:text-white",
              )}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setTab("all")}
              className={cn(
                "rounded-md px-2 py-1 text-[9px] font-semibold transition",
                tab === "all" ? "bg-[var(--vz-violet)] text-white" : "text-[var(--vz-muted)] hover:text-white",
              )}
            >
              All-time
            </button>
          </div>
        </div>

        <ul className="mt-3 flex flex-col gap-0.5">
          {list.slice(0, 4).map((entry) => (
            <li key={`${entry.handle}-${entry.rank}`} className="flex items-center gap-2.5 rounded-lg px-1 py-1">
              <span className={cn("grid size-5 shrink-0 place-items-center rounded-full text-[9px] font-bold", rankClass(entry.rank))}>
                {entry.rank}
              </span>
              <DashAvatar name={entry.name} avatarUrl={entry.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold">{entry.name}</p>
                <p className="truncate text-[9px] text-[var(--vz-muted)]">{entry.branchLabel}</p>
              </div>
              <span className="shrink-0 text-[10px] font-bold text-[var(--vz-muted)]">
                {entry.points.toLocaleString("en-IN")}
              </span>
            </li>
          ))}
        </ul>

        {/* You */}
        <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-[var(--vz-violet)]/40 bg-[var(--vz-violet)]/10 px-2 py-1.5">
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--vz-violet)] text-[9px] font-bold text-white">
            {you.rank || "—"}
          </span>
          <DashAvatar name={you.name} avatarUrl={you.avatarUrl} size="xs" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-semibold">You · {you.name}</p>
            <p className="text-[8px] text-[var(--vz-violet-2)]">Up 3 spots</p>
          </div>
          <span className="shrink-0 text-[10px] font-bold text-[var(--vz-violet-2)]">
            {you.points.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Quick stats */}
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <Link
            href="/polls"
            className="flex items-center gap-1.5 rounded-xl bg-[var(--vz-card-2)] px-2 py-1.5 transition hover:bg-[var(--vz-card-3)]"
          >
            <span className="grid size-5 shrink-0 place-items-center rounded-md bg-[var(--vz-magenta)]/15 text-[var(--vz-magenta)]">
              <Sparkles size={10} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[9px] font-medium text-[var(--vz-muted)]">Campus Wondie</span>
              <span className="block text-[8px] font-semibold text-[var(--vz-violet-2)]">+30 XP</span>
            </span>
          </Link>
          <Link
            href="/polls"
            className="flex items-center gap-1.5 rounded-xl bg-[var(--vz-card-2)] px-2 py-1.5 transition hover:bg-[var(--vz-card-3)]"
          >
            <span className="grid size-5 shrink-0 place-items-center rounded-md bg-[var(--vz-cyan)]/15 text-[var(--vz-cyan)]">
              <Zap size={10} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[9px] font-medium text-[var(--vz-muted)]">Tech Trivia</span>
              <span className="block text-[8px] font-semibold text-[var(--vz-violet-2)]">+40 XP</span>
            </span>
          </Link>
        </div>
      </section>

      {/* Chat preview */}
      {channel ? (
        <section className="vz-panel p-4">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-[var(--vz-card-3)] text-[var(--vz-muted)]">
              <Hash size={14} />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-[12px] font-semibold">#{channel.name}</h2>
              <p className="flex items-center gap-1 text-[9px] text-[var(--vz-green)]">
                <span className="size-1 rounded-full bg-[var(--vz-green)]" /> {channel.online} online
              </p>
            </div>
            <Link
              href={`/chat/${channel.slug}`}
              className="ml-auto rounded-full bg-[var(--vz-green)]/10 px-2 py-0.5 text-[9px] font-semibold text-[var(--vz-green)]"
            >
              Open
            </Link>
          </div>

          <ul className="mt-3 flex flex-col gap-2.5">
            {channel.messages.map((m, i) => (
              <li key={`${m.name}-${i}`} className="flex items-start gap-2">
                <DashAvatar name={m.name} avatarUrl={m.avatarUrl} size="xs" />
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[9px] text-[var(--vz-muted-2)]">
                    <span className="font-semibold text-[var(--vz-text)]">{m.name}</span>
                    {m.time}
                  </p>
                  <p className="text-[10px] leading-relaxed text-[var(--vz-muted)]">{m.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href={`/chat/${channel.slug}`}
            className="mt-3 flex items-center gap-2 rounded-xl border border-[var(--vz-border)] bg-[var(--vz-card-2)] px-3 py-2 text-[10px] text-[var(--vz-muted-2)] transition hover:border-[var(--vz-violet)]/40"
          >
            <span className="flex-1">Say something…</span>
            <span className="grid size-6 place-items-center rounded-lg bg-[var(--vz-violet)] text-white">
              <ChevronRight size={12} />
            </span>
          </Link>
          <p className="mt-1.5 text-center text-[8px] text-[var(--vz-muted-2)]">
            Posting as {you.name} · Alias
          </p>
        </section>
      ) : null}

      <FeedbackCard />
    </div>
  );
}
