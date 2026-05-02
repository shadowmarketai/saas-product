import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import type { ProductType } from '@/types';
import { BRAND } from './constants';

interface ProductIcon3DProps {
  productType: ProductType;
}

// --- Individual shape components ---

function VCardShape() {
  return (
    <mesh>
      <boxGeometry args={[1.4, 0.9, 0.05]} />
      <meshStandardMaterial color={BRAND.indigo600} metalness={0.3} roughness={0.4} />
    </mesh>
  );
}

function WebsiteShape() {
  return (
    <group>
      {/* Screen */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.3, 0.9, 0.06]} />
        <meshStandardMaterial color={BRAND.indigo600} metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Stand */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[0.6, 0.15, 0.06]} />
        <meshStandardMaterial color={0x64748b} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Base */}
      <mesh position={[0, -0.55, 0.1]}>
        <boxGeometry args={[0.8, 0.06, 0.3]} />
        <meshStandardMaterial color={0x64748b} metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

function StarShape() {
  return (
    <group>
      {/* 5-pointed star using 5 cones */}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.4, Math.sin(angle) * 0.4, 0]} rotation={[0, 0, angle + Math.PI / 2]}>
            <coneGeometry args={[0.2, 0.55, 4]} />
            <meshStandardMaterial color={BRAND.amber400} metalness={0.3} roughness={0.3} />
          </mesh>
        );
      })}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={BRAND.amber400} metalness={0.3} roughness={0.3} />
      </mesh>
    </group>
  );
}

function QRMenuShape() {
  return (
    <group>
      {/* Plate */}
      <mesh rotation={[Math.PI / 6, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.06, 32]} />
        <meshStandardMaterial color={0xffffff} metalness={0.1} roughness={0.5} />
      </mesh>
      {/* Small cube (food item) */}
      <mesh position={[0, 0.25, -0.05]} rotation={[Math.PI / 6, Math.PI / 4, 0]}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color={BRAND.amber400} metalness={0.2} roughness={0.4} />
      </mesh>
    </group>
  );
}

function PhoneShape() {
  return (
    <group>
      {/* Phone body */}
      <mesh>
        <boxGeometry args={[0.55, 1.0, 0.05]} />
        <meshStandardMaterial color={BRAND.indigo600} metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[0.48, 0.88, 0.01]} />
        <meshStandardMaterial color={0x1e1b4b} metalness={0.1} roughness={0.8} />
      </mesh>
    </group>
  );
}

function LinkTorusShape() {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 6]}>
        <torusGeometry args={[0.35, 0.12, 16, 32]} />
        <meshStandardMaterial color={BRAND.indigo400} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0.3, -0.25, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <torusGeometry args={[0.35, 0.12, 16, 32]} />
        <meshStandardMaterial color={BRAND.amber400} metalness={0.4} roughness={0.3} />
      </mesh>
    </group>
  );
}

function ChatBubbleShape() {
  return (
    <group>
      {/* Bubble body */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={0x25d366} metalness={0.2} roughness={0.4} />
      </mesh>
      {/* Tail */}
      <mesh position={[-0.35, -0.45, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.18, 0.3, 3]} />
        <meshStandardMaterial color={0x25d366} metalness={0.2} roughness={0.4} />
      </mesh>
    </group>
  );
}

// --- Shape selector ---

function ProductShape({ productType }: { productType: ProductType }) {
  switch (productType) {
    case 'vcard': return <VCardShape />;
    case 'website': return <WebsiteShape />;
    case 'google_reviews': return <StarShape />;
    case 'qr_menu': return <QRMenuShape />;
    case 'social_poster': return <PhoneShape />;
    case 'link_in_bio': return <LinkTorusShape />;
    case 'whatsapp_chatbot': return <ChatBubbleShape />;
  }
}

// --- Animated wrapper ---

function AnimatedIcon({ productType, hovered }: { productType: ProductType; hovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const speed = hovered ? 2.5 : 0.5;
    groupRef.current.rotation.y += delta * speed;
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
      <group ref={groupRef} scale={0.75}>
        <ProductShape productType={productType} />
      </group>
    </Float>
  );
}

// --- Main exported component ---

export function ProductIcon3D({ productType }: ProductIcon3DProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="w-20 h-20 mx-auto"
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 3, 3]} intensity={1.5} />
          <AnimatedIcon productType={productType} hovered={hovered} />
        </Suspense>
      </Canvas>
    </div>
  );
}
