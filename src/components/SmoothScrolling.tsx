'use client';

import { useEffect, ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import Lenis from 'lenis';

interface SmoothScrollingProps {
  children: ReactNode;
}

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function SmoothScrolling({ children }: SmoothScrollingProps) {
  // Primer efecto tras hidratar: apaga los skeletons (ver globals.css).
  useEffect(() => {
    // Solo en desarrollo: ?skeleton deja los skeletons congelados para revisarlos.
    if (
      process.env.NODE_ENV !== 'production' &&
      new URLSearchParams(window.location.search).has('skeleton')
    ) {
      return;
    }
    document.documentElement.setAttribute('data-hydrated', '');
  }, []);

  useEffect(() => {
    // Con prefers-reduced-motion el scroll vuelve a ser el nativo.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Prevent Lenis from intercepting scroll inside elements marked with data-lenis-prevent
      prevent: (node: Element) => {
        return !!(node as HTMLElement).closest('[data-lenis-prevent]');
      },
    });

    // Expose globally so modals/overlays can stop/start it
    window.__lenis = lenis;

    let rafId: number;

    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  // reducedMotion="user": Framer Motion omite transformaciones (deja solo
  // opacidad) cuando el sistema pide menos movimiento, en todo el sitio.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
