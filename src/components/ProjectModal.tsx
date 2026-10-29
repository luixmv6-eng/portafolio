'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import SkeletonImage from './SkeletonImage';
import { projectMedia, projectText, type Project } from './projectText';
import styles from './ProjectModal.module.css';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

function Sheet({ project, onClose }: { project: Project; onClose: () => void }) {
  const { t } = useLanguage();
  const text = projectText(t);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const media = projectMedia(project);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  const go = useCallback(
    (step: number) => {
      setDir(step);
      setIndex((i) => (i + step + media.length) % media.length);
    },
    [media.length]
  );

  useEffect(() => {
    lastFocused.current = document.activeElement as HTMLElement;
    window.__lenis?.stop();
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.__lenis?.start();
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      // Devuelve el foco a la tarjeta que abrio el modal.
      lastFocused.current?.focus();
    };
  }, [onClose, go]);

  const current = media[index];

  return (
    <motion.div
      className={styles.sheet}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onClick={(e) => e.stopPropagation()}
      data-lenis-prevent
    >
      {/* ---- Visor ---- */}
      <div className={styles.viewer}>
        <span className={styles.counter}>
          {pad(index + 1)} / {pad(media.length)}
        </span>

        <div className={styles.stage}>
          <AnimatePresence initial={false} custom={dir}>
            <motion.div
              key={index}
              className={styles.slide}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {typeof current === 'string' ? (
                <SkeletonImage
                  src={current}
                  alt={`${project.title}, ${t('projects.gallery')} ${index + 1}`}
                  fill
                  sizes="(max-width: 960px) 96vw, 70vw"
                  frameClassName={`${styles.slideFrame} sk-dark`}
                  priority
                />
              ) : (
                <video src={current.src} controls autoPlay muted playsInline preload="metadata" />
              )}
            </motion.div>
          </AnimatePresence>

          {media.length > 1 && (
            <>
              <button type="button" className={`${styles.nav} ${styles.prev}`} onClick={() => go(-1)} aria-label={t('projects.prev')}>
                <ChevronLeft size={20} />
              </button>
              <button type="button" className={`${styles.nav} ${styles.next}`} onClick={() => go(1)} aria-label={t('projects.next')}>
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {media.length > 1 && (
          <div className={styles.thumbs} aria-label={t('projects.gallery')}>
            {media.map((m, i) => (
              <button
                key={typeof m === 'string' ? m : m.src}
                type="button"
                className={styles.thumb}
                aria-current={i === index ? 'true' : undefined}
                aria-label={`${t('projects.gallery')} ${i + 1}`}
                onClick={() => {
                  setDir(i > index ? 1 : -1);
                  setIndex(i);
                }}
              >
                {typeof m === 'string' ? (
                  <Image src={m} alt="" width={168} height={112} sizes="84px" />
                ) : (
                  <span className={styles.thumbVideo}>▶ VIDEO</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---- Ficha ---- */}
      <div className={styles.info}>
        <span className={styles.kicker}>{text.kicker(project)}</span>
        <h2 className={styles.title}>{project.title}</h2>
        <p className={styles.desc}>{text.description(project)}</p>
        <ul className={styles.tags}>
          {project.tech.map((tech) => (
            <li key={tech} className={styles.tag}>
              {tech}
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          {project.live && (
            <a href={project.live} target="_blank" rel="noopener noreferrer" className={styles.cta}>
              {t('projects.liveDemo')}
              <Image src="/v3/flecha-proyecto.svg" alt="" width={18} height={18} unoptimized />
            </a>
          )}
          {'github' in project && typeof project.github === 'string' && (
            <a href={project.github} target="_blank" rel="noopener noreferrer" className={`${styles.cta} ${styles.ctaGhost}`}>
              GitHub
            </a>
          )}
        </div>
      </div>

      <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label={t('projects.close')}>
        <X size={20} aria-hidden="true" />
      </button>
    </motion.div>
  );
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  // AnimatePresence se queda montado siempre para que la salida se anime.
  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="backdrop"
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <Sheet key={project.id} project={project} onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
