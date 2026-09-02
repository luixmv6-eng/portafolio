'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import { useLanguage } from '../context/LanguageContext';
import projectsData from '../data/projects.json';
import techData from '../data/tech.json';

// Las cifras salen de los datos, no de constantes que se quedan viejas.
// Antes decia "12+ proyectos" con 9 en projects.json, y un "100% orientado
// al rendimiento" que no mide nada.
const STAT_VALUES = {
  projects: projectsData.length,
  years: 3,
  tools: techData.length,
} as const;

function StatCard({
  suffix,
  label,
  count,
}: {
  suffix: string;
  label: string;
  count: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -6;
    const rotY = ((x - cx) / cx) * 6;

    el.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
    el.style.boxShadow = 'var(--card-shadow-hover)';

    if (glowRef.current) {
      glowRef.current.style.setProperty('--mx', `${(x / rect.width) * 100}%`);
      glowRef.current.style.setProperty('--my', `${(y / rect.height) * 100}%`);
      glowRef.current.style.opacity = '1';
    }
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    el.style.boxShadow = 'var(--card-shadow)';
    if (glowRef.current) glowRef.current.style.opacity = '0';
  };

  return (
    <div
      ref={cardRef}
      className="about-stat surface-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        opacity: 0,
        padding: '1.9rem 2.2rem',
        display: 'flex',
        alignItems: 'baseline',
        gap: '1.5rem',
        transition: 'transform 0.08s ease-out, box-shadow var(--dur-mid) ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        willChange: 'transform',
        transformStyle: 'preserve-3d',
      }}
    >
      <div ref={glowRef} className="tilt-card-glow" aria-hidden="true" />

      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)',
          fontWeight: 400,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          minWidth: '3.2ch',
        }}
      >
        {count}
        {suffix}
      </div>
      <div className="label" style={{ maxWidth: '18ch' }}>
        {label}
      </div>
    </div>
  );
}

