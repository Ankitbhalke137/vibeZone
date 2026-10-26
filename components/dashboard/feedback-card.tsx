"use client";

import { useState } from "react";
import { Send, Shield, ShieldCheck } from "lucide-react";

export function FeedbackCard() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 10) {
      setError("Please write at least 10 characters.");
      return;
    }
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ category: "Other", message: message.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not send feedback.");
      setStatus("sent");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send feedback.");
      setStatus("idle");
    }
  }

  return (
    <section className="vz-panel p-4">
      <div className="flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-lg bg-[var(--vz-green)]/15 text-[var(--vz-green)]">
          <Shield size={14} />
        </span>
        <h2 className="text-[13px] font-semibold">Anonymous Feedback</h2>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--vz-muted)]">
        Honest thoughts, zero attribution. Goes straight to the admin desk.
      </p>

      {status === "sent" ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-[var(--vz-green)]/30 bg-[var(--vz-green)]/10 px-3 py-3 text-[11px] font-medium text-[var(--vz-green)]">
          <ShieldCheck size={14} /> Sent — thank you. It&apos;s with the admin desk.
        </div>
      ) : (
        <form onSubmit={submit} className="mt-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Honest thoughts, zero attribution…"
            rows={3}
            maxLength={1000}
            className="w-full resize-none rounded-xl border border-[var(--vz-border)] bg-[var(--vz-card-2)] px-3 py-2.5 text-[11px] text-[var(--vz-text)] outline-none transition placeholder:text-[var(--vz-muted-2)] focus:border-[var(--vz-violet)]/60 focus:ring-2 focus:ring-[var(--vz-violet)]/15"
          />
          {error ? <p className="mt-1.5 text-[10px] font-medium text-[var(--vz-red)]">{error}</p> : null}
          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[9px] text-[var(--vz-muted-2)]">
              <span className="size-1 rounded-full bg-[var(--vz-green)]" /> No name, no trace
            </span>
            <button
              type="submit"
              disabled={status === "sending"}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--vz-violet)] px-3 py-1.5 text-[10px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {status === "sending" ? "Sending…" : "Send"}
              <Send size={10} />
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
