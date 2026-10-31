"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ImageIcon,
  Loader2,
  MapPin,
  PackageSearch,
  Plus,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { FormError, Input, Label, Select, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

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
type Filter = "All" | "lost" | "found";
const FILTERS: Filter[] = ["All", "lost", "found"];

export default function LostFoundPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [me, setMe] = useState<Me>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (filter !== "All") qs.set("type", filter);
      if (location) qs.set("location", location);
      const res = await fetch(`/api/lost-and-found?${qs.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load items.");
      const data = await res.json();
      setItems(data.items as Item[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items.");
    } finally {
      setLoading(false);
    }
  }, [filter, location]);

  useEffect(() => {
    const t = window.setTimeout(() => void fetchItems(), 220);
    return () => window.clearTimeout(t);
  }, [fetchItems]);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMe(d?.user ?? null))
      .catch(() => {});
  }, []);

  async function resolveItem(id: string) {
    try {
      const res = await fetch(`/api/lost-and-found/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Marked as resolved", description: "Glad it found its way home.", tone: "success" });
      void fetchItems();
      router.refresh();
    } catch {
      toast({ title: "Couldn't resolve item", tone: "error" });
    }
  }

  const open = items.filter((i) => i.status !== "resolved");
  const resolved = items.filter((i) => i.status === "resolved");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <PageHeader
        eyebrow="Community board"
        title="Lost & found"
        description="Post something you lost or found. Mark it resolved when it makes it back home."
        actions={
          <Button size="sm" onClick={() => setOpenForm(true)}>
            <Plus size={14} /> Post item
          </Button>
        }
      />

      <section className="vz-panel flex flex-col gap-2 p-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Filter by location…"
            aria-label="Filter by location"
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-xs outline-none transition placeholder:text-muted-2 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
          />
        </div>
        <div className="flex items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                "h-9 rounded-lg px-3 text-[11px] font-semibold capitalize transition",
                filter === f
                  ? "bg-primary text-white"
                  : "border border-border bg-card text-muted hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="px-1 text-[10px] text-muted">
          {loading ? "…" : `${open.length} open`}
        </span>
      </section>

      {error ? <FormError message={error} /> : null}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="vz-panel space-y-2 p-4">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : open.length === 0 ? (
        <EmptyState
          icon={<PackageSearch size={20} />}
          title="Nothing on the board"
          description={
            filter !== "All" || location
              ? "No items match this filter. Try clearing it."
              : "Lost something or found something? Post it and give campus a chance to help."
          }
          action={{ label: "Post an item", onClick: () => setOpenForm(true) }}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {open.map((item) => (
            <ItemCard key={item.id} item={item} me={me} onResolve={() => void resolveItem(item.id)} />
          ))}
        </div>
      )}

      {resolved.length > 0 ? (
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-muted">
            <CheckCircle2 size={12} className="text-success" /> Recently resolved
          </h2>
          <ul className="vz-panel divide-y divide-border overflow-hidden">
            {resolved.slice(0, 6).map((item) => (
              <li key={item.id} className="flex items-center gap-2 px-4 py-2">
                <CheckCircle2 size={12} className="shrink-0 text-success" />
                <span className="min-w-0 flex-1 truncate text-[11px] font-medium line-through decoration-border">
                  {item.itemName}
                </span>
                <span className="shrink-0 text-[9.5px] text-muted">{item.type}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ItemForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        signedIn={Boolean(me)}
        onSaved={() => {
          setOpenForm(false);
          void fetchItems();
          router.refresh();
        }}
      />
    </div>
  );
}

function ItemCard({ item, me, onResolve }: { item: Item; me: Me; onResolve: () => void }) {
  const lost = item.type === "lost";
  return (
    <article className="vz-panel vz-card-hover flex flex-col overflow-hidden p-0">
      {item.imageUrl ? (
        <div className="relative h-28 overflow-hidden bg-[var(--vz-card-3)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt="" className="size-full object-cover" />
          <span
            className={cn(
              "absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase",
              lost ? "bg-danger text-white" : "bg-success text-white",
            )}
          >
            {item.type}
          </span>
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1.5">
          {!item.imageUrl ? (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase",
                lost ? "bg-danger/10 text-danger" : "bg-success/10 text-success",
              )}
            >
              {item.type}
            </span>
          ) : null}
          <span className="text-[9px] text-muted-2">
            {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
          {item.status === "resolved" ? (
            <span className="ml-auto inline-flex items-center gap-0.5 text-[9px] font-semibold text-success">
              <CheckCircle2 size={10} /> Resolved
            </span>
          ) : null}
        </div>

        <h3 className="mt-1.5 text-[13px] font-bold leading-snug">{item.itemName}</h3>
        <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-muted">{item.description}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9.5px] text-muted">
          {item.location ? (
            <span className="inline-flex items-center gap-1">
              <MapPin size={10} /> {item.location}
            </span>
          ) : null}
          {item.contactInfo ? (
            <span className="inline-flex items-center gap-1">
              <UserRound size={10} /> {item.contactInfo}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center gap-2 border-t border-[var(--vz-border-soft)] pt-2.5">
          <Avatar name={item.userName} handle={item.userHandle} size="xs" />
          <span className="min-w-0 flex-1 truncate text-[9.5px] text-muted">@{item.userHandle}</span>
          {item.status === "open" && me?.id === item.userId ? (
            <button
              type="button"
              onClick={onResolve}
              className="rounded-lg bg-success/10 px-2 py-1 text-[9.5px] font-bold text-success transition hover:bg-success/15"
            >
              Mark resolved
            </button>
          ) : item.imageUrl ? (
            <span className="inline-flex items-center gap-0.5 text-[9px] text-muted-2">
              <ImageIcon size={10} /> photo
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ItemForm({
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
    itemName: "",
    description: "",
    type: "lost",
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
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't post item.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Post a lost or found item"
      description="Add enough detail for someone to recognise it."
    >
      {!signedIn ? (
        <div className="flex flex-col gap-3 text-center">
          <p className="text-xs text-muted">Sign in with your campus email to post an item.</p>
          <Button onClick={() => { window.location.href = "/login?next=/lost-and-found"; }}>Sign in</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="grid grid-cols-[1fr_130px] gap-2">
            <div>
              <Label htmlFor="lf-name">Item name</Label>
              <Input
                id="lf-name"
                required
                maxLength={120}
                value={form.itemName}
                onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                placeholder="Black earbuds case"
              />
            </div>
            <div>
              <Label htmlFor="lf-type">Type</Label>
              <Select id="lf-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="lost">I lost it</option>
                <option value="found">I found it</option>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="lf-desc">Description</Label>
            <Textarea
              id="lf-desc"
              required
              rows={3}
              maxLength={2000}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Colour, brand, marks, where you last saw it…"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="lf-loc">Location</Label>
              <Input
                id="lf-loc"
                maxLength={120}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Near the library"
              />
            </div>
            <div>
              <Label htmlFor="lf-contact">Contact (optional)</Label>
              <Input
                id="lf-contact"
                maxLength={120}
                value={form.contactInfo}
                onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
                placeholder="How to reach you"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="lf-image">Image URL (optional)</Label>
            <Input
              id="lf-image"
              type="url"
              pattern="https://.*"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://…"
            />
          </div>
          <FormError message={error} />
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {busy ? "Posting…" : "Post item"}
          </Button>
        </form>
      )}
    </Modal>
  );
}
