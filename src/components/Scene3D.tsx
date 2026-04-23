'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, RoundedBox } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import { createTimeline } from 'animejs';
import * as THREE from 'three';

function ExplodedPortfolioCore() {
  const groupRef = useRef<THREE.Group>(null);
  const panelRefs = useRef<THREE.Mesh[]>([]);
  const progressRef = useRef({ value: 0 });
  const introPlayedRef = useRef(false);
  const scrollTimelineRef = useRef<ReturnType<typeof createTimeline> | null>(null);

  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const paths = [
      '/imagenes/castilla/Captura de pantalla 2026-04-21 102654.png',
      '/imagenes/riopaila/Captura de pantalla 2026-04-21 104422.png',
      '/imagenes/tessuti/Captura de pantalla 2026-04-21 104610.png',
      '/imagenes/modelado 3d/coca cola4k .jpg',
      '/imagenes/diseño/poster grunge.jpg',
      '/imagenes/fotografia/Captura de pantalla 2026-04-21 103549.png',
    ];

    return paths.map((path) => {
      const texture = loader.load(path);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
    });
  }, []);

  useEffect(() => {
    if (panelRefs.current.length < 6 || introPlayedRef.current) return;

    panelRefs.current.forEach((mesh) => {
      if (!mesh) return;
      mesh.scale.set(0.8, 0.8, 0.8);
      mesh.rotation.z = -0.08;
    });

    const introTl = createTimeline();

    panelRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      introTl.add(
        mesh.scale,
        {
          x: [0.8, 1],
          y: [0.8, 1],
          z: [0.8, 1],
          duration: 650,
        },
        i * 70
      );

      introTl.add(
        mesh.rotation,
        {
          z: [-0.08, 0],
          duration: 700,
          easing: 'easeOutBack',
        },
        i * 70
      );
    });

    introPlayedRef.current = true;
  }, []);

  useEffect(() => {
    if (panelRefs.current.length < 6) return;

    const tl = createTimeline({ autoplay: false, duration: 1500 });

    panelRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const dir = i < 3 ? -1 : 1;
      const spreadFactor = Math.abs(i - 2.5) + 0.75;

      tl.add(
        mesh.position,
        {
          x: (i - 2.5) * 0.65 + dir * spreadFactor * 1.55,
          y: (i % 2 === 0 ? 0.35 : -0.28) + spreadFactor * 0.15,
          z: -2 + spreadFactor * 0.68,
          easing: 'easeInOutSine',
        },
        0
      );

      tl.add(
        mesh.rotation,
        {
          y: dir * (0.65 + spreadFactor * 0.2),
          x: dir * 0.08,
          easing: 'easeOutQuad',
        },
        0
      );
    });

    scrollTimelineRef.current = tl;

    return () => {
      scrollTimelineRef.current = null;
    };
  }, []);

  useFrame((state) => {
    const y = window.scrollY || 0;
    const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    const targetProgress = Math.min(Math.max(y / max, 0), 1);

    progressRef.current.value += (targetProgress - progressRef.current.value) * 0.08;
    const progress = progressRef.current.value;

    if (scrollTimelineRef.current) {
      scrollTimelineRef.current.seek(progress * scrollTimelineRef.current.duration);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.08 + progress * 0.42;
      groupRef.current.position.y = 1.35 - progress * 2.25;
      groupRef.current.position.x = Math.sin(state.clock.getElapsedTime() * 0.35) * 0.08;
    }

    panelRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const floatOffset = Math.sin(state.clock.getElapsedTime() * 1.35 + i * 0.9) * 0.035;
      mesh.position.y += floatOffset * (0.18 + progress * 0.3);

      const material = mesh.material as THREE.MeshStandardMaterial;
      material.opacity = 0.35 + progress * 0.55;
      material.emissiveIntensity = 0.08 + progress * 0.35 + Math.sin(state.clock.getElapsedTime() * 2 + i) * 0.02;
    });
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.58} />
      <directionalLight position={[3, 4, 2]} intensity={1.25} color="#38bdf8" />
      <pointLight position={[-3, -2, 1]} intensity={0.7} color="#93c5fd" />
      <pointLight position={[1.6, 2.4, 2.2]} intensity={0.45} color="#22d3ee" />

      {Array.from({ length: 6 }).map((_, i) => (
        <RoundedBox
          key={i}
          ref={(el) => {
            if (el) panelRefs.current[i] = el;
          }}
          args={[0.65, 1.82, 0.09]}
          radius={0.035}
          smoothness={4}
          position={[(i - 2.5) * 0.65, 0, -2]}
        >
          <meshStandardMaterial
            map={textures[i]}
            color="#f8fafc"
            emissive="#0284c7"
            emissiveIntensity={0.08}
            metalness={0.28}
            roughness={0.4}
            transparent
            opacity={0.35}
          />
        </RoundedBox>
      ))}
    </group>
  );
}

export default function Scene3D() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: 'transparent',
      }}
    >
      <Canvas dpr={[1, 1.5]}>
        <PerspectiveCamera makeDefault position={[0, 0.4, 8]} fov={42} />
        <ExplodedPortfolioCore />
      </Canvas>
    </div>
  );
}
