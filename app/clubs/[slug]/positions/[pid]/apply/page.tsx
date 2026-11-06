"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea, Label, Card } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, ArrowRight, Users, PenLine } from "lucide-react";

export default function ApplyPage() {
  const router = useRouter();
  const params = useParams<{ slug: string; pid: string }>();
  const pid = params?.pid;

  const [position, setPosition] = useState<any>(null);
  const [club, setClub] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [form, setForm] = useState({
    fullName: "",
    statement: "",
    resumeUrl: "",
  });

  useEffect(() => {
    if (!pid) return;
    let cancelled = false;

    async function load() {
      try {
        const [posRes, meRes] = await Promise.all([
          fetch(`/api/club-applications/positions/${pid}`),
          fetch("/api/me", { cache: "no-store" }),
        ]);
        if (cancelled) return;
        if (posRes.ok) {
          const data = await posRes.json();
          if (cancelled) return;
          setPosition(data.position);
          setClub(data.club);
        }
        if (meRes.ok) {
          const d = await meRes.json();
          if (cancelled) return;
          setMe(d.user ?? null);
          if (d.user) {
            setForm((prev) => ({ ...prev, fullName: d.user.name || "" }));
          }
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [pid]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Users size={24} className="mb-3 text-muted-2 animate-pulse" />
        <p className="text-sm text-muted">Loading position…</p>
      </div>
    );
  }

  if (!position || !club) {
    return (
      <div className="vz-panel p-8 text-center">
        <AlertCircle size={24} className="mx-auto mb-3 text-danger" />
        <h3 className="text-sm font-semibold">Position not found</h3>
        <p className="mt-1 text-xs text-muted">
          This position may have been filled or removed.
        </p>
        <div className="mt-4">
          <Button variant="outline" className="w-full" onClick={() => router.push("/clubs")}>
            Browse clubs
          </Button>
        </div>
      </div>
    );
  }

  // Eligibility check
  const eligible =
    position.eligibleYear === null
      ? "Open to all years"
      : `Only 20${30 - position.eligibleYear} Batch students`;
  const alreadyApplied = position.applied === true;

  if (!me) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <Card className="w-full max-w-md">
          <div className="p-6 text-center">
            <Users size={32} className="mx-auto mb-4 text-muted-2" />
            <h2 className="text-lg font-bold">Sign in to apply</h2>
            <p className="mt-1 text-sm text-muted">
              You need to be signed in to submit a club application.
            </p>
            <div className="mt-6">
              <Button
                className="w-full"
                onClick={() => {
                  router.push(`/login?next=${encodeURIComponent(`/clubs/${club.slug}/positions/${position.id}/apply`)}`);
                }}
              >
                <ArrowRight size={14} className="mr-2" /> Sign in
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <Card className="w-full max-w-md">
          <div className="p-6 text-center">
            <CheckCircle2 size={32} className="mx-auto mb-4 text-success" />
            <h2 className="text-lg font-bold">Already applied</h2>
            <p className="mt-1 text-sm text-muted">
              You have already applied for <b>{position.title}</b> at{" "}
              <b>{club.name}</b>. The club team will review your application.
            </p>
            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/my-club-applications")}
              >
                View my applications
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <Card className="w-full max-w-md">
          <div className="p-6 text-center">
            <CheckCircle2 size={40} className="mx-auto mb-4 text-success" />
            <h2 className="text-lg font-bold">Application submitted!</h2>
            <p className="mt-1 text-sm text-muted">
              Your application for <b>{position.title}</b> at{" "}
              <b>{club.name}</b> has been received. Good luck!
            </p>
            <div className="mt-6">
              <Button
                className="w-full"
                onClick={() => router.push("/my-club-applications")}
              >
                View my applications
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/club-applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          positionId: position.id,
          fullName: form.fullName.trim(),
          statement: form.statement.trim() || undefined,
          resumeUrl: form.resumeUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit application.");
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Campus life · Club elections"
        title={`Apply: ${position.title}`}
        description={club.name}
        actions={
          <Badge tone="violet" className="normal-case tracking-normal">
            {eligible}
          </Badge>
        }
      />

      <Card className="max-w-2xl">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <PenLine size={14} className="text-primary" />
            <h3 className="text-sm font-bold">Application form</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                  disabled={submitting}
                  placeholder="e.g. Ananya Rao"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="resumeUrl">Resume / portfolio link (optional)</Label>
                <Input
                  id="resumeUrl"
                  type="url"
                  value={form.resumeUrl}
                  onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
                  disabled={submitting}
                  placeholder="https://drive.google.com/..."
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="statement">Why do you want this role? (optional)</Label>
              <Textarea
                id="statement"
                rows={4}
                value={form.statement}
                onChange={(e) => setForm({ ...form, statement: e.target.value })}
                disabled={submitting}
                placeholder="Tell the club why you're a great fit…"
              />
            </div>
            {error ? (
              <p className="rounded-xl border border-danger/20 bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto"
            >
              {submitting ? "Submitting…" : <span>Submit application <ArrowRight size={14} className="ml-2" /></span>}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-border text-[10px] text-muted">
            Applications are reviewed by the club team and college administration. VibeZone only
            collects your application — the college handles elections and results.
          </div>
        </div>
      </Card>
    </div>
  );
}
