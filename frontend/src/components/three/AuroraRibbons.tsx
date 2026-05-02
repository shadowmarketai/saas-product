import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ribbonVertexShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;

    vec3 pos = position;

    // Flowing wave displacement
    float wave1 = sin(pos.x * 2.0 + uTime * 0.8) * 0.3;
    float wave2 = sin(pos.x * 1.5 - uTime * 0.6 + 2.0) * 0.2;
    float wave3 = cos(pos.x * 3.0 + uTime * 1.2) * 0.15;
    pos.y += wave1 + wave2 + wave3;
    pos.z += sin(pos.x * 1.0 + uTime * 0.4) * 0.5;

    vElevation = wave1 + wave2;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const ribbonFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    // Gradient across the ribbon width (fade edges)
    float edgeFade = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);

    // Length-wise gradient
    float lengthFade = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);

    // Color shift along the ribbon
    float colorMix = sin(vUv.x * 6.28 + uTime * 0.5 + vElevation * 3.0) * 0.5 + 0.5;
    vec3 color = mix(uColorA, uColorB, colorMix);

    // Pulsing brightness
    float pulse = sin(uTime * 0.3 + vUv.x * 3.0) * 0.2 + 0.8;

    float alpha = edgeFade * lengthFade * uOpacity * pulse;
    gl_FragColor = vec4(color * 1.5, alpha);
  }
`;

interface RibbonConfig {
  yOffset: number;
  zOffset: number;
  colorA: THREE.Color;
  colorB: THREE.Color;
  opacity: number;
  width: number;
}

const RIBBONS: RibbonConfig[] = [
  { yOffset: 2.5, zOffset: -4, colorA: new THREE.Color(0x6366f1), colorB: new THREE.Color(0x06b6d4), opacity: 0.12, width: 1.5 },
  { yOffset: -1.0, zOffset: -5, colorA: new THREE.Color(0x8b5cf6), colorB: new THREE.Color(0xec4899), opacity: 0.08, width: 2.0 },
  { yOffset: 0.5, zOffset: -3.5, colorA: new THREE.Color(0x06b6d4), colorB: new THREE.Color(0x10b981), opacity: 0.1, width: 1.2 },
  { yOffset: -3.0, zOffset: -6, colorA: new THREE.Color(0xa855f7), colorB: new THREE.Color(0x6366f1), opacity: 0.06, width: 2.5 },
];

function Ribbon({ config }: { config: RibbonConfig }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: config.colorA },
      uColorB: { value: config.colorB },
      uOpacity: { value: config.opacity },
    }),
    [config]
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh ref={meshRef} position={[0, config.yOffset, config.zOffset]}>
      <planeGeometry args={[20, config.width, 128, 1]} />
      <shaderMaterial
        vertexShader={ribbonVertexShader}
        fragmentShader={ribbonFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export function AuroraRibbons() {
  return (
    <group>
      {RIBBONS.map((config, i) => (
        <Ribbon key={i} config={config} />
      ))}
    </group>
  );
}
