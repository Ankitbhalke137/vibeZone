"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, GraduationCap, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Textarea } from "@/components/ui/form";
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
  creatorId: string;
  creator: { id: string; name: string; handle: string; avatarUrl: string | null } | null;
  createdAt: string;
  _count: { members: number };
};

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
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
        setGroups(data.groups);
      }
    } catch (e) {
      console.error("Failed to load groups:", e);
    } finally {
      setLoading(false);
    }
  }

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newGroup.title,
          description: newGroup.description,
          subject: newGroup.subject,
          branch: newGroup.branch || undefined,
          year: newGroup.year ? parseInt(newGroup.year) : undefined,
          maxMembers: newGroup.maxMembers ? parseInt(newGroup.maxMembers) : undefined,
        }),
      });
      if (res.ok) {
        setOpenDialog(false);
        setNewGroup({ title: "", description: "", subject: "", branch: "", year: "", maxMembers: "" });
        await loadGroups();
      }
    } catch (e) {
      console.error("Failed to create group:", e);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title="Study Groups"
        description="Find or create study groups for your subjects"
        icon={<Users size={14} />}
      />

      <div className="flex items-center justify-between px-6 py-4">
        <Button onClick={() => setOpenDialog(true)} className="bg-primary text-white">
          <Plus size={14} /> Create Group
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted">
          <div className="w-8 h-8 rounded-full bg-primary/20 animate-pulse"></div>
          <p>Loading groups...</p>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-6">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted">
              <Users size={48} className="mb-4 opacity-50" />
              <p>No study groups yet. Create one to get started!</p>
              <Button onClick={() => setOpenDialog(true)} className="mt-4">
                Create Group
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <div key={group.id} className="vz-panel p-4 hover:vz-card-hover transition-colors">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold">{group.title}</h3>
                    <p className="text-[9px] text-muted">{group.subject}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge tone="primary" className="normal-case tracking-normal">
                      {group.branch || "Any Branch"}
                    </Badge>
                    <span className="text-[9px] text-muted">
                      {group.maxMembers ? group.members.length + "/" + group.maxMembers : group.members.length} members
                    </span>
                  </div>
                  <div className="mt-3">
                    <Badge tone="cyan" className="normal-case tracking-normal text-[9px]">
                      Year {group.year}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          )}
        </div>
      </section>

      <Modal open={openDialog} onClose={() => setOpenDialog(false)} title="Create Study Group">
        <form onSubmit={createGroup} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Group Title</label>
            <input
              value={newGroup.title}
              onChange={(e) => setNewGroup({ ...newGroup, title: e.target.value })}
              className="h-9 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
              placeholder="e.g., CSE Study Group"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Subject</label>
            <input
              value={newGroup.subject}
              onChange={(e) => setNewGroup({ ...newGroup, subject: e.target.value })}
              className="h-9 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
              placeholder="e.g., Data Structures"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted">Branch</label>
              <input
                value={newGroup.branch}
                onChange={(e) => setNewGroup({ ...newGroup, branch: e.target.value })}
                className="h-9 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                placeholder="e.g., CSE"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted">Year</label>
              <input
                value={newGroup.year}
                onChange={(e) => setNewGroup({ ...newGroup, year: e.target.value })}
                className="h-9 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                placeholder="e.g., 2"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Max Members</label>
            <input
              type="number"
              value={newGroup.maxMembers}
              onChange={(e) => setNewGroup({ ...newGroup, maxMembers: e.target.value })}
              className="h-9 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
              placeholder="e.g., 20"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Group</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}