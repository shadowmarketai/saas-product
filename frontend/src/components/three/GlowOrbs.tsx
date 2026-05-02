import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OrbConfig {
  position: [number, number, number];
  color: number;
  scale: number;
  speed: number;
  amplitude: number;
}

const ORBS: OrbConfig[] = [
  { position: [-5, 3, -3], color: 0x6366f1, scale: 0.4, speed: 0.5, amplitude: 1.2 },
  { position: [5, -2, -4], color: 0x06b6d4, scale: 0.3, speed: 0.7, amplitude: 0.8 },
  { position: [-3, -3, -2], color: 0x8b5cf6, scale: 0.25, speed: 0.4, amplitude: 1.0 },
  { position: [4, 2.5, -5], color: 0xec4899, scale: 0.35, speed: 0.6, amplitude: 1.5 },
  { position: [0, 4, -3.5], color: 0x10b981, scale: 0.2, speed: 0.8, amplitude: 0.6 },
  { position: [-6, 0, -4], color: 0xa855f7, scale: 0.3, speed: 0.35, amplitude: 1.3 },
];

function Orb({ config }: { config: OrbConfig }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const basePos = useMemo(() => new THREE.Vector3(...config.position), [config.position]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * config.speed;

    meshRef.current.position.x = basePos.x + Math.sin(t * 0.7) * config.amplitude;
    meshRef.current.position.y = basePos.y + Math.cos(t * 0.5) * config.amplitude * 0.8;
    meshRef.current.position.z = basePos.z + Math.sin(t * 0.3) * config.amplitude * 0.5;

    // Pulsing scale
    const pulse = 1 + Math.sin(t * 2) * 0.15;
    meshRef.current.scale.setScalar(config.scale * pulse);
  });

  return (
    <mesh ref={meshRef} position={config.position}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial
        color={config.color}
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

export function GlowOrbs() {
  return (
    <group>
      {ORBS.map((config, i) => (
        <Orb key={i} config={config} />
      ))}
    </group>
  );
}
