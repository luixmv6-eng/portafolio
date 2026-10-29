'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';

// Misma esfera que el SVG del diseno (Figma 11:55): contorno + tres paralelos y
// tres meridianos inclinados 15, 31 y 51 grados + ecuador y eje.
const TILTS = [0, 15, 31.3, 51].map((d) => THREE.MathUtils.degToRad(d));
const SEGMENTS = 160;

// Radio de la esfera dentro de su caja: el SVG tiene un inset de 1.79%.
const RADIUS_RATIO = 0.5 - 0.0179;

function circlePoints() {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const a = (i / SEGMENTS) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0));
  }
  return pts;
}

interface Props {
  mx: MotionValue<number>;
  my: MotionValue<number>;
}

function WireSphere({ mx, my }: Props) {
  const group = useRef<THREE.Group>(null);
  // Camara ortografica con zoom 1: una unidad es un pixel, asi que la esfera
  // unitaria se escala al radio que tiene en el diseno.
  const width = useThree((state) => state.size.width);
  const radius = width * RADIUS_RATIO;

  const { geometry, material, rings } = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(circlePoints());
    const material = new THREE.LineBasicMaterial({
      color: '#9c9c97',
      transparent: true,
      opacity: 0.55,
    });
    // [rotacion x, rotacion y] de cada anillo. El circulo base mira a camara.
    const rings: [number, number][] = [[0, 0]];
    TILTS.forEach((t) => {
      rings.push([Math.PI / 2 - t, 0]); // paralelos: plano XZ inclinado
      rings.push([0, Math.PI / 2 - t]); // meridianos: plano YZ inclinado
    });
    return { geometry, material, rings };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  const spin = useRef(0);
  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    // Giro lento propio + parallax con el puntero (notas de motion, 01).
    spin.current += delta * 0.12;
    const targetY = spin.current + mx.get() * 0.6;
    const targetX = -my.get() * 0.4;
    g.rotation.y += (targetY - g.rotation.y) * 0.06;
    g.rotation.x += (targetX - g.rotation.x) * 0.06;
  });

  return (
    <group ref={group} scale={radius}>
      {rings.map(([rx, ry], i) => (
        <lineLoop key={i} geometry={geometry} material={material} rotation={[rx, ry, 0]} />
      ))}
    </group>
  );
}

export default function HeroSphere3D({ mx, my, onReady }: Props & { onReady: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // Fuera de pantalla no se dibuja ni un frame.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1000], near: 1, far: 2000 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        frameloop={visible ? 'always' : 'never'}
        onCreated={() => requestAnimationFrame(onReady)}
      >
        <WireSphere mx={mx} my={my} />
      </Canvas>
    </div>
  );
}
