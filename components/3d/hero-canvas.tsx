"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

/**
 * Desktop-only ambient 3D particle canvas for the hero product showcase.
 * Replaces heavy abstract geometric icosahedrons with a subtle, elegant ambient starfield
 * that sits behind the realistic product showcase without blocking interactions.
 */
export function HeroCanvas() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only mount on desktop and when reduced-motion is not preferred
    if (typeof window !== "undefined") {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reducedMotion) {
        setMounted(true);
      }
    }
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -inset-6 -z-10 hidden overflow-hidden rounded-[2.5rem] opacity-70 lg:block"
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      >
        <ambientLight intensity={0.6} />
        <Stars
          radius={45}
          depth={55}
          count={220}
          factor={2.5}
          saturation={0.5}
          speed={1.5}
        />
      </Canvas>
    </div>
  );
}
