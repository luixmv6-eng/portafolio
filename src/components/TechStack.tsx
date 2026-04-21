'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { animate, stagger } from 'animejs';
import { useLanguage } from '../context/LanguageContext';
import { Star } from 'lucide-react';

import techData from '../data/tech.json';

const tools = techData;

export default function TechStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate('.tech-capsule', {
            opacity: [0, 1],
            translateY: [40, 0],
            rotate: [5, 0],
            delay: stagger(80),
            duration: 1200,
            easing: 'easeOutExpo'
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="stack" ref={sectionRef}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <h2 style={{ fontSize: 'clamp(3rem, 6vw, 6rem)', marginBottom: '1.5rem' }}>{t('stack.title')}</h2>
          <p style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.1em', opacity: 0.6, textTransform: 'uppercase', fontSize: '0.8rem' }}>
            {t('stack.subtitle')}
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '2.5rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {tools.map((tool) => (
            <div
              key={tool.slug}
              className="tech-capsule"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '2rem',
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                width: '180px',
                height: '180px',
                justifyContent: 'center',
                opacity: 0,
                transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                setHoveredTool(tool.slug);
                e.currentTarget.style.transform = 'scale(1.05) translateY(-10px)';
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.boxShadow = `0 30px 60px ${tool.color}15`;
                e.currentTarget.style.borderColor = `${tool.color}40`;
              }}
              onMouseLeave={(e) => {
                setHoveredTool(null);
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: '20px',
                display: 'flex',
                gap: '2px',
                opacity: hoveredTool === tool.slug ? 1 : 0,
                transform: hoveredTool === tool.slug ? 'translateY(0)' : 'translateY(-10px)',
                transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
              }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    color={i < tool.level ? tool.color : 'rgba(0,0,0,0.1)'}
                    fill={i < tool.level ? tool.color : 'transparent'}
                  />
                ))}
              </div>

              <div style={{
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                position: 'relative'
              }}>
                <Image
                  src={tool.image}
                  alt={tool.name}
                  width={60}
                  height={60}
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                opacity: 0.8,
                marginBottom: '1rem'
              }}>
                {tool.name}
              </span>
              {/* Progress Bar */}
              <div style={{ 
                width: '100%', 
                height: '4px', 
                background: 'rgba(255,255,255,0.2)', 
                borderRadius: '2px', 
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${tool.level / 5 * 100}%`, 
                  height: '100%', 
                  background: `linear-gradient(90deg, ${tool.color}, ${tool.color}cc)`, 
                  borderRadius: '2px',
                  transition: 'width 2s cubic-bezier(0.22, 1, 0.36, 1)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
