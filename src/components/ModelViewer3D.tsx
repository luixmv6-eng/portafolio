'use client';

import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Misma malla que el SVG del diseno (Figma 13:316): cubo en alambre con los
// vertices en naranja y un anillo discontinuo alrededor.
function WireCube() {
  const { edges, vertices, ring } = useMemo(() => {
    const box = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const edges = new THREE.EdgesGeometry(box);
    const pos = box.getAttribute('position');
    const seen = new Set<string>();
    const vertices: [number, number, number][] = [];
    for (let i = 0; i < pos.count; i++) {
      const v: [number, number, number] = [pos.getX(i), pos.getY(i), pos.getZ(i)];
      const key = v.join(',');
      if (!seen.has(key)) {
        seen.add(key);
        vertices.push(v);
      }
    }
    box.dispose();

    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * 1.55, 0, Math.sin(a) * 1.55));
    }
    const ring = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineDashedMaterial({ color: '#ee5f12', dashSize: 0.08, gapSize: 0.06 })
    );
    ring.computeLineDistances();
    return { edges, vertices, ring };
  }, []);

  return (
    <group rotation={[0.52, 0.78, 0]}>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#f7f5f0" />
      </lineSegments>
      {vertices.map((v) => (
        <mesh key={v.join(',')} position={v}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color="#ee5f12" />
        </mesh>
      ))}
      <primitive object={ring} />
    </group>
  );
}

export default function ModelViewer3D({ onReady }: { onReady: () => void }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 38 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      onCreated={() => requestAnimationFrame(onReady)}
    >
      <WireCube />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.6} />
    </Canvas>
  );
}
