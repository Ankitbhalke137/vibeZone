"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Loader2,
  Sparkles,
  Trophy,
  Users,
  Vote,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
  votedIndex: number | null;
  tallies: { index: number; count: number; percent: number }[];
};

type Me = { id: string; handle: string; name: string } | null;

export default function PollsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activePoll, setActivePoll] = useState<ActivePoll | null>(null);
  const [polls, setPolls] = useState<PollItem[]>([]);
  const [me, setMe] = useState<Me>(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState<number | null>(null);
  const [tallies, setTallies] = useState<{ index: number; count: number; percent: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/polls/today", { cache: "no-store" })
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.poll) return;
        setActivePoll(d.poll);
        setVoted(d.poll.votedIndex ?? null);
        setTallies(d.poll.tallies ?? []);
        setTotal(d.poll.voteCount ?? 0);
      })
      .catch(() => {});
    fetch("/api/polls", { cache: "no-store" })
      .then(async (r) => (r.ok ? r.json() : { polls: [] }))
      .then((d) => setPolls(d.polls ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMe(d?.user ?? null))
      .catch(() => {});
  }, []);

  async function vote(optionIndex: number) {
    if (!activePoll) return;
    if (!me) return router.push("/login?next=/polls");
    if (voted !== null) return;
    setBusy(optionIndex);
    setError(null);
    try {
      const res = await fetch(`/api/polls/${activePoll.id}/vote`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ optionIndex }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Vote failed.");
      setVoted(optionIndex);
      setTallies(data.tallies);
      setTotal(data.total);
      toast({ title: "Vote counted", description: "+5 campus points", tone: "success" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vote failed.");
    } finally {
      setBusy(null);
    }
  }

  const isOpen = activePoll
    ? activePoll.status === "open" && (!activePoll.closesAt || new Date(activePoll.closesAt) > new Date())
    : false;
  const closesLabel = activePoll?.closesAt
    ? new Date(activePoll.closesAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <PageHeader
        eyebrow="Play & engage"
        title="Campus polls"
        description="One vote per poll. Every vote earns campus points and feeds the weekly leaderboard."
        actions={
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted transition hover:text-primary"
          >
            <Trophy size={12} className="text-primary" /> Leaderboard
          </Link>
        }
      />

      {error ? (
        <p className="rounded-xl border border-danger/20 bg-danger/10 px-3 py-2 text-[11px] font-medium text-danger">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="vz-panel overflow-hidden">
          <div className="vz-soft-gradient border-b border-border px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-primary">
                <BarChart3 size={13} /> Today&apos;s poll
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold",
                  isOpen ? "bg-success/10 text-success" : "bg-accent text-muted",
                )}
              >
                <Clock size={9} /> {isOpen ? (closesLabel ? `Closes ${closesLabel}` : "Open") : "Closed"}
              </span>
            </div>

            {loading ? (
              <Skeleton className="mt-3 h-5 w-3/4" />
            ) : (
              <h2 className="mt-2 max-w-lg text-lg font-black leading-snug tracking-tight">
                {activePoll?.question ?? "No poll is live right now"}
              </h2>
            )}
          </div>

          <div className="p-5">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-xl" />)}
              </div>
            ) : !activePoll ? (
              <div className="py-6 text-center">
                <p className="text-[12px] text-muted">The next campus poll opens at 7:00 AM IST.</p>
                <p className="mt-1 text-[10px] text-muted-2">Meanwhile, catch up on past polls below.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  {activePoll.options.map((option) => {
                    const tally = tallies.find((t) => t.index === option.index);
                    const chosen = voted === option.index;
                    const show = voted !== null;
                    return (
                      <button
                        key={option.index}
                        type="button"
                        onClick={() => void vote(option.index)}
                        disabled={voted !== null || busy !== null || !isOpen}
                        aria-pressed={chosen}
                        className={cn(
                          "relative overflow-hidden rounded-xl border px-3.5 py-3 text-left text-[12px] transition",
                          chosen
                            ? "border-primary/60 bg-primary/5"
                            : "border-border hover:border-primary/40 hover:bg-accent/60",
                          (voted !== null || !isOpen) && "cursor-default",
                        )}
                      >
                        {show && tally ? (
                          <span
                            aria-hidden
                            className="absolute inset-y-0 left-0 bg-primary/10"
                            style={{ width: `${tally.percent}%` }}
                          />
                        ) : null}
                        <span className="relative flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 font-semibold">
                            {chosen ? <CheckCircle2 size={14} className="text-primary" /> : null}
                            {option.text}
                          </span>
                          {busy === option.index ? (
                            <Loader2 size={13} className="animate-spin text-primary" />
                          ) : show && tally ? (
                            <span className="shrink-0 tabular-nums text-[11px] text-muted">
                              {tally.count} · {tally.percent}%
                            </span>
                          ) : isOpen ? (
                            <span className="shrink-0 text-[10px] font-semibold text-primary">Vote</span>
                          ) : (
                            <span className="shrink-0 text-[10px] text-muted">Closed</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-[10px] text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Users size={11} /> {total} votes
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Sparkles size={11} className="text-primary" /> 5 pts per vote
                  </span>
                  {voted !== null ? (
                    <span className="ml-auto inline-flex items-center gap-1 font-semibold text-success">
                      <CheckCircle2 size={11} /> You voted
                    </span>
                  ) : !me ? (
                    <Link href="/login?next=/polls" className="ml-auto font-semibold text-primary hover:underline">
                      Sign in to vote →
                    </Link>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-3">
          <section className="vz-panel vz-soft-gradient p-4">
            <div className="flex items-center gap-2 text-[12px] font-bold">
              <Vote size={14} className="text-primary" /> How it works
            </div>
            <ul className="mt-2 flex flex-col gap-2 text-[11px] leading-relaxed text-muted">
              <li>One vote per poll per student.</li>
              <li>Voting earns 5 campus points.</li>
              <li>Weekly points reset Monday, 00:00 IST.</li>
              <li>Polls run 7:00 AM – 11:00 PM IST.</li>
            </ul>
          </section>

          <section className="vz-panel p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[12px] font-bold">
                <Trophy size={14} className="text-primary" /> Weekly board
              </div>
              <Link href="/leaderboard" className="text-[10px] font-semibold text-primary hover:underline">
                All
              </Link>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Vote, post and RSVP to climb the leaderboard. Your live rank updates on the home page.
            </p>
            <Link
              href="/leaderboard"
              className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
            >
              See standings <ArrowRight size={10} />
            </Link>
          </section>
        </aside>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[12px] font-bold">Past polls</h2>
          <span className="text-[10px] text-muted">{polls.length} recent</span>
        </div>
        {loading ? (
          <div className="vz-panel space-y-2 p-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        ) : polls.length === 0 ? (
          <EmptyState icon={<BarChart3 size={20} />} title="No past polls" description="Once a poll closes it will be listed here." />
        ) : (
          <ul className="vz-panel divide-y divide-border overflow-hidden">
            {polls.map((poll) => (
              <li key={poll.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <BarChart3 size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11.5px] font-semibold">{poll.question}</p>
                  <p className="text-[9.5px] text-muted">
                    {poll.status} · {poll.voteCount} votes ·{" "}
                    {new Date(poll.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase",
                    poll.status === "open" ? "bg-success/10 text-success" : "bg-accent text-muted",
                  )}
                >
                  {poll.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
