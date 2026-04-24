'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { animate, stagger } from 'animejs';
import { useLanguage } from '../context/LanguageContext';
import { ArrowUpRight } from 'lucide-react';

const Hero3D = dynamic(() => import('./Hero3D'), { ssr: false });

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    animate('.title-reveal span', {
      translateY: ['105%', '0%'],
      opacity: [0, 1],
      delay: stagger(180),
      duration: 1400,
      easing: 'easeOutExpo',
    });

    animate('.subtitle-fade', {
      opacity: [0, 1],
      translateY: [24, 0],
      delay: stagger(80, { start: 1100 }),
      duration: 1100,
      easing: 'easeOutExpo',
    });

    animate('.hero-line', {
      scaleY: [0, 1],
      opacity: [0, 1],
      delay: 600,
      duration: 1000,
      easing: 'easeOutExpo',
    });

    animate('.hero-cta', {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: 1400,
      duration: 900,
      easing: 'easeOutExpo',
    });

    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={containerRef}
      id="hero"
      style={{ justifyContent: 'center', overflow: 'hidden', minHeight: '100vh' }}
    >
      {/* 3D floating element — right side, desktop only */}
      <div
        className="hero-3d-wrap"
        style={{
          position: 'absolute',
          right: '-2vw',
          top: '50%',
          transform: `translateY(calc(-50% + ${offsetY * 0.08}px))`,
          width: 'min(580px, 48vw)',
          height: 'min(580px, 48vw)',
          pointerEvents: 'none',
          willChange: 'transform',
          zIndex: 5,
        }}
      >
        <Hero3D />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        {/* Title block */}
        <div
          style={{
            marginBottom: '3rem',
            transform: `translateY(${offsetY * 0.12}px)`,
            willChange: 'transform',
            transition: 'transform 0.05s linear',
            maxWidth: '70%',
          }}
        >
          <div style={{ overflow: 'hidden', lineHeight: 1.0 }}>
            <h1
              className="title-reveal"
              style={{ fontSize: 'clamp(3rem, 8.5vw, 9.5rem)', marginBottom: '0.15rem' }}
            >
              <span style={{ display: 'inline-block' }}>{t('hero.title1')}</span>
            </h1>
          </div>
          <div style={{ overflow: 'hidden', lineHeight: 1.0 }}>
            <h1
              className="title-reveal"
              style={{
                fontSize: 'clamp(3rem, 8.5vw, 9.5rem)',
                marginLeft: 'clamp(1rem, 14vw, 16rem)',
                fontStyle: 'italic',
                color: 'var(--accent)',
              }}
            >
              <span style={{ display: 'inline-block' }}>{t('hero.title2')}</span>
            </h1>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid-12" style={{ alignItems: 'flex-end', marginTop: '1.5rem', maxWidth: '68%' }}>
          {/* Left: badge + CTA */}
          <div
            className="subtitle-fade mobile-col-full"
            style={{
              gridColumn: '1 / 6',
              opacity: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '2.5rem',
            }}
          >
            {/* Availability badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                    position: 'absolute',
                    opacity: 0.35,
                    transform: 'scale(2.8)',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
                <div
                  style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)' }}
                />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  opacity: 0.65,
                }}
              >
                Open to work & freelance
              </span>
            </div>

            {/* CTA */}
            <a
              href="#projects"
              className="hero-cta"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                opacity: 0,
                fontFamily: 'var(--font-sans)',
                fontSize: '0.7rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: 'var(--foreground)',
                textDecoration: 'none',
                padding: '1rem 2rem',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                width: 'fit-content',
                transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                background: 'rgba(var(--accent-rgb), 0)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--foreground)';
                e.currentTarget.style.color = 'var(--background)';
                e.currentTarget.style.borderColor = 'var(--foreground)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--foreground)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              Ver proyectos
              <ArrowUpRight size={14} />
            </a>
          </div>

          {/* Right: description */}
          <div
            className="subtitle-fade mobile-col-full"
            style={{ gridColumn: '7 / 12', opacity: 0 }}
          >
            <p
              style={{
                fontSize: '1.05rem',
                fontFamily: 'var(--font-sans)',
                lineHeight: 1.95,
                opacity: 0.8,
                borderLeft: '1px solid var(--border-subtle)',
                paddingLeft: '2rem',
              }}
            >
              {t('hero.description')}
            </p>
          </div>
        </div>

        {/* Decorative vertical line */}
        <div
          className="hero-line"
          style={{
            position: 'absolute',
            left: '-2.5vw',
            top: '50%',
            transform: 'translateY(-50%)',
            transformOrigin: 'top center',
            width: '1px',
            height: '180px',
            background: 'linear-gradient(to bottom, transparent, var(--accent), transparent)',
            opacity: 0,
          }}
        />

        {/* Vertical subtitle — technical display */}
        <div
          className="vertical-tech-label"
          style={{
            position: 'absolute',
            right: '3.2vw',
            bottom: '5rem',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.9rem',
          }}
        >
          {/* Top accent bar */}
          <div style={{
            width: '1px',
            height: '36px',
            background: 'linear-gradient(to bottom, transparent, var(--accent))',
            opacity: 0.7,
          }} />

          {/* Bracket-label */}
          <span style={{
            fontFamily: 'monospace',
            fontSize: '0.42rem',
            color: 'var(--accent)',
            opacity: 0.75,
            letterSpacing: '0.1em',
          }}>
            ◆ 01
          </span>

          {/* Main technical text */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <span
              className="vt-scan"
              style={{
                display: 'block',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.57rem',
                letterSpacing: '0.68em',
                textTransform: 'uppercase',
                fontWeight: 500,
                background: 'linear-gradient(180deg, var(--foreground) 0%, var(--accent) 55%, var(--foreground) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                opacity: 0.72,
                position: 'relative',
              }}
            >
              {t('hero.subtitle')}
            </span>
            {/* Scan line overlay */}
            <span
              className="vt-scanline"
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to bottom, transparent 0%, rgba(var(--accent-rgb),0.25) 48%, rgba(var(--accent-rgb),0.18) 52%, transparent 100%)',
                backgroundSize: '100% 200%',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Role tag */}
          <span style={{
            fontFamily: 'monospace',
            fontSize: '0.42rem',
            color: 'var(--accent)',
            opacity: 0.75,
            letterSpacing: '0.1em',
          }}>
            ◆
          </span>

          {/* Bottom accent bar */}
          <div style={{
            width: '1px',
            height: '36px',
            background: 'linear-gradient(to top, transparent, var(--accent))',
            opacity: 0.7,
          }} />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(2.8); opacity: 0.35; }
          50% { transform: scale(3.6); opacity: 0.15; }
        }

        @keyframes vt-scan-move {
          0%   { background-position: 0% 0%; }
          100% { background-position: 0% 200%; }
        }

        @keyframes vt-scanline-sweep {
          0%   { background-position: 0% -100%; }
          100% { background-position: 0% 200%; }
        }

        .vt-scan {
          animation: vt-scan-move 4s linear infinite;
        }

        .vt-scanline {
          animation: vt-scanline-sweep 3.5s ease-in-out infinite;
        }

        .vertical-tech-label {
          opacity: 0;
          animation: vt-fade-in 1.2s ease-out 1.8s forwards;
        }

        @keyframes vt-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .hero-3d-wrap { display: none !important; }
          .vertical-tech-label { display: none !important; }
        }

        @media (max-width: 768px) {
          #hero .container > div:first-child { max-width: 100% !important; }
          #hero .grid-12 { max-width: 100% !important; }
        }
      `}</style>
    </section>
  );
}
