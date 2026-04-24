'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import { useLanguage } from '../context/LanguageContext';

const stats = [
  { value: 12, suffix: '+', label: 'Proyectos realizados' },
  { value: 3, suffix: ' años', label: 'Aprendiendo & construyendo' },
  { value: 100, suffix: '%', label: 'Orientado al rendimiento' },
];

const disciplines = ['Web Design', 'Motion Graphics', '3D Production', 'PWA Engineering', 'UI/UX', 'Audiovisual'];

function StatCard({
  stat,
  count,
  index,
}: {
  stat: (typeof stats)[number];
  count: number;
  index: number;
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

    el.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px) translateX(6px)`;
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
    el.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px) translateX(0px)';
    el.style.boxShadow = 'var(--card-shadow)';
    if (glowRef.current) glowRef.current.style.opacity = '0';
  };

  return (
    <div
      ref={cardRef}
      className="about-stat"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        opacity: 0,
        padding: '2.2rem 2.5rem',
        borderRadius: '18px',
        border: '1px solid var(--border-subtle)',
        background: 'color-mix(in srgb, var(--background) 55%, rgba(255,255,255,0.06))',
        backdropFilter: 'blur(12px)',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        transition: 'transform 0.08s ease-out, box-shadow 0.4s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        willChange: 'transform',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Glow */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '18px',
          background: 'radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(var(--accent-rgb), 0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Index number */}
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.58rem',
          letterSpacing: '0.2em',
          opacity: 0.3,
          textTransform: 'uppercase',
          position: 'absolute',
          top: '1.2rem',
          right: '1.4rem',
        }}
      >
        0{index + 1}
      </div>

      <div
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: 'var(--accent)',
          flexShrink: 0,
          boxShadow: '0 0 8px rgba(var(--accent-rgb), 0.5)',
        }}
      />

      <div>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)',
            fontWeight: 400,
            lineHeight: 1,
            color: 'var(--foreground)',
            letterSpacing: '-0.02em',
          }}
        >
          {count}
          {stat.suffix}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.68rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            opacity: 0.42,
            marginTop: '0.4rem',
          }}
        >
          {stat.label}
        </div>
      </div>
    </div>
  );
}

export default function About() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [counts, setCounts] = useState(stats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const [activeDiscipline, setActiveDiscipline] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);

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

            stats.forEach((stat, i) => {
              let startTime: number | null = null;
              const duration = 2200;
              const step = (ts: number) => {
                if (!startTime) startTime = ts;
                const progress = Math.min((ts - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setCounts((prev) => {
                  const next = [...prev];
                  next[i] = Math.floor(eased * stat.value);
                  return next;
                });
                if (progress < 1) requestAnimationFrame(step);
              };
              setTimeout(() => requestAnimationFrame(step), 850 + i * 110);
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveDiscipline((p) => (p + 1) % disciplines.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{ padding: '10rem 4vw', background: 'var(--background)', overflow: 'hidden', position: 'relative' }}
    >
      {/* Decorative ambient blobs */}
      <div
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

      {/* Decorative dot grid */}
      <div
        style={{
          position: 'absolute',
          top: '22%',
          right: '7%',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 8px)',
          gap: '12px',
          opacity: 0.12,
          pointerEvents: 'none',
        }}
      >
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--foreground)' }}
          />
        ))}
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>

          {/* LEFT: Editorial copy */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
              <div
                className="about-accent-line"
                style={{
                  width: '56px',
                  height: '1px',
                  background: 'var(--accent)',
                  transformOrigin: 'left center',
                  opacity: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.38em',
                  textTransform: 'uppercase',
                  opacity: 0.45,
                }}
              >
                Sobre mí
              </span>
            </div>

            <div style={{ overflow: 'hidden', marginBottom: '0.3rem' }}>
              <h2 style={{ fontSize: 'clamp(2.6rem, 4.8vw, 5.2rem)', fontWeight: 400, lineHeight: 1.06 }}>
                <span className="about-word" style={{ display: 'inline-block', opacity: 0 }}>
                  Diseño
                </span>
              </h2>
            </div>
            <div style={{ overflow: 'hidden', marginBottom: '2.8rem' }}>
              <h2
                className="about-title-italic"
                style={{
                  fontSize: 'clamp(2.6rem, 4.8vw, 5.2rem)',
                  fontWeight: 400,
                  lineHeight: 1.06,
                  fontStyle: 'italic',
                  color: 'var(--accent)',
                  marginLeft: 'var(--about-title-indent, 2.5rem)',
                }}
              >
                <span className="about-word" style={{ display: 'inline-block', opacity: 0 }}>
                  Digital
                </span>
              </h2>
            </div>

            <p
              className="about-body"
              style={{
                fontSize: '1.02rem',
                fontFamily: 'var(--font-sans)',
                lineHeight: 2,
                opacity: 0.72,
                maxWidth: '460px',
                marginBottom: '3rem',
              }}
            >
              Ingeniero Multimedia en formación por la Universidad de San Buenaventura.
              Combino producción audiovisual y 3D con ingeniería de plataformas web y PWAs,
              construyendo soluciones digitales de alto rendimiento.
            </p>

            <div className="about-body" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
              {disciplines.map((d, i) => (
                <span
                  key={d}
                  className="discipline-pill"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '0.5rem 1.1rem',
                    borderRadius: '100px',
                    border: '1px solid',
                    borderColor: activeDiscipline === i ? 'var(--accent)' : 'var(--border-subtle)',
                    background: activeDiscipline === i ? 'var(--accent)' : 'transparent',
                    color: activeDiscipline === i ? '#fff' : 'inherit',
                    opacity: 0,
                    transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {stats.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} count={counts[i]} index={i} />
            ))}

            {/* University badge */}
            <div
              className="about-stat"
              style={{
                opacity: 0,
                padding: '1.6rem 2.2rem',
                borderRadius: '18px',
                border: '1px solid var(--border-subtle)',
                background:
                  'linear-gradient(135deg, rgba(var(--accent-rgb), 0.06) 0%, color-mix(in srgb, var(--background) 55%, rgba(255,255,255,0.06)) 100%)',
                backdropFilter: 'blur(12px)',
                boxShadow: 'var(--card-shadow)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.2rem',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 16px rgba(var(--accent-rgb), 0.35)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                  }}
                >
                  U. de San Buenaventura
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.65rem',
                    opacity: 0.45,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    marginTop: '0.2rem',
                  }}
                >
                  Ingeniería Multimedia · En formación
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #about .container > div {
            grid-template-columns: 1fr !important;
            gap: 4rem !important;
            text-align: center;
          }
          .about-title-italic { --about-title-indent: 0; }
          .about-body {
            max-width: 100% !important;
            margin: 0 auto 3rem !important;
          }
          .about-accent-line { display: none; }
          #about .container > div > div:first-child {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .discipline-pill {
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
