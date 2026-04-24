'use client';

import { ReactElement, useEffect, useRef, useState } from 'react';

const CHAPTERS = [
  {
    index: '01',
    tag: 'ORIGEN',
    title: 'Curioso por\nnaturaleza',
    body: 'Desde el primer render en Blender hasta el primer deploy en producción, siempre busqué la intersección entre lo visual y lo funcional. La ingeniería multimedia no fue una elección — fue un destino.',
  },
  {
    index: '02',
    tag: 'DISEÑO',
    title: 'Donde el arte\nmeets el código',
    body: 'El diseño no es decoración — es arquitectura invisible. Cada píxel, cada transición, cada jerarquía tipográfica cuenta una historia antes de que el usuario lea una sola palabra.',
  },
  {
    index: '03',
    tag: 'CONSTRUCCIÓN',
    title: 'PWAs que\nrespiran',
    body: 'Construyo plataformas escalables con Next.js, Supabase e IA integrada. Plataformas que no solo funcionan — que piensan, aprenden y se adaptan a quien las usa.',
  },
  {
    index: '04',
    tag: 'VISIÓN',
    title: 'Contigo,\nlo siguiente',
    body: 'El mejor trabajo surge de la colaboración. Aporto rigor técnico, criterio visual y energía creativa. ¿Qué construimos juntos?',
  },
];

