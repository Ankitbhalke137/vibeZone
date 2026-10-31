"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Check, Mail, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export type AdminUser = {
  id: string;
  handle: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  status: string;
  branch: string | null;
  year: number | null;
  createdAt: string;
};

const ROLES = ["student", "senior", "moderator", "admin"] as const;

const ROLE_TONE: Record<string, BadgeTone> = {
  student: "neutral",
  senior: "cyan",
  moderator: "violet",
  admin: "magenta",
};

export function UserRow({
  user,
  self,
  canChangeRole,
}: {
  user: AdminUser;
  self: boolean;
  canChangeRole: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
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
      toast({
        title: body.role ? "Role updated" : banned ? "Account restored" : "Account suspended",
        description: `@${user.handle}`,
        tone: "success",
      });
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed.";
      setError(message);
      toast({ title: "Couldn't update account", description: message, tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3">
      <Avatar name={user.name} handle={user.handle} avatarUrl={user.avatarUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-[12px] font-bold">
            {user.name} <span className="font-normal text-muted">@{user.handle}</span>
          </p>
          <Badge tone={ROLE_TONE[user.role] ?? "neutral"} className="normal-case tracking-normal">
            {user.role}
          </Badge>
          {banned ? (
            <Badge tone="red" className="normal-case tracking-normal">
              banned
            </Badge>
          ) : null}
          {self ? <span className="text-[9px] font-semibold text-primary">(you)</span> : null}
        </div>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[9.5px] text-muted">
          <span className="inline-flex items-center gap-0.5">
            <Mail size={8} /> {user.email}
          </span>
          <span>· {user.branch ?? "—"}</span>
          {user.year ? <span>· Y{user.year}</span> : null}
        </p>
        {error ? <p className="mt-0.5 text-[10px] text-danger">{error}</p> : null}
      </div>

      <div className="flex items-center gap-1.5">
        <div className="relative">
          <ShieldCheck
            size={11}
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-2"
          />
          <select
            aria-label={`Role for @${user.handle}`}
            value={user.role}
            disabled={self || !canChangeRole || busy}
            onChange={(e) => patch({ role: e.target.value, reason: "role updated from admin console" })}
            className="h-8 appearance-none rounded-lg border border-border bg-background pl-6 pr-5 text-[10px] font-semibold capitalize outline-none transition hover:border-primary/30 disabled:opacity-50"
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {!self ? (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            className={banned ? "text-success" : "text-danger hover:bg-danger/10 hover:text-danger"}
            onClick={() =>
              patch({
                status: banned ? "active" : "banned",
                reason: banned ? "restored from admin console" : "suspended from admin console",
              })
            }
          >
            {busy ? (
              "…"
            ) : banned ? (
              <>
                <Check size={11} /> Restore
              </>
            ) : (
              <>
                <Ban size={11} /> Suspend
              </>
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
