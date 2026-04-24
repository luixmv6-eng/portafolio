'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

const PARTICLE_POSITIONS: [number, number, number][] = [
  [2.2, 0.6, 0.4],
  [-2.0, -0.5, 0.2],
  [0.8, 2.1, -0.3],
  [-1.2, 1.5, 0.6],
  [1.8, -1.4, 0.1],
  [-0.4, -2.0, 0.8],
  [2.6, -0.8, -0.2],
  [-2.4, 1.0, -0.4],
];

function FloatingGeometry() {
  const groupRef = useRef<THREE.Group>(null);
  const icoRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Mesh[]>([]);

  const target = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const prevTarget = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = -(e.clientY / window.innerHeight - 0.5) * 2;
      velocity.current.x = nx - prevTarget.current.x;
      velocity.current.y = ny - prevTarget.current.y;
      prevTarget.current = { x: nx, y: ny };
      target.current = { x: nx, y: ny };
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Smooth following with elastic lerp
    smooth.current.x += (target.current.x - smooth.current.x) * 0.055;
    smooth.current.y += (target.current.y - smooth.current.y) * 0.055;
    velocity.current.x *= 0.88;
    velocity.current.y *= 0.88;

    const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.y ** 2);

    if (icoRef.current) {
      icoRef.current.rotation.x += 0.002 + speed * 0.06;
      icoRef.current.rotation.y += 0.004 + speed * 0.08;
    }

    if (coreRef.current) {
      coreRef.current.rotation.x -= 0.003;
      coreRef.current.rotation.z += 0.005 + speed * 0.05;
      const pulse = 0.44 + Math.sin(t * 2.2) * 0.06;
      coreRef.current.scale.setScalar(pulse);
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += 0.003;
      ring1Ref.current.rotation.y = smooth.current.x * 0.18;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= 0.002;
      ring2Ref.current.rotation.x += 0.001;
    }

    if (ring3Ref.current) {
      ring3Ref.current.rotation.x += 0.0015;
      ring3Ref.current.rotation.z -= 0.0025 + speed * 0.03;
    }

    // Particle orbital drift
    particlesRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.rotation.x += 0.01 + i * 0.003;
      mesh.rotation.y += 0.008 + i * 0.002;
      const orig = PARTICLE_POSITIONS[i];
      mesh.position.y = orig[1] + Math.sin(t * 0.8 + i * 1.2) * 0.12;
      mesh.position.x = orig[0] + Math.cos(t * 0.6 + i * 0.9) * 0.08;
    });

    if (groupRef.current) {
      groupRef.current.rotation.y += (smooth.current.x * 0.55 - groupRef.current.rotation.y) * 0.04;
      groupRef.current.rotation.x += (smooth.current.y * 0.32 - groupRef.current.rotation.x) * 0.04;
      groupRef.current.position.y = Math.sin(t * 0.42) * 0.22;

      // Scale breath on cursor speed
      const targetScale = 1 + speed * 0.35;
      const curS = groupRef.current.scale.x;
      groupRef.current.scale.setScalar(curS + (targetScale - curS) * 0.1);
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Outer wireframe icosahedron — higher detail */}
        <mesh ref={icoRef}>
          <icosahedronGeometry args={[1.85, 2]} />
          <meshStandardMaterial color="#38bdf8" wireframe transparent opacity={0.32} />
        </mesh>

        {/* Mid glass shell */}
        <mesh scale={[0.82, 0.82, 0.82]}>
          <icosahedronGeometry args={[1.85, 1]} />
          <meshStandardMaterial
            color="#0ea5e9"
            transparent
            opacity={0.06}
            metalness={1.0}
            roughness={0.0}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Inner emissive core — pulses */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[1.85, 0]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={0.35}
            metalness={0.95}
            roughness={0.05}
            transparent
            opacity={0.18}
          />
        </mesh>

        {/* Orbit ring 1 — equatorial */}
        <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.5, 0.016, 16, 128]} />
          <meshStandardMaterial
            color="#7dd3fc"
            transparent
            opacity={0.38}
            emissive="#38bdf8"
            emissiveIntensity={0.12}
          />
        </mesh>

        {/* Orbit ring 2 — tilted 50° */}
        <mesh ref={ring2Ref} rotation={[Math.PI / 3.5, 0.7, 0]}>
          <torusGeometry args={[3.0, 0.011, 16, 128]} />
          <meshStandardMaterial
            color="#38bdf8"
            transparent
            opacity={0.22}
            emissive="#0ea5e9"
            emissiveIntensity={0.08}
          />
        </mesh>

        {/* Orbit ring 3 — polar */}
        <mesh ref={ring3Ref} rotation={[0, 0, Math.PI / 5]}>
          <torusGeometry args={[2.1, 0.008, 12, 128]} />
          <meshStandardMaterial color="#818cf8" transparent opacity={0.18} emissive="#818cf8" emissiveIntensity={0.06} />
        </mesh>

        {/* Orbital particles */}
        {PARTICLE_POSITIONS.map(([x, y, z], i) => (
          <mesh
            key={i}
            ref={(el) => { if (el) particlesRef.current[i] = el; }}
            position={[x, y, z]}
          >
            <dodecahedronGeometry args={[0.06 + (i % 3) * 0.02, 0]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#38bdf8' : '#818cf8'}
              emissive={i % 2 === 0 ? '#38bdf8' : '#818cf8'}
              emissiveIntensity={0.4}
              transparent
              opacity={0.65}
            />
          </mesh>
        ))}

        {/* Sparkle particle field */}
        <Sparkles count={40} scale={[7, 7, 7]} size={0.55} speed={0.25} color="#38bdf8" opacity={0.65} />
        <Sparkles count={20} scale={[5, 5, 5]} size={0.35} speed={0.4} color="#818cf8" opacity={0.45} />
      </group>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.5], fov: 40 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 6, 5]} intensity={2.2} color="#38bdf8" />
      <pointLight position={[-4, -3, 2]} intensity={1.6} color="#818cf8" />
      <pointLight position={[3, 4, -2]} intensity={0.9} color="#0ea5e9" />
      <pointLight position={[0, 0, 5]} intensity={0.6} color="#ffffff" />
      <pointLight position={[0, -4, 0]} intensity={0.4} color="#38bdf8" />
      <FloatingGeometry />
    </Canvas>
  );
}
