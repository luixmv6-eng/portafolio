'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { animate, stagger } from 'animejs';
import { useLanguage } from '../context/LanguageContext';
import { ArrowUpRight } from 'lucide-react';

const Hero3D = dynamic(() => import('./Hero3D'), { ssr: false });

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

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
  }, []);

  // Parallax sin estado de React. Antes esto era un listener de scroll que
  // llamaba setOffsetY en cada frame: re-renderizaba todo el Hero (incluido el
  // canvas 3D) decenas de veces por segundo. Ahora escribe una custom property
  // y el rAF solo corre mientras el Hero esta en pantalla.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let running = false;

    const tick = () => {
      el.style.setProperty('--scroll-y', String(window.scrollY));
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(tick);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      id="hero"
      style={{ justifyContent: 'center', overflow: 'hidden', minHeight: '100dvh' }}
    >
      {/* 3D floating element */}
      <div
        className="hero-3d-wrap"
        data-parallax
        style={{
          position: 'absolute',
          right: 'var(--hero-3d-right, -2vw)',
          top: '50%',
          transform: 'translateY(calc(-50% + var(--scroll-y, 0) * 0.08px))',
          width: 'var(--hero-3d-size, min(580px, 48vw))',
          height: 'var(--hero-3d-size, min(580px, 48vw))',
          pointerEvents: 'none',
          willChange: 'transform',
          zIndex: 5,
          opacity: 'var(--hero-3d-opacity, 1)',
        }}
      >
        <Hero3D />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        {/* Rol. Antes era texto rotado 90 grados pegado al borde derecho:
            ilegible y un cliche de portafolio. Ahora es la unica etiqueta
            del hero y se lee de corrido. */}
        <div
          className="subtitle-fade hero-eyebrow label-sm"
          style={{
            opacity: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
            marginBottom: '1.6rem',
          }}
        >
          <span
            aria-hidden="true"
            style={{ width: '32px', height: '1px', background: 'var(--accent)', flexShrink: 0 }}
          />
          {t('hero.subtitle')}
        </div>

        {/* Title block */}
        <div
          className="hero-title-wrap"
          data-parallax
          style={{
            marginBottom: '3rem',
            transform: 'translateY(calc(var(--scroll-y, 0) * 0.12px))',
            willChange: 'transform',
            maxWidth: 'var(--hero-title-max-width, 70%)',
          }}
        >
          <div style={{ overflow: 'hidden', lineHeight: 1.0 }}>
            <h1
              className="title-reveal display-caps"
              style={{ fontSize: 'var(--t-display-1)', marginBottom: '0.15rem' }}
            >
              <span style={{ display: 'inline-block' }}>{t('hero.title1')}</span>
            </h1>
          </div>
          <div style={{ overflow: 'hidden', lineHeight: 1.14 }}>
            <h1
              className="title-reveal hero-title-italic display-caps display-italic"
              style={{
                fontSize: 'var(--t-display-1)',
                marginLeft: 'var(--hero-title-indent, clamp(1rem, 14vw, 16rem))',
              }}
            >
              <span style={{ display: 'inline-block' }}>{t('hero.title2')}</span>
            </h1>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid-12 hero-bottom-row" style={{ alignItems: 'flex-end', marginTop: '1.5rem', maxWidth: 'var(--hero-bottom-max-width, 68%)' }}>
          {/* Left: CTA + disponibilidad */}
          <div
            className="subtitle-fade mobile-col-full hero-cta-container"
            style={{
              gridColumn: '1 / 6',
              opacity: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.4rem',
              alignItems: 'flex-start',
            }}
          >
            <a
              href="#projects"
              className="hero-cta premium-button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                opacity: 0,
                textDecoration: 'none',
                width: 'fit-content',
              }}
            >
              {t('hero.cta')}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>

            {/* Estado real, no decoracion: el punto dice que hay disponibilidad. */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <span
                aria-hidden="true"
                className="hero-status-dot"
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--success)',
                  flexShrink: 0,
                }}
              />
              <span className="label-sm">{t('hero.availability')}</span>
            </div>
          </div>

          {/* Right: description */}
          <div
            className="subtitle-fade mobile-col-full hero-desc-container"
            style={{ gridColumn: '7 / 12', opacity: 0 }}
          >
            <p
              className="body-copy"
              style={{
                borderLeft: 'var(--hero-desc-border, 1px solid var(--border-subtle))',
                paddingLeft: 'var(--hero-desc-padding, 2rem)',
              }}
            >
              {t('hero.description')}
            </p>
          </div>
        </div>

        {/* Decorative vertical line */}
        <div
          className="hero-line"
          aria-hidden="true"
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
      </div>

      <style>{`
        .hero-status-dot {
          box-shadow: 0 0 0 0 color-mix(in srgb, var(--success) 60%, transparent);
          animation: hero-status-pulse 2.4s ease-out infinite;
        }

        @keyframes hero-status-pulse {
          0%   { box-shadow: 0 0 0 0 color-mix(in srgb, var(--success) 55%, transparent); }
          70%  { box-shadow: 0 0 0 7px color-mix(in srgb, var(--success) 0%, transparent); }
          100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--success) 0%, transparent); }
        }

        @media (max-width: 1200px) {
          .hero-3d-wrap {
            --hero-3d-size: 40vw;
            --hero-3d-right: -5vw;
          }
          .hero-title-wrap { --hero-title-max-width: 85%; }
          .hero-bottom-row { --hero-bottom-max-width: 85%; }
        }

        @media (max-width: 900px) {
          .hero-3d-wrap {
            --hero-3d-size: 300px;
            --hero-3d-right: 50%;
            top: 25%;
            transform: translate(50%, -50%) !important;
            opacity: 0.4;
            z-index: 1;
          }
          .hero-eyebrow { justify-content: center; }
          .hero-title-wrap {
             --hero-title-max-width: 100%;
             text-align: center;
          }
          .hero-title-italic { --hero-title-indent: 0; }
          .hero-bottom-row {
             --hero-bottom-max-width: 100%;
             display: flex;
             flex-direction: column;
             align-items: center;
             text-align: center;
             gap: 3rem;
          }
          .hero-cta-container { align-items: center !important; }
          .hero-desc-container {
             --hero-desc-border: none;
             --hero-desc-padding: 0;
          }
          .hero-desc-container .body-copy { margin: 0 auto; }
        }

        @media (max-width: 640px) {
          .hero-3d-wrap {
            --hero-3d-size: 220px;
            top: 20%;
          }
          .hero-title-wrap h1 {
            font-size: clamp(2.5rem, 15vw, 4.5rem) !important;
          }
        }
      `}</style>
    </section>
  );
}
