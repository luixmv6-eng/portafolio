'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Variants,
} from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { requestProjectCategory, type ProjectCategory } from '../data/categories';
import projectsData from '../data/projects.json';
import techData from '../data/tech.json';
import styles from './About.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;

// Las cifras salen de los datos, no de constantes que se quedan viejas.
const PROJECT_COUNT = projectsData.length;
const TOOL_COUNT = techData.length;

// Reparto por disciplina para el grafico de la tarjeta de proyectos.
const DISCIPLINES: { id: ProjectCategory; color: string }[] = [
  { id: 'web', color: 'var(--naranja)' },
  { id: 'design', color: 'var(--crema)' },
  { id: 'photo', color: 'var(--gris-claro)' },
  { id: '3d', color: 'var(--linea-oscura)' },
];
const BY_DISCIPLINE = DISCIPLINES.map((d) => ({
  ...d,
  count: projectsData.filter((p) => p.category === d.id).length,
}));

// Stickers: posicion en % de la tarjeta (x, y) y su version compacta.
const STICKERS = [
  { bg: 'var(--crema)', rotate: 8, x: 3, y: 22, xs: 4, ys: 15 },
  { bg: 'var(--naranja)', rotate: -6, x: 36.8, y: 10.5, xs: 30, ys: 29 },
  { bg: 'var(--hueso-profundo)', rotate: -4, x: 11.8, y: 42, xs: 5, ys: 44 },
  { bg: 'var(--crema)', rotate: 5, x: 43.2, y: 43.8, xs: 34, ys: 58 },
  { bg: 'var(--naranja)', rotate: 12, x: 22.8, y: 69.4, xs: 9, ys: 73 },
  { bg: 'var(--crema)', rotate: -7, x: 44.1, y: 63.5, xs: 46, ys: 74 },
];

const pad2 = (n: number) => String(Math.round(n)).padStart(2, '0');

/** Contador 0 -> valor al entrar en pantalla (notas de motion, 04). El HTML
 *  del servidor ya trae la cifra final: sin JS o con movimiento reducido no
 *  hay nada que esperar. */
function Counter({ to, padded = false }: { to: number; padded?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const value = useMotionValue(to);
  const text = useTransform(value, (v) => (padded ? pad2(v) : String(Math.round(v))));

  useEffect(() => {
    if (reduce) return;
    if (!inView) {
      value.set(0);
      return;
    }
    const controls = animate(value, to, { duration: 1.6, ease: EASE });
    return () => controls.stop();
  }, [inView, reduce, to, value]);

  return <motion.span ref={ref}>{text}</motion.span>;
}

const cardIn: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.8, ease: EASE },
  }),
};

// Los stickers caen desde arriba con un muelle flojo, como si tuvieran peso.
const stickerIn: Variants = {
  hidden: ({ rotate }: { rotate: number; i: number }) => ({
    opacity: 0,
    y: -320,
    rotate: rotate - 24,
  }),
  show: ({ rotate, i }: { rotate: number; i: number }) => ({
    opacity: 1,
    y: 0,
    rotate,
    transition: {
      delay: 0.25 + i * 0.09,
      y: { type: 'spring', stiffness: 210, damping: 12, mass: 0.9 },
      rotate: { type: 'spring', stiffness: 120, damping: 9 },
      opacity: { duration: 0.2 },
    },
  }),
};

