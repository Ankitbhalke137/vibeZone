"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Gamepad2, Loader2, Sparkles, Trophy, XCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Question = { q: string; options: string[] };
type Attempt = { score: number; total: number; playedAt?: string };
type Result = { chosen: number; correct: number; isCorrect: boolean; explain: string | null };

export default function GamesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<{ id: string; title: string; closesAt: string | null; questions: Question[] } | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [index, setIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/v1/games/quiz", { cache: "no-store" })
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d) return;
        setQuiz(d.quiz);
        setAttempt(d.attempt);
        if (d.quiz) setAnswers(Array(d.quiz.questions.length).fill(-1));
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const current = quiz?.questions[index];
  const answeredCount = answers.filter((a) => a >= 0).length;
  const isLast = quiz ? index === quiz.questions.length - 1 : false;

  async function submit() {
    if (!quiz || submitting) return;
    if (answers.some((a) => a < 0)) {
      toast({ title: "Answer every question first", tone: "info" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/games/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: quiz.id, answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit your answers.");
      setResults(data.results as Result[]);
      setAttempt(data.attempt as Attempt);
      toast({ title: `You scored ${data.attempt.score}/${data.attempt.total}!`, tone: "success" });
    } catch (err) {
      toast({
        title: "Could not submit",
        description: err instanceof Error ? err.message : "Try again.",
        tone: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const score = useMemo(() => (results ? results.filter((r) => r.isCorrect).length : 0), [results]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <PageHeader
        eyebrow="Play"
        title="Campus Arcade"
        description="A quick weekly quiz. Correct answers earn leaderboard points — one attempt per week."
        actions={
          <Link href="/leaderboard">
            <Button variant="secondary" size="sm">
              <Trophy size={13} /> Leaderboard
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="vz-panel space-y-3 p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-3/4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : !quiz ? (
        <EmptyState
          icon={<Gamepad2 size={22} />}
          title="No quiz this week"
          description="A new campus quiz drops every Monday. Meanwhile, vote in today's poll for points."
          action={{ label: "Go to polls", href: "/polls" }}
        />
      ) : results ? (
        <section className="vz-panel flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles size={26} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-2">Your result</p>
              <h2 className="text-2xl font-black tracking-tight">
                {score}/{results.length} correct
              </h2>
              <p className="text-[11px] text-muted">Points have been added to your campus score.</p>
            </div>
            <Badge tone={score === results.length ? "green" : score >= results.length / 2 ? "amber" : "neutral"} className="normal-case tracking-normal">
              {score === results.length ? "Perfect run" : score >= results.length / 2 ? "Solid" : "Keep practising"}
            </Badge>
          </div>

          <div className="flex flex-col gap-2">
            {quiz.questions.map((q, i) => {
              const r = results[i];
              return (
                <div key={q.q} className={cn("rounded-2xl border p-3", r.isCorrect ? "border-success/25 bg-success/5" : "border-danger/20 bg-danger/5")}>
                  <div className="flex items-start gap-2">
                    {r.isCorrect ? (
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-success" />
                    ) : (
                      <XCircle size={15} className="mt-0.5 shrink-0 text-danger" />
                    )}
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold">{q.q}</p>
                      <p className="mt-0.5 text-[10.5px] text-muted">
                        Correct: <span className="font-medium text-foreground">{q.options[r.correct]}</span>
                        {!r.isCorrect ? ` · You chose ${q.options[r.chosen] ?? "—"}` : ""}
                      </p>
                      {r.explain ? <p className="mt-1 text-[10px] text-muted-2">{r.explain}</p> : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-3">
            <Link href="/polls"><Button variant="secondary" size="sm">Today&apos;s poll</Button></Link>
            <Link href="/leaderboard"><Button size="sm"><Trophy size={13} /> See your rank</Button></Link>
          </div>
        </section>
      ) : attempt ? (
        <section className="vz-panel flex flex-col items-center gap-3 p-8 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <CheckCircle2 size={26} />
          </span>
          <div>
            <h2 className="text-lg font-bold">You already played this week</h2>
            <p className="mt-1 text-sm text-muted">
              Score: <span className="font-bold text-foreground">{attempt.score}/{attempt.total}</span> · a new quiz unlocks Monday.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/polls"><Button variant="secondary" size="sm">Vote in a poll</Button></Link>
            <Link href="/leaderboard"><Button size="sm">View leaderboard</Button></Link>
          </div>
        </section>
      ) : (
        <section className="vz-panel flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Weekly quiz</p>
              <h2 className="text-lg font-bold tracking-tight">{quiz.title}</h2>
            </div>
            <span className="text-[10px] font-medium text-muted">
              {index + 1} / {quiz.questions.length}
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${((index + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>

          {current ? (
            <div className="flex flex-col gap-3">
              <h3 className="text-base font-bold leading-snug">{current.q}</h3>
              <div className="flex flex-col gap-2">
                {current.options.map((option, i) => {
                  const selected = answers[index] === i;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => prev.map((value, idx) => (idx === index ? i : value)))
                      }
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-[12.5px] font-medium transition",
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card hover:border-primary/40 hover:bg-accent/50",
                      )}
                    >
                      <span className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                        selected ? "bg-primary text-white" : "bg-accent text-muted",
                      )}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
            <span className="text-[10px] text-muted">{answeredCount} of {quiz.questions.length} answered</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
                Back
              </Button>
              {isLast ? (
                <Button size="sm" onClick={submit} disabled={submitting}>
                  {submitting ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}
                  Submit answers
                </Button>
              ) : (
                <Button size="sm" onClick={() => setIndex((i) => Math.min((quiz.questions.length - 1), i + 1))}>
                  Next <ArrowRight size={13} />
                </Button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
