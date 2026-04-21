'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import { useLanguage } from '../context/LanguageContext';

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const titleWrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    // Entrance animation
    animate('.title-reveal span', {
      translateY: ['105%', '0%'],
      opacity: [0, 1],
      delay: stagger(180),
      duration: 1400,
      easing: 'easeOutExpo'
    });

    animate('.subtitle-fade', {
      opacity: [0, 1],
      translateY: [30, 0],
      delay: 1100,
      duration: 1200,
      easing: 'easeOutExpo'
    });

    animate('.hero-line', {
      scaleY: [0, 1],
      opacity: [0, 1],
      delay: 600,
      duration: 1000,
      easing: 'easeOutExpo'
    });

    // Parallax on scroll
    const handleScroll = () => {
      setOffsetY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Magnetic CTA button
    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current) return;
      const btn = buttonRef.current;
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      const distance = Math.sqrt(x * x + y * y);

      if (distance < 180) {
        animate(btn, {
          translateX: x * 0.3,
          translateY: y * 0.3,
          duration: 80,
          easing: 'easeOutQuad'
        });
      } else {
        animate(btn, {
          translateX: 0,
          translateY: 0,
          duration: 500,
          easing: 'easeOutElastic(1, 0.5)'
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section ref={containerRef} id="hero" style={{ justifyContent: 'center', overflow: 'hidden' }}>
      <div className="container" style={{ position: 'relative' }}>

        {/* Parallax title block */}
        <div
          ref={titleWrapRef}
          style={{
            marginBottom: '2rem',
            transform: `translateY(${offsetY * 0.15}px)`,
            willChange: 'transform',
            transition: 'transform 0.05s linear',
          }}
        >
          <div style={{ overflow: 'hidden', lineHeight: 1.05 }}>
            <h1 className="title-reveal" style={{ fontSize: 'clamp(2.5rem, 8vw, 9rem)', marginBottom: '0.2rem' }}>
              <span style={{ display: 'inline-block' }}>{t('hero.title1')}</span>
            </h1>
          </div>
          <div style={{ overflow: 'hidden', lineHeight: 1.05 }}>
            <h1 className="title-reveal" style={{
              fontSize: 'clamp(2.5rem, 8vw, 9rem)',
              marginLeft: '15vw',
              fontStyle: 'italic',
              color: 'var(--accent)'
            }}>
              <span style={{ display: 'inline-block' }}>{t('hero.title2')}</span>
            </h1>
          </div>
        </div>

        <div className="grid-12" style={{ alignItems: 'flex-start', marginTop: '2rem' }}>
          
          {/* Bloque Izquierdo: Disponibilidad y CTA */}
          <div className="subtitle-fade mobile-col-full" style={{ gridColumn: '1 / 6', opacity: 0, display: 'flex', flexDirection: 'column', gap: '2.5rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)', position: 'absolute', opacity: 0.4, transform: 'scale(2.5)' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.7 }}>
                Open to work & freelance
              </span>
            </div>
          </div>

          {/* Bloque Derecho: Descripción */}
          <div className="subtitle-fade mobile-col-full" style={{ gridColumn: '7 / 12', opacity: 0 }}>
            <p style={{
              fontSize: '1.15rem',
              color: 'var(--foreground)',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.02em',
              lineHeight: 1.9,
              opacity: 0.85,
              borderLeft: '1px solid rgba(0,0,0,0.1)',
              paddingLeft: '2rem',
              textAlign: 'justify'
            }}>
              {t('hero.description')}
            </p>
          </div>
        </div>

        {/* Decorative vertical line */}
        <div className="hero-line" style={{
          position: 'absolute',
          left: '-2vw',
          top: '50%',
          transform: 'translateY(-50%)',
          transformOrigin: 'top center',
          width: '1px',
          height: '200px',
          background: 'linear-gradient(to bottom, transparent, var(--accent), transparent)',
          opacity: 0,
        }} />

        {/* Vertical subtitle tag */}
        <div style={{
          position: 'absolute',
          right: '5vw',
          top: '10%',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.65rem',
          letterSpacing: '0.5em',
          textTransform: 'uppercase',
          opacity: 0.3,
          writingMode: 'vertical-rl'
        }}>
          {t('hero.subtitle')}
        </div>
      </div>
    </section>
  );
}
