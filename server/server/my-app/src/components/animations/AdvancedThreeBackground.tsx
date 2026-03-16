'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, Suspense } from 'react';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Animated sphere with distortion
function DistortedSphere() {
  const sphereRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Sphere args={[1, 100, 100]} scale={2.5} ref={sphereRef}>
      <MeshDistortMaterial
        color="#5852cb"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
        transparent
        opacity={0.3}
      />
    </Sphere>
  );
}

// Orbiting rings
function OrbitingRings() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  const rings = [
    { radius: 3, tube: 0.02, color: '#5852cb', rotationOffset: [0, 0, 0] },
    { radius: 3.5, tube: 0.015, color: '#7c3aed', rotationOffset: [Math.PI / 3, Math.PI / 4, 0] },
    { radius: 4, tube: 0.01, color: '#a78bfa', rotationOffset: [Math.PI / 2, Math.PI / 6, 0] },
  ];

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh 
          key={i} 
          rotation={ring.rotationOffset as [number, number, number]}
        >
          <torusGeometry args={[ring.radius, ring.tube, 32, 100]} />
          <meshStandardMaterial 
            color={ring.color}
            transparent
            opacity={0.4}
            emissive={ring.color}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

// Particle field with connections
function ConnectedParticles({ count = 200 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  
  const { positions, connections } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const conns: number[] = [];
    const particles: THREE.Vector3[] = [];
    
    // Create particles in a sphere distribution
    for (let i = 0; i < count; i++) {
      const radius = 4 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      
      particles.push(new THREE.Vector3(x, y, z));
    }
    
    // Create connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const distance = particles[i].distanceTo(particles[j]);
        if (distance < 1.2) {
          conns.push(
            particles[i].x, particles[i].y, particles[i].z,
            particles[j].x, particles[j].y, particles[j].z
          );
        }
      }
    }
    
    return { positions: pos, connections: new Float32Array(conns) };
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.03;
    }
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      linesRef.current.rotation.x = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <>
      {/* Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.04} 
          color="#5852cb" 
          transparent 
          opacity={0.6}
          sizeAttenuation
        />
      </points>
      
      {/* Connection lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[connections, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial 
          color="#5852cb" 
          transparent 
          opacity={0.15}
        />
      </lineSegments>
    </>
  );
}

// Flowing tubes
function FlowingTubes() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  const curves = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => {
      const angle = (i / 3) * Math.PI * 2;
      const radius = 3.5;
      
      const points = [];
      for (let j = 0; j <= 50; j++) {
        const t = j / 50;
        const height = (t - 0.5) * 6;
        const x = Math.cos(angle + t * Math.PI * 4) * radius;
        const z = Math.sin(angle + t * Math.PI * 4) * radius;
        points.push(new THREE.Vector3(x, height, z));
      }
      
      return new THREE.CatmullRomCurve3(points);
    });
  }, []);

  return (
    <group ref={groupRef}>
      {curves.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 50, 0.015, 8, false]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? '#5852cb' : '#7c3aed'}
            transparent
            opacity={0.5}
            emissive={i % 2 === 0 ? '#5852cb' : '#7c3aed'}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

// Scene setup
function Scene() {
  const { camera } = useThree();
  
  useFrame((state) => {
    // Subtle camera movement
    camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
    camera.position.y = Math.cos(state.clock.elapsedTime * 0.15) * 0.3;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#5852cb" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7c3aed" />
      <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.3} penumbra={1} color="#a78bfa" />
      
      {/* 3D Elements */}
      <DistortedSphere />
      <OrbitingRings />
      <ConnectedParticles count={150} />
      <FlowingTubes />
    </>
  );
}

// Loading fallback
function Loader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-2 border-[#5852cb]/30 border-t-[#5852cb] rounded-full animate-spin" />
    </div>
  );
}

// Main component
export const AdvancedThreeBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
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
      </Canvas>
    </div>
  );
};
