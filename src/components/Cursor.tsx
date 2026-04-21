'use client';

import { useEffect, useRef } from 'react';

export default function Cursor() {
  const blobRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      
      if (dotRef.current) {
        dotRef.current.style.left = `${clientX}px`;
        dotRef.current.style.top = `${clientY}px`;
      }
      
      if (blobRef.current) {
        blobRef.current.animate({
          left: `${clientX}px`,
          top: `${clientY}px`
        }, { duration: 800, fill: "forwards", easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
      }
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <>
      <div 
        ref={blobRef} 
        className="cursor-blob" 
        style={{ transform: 'translate(-50%, -50%)' }} 
      />
      <div 
        ref={dotRef} 
        className="cursor-dot" 
        style={{ transform: 'translate(-50%, -50%)' }} 
      />
    </>
  );
}
