import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { BRAND } from './constants';

interface FloatingShapesProps {
  mouse: React.RefObject<{ x: number; y: number }>;
  scrollProgress: number;
}

interface ShapeConfig {
  position: [number, number, number];
  color: number;
  parallax: number;
  rotSpeed: number;
  type: 'icosahedron' | 'torusKnot' | 'octahedron' | 'dodecahedron' | 'torus';
  scale: number;
  wireframe: boolean;
  opacity: number;
}

const SHAPES: ShapeConfig[] = [
  { position: [-3.5, 2, -2], color: BRAND.indigo400, parallax: 0.6, rotSpeed: 0.3, type: 'icosahedron', scale: 1.2, wireframe: true, opacity: 0.25 },
  { position: [3.8, 1.5, -1], color: BRAND.amber400, parallax: 0.4, rotSpeed: 0.5, type: 'torusKnot', scale: 0.6, wireframe: false, opacity: 0.15 },
  { position: [-2, -2.5, -3], color: BRAND.indigo300, parallax: 0.8, rotSpeed: 0.2, type: 'octahedron', scale: 1.0, wireframe: true, opacity: 0.2 },
  { position: [4, -1.5, -2], color: BRAND.amber300, parallax: 0.3, rotSpeed: 0.4, type: 'dodecahedron', scale: 0.8, wireframe: true, opacity: 0.18 },
  { position: [0, 3, -4], color: BRAND.indigo600, parallax: 0.5, rotSpeed: 0.35, type: 'torus', scale: 1.0, wireframe: false, opacity: 0.12 },
  { position: [-4, 0, -1.5], color: BRAND.amber400, parallax: 0.7, rotSpeed: 0.25, type: 'icosahedron', scale: 0.7, wireframe: false, opacity: 0.15 },
  { position: [2, -3, -2.5], color: BRAND.indigo400, parallax: 0.45, rotSpeed: 0.3, type: 'octahedron', scale: 0.9, wireframe: true, opacity: 0.22 },
];

function Shape({ config, mouse, scrollProgress }: { config: ShapeConfig; mouse: FloatingShapesProps['mouse']; scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const basePos = useMemo(() => new THREE.Vector3(...config.position), [config.position]);

  useFrame((_, delta) => {
    if (!meshRef.current || !mouse.current) return;
    const mesh = meshRef.current;

    // Rotation
    mesh.rotation.x += delta * config.rotSpeed;
    mesh.rotation.y += delta * config.rotSpeed * 0.7;

    // Mouse parallax — lerp toward mouse offset
    const targetX = basePos.x + mouse.current.x * config.parallax * 2;
    const targetY = basePos.y + mouse.current.y * config.parallax * 1.5;
    mesh.position.x += (targetX - mesh.position.x) * 0.02;
    mesh.position.y += (targetY - mesh.position.y) * 0.02;

    // Scroll scatter — push shapes outward and fade
    const scatter = scrollProgress * 3;
    mesh.position.z = basePos.z - scatter;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.opacity = config.opacity * (1 - scrollProgress * 0.8);
  });

  const geometry = useMemo(() => {
    switch (config.type) {
      case 'icosahedron': return <icosahedronGeometry args={[1, 0]} />;
      case 'torusKnot': return <torusKnotGeometry args={[0.6, 0.2, 64, 16]} />;
      case 'octahedron': return <octahedronGeometry args={[1, 0]} />;
      case 'dodecahedron': return <dodecahedronGeometry args={[1, 0]} />;
      case 'torus': return <torusGeometry args={[0.7, 0.25, 16, 32]} />;
    }
  }, [config.type]);

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={config.position} scale={config.scale}>
        {geometry}
        <meshStandardMaterial
          color={config.color}
          transparent
          opacity={config.opacity}
          wireframe={config.wireframe}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>
    </Float>
  );
}

export function FloatingShapes({ mouse, scrollProgress }: FloatingShapesProps) {
  return (
    <group>
      {SHAPES.map((config, i) => (
        <Shape key={i} config={config} mouse={mouse} scrollProgress={scrollProgress} />
      ))}
    </group>
  );
}
