"use client";

import { useEffect, useState, useCallback } from "react";
import { BellOff, Bell, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export interface PushSubscribeProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  className?: string;
}

/**
 * Client-side Web Push subscription.
 * Subscribes via the PushManager and posts the subscription to /api/push/subscribe.
 * Requires NEXT_PUBLIC_VAPID_PUBLIC_KEY to be set.
 */
export function PushSubscribe({
  enabled,
  onChange,
  className,
}: PushSubscribeProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<"idle" | "subscribing" | "subscribed" | "unsupported" | "error">("idle");

  const vapidPublicKey = typeof process !== "undefined" && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  const subscribe = useCallback(async () => {
    if (!("PushManager" in window)) {
      setStatus("unsupported");
      toast({ title: "Push not supported", description: "Your browser doesn't support push notifications.", tone: "error" });
      return;
    }

    if (!vapidPublicKey) {
      setStatus("error");
      toast({ title: "Push not configured", description: "VAPID public key is missing on the server.", tone: "error" });
      return;
    }

    setStatus("subscribing");
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource,
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          p256dh: arrayToBase64(subscription.getKey("p256dh")!),
          auth: arrayToBase64(subscription.getKey("auth")!),
        }),
      });

      if (!res.ok) throw new Error("Subscribe request failed.");

      setStatus("subscribed");
      onChange(true);
      toast({ title: "Push notifications enabled", tone: "success" });
    } catch (err) {
      setStatus("error");
      toast({ title: "Failed to enable push", description: err instanceof Error ? err.message : "Unknown error", tone: "error" });
    }
  }, [vapidPublicKey, onChange, toast]);

  const unsubscribe = useCallback(async () => {
    setStatus("subscribing");
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      setStatus("idle");
      onChange(false);
      toast({ title: "Push notifications disabled", tone: "success" });
    } catch (err) {
      setStatus("error");
      toast({ title: "Failed to disable push", tone: "error" });
    }
  }, [onChange, toast]);

  // Check existing subscription on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (cancelled) return;
        if (subscription) {
          setStatus("subscribed");
          if (!enabled) onChange(true);
        } else {
          setStatus("idle");
          if (enabled) onChange(false);
        }
      } catch {
        if (cancelled) return;
        setStatus("idle");
      }
    })();
    return () => { cancelled = true; };
  }, [enabled, onChange]);

  const isSubscribed = status === "subscribed";
  const shouldShow = status !== "subscribed";

  if (!shouldShow) return null;

  const isLoading = status === "subscribing";

  if (status === "unsupported") {
    return (
      <div className={cn("flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted", className)}>
        <BellOff size={12} /> Push notifications not supported by this browser
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={cn("flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 px-3 py-2 text-xs font-medium text-danger", className)}>
        <AlertCircle size={12} /> Push notifications not configured
      </div>
    );
  }

  return (
    <Button
      onClick={subscribe}
      disabled={isLoading}
      size="sm"
      variant={isSubscribed ? "secondary" : "outline"}
      className={cn("w-full md:w-auto", className)}
    >
      {isLoading ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Bell size={14} className="mr-2" />}
      {isLoading ? "Enabling…" : isSubscribed ? "Disable push" : "Enable push notifications"}
    </Button>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

function arrayToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
