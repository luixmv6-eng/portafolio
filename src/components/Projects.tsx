'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { animate, createTimeline } from 'animejs';
import { useLanguage } from '../context/LanguageContext';
import ProjectModal from './ProjectModal';
import projectsData from '../data/projects.json';
import {
  PROJECT_CATEGORIES,
  PROJECT_CATEGORY_EVENT,
  categoryFromHash,
  categoryHref,
  requestProjectCategory,
  scrollToProjects,
  type CategoryFilter,
} from '../data/categories';

/**
 * El filtro vive en el hash, no en un useState: asi el desplegable de la
 * navbar, las pastillas de aqui, un enlace compartido y el boton atras del
 * navegador describen todos el mismo estado sin sincronizarse entre si.
 */
const subscribeToHash = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};
const readHashCategory = (): CategoryFilter => categoryFromHash(window.location.hash) ?? 'all';
const readServerCategory = (): CategoryFilter => 'all';

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
  const activeCategory = useSyncExternalStore(subscribeToHash, readHashCategory, readServerCategory);

  const openProject = (project: (typeof projectsData)[number]) => setSelectedProject(project);
  const closeModal = () => setSelectedProject(null);

  const filteredProjects = useMemo(
    () =>
      activeCategory === 'all'
        ? projectsData
        : projectsData.filter((project) => project.category === activeCategory),
    [activeCategory]
  );

  const activeCategoryLabel =
    activeCategory === 'all'
      ? null
      : t(PROJECT_CATEGORIES.find((c) => c.id === activeCategory)!.labelKey);

  // El filtro ya lo cambia el hash del enlace; esto solo trae al usuario hasta
  // la seccion, incluso cuando vuelve a pulsar la categoria que ya estaba.
  useEffect(() => {
    const onRequest = () => scrollToProjects();
    window.addEventListener(PROJECT_CATEGORY_EVENT, onRequest);
    return () => window.removeEventListener(PROJECT_CATEGORY_EVENT, onRequest);
  }, []);

  // Enlace profundo: el navegador no salta a un hash de categoria porque no
  // existe ningun elemento con ese id. Un frame de margen deja que el layout
  // se asiente antes de medir el destino.
  useEffect(() => {
    if (!categoryFromHash(window.location.hash)) return;
    const frame = requestAnimationFrame(() => scrollToProjects());
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
      window.dispatchEvent(new CustomEvent('modalToggle', { detail: { isOpen: true } }));
    } else {
      document.body.style.overflow = 'unset';
      window.dispatchEvent(new CustomEvent('modalToggle', { detail: { isOpen: false } }));
    }
  }, [selectedProject]);

  // Se vuelve a observar al cambiar de categoria: las fichas que entran son
  // nodos nuevos y nacen con opacity 0. `data-revealed` evita repetir la
  // animacion en las que ya estaban en pantalla.
  useEffect(() => {
    const entries = document.querySelectorAll('.project-entry:not([data-revealed])');

    const observer = new IntersectionObserver((observedEntries) => {
      observedEntries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          el.dataset.revealed = 'true';

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
  }, [activeCategory]);

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

  const filters: { id: CategoryFilter; name: string }[] = [
    { id: 'all', name: tr('projects.all', 'TODOS') },
    ...PROJECT_CATEGORIES.map((category) => ({ id: category.id as CategoryFilter, name: t(category.labelKey) })),
  ];

  return (
    <section id="projects" ref={containerRef} style={{ scrollMarginTop: '80px' }}>
      <div className="container">
        <header ref={headerRef} className="projects-header" style={{ marginBottom: '3rem' }}>
          <h2 className="projects-headline display-caps" style={{ fontSize: 'var(--t-display-2)', marginBottom: '1rem', opacity: 0 }}>
            {t('projects.title')}
          </h2>
          {/* Antes eran dos elementos: un subtitulo que decia "08 PROYECTOS
              SELECCIONADOS" a mano (ya son 9) y un contador que se renderizaba
              vacio. Ahora es una linea y el numero sale de los datos. */}
          <p className="projects-subline label" style={{ opacity: 0 }}>
            {activeCategoryLabel && (
              <span style={{ color: 'var(--accent)' }}>{activeCategoryLabel} — </span>
            )}
            {filteredProjects.length}{' '}
            {filteredProjects.length === 1
              ? tr('projects.itemLabel', 'proyecto seleccionado')
              : tr('projects.itemsLabel', 'proyectos seleccionados')}
          </p>
        </header>

        {/* Los mismos cuatro destinos del desplegable, visibles dentro de la
            seccion para poder saltar de una disciplina a otra sin volver arriba. */}
        <div
          className="projects-filters"
          role="group"
          aria-label={tr('projects.filterLabel', 'Filtrar proyectos por categoria')}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.6rem',
            marginBottom: '4rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {filters.map((filter) => {
            const isActive = activeCategory === filter.id;
            return (
              <a
                key={filter.id}
                href={categoryHref(filter.id)}
                aria-current={isActive ? 'true' : undefined}
                className="projects-filter"
                data-active={isActive ? 'true' : undefined}
                onClick={() => requestProjectCategory(filter.id)}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--t-label-sm)',
                  letterSpacing: 'var(--track-label)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  padding: '0.6rem 1.1rem',
                  borderRadius: 'var(--r-pill)',
                  color: isActive ? 'var(--accent-contrast)' : 'var(--muted)',
                  background: isActive ? 'var(--accent)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  transition: 'color var(--dur-fast) ease, background var(--dur-fast) ease, border-color var(--dur-fast) ease',
                }}
              >
                {filter.name}
              </a>
            );
          })}
        </div>

        {filteredProjects.length === 0 ? (
          <p className="body-copy">{tr('projects.empty', 'Todavia no hay proyectos en esta categoria.')}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7rem' }}>
            {filteredProjects.map((project, index) => (
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
                    /* Ambas columnas se fijan a la fila 1. Sin esto, en las
                       fichas invertidas la imagen ocupa 6/13 y la colocacion
                       automatica de Grid, que nunca retrocede, empuja el texto
                       a una segunda fila: quedaba debajo y no al lado. */
                    gridRow: 1,
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
                    gridRow: 1,
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
        )}

        <ProjectModal project={selectedProject} onClose={closeModal} />
      </div>
        <style>{`
          .projects-filter:hover {
            color: var(--accent);
            border-color: var(--accent);
          }
          .projects-filter[data-active='true']:hover {
            color: var(--accent-contrast);
            background: var(--accent-alt);
            border-color: var(--accent-alt);
          }

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
            .projects-filters {
              justify-content: center;
            }
          }
        `}</style>
    </section>
  );
}
