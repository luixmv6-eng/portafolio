'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { animate, stagger } from 'animejs';
import { useLanguage } from '../context/LanguageContext';

import techData from '../data/tech.json';

const tools = techData;

function TechCard({ tool }: { tool: (typeof tools)[number] }) {
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
    const rotX = ((y - cy) / cy) * -10;
    const rotY = ((x - cx) / cx) * 10;

    el.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px) scale(1.02)`;

    if (glowRef.current) {
      const pctX = (x / rect.width) * 100;
      const pctY = (y / rect.height) * 100;
      glowRef.current.style.setProperty('--mx', `${pctX}%`);
      glowRef.current.style.setProperty('--my', `${pctY}%`);
      glowRef.current.style.opacity = '1';
    }
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
    if (glowRef.current) glowRef.current.style.opacity = '0';
  };

  return (
    <div
      ref={cardRef}
      className="tech-capsule tilt-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1.5rem 1.5rem',
        borderRadius: '20px',
        background: 'color-mix(in srgb, var(--background) 60%, rgba(255,255,255,0.08))',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-subtle)',
        width: '160px',
        minHeight: '185px',
        justifyContent: 'center',
        opacity: 0,
        boxShadow: 'var(--card-shadow)',
        cursor: 'default',
        willChange: 'transform',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.08s ease-out, box-shadow 0.4s ease',
      }}
    >
      {/* Glow overlay */}
      <div
        ref={glowRef}
        className="tilt-card-glow"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '20px',
          background: `radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(var(--accent-rgb), 0.1) 0%, transparent 65%)`,
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Accent top border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '20%',
          right: '20%',
          height: '1.5px',
          background: `linear-gradient(90deg, transparent, ${tool.color}60, transparent)`,
          borderRadius: '1px',
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: '52px',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Image src={tool.image} alt={tool.name} width={52} height={52} style={{ objectFit: 'contain' }} />
      </div>

      {/* Name */}
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          opacity: 0.82,
          marginBottom: '1rem',
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        {tool.name}
      </span>

      {/* Level bar */}
      <div
        style={{
          width: '100%',
          height: '3px',
          background: 'rgba(var(--accent-rgb), 0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: `${(tool.level / 5) * 100}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${tool.color}, ${tool.color}aa)`,
            borderRadius: '2px',
            transition: 'width 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {/* Level dots */}
      <div style={{ display: 'flex', gap: '4px', marginTop: '0.6rem', zIndex: 1 }}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: i < tool.level ? tool.color : 'var(--border-subtle)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function TechStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate('.tech-capsule', {
              opacity: [0, 1],
              translateY: [36, 0],
              rotate: [4, 0],
              delay: stagger(65),
              duration: 1100,
              easing: 'easeOutExpo',
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="stack" ref={sectionRef}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <h2
            style={{ fontSize: 'clamp(2.8rem, 5.5vw, 6rem)', marginBottom: '1.5rem' }}
          >
            {t('stack.title')}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.12em',
              opacity: 0.5,
              textTransform: 'uppercase',
              fontSize: '0.72rem',
            }}
          >
            {t('stack.subtitle')}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '2rem',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {tools.map((tool) => (
            <TechCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
