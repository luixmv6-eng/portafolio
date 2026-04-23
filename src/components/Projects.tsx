'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { animate, createTimeline } from 'animejs';
import { useLanguage } from '../context/LanguageContext';
import ProjectModal from './ProjectModal';
import projectsData from '../data/projects.json';

export default function Projects() {
  const containerRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<ReturnType<typeof createTimeline> | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  const [selectedProject, setSelectedProject] = useState<(typeof projectsData)[number] | null>(null);

  const openProject = (project: (typeof projectsData)[number]) => setSelectedProject(project);
  const closeModal = () => setSelectedProject(null);

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
      window.dispatchEvent(new CustomEvent('modalToggle', { detail: { isOpen: true } }));
    } else {
      document.body.style.overflow = 'unset';
      window.dispatchEvent(new CustomEvent('modalToggle', { detail: { isOpen: false } }));
    }
  }, [selectedProject]);

  useEffect(() => {
    const entries = document.querySelectorAll('.project-entry');

    const observer = new IntersectionObserver((observedEntries) => {
      observedEntries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          animate(el, {
            translateY: [36, 0],
            opacity: [0, 1],
            duration: 850,
            easing: 'easeOutQuad',
          });

          const overlay = el.querySelector('.img-reveal') as HTMLElement | null;
          if (overlay) {
            animate(overlay, {
              scaleX: [1, 0],
              duration: 900,
              delay: 120,
              easing: 'easeInOutQuad',
            });
          }

          observer.unobserve(el);
        }
      });
    }, { threshold: 0.12 });

    entries.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!headerRef.current) return;

    animate('.projects-headline', {
      translateY: [26, 0],
      opacity: [0, 1],
      duration: 760,
      delay: 80,
      easing: 'easeOutCubic',
    });

    animate('.projects-subline', {
      translateY: [18, 0],
      opacity: [0, 1],
      duration: 720,
      delay: 180,
      easing: 'easeOutQuad',
    });

    animate('.projects-counter', {
      translateY: [16, 0],
      opacity: [0, 1],
      duration: 680,
      delay: 260,
      easing: 'easeOutQuad',
    });

    timelineRef.current = null;
    return () => {
      timelineRef.current = null;
    };
  }, []);

  const rawItemsLabel = t('projects.itemsLabel');
  const itemsLabel =
    rawItemsLabel && rawItemsLabel !== 'projects.itemsLabel'
      ? rawItemsLabel
      : language === 'es'
        ? 'proyectos seleccionados'
        : 'projects selected';

  return (
    <section id="projects" ref={containerRef}>
      <div className="container">
        <header ref={headerRef} className="projects-header" style={{ marginBottom: '4.5rem' }}>
          <h2 className="projects-headline" style={{ fontSize: 'clamp(2.2rem, 6vw, 4.2rem)', marginBottom: '1rem', letterSpacing: '-0.02em', opacity: 0 }}>
            {t('projects.title')}
          </h2>
          <p className="projects-subline" style={{ fontFamily: 'var(--font-sans)', opacity: 0, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
            {t('projects.subtitle')}
          </p>
          <span className="projects-counter" style={{ display: 'inline-block', marginTop: '0.9rem', fontFamily: 'var(--font-sans)', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', opacity: 0 }}>
            {projectsData.length.toString().padStart(2, '0')} {itemsLabel}
          </span>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '7rem' }}>
          {projectsData.map((project, index) => (
            <article
              key={project.id}
              className="project-entry grid-12 project-premium-entry"
              style={{ opacity: 0, cursor: 'pointer', alignItems: 'center' }}
              onClick={() => openProject(project)}
            >
              <div
                className="mobile-col-full"
                style={{
                  gridColumn: index % 2 === 0 ? '1 / 8' : '6 / 13',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  className="img-reveal"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--background)',
                    transformOrigin: 'left center',
                    zIndex: 2,
                  }}
                />
                <Image
                  src={project.image || `https://picsum.photos/seed/${project.id}/1200/800`}
                  alt={project.title}
                  width={1200}
                  height={675}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              <div
                className="mobile-col-full"
                style={{
                  gridColumn: index % 2 === 0 ? '8 / 13' : '1 / 6',
                  gridRow: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', letterSpacing: '0.2em', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.7rem' }}>
                  / 0{index + 1}
                </span>
                <h3 style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.8rem)', marginBottom: '0.8rem', textTransform: 'uppercase' }}>
                  {project.title}
                </h3>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.66rem', letterSpacing: '0.12em', opacity: 0.6, marginBottom: '0.8rem', display: 'block', textTransform: 'uppercase' }}>
                  {t(`projects.items.${project.id}.category`) || project.category}
                </span>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.98rem', lineHeight: 1.7, opacity: 0.78, marginBottom: '1.5rem' }}>
                  {t(`projects.items.${project.id}.description`) || project.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', marginBottom: '1.6rem' }}>
                  {project.tech.map((tech, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.66rem',
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        padding: '0.35rem 0.7rem',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="premium-button" style={{ width: 'fit-content', borderRadius: '8px', padding: '0.85rem 1.35rem', letterSpacing: '0.1em' }}>
                  {t('projects.view')}
                </div>
              </div>
            </article>
          ))}
        </div>

        <ProjectModal project={selectedProject} onClose={closeModal} />
      </div>
    </section>
  );
}
