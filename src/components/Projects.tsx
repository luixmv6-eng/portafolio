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
  const { t } = useLanguage();

  // t() devuelve la clave cuando no encuentra traduccion, asi que el patron
  // `t(k) || fallback` nunca caia al fallback: imprimia "projects.items.x.y".
  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

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

  return (
    <section id="projects" ref={containerRef}>
      <div className="container">
        <header ref={headerRef} className="projects-header" style={{ marginBottom: '4.5rem' }}>
          <h2 className="projects-headline display-caps" style={{ fontSize: 'var(--t-display-2)', marginBottom: '1rem', opacity: 0 }}>
            {t('projects.title')}
          </h2>
          {/* Antes eran dos elementos: un subtitulo que decia "08 PROYECTOS
              SELECCIONADOS" a mano (ya son 9) y un contador que se renderizaba
              vacio. Ahora es una linea y el numero sale de los datos. */}
          <p className="projects-subline label" style={{ opacity: 0 }}>
            {projectsData.length} {tr('projects.itemsLabel', 'proyectos seleccionados')}
          </p>
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
                className="project-content-col mobile-col-full"
                style={{
                  gridColumn: index % 2 === 0 ? '8 / 13' : '1 / 6',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                {/* La categoria va sobre el titulo. El "/ 0N" que estaba aqui
                    solo numeraba tarjetas que el lector ya puede contar. */}
                <span className="label-sm" style={{ color: 'var(--accent)', marginBottom: '0.7rem' }}>
                  {tr(`projects.items.${project.id}.category`, project.category)}
                </span>
                <h3 className="display-caps" style={{ fontSize: 'var(--t-display-3)', marginBottom: '1rem' }}>
                  {project.title}
                </h3>
                <p className="body-copy" style={{ fontSize: 'var(--t-body-sm)', marginBottom: '1.5rem' }}>
                  {tr(`projects.items.${project.id}.description`, project.description)}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.6rem' }}>
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 'var(--t-label-sm)',
                        color: 'var(--muted)',
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--r-pill)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <span className="premium-button" style={{ width: 'fit-content' }}>
                  {t('projects.view')}
                </span>
              </div>
            </article>
          ))}
        </div>

        <ProjectModal project={selectedProject} onClose={closeModal} />
      </div>
        <style>{`
          @media (max-width: 900px) {
            .project-entry {
              display: flex !important;
              flex-direction: column !important;
              gap: 2rem !important;
              padding: 1.5rem !important;
            }
            .project-content-col {
              order: 2;
              text-align: center;
              align-items: center;
            }
            .project-content-col p {
              max-width: 100%;
            }
          }
        `}</style>
    </section>
  );
}
