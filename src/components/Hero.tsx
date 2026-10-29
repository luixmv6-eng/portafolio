'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { requestProjectCategory } from '../data/categories';
import HeroSphere from './HeroSphere';
import HeroTimeline from './HeroTimeline';
import styles from './Hero.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;

// Esquinas y puntos medios de la caja de seleccion, en % de la caja.
const HANDLES: [number, number][] = [
  [0, 0], [50, 0], [100, 0],
  [0, 50], [100, 50],
  [0, 100], [50, 100], [100, 100],
];

// Muestras de "material" del inspector: la paleta del sitio.
const SWATCHES = [
  { hex: 'EFEBE3', color: 'var(--hueso)' },
  { hex: '16171A', color: 'var(--grafito)' },
  { hex: 'EE5F12', color: 'var(--naranja)' },
];

export default function Hero() {
  const { t } = useLanguage();
  const viewportRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState({ w: 604, h: 205 });
  const [viewport, setViewport] = useState({ w: 1440, h: 860 });

  // Puntero sobre el visor (-1..1). Lo comparten la esfera y la seleccion.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  // 1 mientras el puntero esta sobre "digital".
  const hover = useMotionValue(0);
  const setHovering = (on: boolean) => hover.set(on ? 1 : 0);

  // "digital" sigue al puntero con un muelle firme; la caja lo persigue con
  // uno mas blando, asi se ve que la seleccion "va detras" del objeto.
  const wordX = useSpring(useTransform([mx, hover], ([x, h]: number[]) => x * 14 * h), { stiffness: 260, damping: 24 });
  const wordY = useSpring(useTransform([my, hover], ([y, h]: number[]) => y * 8 * h), { stiffness: 260, damping: 24 });
  const boxX = useSpring(wordX, { stiffness: 120, damping: 18 });
  const boxY = useSpring(wordY, { stiffness: 120, damping: 18 });
  const gizmoRotate = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 80, damping: 20 });

  // Medidas reales de la caja, como las mostraria un editor.
  useEffect(() => {
    const el = selectionRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0];
      const w = Math.round(box ? box.inlineSize : entry.contentRect.width);
      const h = Math.round(box ? box.blockSize : entry.contentRect.height);
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Resolucion real de la ventana en la esquina del visor.
  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const r = viewportRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  const onPointerLeave = () => {
    mx.set(0);
    my.set(0);
    setHovering(false);
  };

  const reveal = (delay: number) => ({
    initial: { y: '105%' },
    animate: { y: '0%' },
    transition: { delay, duration: 1.1, ease: EASE },
  });

  const rows = [
    {
      label: t('hero.inspector.object'),
      value: (
        <p className={`${styles.propValue} ${styles.propName}`}>
          <span className="sk">Pedro Luis Martinez</span>
        </p>
      ),
    },
    {
      label: t('hero.inspector.role'),
      value: (
        <p className={`${styles.propValue} ${styles.propRole}`}>
          <span className="sk">{t('hero.role')}</span>
        </p>
      ),
    },
    {
      label: t('hero.inspector.education'),
      value: (
        <p className={`${styles.propValue} ${styles.propEdu}`}>
          <span className="sk">
            {t('about.university')} — {t('about.degree')}
          </span>
        </p>
      ),
    },
    {
      label: t('hero.inspector.status'),
      value: (
        <div className={styles.statusRow}>
          <Image src="/v3/toggle.svg" alt="" width={40} height={22} unoptimized />
          <p className={`${styles.propValue} ${styles.propStatus}`}>
            <span className="sk">{t('hero.status')}</span>
          </p>
        </div>
      ),
    },
    {
      label: t('hero.inspector.description'),
      value: (
        <p className={styles.propText}>
          <span className="sk">{t('hero.description')}</span>
        </p>
      ),
      grow: true,
    },
    {
      label: t('hero.inspector.material'),
      value: (
        <div className={styles.swatches}>
          {SWATCHES.map((s) => (
            <span key={s.hex} className={styles.swatch}>
              <span className={styles.swatchChip} style={{ background: s.color }} />
              {s.hex}
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section id="hero" className={styles.hero}>
      {/* ---- Visor ---- */}
      <div
        ref={viewportRef}
        className={`${styles.viewport} sk-dark`}
        data-cursor="cross"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <Image
          src="/v3/marca.svg"
          alt=""
          width={22}
          height={22}
          className={styles.marca}
          unoptimized
          aria-hidden="true"
        />
        <span className={`${styles.monoLabel} ${styles.viewLabel}`} aria-hidden="true">
          {t('hero.viewport')}
        </span>
        <span className={`${styles.monoLabel} ${styles.viewMeta}`} aria-hidden="true">
          {viewport.w} × {viewport.h} · 60 FPS
        </span>

        <HeroSphere mx={mx} my={my} />

        <div className={styles.stage}>
          <motion.p
            className={`${styles.tagline} sk`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: EASE }}
          >
            {t('hero.tagline')}
          </motion.p>

          <h1 className={styles.title}>
            <span className={`${styles.mask} ${styles.maskBlock}`}>
              <motion.span className={`${styles.titleBlock} sk`} {...reveal(0.15)}>
                {t('hero.title1')}
              </motion.span>
            </span>

            <span
              className={styles.titleAccentRow}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setHovering(true)}
              onPointerLeave={() => setHovering(false)}
            >
              <span className={styles.selectable}>
                <span className={styles.mask}>
                  <motion.span className={`${styles.titleAccent} sk`} {...reveal(0.3)}>
                    <motion.span style={{ display: 'block', x: wordX, y: wordY }}>
                      {t('hero.title2')}
                    </motion.span>
                  </motion.span>
                </span>

                {/* Caja de seleccion: decorativa, la lee el diseno, no el lector. */}
                <motion.span
                  ref={selectionRef}
                  className={styles.selection}
                  aria-hidden="true"
                  style={{ x: boxX, y: boxY }}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.85, duration: 0.5, ease: EASE }}
                >
                  {HANDLES.map(([x, y], i) => (
                    <motion.span
                      key={`${x}-${y}`}
                      className={styles.handle}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1 + i * 0.03, type: 'spring', stiffness: 500, damping: 22 }}
                    />
                  ))}
                  <span className={styles.selTag}>
                    {t('hero.selection')} · {t('hero.title2').toLowerCase()}
                  </span>
                  <span className={styles.selSize}>
                    {size.w} × {size.h}
                  </span>
                </motion.span>
              </span>
            </span>
          </h1>
        </div>

        <motion.div
          className={styles.gizmo}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          style={{ rotate: gizmoRotate, transformOrigin: '30px 80px' }}
        >
          <Image src="/v3/gizmo-ejes.svg" alt="" width={110} height={110} unoptimized />
          <span className={`${styles.monoLabel} ${styles.axis} ${styles.axisX}`}>X</span>
          <span className={`${styles.monoLabel} ${styles.axis} ${styles.axisY}`}>Y</span>
          <span className={`${styles.monoLabel} ${styles.axis} ${styles.axisZ}`}>Z</span>
        </motion.div>

        <HeroTimeline />
      </div>

      {/* ---- Inspector / Propiedades ---- */}
      <aside className={styles.inspector} aria-label={t('hero.inspector.title')}>
        <div className={styles.inspectorHead}>
          <span>{t('hero.inspector.title')}</span>
          <kbd aria-hidden="true">⌘ I</kbd>
        </div>

        {rows.map((row, i) => (
          <motion.div
            key={i}
            className={`${styles.prop} ${row.grow ? styles.propGrow : ''} sk-host`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.06, duration: 0.6, ease: EASE }}
          >
            <span className={styles.propLabel}>
              <span className="sk">{row.label}</span>
            </span>
            {row.value}
          </motion.div>
        ))}

        <motion.a
          href="#projects"
          className={`${styles.cta} sk-host`}
          onClick={() => requestProjectCategory('all')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6, ease: EASE }}
        >
          {t('hero.ctaLabel')}
          <Image src="/v3/icon-play.svg" alt="" width={14} height={16} unoptimized />
        </motion.a>
      </aside>
    </section>
  );
}
