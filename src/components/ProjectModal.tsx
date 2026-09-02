'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { X } from 'lucide-react';

type Project = {
  id: string;
  title: string;
  description: string;
  tech: string[];
  image: string;
  gallery?: (string | { type: string; src: string })[];
  github?: string;
  live?: string;
};

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const { t } = useLanguage();
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!project) return;

    lastFocused.current = document.activeElement as HTMLElement;
    window.__lenis?.stop();
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.__lenis?.start();
      window.removeEventListener('keydown', onKey);
      // Devuelve el foco a la tarjeta que abrio el modal.
      lastFocused.current?.focus();
    };
  }, [project, onClose]);

  // AnimatePresence se queda montado siempre. Antes habia un
  // `if (!project) return null` arriba, asi que al cerrar el arbol
  // desaparecia de golpe y la animacion de salida nunca corria.
  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'color-mix(in srgb, #05070d 78%, transparent)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(1rem, 3vw, 2rem)',
          }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
            initial={{ scale: 0.94, opacity: 0, y: 28 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'var(--background)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--card-shadow-hover)',
              maxWidth: '90vw',
              width: '820px',
              position: 'relative',
              cursor: 'default',
              maxHeight: '90dvh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label={t('projects.close')}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'color-mix(in srgb, var(--background) 70%, transparent)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-pill)',
                color: 'var(--foreground)',
                cursor: 'pointer',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
            >
              <X size={20} aria-hidden="true" />
            </button>

            <div
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              style={{
                flex: '1 1 auto',
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <div style={{ padding: 'clamp(1.75rem, 4vw, 3rem)' }}>
                <h2 style={{ fontSize: 'var(--t-display-3)', marginBottom: '1rem' }}>
                  {project.title}
                </h2>
                <p className="body-copy" style={{ marginBottom: '2rem' }}>
                  {t(`projects.items.${project.id}.description`) === `projects.items.${project.id}.description`
                    ? project.description
                    : t(`projects.items.${project.id}.description`)}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      style={{
                        /* Antes rgba(255,255,255,0.1): invisible en tema claro. */
                        background: 'var(--surface-raised)',
                        border: '1px solid var(--border-subtle)',
                        padding: '0.4rem 1rem',
                        borderRadius: 'var(--r-pill)',
                        fontSize: 'var(--t-label)',
                        fontFamily: 'var(--font-sans)',
                        color: 'var(--muted)',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="premium-button"
                      style={{ textDecoration: 'none' }}
                    >
                      GitHub
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="premium-button"
                      style={{ textDecoration: 'none' }}
                    >
                      {t('projects.liveDemo')}
                    </a>
                  )}
                </div>
              </div>

              {project.gallery && project.gallery.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    padding: '0 clamp(1.75rem, 4vw, 3rem) clamp(1.75rem, 4vw, 3rem)',
                  }}
                >
                  {project.gallery.map((media, i) => {
                    if (typeof media === 'string') {
                      return (
                        <Image
                          key={media}
                          src={media}
                          alt={`${project.title}, ${t('projects.gallery')} ${i + 1}`}
                          width={1600}
                          height={900}
                          sizes="(max-width: 900px) 90vw, 820px"
                          style={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: 'var(--r-sm)',
                            border: '1px solid var(--border-subtle)',
                            display: 'block',
                          }}
                        />
                      );
                    }
                    if (media.type === 'video') {
                      return (
                        <video
                          key={media.src}
                          src={media.src}
                          controls
                          preload="metadata"
                          style={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: 'var(--r-sm)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
