'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useScroll, ScrollControls, Float, Sphere, PerspectiveCamera, Torus, MeshDistortMaterial } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function AestheticElements() {
  const scroll = useScroll();
  const ribbonRef = useRef<THREE.Mesh>(null);
  const backgroundSphereRef = useRef<THREE.Mesh>(null);
  const particleGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const offset = scroll.offset;
    
    // Depth entry: elements move from z: -100 to z: 0 based on initial scroll/load
    // Then they drift based on scroll
    
    if (ribbonRef.current) {
      ribbonRef.current.position.z = -20 + offset * 30; // Comes from distance
      ribbonRef.current.rotation.y = state.clock.getElapsedTime() * 0.2 + offset * 2;
    }

    if (backgroundSphereRef.current) {
      backgroundSphereRef.current.position.z = -50 + offset * 45;
      backgroundSphereRef.current.position.y = -2 + Math.sin(state.clock.getElapsedTime()) * 1;
    }

    if (particleGroupRef.current) {
      particleGroupRef.current.rotation.z = offset * 0.5;
      particleGroupRef.current.position.z = offset * 20;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.4} />
      <spotLight position={[20, 20, 20]} angle={0.15} penumbra={1} intensity={800} color="#C5A059" />
      <pointLight position={[-20, -20, -20]} intensity={400} color="#ffffff" />
      
      {/* Floating Architectural Ribbon */}
      <Torus ref={ribbonRef} args={[6, 0.01, 16, 100]} rotation={[Math.PI / 3, 0, 0]}>
        <meshStandardMaterial color="#C5A059" metalness={1} roughness={0.1} transparent opacity={0.6} />
      </Torus>

      {/* Organic Distorted Sphere from the Deep */}
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1}>
        <Sphere ref={backgroundSphereRef} args={[3, 64, 64]} position={[8, -5, -40]}>
          <MeshDistortMaterial
            color="#E5E5E0"
            speed={2}
            distort={0.4}
            radius={1}
            transparent
            opacity={0.3}
          />
        </Sphere>
      </Float>

      {/* Depth Particles */}
      <group ref={particleGroupRef}>
        {[...Array(20)].map((_, i) => {
          const x = (((i * 37) % 100) / 100 - 0.5) * 40;
          const y = (((i * 53) % 100) / 100 - 0.5) * 40;
          const z = -((((i * 71) % 100) / 100) * 100);
          const opacity = 0.2 + (((i * 29) % 100) / 100) * 0.8;
          return (
            <mesh key={i} position={[x, y, z]}>
              <Sphere args={[0.02, 8, 8]}>
                <meshStandardMaterial color="#C5A059" transparent opacity={opacity} />
              </Sphere>
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

export default function Scene3D() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 0,
      pointerEvents: 'none',
      background: '#F5F5F0'
    }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} far={200} />
        <ScrollControls pages={5} damping={0.1}>
          <AestheticElements />
        </ScrollControls>
      </Canvas>
    </div>
  );
}
