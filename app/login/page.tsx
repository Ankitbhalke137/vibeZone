"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Mail, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError, Input, Label } from "@/components/ui/form";
import { AuthFrame } from "@/components/auth/auth-frame";
import { ga } from "@/lib/ga";
import { cn } from "@/lib/utils";

function StepPill({
  active,
  done,
  number,
  label,
}: {
  active: boolean;
  done: boolean;
  number: number;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold transition",
        active || done ? "bg-primary/10 text-primary" : "bg-accent text-muted",
      )}
    >
      <span
        className={cn(
          "grid size-4 place-items-center rounded-full text-[8px] font-black",
          done
            ? "bg-primary text-white"
            : active
              ? "border border-primary/40 text-primary"
              : "border border-border text-muted",
        )}
      >
        {done ? "✓" : number}
      </span>
      {label}
    </span>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/home";

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function requestOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't send the code.");
      setStep("code");
      setDevOtp(data.devOtp ?? null);
      setCooldown(45);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verification failed.");
      if (data.isNew) ga.signUp();
      else ga.login();
      void router.push(data.onboarded ? next : "/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
      setBusy(false);
    }
  }

  return (
    <AuthFrame
      eyebrow="Welcome back"
      title="Sign in to VibeZone"
      description="Use your campus email. We’ll send a one-time code — no password to remember."
    >
      <div className="vz-panel overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border bg-[var(--vz-card-2)] px-5 py-3">
          <StepPill active={step === "email"} done={step === "code"} number={1} label="Email" />
          <span className="h-px flex-1 bg-border" />
          <StepPill active={step === "code"} done={false} number={2} label="Verify" />
        </div>

        <div className="p-5">
          {step === "email" ? (
            <form onSubmit={requestOtp} className="flex flex-col gap-4">
              <div>
                <Label htmlFor="email">Campus email</Label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2"
                  />
                  <Input
                    id="email"
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    placeholder="yourname@pwioi.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <FormError message={error} />

              <Button type="submit" size="lg" disabled={busy || !email.trim()}>
                {busy ? "Sending code…" : "Send sign-in code"}
              </Button>

              <p className="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-muted">
                <ShieldCheck size={12} className="mt-0.5 shrink-0 text-success" />
                Codes expire in 10 minutes. We only use your email to verify that you belong to
                campus.
              </p>
            </form>
          ) : (
            <form onSubmit={verify} className="flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="code">6-digit code</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setCode("");
                      setError(null);
                    }}
                    className="mb-1.5 text-[10px] font-semibold text-primary hover:underline"
                  >
                    Change email
                  </button>
                </div>
                <div className="relative">
                  <KeyRound
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2"
                  />
                  <Input
                    id="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    autoFocus
                    className="pl-10 text-center text-lg font-bold tracking-[0.45em]"
                    placeholder="••••••"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <p className="mt-1.5 text-[10.5px] text-muted">
                  Sent to <span className="font-semibold text-foreground">{email}</span>
                </p>
              </div>

              {devOtp ? (
                <p className="flex items-center gap-1.5 rounded-xl border border-primary/15 bg-primary/10 px-3 py-2 text-[11px] text-primary">
                  <Sparkles size={12} /> Dev mode — your code is{" "}
                  <strong className="tracking-wider">{devOtp}</strong>
                </p>
              ) : null}

              <FormError message={error} />

              <Button type="submit" size="lg" disabled={busy || code.length !== 6}>
                {busy ? "Verifying…" : "Verify & sign in"}
              </Button>

              <button
                type="button"
                disabled={cooldown > 0}
                onClick={() => requestOtp()}
                className="inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-muted transition hover:text-primary disabled:opacity-50"
              >
                <RefreshCw size={11} />
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-[10.5px] leading-relaxed text-muted">
        Code not arriving? Check your spam folder — it comes from VibeZone.{" "}
        <span className="text-muted-2">By continuing you agree to our community guidelines.</span>
      </p>
    </AuthFrame>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center bg-background">
          <div className="vz-panel h-14 w-64 animate-pulse" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
