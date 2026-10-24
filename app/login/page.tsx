"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, FormError, Input, Label } from "@/components/ui/form";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/profile";

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
      router.push(data.onboarded ? next : "/onboarding");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <h1 className="mb-1 text-2xl font-bold">Sign in to VibeZone</h1>
      <p className="mb-5 text-sm text-muted">
        Use your campus email — we&apos;ll send a 6-digit code. No passwords.
      </p>

      <Card>
        {step === "email" ? (
          <form onSubmit={requestOtp} className="flex flex-col gap-3">
            <div>
              <Label htmlFor="email">Campus email</Label>
              <Input
                id="email"
                type="email"
                required
                autoFocus
                placeholder="yourname@pwioi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <FormError message={error} />
            <Button type="submit" disabled={busy || !email}>
              {busy ? "Sending…" : "Send sign-in code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={verify} className="flex flex-col gap-3">
            <div>
              <Label htmlFor="code">6-digit code</Label>
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                autoFocus
                className="text-center text-lg tracking-[0.5em]"
                placeholder="••••••"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
              <p className="mt-1.5 text-xs text-muted">
                Sent to <span className="font-medium text-foreground">{email}</span> · expires in 10
                min
              </p>
            </div>

            {devOtp && (
              <p className="rounded-lg bg-accent px-3 py-2 text-xs text-primary">
                Dev mode — your code: <strong>{devOtp}</strong>
              </p>
            )}

            <FormError message={error} />

            <Button type="submit" disabled={busy || code.length !== 6}>
              {busy ? "Verifying…" : "Verify & sign in"}
            </Button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                className="text-muted underline-offset-2 hover:underline"
                onClick={() => setStep("email")}
              >
                Change email
              </button>
              <button
                type="button"
                disabled={cooldown > 0}
                className="text-primary underline-offset-2 hover:underline disabled:opacity-50"
                onClick={() => requestOtp()}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}
      </Card>

      <p className="mt-4 text-center text-xs text-muted">
        Code not arriving? Check spam — it comes from VibeZone.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
