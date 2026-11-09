"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/toast";

/** Service worker registration — runs only in the browser */
export function ServiceWorkerRegister() {
  const { toast } = useToast();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("[SW] registration failed:", err);
      toast({
        title: "Notifications unavailable",
        description: "Push notifications could not be enabled on this device.",
        tone: "error",
      });
    });
  }, []);

  return null;
}
