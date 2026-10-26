"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Upload, CheckCircle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, FormError, Input, Label } from "@/components/ui/form";
import { Avatar } from "@/components/avatar";

const TYPES = ["All", "lost", "found"] as const;

type Item = {
  id: string;
  itemName: string;
  description: string;
  type: string;
  location: string | null;
  occurredOn: string | null;
  contactInfo: string | null;
  imageUrl: string | null;
  status: string;
  userId: string;
  userName: string;
  userHandle: string;
  createdAt: string;
};

type Me = { id: string; name: string; handle: string } | null;

export default function LostFoundPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [me, setMe] = useState<Me>(null);
  const [typeFilter, setTypeFilter] = useState<TypesType>("All");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Draft form
  const [openDraft, setOpenDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    itemName: string;
    description: string;
    type: "lost" | "found";
    location: string;
    contactInfo: string;
    imageUrl: string;
  }>({
    itemName: "",
    description: "",
    type: "lost",
    location: "",
    contactInfo: "",
    imageUrl: "",
  });

  type TypesType = (typeof TYPES)[number];

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "All") params.set("type", typeFilter);
      if (location) params.set("location", location);
      const res = await fetch(`/api/lost-and-found?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load items.");
      const data = await res.json();
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetch("/api/me", { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then((d) => setMe(d?.user ?? null));
  }, [typeFilter, location]);

  async function submitItem(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/lost-and-found", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't post item.");
      setOpenDraft(false);
      setDraft({ itemName: "", description: "", type: "lost", location: "", contactInfo: "", imageUrl: "" });
      void fetchItems();
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Couldn't post item.");
    } finally {
      setSubmitting(false);
    }
  }

  async function resolveItem(id: string) {
    try {
      const res = await fetch(`/api/lost-and-found/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      if (!res.ok) throw new Error("Couldn't resolve.");
      void fetchItems();
    } catch {
      setError("Couldn't resolve item.");
    }
  }

  const typeColor = (t: string) => t === "lost" ? "bg-danger/10 text-danger border-danger/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";

  return (
    <div className="mx-auto max-w-3xl py-6">
      <nav className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Lost & Found</h1>
          <p className="text-sm text-muted">Post lost or found items. Mark as resolved when reunited.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setOpenDraft(true)} disabled={!me}>
          <Upload size={14} aria-hidden /> {me ? "Post Item" : "Sign in to post"}
        </Button>
      </nav>

      {error ? <FormError message={error} /> : null}

      <div className="rounded-2xl border border-border bg-card p-3 mb-4">
        <div className="flex flex-wrap gap-2">
          <Input placeholder="Location keyword…" value={location} onChange={(e) => setLocation(e.target.value)} className="w-auto min-w-[160px] text-sm" />
          <div className="flex gap-1">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                aria-pressed={typeFilter === t}
                className={`px-3 py-1.5 rounded-lg text-sm border transition ${typeFilter === t ? "border-primary bg-accent text-primary" : "border-border text-muted hover:bg-accent/50"}`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <form onSubmit={submitItem} className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-0">
              <Label>Item name</Label>
              <Input required value={draft.itemName} onChange={(e) => setDraft({ ...draft, itemName: e.target.value })} />
            </div>
            <div className="w-32">
              <Label>Type</Label>
              <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as "lost" | "found" })} className="w-full h-10 rounded-lg border border-border bg-card px-2 text-xs outline-none">
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>
          </div>
          <div>
            <Label>Description & location</Label>
            <textarea required value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="w-full h-24 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none" rows={3} placeholder="What item, where you saw/lost it, identifying details…" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label>Contact info (optional)</Label>
              <Input value={draft.contactInfo} onChange={(e) => setDraft({ ...draft, contactInfo: e.target.value })} placeholder="Phone / handle / email" />
            </div>
            <div className="w-48">
              <Label>Image URL (optional)</Label>
              <Input value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} placeholder="https://…" />
            </div>
          </div>
          {formError ? <FormError message={formError} /> : null}
          <Button type="submit" disabled={submitting || !me || !draft.itemName || !draft.description}>
            {submitting ? "Posting…" : "Post Item"}
          </Button>
          {!me && <p className="text-[11px] text-muted">Sign in to post items.</p>}
        </form>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-muted">Loading items…</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center text-sm text-muted">
          No items posted yet.
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((i) => (
            <li key={i.id} className="flex items-start gap-3 p-3 hover:bg-accent/50 transition rounded-xl">
              <div className="flex-shrink-0">
                {i.imageUrl ? (
                  <img src={i.imageUrl} alt={i.itemName} className="size-12 rounded-xl object-cover" />
                ) : (
                  <ImageIcon size={20} aria-hidden className="text-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`inline-flex items-center gap-0.5 rounded-full border border-transparent px-1.5 py-0.5 text-[10px] font-semibold ${typeColor(i.type)}`}>
                    {i.type === "lost" ? <MapPin size={10} aria-hidden /> : <CheckCircle size={10} aria-hidden />}
                    {i.type}
                  </span>
                  <span className={`text-[10px] font-semibold ${i.status === "resolved" ? "text-success" : "text-danger"}`}>
                    {i.status}
                  </span>
                </div>
                <h3 className="font-semibold leading-snug">{i.itemName}</h3>
                <p className="mt-0.5 text-sm text-muted line-clamp-2">{i.description}</p>
                {i.location ? <p className="mt-1 text-[11px] text-muted flex items-center gap-1"><MapPin size={12} aria-hidden /> {i.location}</p> : null}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[10px] text-muted">
                    <Avatar name={i.userName} handle={i.userHandle} avatarUrl={null} size="sm" />
                    <span>@{i.userHandle}</span>
                  </div>
                  {i.status === "open" && me && i.userId === me.id ? (
                    <Button size="sm" variant="secondary" onClick={() => resolveItem(i.id)}>Mark resolved</Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
