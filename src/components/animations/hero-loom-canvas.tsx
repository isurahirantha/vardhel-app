"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

function WovenSphereMesh() {
  const outerRef = useRef<Mesh>(null);
  const innerRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (outerRef.current) {
      outerRef.current.rotation.y += delta * 0.25;
      outerRef.current.rotation.x += delta * 0.12;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.35;
      innerRef.current.rotation.z += delta * 0.18;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 4, 4]} intensity={1.6} color="#fb923c" />
      <directionalLight position={[-4, -3, -2]} intensity={1.2} color="#6366f1" />

      <mesh ref={outerRef}>
        <torusKnotGeometry args={[1.15, 0.28, 128, 24, 2, 3]} />
        <meshStandardMaterial
          color="#ea580c"
          wireframe
          emissive="#ea580c"
          emissiveIntensity={0.35}
        />
      </mesh>

      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.78, 1]} />
        <meshStandardMaterial
          color="#4f46e5"
          wireframe
          emissive="#4f46e5"
          emissiveIntensity={0.45}
        />
      </mesh>
    </group>
  );
}

export default function HeroLoomCanvas() {
  return (
    <div
      aria-hidden="true"
      className="h-[340px] w-full sm:h-[400px]"
    >
      <Canvas camera={{ position: [0, 0, 3.6], fov: 45 }}>
        <WovenSphereMesh />
      </Canvas>
    </div>
  );
}
