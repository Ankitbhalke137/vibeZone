"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LogOut, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, FormError, Input, Label } from "@/components/ui/form";
import { Avatar } from "@/components/avatar";
import { AVATAR_PRESETS } from "@/lib/avatars";

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "ME", "CE", "Other"];

type Me = {
  name: string;
  handle: string;
  avatarUrl: string | null;
  bio: string | null;
  branch: string | null;
  year: number | null;
  email: string;
  role: string;
};

export function ProfileEditor({ me, onAfterSave }: { me: Me; onAfterSave?: () => void }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: me.name,
    handle: me.handle,
    bio: me.bio ?? "",
    branch: me.branch ?? "CSE",
    year: me.year ?? 1,
    avatarUrl: me.avatarUrl ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm((f) => ({ ...f, name: me.name, handle: me.handle, bio: me.bio ?? "", branch: me.branch ?? "CSE", year: me.year ?? 1, avatarUrl: me.avatarUrl ?? "" }));
  }, [me]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          handle: form.handle,
          bio: form.bio || null,
          branch: form.branch,
          year: Number(form.year),
          avatarUrl: form.avatarUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't save.");
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
      onAfterSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
    } finally {
      setBusy(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex flex-col gap-3">
        <Button variant="secondary" onClick={() => setEditing(true)}>
          <Pencil size={15} aria-hidden /> Edit profile
        </Button>
        {saved ? (
          <p className="rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success">
            Profile updated.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <div>
        <Label>Avatar</Label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-label="No avatar (initials)"
            onClick={() => set("avatarUrl", "")}
            className={`rounded-full p-0.5 ring-2 transition ${form.avatarUrl === "" ? "ring-primary" : "ring-transparent"}`}
          >
            <Avatar name={form.name} handle={form.handle} avatarUrl={null} size="md" />
          </button>
          {AVATAR_PRESETS.map((p) => {
            const url = `preset:${p.key}`;
            return (
              <button
                key={p.key}
                type="button"
                aria-label={`Avatar preset ${p.key}`}
                onClick={() => set("avatarUrl", url)}
                className={`rounded-full p-0.5 ring-2 transition ${form.avatarUrl === url ? "ring-primary" : "ring-transparent"}`}
              >
                <Avatar name={form.name} handle={form.handle} avatarUrl={url} size="md" />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label htmlFor="p-name">Display name</Label>
        <Input id="p-name" required minLength={2} value={form.name} onChange={(e) => set("name", e.target.value)} />
      </div>

      <div>
        <Label htmlFor="p-handle">Handle</Label>
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted">@</span>
          <Input
            id="p-handle"
            required
            pattern="[a-z0-9_]{3,20}"
            title="3–20 chars: a–z, 0–9, _"
            value={form.handle}
            onChange={(e) => set("handle", e.target.value.toLowerCase())}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="p-bio">Bio (max 300 chars)</Label>
        <textarea
          id="p-bio"
          rows={3}
          maxLength={300}
          placeholder="Year, interests, what you can help with…"
          className="flex w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="p-branch">Branch</Label>
          <select
            id="p-branch"
            value={form.branch}
            onChange={(e) => set("branch", e.target.value)}
            className="flex h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
          >
            {BRANCHES.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="p-year">Year</Label>
          <select
            id="p-year"
            value={form.year}
            onChange={(e) => set("year", Number(e.target.value))}
            className="flex h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
          >
            {[1, 2, 3, 4].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <FormError message={error} />

      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          <Check size={15} aria-hidden /> {busy ? "Saving…" : "Save profile"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/** FR-AUTH-004 — kills the session cookie AND bumps session_version (all tokens die). */
export function SignOutEverywhereButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/auth/logout-all", { method: "POST" }).catch(() => {});
        router.push("/");
        router.refresh();
      }}
    >
      <LogOut size={14} aria-hidden /> {busy ? "Signing out…" : "Sign out everywhere"}
    </Button>
  );
}
