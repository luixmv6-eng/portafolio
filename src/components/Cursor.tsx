'use client';

import { useEffect, useRef } from 'react';

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    const moveCursor = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;

      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;

      ring.animate(
        { left: `${x}px`, top: `${y}px` },
        { duration: 600, fill: 'forwards', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );
    };

    const onEnter = () => ring.classList.add('cursor-hover');
    const onLeave = () => ring.classList.remove('cursor-hover');

    const bindInteractive = () => {
      document.querySelectorAll('a, button, [role="button"], input, textarea, select, label').forEach((el) => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    };

    bindInteractive();
    window.addEventListener('mousemove', moveCursor);

    const observer = new MutationObserver(bindInteractive);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" style={{ transform: 'translate(-50%, -50%)' }} />
      <div ref={dotRef} className="cursor-dot" style={{ transform: 'translate(-50%, -50%)' }} />
    </>
  );
}
