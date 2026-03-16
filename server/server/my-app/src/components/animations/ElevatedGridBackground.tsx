'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';

function InteractiveGlowLights() {
  const groupRef = useRef<THREE.Group>(null);
  const mouseLightRef = useRef<THREE.PointLight>(null);
  const lightRefs = useRef<(THREE.PointLight | null)[]>([]);
  const { viewport, mouse } = useThree();

  const lights = useMemo(
    () => [
      {
        position: [-viewport.width / 3, viewport.height / 3, -1] as [number, number, number],
        color: '#5852cb',
        intensity: 2,
        scale: 3,
      },
      {
        position: [viewport.width / 3, -viewport.height / 3, -2] as [number, number, number],
        color: '#7c3aed',
        intensity: 1.5,
        scale: 4,
      },
      {
        position: [0, 0, -3] as [number, number, number],
        color: '#a78bfa',
        intensity: 1,
        scale: 5,
      },
    ],
    [viewport.width, viewport.height]
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Use absolute positions from base coords to avoid cumulative drift
    lights.forEach((light, i) => {
      const ref = lightRefs.current[i];
      if (!ref) return;

      const [bx, by, bz] = light.position;
      ref.position.x = bx + Math.sin(time * 0.5 + i) * 0.2;
      ref.position.y = by + Math.cos(time * 0.4 + i) * 0.2;
      ref.position.z = bz + Math.sin(time * 0.3 + i) * 0.05;
    });

    if (mouseLightRef.current) {
      const targetX = (mouse.x * viewport.width) / 2;
      const targetY = (mouse.y * viewport.height) / 2;

      mouseLightRef.current.position.x = THREE.MathUtils.lerp(
        mouseLightRef.current.position.x,
        targetX,
        0.1
      );
      mouseLightRef.current.position.y = THREE.MathUtils.lerp(
        mouseLightRef.current.position.y,
        targetY,
        0.1
      );
    }
  });

  return (
    <>
      <group ref={groupRef}>
        {lights.map((light, i) => (
          <pointLight
            key={i}
            ref={(el) => {
              lightRefs.current[i] = el;
            }}
            position={light.position}
            color={light.color}
            intensity={light.intensity}
            distance={10}
            decay={2}
          />
        ))}
      </group>

      {/* Interactive mouse light */}
      <pointLight
        ref={mouseLightRef}
        position={[0, 0, 1]}
        color="#ffffff"
        intensity={2.5}
        distance={6}
        decay={2}
      />

      {/* A surface to receive the lights */}
      <mesh position={[0, 0, -5]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#000000" roughness={0.4} metalness={0.8} />
      </mesh>
    </>
  );
}

function FloatingParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1200; // Decreased count for better visibility

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 + 2;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#a78bfa"
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function SecondaryParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 600;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = -state.clock.elapsedTime * 0.03;
      pointsRef.current.rotation.x = -state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#6366f1"
        transparent
        opacity={0.3}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export const ElevatedGridBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0">
      {/* Three.js Layer for Illumination and 3D effects */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
          }}
          style={{ pointerEvents: 'none' }}
          eventSource={containerRef as React.RefObject<HTMLElement>}
          eventPrefix="client"
        >
          <Suspense fallback={null}>
            <InteractiveGlowLights />
            <FloatingParticles />
            <SecondaryParticles />
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full opacity-10 mix-blend-screen animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, rgba(100, 100, 255, 0.3) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animationDuration: '15s'
          }}
        />
        {/* Blob removed as requested */}
         <div 
          className="absolute top-[30%] right-[15%] w-[25vw] h-[25vw] rounded-full opacity-5 mix-blend-screen animate-bounce"
          style={{ 
            background: 'radial-gradient(circle, rgba(50, 200, 200, 0.2) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animationDuration: '20s'
          }}
        />
      </div>

      {/* Global CSS Grid Overlay */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.04] pointer-events-none z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(88, 82, 203, 1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(88, 82, 203, 1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none z-20 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};