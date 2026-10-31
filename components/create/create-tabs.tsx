"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  FileUp,
  Loader2,
  PackageSearch,
  PenLine,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError, Input, Label, Select, Textarea } from "@/components/ui/form";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { PostComposer } from "@/components/feed/post-composer";

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "ME", "CE", "Other"];
const NOTE_TYPES = ["Notes", "PYQ", "Lab", "Slides", "Other"] as const;

type Viewer = {
  id: string;
  name: string;
  handle: string;
  role: string;
  avatarUrl: string | null;
};

export function CreateTabs({
  viewer,
  initialTab,
}: {
  viewer: Viewer;
  initialTab: "post" | "note" | "lost";
}) {
  const [tab, setTab] = useState(initialTab);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-3">
        <Tabs
          items={[
            { value: "post", label: <span className="inline-flex items-center gap-1"><PenLine size={12} /> Post</span> },
            { value: "note", label: <span className="inline-flex items-center gap-1"><FileUp size={12} /> Notes</span> },
            { value: "lost", label: <span className="inline-flex items-center gap-1"><PackageSearch size={12} /> Lost & found</span> },
          ]}
          value={tab}
          onChange={(value) => setTab(value as typeof tab)}
        />

        {tab === "post" ? (
          <PostComposer viewer={viewer} autoFocus placeholder="Share a win, ask campus a question, or post an update…" />
        ) : tab === "note" ? (
          <NoteForm />
        ) : (
          <LostFoundForm />
        )}
      </div>

      <aside className="flex flex-col gap-3">
        <section className="vz-panel vz-soft-gradient p-4">
          <div className="flex items-center gap-2 text-[12px] font-bold">
            <Sparkles size={14} className="text-primary" /> Make it useful
          </div>
          <ul className="mt-2.5 flex flex-col gap-2">
            {[
              "Add a clear title or opening line.",
              "Tag the subject, branch or topic so people can find it.",
              "Use https links for images and resources.",
              "Be kind — campus is a small place.",
            ].map((tip) => (
              <li key={tip} className="flex gap-2 text-[11px] leading-relaxed text-muted">
                <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-success" />
                {tip}
              </li>
            ))}
          </ul>
        </section>

        <section className="vz-panel p-4">
          <div className="flex items-center gap-2 text-[12px] font-bold">
            <BookOpen size={14} className="text-primary" /> Looking for something?
          </div>
          <div className="mt-2 flex flex-col gap-1.5 text-[11px]">
            <Link href="/notes" className="text-muted transition hover:text-primary">Browse shared notes →</Link>
            <Link href="/lost-and-found" className="text-muted transition hover:text-primary">See Lost &amp; Found board →</Link>
            <Link href="/events" className="text-muted transition hover:text-primary">Check upcoming events →</Link>
          </div>
        </section>
      </aside>
    </div>
  );
}

function NoteForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    branch: "CSE",
    year: 1,
    type: "Notes" as (typeof NOTE_TYPES)[number],
    externalLink: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          subject: form.subject,
          branch: form.branch,
          year: Number(form.year),
          type: form.type,
          external_link: form.externalLink,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't submit note.");
      toast({ title: "Resource shared", tone: "success" });
      setForm({ title: "", description: "", subject: "", branch: "CSE", year: 1, type: "Notes", externalLink: "" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit note.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="vz-panel flex flex-col gap-3 p-5">
      <div>
        <h2 className="text-sm font-bold">Share a resource</h2>
        <p className="mt-0.5 text-[11px] text-muted">Notes, PYQs, labs or slides — linked from anywhere secure.</p>
      </div>

      <div>
        <Label htmlFor="note-title">Title</Label>
        <Input
          id="note-title"
          required
          minLength={3}
          maxLength={160}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Graphs & DP — complete handout"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="note-subject">Subject</Label>
          <Input
            id="note-subject"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="DSA"
          />
        </div>
        <div>
          <Label htmlFor="note-branch">Branch</Label>
          <Select id="note-branch" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
            {BRANCHES.map((b) => <option key={b}>{b}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="note-year">Year</Label>
          <Select
            id="note-year"
            value={String(form.year)}
            onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
          >
            {[1, 2, 3, 4].map((y) => <option key={y} value={y}>{y}</option>)}
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <div>
          <Label htmlFor="note-link">Resource link</Label>
          <Input
            id="note-link"
            required
            type="url"
            pattern="https://.*"
            value={form.externalLink}
            onChange={(e) => setForm({ ...form, externalLink: e.target.value })}
            placeholder="https://drive.google.com/…"
          />
        </div>
        <div>
          <Label htmlFor="note-type">Type</Label>
          <Select
            id="note-type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as (typeof NOTE_TYPES)[number] })}
          >
            {NOTE_TYPES.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="note-desc">Description (optional)</Label>
        <Textarea
          id="note-desc"
          rows={3}
          maxLength={500}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="What's inside, and who it helps…"
        />
      </div>

      <FormError message={error} />
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] text-muted">Links must start with https://</p>
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />}
          {busy ? "Publishing…" : "Publish resource"}
        </Button>
      </div>
    </form>
  );
}

function LostFoundForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    itemName: "",
    description: "",
    type: "lost" as "lost" | "found",
    location: "",
    contactInfo: "",
    imageUrl: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/lost-and-found", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          itemName: form.itemName,
          description: form.description,
          type: form.type,
          location: form.location || undefined,
          contactInfo: form.contactInfo || undefined,
          imageUrl: form.imageUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't post item.");
      toast({ title: "Item posted", description: "Campus can now help track it down.", tone: "success" });
      setForm({ itemName: "", description: "", type: "lost", location: "", contactInfo: "", imageUrl: "" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't post item.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="vz-panel flex flex-col gap-3 p-5">
      <div>
        <h2 className="text-sm font-bold">Post a lost or found item</h2>
        <p className="mt-0.5 text-[11px] text-muted">Add enough detail for someone to recognise it.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
        <div>
          <Label htmlFor="item-name">Item name</Label>
          <Input
            id="item-name"
            required
            maxLength={120}
            value={form.itemName}
            onChange={(e) => setForm({ ...form, itemName: e.target.value })}
            placeholder="Black earbuds case"
          />
        </div>
        <div>
          <Label htmlFor="item-type">Type</Label>
          <Select
            id="item-type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as "lost" | "found" })}
          >
            <option value="lost">I lost it</option>
            <option value="found">I found it</option>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="item-desc">Description</Label>
        <Textarea
          id="item-desc"
          required
          rows={3}
          maxLength={2000}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Colour, brand, distinguishing marks, where you last saw it…"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="item-location">Location</Label>
          <Input
            id="item-location"
            maxLength={120}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Near the library"
          />
        </div>
        <div>
          <Label htmlFor="item-contact">Contact (optional)</Label>
          <Input
            id="item-contact"
            maxLength={120}
            value={form.contactInfo}
            onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
            placeholder="How to reach you"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="item-image">Image URL (optional)</Label>
        <Input
          id="item-image"
          type="url"
          pattern="https://.*"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          placeholder="https://…"
        />
      </div>

      <FormError message={error} />
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] text-muted">Only post items you actually have or lost.</p>
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <PackageSearch size={14} />}
          {busy ? "Posting…" : "Post item"}
        </Button>
      </div>
    </form>
  );
}
