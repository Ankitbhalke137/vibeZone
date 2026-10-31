"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { io, type Socket } from "socket.io-client";
import {
  ArrowLeft,
  Flag,
  Hash,
  Info,
  Lock,
  Pencil,
  Send,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  VenetianMask,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/avatar";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { ga } from "@/lib/ga";

export type ChatMessage = {
  id: string;
  channelId: string;
  senderId: string | null;
  displayName: string;
  handle: string | null;
  avatarUrl: string | null;
  aliased: boolean;
  body: string;
  isFlagged: boolean;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
};

type Props = {
  channel: {
    id: string;
    slug: string;
    name: string;
    type: string;
    topic: string | null;
    memberCount: number;
  };
  me: { id: string; name: string; handle: string; avatarUrl: string | null };
  initialMessages: ChatMessage[];
  nextCursor: string | null;
  initialAliasActive: boolean;
  initialAliasName: string | null;
  realtimeUrl: string | null;
  realtimeToken: string;
};

const REPORT_REASONS = [
  { value: "abuse", label: "Abuse or harassment" },
  { value: "spam", label: "Spam" },
  { value: "explicit", label: "Explicit content" },
  { value: "other", label: "Something else" },
] as const;

function dayKey(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function dayLabel(iso: string) {
  const key = dayKey(iso);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const yesterday = new Date(Date.now() - 86_400_000).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  if (key === today) return "Today";
  if (key === yesterday) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export function ChatRoom({
  channel,
  me,
  initialMessages,
  nextCursor,
  initialAliasActive,
  initialAliasName,
  realtimeUrl,
  realtimeToken,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [cursor, setCursor] = useState(nextCursor);
  const [body, setBody] = useState("");
  const [aliasActive, setAliasActive] = useState(initialAliasActive);
  const [aliasName, setAliasName] = useState(initialAliasName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; body: string } | null>(null);
  const [reporting, setReporting] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>("abuse");
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const lastStamp = useRef<string | null>(messages.at(-1)?.createdAt ?? null);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  const mergeMessages = useCallback((incoming: ChatMessage[]) => {
    setMessages((current) => {
      const map = new Map(current.map((m) => [m.id, m]));
      for (const m of incoming) {
        if (m.id.startsWith("temp-")) continue;
        map.set(m.id, m);
      }
      return [...map.values()].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    });
  }, []);

  // ---- Realtime: Socket.IO when configured, polling fallback otherwise ----
  useEffect(() => {
    if (realtimeUrl) {
      const socket = io(realtimeUrl, {
        transports: ["websocket"],
        auth: { token: realtimeToken },
        reconnection: true,
        reconnectionAttempts: 8,
      });
      socketRef.current = socket;
      socket.on("connect", () => {
        setConnected(true);
        socket.emit("join", { channelId: channel.id });
      });
      socket.on("disconnect", () => setConnected(false));
      socket.on("message:created", (p: { message: ChatMessage }) => {
        if (p?.message?.channelId === channel.id) {
          mergeMessages([p.message]);
          scrollToBottom();
        }
      });
      socket.on("message:edited", (p: { id: string; body: string; editedAt: string }) => {
        setMessages((cur) =>
          cur.map((m) => (m.id === p.id ? { ...m, body: p.body, editedAt: p.editedAt } : m)),
        );
      });
      socket.on("message:deleted", (p: { id: string }) => {
        setMessages((cur) =>
          cur.map((m) =>
            m.id === p.id
              ? { ...m, body: "This message was deleted.", deletedAt: new Date().toISOString() }
              : m,
          ),
        );
      });
      return () => {
        socket.emit("leave", { channelId: channel.id });
        socket.disconnect();
        socketRef.current = null;
      };
    }

    // Polling fallback (local dev / no gateway). Keeps latency acceptable and
    // still relies on the same REST + authorization surface.
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/channels/${channel.id}/messages?limit=50`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) mergeMessages(data.messages ?? []);
      } catch {
        /* transient */
      }
    };
    const timer = setInterval(tick, 4000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [channel.id, mergeMessages, realtimeToken, realtimeUrl, scrollToBottom]);

  useEffect(() => {
    const stamp = messages.at(-1)?.createdAt ?? null;
    if (stamp && stamp !== lastStamp.current) {
      lastStamp.current = stamp;
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    const tempId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      channelId: channel.id,
      senderId: me.id,
      displayName: aliasActive ? aliasName ?? "Anonymous" : me.name,
      handle: aliasActive ? null : me.handle,
      avatarUrl: aliasActive ? null : me.avatarUrl,
      aliased: aliasActive,
      body: text,
      isFlagged: false,
      editedAt: null,
      deletedAt: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((cur) => [...cur, optimistic]);
    setBody("");
    scrollToBottom();

    try {
      const res = await fetch(`/api/channels/${channel.id}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: text, alias: aliasActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't send.");
      setMessages((cur) => cur.filter((m) => m.id !== tempId));
      mergeMessages([data.message]);
      ga.messageSend(channel.type, aliasActive);
      router.refresh();
    } catch (err) {
      setMessages((cur) => cur.filter((m) => m.id !== tempId));
      setBody(text);
      setError(err instanceof Error ? err.message : "Couldn't send.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleAlias() {
    setError(null);
    try {
      const res = await fetch(`/api/channels/${channel.id}/alias`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ active: !aliasActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't change alias mode.");
      setAliasActive(data.aliasActive);
      setAliasName(data.aliasName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't change alias mode.");
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setError(null);
    try {
      const res = await fetch(`/api/messages/${editing.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: editing.body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't edit.");
      setMessages((cur) =>
        cur.map((m) =>
          m.id === editing.id
            ? { ...m, body: editing.body, editedAt: new Date().toISOString() }
            : m,
        ),
      );
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't edit.");
    }
  }

  async function removeMessage(id: string) {
    if (!window.confirm("Delete this message?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't delete.");
      setMessages((cur) =>
        cur.map((m) =>
          m.id === id
            ? { ...m, body: "This message was deleted.", deletedAt: new Date().toISOString() }
            : m,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete.");
    }
  }

  async function report(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/messages/${id}/report`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason: reportReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't report.");
      setReporting(null);
      ga.reportCreate("message", reportReason);
      toast({
        title: "Report sent",
        description: "A moderator will review it within 24 hours.",
        tone: "success",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't report.");
    }
  }

  async function loadOlder() {
    if (!cursor) return;
    try {
      const res = await fetch(
        `/api/channels/${channel.id}/messages?before=${encodeURIComponent(cursor)}&limit=50`,
        { cache: "no-store" },
      );
      const data = await res.json();
      if (!res.ok) return;
      mergeMessages(data.messages ?? []);
      setCursor(data.nextCursor);
    } catch {
      /* ignore */
    }
  }

  const heading = useMemo(() => {
    if (channel.type === "global") return `#${channel.name}`;
    return channel.name;
  }, [channel.name, channel.type]);

  const isGlobal = channel.type === "global";

  return (
    <div className="flex min-h-[calc(100dvh-12rem)] flex-col gap-3 lg:h-[calc(100dvh-9.5rem)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/chat"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted transition hover:text-foreground"
        >
          <ArrowLeft size={12} /> All conversations
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[9.5px] font-semibold text-muted">
          <ShieldCheck size={10} className="text-success" /> Moderated channel
        </span>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="vz-panel flex min-h-0 flex-col overflow-hidden">
          <header className="flex flex-wrap items-center gap-2.5 border-b border-border px-3.5 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              {isGlobal ? <Hash size={18} /> : <Lock size={16} />}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-black">{heading}</h1>
              <p className="truncate text-[10px] text-muted">
                {channel.topic ?? (isGlobal ? "Campus-wide channel" : "Private conversation")}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="hidden items-center gap-1 rounded-full bg-accent px-2 py-1 text-[9px] font-semibold text-muted sm:inline-flex">
                <Users size={10} /> {channel.memberCount}
              </span>
              {realtimeUrl ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold",
                    connected ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", connected ? "bg-success" : "bg-danger")} />
                  {connected ? "live" : "reconnecting"}
                </span>
              ) : (
                <span className="rounded-full bg-accent px-2 py-1 text-[9px] font-semibold text-primary">
                  polling
                </span>
              )}
              {isGlobal ? (
                <button
                  type="button"
                  onClick={toggleAlias}
                  aria-pressed={aliasActive}
                  className={cn(
                    "inline-flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-semibold transition",
                    aliasActive
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-muted hover:bg-accent hover:text-foreground",
                  )}
                >
                  <VenetianMask size={12} />
                  {aliasActive ? aliasName ?? "Alias on" : "Alias off"}
                </button>
              ) : null}
            </div>
          </header>

          <div className="vz-scroll flex-1 overflow-y-auto px-3.5 py-3">
            {cursor ? (
              <div className="mb-3 text-center">
                <button
                  type="button"
                  onClick={loadOlder}
                  className="rounded-full border border-border bg-card px-3 py-1 text-[10px] font-semibold text-primary transition hover:bg-accent"
                >
                  Load older messages
                </button>
              </div>
            ) : null}

            {messages.length === 0 ? (
              <div className="flex h-full min-h-56 flex-col items-center justify-center text-center">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  {isGlobal ? <Hash size={21} /> : <Lock size={19} />}
                </span>
                <h2 className="mt-3 text-sm font-bold">Start the conversation</h2>
                <p className="mt-1 max-w-xs text-[10.5px] leading-relaxed text-muted">
                  No messages yet. Say hi, ask a question, or share something campus should know.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {messages.map((message, index) => {
                  const mine = message.senderId === me.id;
                  const isDeleted = !!message.deletedAt;
                  const showDay =
                    index === 0 || dayKey(messages[index - 1]!.createdAt) !== dayKey(message.createdAt);
                  return (
                    <li key={message.id} className="group">
                      {showDay ? (
                        <div className="my-3 flex items-center gap-2">
                          <span className="h-px flex-1 bg-border" />
                          <span className="rounded-full bg-accent px-2.5 py-0.5 text-[8.5px] font-semibold text-muted">
                            {dayLabel(message.createdAt)}
                          </span>
                          <span className="h-px flex-1 bg-border" />
                        </div>
                      ) : null}

                      <div className={cn("flex gap-2", mine && "flex-row-reverse")}>
                        {!mine ? (
                          <Avatar
                            name={message.displayName}
                            handle={message.handle ?? undefined}
                            avatarUrl={message.avatarUrl}
                            size="sm"
                          />
                        ) : null}

                        <div className={cn("min-w-0 max-w-[84%]", mine && "text-right")}>
                          <p
                            className={cn(
                              "mb-0.5 flex items-center gap-1.5 text-[9.5px] text-muted",
                              mine && "justify-end",
                            )}
                          >
                            <span className={cn("font-semibold", mine ? "text-primary" : "text-foreground")}>
                              {mine ? "You" : message.displayName}
                            </span>
                            {message.aliased ? (
                              <VenetianMask size={9} aria-label="Alias" className="text-primary" />
                            ) : null}
                            <span>
                              {new Date(message.createdAt).toLocaleTimeString("en-IN", {
                                timeZone: "Asia/Kolkata",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {message.editedAt ? <span>· edited</span> : null}
                            {message.isFlagged ? (
                              <span className="font-semibold text-danger" title="Held for moderator review">
                                · flagged
                              </span>
                            ) : null}
                          </p>

                          {editing?.id === message.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                value={editing.body}
                                onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                                className="w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-[12px] outline-none focus:border-primary"
                                autoFocus
                              />
                              <Button size="sm" onClick={saveEdit}>
                                Save
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div
                              className={cn(
                                "inline-block whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-left text-[12px] leading-relaxed",
                                isDeleted
                                  ? "border border-dashed border-border text-[11px] text-muted italic"
                                  : mine
                                    ? "rounded-br-md bg-primary text-primary-foreground"
                                    : "rounded-bl-md border border-border bg-[var(--vz-card-2)] text-foreground",
                              )}
                            >
                              {message.body}
                            </div>
                          )}

                          {!isDeleted && !message.id.startsWith("temp-") ? (
                            <div
                              className={cn(
                                "mt-0.5 flex items-center gap-2 text-[9px] text-muted-2 opacity-0 transition group-hover:opacity-100",
                                mine && "justify-end",
                              )}
                            >
                              {mine ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setEditing({ id: message.id, body: message.body })}
                                    title="Edit"
                                    className="transition hover:text-primary"
                                  >
                                    <Pencil size={10} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeMessage(message.id)}
                                    title="Delete"
                                    className="transition hover:text-danger"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setReporting(message.id)}
                                  title="Report"
                                  className="transition hover:text-danger"
                                >
                                  <Flag size={10} />
                                </button>
                              )}
                            </div>
                          ) : null}

                          {reporting === message.id ? (
                            <div
                              className={cn(
                                "mt-1.5 flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card p-2 text-left text-[10px]",
                                mine && "justify-end",
                              )}
                            >
                              <select
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                className="h-7 rounded-lg border border-border bg-background px-1.5 text-[10px] outline-none"
                              >
                                {REPORT_REASONS.map((reason) => (
                                  <option key={reason.value} value={reason.value}>
                                    {reason.label}
                                  </option>
                                ))}
                              </select>
                              <Button size="sm" variant="danger" onClick={() => report(message.id)}>
                                Report
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setReporting(null)}>
                                Cancel
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <div ref={bottomRef} />
          </div>

          {error ? (
            <p role="alert" className="mx-3.5 mb-2 rounded-xl bg-danger/10 px-3 py-2 text-[10.5px] font-medium text-danger">
              {error}
            </p>
          ) : null}

          <form onSubmit={send} className="border-t border-border p-2.5">
            {aliasActive ? (
              <p className="mb-1 flex items-center gap-1 px-1 text-[9.5px] font-medium text-primary">
                <UserRound size={9} aria-hidden /> Posting as {aliasName}
              </p>
            ) : null}
            <div className="flex items-end gap-2 rounded-2xl border border-border bg-[var(--vz-card-2)] p-1.5 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(e);
                  }
                }}
                rows={1}
                maxLength={4000}
                placeholder={`Message ${heading}…`}
                className="max-h-32 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-[12px] outline-none placeholder:text-muted-2"
              />
              <Button
                type="submit"
                size="icon"
                disabled={busy || !body.trim()}
                aria-label="Send message"
                className="size-9 rounded-xl"
              >
                <Send size={15} aria-hidden />
              </Button>
            </div>
            <p className="mt-1 px-1 text-[8.5px] text-muted-2">
              Enter to send · Shift + Enter for a new line
            </p>
          </form>
        </section>

        <aside className="hidden min-h-0 flex-col gap-3 overflow-y-auto lg:flex">
          <section className="vz-panel vz-soft-gradient p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold">
              {isGlobal ? <Hash size={13} className="text-primary" /> : <Lock size={12} className="text-primary" />}
              {isGlobal ? "Channel guide" : "Private chat"}
            </p>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
              {isGlobal
                ? "A shared space for everyone on campus. Keep it useful, keep it kind."
                : "Only the people in this conversation can read these messages."}
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-[10px] leading-relaxed text-muted">
              <li className="flex gap-1.5">
                <Info size={10} className="mt-0.5 shrink-0 text-primary" />
                {isGlobal
                  ? "Anyone in the channel can read and reply."
                  : "Moderators may review reported messages."}
              </li>
              <li className="flex gap-1.5">
                <ShieldCheck size={10} className="mt-0.5 shrink-0 text-success" />
                Report a message instead of escalating.
              </li>
              <li className="flex gap-1.5">
                <VenetianMask size={10} className="mt-0.5 shrink-0 text-primary" />
                {isGlobal
                  ? "Alias mode hides your name from other students."
                  : "Alias mode is only available in global channels."}
              </li>
            </ul>
          </section>

          <section className="vz-panel p-4">
            <p className="text-[11px] font-bold">People here</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {Array.from({ length: Math.min(4, channel.memberCount) }).map((_, index) => (
                  <span
                    key={index}
                    className="grid size-7 place-items-center rounded-full border-2 border-card bg-primary/10 text-[9px] font-bold text-primary"
                  >
                    {index === 0 ? me.name.charAt(0).toUpperCase() : "•"}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-muted">
                {channel.memberCount} member{channel.memberCount === 1 ? "" : "s"}
              </span>
            </div>
            <Link
              href="/explore"
              className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
            >
              Find more people
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
