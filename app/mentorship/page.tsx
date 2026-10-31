"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  GraduationCap,
  Loader2,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormError, Label, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

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

const EXPERTISE = ["All", "DSA", "Placements", "Higher studies", "Projects", "Design", "Startup"];

function tagsOf(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}

export default function MentorshipPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [seniors, setSeniors] = useState<Senior[]>([]);
  const [me, setMe] = useState<Me>(null);
  const [tag, setTag] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestFor, setRequestFor] = useState<Senior | null>(null);

  const fetchSeniors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (tag !== "All") qs.set("tag", tag);
      const res = await fetch(`/api/mentorship/requests?${qs.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load seniors.");
      const data = await res.json();
      setSeniors(data.seniors as Senior[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load seniors.");
    } finally {
      setLoading(false);
    }
  }, [tag]);

  useEffect(() => {
    void fetchSeniors();
  }, [fetchSeniors]);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMe(d?.user ?? null))
      .catch(() => {});
  }, []);

  const visible = seniors.filter((s) => {
    if (!search) return true;
    const haystack = `${s.name} ${s.handle} ${s.branch ?? ""} ${tagsOf(s.expertise).join(" ")}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  function request(senior: Senior) {
    if (!me) return router.push("/login?next=/mentorship");
    if (senior.id === me.id) return;
    setRequestFor(senior);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <PageHeader
        eyebrow="Seniors Connect"
        title="Find a mentor"
        description="Learn from seniors who've done it before — DSA, placements, higher studies and campus life."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted">
            <GraduationCap size={12} className="text-primary" /> {visible.length} mentors
          </span>
        }
      />

      <section className="vz-panel vz-soft-gradient flex flex-wrap items-center gap-3 p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-[0_10px_24px_-14px_rgba(112,71,245,0.9)]">
          <Sparkles size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold">A five-minute chat can change a semester.</p>
          <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">
            Send a short, specific request. Seniors accept a limited number of conversations so keep it thoughtful.
          </p>
        </div>
      </section>

      <section className="vz-panel flex flex-col gap-2 p-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, handle, branch or skill…"
            aria-label="Search mentors"
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-xs outline-none transition placeholder:text-muted-2 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
          />
        </div>
        <div className="vz-no-scrollbar flex items-center gap-1 overflow-x-auto">
          {EXPERTISE.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              aria-pressed={tag === t}
              className={cn(
                "h-9 shrink-0 rounded-lg px-2.5 text-[10.5px] font-semibold transition",
                tag === t
                  ? "bg-primary text-white"
                  : "border border-border bg-card text-muted hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {error ? <FormError message={error} /> : null}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="vz-panel space-y-2 p-4">
              <div className="flex items-center gap-2">
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-8 w-2/3" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Users size={20} />}
          title="No mentors found"
          description={
            search || tag !== "All"
              ? "Try a different skill or clear your search."
              : "Seniors will appear here once they set up their mentoring profile."
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((s) => {
            const tags = tagsOf(s.expertise);
            const status = s.requestStatus;
            const isMe = me?.id === s.id;
            return (
              <article key={s.id} className="vz-panel vz-card-hover flex flex-col p-4">
                <div className="flex items-start gap-3">
                  <Avatar name={s.name} handle={s.handle} avatarUrl={s.avatarUrl} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link href={`/u/${s.handle}`} className="truncate text-[13px] font-bold hover:text-primary">
                        {s.name}
                      </Link>
                      {status === "accepted" ? (
                        <Badge tone="green" className="normal-case tracking-normal">
                          <CheckCircle2 size={9} /> Connected
                        </Badge>
                      ) : status === "pending" ? (
                        <Badge tone="amber" className="normal-case tracking-normal">Pending</Badge>
                      ) : null}
                    </div>
                    <p className="truncate text-[10px] text-muted">
                      @{s.handle}
                      {s.branch ? ` · ${s.branch}` : ""}
                      {s.year ? ` · Y${s.year}` : ""}
                    </p>
                  </div>
                </div>

                {tags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tags.slice(0, 4).map((t) => (
                      <span key={t} className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-medium text-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-3 flex items-center gap-2 border-t border-[var(--vz-border-soft)] pt-2.5">
                  {isMe ? (
                    <span className="text-[10px] font-semibold text-muted">This is you</span>
                  ) : status === "accepted" ? (
                    <Button size="sm" variant="secondary" onClick={() => router.push("/chat")}>
                      <MessageCircle size={13} /> Open chat
                    </Button>
                  ) : status === "pending" ? (
                    <span className="text-[10px] text-muted">Request sent — waiting for a reply.</span>
                  ) : (
                    <Button size="sm" variant="soft" onClick={() => request(s)}>
                      <Send size={12} /> Request a chat
                    </Button>
                  )}
                  <Link href={`/u/${s.handle}`} className="ml-auto text-[10px] font-semibold text-primary hover:underline">
                    Profile →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <RequestModal
        senior={requestFor}
        onClose={() => setRequestFor(null)}
        onSent={() => {
          setRequestFor(null);
          void fetchSeniors();
          toast({ title: "Request sent", description: "You'll get a notification when they reply.", tone: "success" });
          router.refresh();
        }}
      />
    </div>
  );
}

function RequestModal({
  senior,
  onClose,
  onSent,
}: {
  senior: Senior | null;
  onClose: () => void;
  onSent: () => void;
}) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!senior) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/mentorship/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ seniorId: senior.id, message: message.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed.");
      setMessage("");
      onSent();
    } catch (err) {
      const text = err instanceof Error ? err.message : "Couldn't send request.";
      setError(text);
      toast({ title: text, tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={Boolean(senior)}
      onClose={onClose}
      title={senior ? `Message @${senior.handle}` : "Request a chat"}
      description="Introduce yourself and say what you'd like help with."
    >
      <form onSubmit={submit} className="flex flex-col gap-3">
        {senior ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-[var(--vz-card-2)] p-2.5">
            <Avatar name={senior.name} handle={senior.handle} avatarUrl={senior.avatarUrl} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold">{senior.name}</p>
              <p className="truncate text-[9.5px] text-muted">
                {senior.branch ?? "PW IOI"}
                {senior.year ? ` · Y${senior.year}` : ""}
              </p>
            </div>
          </div>
        ) : null}

        <div>
          <Label htmlFor="mentor-msg">Your message</Label>
          <Textarea
            id="mentor-msg"
            required
            rows={4}
            maxLength={600}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi! I'm in second year and struggling with graph DP. Could I ask you a couple of questions?"
          />
          <p className="mt-1 text-[9.5px] text-muted-2">{message.length}/600 characters</p>
        </div>

        <FormError message={error} />
        <Button type="submit" disabled={busy || !message.trim()}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
          {busy ? "Sending…" : "Send request"}
        </Button>
      </form>
    </Modal>
  );
}