export default function About() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [counts, setCounts] = useState<number[]>([0, 0, 0]);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [activeDiscipline, setActiveDiscipline] = useState(0);

  const stats = [
    { value: STAT_VALUES.projects, suffix: '', label: t('about.statProjects') },
    { value: STAT_VALUES.years, suffix: '', label: t('about.statYears') },
    { value: STAT_VALUES.tools, suffix: '', label: t('about.statTools') },
  ];

  const disciplines = t('about.disciplines').split('|');

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || hasAnimated) return;
          setHasAnimated(true);
          observer.unobserve(entry.target);

          if (reduced) {
            // Sin animacion: las cifras se muestran en su valor final.
            setCounts(Object.values(STAT_VALUES));
            return;
          }

          animate('.about-word', {
            translateY: ['110%', '0%'],
            opacity: [0, 1],
            delay: stagger(75),
            duration: 1200,
            easing: 'easeOutExpo',
          });

          animate('.about-body', {
            opacity: [0, 1],
            translateY: [24, 0],
            delay: 550,
            duration: 1000,
            easing: 'easeOutExpo',
          });

          animate('.about-stat', {
            opacity: [0, 1],
            translateY: [36, 0],
            scale: [0.94, 1],
            delay: stagger(110, { start: 750 }),
            duration: 900,
            easing: 'easeOutExpo',
          });

          animate('.about-accent-line', {
            scaleX: [0, 1],
            opacity: [0, 1],
            delay: 350,
            duration: 1000,
            easing: 'easeOutExpo',
          });

          animate('.discipline-pill', {
            opacity: [0, 1],
            translateX: [-16, 0],
            delay: stagger(55, { start: 950 }),
            duration: 700,
            easing: 'easeOutExpo',
          });

          const targets = Object.values(STAT_VALUES);
          const frames: number[] = [];
          targets.forEach((target, i) => {
            let startTime: number | null = null;
            const duration = 1800;
            const step = (ts: number) => {
              if (startTime === null) startTime = ts;
              const progress = Math.min((ts - startTime) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setCounts((prev) => {
                const next = [...prev];
                next[i] = Math.round(eased * target);
                return next;
              });
              if (progress < 1) frames[i] = requestAnimationFrame(step);
            };
            frames[i] = requestAnimationFrame(step);
          });
        });
      },
      { threshold: 0.12 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  // Rotacion de la disciplina destacada. Se detiene con reduced-motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      setActiveDiscipline((p) => (p + 1) % 6);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{ background: 'var(--background)', overflow: 'hidden', position: 'relative' }}
    >
      {/* Halos ambientales */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '12%',
          left: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'floatBlob1 9s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '8%',
          right: '-6%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'floatBlob2 11s ease-in-out infinite',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="about-grid">
          {/* Copy editorial */}
          <div className="about-copy">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
              <div
                className="about-accent-line"
                aria-hidden="true"
                style={{
                  width: '56px',
                  height: '1px',
                  background: 'var(--accent)',
                  transformOrigin: 'left center',
                  opacity: 0,
                }}
              />
              <span className="label-sm">{t('about.eyebrow')}</span>
            </div>

            <div style={{ overflow: 'hidden', marginBottom: '0.3rem' }}>
              <h2 style={{ fontSize: 'var(--t-display-2)' }}>
                <span className="about-word" style={{ display: 'inline-block', opacity: 0 }}>
                  {t('about.title1')}
                </span>
              </h2>
            </div>
            <div style={{ overflow: 'hidden', marginBottom: '2.8rem' }}>
              <h2
                className="about-title-italic display-italic"
                style={{
                  fontSize: 'var(--t-display-2)',
                  marginLeft: 'var(--about-title-indent, 2.5rem)',
                }}
              >
                <span className="about-word" style={{ display: 'inline-block', opacity: 0 }}>
                  {t('about.title2')}
                </span>
              </h2>
            </div>

            <p className="about-body body-copy" style={{ maxWidth: '46ch', marginBottom: '3rem' }}>
              {t('about.body')}
            </p>

            <div className="about-body" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
              {disciplines.map((d, i) => (
                <span
                  key={d}
                  className="discipline-pill"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--t-label)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '0.5rem 1.1rem',
                    borderRadius: 'var(--r-pill)',
                    border: '1px solid',
                    borderColor: activeDiscipline === i ? 'var(--accent)' : 'var(--border-subtle)',
                    background: activeDiscipline === i ? 'var(--accent)' : 'transparent',
                    color: activeDiscipline === i ? 'var(--accent-contrast)' : 'var(--muted)',
                    opacity: 0,
                    transition: 'all var(--dur-mid) var(--ease-out)',
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Cifras */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.map((stat, i) => (
              <StatCard
                key={stat.label}
                suffix={stat.suffix}
                label={stat.label}
                count={counts[i]}
              />
            ))}

            <div
              className="about-stat surface-card"
              style={{
                opacity: 0,
                padding: '1.5rem 2.2rem',
                background:
                  'linear-gradient(135deg, rgba(var(--accent-rgb), 0.07) 0%, color-mix(in srgb, var(--surface) 70%, transparent) 100%)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.2rem',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent-contrast)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--t-body-sm)',
                    fontWeight: 700,
                  }}
                >
                  {t('about.university')}
                </div>
                <div className="label-sm" style={{ marginTop: '0.25rem' }}>
                  {t('about.degree')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6rem;
          align-items: center;
        }

        /* El colapso a una columna se declara aqui, con una clase propia.
           Antes dependia de #about .container > div, que se rompe si cambia
           el orden del markup. */
        @media (max-width: 900px) {
          .about-grid {
            grid-template-columns: 1fr;
            gap: 4rem;
            text-align: center;
          }
          .about-copy {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .about-title-italic { --about-title-indent: 0; }
          .about-accent-line { display: none; }
          .about-body { margin-left: auto; margin-right: auto; }
          .about-copy .about-body:last-child { justify-content: center; }
          .about-stat { text-align: left; }
        }
      `}</style>
    </section>
  );
}
