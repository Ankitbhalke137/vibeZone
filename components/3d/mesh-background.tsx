"use client";

import { useEffect } from "react";

/**
 * Pure CSS animated mesh gradient background.
 * Works on mobile and desktop without WebGL — safe for PWA.
 * Place this behind page content (z-index: -1).
 */
export function MeshBackground() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("vz-mesh-enabled");
    return () => root.classList.remove("vz-mesh-enabled");
  }, []);

  return (
    <div className="vz-mesh fixed inset-0 z-[-1] overflow-hidden">
      <div className="vz-mesh-blob vz-mesh-blob-1" />
      <div className="vz-mesh-blob vz-mesh-blob-2" />
      <div className="vz-mesh-blob vz-mesh-blob-3" />
    </div>
  );
}
