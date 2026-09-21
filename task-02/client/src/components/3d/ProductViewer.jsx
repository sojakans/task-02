import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Box, Cylinder, Torus } from '@react-three/drei';

function TechDeviceMesh({ category }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={1}>
      <group ref={groupRef}>
        {/* Main Circuit Board / Silicon Substrate */}
        <Box args={[2.4, 0.08, 1.8]}>
          <meshStandardMaterial
            color="#0f172a"
            metalness={0.8}
            roughness={0.2}
          />
        </Box>

        {/* Central Gold/Cyan Processor Die */}
        <Box args={[0.9, 0.16, 0.9]} position={[0, 0.06, 0]}>
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#0891b2"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </Box>

        {/* Gold Contacts / Traces */}
        <Box args={[0.3, 0.1, 0.3]} position={[-0.8, 0.05, -0.5]}>
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
        </Box>
        <Box args={[0.3, 0.1, 0.3]} position={[0.8, 0.05, -0.5]}>
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
        </Box>
        <Cylinder args={[0.15, 0.15, 0.25, 16]} position={[-0.7, 0.12, 0.5]}>
          <meshStandardMaterial color="#8b5cf6" metalness={0.7} roughness={0.3} />
        </Cylinder>
        <Cylinder args={[0.15, 0.15, 0.25, 16]} position={[0.7, 0.12, 0.5]}>
          <meshStandardMaterial color="#8b5cf6" metalness={0.7} roughness={0.3} />
        </Cylinder>

        {/* Floating Hologram Ring */}
        <Torus args={[1.5, 0.015, 16, 80]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.6} />
        </Torus>
      </group>
    </Float>
  );
}

export function ProductViewer({ category = 'processor', className = '' }) {
  return (
    <div className={`relative w-full h-64 md:h-80 select-none ${className}`}>
      <Canvas
        camera={{ position: [0, 2, 3.5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-5, 2, -3]} intensity={1} color="#06b6d4" />
        <pointLight position={[3, -2, 2]} intensity={1.5} color="#8b5cf6" />
        <Suspense fallback={null}>
          <TechDeviceMesh category={category} />
        </Suspense>
      </Canvas>
    </div>
  );
}
