"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, LogOut, ShieldCheck, Check, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { PushSubscribe } from "@/components/ui/push-subscribe";

const THEMES = [
  { value: "light", label: "Light lavender", icon: Sun, hint: "Bright, soft and default" },
  { value: "dark", label: "Midnight", icon: Moon, hint: "Low-light, high contrast" },
  { value: "system", label: "System", icon: Monitor, hint: "Match your device" },
] as const;

type User = {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  branch: string | null;
  year: number | null;
};

export function SettingsPanel({ user }: { user: User }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [sessions, setSessions] = useState<Array<{ id: string; createdAt: string; lastSeenAt: string; isCurrent: boolean }> | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    fetch("/api/v1/auth/sessions", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSessions(Array.isArray(d?.sessions) ? d.sessions : []))
      .catch(() => setSessions([]));
  }, []);

  async function signOut() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/");
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-3">
        <section className="vz-panel p-5">
          <h2 className="text-sm font-bold">Appearance</h2>
          <p className="mt-0.5 text-[11px] text-muted">Choose how VibeZone looks on this device.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {THEMES.map((option) => {
              const active = mounted && theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setTheme(option.value);
                    toast({ title: `Theme set to ${option.label.toLowerCase()}`, tone: "success" });
                  }}
                  aria-pressed={active}
                  className={cn(
                    "relative flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition",
                    active
                      ? "border-primary/50 bg-primary/5 ring-2 ring-primary/15"
                      : "border-border hover:border-primary/30 hover:bg-accent/50",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-8 place-items-center rounded-lg",
                      active ? "bg-primary text-white" : "bg-accent text-muted",
                    )}
                  >
                    <option.icon size={15} />
                  </span>
                  <span className="text-[11px] font-bold">{option.label}</span>
                  <span className="text-[9.5px] text-muted">{option.hint}</span>
                  {active ? <Check size={13} className="absolute right-2.5 top-2.5 text-primary" /> : null}
                </button>
              );
            })}
          </div>
        </section>

        <section className="vz-panel p-5">
          <h2 className="text-sm font-bold">Account</h2>
          <p className="mt-0.5 text-[11px] text-muted">Your campus identity and profile details.</p>
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-[var(--vz-card-2)] p-3">
            <Avatar name={user.name} handle={user.handle} avatarUrl={user.avatarUrl} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-bold">{user.name}</p>
              <p className="truncate text-[10px] text-muted">@{user.handle}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => router.push("/profile")}>
              Edit profile
            </Button>
          </div>
          <dl className="mt-3 grid gap-2 text-[11px] sm:grid-cols-2">
            <div className="rounded-lg border border-border px-3 py-2">
              <dt className="text-[9px] font-semibold uppercase tracking-wide text-muted-2">Campus email</dt>
              <dd className="mt-0.5 truncate font-medium">{user.email}</dd>
            </div>
            <div className="rounded-lg border border-border px-3 py-2">
              <dt className="text-[9px] font-semibold uppercase tracking-wide text-muted-2">Branch & year</dt>
              <dd className="mt-0.5 truncate font-medium">
                {user.branch ?? "Not set"}
                {user.year ? ` · Y${user.year}` : ""}
              </dd>
            </div>
          </dl>
        </section>

        <section className="vz-panel p-5">
          <h2 className="text-sm font-bold">Session</h2>
          <p className="mt-0.5 text-[11px] text-muted">
            Signing out clears this device&apos;s session. You can also sign out everywhere from your profile.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => router.push("/profile")}>
              Manage sessions
            </Button>
            <Button variant="danger" onClick={signOut} disabled={busy}>
              <LogOut size={14} /> {busy ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        </section>

        <section className="vz-panel p-5">
          <h2 className="text-sm font-bold">Active sessions</h2>
          <p className="mt-0.5 text-[11px] text-muted">
            Devices signed in to your account. Signing out elsewhere is not available yet.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {sessions === null ? (
              <li className="text-[11px] text-muted">Loading sessions…</li>
            ) : sessions.length === 0 ? (
              <li className="text-[11px] text-muted">No active sessions found.</li>
            ) : (
              sessions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-[var(--vz-card-2)] px-3 py-2 text-[11px]"
                >
                  <span className="flex items-center gap-2">
                    <Monitor size={13} className="text-primary" />
                    {s.isCurrent ? "This device" : "Other device"}
                  </span>
                  <span className="text-muted-2">
                    {new Date(s.lastSeenAt).toLocaleString("en-IN")}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="vz-panel p-5">
          <h2 className="text-sm font-bold">Notifications</h2>
          <p className="mt-0.5 text-[11px] text-muted">
            Get push alerts for mentions, event reminders, and club updates on this device.
          </p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <PushSubscribe
              enabled={pushEnabled}
              onChange={setPushEnabled}
              className="shrink-0"
            />
          </div>
        </section>
      </div>

      <aside className="flex flex-col gap-3">
        <section className="vz-panel vz-soft-gradient p-4">
          <div className="flex items-center gap-2 text-[12px] font-bold">
            <ShieldCheck size={14} className="text-primary" /> Your privacy
          </div>
          <ul className="mt-2 flex flex-col gap-2 text-[11px] leading-relaxed text-muted">
            <li>Only verified campus emails can join.</li>
            <li>Anonymous feedback never stores your handle or session.</li>
            <li>Chat alias use is logged for safety, not published.</li>
            <li>You can report content from any post menu.</li>
          </ul>
        </section>

        <section className="vz-panel p-4">
          <h2 className="text-[12px] font-bold">Need help?</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            Report a bug or share feedback with the admin team — anonymously if you prefer.
          </p>
          <Button
            size="sm"
            variant="soft"
            className="mt-2"
            onClick={() => router.push("/feedback")}
          >
            Open feedback
          </Button>
        </section>
      </aside>
    </div>
  );
}
