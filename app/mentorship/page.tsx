"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, GraduationCap, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, FormError, Input, Label } from "@/components/ui/form";
import { Avatar } from "@/components/avatar";

type Senior = {
  id: string;
  name: string;
  handle: string;
  branch: string | null;
  year: number | null;
  expertise: unknown;
  avatarUrl: string | null;
  requestStatus: string | null;
};

type Me = { id: string; name: string; handle: string; role: string } | null;

const EXPERTISE = ["DSA", "Placements", "Higher studies", "Projects", "Design", "Startup"];

export default function MentorshipPage() {
  const router = useRouter();
  const [seniors, setSeniors] = useState<Senior[]>([]);
  const [me, setMe] = useState<Me>(null);
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Request draft
  const [openRequest, setOpenRequest] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState("");

  const fetchSeniors = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (tag) params.set("tag", tag);
      const res = await fetch(`/api/mentorship/requests?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load seniors.");
      const data = await res.json();
      setSeniors(data.seniors);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load seniors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeniors();
    fetch("/api/me", { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then((d) => setMe(d?.user ?? null));
  }, [tag]);

  async function sendRequest(seniorId: string) {
    if (!me) return router.push("/login");
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/mentorship/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ seniorId, message: draftMessage || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed.");
      setOpenRequest(null);
      setDraftMessage("");
      void fetchSeniors();
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Couldn't send request.");
    } finally {
      setSubmitting(false);
    }
  }

  async function respond(requestId: string, action: "accept" | "reject") {
    try {
      const res = await fetch(`/api/mentorship/requests/${requestId}/respond`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Couldn't respond.");
      void fetchSeniors();
    } catch {
      setError("Couldn't respond to request.");
    }
  }

  const expertiseStr = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
    return [];
  };

  return (
    <div className="mx-auto max-w-3xl py-6">
      <nav className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Seniors Connect</h1>
            <p className="text-sm text-muted">Connect with seniors for DSA, placements, projects, and campus guidance.</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <GraduationCap size={14} aria-hidden />
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Input placeholder="Filter by tag (e.g. DSA)" value={tag} onChange={(e) => setTag(e.target.value)} className="w-auto min-w-[180px] text-sm" />
          <div className="flex gap-1">
            {EXPERTISE.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(tag === t ? "" : t)}
                aria-pressed={tag === t}
                className={`px-2 py-1 rounded-lg text-xs border transition ${tag === t ? "border-primary bg-accent text-primary" : "border-border text-muted hover:bg-accent/50"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {error ? <FormError message={error} /> : null}

      {loading ? (
        <div className="h-64 flex items-center justify-center text-muted">Loading seniors…</div>
      ) : seniors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center text-sm text-muted">
          No seniors available right now.
        </div>
      ) : (
        <div className="space-y-3">
          {seniors.map((s) => {
            const tags = expertiseStr(s.expertise);
            const pending = s.requestStatus === "pending";
            const accepted = s.requestStatus === "accepted";
            const rejected = s.requestStatus === "rejected";
            const isMine = s.id === (me?.id ?? "");
            const canRespond = pending && !isMine && me?.role === "senior";

            return (
              <Card key={s.id} className="p-4 hover:border-primary/40 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar name={s.name} handle={s.handle} avatarUrl={s.avatarUrl} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{s.name}</p>
                        <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px]">Senior</span>
                      </div>
                      <p className="text-[11px] text-muted">@{s.handle} · {s.branch ?? "—"} Y{s.year ?? "?"}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {tags.map((t) => (
                          <span key={t} className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px]">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isMine ? (
                      <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold text-danger">You</span>
                    ) : pending ? (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Pending</span>
                    ) : accepted ? (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Connected</span>
                    ) : rejected ? (
                      <span className="rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-semibold text-muted">Declined</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setOpenRequest(s.id)}
                        disabled={!me}
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium transition hover:bg-accent"
                      >
                        <MessageCircle size={13} aria-hidden /> Request
                      </button>
                    )}
                  </div>
                </div>

                {openRequest === s.id && !accepted && !rejected && !pending && me ? (
                  <div className="mt-4 pt-4 border-t border-border">
                    <form onSubmit={(e) => { e.preventDefault(); void sendRequest(s.id); }} className="flex flex-col gap-3">
                      <Label>Message to @{s.handle}</Label>
                      <textarea
                        required
                        maxLength={600}
                        value={draftMessage}
                        onChange={(e) => setDraftMessage(e.target.value)}
                        className="flex w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none"
                        rows={3}
                        placeholder="Introduce yourself and what you'd like help with…"
                      />
                      {formError ? <FormError message={formError} /> : null}
                      <div className="flex gap-2">
                        <Button type="submit" disabled={submitting} className="flex-1">{submitting ? "Sending…" : "Send request"}</Button>
                        <button type="button" onClick={() => setOpenRequest(null)} className="flex-1 text-muted hover:bg-accent rounded-lg px-3 py-2 text-sm">Cancel</button>
                      </div>
                    </form>
                  </div>
                ) : null}

                {canRespond ? (
                  <div className="mt-4 pt-4 border-t border-border flex gap-2">
                    <Button size="sm" onClick={() => respond(s.id, "accept")} variant="secondary">Accept</Button>
                    <Button size="sm" variant="ghost" onClick={() => respond(s.id, "reject")}>Decline</Button>
                  </div>
                ) : null}

                {accepted && !isMine ? (
                  <div className="mt-3 pt-3 border-t border-border">
                    <a href="/chat" className="flex items-center justify-center gap-2 w-full">
                      <Button size="sm" variant="secondary" className="w-full">
                        <MessageCircle size={14} aria-hidden /> Open chat
                      </Button>
                    </a>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}

      {!me && (
        <div className="mt-6 rounded-xl border border-border bg-card p-4 text-center text-sm text-muted">
          Sign in to send mentorship requests.
        </div>
      )}
    </div>
  );
}
