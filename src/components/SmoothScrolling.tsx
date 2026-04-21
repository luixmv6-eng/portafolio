'use client';

import { useEffect, ReactNode } from 'react';
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
  useEffect(() => {
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

  return <>{children}</>;
}
