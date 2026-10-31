"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  ArrowUpDown,
  BookOpen,
  ExternalLink,
  Loader2,
  Plus,
  Search,
  ThumbsUp,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { FormError, Input, Label, Select, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

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

type Me = { id: string; name: string; handle: string } | null;

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-xs text-muted">Loading notes…</div>}>
      <NotesView />
    </Suspense>
  );
}

function NotesView() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();

  const [notes, setNotes] = useState<Note[]>([]);
  const [me, setMe] = useState<Me>(null);
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [branch, setBranch] = useState("All");
  const [year, setYear] = useState("All");
  const [type, setType] = useState("All");
  const [sort, setSort] = useState<"newest" | "top">("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (search) qs.set("search", search);
      if (branch !== "All") qs.set("branch", branch);
      if (year !== "All") qs.set("year", year);
      if (type !== "All") qs.set("type", type);
      qs.set("sort", sort);

      const res = await fetch(`/api/notes?${qs.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load notes.");
      const data = await res.json();
      setNotes(data.notes as Note[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes.");
    } finally {
      setLoading(false);
    }
  }, [search, branch, year, type, sort]);

  useEffect(() => {
    const t = window.setTimeout(() => void fetchNotes(), 220);
    return () => window.clearTimeout(t);
  }, [fetchNotes]);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMe(d?.user ?? null))
      .catch(() => {});
  }, []);

  async function toggleVote(note: Note) {
    if (!me) return router.push("/login?next=/notes");
    try {
      const res = await fetch(`/api/notes/${note.id}/vote`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Vote failed.");
      setNotes((cur) => cur.map((n) => (n.id === note.id ? { ...n, voteCount: data.voteCount } : n)));
      toast({ title: "Upvoted — thanks for helping campus", tone: "success" });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Vote failed.", tone: "error" });
    }
  }

  async function openLink(note: Note) {
    void fetch(`/api/notes/${note.id}/open`, { method: "POST" }).catch(() => {});
    setNotes((cur) => cur.map((n) => (n.id === note.id ? { ...n, openCount: n.openCount + 1 } : n)));
    window.open(note.externalLink, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Knowledge base"
        title="Notes & resources"
        description="Subject-wise notes, PYQs, labs and slides shared by students and seniors."
        actions={
          <Button onClick={() => setOpenForm(true)} size="sm">
            <Plus size={14} /> Share resource
          </Button>
        }
      />

      <section className="vz-panel flex flex-col gap-2 p-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, subject…"
            aria-label="Search notes"
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-xs outline-none transition placeholder:text-muted-2 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Select value={branch} onChange={(e) => setBranch(e.target.value)} className="h-9 w-auto text-[11px]" aria-label="Branch">
            {BRANCHES.map((b) => <option key={b} value={b}>{b === "All" ? "All branches" : b}</option>)}
          </Select>
          <Select value={year} onChange={(e) => setYear(e.target.value)} className="h-9 w-auto text-[11px]" aria-label="Year">
            {YEARS.map((y) => <option key={y} value={y}>{y === "All" ? "All years" : `Year ${y}`}</option>)}
          </Select>
          <Select value={type} onChange={(e) => setType(e.target.value)} className="h-9 w-auto text-[11px]" aria-label="Type">
            {TYPES.map((t) => <option key={t} value={t}>{t === "All" ? "All types" : t}</option>)}
          </Select>
          <button
            type="button"
            onClick={() => setSort(sort === "newest" ? "top" : "newest")}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-card px-2.5 text-[11px] font-semibold text-muted transition hover:text-foreground"
          >
            <ArrowUpDown size={12} /> {sort === "newest" ? "Newest" : "Top"}
          </button>
        </div>
      </section>

      {error ? <FormError message={error} /> : null}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="vz-panel space-y-2 p-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={20} />}
          title="No resources found"
          description={
            search || branch !== "All" || year !== "All" || type !== "All"
              ? "Try clearing a filter or searching for a broader subject."
              : "Be the first to share notes, PYQs or lab material with campus."
          }
          action={{ label: "Share a resource", onClick: () => setOpenForm(true) }}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {notes.map((n) => (
            <article key={n.id} className="vz-panel vz-card-hover group flex flex-col p-4">
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
                  {n.type}
                </span>
                <span className="text-[9px] font-medium text-muted-2">
                  {n.branch} · Y{n.year ?? "?"}
                </span>
                <span className="ml-auto inline-flex items-center gap-0.5 text-[9px] text-muted">
                  <ExternalLink size={9} /> {n.openCount}
                </span>
              </div>

              <h3 className="mt-2 line-clamp-2 text-[13px] font-bold leading-snug transition group-hover:text-primary">
                {n.title}
              </h3>
              {n.description ? (
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted">{n.description}</p>
              ) : null}
              <p className="mt-1.5 text-[10px] font-medium text-primary/80">{n.subject}</p>

              <div className="mt-auto flex items-center gap-2 border-t border-[var(--vz-border-soft)] pt-2.5">
                <Avatar name={n.uploadedBy} handle={n.uploadedByHandle} size="xs" />
                <span className="min-w-0 flex-1 truncate text-[9.5px] text-muted">
                  {n.uploadedBy} · {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
                <button
                  type="button"
                  onClick={() => void toggleVote(n)}
                  className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-[10px] font-semibold text-muted transition hover:bg-accent hover:text-primary"
                  aria-label={`Upvote ${n.title}`}
                >
                  <ThumbsUp size={11} /> {n.voteCount}
                </button>
                <button
                  type="button"
                  onClick={() => void openLink(n)}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary transition hover:bg-primary/15"
                >
                  Open <ArrowUpRight size={10} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <NoteForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        signedIn={Boolean(me)}
        onSaved={() => {
          setOpenForm(false);
          void fetchNotes();
          router.refresh();
        }}
      />
    </div>
  );
}

function NoteForm({
  open,
  onClose,
  signedIn,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  signedIn: boolean;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    branch: "CSE",
    year: 1,
    type: "Notes",
    external_link: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, year: Number(form.year) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't submit note.");
      toast({ title: "Resource shared", tone: "success" });
      setForm({ title: "", description: "", subject: "", branch: "CSE", year: 1, type: "Notes", external_link: "" });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit note.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share a resource"
      description="Notes, PYQs, labs or slides — add a secure https link."
    >
      {!signedIn ? (
        <div className="flex flex-col gap-3 text-center">
          <p className="text-xs text-muted">Sign in with your campus email to share resources.</p>
          <Button onClick={() => { window.location.href = "/login?next=/notes"; }}>Sign in</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <Label htmlFor="n-title">Title</Label>
            <Input
              id="n-title"
              required
              minLength={3}
              maxLength={160}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Graphs & DP — complete handout"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="n-subject">Subject</Label>
              <Input
                id="n-subject"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="DSA"
              />
            </div>
            <div>
              <Label htmlFor="n-branch">Branch</Label>
              <Select id="n-branch" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
                {BRANCHES.slice(1).map((b) => <option key={b}>{b}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="n-year">Year</Label>
              <Select
                id="n-year"
                value={String(form.year)}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
              >
                {[1, 2, 3, 4].map((y) => <option key={y} value={y}>{y}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-[1fr_120px] gap-2">
            <div>
              <Label htmlFor="n-link">Link</Label>
              <Input
                id="n-link"
                required
                type="url"
                pattern="https://.*"
                value={form.external_link}
                onChange={(e) => setForm({ ...form, external_link: e.target.value })}
                placeholder="https://drive.google.com/…"
              />
            </div>
            <div>
              <Label htmlFor="n-type">Type</Label>
              <Select id="n-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.slice(1).map((t) => <option key={t}>{t}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="n-desc">Description (optional)</Label>
            <Textarea
              id="n-desc"
              rows={3}
              maxLength={500}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <FormError message={error} />
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
            {busy ? "Publishing…" : "Publish resource"}
          </Button>
        </form>
      )}
    </Modal>
  );
}
