'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
      // Pause Lenis smooth scroll while modal is open
      window.__lenis?.stop();
    } else {
      document.body.style.overflow = 'auto';
      window.__lenis?.start();
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.__lenis?.start();
    };
  }, [project]);

  if (!project) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          style={{
            background: 'var(--background)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '24px',
            maxWidth: '90vw',
            width: '800px',
            position: 'relative',
            cursor: 'default',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'none',
              border: 'none',
              color: 'var(--foreground)',
              cursor: 'pointer',
              padding: 0,
              zIndex: 10,
            }}
            aria-label="Close modal"
          >
            <X size={28} />
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
            <div style={{ padding: '3rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1rem' }}>
                {project.title}
              </h2>
              <p style={{ fontSize: '1.2rem', lineHeight: 1.7, marginBottom: '2rem', opacity: 0.8 }}>
                {project.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                {project.tech.map((tech, i) => (
                  <span
                    key={i}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      padding: '0.5rem 1.2rem',
                      borderRadius: '100px',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                {project.github && (
                  <a href={project.github} target="_blank" rel="noopener noreferrer" style={{ flex: 1 }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      style={{
                        width: '100%',
                        padding: '1rem 2rem',
                        background: 'var(--foreground)',
                        color: 'var(--background)',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      GitHub
                    </motion.button>
                  </a>
                )}
                {project.live && (
                  <a href={project.live} target="_blank" rel="noopener noreferrer" style={{ flex: 1 }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      style={{
                        width: '100%',
                        padding: '1rem 2rem',
                        background: 'transparent',
                        color: 'var(--foreground)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {t('projects.liveDemo') || 'Live Demo'}
                    </motion.button>
                  </a>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '0 3rem 3rem' }}>
              {project.gallery?.map((media: string | { type: string; src: string }, i: number) => {
                if (typeof media === 'string') {
                  return (
                    <img
                      key={i}
                      src={media}
                      alt={`${project.title} gallery ${i + 1}`}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '12px',
                        objectFit: 'cover',
                      }}
                    />
                  );
                } else if (media.type === 'video') {
                  return (
                    <video
                      key={i}
                      src={media.src}
                      controls
                      preload="metadata"
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '12px',
                      }}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
