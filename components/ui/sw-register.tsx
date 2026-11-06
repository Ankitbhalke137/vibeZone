"use client";

import { useEffect } from "react";

/** Service worker registration — runs only in the browser */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.error("[SW] registration failed:", err));
    }
  }, []);
  return null;
}
