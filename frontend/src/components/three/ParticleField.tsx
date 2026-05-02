import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 200;
const SPREAD_X = 12;
const SPREAD_Y = 8;
const SPREAD_Z = 6;
const DRIFT_SPEED = 0.15;

export function ParticleField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate initial positions
  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * SPREAD_X * 2;
      arr[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y * 2;
      arr[i * 3 + 2] = -Math.random() * SPREAD_Z;
    }
    return arr;
  }, []);

  // Set initial transforms
  useMemo(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, dummy]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Drift upward
      positions[i * 3 + 1] += delta * DRIFT_SPEED;
      // Slight horizontal sway
      positions[i * 3] += Math.sin(positions[i * 3 + 1] * 0.5 + i) * delta * 0.02;

      // Wrap around when out of bounds
      if (positions[i * 3 + 1] > SPREAD_Y) {
        positions[i * 3 + 1] = -SPREAD_Y;
        positions[i * 3] = (Math.random() - 0.5) * SPREAD_X * 2;
      }

      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[0.02, 6, 6]} />
      <meshBasicMaterial color={0xc7d2fe} transparent opacity={0.5} />
    </instancedMesh>
  );
}
