import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useTheme } from '@/context/ThemeContext';

const PARTICLE_COUNT = 140;
const CONNECTION_DIST = 2.5;

/* ============================================================
   Animated particle network with connecting lines
   ============================================================ */
function ParticleNetwork() {
  const { isDark } = useTheme();
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const { geo, lineGeo, velocities } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const vels = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
      vels[i * 3] = (Math.random() - 0.5) * 0.005;
      vels[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      vels[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const linePositions = new Float32Array(PARTICLE_COUNT * PARTICLE_COUNT * 6);
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lg.setDrawRange(0, 0);

    return { geo: g, lineGeo: lg, velocities: vels };
  }, []);

  useFrame(() => {
    if (!pointsRef.current || !linesRef.current) return;
    const positions = geo.attributes.position.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
      if (Math.abs(positions[i3]) > 8) velocities[i3] *= -1;
      if (Math.abs(positions[i3 + 1]) > 5) velocities[i3 + 1] *= -1;
      if (Math.abs(positions[i3 + 2] + 2) > 4) velocities[i3 + 2] *= -1;
    }
    geo.attributes.position.needsUpdate = true;

    const linePos = lineGeo.attributes.position.array as Float32Array;
    let lineIdx = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < CONNECTION_DIST) {
          linePos[lineIdx++] = positions[i * 3];
          linePos[lineIdx++] = positions[i * 3 + 1];
          linePos[lineIdx++] = positions[i * 3 + 2];
          linePos[lineIdx++] = positions[j * 3];
          linePos[lineIdx++] = positions[j * 3 + 1];
          linePos[lineIdx++] = positions[j * 3 + 2];
        }
      }
    }
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.setDrawRange(0, lineIdx / 3);
  });

  // Dark: bright additive on dark bg. Light: dark colors, normal blending on white bg.
  const pColor = isDark ? '#818cf8' : '#3730a3';
  const lColor = isDark ? '#6366f1' : '#4338ca';
  const blend = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;

  return (
    <>
      <points ref={pointsRef} geometry={geo}>
        <pointsMaterial
          color={pColor}
          size={0.08}
          transparent
          opacity={isDark ? 0.9 : 0.7}
          sizeAttenuation
          blending={blend}
          depthWrite={false}
        />
      </points>
      <lineSegments ref={linesRef} geometry={lineGeo}>
        <lineBasicMaterial
          color={lColor}
          transparent
          opacity={isDark ? 0.18 : 0.2}
          blending={blend}
          depthWrite={false}
        />
      </lineSegments>
    </>
  );
}

/* ============================================================
   Floating wireframe 3D shapes
   ============================================================ */
function FloatingShapes() {
  const { isDark } = useTheme();
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) group.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  const shapes = [
    { pos: [-5, 3, -4] as [number, number, number], scale: 0.6, type: 'ico' },
    { pos: [5, -2, -5] as [number, number, number], scale: 0.5, type: 'torus' },
    { pos: [-3, -3, -3] as [number, number, number], scale: 0.4, type: 'oct' },
    { pos: [4, 2, -6] as [number, number, number], scale: 0.55, type: 'dodec' },
    { pos: [0, 4, -5] as [number, number, number], scale: 0.35, type: 'torusKnot' },
  ];

  // Light: dark indigo wireframes. Dark: bright indigo wireframes.
  const color = isDark ? '#6366f1' : '#312e81';
  const opac = isDark ? 0.15 : 0.2;

  return (
    <group ref={group}>
      {shapes.map((s, i) => (
        <Float key={i} speed={1 + i * 0.3} rotationIntensity={0.4} floatIntensity={0.6}>
          <mesh position={s.pos} scale={s.scale}>
            {s.type === 'ico' && <icosahedronGeometry args={[1, 0]} />}
            {s.type === 'torus' && <torusGeometry args={[1, 0.3, 12, 24]} />}
            {s.type === 'oct' && <octahedronGeometry args={[1, 0]} />}
            {s.type === 'dodec' && <dodecahedronGeometry args={[1, 0]} />}
            {s.type === 'torusKnot' && <torusKnotGeometry args={[0.7, 0.25, 48, 8]} />}
            <meshStandardMaterial color={color} transparent opacity={opac} wireframe metalness={0.5} roughness={0.2} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/* ============================================================
   Glowing orbs
   ============================================================ */
function GlowOrbs() {
  const { isDark } = useTheme();
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.children.forEach((child, i) => {
      const t = state.clock.elapsedTime * 0.15 + i * 2.5;
      child.position.x = Math.sin(t * 0.6) * (4 + i);
      child.position.y = Math.cos(t * 0.4) * (2.5 + i * 0.5);
      child.position.z = -3 + Math.sin(t * 0.3) * 2;
      const pulse = 1 + Math.sin(t * 2) * 0.2;
      child.scale.setScalar(pulse);
    });
  });

  // Light: use dark colors with normal blending. Dark: bright additive.
  const orbs = isDark
    ? [
        { color: 0x6366f1, size: 1.5, o: 0.12 },
        { color: 0x8b5cf6, size: 1.2, o: 0.1 },
        { color: 0x06b6d4, size: 1.8, o: 0.08 },
        { color: 0xec4899, size: 1.0, o: 0.06 },
      ]
    : [
        { color: 0x4338ca, size: 1.5, o: 0.1 },
        { color: 0x6d28d9, size: 1.2, o: 0.08 },
        { color: 0x0e7490, size: 1.8, o: 0.07 },
        { color: 0xbe185d, size: 1.0, o: 0.06 },
      ];

  return (
    <group ref={group}>
      {orbs.map((ob, i) => (
        <mesh key={i} scale={ob.size}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={ob.color}
            transparent
            opacity={ob.o}
            depthWrite={false}
            blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ============================================================
   Main export
   ============================================================ */
export function DashboardBackground() {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[isDark ? '#0B0F19' : '#F0F1F5']} />

        <Suspense fallback={null}>
          <ambientLight intensity={isDark ? 0.3 : 0.5} />
          <pointLight position={[5, 5, 5]} intensity={0.5} color={isDark ? 0x6366f1 : 0x4338ca} />
          <pointLight position={[-5, -3, 3]} intensity={0.3} color={isDark ? 0x06b6d4 : 0x0e7490} />

          <ParticleNetwork />
          <FloatingShapes />
          <GlowOrbs />

          <EffectComposer>
            <Bloom luminanceThreshold={isDark ? 0.2 : 0.4} luminanceSmoothing={0.9} intensity={isDark ? 1.2 : 0.8} mipmapBlur />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
