"use client";

import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";

type StudyGroup = {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  branch: string | null;
  year: number | null;
  maxMembers: number | null;
  createdBy: string;
  creator: { id: string; name: string; handle: string; avatarUrl: string | null } | null;
  createdAt: string;
};

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [newGroup, setNewGroup] = useState({
    title: "",
    description: "",
    subject: "",
    branch: "",
    year: "",
    maxMembers: "",
  });

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    try {
      const res = await fetch("/api/v1/study-groups", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups ?? []);
      }
    } catch (e) {
      console.error("Failed to load groups:", e);
    } finally {
      setLoading(false);
    }
  }

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!newGroup.title.trim() || !newGroup.subject.trim()) {
      setFormError("A group title and subject are required.");
      return;
    }
    try {
      const res = await fetch("/api/v1/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newGroup.title.trim(),
          description: newGroup.description.trim() || undefined,
          subject: newGroup.subject.trim(),
          branch: newGroup.branch.trim() || undefined,
          year: newGroup.year ? parseInt(newGroup.year, 10) : undefined,
          maxMembers: newGroup.maxMembers ? parseInt(newGroup.maxMembers, 10) : undefined,
        }),
      });
      if (res.ok) {
        setOpenDialog(false);
        setNewGroup({ title: "", description: "", subject: "", branch: "", year: "", maxMembers: "" });
        await loadGroups();
      } else {
        const data = await res.json().catch(() => null);
        setFormError(data?.error ?? "Could not create the group. Please sign in and try again.");
      }
    } catch (err) {
      console.error("Failed to create group:", err);
      setFormError("Network error. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Academics"
        title="Study Groups"
        description="Find or create study groups for your subjects and revise together."
        actions={
          <Button onClick={() => setOpenDialog(true)}>
            <Plus size={14} /> Create group
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="vz-panel h-36 animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border py-20 text-center text-muted">
          <Users size={40} className="opacity-50" />
          <p className="text-sm">No study groups yet. Create one to get started.</p>
          <Button onClick={() => setOpenDialog(true)}>
            <Plus size={14} /> Create group
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <article key={group.id} className="vz-panel flex flex-col gap-3 p-4 transition-colors hover:border-primary/30">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold">{group.title}</h3>
                  <p className="text-[10px] font-medium text-primary">{group.subject}</p>
                </div>
                <Badge tone="violet" className="normal-case tracking-normal">
                  {group.branch || "Any branch"}
                </Badge>
              </div>
              {group.description ? (
                <p className="line-clamp-3 flex-1 text-[11.5px] leading-relaxed text-muted">{group.description}</p>
              ) : null}
              <div className="flex items-center justify-between border-t border-border pt-3 text-[10px] text-muted">
                <span>{group.year ? `Year ${group.year}` : "All years"}</span>
                <span className="inline-flex items-center gap-1">
                  <Users size={12} /> Up to {group.maxMembers ?? 20}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={openDialog} onClose={() => setOpenDialog(false)} title="Create a study group">
        <form onSubmit={createGroup} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Group title</label>
            <Input
              value={newGroup.title}
              onChange={(e) => setNewGroup({ ...newGroup, title: e.target.value })}
              placeholder="e.g. CSE Semester 4 Study Circle"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Subject</label>
            <Input
              value={newGroup.subject}
              onChange={(e) => setNewGroup({ ...newGroup, subject: e.target.value })}
              placeholder="e.g. Data Structures"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Description</label>
            <Textarea
              value={newGroup.description}
              onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              rows={3}
              placeholder="What will the group focus on?"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted">Branch</label>
              <Input
                value={newGroup.branch}
                onChange={(e) => setNewGroup({ ...newGroup, branch: e.target.value })}
                placeholder="CSE"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted">Year</label>
              <Input
                type="number"
                min={1}
                max={4}
                value={newGroup.year}
                onChange={(e) => setNewGroup({ ...newGroup, year: e.target.value })}
                placeholder="2"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted">Max members</label>
              <Input
                type="number"
                min={1}
                max={100}
                value={newGroup.maxMembers}
                onChange={(e) => setNewGroup({ ...newGroup, maxMembers: e.target.value })}
                placeholder="20"
              />
            </div>
          </div>
          {formError ? <p className="rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">{formError}</p> : null}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button type="submit">Create group</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
