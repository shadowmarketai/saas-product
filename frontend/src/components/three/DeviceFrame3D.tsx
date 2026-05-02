import { useRef, Suspense, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useMousePosition } from './useMousePosition';
import { useReducedMotion } from './useReducedMotion';

interface DeviceFrame3DProps {
  type: 'phone' | 'laptop';
  children: ReactNode;
}

// --- 3D Phone Frame ---
function PhoneFrame({ mouse }: { mouse: React.RefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current || !mouse.current) return;
    const targetRotY = mouse.current.x * 0.08;
    const targetRotX = -mouse.current.y * 0.05;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* Phone body */}
      <RoundedBox args={[2.4, 4.8, 0.25]} radius={0.2} smoothness={4}>
        <meshStandardMaterial color={0x1e1b4b} metalness={0.6} roughness={0.2} />
      </RoundedBox>
      {/* Screen bezel */}
      <RoundedBox args={[2.15, 4.5, 0.02]} radius={0.15} smoothness={4} position={[0, 0, 0.13]}>
        <meshStandardMaterial color={0x0f0f23} metalness={0.1} roughness={0.9} />
      </RoundedBox>
      {/* Camera notch */}
      <mesh position={[0, 2.1, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
        <meshStandardMaterial color={0x333333} metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

// --- 3D Laptop Frame ---
function LaptopFrame({ mouse }: { mouse: React.RefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current || !mouse.current) return;
    const targetRotY = mouse.current.x * 0.06;
    const targetRotX = -mouse.current.y * 0.04;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* Screen panel */}
      <RoundedBox args={[5.2, 3.4, 0.15]} radius={0.1} smoothness={4} position={[0, 0.5, 0]}>
        <meshStandardMaterial color={0x1e1b4b} metalness={0.6} roughness={0.2} />
      </RoundedBox>
      {/* Screen surface */}
      <RoundedBox args={[4.9, 3.1, 0.02]} radius={0.08} smoothness={4} position={[0, 0.5, 0.085]}>
        <meshStandardMaterial color={0x0f0f23} metalness={0.1} roughness={0.9} />
      </RoundedBox>
      {/* Keyboard base */}
      <RoundedBox args={[5.4, 0.15, 3.2]} radius={0.05} smoothness={4} position={[0, -1.3, 1.5]} rotation={[-0.08, 0, 0]}>
        <meshStandardMaterial color={0x334155} metalness={0.5} roughness={0.3} />
      </RoundedBox>
    </group>
  );
}

export function DeviceFrame3D({ type, children }: DeviceFrame3DProps) {
  const mouse = useMousePosition();
  const simplified = useReducedMotion();

  // On mobile, just render children without 3D frame
  if (simplified) {
    return <div className="flex justify-center">{children}</div>;
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen py-8">
      {/* 3D device frame behind */}
      <div className="absolute inset-0 pointer-events-none">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, type === 'phone' ? 6 : 8], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1.5} />
            <pointLight position={[-3, 2, 3]} intensity={0.4} color={0x818cf8} />
            {type === 'phone' ? <PhoneFrame mouse={mouse} /> : <LaptopFrame mouse={mouse} />}
          </Suspense>
        </Canvas>
      </div>

      {/* HTML content overlay */}
      <div className={`relative z-10 ${
        type === 'phone'
          ? 'w-[280px] max-h-[560px] overflow-y-auto rounded-[24px]'
          : 'w-[600px] max-h-[400px] overflow-y-auto rounded-[12px]'
      } shadow-2xl`}>
        {children}
      </div>
    </div>
  );
}
