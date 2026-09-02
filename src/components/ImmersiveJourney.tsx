'use client';

import { ReactElement, useEffect, useRef, useState } from 'react';

const CHAPTERS = [
  {
    tag: 'ORIGEN',
    title: 'Curioso por\nnaturaleza',
    body: 'Desde el primer render en Blender hasta el primer deploy en producción, siempre busqué la intersección entre lo visual y lo funcional. La ingeniería multimedia no fue una elección, fue un destino.',
  },
  {
    tag: 'DISEÑO',
    title: 'Donde el arte\nse encuentra con el código',
    body: 'El diseño no es decoración, es arquitectura invisible. Cada píxel, cada transición, cada jerarquía tipográfica cuenta una historia antes de que el usuario lea una sola palabra.',
  },
  {
    tag: 'CONSTRUCCIÓN',
    title: 'PWAs que\nrespiran',
    body: 'Construyo plataformas escalables con Next.js, Supabase e IA integrada. Plataformas que no solo funcionan: piensan, aprenden y se adaptan a quien las usa.',
  },
  {
    tag: 'VISIÓN',
    title: 'Contigo,\nlo siguiente',
    body: 'El mejor trabajo surge de la colaboración. Aporto rigor técnico, criterio visual y energía creativa. ¿Qué construimos juntos?',
  },
];

export default function ImmersiveJourney() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);

  // Un solo rAF para scroll y mouse, activo solo mientras la seccion se ve.
  // Antes eran dos loops permanentes mas un listener de scroll que llamaba
  // setLocalProgress en cada frame: la seccion entera re-renderizaba a 60fps.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const mouse = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };
    let raf = 0;
    let running = false;
    let lastChapter = -1;

    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const readScroll = () => {
      const totalH = wrapper.offsetHeight - window.innerHeight;
      if (totalH <= 0) return;
      const scrolled = -wrapper.getBoundingClientRect().top;
      const progress = Math.min(Math.max(scrolled / totalH, 0), 1);

      // La barra se escala con una custom property: cero trabajo en React.
      progressRef.current?.style.setProperty('--ij-progress', String(progress));

      const idx = Math.min(Math.floor(progress * CHAPTERS.length), CHAPTERS.length - 1);
      // setState solo cuando el capitulo realmente cambia, no cada frame.
      if (idx !== lastChapter) {
        lastChapter = idx;
        setChapter(idx);
      }
    };

    const loop = () => {
      readScroll();

      if (!reduced) {
        smooth.x += (mouse.x - smooth.x) * 0.07;
        smooth.y += (mouse.y - smooth.y) * 0.07;

        const follower = stickyRef.current?.querySelector('.ij-follower') as HTMLElement | null;
        if (follower) {
          follower.style.transform = `translate(calc(-50% + ${smooth.x * 80}px), calc(-50% + ${smooth.y * 50}px))`;
        }
        if (bgRef.current) {
          bgRef.current.style.setProperty('--ij-bg-x', `${50 + smooth.x * 6}%`);
          bgRef.current.style.setProperty('--ij-bg-y', `${42 + smooth.y * 5}%`);
        }
      }

      raf = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          if (!reduced) window.addEventListener('mousemove', onMove, { passive: true });
          raf = requestAnimationFrame(loop);
        } else if (!entry.isIntersecting && running) {
          running = false;
          window.removeEventListener('mousemove', onMove);
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 }
    );

    observer.observe(wrapper);
    readScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
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
          height: '100dvh',
          overflow: 'hidden',
          background: 'var(--background)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Radial gradient bg, sigue al mouse via custom properties */}
        <div
          ref={bgRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(ellipse 70% 55% at var(--ij-bg-x, 50%) var(--ij-bg-y, 42%), rgba(var(--accent-rgb), 0.065) 0%, transparent 70%)',
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

        {/* Indicador de capitulo. Es la unica ayuda de posicion de la seccion:
            reemplaza la fila superior con "◆ HISTORIA" y el contador "01 / 04". */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '2.5vw',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {CHAPTERS.map((_, i) => (
            <div key={i} style={{
              width: i === chapter ? '26px' : '7px',
              height: '2px',
              borderRadius: '2px',
              background: i === chapter ? 'var(--accent)' : 'var(--border-subtle)',
              opacity: i <= chapter ? 1 : 0.4,
              transition: 'all var(--dur-mid) var(--ease-out)',
            }} />
          ))}
        </div>

        {/* Barra de progreso. scaleX en vez de width: no fuerza layout. */}
        <div
          ref={progressRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            height: '2px',
            width: '100%',
            transformOrigin: 'left center',
            transform: 'scaleX(var(--ij-progress, 0))',
            background: 'var(--accent)',
            opacity: 0.6,
          }}
        />

        {/* Chapter slides — all stacked with CSS crossfade */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '1100px', padding: '0 5vw', zIndex: 2 }}>
          {CHAPTERS.map((ch, i) => {
            const isActive = i === chapter;
            const isPast = i < chapter;

            const opacity = isActive ? 1 : 0;
            const ty = isActive ? 0 : (isPast ? -45 : 45);

            return (
              <div
                key={i}
                aria-hidden={!isActive}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  transform: `translateY(calc(-50% + ${ty}px))`,
                  opacity,
                  pointerEvents: isActive ? 'auto' : 'none',
                  willChange: 'transform, opacity',
                  transition: 'opacity var(--dur-slow) var(--ease-out), transform var(--dur-slow) var(--ease-out)',
                }}
              >
                <div className="ij-slide-grid">
                  {/* Left: text */}
                  <div>
                    {/* El nombre del capitulo. Antes venia con un numero
                        monospace "01" delante que solo repetia el indicador
                        lateral. */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.8rem' }}>
                      <div
                        aria-hidden="true"
                        style={{ width: '30px', height: '1px', background: 'var(--accent)', opacity: 0.45 }}
                      />
                      <span className="label-sm">{ch.tag}</span>
                    </div>

                    <h2 style={{
                      fontSize: 'var(--t-display-2)',
                      marginBottom: '2.2rem',
                      whiteSpace: 'pre-line',
                    }}>
                      {ch.title}
                    </h2>

                    <p className="body-copy" style={{ maxWidth: '440px' }}>
                      {ch.body}
                    </p>
                  </div>

                  {/* Right: visual. Aparece con una transicion CSS al activarse
                      en vez de recalcular opacidades en cada frame. */}
                  <div
                    aria-hidden="true"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      opacity: isActive || isPast ? 1 : 0,
                      transition: 'opacity var(--dur-slow) var(--ease-out)',
                    }}
                  >
                    <ChapterVisual index={i} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Spacer so absolute children have context */}
          <div style={{ height: '60vh', pointerEvents: 'none' }} />
        </div>
      </div>

      <style>{`
        .ij-slide-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(2rem, 5vw, 6rem);
          align-items: center;
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
          .ij-slide-grid {
            grid-template-columns: 1fr;
            text-align: center;
            justify-items: center;
          }
          .ij-slide-grid .body-copy { margin: 0 auto; }
        }
      `}</style>
    </div>
  );
}

// El fundido lo hace el contenedor con una transicion CSS, no un valor
// recalculado en cada frame de scroll. `progress` queda como escala fija.
function ChapterVisual({ index, progress = 1 }: { index: number; progress?: number }) {
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
