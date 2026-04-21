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

export default function About() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [counts, setCounts] = useState(stats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const [activeDiscipline, setActiveDiscipline] = useState(0);

  // Intersection observer for entrance animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);

            // Animate headline words
            animate('.about-word', {
              translateY: ['110%', '0%'],
              opacity: [0, 1],
              delay: stagger(80),
              duration: 1200,
              easing: 'easeOutExpo',
            });

            // Animate paragraph
            animate('.about-body', {
              opacity: [0, 1],
              translateY: [30, 0],
              delay: 600,
              duration: 1000,
              easing: 'easeOutExpo',
            });

            // Animate stat cards
            animate('.about-stat', {
              opacity: [0, 1],
              translateY: [40, 0],
              scale: [0.9, 1],
              delay: stagger(120, { start: 800 }),
              duration: 900,
              easing: 'easeOutExpo',
            });

            // Animate accent line
            animate('.about-accent-line', {
              scaleX: [0, 1],
              opacity: [0, 1],
              delay: 400,
              duration: 1000,
              easing: 'easeOutExpo',
            });

            // Animate tag pills
            animate('.discipline-pill', {
              opacity: [0, 1],
              translateX: [-20, 0],
              delay: stagger(60, { start: 1000 }),
              duration: 700,
              easing: 'easeOutExpo',
            });

            // Counter animation for stats
            stats.forEach((stat, i) => {
              let startTime: number | null = null;
              const duration = 2000;
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
              setTimeout(() => requestAnimationFrame(step), 900 + i * 120);
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  // Cycle disciplines
  useEffect(() => {
    const id = setInterval(() => {
      setActiveDiscipline((p) => (p + 1) % disciplines.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="about" ref={sectionRef} style={{ padding: '10rem 4vw', background: 'var(--background)', overflow: 'hidden', position: 'relative' }}>

      {/* Floating decorative blobs */}
      <div style={{
        position: 'absolute', top: '15%', left: '-8%',
        width: '420px', height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(180,140,100,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'floatBlob1 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '-5%',
        width: '320px', height: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(180,140,100,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'floatBlob2 10s ease-in-out infinite',
      }} />

      {/* Tiny decorative dots grid */}
      <div style={{
        position: 'absolute', top: '20%', right: '8%',
        display: 'grid', gridTemplateColumns: 'repeat(5, 8px)', gap: '12px',
        opacity: 0.15, pointerEvents: 'none',
      }}>
        {[...Array(25)].map((_, i) => (
          <div key={i} style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--foreground)' }} />
        ))}
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>

          {/* LEFT: editorial headline + body */}
          <div>
            {/* Accent overline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
              <div className="about-accent-line" style={{
                width: '60px', height: '1px',
                background: 'var(--accent)',
                transformOrigin: 'left center',
                opacity: 0,
              }} />
              <span style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
                letterSpacing: '0.35em', textTransform: 'uppercase', opacity: 0.5,
              }}>
                Sobre mí
              </span>
            </div>

            {/* Headline with clip animation */}
            <div style={{ overflow: 'hidden', marginBottom: '0.4rem' }}>
              <h2 style={{ fontSize: 'clamp(2.8rem, 5vw, 5.5rem)', fontWeight: 400, lineHeight: 1.05 }}>
                <span className="about-word" style={{ display: 'inline-block', opacity: 0 }}>Diseño</span>
              </h2>
            </div>
            <div style={{ overflow: 'hidden', marginBottom: '2.5rem' }}>
              <h2 style={{
                fontSize: 'clamp(2.8rem, 5vw, 5.5rem)', fontWeight: 400, lineHeight: 1.05,
                fontStyle: 'italic', color: 'var(--accent)', marginLeft: '2rem',
              }}>
                <span className="about-word" style={{ display: 'inline-block', opacity: 0 }}>Digital</span>
              </h2>
            </div>

            <p className="about-body" style={{
              fontSize: '1.05rem', fontFamily: 'var(--font-sans)',
              lineHeight: 2, opacity: 0.75, maxWidth: '480px', marginBottom: '3rem',
            }}>
              Ingeniero Multimedia en formación por la Universidad de San Buenaventura.
              Combino una base en producción audiovisual y 3D con un enfoque principal en la
              ingeniería de plataformas web y Progressive Web Apps (PWAs),
              construyendo soluciones digitales de alto rendimiento.
            </p>

            {/* Discipline cycling tag */}
            <div className="about-body" style={{
              display: 'flex', flexWrap: 'wrap', gap: '0.6rem',
            }}>
              {disciplines.map((d, i) => (
                <span
                  key={d}
                  className="discipline-pill"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '0.5rem 1rem',
                    borderRadius: '100px',
                    border: '1px solid',
                    borderColor: activeDiscipline === i ? 'var(--accent)' : 'rgba(0,0,0,0.12)',
                    background: activeDiscipline === i ? 'var(--accent)' : 'transparent',
                    color: activeDiscipline === i ? '#fff' : 'inherit',
                    opacity: 0,
                    transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: animated stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="about-stat"
                style={{
                  opacity: 0,
                  padding: '2.5rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(0,0,0,0.07)',
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateX(12px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(180,140,100,0.12)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(180,140,100,0.3)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.07)';
                }}
              >
                {/* Accent number dot */}
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: 'var(--accent)', flexShrink: 0,
                }} />
                <div>
                  <div style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                    fontWeight: 400,
                    lineHeight: 1,
                    color: 'var(--foreground)',
                    letterSpacing: '-0.02em',
                  }}>
                    {counts[i]}{stat.suffix}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    opacity: 0.45,
                    marginTop: '0.4rem',
                  }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}

            {/* USO DE SAN BUENAVENTURA badge */}
            <div className="about-stat" style={{
              opacity: 0,
              padding: '1.8rem 2.5rem',
              borderRadius: '20px',
              border: '1px solid rgba(0,0,0,0.07)',
              background: 'linear-gradient(135deg, rgba(180,140,100,0.08) 0%, rgba(255,255,255,0.6) 100%)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.2rem',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.03em' }}>
                  U. de San Buenaventura
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  Ingeniería Multimedia · En formación
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatBlob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.97); }
        }
        @keyframes floatBlob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-25px, 20px) scale(1.04); }
          70% { transform: translate(15px, -15px) scale(0.96); }
        }
        @media (max-width: 768px) {
          #about .container > div {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
        }
      `}</style>
    </section>
  );
}
