"use client";

import { useState } from "react";
import { Shield, Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, FormError, Input, Label } from "@/components/ui/form";

const CATEGORIES = ["Academic", "Facilities", "Hostel", "Clubs", "Other"] as const;

export default function FeedbackPage() {
  const [category, setCategory] = useState<typeof CATEGORIES[number]>("Academic");
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
      <div className="mx-auto max-w-md py-12 text-center">
        <Card className="p-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield size={32} aria-hidden className="text-success" />
            <span className="text-success font-medium">Submitted anonymously</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Thank you</h2>
          <p className="text-muted mb-6">
            Your feedback has been sent to the VibeZone admin team. It is truly anonymous — no handle, email, or session is stored.
          </p>
          <Button onClick={() => setSubmitted(false)}>Send another</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Anonymous Feedback</h1>
        <p className="text-sm text-muted">
          A safe line to the admin team. No handle, email, or session is stored. One submission per day.
        </p>
      </div>

      <Card className="p-5">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Category</Label>
            <div className="flex gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${category === c ? "border-primary bg-accent text-primary" : "border-border text-muted hover:bg-accent/50"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="msg">Message</Label>
            <textarea
              id="msg"
              required
              minLength={10}
              maxLength={1000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="What would you like to change about campus life? (10–1000 chars)"
              rows={5}
            />
            <p className="mt-1 text-[10px] text-muted">{message.length} / 1000 characters</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="yr">Year (optional)</Label>
              <Input id="yr" type="number" min={1} max={4} value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="br">Branch (optional)</Label>
              <Input id="br" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="e.g. CSE" />
            </div>
          </div>

          <FormError message={error} />
          <Button type="submit" disabled={busy || message.length < 10} className="w-full">
            <Send size={16} aria-hidden /> {busy ? "Sending…" : "Send anonymously"}
          </Button>
          <p className="text-[11px] text-muted">
            Goes to the VibeZone admin team — not an official complaint channel. If you need urgent help, contact campus authorities directly.
          </p>
        </form>
      </Card>
    </div>
  );
}
