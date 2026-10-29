'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import SkeletonImage from './SkeletonImage';
import { projectImages, projectText, projectUrl, type Project } from './projectText';
import styles from './Projects.module.css';

// Orden del diseno: destacado, dos laterales y una fila de tres. Cualquier
// proyecto web nuevo se suma a la fila de abajo.
const WEB_ORDER = ['castilla_agricola', 'tessuti_web', 'riopaila_agricola', 'lessence_catalogo', 'lumina', 'autopartes_erg'];

type Size = 'featured' | 'side' | 'row';

const SCREEN_CLASS: Record<Size, string> = {
  featured: styles.screenFeatured,
  side: styles.screenSide,
  row: styles.screenRow,
};

const SIZES: Record<Size, string> = {
  featured: '(max-width: 1180px) 92vw, 820px',
  side: '(max-width: 760px) 92vw, (max-width: 1180px) 46vw, 470px',
  row: '(max-width: 760px) 92vw, (max-width: 960px) 46vw, 30vw',
};

function WebCard({
  project,
  size,
  index,
  onOpen,
}: {
  project: Project;
  size: Size;
  index: number;
  onOpen: (p: Project) => void;
}) {
  const { t } = useLanguage();
  const text = projectText(t);
  const screenRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const shots = projectImages(project);

  // La tira recorre todas las capturas: se mide al entrar porque las imagenes
  // pueden haber terminado de cargar despues del primer render.
  const measure = () => {
    const screen = screenRef.current;
    const strip = stripRef.current;
    if (!screen || !strip) return;
    const shift = Math.min(0, screen.clientHeight - strip.scrollHeight);
    strip.style.setProperty('--strip-shift', `${shift}px`);
    strip.style.setProperty('--strip-dur', `${Math.max(1.2, Math.abs(shift) / 260)}s`);
  };

  const featured = size === 'featured';

  return (
    <motion.article
      className={`${styles.webCard} sk-host`}
      onPointerEnter={measure}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: (index % 3) * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={styles.window}
        role="button"
        tabIndex={0}
        aria-label={`${t('projects.open')}: ${project.title}`}
        onClick={() => onOpen(project)}
        onFocus={measure}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen(project);
          }
        }}
      >
        <div className={styles.windowBar} aria-hidden="true">
          <Image src="/v3/navegador-puntos.svg" alt="" width={42} height={10} className={styles.windowDots} unoptimized />
          <span className={styles.url}>{projectUrl(project)}</span>
        </div>
        <div ref={screenRef} className={`${styles.screen} ${SCREEN_CLASS[size]}`}>
          <div ref={stripRef} className={styles.strip}>
            {shots.map((src, i) => (
              <SkeletonImage
                key={src}
                src={src}
                alt={i === 0 ? project.title : ''}
                width={1600}
                height={900}
                sizes={SIZES[size]}
                frameClassName={styles.shot}
                priority={featured && i === 0}
              />
            ))}
          </div>
        </div>
      </div>

      {featured && <span className={styles.badge}>{t('projects.featured')}</span>}

      <div className={styles.info}>
        <div className={styles.infoText}>
          <span className={`${styles.kicker} sk`}>{text.kicker(project)}</span>
          <h4 className={`${styles.cardTitle} ${featured ? styles.cardTitleXl : ''}`}>
            <span className="sk">{project.title}</span>
          </h4>
          {featured && (
            <p className={styles.desc}>
              <span className="sk">{text.description(project)}</span>
            </p>
          )}
          <ul className={styles.tags}>
            {project.tech.map((tech) => (
              <li key={tech} className={styles.tag}>
                {tech}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          className={styles.arrowBtn}
          aria-label={`${t('projects.open')}: ${project.title}`}
          onClick={() => onOpen(project)}
        >
          <Image src="/v3/flecha-proyecto.svg" alt="" width={18} height={18} unoptimized />
        </button>
      </div>
    </motion.article>
  );
}

export default function ProjectsWeb({ projects, onOpen }: { projects: Project[]; onOpen: (p: Project) => void }) {
  const ordered = [...projects].sort((a, b) => {
    const ia = WEB_ORDER.indexOf(a.id);
    const ib = WEB_ORDER.indexOf(b.id);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  const [featured, ...rest] = ordered;
  const side = rest.slice(0, 2);
  const row = rest.slice(2);

  if (!featured) return null;

  return (
    <>
      <div className={styles.webTop}>
        <WebCard project={featured} size="featured" index={0} onOpen={onOpen} />
        {side.length > 0 && (
          <div className={styles.webSide}>
            {side.map((p, i) => (
              <WebCard key={p.id} project={p} size="side" index={i + 1} onOpen={onOpen} />
            ))}
          </div>
        )}
      </div>
      {row.length > 0 && (
        <div className={styles.webRow}>
          {row.map((p, i) => (
            <WebCard key={p.id} project={p} size="row" index={i} onOpen={onOpen} />
          ))}
        </div>
      )}
    </>
  );
}
