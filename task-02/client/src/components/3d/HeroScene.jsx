import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function QuantumCore() {
  const meshRef = useRef();
  const outerRingRef = useRef();
  const innerRingRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x -= delta * 0.15;
      outerRingRef.current.rotation.z += delta * 0.25;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.y += delta * 0.35;
      innerRingRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <group>
      {/* Central Floating Quantum Sphere */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
        <Sphere ref={meshRef} args={[1.2, 64, 64]}>
          <MeshDistortMaterial
            color="#06b6d4"
            emissive="#0891b2"
            emissiveIntensity={0.6}
            roughness={0.1}
            metalness={0.9}
            distort={0.35}
            speed={2.5}
            wireframe={false}
          />
        </Sphere>
      </Float>

      {/* Futuristic Orbiting Rings */}
      <mesh ref={outerRingRef} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.2, 0.03, 16, 100]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#a855f7"
          emissiveIntensity={1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      <mesh ref={innerRingRef} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[1.8, 0.02, 16, 100]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#22d3ee"
          emissiveIntensity={1.2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

function ParticleField({ count = 120 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      p[i] = (Math.random() - 0.5) * 12;
      p[i + 1] = (Math.random() - 0.5) * 12;
      p[i + 2] = (Math.random() - 0.5) * 12;
    }
    return p;
  }, [count]);

  const pointsRef = useRef();

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
      pointsRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#38bdf8"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function HeroScene({ className = '' }) {
  return (
    <div className={`relative w-full h-[400px] md:h-[500px] select-none pointer-events-auto ${className}`}>
      {/* Background ambient glow behind 3D canvas */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-purple-500/5 to-transparent blur-3xl rounded-full transform -translate-y-4 pointer-events-none" />

      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -5, -5]} color="#06b6d4" intensity={2} />
        <pointLight position={[5, -5, 5]} color="#8b5cf6" intensity={2} />

        <Suspense fallback={null}>
          <QuantumCore />
          <ParticleField />
        </Suspense>
      </Canvas>
    </div>
  );
}
