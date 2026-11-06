"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError, Input, Label, Select } from "@/components/ui/form";
import { Avatar } from "@/components/avatar";
import { AuthFrame } from "@/components/auth/auth-frame";
import { AVATAR_PRESETS } from "@/lib/avatars";
import { cn } from "@/lib/utils";

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
        if (d.user.onboardedAt) router.replace("/home");
        if (d.user.name) setName(d.user.name);
        if (d.user.handle) setHandle(d.user.handle);
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
      void router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
      setBusy(false);
    }
  }

  return (
    <AuthFrame
      eyebrow="One last step"
      title="Make yourself at home"
      description="Pick a name, a handle and a little colour. You can change all of this later in Settings."
    >
      <div className="vz-panel vz-soft-gradient mb-3 flex items-center gap-3 p-4">
        <Avatar name={name || "Your name"} handle={handle} avatarUrl={avatarUrl || null} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-primary">
            Profile preview
          </p>
          <p className="mt-0.5 truncate text-sm font-bold">{name || "Your name"}</p>
          <p className="truncate text-[11px] text-muted">@{handle || "yourhandle"}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">
              {branch}
            </span>
            <span className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-semibold text-muted">
              Year {year}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={save} className="vz-panel flex flex-col gap-4 p-5">
        <div>
          <Label>Avatar</Label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-label="Initials avatar"
              onClick={() => setAvatarUrl("")}
              className={cn(
                "rounded-full p-0.5 ring-2 transition",
                avatarUrl === ""
                  ? "ring-primary"
                  : "ring-transparent hover:ring-primary/30",
              )}
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
                  className={cn(
                    "rounded-full p-0.5 ring-2 transition",
                    avatarUrl === url
                      ? "ring-primary"
                      : "ring-transparent hover:ring-primary/30",
                  )}
                >
                  <Avatar name={name} handle={handle} avatarUrl={url} size="md" />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label htmlFor="name">Display name</Label>
          <Input
            id="name"
            required
            minLength={2}
            maxLength={100}
            placeholder="How should campus see you?"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="handle">Handle</Label>
          <div className="flex items-center gap-1.5">
            <span className="grid h-11 w-9 shrink-0 place-items-center rounded-xl border border-border bg-[var(--vz-card-2)] text-sm font-semibold text-muted">
              @
            </span>
            <Input
              id="handle"
              required
              pattern="[a-z0-9_]{3,20}"
              title="3–20 chars: a–z, 0–9, _"
              placeholder="yourhandle"
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            />
          </div>
          <p className="mt-1 text-[9.5px] text-muted-2">
            3–20 characters. Letters, numbers and underscores only.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="branch">Branch</Label>
            <Select id="branch" value={branch} onChange={(e) => setBranch(e.target.value)}>
              {BRANCHES.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="year">Year</Label>
            <Select
              id="year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[1, 2, 3, 4].map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <FormError message={error} />

        <Button type="submit" size="lg" disabled={busy || name.trim().length < 2 || handle.length < 3}>
          {busy ? (
            "Saving…"
          ) : (
            <>
              <Check size={15} /> Finish setup <ArrowRight size={14} />
            </>
          )}
        </Button>

        <p className="flex items-center justify-center gap-1 text-[9.5px] text-muted-2">
          <Sparkles size={10} /> Your profile is visible to other verified campus members.
        </p>
      </form>
    </AuthFrame>
  );
}
