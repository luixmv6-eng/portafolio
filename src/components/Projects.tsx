'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { animate } from 'animejs';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import ProjectModal from './ProjectModal';
import projectsData from '../data/projects.json';

export default function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const [selectedProject, setSelectedProject] = useState<(typeof projectsData)[number] | null>(null);

  const openProject = (project: (typeof projectsData)[number]) => setSelectedProject(project);
  const closeModal = () => setSelectedProject(null);

  useEffect(() => {
    const entries = document.querySelectorAll('.project-entry');
    
    const observer = new IntersectionObserver((observedEntries) => {
      observedEntries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          animate(el, {
            translateY: [80, 0],
            opacity: [0, 1],
            duration: 1400,
            easing: 'easeOutExpo'
          });
          // Reveal the image overlay
          const overlay = el.querySelector('.img-reveal') as HTMLElement;
          if (overlay) {
            animate(overlay, {
              scaleX: [1, 0],
              duration: 1200,
              delay: 200,
              easing: 'easeInOutExpo'
            });
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.1 });

    entries.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="projects" ref={containerRef}>
      <div className="container">
        <div style={{ marginBottom: '6rem' }}>
          <h2 style={{ fontSize: 'clamp(3.5rem, 8vw, 10rem)', marginBottom: '2rem' }}>{t('projects.title')}</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <p style={{ fontFamily: 'var(--font-sans)', opacity: 0.5, letterSpacing: '0.1em' }}>{t('projects.subtitle')}</p>
            <div style={{ width: '40%', height: '1px', background: 'var(--border-subtle)' }} />
          </div>

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12rem' }}>
          {projectsData.map((project, index) => (
            <div 
              key={project.id} 
              className="project-entry grid-12"
              style={{ 
                opacity: 0,
                cursor: 'pointer',
                alignItems: 'center'
              }}
              onClick={() => openProject(project)}
            >
              <div className="mobile-col-full" style={{ 
                gridColumn: index % 2 === 0 ? '1 / 9' : '5 / 13',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '12px',
                boxShadow: '0 30px 60px rgba(0,0,0,0.07)'
              }}>
                {/* Reveal overlay */}
                <div className="img-reveal" style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'var(--background)',
                  transformOrigin: 'left center',
                  zIndex: 2,
                }} />
                <Image 
                  src={project.image || `https://picsum.photos/seed/${project.id}/1200/800`} 
                  alt={project.title}
                  width={1200}
                  height={675}
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    display: 'block',
                    transition: 'transform 1.4s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>

              <div className="mobile-col-full" style={{ 
                gridColumn: index % 2 === 0 ? '9 / 13' : '1 / 5',
                gridRow: '1',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <span style={{ 
                  fontFamily: 'var(--font-sans)', 
                  fontSize: '0.8rem', 
                  letterSpacing: '0.2em', 
                  color: 'var(--accent)',
                  fontWeight: '600',
                  marginBottom: '1rem'
                }}>
                  / 0{index + 1}
                </span>
                <h3 style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
                  {project.title}
                </h3>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  opacity: 0.5,
                  marginBottom: '1rem',
                  display: 'block'
                }}>
                  {project.category}
                </span>
                <p style={{ 
                  fontFamily: 'var(--font-sans)', 
                  fontSize: '1.1rem', 
                  lineHeight: 1.8, 
                  opacity: 0.6,
                  marginBottom: '2rem'
                }}>
                  {project.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '3rem' }}>
                  {project.tech.map((tech, i) => (
                    <span key={i} style={{ 
                      fontSize: '0.7rem', 
                      background: 'var(--secondary)', 
                      padding: '0.4rem 1rem', 
                      borderRadius: '100px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>{tech}</span>
                  ))}
                </div>
                <div className="premium-button" style={{ width: 'fit-content' }}>
                  {t('projects.view')}
                </div>
              </div>
            </div>
          ))}
        </div>

        <ProjectModal project={selectedProject} onClose={closeModal} />
      </div>
    </section>
  );
}
