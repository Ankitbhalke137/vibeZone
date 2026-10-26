"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Pin, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, FormError, Input, Label } from "@/components/ui/form";
import { CategoryBadge } from "@/components/announcement-card";

const CATEGORIES = ["Academic", "Events", "Placements", "Hostel", "Clubs", "Urgent"] as const;

type Row = {
  id: string;
  title: string;
  category: string;
  pinned: boolean;
  notify: boolean;
  archived: boolean;
  publishAt: string;
  expiresAt: string | null;
  viewCount: number;
  clickCount: number;
  authorHandle: string;
};

type Draft = {
  title: string;
  body: string;
  category: string;
  pinned: boolean;
  notify: boolean;
  publishAt: string; // datetime-local value ("" = now)
  expiresAt: string;
};

const EMPTY: Draft = {
  title: "",
  body: "",
  category: "Academic",
  pinned: false,
  notify: false,
  publishAt: "",
  expiresAt: "",
};

const toLocalInput = (iso: string) => iso.slice(0, 16);

export function AnnouncementManager({ items }: { items: Row[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  function startEdit(row: Row) {
    setEditingId(row.id);
    setDraft({
      title: row.title,
      body: "", // body isn't listed — edits require re-pasting the full body
      category: row.category,
      pinned: row.pinned,
      notify: row.notify,
      publishAt: toLocalInput(row.publishAt),
      expiresAt: row.expiresAt ? toLocalInput(row.expiresAt) : "",
    });
    setOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        title: draft.title,
        category: draft.category,
        pinned: draft.pinned,
        notify: draft.notify,
        publishAt: draft.publishAt ? new Date(draft.publishAt).toISOString() : undefined,
        expiresAt: draft.expiresAt ? new Date(draft.expiresAt).toISOString() : null,
      };
      if (draft.body.trim()) payload.body = draft.body;

      const url = editingId ? `/api/admin/announcements/${editingId}` : "/api/admin/announcements";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't save.");

      setDraft(EMPTY);
      setEditingId(null);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleArchive(row: Row) {
    await fetch(`/api/admin/announcements/${row.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ archived: !row.archived }),
    }).catch(() => {});
    router.refresh();
  }

  async function togglePin(row: Row) {
    await fetch(`/api/admin/announcements/${row.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pinned: !row.pinned }),
    }).catch(() => {});
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      {!open ? (
        <Button className="self-start" onClick={() => { setEditingId(null); setDraft(EMPTY); setOpen(true); }}>
          <Plus size={16} aria-hidden /> New announcement
        </Button>
      ) : (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {editingId ? "Edit announcement" : "New announcement"}
            </h2>
            <button
              type="button"
              aria-label="Close composer"
              onClick={() => { setOpen(false); setEditingId(null); setError(null); }}
              className="text-muted hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={save} className="flex flex-col gap-3">
            <div>
              <Label htmlFor="ann-title">Title</Label>
              <Input
                id="ann-title"
                required
                minLength={3}
                maxLength={160}
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="ann-body">
                Body {editingId && <span className="text-[10px]">(edit requires full body)</span>}
              </Label>
              <textarea
                id="ann-body"
                required={!editingId}
                rows={5}
                maxLength={20_000}
                placeholder="Plain text or simple HTML — <b>, <i>, <p>, <ul>, <a> are kept; everything else is stripped."
                className="flex w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={draft.body}
                onChange={(e) => set("body", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <Label htmlFor="ann-cat">Category</Label>
                <select
                  id="ann-cat"
                  value={draft.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="ann-pub">Publish at</Label>
                <input
                  id="ann-pub"
                  type="datetime-local"
                  value={draft.publishAt}
                  onChange={(e) => set("publishAt", e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <Label htmlFor="ann-exp">Expires at</Label>
                <input
                  id="ann-exp"
                  type="datetime-local"
                  value={draft.expiresAt}
                  onChange={(e) => set("expiresAt", e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col justify-end gap-2 pb-1">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={draft.pinned}
                    onChange={(e) => set("pinned", e.target.checked)}
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  Pin to top
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={draft.notify}
                    onChange={(e) => set("notify", e.target.checked)}
                    className="size-4 accent-[var(--color-primary)]"
                    disabled
                  />
                  <span className="text-muted">Notify (Week 4 scheduler)</span>
                </label>
              </div>
            </div>

            <FormError message={error} />
            <div className="flex gap-2">
              <Button type="submit" disabled={busy}>
                <Save size={15} aria-hidden /> {busy ? "Saving…" : editingId ? "Save changes" : "Publish"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setOpen(false); setEditingId(null); }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <section className="rounded-2xl border border-border bg-card">
        <h2 className="border-b border-border px-4 py-3 text-sm font-semibold">
          All announcements ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted">Nothing yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center gap-2 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${row.archived ? "text-muted line-through" : ""}`}>
                    {row.title}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                    <CategoryBadge category={row.category} />
                    <span>👁 {row.viewCount} · clicks {row.clickCount}</span>
                    <span>by @{row.authorHandle}</span>
                    <span>{new Date(row.publishAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    {row.pinned ? <span className="font-semibold text-primary">pinned</span> : null}
                    {row.archived ? <span className="font-semibold text-danger">archived</span> : null}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title={row.pinned ? "Unpin" : "Pin"}
                    onClick={() => togglePin(row)}
                    className={`grid size-8 place-items-center rounded-lg border border-border transition hover:bg-accent ${row.pinned ? "text-primary" : "text-muted"}`}
                  >
                    <Pin size={14} />
                  </button>
                  <button
                    type="button"
                    title={row.archived ? "Restore" : "Archive"}
                    onClick={() => toggleArchive(row)}
                    className="grid size-8 place-items-center rounded-lg border border-border text-muted transition hover:bg-accent"
                  >
                    {row.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                  </button>
                  <Button size="sm" variant="secondary" onClick={() => startEdit(row)}>
                    Edit
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
