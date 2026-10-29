'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import SkeletonImage from './SkeletonImage';
import { projectImages, projectText, type Project } from './projectText';
import styles from './Projects.module.css';

const ModelViewer3D = dynamic(() => import('./ModelViewer3D'), { ssr: false });

const DESKTOP = '(min-width: 1024px) and (hover: hover) and (pointer: fine)';

const hasWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

// Renders de los chips del visor, en el orden de las etiquetas traducidas
// (Coca-Cola, Deportivos, Perfumeria, Luna). Se buscan por nombre de archivo
// para no depender del orden de la galeria.
const CHIP_MATCH = ['coca cola4k .jpg', 'ball', 'chanel', 'luna'];

function ModelCard({ project, onOpen }: { project: Project; onOpen: (p: Project) => void }) {
  const { t } = useLanguage();
  const text = projectText(t);
  const viewerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(viewerRef, { once: true, margin: '200px 0px' });
  const [use3D, setUse3D] = useState(false);
  const [ready, setReady] = useState(false);
  const [render, setRender] = useState<number | null>(null);

  const images = projectImages(project);
  const labels = t('projects.modelChips').split('|');
  const chips = labels
    .map((label, i) => ({ label, src: images.find((src) => src.includes(CHIP_MATCH[i])) }))
    .filter((c): c is { label: string; src: string } => !!c.src);

  // Three.js solo en escritorio, con movimiento y al acercarse el visor.
  useEffect(() => {
    if (!inView) return;
    const desktop = window.matchMedia(DESKTOP).matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!desktop || reduced || !hasWebGL()) return;
    const id = window.setTimeout(() => setUse3D(true), 0);
    return () => window.clearTimeout(id);
  }, [inView]);

  const active = render === null ? null : chips[render];

  return (
    <motion.article
      className={`${styles.mediaCard} ${styles.model} sk-host`}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div ref={viewerRef} className={styles.viewer}>
        <span className={`${styles.mono} ${styles.viewerLabel}`}>{t('projects.viewer')}</span>

        {/* Malla del diseno: base estatica y respaldo sin WebGL. */}
        <motion.div
          className={styles.cube}
          aria-hidden="true"
          animate={{ opacity: ready ? 0 : 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image src="/v3/cubo-a.svg" alt="" width={202} height={227} style={{ left: 15, top: 10 }} unoptimized />
          <Image src="/v3/cubo-anillo.svg" alt="" width={225} height={81} style={{ left: 3, top: 85 }} unoptimized />
          <Image src="/v3/cubo-vertices.svg" alt="" width={208} height={233} style={{ left: 11, top: 6 }} unoptimized />
        </motion.div>

        {use3D && (
          <motion.div
            className={styles.cubeCanvas}
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <ModelViewer3D onReady={() => setReady(true)} />
          </motion.div>
        )}

        <AnimatePresence>
          {active && (
            <motion.div
              key={active.src}
              className={styles.render}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <SkeletonImage
                src={active.src}
                alt={`${project.title} — ${active.label}`}
                width={1200}
                height={800}
                sizes="(max-width: 960px) 92vw, 50vw"
                frameClassName="sk-dark"
                style={{ width: '100%', height: '100%' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <span className={`${styles.mono} ${styles.viewerOrbit}`}>{t('projects.orbit')}</span>
      </div>

      <div className={styles.mediaBody}>
        <div className={styles.chips} role="group" aria-label={project.title}>
          {chips.map((chip, i) => (
            <button
              key={chip.label}
              type="button"
              className={styles.chip}
              aria-pressed={render === i}
              onClick={() => setRender((r) => (r === i ? null : i))}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <span className={styles.kicker}>{text.kicker(project)}</span>
        <div className={styles.mediaTitleRow}>
          <h4 className={styles.mediaTitle}>
            <span className="sk sk-dark">{project.title}</span>
          </h4>
          <button
            type="button"
            className={`${styles.arrowBtn} ${styles.arrowLight}`}
            aria-label={`${t('projects.open')}: ${project.title}`}
            onClick={() => onOpen(project)}
          >
            <Image src="/v3/flecha-oscura.svg" alt="" width={18} height={18} unoptimized />
          </button>
        </div>
        <p className={styles.mediaDesc}>
          <span className="sk sk-dark">{text.description(project)}</span>
        </p>
      </div>
    </motion.article>
  );
}

// Numeracion de negativo: 12, 12A, 13, 13A...
const frameNo = (i: number) => `${12 + Math.floor(i / 2)}${i % 2 ? 'A' : ''}`;

function PhotoCard({ project, onOpen }: { project: Project; onOpen: (p: Project) => void }) {
  const { t } = useLanguage();
  const text = projectText(t);
  const cardRef = useRef<HTMLElement>(null);
  const images = projectImages(project);
  // Dos vueltas de la tira para que al avanzar nunca quede un hueco.
  const frames = [...images, ...images];

  // La pelicula avanza en horizontal con el scroll (notas de motion, 08).
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-38%']);

  return (
    <motion.article
      ref={cardRef}
      className={`${styles.mediaCard} ${styles.photo} sk-host`}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        type="button"
        className={styles.film}
        style={{ border: 0, cursor: 'pointer', width: '100%' }}
        aria-label={`${t('projects.open')}: ${project.title}`}
        onClick={() => onOpen(project)}
      >
        <motion.span className={styles.sprockets} style={{ x, width: '200%' }} aria-hidden="true" />
        <motion.span className={styles.frames} style={{ x }}>
          {frames.map((src, i) => (
            <span key={`${src}-${i}`} className={styles.frame} style={{ ['--frame-w' as string]: 'clamp(110px, 10vw, 146px)' }}>
              <SkeletonImage
                src={src}
                alt={i < images.length ? `${project.title} ${i + 1}` : ''}
                width={600}
                height={900}
                sizes="150px"
                style={{ width: '100%', height: '100%' }}
                frameClassName="sk-dark"
              />
              <span className={styles.frameNo} aria-hidden="true">
                {frameNo(i)}
              </span>
            </span>
          ))}
        </motion.span>
        <motion.span className={styles.sprockets} style={{ x, width: '200%' }} aria-hidden="true" />
      </button>

      <div className={styles.mediaBody}>
        <span className={styles.kicker}>{text.kicker(project)}</span>
        <div className={styles.mediaTitleRow}>
          <h4 className={styles.mediaTitle}>
            <span className="sk">{project.title}</span>
          </h4>
          <button
            type="button"
            className={styles.arrowBtn}
            aria-label={`${t('projects.open')}: ${project.title}`}
            onClick={() => onOpen(project)}
          >
            <Image src="/v3/flecha-proyecto.svg" alt="" width={18} height={18} unoptimized />
          </button>
        </div>
        <p className={styles.mediaDesc}>
          <span className="sk">{text.description(project)}</span>
        </p>
        <ul className={styles.tags}>
          {project.tech.map((tech) => (
            <li key={tech} className={styles.tag}>
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

export default function ProjectsMedia({
  model,
  photo,
  onOpen,
}: {
  model?: Project;
  photo?: Project;
  onOpen: (p: Project) => void;
}) {
  return (
    <div className={`${styles.media} ${model && photo ? '' : styles.mediaSingle}`}>
      {model && <ModelCard project={model} onOpen={onOpen} />}
      {photo && <PhotoCard project={photo} onOpen={onOpen} />}
    </div>
  );
}
