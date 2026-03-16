'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';

// Flowing particle wave
function ParticleWave() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 6000;
  
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    
    const gridSize = Math.ceil(Math.sqrt(count));
    let index = 0;
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (index >= count) break;
        
        const x = (i / gridSize - 0.5) * 20;
        const z = (j / gridSize - 0.5) * 20;
        const y = 0;
        
        pos[index * 3] = x;
        pos[index * 3 + 1] = y;
        pos[index * 3 + 2] = z;
        
        // Purple gradient colors
        const colorMix = Math.random();
        if (colorMix < 0.33) {
          cols[index * 3] = 88 / 255;     // #5852cb
          cols[index * 3 + 1] = 82 / 255;
          cols[index * 3 + 2] = 203 / 255;
        } else if (colorMix < 0.66) {
          cols[index * 3] = 124 / 255;    // #7c3aed
          cols[index * 3 + 1] = 58 / 255;
          cols[index * 3 + 2] = 237 / 255;
        } else {
          cols[index * 3] = 167 / 255;    // #a78bfa
          cols[index * 3 + 1] = 139 / 255;
          cols[index * 3 + 2] = 250 / 255;
        }
        
        index++;
      }
    }
    
    return { positions: pos, colors: cols };
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current && pointsRef.current.geometry.attributes.position) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < positions.length / 3; i++) {
        const x = positions[i * 3];
        const z = positions[i * 3 + 2];
        
        // Create wave effect
        const distance = Math.sqrt(x * x + z * z);
        const wave1 = Math.sin(distance * 0.3 - time * 0.8) * 0.8;
        const wave2 = Math.sin(x * 0.2 + time * 0.5) * 0.3;
        const wave3 = Math.cos(z * 0.2 - time * 0.4) * 0.3;
        
        positions[i * 3 + 1] = wave1 + wave2 + wave3;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Gentle rotation
      pointsRef.current.rotation.y = time * 0.03;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.035}
        vertexColors
        transparent 
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Floating orbs
function FloatingOrbs() {
  const groupRef = useRef<THREE.Group>(null);
  
  const orbs = useMemo(() => [
    { position: [3, 2, -2], scale: 0.4, color: '#5852cb', speed: 0.5 },
    { position: [-4, -1, 1], scale: 0.3, color: '#7c3aed', speed: 0.7 },
    { position: [2, -2, -3], scale: 0.35, color: '#a78bfa', speed: 0.6 },
    { position: [-3, 3, 2], scale: 0.25, color: '#8b5cf6', speed: 0.8 },
  ], []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const time = state.clock.elapsedTime * orbs[i].speed;
        child.position.y += Math.sin(time) * 0.002;
        child.position.x += Math.cos(time * 0.7) * 0.001;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh 
          key={i} 
          position={orb.position as [number, number, number]}
          scale={orb.scale}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial 
            color={orb.color}
            transparent
            opacity={0.15}
            emissive={orb.color}
            emissiveIntensity={0.4}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

// Ambient particles
function AmbientParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 800;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    
    return pos;
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.02}
        color="#5852cb"
        transparent 
        opacity={0.3}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Scene
function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#5852cb" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#7c3aed" />
      <pointLight position={[0, 15, 5]} intensity={0.3} color="#a78bfa" />
      
      {/* 3D Elements */}
      <ParticleWave />
      <FloatingOrbs />
      <AmbientParticles />
    </>
  );
}

// Main component
export const ParticleWaveBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 opacity-60">
      <Canvas
        camera={{ position: [0, 3, 10], fov: 60 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
        <color attach="background" args={['#030305']} />
      </Canvas>
    </div>
  );
};