export default function ImmersiveJourney() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);
  const [localProgress, setLocalProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const smoothRef = useRef({ x: 0, y: 0 });

  // Chapter-local progress [0..1] within current chapter
  const chapterProgressRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const totalH = wrapperRef.current.offsetHeight - window.innerHeight;
      if (totalH <= 0) return;

      const scrolled = -rect.top;
      const clamped = Math.min(Math.max(scrolled / totalH, 0), 1);
      setLocalProgress(clamped);

      const rawIdx = clamped * CHAPTERS.length;
      const idx = Math.min(Math.floor(rawIdx), CHAPTERS.length - 1);
      const cp = rawIdx - Math.floor(rawIdx);
      chapterProgressRef.current = cp;
      setChapter(idx);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const loop = () => {
      smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.07;
      smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.07;

      // Move cursor glow
      const follower = stickyRef.current?.querySelector('.ij-follower') as HTMLElement | null;
      if (follower) {
        follower.style.transform = `translate(calc(-50% + ${smoothRef.current.x * 80}px), calc(-50% + ${smoothRef.current.y * 50}px))`;
      }

      // Subtle radial bg shift
      if (bgRef.current) {
        const bx = 50 + smoothRef.current.x * 6;
        const by = 42 + smoothRef.current.y * 5;
        bgRef.current.style.background = `radial-gradient(ellipse 70% 55% at ${bx}% ${by}%, rgba(var(--accent-rgb), 0.065) 0%, transparent 70%)`;
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      id="journey"
      style={{ height: `${CHAPTERS.length * 100 + 40}vh`, position: 'relative' }}
    >
      <div
        ref={stickyRef}
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          background: 'var(--background)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Radial gradient bg — mouse driven */}
        <div
          ref={bgRef}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse 70% 55% at 50% 42%, rgba(var(--accent-rgb), 0.065) 0%, transparent 70%)',
          }}
        />

        {/* Cursor glow */}
        <div
          className="ij-follower"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(var(--accent-rgb),0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
            willChange: 'transform',
          }}
        />

        {/* Top meta row */}
        <div style={{
          position: 'absolute',
          top: '2.5rem',
          left: '4vw',
          right: '4vw',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
        }}>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '0.58rem',
            letterSpacing: '0.38em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            opacity: 0.7,
          }}>◆ HISTORIA</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span style={{
            fontFamily: 'monospace',
            fontSize: '0.58rem',
            letterSpacing: '0.28em',
            opacity: 0.35,
          }}>
            {String(chapter + 1).padStart(2, '0')} / {String(CHAPTERS.length).padStart(2, '0')}
          </span>
        </div>

        {/* Chapter stepper — right side */}
        <div style={{
          position: 'absolute',
          right: '2.5vw',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          {CHAPTERS.map((_, i) => (
            <div key={i} style={{
              width: i === chapter ? '26px' : '7px',
              height: '2px',
              borderRadius: '2px',
              background: i === chapter ? 'var(--accent)' : 'var(--border-subtle)',
              opacity: i <= chapter ? 1 : 0.4,
              transition: 'all 0.45s cubic-bezier(0.16,1,0.3,1)',
            }} />
          ))}
        </div>

        {/* Progress bar */}
        <div style={{
          position: 'absolute',
          left: 0, bottom: 0,
          height: '2px',
          width: `${localProgress * 100}%`,
          background: 'var(--accent)',
          opacity: 0.6,
          transition: 'width 0.06s linear',
        }} />

        {/* Chapter slides — all stacked with CSS crossfade */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '1100px', padding: '0 5vw', zIndex: 2 }}>
          {CHAPTERS.map((ch, i) => {
            const isActive = i === chapter;
            const isPast = i < chapter;

            const opacity = isActive ? 1 : 0;
            const ty = isActive ? 0 : (isPast ? -45 : 45);

            // Progress within active chapter for SVG visuals
            const raw = localProgress * CHAPTERS.length;
            const chLocal = Math.min(Math.max(raw - i, 0), 1);
            const visualProgress = isActive ? Math.min(chLocal * 3, 1) : (isPast ? 1 : 0);

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  transform: `translateY(calc(-50% + ${ty}px))`,
                  opacity,
                  pointerEvents: isActive ? 'auto' : 'none',
                  willChange: 'transform, opacity',
                  transition: 'opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'clamp(2rem, 5vw, 6rem)',
                  alignItems: 'center',
                }}>
                  {/* Left: text */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.8rem' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '0.6rem',
                        letterSpacing: '0.4em',
                        color: 'var(--accent)',
                        opacity: 0.85,
                      }}>{ch.index}</span>
                      <div style={{ width: '30px', height: '1px', background: 'var(--accent)', opacity: 0.45 }} />
                      <span style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.6rem',
                        letterSpacing: '0.35em',
                        textTransform: 'uppercase',
                        opacity: 0.5,
                      }}>{ch.tag}</span>
                    </div>

                    <h2 style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(2.4rem, 5vw, 5rem)',
                      lineHeight: 1.1,
                      fontWeight: 400,
                      marginBottom: '2.2rem',
                      whiteSpace: 'pre-line',
                    }}>
                      {ch.title}
                    </h2>

                    <p style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'clamp(0.95rem, 1.15vw, 1.12rem)',
                      lineHeight: 1.9,
                      opacity: 0.7,
                      maxWidth: '440px',
                    }}>
                      {ch.body}
                    </p>
                  </div>

                  {/* Right: visual */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <ChapterVisual index={i} progress={visualProgress} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Spacer so absolute children have context */}
          <div style={{ height: '60vh', pointerEvents: 'none' }} />
        </div>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          opacity: localProgress > 0.88 ? 0 : 0.38,
          transition: 'opacity 0.6s ease',
        }}>
          <span style={{ fontFamily: 'monospace', fontSize: '0.48rem', letterSpacing: '0.35em', textTransform: 'uppercase' }}>
            SCROLL
          </span>
          <div style={{
            width: '1px',
            height: '26px',
            background: 'var(--foreground)',
            transformOrigin: 'top center',
            animation: 'ij-hint 1.9s ease-in-out infinite',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes ij-hint {
          0%, 100% { transform: scaleY(0.25); opacity: 0.25; }
          55%       { transform: scaleY(1); opacity: 0.65; }
        }
        @keyframes ij-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes ij-spin-rev {
          to { transform: rotate(-360deg); }
        }
        @keyframes ij-pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50%       { transform: scale(1.14); opacity: 0.14; }
        }
        @media (max-width: 768px) {
          #journey > div > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function ChapterVisual({ index, progress }: { index: number; progress: number }) {
  const S = 240;
  const C = S / 2;

  if (index === 0) {
    return (
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="ij-rg0" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r={85} fill="url(#ij-rg0)" opacity={progress} />
        {[45, 65, 88, 108].map((r, i) => (
          <circle
            key={i}
            cx={C} cy={C} r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={i % 2 === 0 ? 0.9 : 0.45}
            strokeDasharray={`${r * 0.55} ${r * 0.45}`}
            opacity={(0.18 + i * 0.07) * progress}
            style={{
              animation: `${i % 2 === 0 ? 'ij-spin' : 'ij-spin-rev'} ${9 + i * 4}s linear infinite`,
              transformOrigin: `${C}px ${C}px`,
            }}
          />
        ))}
        <circle cx={C} cy={C} r={18} fill="var(--accent)" opacity={0.22 * progress} />
        <circle cx={C} cy={C} r={8} fill="var(--accent)" opacity={0.7 * progress} />
        <circle cx={C} cy={C} r={22} fill="none" stroke="var(--accent)" strokeWidth={1}
          opacity={0.45 * progress}
          style={{ animation: 'ij-pulse 2.2s ease-in-out infinite', transformOrigin: `${C}px ${C}px` }} />
      </svg>
    );
  }

  if (index === 1) {
    const gridLines: ReactElement[] = [];
    for (let k = 1; k < 4; k++) {
      const op = (0.2 + (k === 2 ? 0.15 : 0)) * progress;
      gridLines.push(
        <line key={`v${k}`} x1={C - 85 + k * 56} y1={C - 85} x2={C - 85 + k * 56} y2={C + 85}
          stroke="var(--accent)" strokeWidth={0.6} opacity={op} />,
        <line key={`h${k}`} x1={C - 85} y1={C - 85 + k * 56} x2={C + 85} y2={C - 85 + k * 56}
          stroke="var(--accent)" strokeWidth={0.6} opacity={op} />
      );
    }
    return (
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
        <rect x={C - 85} y={C - 85} width={170} height={170}
          fill="none" stroke="var(--accent)" strokeWidth={0.9} opacity={0.3 * progress} rx={3} />
        {gridLines}
        <path
          d={`M ${C + 56},${C - 56} A 28,28 0 0,0 ${C + 56},${C + 28} A 42,42 0 0,0 ${C - 42},${C + 28} A 70,70 0 0,0 ${C - 42},${C - 85}`}
          fill="none" stroke="var(--accent)" strokeWidth={1.3}
          opacity={0.6 * progress} strokeLinecap="round"
        />
        <circle cx={C + 28} cy={C - 28} r={4} fill="var(--accent)" opacity={0.65 * progress} />
        <circle cx={C - 18} cy={C + 18} r={3} fill="var(--accent)" opacity={0.45 * progress} />
      </svg>
    );
  }

  if (index === 2) {
    return (
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
        <defs>
          <linearGradient id="ij-lg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.65" />
          </linearGradient>
        </defs>
        <path d={`M ${C - 30},${C - 76} L ${C - 58},${C - 76} L ${C - 58},${C + 76} L ${C - 30},${C + 76}`}
          fill="none" stroke="url(#ij-lg2)" strokeWidth={2} opacity={0.7 * progress} strokeLinecap="round" />
        <path d={`M ${C + 30},${C - 76} L ${C + 58},${C - 76} L ${C + 58},${C + 76} L ${C + 30},${C + 76}`}
          fill="none" stroke="url(#ij-lg2)" strokeWidth={2} opacity={0.7 * progress} strokeLinecap="round" />
        {[-38, -18, 2, 22, 42].map((offset, k) => (
          <line key={k}
            x1={C - 18} y1={C + offset}
            x2={C + 18 - (k % 2) * 10} y2={C + offset}
            stroke="var(--accent)" strokeWidth={1}
            opacity={(0.18 + k * 0.055) * progress} />
        ))}
        <circle cx={C} cy={C} r={6} fill="var(--accent)" opacity={0.75 * progress} />
        <circle cx={C} cy={C} r={14} fill="none" stroke="var(--accent)" strokeWidth={0.9}
          opacity={0.35 * progress}
          style={{ animation: 'ij-pulse 1.8s ease-in-out infinite', transformOrigin: `${C}px ${C}px` }} />
      </svg>
    );
  }

  // index 3 — vision / collaboration
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <circle cx={C - 30} cy={C} r={55} fill="none" stroke="var(--accent)" strokeWidth={1} opacity={0.38 * progress} />
      <circle cx={C + 30} cy={C} r={55} fill="none" stroke="var(--accent)" strokeWidth={1} opacity={0.38 * progress} />
      <ellipse cx={C} cy={C} rx={18} ry={44}
        fill="var(--accent)" opacity={0.08 * progress} />
      <circle cx={C - 30} cy={C} r={5} fill="var(--accent)" opacity={0.65 * progress} />
      <circle cx={C + 30} cy={C} r={5} fill="var(--accent)" opacity={0.65 * progress} />
      <circle cx={C} cy={C} r={4} fill="var(--accent)" opacity={0.9 * progress}
        style={{ animation: 'ij-pulse 2s ease-in-out infinite', transformOrigin: `${C}px ${C}px` }} />
      <circle cx={C} cy={C} r={88} fill="none" stroke="var(--accent)" strokeWidth={0.5}
        strokeDasharray="4 8" opacity={0.2 * progress}
        style={{ animation: 'ij-spin 22s linear infinite', transformOrigin: `${C}px ${C}px` }} />
    </svg>
  );
}
