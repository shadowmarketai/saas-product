import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uNoiseStrength;
  uniform float uFrequency;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  // Simplex 3D noise
  vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x  = x_ * ns.x + ns.yyyy;
    vec4 y  = y_ * ns.x + ns.yyyy;
    vec4 h  = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  void main() {
    float t = uTime * uSpeed;

    // Multi-octave noise for organic distortion
    float noise1 = snoise(normal * uFrequency + t * 0.3) * 0.5;
    float noise2 = snoise(normal * uFrequency * 2.0 + t * 0.5) * 0.25;
    float noise3 = snoise(normal * uFrequency * 4.0 + t * 0.7) * 0.125;
    float displacement = (noise1 + noise2 + noise3) * uNoiseStrength;

    vDisplacement = displacement;
    vec3 newPosition = position + normal * displacement;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(newPosition, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  void main() {
    // Fresnel / rim glow
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);

    // Iridescent color shift based on view angle + displacement
    float colorMix = sin(vDisplacement * 8.0 + uTime * 0.5) * 0.5 + 0.5;
    float colorMix2 = cos(fresnel * 6.28 + uTime * 0.3) * 0.5 + 0.5;

    vec3 baseColor = mix(uColor1, uColor2, colorMix);
    baseColor = mix(baseColor, uColor3, colorMix2 * 0.5);

    // Add rim glow
    vec3 rimColor = mix(uColor2, uColor3, sin(uTime * 0.4) * 0.5 + 0.5);
    vec3 finalColor = mix(baseColor, rimColor, fresnel * 0.8);

    // Add specular highlights
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float spec = pow(max(dot(reflect(-lightDir, vNormal), viewDir), 0.0), 32.0);
    finalColor += vec3(1.0) * spec * 0.5;

    // Brightness boost on displacement peaks
    finalColor += rimColor * abs(vDisplacement) * 1.5;

    float alpha = 0.85 + fresnel * 0.15;
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

interface MorphBlobProps {
  mouse: React.RefObject<{ x: number; y: number }>;
  scrollProgress: number;
}

export function MorphBlob({ mouse, scrollProgress }: MorphBlobProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: 0.4 },
      uNoiseStrength: { value: 0.35 },
      uFrequency: { value: 1.5 },
      uColor1: { value: new THREE.Color(0x6366f1) }, // indigo
      uColor2: { value: new THREE.Color(0x8b5cf6) }, // violet
      uColor3: { value: new THREE.Color(0x06b6d4) }, // cyan
    }),
    []
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    uniforms.uTime.value = state.clock.elapsedTime;

    // Mouse-driven rotation
    if (mouse.current) {
      const targetRotY = mouse.current.x * 0.3;
      const targetRotX = mouse.current.y * 0.2;
      meshRef.current.rotation.y += (targetRotY - meshRef.current.rotation.y) * 0.02;
      meshRef.current.rotation.x += (targetRotX - meshRef.current.rotation.x) * 0.02;
    }

    // Scroll: scale down and push back
    const scale = 1.8 - scrollProgress * 0.6;
    meshRef.current.scale.setScalar(scale);
    meshRef.current.position.z = -scrollProgress * 3;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <icosahedronGeometry args={[1, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
