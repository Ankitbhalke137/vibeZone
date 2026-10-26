"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Clock, Sparkles, Vote } from "lucide-react";
import type { DashPoll } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const OPTION_EMOJI = ["🍜", "🥟", "☕", "🍛", "🍕", "🥗"];

export function PollCard({ poll, isAuthed }: { poll: DashPoll; isAuthed: boolean }) {
  const router = useRouter();
  const [voted, setVoted] = useState(poll.votedIndex !== null);
  const [selected, setSelected] = useState<number | null>(poll.votedIndex);
  const [tallies, setTallies] = useState<{ index: number; count: number; percent: number }[] | null>(null);
  const [total, setTotal] = useState(poll.voteCount);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const msLeft = poll.closesAt ? new Date(poll.closesAt).getTime() - Date.now() : 0;
  const endsLabel = msLeft > 0 ? `Ends in ${Math.max(1, Math.round(msLeft / 3_600_000))}h` : "Closed";

  async function vote(index: number) {
    if (!isAuthed) {
      router.push("/login?next=/");
      return;
    }
    if (voted || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (poll.isDemo) {
        const base = poll.options.map((_, i) => (i === 0 ? 64 : i === 1 ? 41 : i === 2 ? 15 : 11));
        const sum = base.reduce((a, b) => a + b, 0);
        setTallies(base.map((count, i) => ({ index: i, count, percent: Math.round((count / sum) * 100) })));
        setTotal(sum);
        setVoted(true);
        setSelected(index);
        return;
      }

      const res = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ optionIndex: index }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Vote failed.");
      setTallies(data.tallies);
      setTotal(data.total);
      setVoted(true);
      setSelected(index);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vote failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="vz-panel flex h-full flex-col p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-[var(--vz-violet)]/15 text-[var(--vz-violet-2)]">
            <Vote size={14} />
          </span>
          <h2 className="text-[13px] font-semibold">Daily Poll</h2>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--vz-card-3)] px-2 py-0.5 text-[9px] font-medium text-[var(--vz-muted)]">
          <Clock size={9} /> {endsLabel}
        </span>
      </div>

      <h3 className="mt-3 text-[15px] font-semibold leading-snug">{poll.question}</h3>

      <div className="mt-3 flex flex-1 flex-col gap-1.5">
        {poll.options.map((option, index) => {
          const isSelected = selected === index;
          const tally = tallies?.find((t) => t.index === index);
          return (
            <button
              key={option}
              type="button"
              onClick={() => vote(index)}
              disabled={voted || busy}
              className={cn(
                "group relative flex items-center gap-2.5 overflow-hidden rounded-xl border px-3 py-2 text-left text-[12px] transition",
                voted
                  ? "border-[var(--vz-border)] bg-[var(--vz-card-2)]"
                  : "border-[var(--vz-border)] bg-[var(--vz-card-2)] hover:border-[var(--vz-violet)]/50 hover:bg-[var(--vz-card-3)]",
                isSelected && voted && "border-[var(--vz-violet)]/60",
              )}
            >
              {voted && tally ? (
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-[var(--vz-violet)]/15"
                  style={{ width: `${tally.percent}%` }}
                />
              ) : null}
              <span className="relative text-sm">{OPTION_EMOJI[index] ?? "•"}</span>
              <span className="relative flex-1 truncate font-medium">{option}</span>
              {voted && tally ? (
                <span className="relative text-[10px] font-semibold text-[var(--vz-violet-2)]">
                  {tally.percent}%
                </span>
              ) : isSelected ? (
                <Check size={12} className="relative text-[var(--vz-violet-2)]" />
              ) : null}
            </button>
          );
        })}
      </div>

      {error ? <p className="mt-2 text-[10px] font-medium text-[var(--vz-red)]">{error}</p> : null}

      <div className="mt-3 flex items-center justify-between border-t border-[var(--vz-border)] pt-2.5 text-[10px] text-[var(--vz-muted)]">
        <span>{total} votes</span>
        <span className="inline-flex items-center gap-1 font-semibold text-[var(--vz-amber)]">
          <Sparkles size={10} /> +50 XP
        </span>
      </div>
    </section>
  );
}
