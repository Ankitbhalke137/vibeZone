"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/avatar";

type User = {
  id: string;
  handle: string;
  name: string;
  email: string;
  role: string;
  status: string;
  branch: string | null;
  year: number | null;
  createdAt: string;
};

const ROLES = ["student", "senior", "moderator", "admin"] as const;

export function UserRow({
  user,
  self,
  canChangeRole,
}: {
  user: User;
  self: boolean;
  canChangeRole: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const banned = user.status === "banned";

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3">
      <Avatar name={user.name} handle={user.handle} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {user.name} <span className="font-normal text-muted">@{user.handle}</span>
          {self ? <span className="ml-1.5 text-[11px] text-primary">(you)</span> : null}
        </p>
        <p className="truncate text-[11px] text-muted">
          {user.email} · {user.branch ?? "—"} {user.year ? `· Y${user.year}` : ""}
        </p>
        {error ? <p className="text-[11px] text-danger">{error}</p> : null}
      </div>

      <div className="flex items-center gap-2">
        {banned ? (
          <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-semibold text-danger">
            banned
          </span>
        ) : null}

        <select
          aria-label={`Role for @${user.handle}`}
          value={user.role}
          disabled={self || !canChangeRole || busy}
          onChange={(e) => patch({ role: e.target.value, reason: "dashboard change" })}
          className="h-8 rounded-lg border border-border bg-background px-2 text-xs outline-none disabled:opacity-50"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {!self ? (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              patch({
                status: banned ? "active" : "banned",
                reason: banned ? "unbanned from dashboard" : "banned from dashboard",
              })
            }
            className={`h-8 rounded-lg border border-border px-2.5 text-xs font-medium transition disabled:opacity-50 ${
              banned ? "text-success hover:bg-accent" : "text-danger hover:bg-danger/10"
            }`}
          >
            {busy ? "…" : banned ? "Unban" : "Ban"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
