"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  Inbox,
  LockKeyhole,
  MessageSquareText,
  RotateCcw,
  StickyNote,
} from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

export type FeedbackRow = {
  id: string;
  category: string;
  message: string;
  year: number | null;
  branch: string | null;
  status: string;
  internalNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewer: string | null;
};

const STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  open: { label: "Open", tone: "amber" },
  in_review: { label: "In review", tone: "violet" },
  resolved: { label: "Resolved", tone: "green" },
};

const CATEGORY_TONE: Record<string, BadgeTone> = {
  Academic: "violet",
  Facilities: "cyan",
  Hostel: "green",
  Clubs: "magenta",
  Other: "neutral",
};

export function FeedbackManager({ initial }: { initial: FeedbackRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState<"all" | "open" | "in_review" | "resolved">("open");
  const [editing, setEditing] = useState<FeedbackRow | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      all: items.length,
      open: items.filter((item) => item.status === "open").length,
      in_review: items.filter((item) => item.status === "in_review").length,
      resolved: items.filter((item) => item.status === "resolved").length,
    }),
    [items],
  );

  const visible = tab === "all" ? items : items.filter((item) => item.status === tab);

  async function update(item: FeedbackRow, body: Record<string, unknown>) {
    setBusy(item.id);
    try {
      const res = await fetch(`/api/admin/feedback/${item.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't update feedback.");
      setItems((current) =>
        current.map((row) =>
          row.id === item.id
            ? {
                ...row,
                ...(body.status ? { status: String(body.status) } : {}),
                ...(body.internalNote !== undefined
                  ? { internalNote: body.internalNote as string | null }
                  : {}),
              }
            : row,
        ),
      );
      toast({ title: "Feedback updated", tone: "success" });
      router.refresh();
    } catch (err) {
      toast({
        title: "Couldn't update feedback",
        description: err instanceof Error ? err.message : "Try again.",
        tone: "error",
      });
    } finally {
      setBusy(null);
    }
  }

  async function saveNote(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    await update(editing, { internalNote: note.trim() || null });
    setEditing(null);
    setNote("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onChange={(value) => setTab(value as typeof tab)}
          items={[
            { value: "open", label: "Open", count: counts.open },
            { value: "in_review", label: "In review", count: counts.in_review },
            { value: "resolved", label: "Resolved", count: counts.resolved },
            { value: "all", label: "All", count: counts.all },
          ]}
        />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[10px] font-semibold text-muted">
          <LockKeyhole size={11} className="text-success" /> Anonymous · admin only
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="vz-panel flex flex-col items-center px-6 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Inbox size={22} />
          </span>
          <h3 className="mt-3 text-sm font-bold">Nothing in this view</h3>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">
            {tab === "open"
              ? "There are no unreviewed submissions. New anonymous feedback will appear here."
              : "Feedback will appear here once it reaches this status."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {visible.map((item) => {
            const status = STATUS[item.status] ?? STATUS.open;
            return (
              <article key={item.id} className="vz-panel flex flex-col p-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone={CATEGORY_TONE[item.category] ?? "neutral"} className="normal-case tracking-normal">
                    {item.category}
                  </Badge>
                  <Badge tone={status.tone} className="normal-case tracking-normal">
                    {status.label}
                  </Badge>
                  <span className="ml-auto text-[9px] text-muted-2">
                    {new Date(item.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <p className="mt-2.5 whitespace-pre-wrap text-[12px] leading-relaxed">{item.message}</p>

                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[9.5px] text-muted">
                  {item.year ? <span>Year {item.year}</span> : <span>Year not shared</span>}
                  {item.branch ? (
                    <>
                      <span>·</span>
                      <span>{item.branch}</span>
                    </>
                  ) : null}
                  <span>·</span>
                  <span className="inline-flex items-center gap-0.5">
                    <LockKeyhole size={8} /> no identity stored
                  </span>
                </div>

                {item.internalNote ? (
                  <div className="mt-2.5 rounded-xl border border-primary/15 bg-primary/5 p-2.5">
                    <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-primary">
                      <StickyNote size={9} /> Internal note
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap text-[10.5px] leading-relaxed text-muted">
                      {item.internalNote}
                    </p>
                  </div>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-2.5">
                  {item.status === "open" ? (
                    <Button
                      size="sm"
                      variant="soft"
                      disabled={busy === item.id}
                      onClick={() => update(item, { status: "in_review" })}
                    >
                      <Clock3 size={12} /> Start review
                    </Button>
                  ) : null}
                  {item.status !== "resolved" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy === item.id}
                      onClick={() => update(item, { status: "resolved" })}
                    >
                      <CheckCircle2 size={12} /> Resolve
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy === item.id}
                      onClick={() => update(item, { status: "open" })}
                    >
                      <RotateCcw size={12} /> Reopen
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy === item.id}
                    onClick={() => {
                      setEditing(item);
                      setNote(item.internalNote ?? "");
                    }}
                  >
                    <MessageSquareText size={12} /> {item.internalNote ? "Edit note" : "Add note"}
                  </Button>
                  {item.reviewer ? (
                    <span className="ml-auto text-[8.5px] text-muted-2">@{item.reviewer}</span>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Internal note"
        description="Visible only to admins. Never attached to the submitter's account."
      >
        {editing ? (
          <form onSubmit={saveNote} className="flex flex-col gap-3">
            <p className="line-clamp-3 rounded-xl border border-border bg-[var(--vz-card-2)] p-3 text-[11px] leading-relaxed text-muted">
              {editing.message}
            </p>
            <Textarea
              rows={5}
              maxLength={2000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did the team decide, follow up on, or escalate?"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy === editing.id}>
                {busy === editing.id ? "Saving…" : "Save note"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
