import { Suspense, useCallback, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { MorphBlob } from './MorphBlob';
import { AuroraRibbons } from './AuroraRibbons';
import { GalaxyParticles } from './GalaxyParticles';
import { GlowOrbs } from './GlowOrbs';
import { useMousePosition } from './useMousePosition';
import { useReducedMotion } from './useReducedMotion';
import * as THREE from 'three';

function DarkFallback() {
  return (
    <div
      className="fixed inset-0 -z-10"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #1e1145 0%, #0a0a1a 50%, #000000 100%)',
      }}
    />
  );
}

export function HeroScene() {
  const simplified = useReducedMotion();
  const mouse = useMousePosition();
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const maxScroll = window.innerHeight;
    const progress = Math.min(window.scrollY / maxScroll, 1);
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (simplified) {
    return <DarkFallback />;
  }

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        {/* Dark space background */}
        <color attach="background" args={['#050510']} />
        <fog attach="fog" args={['#050510', 8, 25]} />

        <Suspense fallback={null}>
          {/* Subtle ambient + colored point lights */}
          <ambientLight intensity={0.15} />
          <pointLight position={[5, 5, 5]} intensity={0.8} color={0x6366f1} distance={20} />
          <pointLight position={[-5, -3, 3]} intensity={0.5} color={0x06b6d4} distance={15} />
          <pointLight position={[0, 3, -2]} intensity={0.4} color={0x8b5cf6} distance={12} />

          {/* Background layers */}
          <AuroraRibbons />
          <GalaxyParticles mouse={mouse} />
          <GlowOrbs />

          {/* Central hero element */}
          <MorphBlob mouse={mouse} scrollProgress={scrollProgress} />

          {/* Post-processing for premium glow */}
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              intensity={1.5}
              mipmapBlur
            />
            <Vignette
              blendFunction={BlendFunction.NORMAL}
              darkness={0.7}
              offset={0.3}
            />
          </EffectComposer>

          <AdaptiveDpr pixelated />
        </Suspense>
      </Canvas>
    </div>
  );
}
