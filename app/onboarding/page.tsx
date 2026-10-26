"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, FormError, Input, Label } from "@/components/ui/form";
import { Avatar } from "@/components/avatar";
import { AVATAR_PRESETS } from "@/lib/avatars";

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "ME", "CE", "Other"];

export default function OnboardingPage() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [branch, setBranch] = useState<string>("CSE");
  const [year, setYear] = useState<number>(1);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.user) return router.replace("/login?next=/onboarding");
        if (d.user.onboardedAt) router.replace("/profile");
        if (d.user.name) setName(d.user.name);
      })
      .catch(() => {});
  }, [router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle, name, branch, year, avatarUrl, completeOnboarding: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't save.");
      router.push("/profile");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <h1 className="mb-1 text-2xl font-bold">Set up your profile</h1>
      <p className="mb-5 text-sm text-muted">One quick step — you can change this later.</p>

      <Card>
        <form onSubmit={save} className="flex flex-col gap-4">
          <div>
            <Label>Avatar</Label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-label="Initials avatar"
                onClick={() => setAvatarUrl("")}
                className={`rounded-full p-0.5 ring-2 transition ${avatarUrl === "" ? "ring-primary" : "ring-transparent"}`}
              >
                <Avatar name={name} handle={handle} avatarUrl={null} size="md" />
              </button>
              {AVATAR_PRESETS.map((p) => {
                const url = `preset:${p.key}`;
                return (
                  <button
                    key={p.key}
                    type="button"
                    aria-label={`Avatar preset ${p.key}`}
                    onClick={() => setAvatarUrl(url)}
                    className={`rounded-full p-0.5 ring-2 transition ${avatarUrl === url ? "ring-primary" : "ring-transparent"}`}
                  >
                    <Avatar name={name} handle={handle} avatarUrl={url} size="md" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="name">Display name</Label>
            <Input id="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="handle">Handle (unique)</Label>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted">@</span>
              <Input
                id="handle"
                required
                pattern="[a-z0-9_]{3,20}"
                title="3–20 chars: a–z, 0–9, _"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase())}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="branch">Branch</Label>
              <select
                id="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
              >
                {BRANCHES.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
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
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Finish setup"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
