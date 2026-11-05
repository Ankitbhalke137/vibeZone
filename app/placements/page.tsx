"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Mail } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

export default function PlacementsPage() {
  const [resources, setResources] = useState<PlacementResource[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newResource, setNewResource] = useState({
    title: "",
    company: "",
    description: "",
    category: "",
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
        setResources(data.resources);
      }
    } catch (e) {
      console.error("Failed to load resources:", e);
    } finally {
      setLoading(false);
    }
  }

  async function createResource(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/placements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newResource.title,
          company: newResource.company,
          description: newResource.description,
          category: newResource.category,
          url: newResource.url,
          tags: newResource.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        setOpenDialog(false);
        setNewResource({
          title: "",
          company: "",
          description: "",
          category: "",
          url: "",
          tags: "",
        });
        await loadResources();
      }
    } catch (e) {
      console.error("Failed to create resource:", e);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title="Placement Hub"
        description="Company information, placement resources, and career opportunities"
        icon={<Building2 size={14} />}
      />

      <div className="flex items-center justify-between px-6 py-4">
        <Button onClick={() => setOpenDialog(true)} className="bg-primary text-white">
          <Plus size={14} /> Add Resource
        </Button>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted">
            <Building2 size={48} className="mb-4 opacity-50" />
            <p>No resources yet.</p>
            <Button onClick={() => setOpenDialog(true)} className="mt-4">
              Add Resource
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <div key={resource.id} className="vz-panel p-4 hover:vz-card-hover transition-colors">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={CATEGORY_COLORS[resource.category] ?? "neutral"} className="normal-case tracking-normal">
                      {resource.category}
                    </Badge>
                    <Badge tone="cyan" className="normal-case tracking-normal text-[9px]">
                      {resource.company}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold">{resource.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[10.5px] text-muted">{resource.description}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted">by {resource.creator?.handle}</span>
                  </div>
                  {resource.url && (
                    <a href={resource.url} className="text-[9px] text-primary underline underline-offset-4">
                      View Resource →
                    </a>
                  )}
                </div>
              </div>
            ))}
          )}
        </div>
      </section>

      <Modal open={openDialog} onClose={() => setOpenDialog(false)} title="Add Placement Resource">
        <form onSubmit={createResource} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Title</label>
            <input
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
              className="h-9 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
              placeholder="e.g., Google Summer Internship 2024"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Company</label>
            <input
              value={newResource.company}
              onChange={(e) => setNewResource({ ...newResource, company: e.target.value })}
              className="h-9 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
              placeholder="e.g., Google, Microsoft, Amazon"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Category</label>
            <input
              value={newResource.category}
              onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
              className="h-9 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
              placeholder="e.g., Internship, Full-time, Resource"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">URL</label>
            <input
              value={newResource.url}
              onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
              className="h-9 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
              placeholder="e.g., https://careers.google.com"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Tags (comma-separated)</label>
            <input
              value={newResource.tags}
              onChange={(e) => setNewResource({ ...newResource, tags: e.target.value })}
              className="h-9 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
              placeholder="e.g., DSA, Placements, Interview"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Resource</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const CATEGORY_COLORS: Record<string, string> = {
  Academic: "bg-red-100 text-red-700 border-red-200",
  Cultural: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  Sports: "bg-green-100 text-green-700 border-green-200",
  Clubs: "bg-cyan-100 text-cyan-700 border-cyan-200",
  Placement: "bg-amber-100 text-amber-700 border-amber-200",
};