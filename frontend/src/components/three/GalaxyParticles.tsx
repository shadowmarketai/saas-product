import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 3000;
const BRANCHES = 5;
const RADIUS = 6;
const SPIN = 1.5;
const RANDOMNESS = 0.4;

const galaxyVertexShader = /* glsl */ `
  attribute float aScale;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uSize;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Twinkle effect
    float twinkle = sin(uTime * 2.0 + position.x * 10.0) * 0.3 + 0.7;
    gl_PointSize = uSize * aScale * twinkle * (200.0 / -mvPosition.z);

    // Fade with distance
    vAlpha = smoothstep(15.0, 3.0, -mvPosition.z) * 0.8;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const galaxyFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Soft circular point with glow
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    float strength = 1.0 - (dist * 2.0);
    strength = pow(strength, 1.5);

    // Inner glow
    float glow = exp(-dist * 4.0) * 0.5;

    vec3 color = vColor * (strength + glow);
    float alpha = (strength + glow) * vAlpha;

    gl_FragColor = vec4(color, alpha);
  }
`;

interface GalaxyParticlesProps {
  mouse: React.RefObject<{ x: number; y: number }>;
}

export function GalaxyParticles({ mouse }: GalaxyParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { geometry, uniforms } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const scales = new Float32Array(PARTICLE_COUNT);

    const colorInner = new THREE.Color(0x6366f1); // indigo
    const colorMid = new THREE.Color(0x8b5cf6);   // violet
    const colorOuter = new THREE.Color(0x06b6d4);  // cyan

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const radius = Math.random() * RADIUS;
      const branchAngle = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;
      const spinAngle = radius * SPIN;

      const randomX = (Math.random() - 0.5) * RANDOMNESS * radius;
      const randomY = (Math.random() - 0.5) * RANDOMNESS * radius * 0.5;
      const randomZ = (Math.random() - 0.5) * RANDOMNESS * radius;

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      // Color gradient from center to edge
      const t = radius / RADIUS;
      const mixedColor = t < 0.5
        ? colorInner.clone().lerp(colorMid, t * 2)
        : colorMid.clone().lerp(colorOuter, (t - 0.5) * 2);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      scales[i] = Math.random() * 0.8 + 0.2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

    const unis = {
      uTime: { value: 0 },
      uSize: { value: 30.0 },
    };

    return { geometry: geo, uniforms: unis };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    uniforms.uTime.value = state.clock.elapsedTime;

    // Slow rotation
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;

    // Mouse tilt
    if (mouse.current) {
      const targetRotX = mouse.current.y * 0.15;
      const targetRotZ = mouse.current.x * 0.1;
      pointsRef.current.rotation.x += (targetRotX - pointsRef.current.rotation.x) * 0.02;
      pointsRef.current.rotation.z += (targetRotZ - pointsRef.current.rotation.z) * 0.02;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry} position={[0, 0, -2]}>
      <shaderMaterial
        vertexShader={galaxyVertexShader}
        fragmentShader={galaxyFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
