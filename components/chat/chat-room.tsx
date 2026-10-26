"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import { Flag, Pencil, Send, Trash2, UserRound, VenetianMask } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/avatar";
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
  channel: { id: string; slug: string; name: string; type: string; topic: string | null };
  me: { id: string; name: string; handle: string; avatarUrl: string | null };
  initialMessages: ChatMessage[];
  nextCursor: string | null;
  initialAliasActive: boolean;
  initialAliasName: string | null;
  realtimeUrl: string | null;
  realtimeToken: string;
};

const REPORT_REASONS = [
  { value: "abuse", label: "Abuse" },
  { value: "spam", label: "Spam" },
  { value: "explicit", label: "Explicit" },
  { value: "other", label: "Other" },
] as const;

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
            m.id === p.id ? { ...m, body: "This message was deleted.", deletedAt: new Date().toISOString() } : m,
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
          m.id === id ? { ...m, body: "This message was deleted.", deletedAt: new Date().toISOString() } : m,
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
      window.alert("Reported. A moderator will review it within 24 hours.");
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

  return (
    <div className="flex min-h-[calc(100dvh-13rem)] flex-col gap-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold">{heading}</h1>
          <p className="truncate text-xs text-muted">{channel.topic ?? "Campus chat"}</p>
        </div>
        <div className="flex items-center gap-2">
          {realtimeUrl ? (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                connected ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
              )}
            >
              {connected ? "live" : "reconnecting"}
            </span>
          ) : (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-primary">
              polling
            </span>
          )}
          {channel.type === "global" ? (
            <button
              type="button"
              onClick={toggleAlias}
              aria-pressed={aliasActive}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
                aliasActive
                  ? "border-primary bg-accent text-primary"
                  : "border-border text-muted hover:text-foreground",
              )}
            >
              <VenetianMask size={13} aria-hidden />
              {aliasActive ? aliasName ?? "Alias on" : "Alias off"}
            </button>
          ) : null}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card p-3">
        {cursor ? (
          <div className="mb-3 text-center">
            <button
              type="button"
              onClick={loadOlder}
              className="text-xs text-primary hover:underline"
            >
              Load older messages
            </button>
          </div>
        ) : null}

        {messages.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">
            No messages yet — say hi 👋
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {messages.map((m) => {
              const mine = m.senderId === me.id;
              const isDeleted = !!m.deletedAt;
              return (
                <li key={m.id} className={cn("flex gap-2", mine && "flex-row-reverse")}>
                  {!mine ? (
                    <Avatar name={m.displayName} handle={m.handle ?? undefined} avatarUrl={m.avatarUrl} size="sm" />
                  ) : null}
                  <div className={cn("max-w-[82%] min-w-0", mine && "items-end text-right")}>
                    <p className="mb-0.5 flex items-center gap-1.5 text-[11px] text-muted">
                      {mine ? "You" : m.displayName}
                      {m.aliased ? <VenetianMask size={10} aria-label="Alias" /> : null}
                      <span>
                        {new Date(m.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {m.editedAt ? <span>· edited</span> : null}
                      {m.isFlagged ? (
                        <span className="font-semibold text-danger" title="Held for moderator review">
                          · flagged
                        </span>
                      ) : null}
                    </p>
                    {editing?.id === m.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={editing.body}
                          onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                          className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                          autoFocus
                        />
                        <Button size="sm" onClick={saveEdit}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "inline-block whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-left text-sm",
                          isDeleted
                            ? "border border-dashed border-border text-muted italic"
                            : mine
                              ? "bg-primary text-primary-foreground"
                              : "bg-accent text-foreground",
                        )}
                      >
                        {m.body}
                      </div>
                    )}

                    {!isDeleted && !m.id.startsWith("temp-") ? (
                      <div className={cn("mt-0.5 flex items-center gap-2 text-[10px] text-muted", mine && "justify-end")}>
                        {mine ? (
                          <>
                            <button type="button" onClick={() => setEditing({ id: m.id, body: m.body })} title="Edit">
                              <Pencil size={11} />
                            </button>
                            <button type="button" onClick={() => removeMessage(m.id)} title="Delete">
                              <Trash2 size={11} />
                            </button>
                          </>
                        ) : (
                          <button type="button" onClick={() => setReporting(m.id)} title="Report">
                            <Flag size={11} />
                          </button>
                        )}
                      </div>
                    ) : null}

                    {reporting === m.id ? (
                      <div className="mt-1 flex items-center gap-1.5 rounded-lg border border-border bg-background p-1.5 text-xs">
                        <select
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="rounded border border-border bg-card px-1 py-1 text-xs"
                        >
                          {REPORT_REASONS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                        <Button size="sm" variant="danger" onClick={() => report(m.id)}>
                          Report
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setReporting(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}

      <form onSubmit={send} className="flex items-end gap-2">
        <div className="flex-1">
          {aliasActive ? (
            <p className="mb-1 flex items-center gap-1 text-[11px] text-primary">
              <UserRound size={11} aria-hidden /> Posting as {aliasName}
            </p>
          ) : null}
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
            className="flex max-h-32 min-h-11 w-full resize-none rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Button type="submit" disabled={busy || !body.trim()} aria-label="Send message">
          <Send size={16} aria-hidden />
        </Button>
      </form>
    </div>
  );
}
