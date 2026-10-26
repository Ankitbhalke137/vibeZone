"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Clock, Users, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, FormError, Input, Label } from "@/components/ui/form";
import { Avatar } from "@/components/avatar";

type PollItem = {
  id: string;
  question: string;
  options: string[];
  status: string;
  opensAt: string | null;
  closesAt: string | null;
  voteCount: number;
  createdAt: string;
};

type ActivePoll = {
  id: string;
  question: string;
  options: { text: string; index: number }[];
  status: string;
  closesAt: string | null;
  voteCount: number;
};

type Me = { id: string; handle: string; name: string } | null;

export default function PollsPage() {
  const router = useRouter();
  const [activePoll, setActivePoll] = useState<ActivePoll | null>(null);
  const [polls, setPolls] = useState<PollItem[]>([]);
  const [me, setMe] = useState<Me>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const [tally, setTally] = useState<{ index: number; count: number; percent: number }[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/polls/today", { cache: "no-store" }).then(async (r) => {
      if (!r.ok) return;
      const d = await r.json();
      setActivePoll(d.poll);
    });
    fetch("/api/polls", { cache: "no-store" }).then(async (r) => {
      if (!r.ok) return;
      const d = await r.json();
      setPolls(d.polls);
      setLoading(false);
    });
    fetch("/api/me", { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then((d) => setMe(d?.user ?? null));
  }, []);

  async function vote(optionIndex: number) {
    if (!me) return router.push("/login?next=/polls");
    if (voted) return;
    try {
      setError(null);
      const res = await fetch(`/api/polls/${activePoll!.id}/vote`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ optionIndex }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Vote failed.");
      setVoted(true);
      setTally(data.tallies);
      setTotal(data.total);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vote failed.");
    }
  }

  const now = new Date();
  const isOpen = activePoll ? !!(activePoll.closesAt && new Date(activePoll.closesAt) > now) : false;

  return (
    <div className="mx-auto max-w-3xl py-6">
      <nav className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Daily Poll</h1>
          <p className="text-sm text-muted">One vote per poll. Vote daily for points + leaderboard.</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <BarChart3 size={14} aria-hidden /> <span className="font-medium">Polls</span>
        </div>
      </nav>

      {error ? <FormError message={error} /> : null}

      {/* Active poll card */}
      <Card className="mb-6">
        {activePoll ? (
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <Clock size={12} aria-hidden />
                <span>Closes {new Date(activePoll.closesAt!).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} IST</span>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isOpen ? "bg-emerald-500/10 text-emerald-600" : "bg-muted/20 text-muted"}`}>
                {isOpen ? "Open" : "Closed"}
              </span>
            </div>
            <h2 className="text-lg font-bold mb-3">{activePoll.question}</h2>
            {voted ? (
              <div className="space-y-2">
                {tally.map((t) => (
                  <div key={t.index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-muted mb-0.5">
                        <span>{activePoll.options[t.index].text}</span>
                        <span>{t.count} ({t.percent}%)</span>
                      </div>
                      <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${t.percent}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-2 text-xs text-muted font-medium">Total votes: {total}</div>
              </div>
            ) : (
              <div className="space-y-2">
                {activePoll.options.map((o) => (
                  <button
                    key={o.index}
                    type="button"
                    onClick={() => vote(o.index)}
                    disabled={!isOpen || !me}
                    className={`w-full py-2.5 rounded-xl border text-left transition ${isOpen && me ? "border-primary/50 hover:bg-accent" : "border-border text-muted disabled:opacity-50"}`}
                  >
                    <span className="flex items-center justify-between">
                      <span>{o.text}</span>
                      <span className="text-[10px]">{isOpen ? "Vote" : "Closed"}</span>
                    </span>
                  </button>
                ))}
                {!me ? (
                  <p className="mt-2 text-[11px] text-muted">Sign in to vote.</p>
                ) : !isOpen ? (
                  <p className="mt-2 text-[11px] text-muted">This poll is closed.</p>
                ) : null}
              </div>
            )}
            <div className="mt-4 text-[10px] text-muted">
              {activePoll.voteCount} votes · 5 pts for voting
            </div>
          </div>
        ) : (
          <div className="p-5 text-center text-muted">
            No active poll right now. Check back tomorrow at 07:00 IST.
          </div>
        )}
      </Card>

      {/* Leaderboard preview */}
      <div className="mb-6">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <Trophy size={14} aria-hidden /> Leaderboard (Weekly)
        </h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {polls.length > 0 ? (
            <div className="p-3 text-sm text-muted">
              Past polls: {polls.length} · Vote on today's poll above to climb the ranks.
            </div>
          ) : (
            <div className="p-3 text-sm text-muted">No polls yet.</div>
          )}
        </div>
      </div>

      {/* Past polls list */}
      <h2 className="mb-3 text-sm font-semibold text-muted">Recent Polls</h2>
      {polls.length === 0 ? (
        <p className="text-sm text-muted">No past polls.</p>
      ) : (
        <ul className="divide-y divide-border">
          {polls.map((p) => (
            <li key={p.id} className="flex items-center justify-between p-3 hover:bg-accent/50 transition rounded-xl cursor-pointer">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{p.question}</p>
                <p className="text-xs text-muted">
                  {p.status} · {p.voteCount} votes · {new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </p>
              </div>
              <span className="text-[10px] text-muted">{p.status}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-center text-xs text-muted">
        View full leaderboard →{" "}
        <a href="/leaderboard" className="font-medium text-primary hover:underline">Leaderboard</a>
      </p>
    </div>
  );
}
