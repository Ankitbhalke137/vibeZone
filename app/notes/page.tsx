"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, ArrowUpDown, Upload, ExternalLink, ThumbsUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, FormError, Input, Label } from "@/components/ui/form";
import { Avatar } from "@/components/avatar";
import { DmButton } from "@/components/dm-button";

const TYPES = ["All", "Notes", "PYQ", "Lab", "Slides", "Other"];
const BRANCHES = ["All", "CSE", "IT", "ECE", "EEE", "ME", "CE", "Other"];
const YEARS = ["All", "1", "2", "3", "4"];

type Note = {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  branch: string;
  year: number | null;
  semester: number | null;
  type: string;
  externalLink: string;
  openCount: number;
  voteCount: number;
  uploadedBy: string;
  uploadedByHandle: string;
  createdAt: string;
};

type Me = { id: string; handle: string; name: string } | null;

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [me, setMe] = useState<Me>(null);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [branch, setBranch] = useState("All");
  const [year, setYear] = useState("All");
  const [type, setType] = useState("All");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Submit form state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [openDraft, setOpenDraft] = useState(false);
  const [draft, setDraft] = useState<{
    title: string;
    description: string;
    subject: string;
    branch: string;
    year: number;
    type: "Notes" | "PYQ" | "Lab" | "Slides" | "Other";
    externalLink: string;
  }>({
    title: "",
    description: "",
    subject: "",
    branch: "CSE",
    year: 1,
    type: "Notes",
    externalLink: "",
  });

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (subject) params.set("subject", subject);
      if (branch !== "All") params.set("branch", branch);
      if (year !== "All") params.set("year", year);
      if (type !== "All") params.set("type", type);
      params.set("sort", sort);

      const res = await fetch(`/api/notes?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load notes.");
      const data = await res.json();
      setNotes(data.notes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes.");
    } finally {
      setLoading(false);
    }
  }, [search, subject, branch, year, type, sort]);

  useEffect(() => {
    fetchNotes();
    fetch("/api/me", { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then((d) => setMe(d?.user ?? null));
  }, [fetchNotes]);

  const handleSort = (s: string) => { setSort(s as any); };
  const myVoteSet = new Set<string>();

  async function submitNote(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...draft, year: Number(draft.year) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't submit note.");
      setOpenDraft(false);
      setDraft({ title: "", description: "", subject: "", branch: "CSE", year: 1, type: "Notes", externalLink: "" });
      void fetchNotes();
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Couldn't submit note.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleVote(noteId: string, idx: number) {
    if (!me) return router.push("/login");
    try {
      const res = await fetch(`/api/notes/${noteId}/vote`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Vote failed.");
      setNotes((cur) => cur.map((n) => n.id === noteId ? { ...n, voteCount: data.voteCount } : n));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vote failed.");
    }
  }

  async function openLink(noteId: string, url: string) {
    try {
      await fetch(`/api/notes/${noteId}/open`, { method: "POST" });
      window.open(url, "_blank");
    } catch {
      window.open(url, "_blank");
    }
  }

  return (
    <div className="mx-auto max-w-3xl py-6">
      <nav className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Notes & Resources</h1>
          <p className="text-sm text-muted">Subject-wise study links shared by students.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setOpenDraft(true)} disabled={!me}>
            <Upload size={14} aria-hidden /> {me ? "Add Resource" : "Sign in to add"}
          </Button>
        </div>
      </nav>

      {error ? <FormError message={error} /> : null}

      <div className="rounded-2xl border border-border bg-card p-4 mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <Input
            placeholder="Search title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-auto min-w-[140px] text-sm"
          />
          <select value={branch} onChange={(e) => setBranch(e.target.value)} className="flex h-9 w-24 rounded-lg border border-border bg-background px-2 text-xs outline-none">
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="flex h-9 w-16 rounded-lg border border-border bg-background px-2 text-xs outline-none">
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="flex h-9 w-24 rounded-lg border border-border bg-background px-2 text-xs outline-none">
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <Button size="sm" variant="secondary" onClick={() => handleSort(sort === "newest" ? "top" : "newest")}>
            <ArrowUpDown size={14} aria-hidden /> {sort}
          </Button>
        </div>
        {subject && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Subject:</span>
            <span className="text-xs font-medium truncate max-w-xs">{subject}</span>
            <button type="button" onClick={() => setSubject("")} className="text-[10px] text-muted hover:text-foreground">×</button>
          </div>
        )}
        <div className="mt-3 flex items-center gap-2">
          <label className="text-xs text-muted cursor-pointer select-none">
            <Input type="checkbox" checked={!!subject} onChange={() => setSubject(subject ? "" : "CSE")} className="mr-1.5" />
            Filter by subject
          </label>
          <Input placeholder="e.g. DSA, OS, DBMS" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-40 text-sm" disabled={!subject} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 mb-6">
        <form onSubmit={submitNote} className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-0">
              <Label>Title</Label>
              <Input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <div className="w-40">
              <Label>Type</Label>
              <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as "Notes" | "PYQ" | "Lab" | "Slides" | "Other" })} className="w-full h-10 rounded-lg border border-border bg-card px-2 text-xs outline-none">
                {["Notes", "PYQ", "Lab", "Slides", "Other"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="w-32">
              <Label>Branch</Label>
              <select value={draft.branch} onChange={(e) => setDraft({ ...draft, branch: e.target.value })} className="w-full h-10 rounded-lg border border-border bg-card px-2 text-xs outline-none">
                {BRANCHES.slice(1).map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label>Subject</Label>
            <Input required placeholder="e.g. Data Structures" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label>Description (optional)</Label>
              <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="w-full h-16 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none" rows={2} />
            </div>
            <div className="w-64">
              <Label>Year</Label>
              <select value={String(draft.year)} onChange={(e) => setDraft({ ...draft, year: Number(e.target.value) })} className="w-full h-10 rounded-lg border border-border bg-card px-2 text-xs outline-none">
                {[1, 2, 3, 4].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label>External Link (https:// Google Drive, etc.)</Label>
            <Input required placeholder="https://drive.google.com/…" value={draft.externalLink} onChange={(e) => setDraft({ ...draft, externalLink: e.target.value })} />
          </div>
          {formError ? <FormError message={formError} /> : null}
          <Button type="submit" disabled={submitting || !me || !draft.title || !draft.subject || !draft.externalLink}>
            {submitting ? "Submitting…" : "Publish Resource"}
          </Button>
          {!me && <p className="text-[11px] text-muted">Sign in to submit resources.</p>}
        </form>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-muted">Loading notes…</div>
      ) : notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center text-sm text-muted">
          No resources yet. Be the first to share one.
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {notes.map((n) => (
            <li key={n.id} className="flex items-start gap-3 p-3 hover:bg-accent/50 transition rounded-xl cursor-pointer group">
              <Avatar name={n.uploadedBy} handle={n.uploadedByHandle} avatarUrl={null} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="inline-flex items-center gap-0.5 rounded-full border border-transparent px-1.5 py-0.5 text-[10px] font-semibold bg-accent text-primary">{n.type}</span>
                  <span className="text-[10px] text-muted">{n.branch} Y{n.year ?? "?"}</span>
                </div>
                <h3 className="font-semibold leading-snug">{n.title}</h3>
                {n.description ? <p className="mt-0.5 text-xs text-muted line-clamp-2">{n.description}</p> : null}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-muted">
                    <ThumbsUp size={12} aria-hidden /> {n.voteCount}
                    <span className="text-xs">·</span>
                    <ExternalLink size={12} aria-hidden /> {n.openCount} opened
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); void toggleVote(n.id, 0); }}
                      className="text-[10px] text-muted hover:text-primary"
                    >
                      Upvote
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); void openLink(n.id, n.externalLink); }}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[11px] hover:bg-accent transition"
                    >
                      Open <ChevronRight size={12} aria-hidden />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-[10px] text-muted">by {n.uploadedBy} · {new Date(n.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
