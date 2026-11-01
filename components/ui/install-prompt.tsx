"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShown(false);
    };
    window.addEventListener("beforeinstallprompt", handler as any);
    return () => window.removeEventListener("beforeinstallprompt", handler as any);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    (deferredPrompt as any).prompt();
    const { outcome } = await (deferredPrompt as any).userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShown(true);
    }
  };

  // Don't show if already installed or already shown
  if (!deferredPrompt || shown) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto sm:max-w-md z-[100]">
      <div className="vz-panel flex items-center justify-between gap-3 p-3 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
            <Download size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold">Install VibeZone</p>
            <p className="text-[9.5px] text-muted">Install as app for quick access</p>
          </div>
        </div>
        <button
          type="button"
          onClick={install}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-primary/30 transition hover:brightness-110"
        >
          Install
        </button>
        <button
          type="button"
          onClick={() => setShown(true)}
          className="rounded-lg p-1.5 text-muted hover:bg-accent transition"
          aria-label="Dismiss"
        >
          <span className="sr-only">Dismiss</span>
          <span className="inline-block w-4 h-4">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-3 h-3"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
