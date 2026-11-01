"use client";

import { useEffect } from "react";

/** Service worker registration — runs only in the browser */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("[SW] registered:", reg.scope))
        .catch((err) => console.log("[SW] registration failed:", err));
    }
  }, []);
  return null;
}
