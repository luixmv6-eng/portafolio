'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import styles from './Hero.module.css';

// Three.js solo se descarga si este componente decide montarlo.
const HeroSphere3D = dynamic(() => import('./HeroSphere3D'), { ssr: false });

const DESKTOP = '(min-width: 1024px) and (hover: hover) and (pointer: fine)';

// Sin contexto WebGL (GPU bloqueada, navegador sin soporte) se queda el SVG.
const hasWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

interface Props {
  /** Puntero sobre el visor, normalizado a -1..1. */
  mx: MotionValue<number>;
  my: MotionValue<number>;
}

export default function HeroSphere({ mx, my }: Props) {
  const [use3D, setUse3D] = useState(false);
  const [ready, setReady] = useState(false);

  // Escritorio, con movimiento permitido y cuando el navegador esta ocioso: el
  // 3D nunca compite con la primera pintura del hero.
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!desktop.matches || reduced.matches || !hasWebGL()) return;

    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 600));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => setUse3D(true));
    return () => cancel(id);
  }, []);

  // Parallax del SVG mientras el 3D no esta (o en movil/tactil, donde no llega).
  const rotateY = useTransform(mx, [-1, 1], [-14, 14]);
  const rotateX = useTransform(my, [-1, 1], [10, -10]);

  return (
    <motion.div
      className={`${styles.sphere} sk-host`}
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 900 }}
    >
      <motion.div
        className={styles.sphereSvg}
        style={{ rotateX, rotateY }}
        animate={{ opacity: ready ? 0 : 1 }}
        transition={{ duration: 0.6 }}
      >
        <Image src="/v3/esfera.svg" alt="" width={541} height={541} priority unoptimized />
      </motion.div>

      {use3D && (
        <motion.div
          className={styles.sphereCanvas}
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 0.6 }}
        >
          <HeroSphere3D mx={mx} my={my} onReady={() => setReady(true)} />
        </motion.div>
      )}
    </motion.div>
  );
}