export default function About() {
  const { t } = useLanguage();
  const stickersRef = useRef<HTMLDivElement>(null);
  const disciplines = t('about.disciplines').split('|');

  // La frase destacada de la bio va en cursiva naranja, como en el diseno.
  const body = t('about.body');
  const accent = t('about.bodyAccent');
  const at = body.indexOf(accent);
  const bio =
    at === -1 ? (
      body
    ) : (
      <>
        {body.slice(0, at)}
        <em className={styles.bioAccent}>{accent}</em>
        {body.slice(at + accent.length)}
      </>
    );

  const card = (i: number) => ({
    variants: cardIn,
    custom: i,
    initial: 'hidden',
    whileInView: 'show',
    viewport: { once: true, amount: 0.25 },
  });

  return (
    <section id="about" className={styles.section} aria-labelledby="about-title">
      <motion.header
        className={`${styles.head} sk-host`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <div className={styles.headText}>
          <span className={`${styles.mono} sk`}>{t('about.sectionEyebrow')}</span>
          <h2 id="about-title" className={styles.title}>
            {t('about.sectionTitle1')}{' '}
            <span className={styles.titleAccent}>{t('about.sectionTitle2')}</span>
          </h2>
        </div>
        <span className={styles.mono}>{t('about.sectionMeta')}</span>
      </motion.header>

      <div className={styles.bento}>
        {/* ---- Bio ---- */}
        <motion.article className={`${styles.card} ${styles.bio} sk-host`} {...card(0)}>
          <span className={`${styles.mono} sk`}>{t('about.bio')}</span>
          <p className={styles.bioText}>
            <span className="sk">{bio}</span>
          </p>
        </motion.article>

        {/* ---- Proyectos publicados ---- */}
        <motion.a
          href="#projects"
          onClick={() => requestProjectCategory('all')}
          className={`${styles.card} ${styles.projects} sk-host sk-dark`}
          {...card(1)}
        >
          <div className={styles.cardHead}>
            <span className={styles.monoSm}>{t('about.statProjects')}</span>
            <Image
              src="/v3/flecha-crema.svg"
              alt=""
              width={22}
              height={22}
              className={styles.arrow}
              unoptimized
            />
          </div>

          <p className={`${styles.figure} ${styles.figureXl}`}>
            <Counter to={PROJECT_COUNT} />
          </p>

          <div className={styles.chart} aria-hidden="true">
            {BY_DISCIPLINE.map((d, i) => (
              <motion.span
                key={d.id}
                className={`${styles.chartBar} sk-host`}
                style={{ flex: `${d.count} 0 0`, background: d.color }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.12, duration: 0.9, ease: EASE }}
              />
            ))}
          </div>

          <ul className={styles.legend}>
            {BY_DISCIPLINE.map((d) => (
              <li key={d.id} className={styles.legendItem}>
                <span className={styles.dot} style={{ background: d.color }} aria-hidden="true" />
                {t(`about.legend.${d.id}`)} {pad2(d.count)}
              </li>
            ))}
          </ul>
        </motion.a>

        {/* ---- Anos construyendo ---- */}
        <motion.div className={`${styles.card} ${styles.years} sk-host`} {...card(2)}>
          <span className={styles.monoSm}>{t('about.statYears')}</span>
          <p className={`${styles.figure} ${styles.figureLg}`}>
            <Counter to={Number(t('about.yearsValue'))} padded />
          </p>
        </motion.div>

        {/* ---- Herramientas ---- */}
        <motion.div className={`${styles.card} ${styles.tools} sk-host`} {...card(3)}>
          <span className={styles.monoSm}>{t('about.statTools')}</span>
          <ul className={styles.toolDots}>
            {techData.map((tool, i) => (
              <motion.li
                key={tool.name}
                className={`${styles.toolDot} sk-host`}
                title={tool.name}
                aria-label={tool.name}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.035, type: 'spring', stiffness: 500, damping: 20 }}
              />
            ))}
          </ul>
          <p className={`${styles.figure} ${styles.figureLg}`}>
            <Counter to={TOOL_COUNT} />
          </p>
        </motion.div>

        {/* ---- Especialidades: stickers que caen y se arrastran ---- */}
        <motion.div
          ref={stickersRef}
          className={`${styles.card} ${styles.stickers} sk-host`}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
        >
          <span className={`${styles.monoSm} ${styles.stickersLabel}`}>{t('about.specialties')}</span>
          <span className={`${styles.monoSm} ${styles.dragHint}`} aria-hidden="true">
            {t('about.dragHint')} ↔
          </span>

          <ul aria-label={t('about.specialties')} style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {disciplines.map((label, i) => {
              const s = STICKERS[i % STICKERS.length];
              return (
                <motion.li
                  key={label}
                  className={`${styles.stickerSlot} sk-host`}
                  style={
                    {
                      '--x': `${s.x}%`,
                      '--y': `${s.y}%`,
                      '--xs': `${s.xs}%`,
                      '--ys': `${s.ys}%`,
                    } as React.CSSProperties
                  }
                  variants={stickerIn}
                  custom={{ rotate: s.rotate, i }}
                >
                  <motion.span
                    className={styles.sticker}
                    style={{ '--sticker-bg': s.bg, position: 'relative' } as React.CSSProperties}
                    drag
                    dragConstraints={stickersRef}
                    dragElastic={0.18}
                    dragTransition={{ bounceStiffness: 300, bounceDamping: 18 }}
                    whileDrag={{ scale: 1.08, zIndex: 10 }}
                    whileHover={{ scale: 1.04 }}
                  >
                    {label}
                  </motion.span>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>

        {/* ---- Formacion ---- */}
        <motion.div className={`${styles.edu} sk-host`} {...card(4)}>
          <span className={styles.mono}>{t('about.education')}</span>
          <p className={styles.eduName}>
            <span className="sk">{t('about.university')}</span>
          </p>
          <p className={styles.eduDegree}>
            <span className="sk">{t('about.degree')}</span>
          </p>
          <span className={styles.eduArrow} aria-hidden="true">
            <Image src="/v3/flecha-formacion.svg" alt="" width={20} height={20} unoptimized />
          </span>
        </motion.div>
      </div>
    </section>
  );
}
