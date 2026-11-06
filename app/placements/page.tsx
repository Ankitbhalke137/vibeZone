"use client";

import { useEffect, useState } from "react";
import { Building2, ExternalLink, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { Badge, type BadgeTone } from "@/components/ui/badge";

type PlacementResource = {
  id: string;
  title: string;
  company: string;
  description: string | null;
  category: string;
  url: string | null;
  tags: string[];
  createdBy: string;
  creator: { id: string; name: string; handle: string; avatarUrl: string | null } | null;
  createdAt: string;
};

const CATEGORY_TONES: Record<string, BadgeTone> = {
  internship: "violet",
  "full-time": "green",
  resource: "cyan",
  event: "amber",
};

const CATEGORIES = [
  { value: "internship", label: "Internship" },
  { value: "full-time", label: "Full-time" },
  { value: "resource", label: "Resource" },
  { value: "event", label: "Event" },
];

export default function PlacementsPage() {
  const [resources, setResources] = useState<PlacementResource[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [newResource, setNewResource] = useState({
    title: "",
    company: "",
    description: "",
    category: "internship",
    url: "",
    tags: "",
  });

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    try {
      const res = await fetch("/api/v1/placements", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources ?? []);
      }
    } catch (e) {
      console.error("Failed to load resources:", e);
    } finally {
      setLoading(false);
    }
  }

  async function createResource(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!newResource.title.trim() || !newResource.company.trim()) {
      setFormError("Title and company are required.");
      return;
    }
    try {
      const res = await fetch("/api/v1/placements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newResource.title.trim(),
          company: newResource.company.trim(),
          description: newResource.description.trim() || undefined,
          category: newResource.category,
          url: newResource.url.trim() || undefined,
          tags: newResource.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        setOpenDialog(false);
        setNewResource({ title: "", company: "", description: "", category: "internship", url: "", tags: "" });
        await loadResources();
      } else {
        const data = await res.json().catch(() => null);
        setFormError(data?.error ?? "Could not add the resource. Please sign in and try again.");
      }
    } catch (err) {
      console.error("Failed to create resource:", err);
      setFormError("Network error. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Careers"
        title="Placement Hub"
        description="Company information, placement resources, and career opportunities shared by your campus."
        actions={
          <Button onClick={() => setOpenDialog(true)}>
            <Plus size={14} /> Add resource
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="vz-panel h-40 animate-pulse" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border py-20 text-center text-muted">
          <Building2 size={40} className="opacity-50" />
          <p className="text-sm">No placement resources yet.</p>
          <Button onClick={() => setOpenDialog(true)}>
            <Plus size={14} /> Add the first resource
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <article key={resource.id} className="vz-panel flex flex-col gap-3 p-4 transition-colors hover:border-primary/30">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={CATEGORY_TONES[resource.category] ?? "neutral"} className="normal-case tracking-normal">
                  {resource.category}
                </Badge>
                <Badge tone="cyan" className="normal-case tracking-normal">
                  {resource.company}
                </Badge>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold">{resource.title}</h3>
                {resource.description ? (
                  <p className="mt-1 line-clamp-3 text-[11.5px] leading-relaxed text-muted">{resource.description}</p>
                ) : null}
                {resource.tags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {resource.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-medium text-muted">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-[10px] text-muted">by @{resource.creator?.handle ?? "campus"}</span>
                {resource.url ? (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
                  >
                    View resource <ExternalLink size={11} />
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={openDialog} onClose={() => setOpenDialog(false)} title="Add placement resource">
        <form onSubmit={createResource} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Title</label>
            <Input
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
              placeholder="e.g. Google Summer Internship 2026"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted">Company</label>
              <Input
                value={newResource.company}
                onChange={(e) => setNewResource({ ...newResource, company: e.target.value })}
                placeholder="e.g. Google"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted">Category</label>
              <select
                value={newResource.category}
                onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                className="h-11 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary/60"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Description</label>
            <Textarea
              value={newResource.description}
              onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
              rows={3}
              placeholder="Eligibility, timeline, or tips"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">URL</label>
            <Input
              type="url"
              value={newResource.url}
              onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
              placeholder="https://careers.example.com"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Tags (comma-separated)</label>
            <Input
              value={newResource.tags}
              onChange={(e) => setNewResource({ ...newResource, tags: e.target.value })}
              placeholder="DSA, Interview, SDE"
            />
          </div>
          {formError ? <p className="rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">{formError}</p> : null}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button type="submit">Add resource</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
