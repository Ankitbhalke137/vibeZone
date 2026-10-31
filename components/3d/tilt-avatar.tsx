"use client";

import { useRef } from "react";
import { useSpring, animated } from "react-spring";
import { Avatar } from "@/components/avatar";
import { cn } from "@/lib/utils";

/**
 * Lightweight CSS-3D tilt avatar using react-spring.
 * Tilts gently based on mouse position — premium feel without WebGL.
 * Mobile-safe: tilt disabled on touch/coarse pointer devices.
 */
export function TiltAvatar({
  name,
  handle,
  avatarUrl,
  size = "xl",
  className,
}: {
  name: string;
  handle?: string;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [props, set] = useSpring(() => ({ x: 0, y: 0 }));

  const handleMouseMove = (e: React.MouseEvent) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const rect = ref.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 8;
    const y = -((e.clientY - rect.top - rect.height / 2) / 8);
    set({ x, y });
  };

  const handleMouseLeave = () => set({ x: 0, y: 0 });

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("vz-stage-3d vz-tilt inline-block cursor-pointer", className)}
    >
      {/* rotateY controlled by mouse X */}
      <animated.div style={{ transform: props.x.interpolate((x) => `rotateY(${x}deg)`) }}>
        {/* rotateX controlled by mouse Y */}
        <animated.div style={{ transform: props.y.interpolate((y) => `rotateX(${y}deg)`) }}>
          <div className="relative z-10">
            <Avatar name={name} handle={handle} avatarUrl={avatarUrl} size={size} />
          </div>
        </animated.div>
      </animated.div>
      <div className="absolute inset-0 rounded-full border-2 border-[var(--vz-violet)]/20 pointer-events-none" />
      <div
        className={cn(
          "absolute -inset-0.5 rounded-full opacity-60 pointer-events-none",
          "bg-gradient-to-tr from-[var(--vz-violet)] via-[var(--vz-magenta)] to-[var(--vz-violet)]",
          "animate-[spin_3s_linear_infinite]",
        )}
      />
    </div>
  );
}
