"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast";

/** Service worker registration — runs only in the browser */
export function ServiceWorkerRegister() {
  const { toast } = useToast();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("[SW] registration failed:", err);
      if (mounted.current) {
        toast({
          title: "Notifications unavailable",
          description: "Push notifications could not be enabled on this device.",
          tone: "error",
        });
      }
    });
    return () => {
      mounted.current = false;
    };
  }, [toast]);

  return null;
}
