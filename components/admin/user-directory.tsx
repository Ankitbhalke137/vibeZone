"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { UserRow, type AdminUser } from "./user-row";

export function UserDirectory({
  users,
  selfId,
  canChangeRole,
}: {
  users: AdminUser[];
  selfId: string;
  canChangeRole: boolean;
}) {
  const [tab, setTab] = useState<"all" | "students" | "seniors" | "club_leaders" | "faculty" | "staff" | "banned">("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () => ({
      all: users.length,
      students: users.filter((user) => user.role === "student").length,
      seniors: users.filter((user) => user.role === "senior").length,
      clubLeaders: users.filter((user) => user.role === "club_leader").length,
      faculty: users.filter((user) => user.role === "faculty").length,
      staff: users.filter((user) => ["moderator", "faculty", "admin"].includes(user.role)).length,
      banned: users.filter((user) => user.status === "banned").length,
    }),
    [users],
  );

  const visible = users.filter((user) => {
    if (tab === "students" && user.role !== "student") return false;
    if (tab === "seniors" && user.role !== "senior") return false;
    if (tab === "club_leaders" && user.role !== "club_leader") return false;
    if (tab === "faculty" && user.role !== "faculty") return false;
    if (tab === "staff" && !["moderator", "faculty", "admin"].includes(user.role)) return false;
    if (tab === "banned" && user.status !== "banned") return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [user.name, user.handle, user.email, user.branch ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  return (
    <section className="vz-panel overflow-hidden">
      <div className="flex flex-col gap-2.5 border-b border-border p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-2"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, handle, email or branch…"
            aria-label="Search users"
            className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-[11px] outline-none transition placeholder:text-muted-2 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
          />
        </div>
        <Tabs
          value={tab}
          onChange={(value) => setTab(value as typeof tab)}
          size="sm"
          className="sm:ml-auto sm:border-0 sm:bg-transparent sm:p-0"
          items={[
            { value: "all", label: "All", count: counts.all },
            { value: "students", label: "Students", count: counts.students },
            { value: "seniors", label: "Seniors", count: counts.seniors },
            { value: "club_leaders", label: "Club Leaders", count: counts.clubLeaders },
            { value: "faculty", label: "Faculty", count: counts.faculty },
            { value: "staff", label: "Staff", count: counts.staff },
            { value: "banned", label: "Banned", count: counts.banned },
          ]}
        />
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Users size={20} />
          </span>
          <p className="mt-3 text-sm font-bold">No people found</p>
          <p className="mt-1 text-xs text-muted">Try a different search or filter.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {visible.map((user) => (
            <li key={user.id}>
              <UserRow user={user} self={user.id === selfId} canChangeRole={canChangeRole} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
