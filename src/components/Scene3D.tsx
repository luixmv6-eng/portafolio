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

  // Cursor tracking (no pointer events on canvas — use window)
  const mouse = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

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
      texture.anisotropy = 16;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      return texture;
    });
  }, []);

  useEffect(() => {
    if (panelRefs.current.length < 6 || introPlayedRef.current) return;

    panelRefs.current.forEach((mesh) => {
      if (!mesh) return;
      mesh.scale.set(0.75, 0.75, 0.75);
      mesh.rotation.z = -0.06;
    });

    const introTl = createTimeline();
    panelRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      introTl.add(mesh.scale, { x: [0.75, 1], y: [0.75, 1], z: [0.75, 1], duration: 800 }, i * 90);
      introTl.add(mesh.rotation, { z: [-0.06, 0], duration: 850, easing: 'easeOutBack' }, i * 90);
    });

    introPlayedRef.current = true;
  }, []);

  useEffect(() => {
    if (panelRefs.current.length < 6) return;

    const tl = createTimeline({ autoplay: false, duration: 1600 });

    panelRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const dir = i < 3 ? -1 : 1;
      const spread = Math.abs(i - 2.5) + 0.7;

      tl.add(
        mesh.position,
        {
          x: (i - 2.5) * 0.62 + dir * spread * 1.5,
          y: (i % 2 === 0 ? 0.3 : -0.25) + spread * 0.12,
          z: -2 + spread * 0.65,
          easing: 'easeInOutSine',
        },
        0
      );

      tl.add(mesh.rotation, { y: dir * (0.6 + spread * 0.18), x: dir * 0.07, easing: 'easeOutQuad' }, 0);
    });

    scrollTimelineRef.current = tl;
    return () => { scrollTimelineRef.current = null; };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const y = window.scrollY || 0;
    const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    const targetProgress = Math.min(Math.max(y / max, 0), 1);

    progressRef.current.value += (targetProgress - progressRef.current.value) * 0.07;
    const progress = progressRef.current.value;

    // Smooth mouse
    smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.05;
    smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.05;

    if (scrollTimelineRef.current) {
      scrollTimelineRef.current.seek(progress * scrollTimelineRef.current.duration);
    }

    if (groupRef.current) {
      // Blend continuous rotation with cursor parallax
      const baseY = t * 0.07 + progress * 0.38;
      groupRef.current.rotation.y = baseY + smoothMouse.current.x * 0.12;
      groupRef.current.rotation.x = smoothMouse.current.y * 0.08;
      groupRef.current.position.y = 1.2 - progress * 2.0 + smoothMouse.current.y * 0.15;
      groupRef.current.position.x = Math.sin(t * 0.3) * 0.07 + smoothMouse.current.x * 0.2;
    }

    panelRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const float = Math.sin(t * 1.1 + i * 0.85) * 0.025;
      mesh.position.y += float * (0.15 + progress * 0.28);

      // Subtle cursor tilt per panel
      const panelDir = i < 3 ? -1 : 1;
      mesh.rotation.z = smoothMouse.current.x * panelDir * 0.04 * progress;

      const mat = mesh.material as THREE.MeshStandardMaterial;
      const targetOpacity = 0.18 + progress * 0.55;
      mat.opacity += (targetOpacity - mat.opacity) * 0.06;
      mat.emissiveIntensity = 0.06 + progress * 0.32 + Math.sin(t * 1.6 + i) * 0.018;

      // Cursor proximity glow — panels closer to cursor get brighter
      const panelX = (i - 2.5) * 0.65 * (1 - progress) + (progress * ((i - 2.5) * 0.62 + (i < 3 ? -1 : 1) * (Math.abs(i - 2.5) + 0.7) * 1.5));
      const dist = Math.abs(smoothMouse.current.x * 3 - panelX);
      const proxGlow = Math.max(0, 1 - dist / 2.5) * 0.15;
      mat.emissiveIntensity += proxGlow * progress;
    });
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} color="#38bdf8" />
      <pointLight position={[-3, -2, 1]} intensity={0.65} color="#93c5fd" />
      <pointLight position={[1.6, 2.4, 2.2]} intensity={0.45} color="#22d3ee" />
      <pointLight position={[0, 0, 4]} intensity={0.3} color="#ffffff" />

      {Array.from({ length: 6 }).map((_, i) => (
        <RoundedBox
          key={i}
          ref={(el) => { if (el) panelRefs.current[i] = el; }}
          args={[0.65, 1.82, 0.09]}
          radius={0.055}
          smoothness={6}
          position={[(i - 2.5) * 0.65, 0, -2]}
        >
          <meshStandardMaterial
            map={textures[i]}
            color="#e8f4ff"
            emissive="#0284c7"
            emissiveIntensity={0.06}
            metalness={0.28}
            roughness={0.38}
            transparent
            opacity={0.18}
            envMapIntensity={1.2}
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
      <Canvas dpr={[1, 1.8]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <PerspectiveCamera makeDefault position={[0, 0.4, 8]} fov={42} />
        <ExplodedPortfolioCore />
      </Canvas>
    </div>
  );
}
