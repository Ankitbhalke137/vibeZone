"use client";

import { useState } from "react";
import { CheckCircle2, LockKeyhole, Send, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError, Input, Label, Textarea } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Academic", "Facilities", "Hostel", "Clubs", "Other"] as const;

export default function FeedbackPage() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Academic");
  const [message, setMessage] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          category,
          message,
          year: year ? Number(year) : undefined,
          branch: branch || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed.");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4 py-8">
        <div className="vz-panel flex flex-col items-center p-8 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-success/10 text-success">
            <CheckCircle2 size={26} />
          </span>
          <h1 className="mt-3 text-lg font-black">Sent anonymously</h1>
          <p className="mt-1 max-w-sm text-[11.5px] leading-relaxed text-muted">
            Your feedback is with the VibeZone admin team. No handle, email or session was stored with it.
          </p>
          <Button
            className="mt-4"
            variant="secondary"
            onClick={() => {
              setSubmitted(false);
              setMessage("");
            }}
          >
            Send another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="Safe line"
        title="Anonymous feedback"
        description="Share what's working, what isn't, and what you'd change. One submission per day."
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
        <form onSubmit={submit} className="vz-panel flex flex-col gap-4 p-5">
          <div>
            <Label>Category</Label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition",
                    category === c
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border text-muted hover:bg-accent",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="msg">Message</Label>
            <Textarea
              id="msg"
              required
              minLength={10}
              maxLength={1000}
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What would you like to change about campus life? (10–1000 characters)"
            />
            <p className="mt-1 text-[9.5px] text-muted-2">{message.length} / 1000 characters</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="yr">Year (optional)</Label>
              <Input
                id="yr"
                type="number"
                min={1}
                max={4}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2"
              />
            </div>
            <div>
              <Label htmlFor="br">Branch (optional)</Label>
              <Input
                id="br"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. CSE"
              />
            </div>
          </div>

          <FormError message={error} />
          <Button type="submit" disabled={busy || message.trim().length < 10}>
            <Send size={14} /> {busy ? "Sending…" : "Send anonymously"}
          </Button>
        </form>

        <aside className="flex flex-col gap-3">
          <section className="vz-panel vz-soft-gradient p-4">
            <div className="flex items-center gap-2 text-[11.5px] font-bold">
              <Shield size={14} className="text-primary" /> Truly anonymous
            </div>
            <ul className="mt-2 flex flex-col gap-2 text-[10.5px] leading-relaxed text-muted">
              <li className="flex gap-1.5">
                <LockKeyhole size={11} className="mt-0.5 shrink-0 text-success" />
                No handle, email or session is stored.
              </li>
              <li className="flex gap-1.5">
                <Sparkles size={11} className="mt-0.5 shrink-0 text-success" />
                Only limited anti-abuse metadata is kept briefly.
              </li>
              <li className="flex gap-1.5">
                <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-success" />
                One submission per day per network.
              </li>
            </ul>
          </section>

          <p className="rounded-xl border border-warning/20 bg-warning/10 px-3 py-2 text-[10px] leading-relaxed text-amber-700 dark:text-amber-400">
            This is not an official complaint channel. For urgent safety issues, contact campus
            authorities directly.
          </p>
        </aside>
      </div>
    </div>
  );
}
