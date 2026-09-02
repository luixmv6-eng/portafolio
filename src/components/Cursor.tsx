'use client';

import { useEffect, useRef } from 'react';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label';

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    // Solo donde hay un mouse real y el usuario no pidio menos movimiento.
    const canUse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canUse || reduced) return;

    const root = document.documentElement;
    root.classList.add('has-custom-cursor');

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...target };
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };

    // transform en vez de left/top: no dispara layout en cada frame.
    const loop = () => {
      ringPos.x += (target.x - ringPos.x) * 0.18;
      ringPos.y += (target.y - ringPos.y) * 0.18;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Delegacion: dos listeners fijos en lugar de re-vincular todo el DOM cada
    // vez que muta. La version anterior acumulaba listeners duplicados sin
    // quitarlos nunca.
    const onOver = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.(INTERACTIVE)) {
        ring.classList.add('cursor-hover');
      }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.(INTERACTIVE)) {
        ring.classList.remove('cursor-hover');
      }
    };

    // Ocultar cuando el puntero sale de la ventana.
    const onLeaveWindow = () => {
      ring.style.opacity = '0';
      dot.style.opacity = '0';
    };
    const onEnterWindow = () => {
      ring.style.opacity = '1';
      dot.style.opacity = '1';
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    document.addEventListener('mouseleave', onLeaveWindow);
    document.addEventListener('mouseenter', onEnterWindow);

    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('mouseleave', onLeaveWindow);
      document.removeEventListener('mouseenter', onEnterWindow);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
