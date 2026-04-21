'use client';

import { motion } from 'framer-motion';

export default function AmbientBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <motion.div
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 40, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '10%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
          opacity: 0.12,
          filter: 'blur(60px)',
        }}
      />
      <motion.div
        animate={{
          x: [0, -60, 50, 0],
          y: [0, 70, -40, 0],
          scale: [1, 0.9, 1.2, 1],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '-8%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
          opacity: 0.08,
          filter: 'blur(80px)',
        }}
      />
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -30, 50, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '40%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--foreground) 0%, transparent 70%)',
          opacity: 0.04,
          filter: 'blur(50px)',
        }}
      />
    </div>
  );
}
