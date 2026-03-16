'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function Ring({ radius, tube, rotation, speed, color }: { 
  radius: number; 
  tube: number; 
  rotation: [number, number, number];
  speed: number;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += speed * 0.002;
      ref.current.rotation.y += speed * 0.001;
    }
  });

  return (
    <mesh ref={ref} rotation={rotation}>
      <torusGeometry args={[radius, tube, 64, 128]} />
      <meshStandardMaterial 
        color={color}
        wireframe
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

function FloatingParticles({ count = 100 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 3 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.0003;
      ref.current.rotation.x += 0.0001;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.015} 
        color="#5852cb" 
        transparent 
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function FloatingIcosahedron() {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.1;
      ref.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={ref} scale={0.6}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial 
          color="#5852cb"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#5852cb" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#a78bfa" />
      
      {/* Multiple Rings - Purple theme */}
      <Ring radius={2.5} tube={0.02} rotation={[0, 0, 0]} speed={1} color="#5852cb" />
      <Ring radius={3} tube={0.015} rotation={[Math.PI / 4, 0, 0]} speed={0.8} color="#a78bfa" />
      <Ring radius={3.5} tube={0.01} rotation={[0, Math.PI / 3, Math.PI / 6]} speed={0.6} color="#5852cb" />
      <Ring radius={4} tube={0.008} rotation={[Math.PI / 2, Math.PI / 4, 0]} speed={0.4} color="#7c3aed" />
      <Ring radius={4.5} tube={0.006} rotation={[Math.PI / 3, 0, Math.PI / 2]} speed={0.3} color="#a78bfa" />
      
      {/* Center Icosahedron */}
      <FloatingIcosahedron />
      
      {/* Floating Particles */}
      <FloatingParticles count={80} />
    </>
  );
}

export function RingScene() {
  return (
    <div className="absolute inset-0 z-0 opacity-70 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
