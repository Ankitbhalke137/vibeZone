"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

/**
 * Desktop-only 3D floating "campus orbit" for the dashboard hero.
 * Rotating nodes (book, chat, trophy, star) around a center point
 * with glow trails — represents campus life in motion.
 */
export function CampusOrbit() {
  return (
    <div
      className="relative w-full h-[300px] md:h-[360px] overflow-hidden rounded-3xl bg-[var(--vz-card-3)] border border-[var(--vz-border)]"
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        className="absolute inset-0 w-full h-full"
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[5, 5, 8]} intensity={1} color="#7047f5" />
        <pointLight position={[-5, -5, 8]} intensity={0.7} color="#8b5cf6" />

        {/* Orbiting nodes around center */}
        <OrbitingNode position={[2.5, 0, 0]} color="#7047f5" speed={0.35} size={0.7}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#7047f5" transparent opacity={0.7} />
        </OrbitingNode>
        <OrbitingNode position={[-2.5, 0, 0]} color="#a855f7" speed={0.3} size={0.6}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial color="#a855f7" transparent opacity={0.7} />
        </OrbitingNode>
        <OrbitingNode position={[0, 2.5, 0]} color="#8b5cf6" speed={0.4} size={0.5}>
          <icosahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial color="#8b5cf6" transparent opacity={0.75} />
        </OrbitingNode>
        <OrbitingNode position={[0, -2.5, 0]} color="#c084fc" speed={0.25} size={0.65}>
          <torusKnotGeometry args={[0.5, 0.15, 64, 8]} />
          <meshStandardMaterial color="#c084fc" transparent opacity={0.7} />
        </OrbitingNode>

        {/* Connecting orbit lines */}
        <OrbitLine radius={2.5} color="#7047f5" />
        <OrbitLine radius={2.5} color="#a855f7" offset={Math.PI / 2} />

        <Stars radius={40} count={200} factor={2} saturation={0} speed={6} />
      </Canvas>
    </div>
  );
}

function OrbitingNode({
  children,
  position = [0, 0, 0],
  color = "#7047f5",
  speed = 0.3,
  size = 1,
}: {
  children: React.ReactNode;
  position?: [number, number, number];
  color?: string;
  speed?: number;
  size?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const angleRef = useRef(0);
  const [x, y, z] = position;
  const radius = Math.sqrt(x * x + y * y + z * z);

  useFrame((state, delta) => {
    if (ref.current) {
      angleRef.current += delta * speed;
      ref.current.position.x = x + Math.cos(angleRef.current) * radius * 0.6;
      ref.current.position.y = y + Math.sin(angleRef.current) * radius * 0.6;
      ref.current.position.z = z + Math.cos(angleRef.current * 0.5) * 0.8;
      ref.current.rotation.y += delta * speed;
    }
  });

  return (
    <group ref={ref} position={position} scale={[size, size, size]}>
      {children}
      {/* Glow trail */}
      <mesh>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function OrbitLine({
  radius = 3,
  color = "#7047f5",
  offset = 0,
}: {
  radius?: number;
  color?: string;
  offset?: number;
}) {
  const points = [];
  const segments = 64;
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2 + offset;
    points.push(new THREE.Vector3(Math.cos(t) * radius, Math.sin(t) * radius, 0));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineDashedMaterial({
    color,
    transparent: true,
    opacity: 0.15,
    dashSize: 0.4,
    gapSize: 0.4,
  });
  const line = new THREE.Line(geometry, material);
  return <primitive object={line} />;
}
