'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import ProjectModal from './ProjectModal';
import ProjectsWeb from './ProjectsWeb';
import ProjectsWall from './ProjectsWall';
import ProjectsMedia from './ProjectsMedia';
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
import type { Project } from './projectText';
import styles from './Projects.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;

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

const pad = (n: number) => String(n).padStart(2, '0');
const byCategory = (id: string) => projectsData.filter((p) => p.category === id);

function ChannelHead({ index, title, count }: { index: number; title: string; count: number }) {
  const { t } = useLanguage();
  return (
    <div className={styles.channelHead}>
      <span className={styles.mono}>
        {t('projects.channel')} {pad(index)}
      </span>
      <h3 className={styles.channelTitle}>{title}</h3>
      <motion.span
        className={styles.channelRule}
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: EASE }}
      />
      <span className={styles.mono}>({pad(count)})</span>
    </div>
  );
}

export default function Projects() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<Project | null>(null);
  const activeCategory = useSyncExternalStore(subscribeToHash, readHashCategory, readServerCategory);

  const openProject = useCallback((project: Project) => setSelected(project), []);
  const closeModal = useCallback(() => setSelected(null), []);

  // El filtro ya lo cambia el hash del enlace; esto solo trae al usuario hasta
  // la seccion, incluso cuando vuelve a pulsar la categoria que ya estaba.
  useEffect(() => {
    const onRequest = () => scrollToProjects();
    window.addEventListener(PROJECT_CATEGORY_EVENT, onRequest);
    return () => window.removeEventListener(PROJECT_CATEGORY_EVENT, onRequest);
  }, []);

  // Enlace profundo: el navegador no salta a un hash de categoria porque no
  // existe ningun elemento con ese id.
  useEffect(() => {
    if (!categoryFromHash(window.location.hash)) return;
    const frame = requestAnimationFrame(() => scrollToProjects());
    return () => cancelAnimationFrame(frame);
  }, []);

  // La barra se esconde mientras el modal esta abierto.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('modalToggle', { detail: { isOpen: !!selected } }));
    document.documentElement.toggleAttribute('data-modal-open', !!selected);
  }, [selected]);

  const show = (id: string) => activeCategory === 'all' || activeCategory === id;
  const web = byCategory('web');
  const design = byCategory('design');
  const model = byCategory('3d')[0];
  const photo = byCategory('photo')[0];

  const visibleCount =
    activeCategory === 'all' ? projectsData.length : byCategory(activeCategory).length;

  const filters: { id: CategoryFilter; count: number }[] = [
    { id: 'all', count: projectsData.length },
    ...PROJECT_CATEGORIES.map((c) => ({ id: c.id as CategoryFilter, count: byCategory(c.id).length })),
  ];
  // Orden de las pastillas del diseno: todos, web, diseno, foto, 3D.
  const FILTER_ORDER: CategoryFilter[] = ['all', 'web', 'design', 'photo', '3d'];
  filters.sort((a, b) => FILTER_ORDER.indexOf(a.id) - FILTER_ORDER.indexOf(b.id));

  const one = visibleCount === 1;

  return (
    <section id="projects" className={styles.section} aria-labelledby="projects-title">
      <motion.header
        className={`${styles.head} sk-host`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <div className={styles.headText}>
          <span className={`${styles.mono} ${styles.eyebrow} sk`}>{t('projects.sectionEyebrow')}</span>
          <h2 id="projects-title" className={styles.title}>
            <span className={styles.titleLine}>
              {t(one ? 'projects.headCountOne' : 'projects.headCount').replace('{n}', String(visibleCount))}
            </span>
            <span className={styles.titleAccent}>
              {t(one ? 'projects.headAccentOne' : 'projects.headAccent')}
            </span>
          </h2>
        </div>

        <nav className={styles.filters} aria-label={t('projects.filterLabel')}>
          {filters.map((f) => {
            const active = activeCategory === f.id;
            return (
              <a
                key={f.id}
                href={categoryHref(f.id)}
                className={styles.filter}
                aria-current={active ? 'true' : undefined}
                onClick={() => requestProjectCategory(f.id)}
              >
                {active && (
                  <motion.span
                    layoutId="projects-filter"
                    className={styles.filterPill}
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  />
                )}
                <span>{t(`projects.short.${f.id}`)}</span>
                <span className={styles.filterCount}>{pad(f.count)}</span>
              </a>
            );
          })}
        </nav>
      </motion.header>

      {activeCategory === 'all' && <p className={styles.intro}>{t('projects.intro')}</p>}

      {visibleCount === 0 && <p className={styles.empty}>{t('projects.empty')}</p>}

      {show('web') && web.length > 0 && (
        <div className={styles.channel}>
          <ChannelHead index={1} title={t('projects.channels.web')} count={web.length} />
          <ProjectsWeb projects={web} onOpen={openProject} />
        </div>
      )}

      {show('design') && design.length > 0 && (
        <ProjectsWall
          projects={design}
          onOpen={openProject}
          header={
            <div className={styles.channelHead}>
              <span className={styles.mono}>
                {t('projects.channel')} {pad(2)}
              </span>
              <h3 className={styles.channelTitle}>{t('projects.channels.design')}</h3>
              <span className={styles.channelRule} aria-hidden="true" />
              <span className={`${styles.mono} ${styles.dragHint}`}>← {t('projects.drag')} →</span>
              <span className={styles.mono}>({pad(design.length)})</span>
            </div>
          }
        />
      )}

      {(show('3d') || show('photo')) && (model || photo) && (
        <div className={styles.channel}>
          <ChannelHead
            index={3}
            title={t('projects.channels.media')}
            count={(show('3d') && model ? 1 : 0) + (show('photo') && photo ? 1 : 0)}
          />
          <ProjectsMedia
            model={show('3d') ? model : undefined}
            photo={show('photo') ? photo : undefined}
            onOpen={openProject}
          />
        </div>
      )}

      <ProjectModal project={selected} onClose={closeModal} />
    </section>
  );
}
