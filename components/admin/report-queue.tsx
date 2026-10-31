"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Ban,
  Check,
  ChevronRight,
  Clock3,
  Flag,
  Mail,
  MessageSquare,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export type MessageReportRow = {
  id: string;
  contentId: string;
  reporter: string;
  reason: string;
  status: string;
  context: string;
  createdAt: string;
};

export type ContentReportRow = {
  id: string;
  contentType: string;
  contentId: string;
  reporter: string;
  reason: string;
  detail: string | null;
  status: string;
  createdAt: string;
};

type QueueItem = {
  id: string;
  kind: "message" | "content";
  contentType: "message" | "note" | "lost_found" | "announcement";
  contentId: string;
  reporter: string;
  reason: string;
  context: string;
  detail: string | null;
  createdAt: string;
};

type PendingAction = {
  item: QueueItem;
  action: "warn" | "ban" | "delete";
};

const REASON_TONE: Record<string, BadgeTone> = {
  abuse: "red",
  explicit: "red",
  spam: "amber",
  broken_link: "neutral",
  other: "neutral",
};

const CONTENT_LABEL: Record<string, string> = {
  message: "Chat message",
  note: "Note resource",
  lost_found: "Lost & Found",
  announcement: "Announcement",
};

export function ReportQueue({
  messageReports,
  contentReports,
}: {
  messageReports: MessageReportRow[];
  contentReports: ContentReportRow[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<"all" | "messages" | "content">("all");
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const items = useMemo<QueueItem[]>(() => {
    const messages = messageReports.map<QueueItem>((r) => ({
      id: r.id,
      kind: "message",
      contentType: "message",
      contentId: r.contentId,
      reporter: r.reporter,
      reason: r.reason,
      context: r.context,
      detail: null,
      createdAt: r.createdAt,
    }));
    const content = contentReports.map<QueueItem>((r) => ({
      id: r.id,
      kind: "content",
      contentType: r.contentType as QueueItem["contentType"],
      contentId: r.contentId,
      reporter: r.reporter,
      reason: r.reason,
      context: "",
      detail: r.detail,
      createdAt: r.createdAt,
    }));
    return [...messages, ...content].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [contentReports, messageReports]);

  const filtered = items.filter((item) => {
    if (tab === "messages") return item.kind === "message";
    if (tab === "content") return item.kind === "content";
    return true;
  });

  async function moderate(item: QueueItem, action: "dismiss" | "delete" | "warn" | "ban", why?: string) {
    setBusy(item.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/moderation/${item.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contentType: item.contentType,
          contentId: item.contentId,
          action,
          reason: why || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't complete that action.");
      toast({
        title:
          action === "dismiss"
            ? "Report dismissed"
            : action === "delete"
              ? "Content removed"
              : action === "warn"
                ? "Warning issued"
                : "User suspended",
        description: "The moderation action was written to the audit log.",
        tone: "success",
      });
      setPending(null);
      setReason("");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't complete that action.";
      setError(message);
      toast({ title: "Action failed", description: message, tone: "error" });
    } finally {
      setBusy(null);
    }
  }

  function ask(item: QueueItem, action: PendingAction["action"]) {
    setPending({ item, action });
    setReason("");
    setError(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onChange={(value) => setTab(value as typeof tab)}
          items={[
            { value: "all", label: "All reports", count: items.length },
            { value: "messages", label: "Messages", count: messageReports.length },
            { value: "content", label: "Content", count: contentReports.length },
          ]}
        />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[10px] font-semibold text-muted">
          <Clock3 size={11} className="text-primary" /> 24 hour response target
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="vz-panel flex flex-col items-center px-6 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-success/10 text-success">
            <ShieldCheck size={22} />
          </span>
          <h3 className="mt-3 text-sm font-bold">The queue is clear</h3>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">
            No open reports here. New reports appear the moment someone flags a message or campus
            resource.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((item) => (
            <article key={`${item.kind}-${item.id}`} className="vz-panel overflow-hidden">
              <div className="flex flex-col gap-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "grid size-8 place-items-center rounded-xl",
                      item.kind === "message"
                        ? "bg-primary/10 text-primary"
                        : "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
                    )}
                  >
                    {item.kind === "message" ? <MessageSquare size={15} /> : <Mail size={15} />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold">{CONTENT_LABEL[item.contentType]}</p>
                    <p className="flex items-center gap-1 text-[9.5px] text-muted">
                      Reported by {item.reporter}
                      <span>·</span>
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Badge
                    tone={REASON_TONE[item.reason] ?? "neutral"}
                    className="ml-auto normal-case tracking-normal"
                  >
                    <Flag size={9} /> {item.reason.replace("_", " ")}
                  </Badge>
                </div>

                <div className="rounded-xl border border-border bg-[var(--vz-card-2)] p-3">
                  <p className="text-[11.5px] leading-relaxed">
                    {item.context || item.detail || "No additional context was provided."}
                  </p>
                  {item.detail && item.context ? (
                    <p className="mt-1 text-[10px] leading-relaxed text-muted">{item.detail}</p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy === item.id}
                    onClick={() => moderate(item, "dismiss")}
                  >
                    <Check size={12} /> Dismiss
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy === item.id}
                    onClick={() => ask(item, "delete")}
                  >
                    <Trash2 size={12} /> Remove
                  </Button>
                  <Button
                    size="sm"
                    variant="soft"
                    disabled={busy === item.id}
                    onClick={() => ask(item, "warn")}
                  >
                    <AlertTriangle size={12} /> Warn
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger hover:bg-danger/10 hover:text-danger"
                    disabled={busy === item.id}
                    onClick={() => ask(item, "ban")}
                  >
                    <Ban size={12} /> Suspend
                  </Button>
                  <span className="ml-auto inline-flex items-center gap-1 text-[9px] text-muted-2">
                    <UserRound size={9} /> {item.contentId.slice(0, 8)} <ChevronRight size={9} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="vz-panel vz-soft-gradient p-4">
        <div className="flex items-start gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck size={15} />
          </span>
          <div>
            <p className="text-[11.5px] font-bold">Moderator notes</p>
            <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">
              Every action is written to the audit log. Warnings are cumulative — three warnings
              automatically suspend the account. Alias reveals require a reason and are audited
              separately.
            </p>
          </div>
        </div>
      </div>

      <Modal
        open={pending !== null}
        onClose={() => {
          if (busy) return;
          setPending(null);
          setError(null);
        }}
        title={
          pending?.action === "delete"
            ? "Remove this content?"
            : pending?.action === "warn"
              ? "Issue a warning"
              : "Suspend this account"
        }
        description={
          pending?.action === "delete"
            ? "This hides the content and marks the report as actioned. It is logged."
            : "Add a short reason so the decision is clear in the audit log."
        }
      >
        {pending ? (
          <div className="flex flex-col gap-3">
            <p className="rounded-xl border border-border bg-[var(--vz-card-2)] p-3 text-[11px] leading-relaxed">
              {pending.item.context || pending.item.detail || CONTENT_LABEL[pending.item.contentType]}
            </p>
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                {pending.action === "delete" ? "Note (optional)" : "Reason"}
              </p>
              <Textarea
                rows={3}
                maxLength={300}
                autoFocus={pending.action !== "delete"}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  pending.action === "delete"
                    ? "Optional context for the audit log…"
                    : "Why is this action being taken?"
                }
              />
            </div>
            {error ? <p className="text-[11px] font-medium text-danger">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPending(null)} disabled={!!busy}>
                Cancel
              </Button>
              <Button
                variant={pending.action === "warn" ? "primary" : "danger"}
                disabled={!!busy || (pending.action !== "delete" && !reason.trim())}
                onClick={() => moderate(pending.item, pending.action, reason)}
              >
                {busy
                  ? "Working…"
                  : pending.action === "delete"
                    ? "Remove content"
                    : pending.action === "warn"
                      ? "Issue warning"
                      : "Suspend account"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
