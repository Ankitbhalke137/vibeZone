"use client";

import { useEffect, useState } from "react";
import { Trophy, Crown, User, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/form";
import { Avatar } from "@/components/avatar";

type LeaderboardEntry = {
  rank: number;
  userId: string;
  handle: string;
  name: string;
  avatarUrl: string | null;
  points: number;
};

type LeaderboardResp = {
  period: string;
  leaderboard: LeaderboardEntry[];
  yourRank: number | null;
  yourPoints: number;
};

export default function LeaderboardPage() {
  const [weekly, setWeekly] = useState<LeaderboardEntry[]>([]);
  const [allTime, setAllTime] = useState<LeaderboardEntry[]>([]);
  const [myWeekly, setMyWeekly] = useState<{ rank: number | null; points: number }>({ rank: null, points: 0 });
  const [myAllTime, setMyAllTime] = useState<{ rank: number | null; points: number }>({ rank: null, points: 0 });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "all">("week");

  useEffect(() => {
    const load = async (p: "week" | "all") => {
      const res = await fetch(`/api/leaderboard?period=${p}`, { cache: "no-store" });
      if (!res.ok) return;
      const d: LeaderboardResp = await res.json();
      if (p === "week") {
        setWeekly(d.leaderboard);
        setMyWeekly({ rank: d.yourRank, points: d.yourPoints });
      } else {
        setAllTime(d.leaderboard);
        setMyAllTime({ rank: d.yourRank, points: d.yourPoints });
      }
    };
    load(period).then(() => setLoading(false));
  }, [period]);

  const list = period === "week" ? weekly : allTime;
  const mine = period === "week" ? myWeekly : myAllTime;

  return (
    <div className="mx-auto max-w-3xl py-6">
      <nav className="mb-6">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-sm text-muted">Points reset weekly (Monday 00:00 IST). All-time never resets.</p>
        <div className="flex gap-1 mt-2">
          <button
            onClick={() => setPeriod("week")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${period === "week" ? "bg-primary text-primary-foreground" : "bg-accent text-primary"}`}
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${period === "all" ? "bg-primary text-primary-foreground" : "bg-accent text-primary"}`}
          >
            All-time
          </button>
        </div>
      </nav>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-muted">Loading leaderboard…</div>
      ) : (
        <div className="space-y-6">
          {/* Your rank card */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-bold">Your Rank</h2>
                <p className="text-xs text-muted">{period === "week" ? "Weekly points" : "All-time points"}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{mine.points}</div>
                <div className="text-xs text-muted">{mine.rank ? `#${mine.rank}` : "Not ranked yet"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <User size={16} aria-hidden />
              <span>Vote daily, post messages, RSVP to events, upload notes — climb the board.</span>
            </div>
          </Card>

          {/* Top 10 list */}
          <Card>
            <div className="border-b border-border p-3">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <Crown size={14} aria-hidden /> Top 10
              </h2>
            </div>
            <div className="divide-y divide-border">
              {list.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted">No ranked users yet.</div>
              ) : (
                list.map((entry) => (
                  <div key={entry.userId} className="flex items-center gap-3 px-3 py-3">
                    <div className={[
                      "flex-shrink-0 rounded-full p-1.5 text-sm font-bold",
                      entry.rank === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted",
                    ].join(" ")}>{entry.rank}</div>
                    <div className="flex items-center gap-2">
                      <Avatar name={entry.name} handle={entry.handle} avatarUrl={entry.avatarUrl} size="sm" />
                      <div>
                        <p className="font-semibold text-sm">{entry.name}</p>
                        <p className="text-[10px] text-muted">@{entry.handle}</p>
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-right">
                      <div className="font-bold">{entry.points} pts</div>
                      <ArrowRight size={12} className="text-muted" aria-hidden />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
