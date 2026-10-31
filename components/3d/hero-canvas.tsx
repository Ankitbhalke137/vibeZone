"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Desktop-only 3D hero canvas for the landing page.
 * Floating lavender/fuchsia icosahedrons with subtle auto-rotation.
 * Hidden on mobile via parent class (PWA-friendly).
 */
export function HeroCanvas() {
  return (
    <div
      className="relative w-full h-[560px] lg:h-[720px] overflow-hidden rounded-3xl bg-[var(--vz-card-3)] border border-[var(--vz-border)]"
    >
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <OrbitControls enablePan={false} enableZoom={false} autoRotateSpeed={0.5} />
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={0.9} color="#7047f5" />
        <pointLight position={[-10, -5, 10]} intensity={0.6} color="#a855f7" />

        {/* Floating spheres with individual spin */}
        <SpinningMesh position={[0, 0, 0]} speed={0.4}>
          <icosahedronGeometry args={[1.4, 0]} />
          <meshStandardMaterial
            color="#7047f5"
            transparent
            opacity={0.6}
            roughness={0.15}
            metalness={0.5}
            emissive="#a855f7"
            emissiveIntensity={0.25}
          />
        </SpinningMesh>
        <SpinningMesh position={[3, -1.5, -2]} speed={0.3}>
          <icosahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial
            color="#a855f7"
            transparent
            opacity={0.5}
            roughness={0.2}
            metalness={0.4}
          />
        </SpinningMesh>
        <SpinningMesh position={[-3, 1.5, -2]} speed={0.35}>
          <icosahedronGeometry args={[1.1, 0]} />
          <meshStandardMaterial
            color="#8b5cf6"
            transparent
            opacity={0.55}
            roughness={0.15}
            metalness={0.55}
          />
        </SpinningMesh>
        <SpinningMesh position={[4, 2.5, 1]} speed={0.25}>
          <icosahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial
            color="#c084fc"
            transparent
            opacity={0.45}
            roughness={0.25}
            metalness={0.3}
          />
        </SpinningMesh>
        <SpinningMesh position={[-4, -2.5, 1]} speed={0.3}>
          <icosahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial
            color="#7047f5"
            transparent
            opacity={0.5}
            roughness={0.2}
            metalness={0.5}
          />
        </SpinningMesh>

        <Stars radius={60} depth={80} count={350} factor={3} saturation={0} speed={8} />

        {/* Subtle backdrop plane */}
        <mesh position={[0, 0, -10]}>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial
            color="#7047f5"
            transparent
            opacity={0.03}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Canvas>
    </div>
  );
}

function SpinningMesh({
  children,
  position = [0, 0, 0],
  speed = 0.4,
}: {
  children: React.ReactNode;
  position?: [number, number, number];
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * speed;
      ref.current.rotation.x += delta * (speed * 0.7);
    }
  });
  return (
    <mesh ref={ref} position={position}>
      {children}
    </mesh>
  );
}
