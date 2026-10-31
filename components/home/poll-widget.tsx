"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, Check, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Poll = {
  id: string;
  question: string;
  options: string[];
  voteCount: number;
  closesAt: string | null;
  votedIndex: number | null;
};

type Tally = { index: number; count: number; percent: number };

export function PollWidget({ poll }: { poll: Poll | null }) {
  const { toast } = useToast();
  const [votedIndex, setVotedIndex] = useState<number | null>(poll?.votedIndex ?? null);
  const [tallies, setTallies] = useState<Tally[] | null>(null);
  const [total, setTotal] = useState(poll?.voteCount ?? 0);
  const [busy, setBusy] = useState<number | null>(null);

  if (!poll) {
    return (
      <section className="vz-panel p-4">
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 size={14} />
          </span>
          Campus poll
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          No poll is live right now. The next campus poll opens at 7:00 AM IST.
        </p>
        <Link href="/polls" className="mt-2 inline-block text-[11px] font-semibold text-primary hover:underline">
          Browse past polls →
        </Link>
      </section>
    );
  }

  const closed = poll.closesAt ? new Date(poll.closesAt).getTime() < Date.now() : false;

  async function vote(index: number) {
    if (votedIndex !== null || busy !== null || closed) return;
    setBusy(index);
    try {
      const res = await fetch(`/api/polls/${poll!.id}/vote`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ optionIndex: index }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Vote failed.");
      setVotedIndex(index);
      setTallies(data.tallies as Tally[]);
      setTotal(data.total as number);
      toast({ title: "Vote counted", description: "+5 campus points", tone: "success" });
    } catch (err) {
      toast({
        title: "Couldn't vote",
        description: err instanceof Error ? err.message : undefined,
        tone: "error",
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="vz-panel p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 size={14} />
          </span>
          Campus poll
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] text-muted">
          <Clock size={10} />
          {closed
            ? "Closed"
            : poll.closesAt
              ? `${new Date(poll.closesAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })} IST`
              : "Open"}
        </span>
      </div>

      <h3 className="mt-2.5 text-[13px] font-bold leading-snug">{poll.question}</h3>

      <div className="mt-2.5 flex flex-col gap-1.5">
        {poll.options.map((option, index) => {
          const tally = tallies?.find((t) => t.index === index);
          const isVoted = votedIndex === index;
          const showBar = votedIndex !== null && tally;
          return (
            <button
              key={option}
              type="button"
              onClick={() => vote(index)}
              disabled={votedIndex !== null || busy !== null || closed}
              aria-pressed={isVoted}
              className={cn(
                "relative overflow-hidden rounded-lg border px-2.5 py-2 text-left text-[11px] transition",
                isVoted
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-accent/60",
                (votedIndex !== null || closed) && "cursor-default",
              )}
            >
              {showBar ? (
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-primary/10"
                  style={{ width: `${tally.percent}%` }}
                />
              ) : null}
              <span className="relative flex items-center justify-between gap-2 font-medium">
                <span className="flex items-center gap-1.5">
                  {isVoted ? <Check size={11} className="text-primary" /> : null}
                  {option}
                </span>
                {showBar ? (
                  <span className="tabular-nums text-muted">{tally.percent}%</span>
                ) : busy === index ? (
                  <Loader2 size={11} className="animate-spin text-primary" />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-muted">
        <span>{total} votes</span>
        <Link href="/polls" className="font-semibold text-primary hover:underline">
          All polls →
        </Link>
      </div>
    </section>
  );
}
