'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { requestProjectCategory } from '../data/categories';
import styles from './Hero.module.css';

// Cada marcador es una seccion. El cabezal llega a la marca i justo cuando esa
// seccion toca el borde superior: asi la pista "dura" lo que dura la pagina.
const STOPS = [
  { id: 'hero', labelKey: 'hero.timeline.start' },
  { id: 'about', labelKey: 'nav.about' },
  { id: 'stack', labelKey: 'stack.title' },
  { id: 'projects', labelKey: 'nav.projects' },
  { id: 'contact', labelKey: 'nav.contact' },
];

// 15 minutos de "metraje" para toda la pagina, como en el diseno.
const TOTAL_SECONDS = 15 * 60;

const timecode = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return [h, m, sec].map((n) => String(n).padStart(2, '0')).join(':');
};

export function scrollToSection(id: string) {
  const el = id === 'hero' ? null : document.getElementById(id);
  const lenis = window.__lenis;
  if (lenis) {
    lenis.scrollTo(el ?? 0);
  } else if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export default function HeroTimeline() {
  const { t } = useLanguage();
  const anchors = useRef<number[]>([0, 1, 2, 3, 4]);
  const [seconds, setSeconds] = useState(4);
  const [active, setActive] = useState(0);

  // Posiciones de las secciones. Se recalculan si cambia el alto del documento
  // (imagenes que cargan, cambio de idioma...).
  useEffect(() => {
    const measure = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      anchors.current = STOPS.map(({ id }, i) => {
        if (i === 0) return 0;
        const el = document.getElementById(id);
        if (!el) return (max * i) / (STOPS.length - 1);
        return Math.min(max, el.getBoundingClientRect().top + window.scrollY);
      });
      // La ultima marca siempre es el final de la pagina.
      anchors.current[STOPS.length - 1] = max;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const { scrollY } = useScroll();

  // scrollY -> fraccion de pista (0..1), lineal por tramos entre secciones.
  const fraction = useTransform(scrollY, (y) => {
    const a = anchors.current;
    const last = a.length - 1;
    if (y <= a[0]) return 0;
    if (y >= a[last]) return 1;
    for (let i = 0; i < last; i++) {
      if (y < a[i + 1]) {
        const span = Math.max(1, a[i + 1] - a[i]);
        return (i + (y - a[i]) / span) / last;
      }
    }
    return 1;
  });

  // Arriba del todo el cabezal ya va un 10% adelantado, como en el diseno
  // (00:00:04): asi no tapa la etiqueta "00".
  const shown = useTransform(fraction, (f) => Math.max(f, 0.1));
  const smooth = useSpring(shown, { stiffness: 140, damping: 28, restDelta: 0.0005 });
  const headX = useTransform(smooth, (f) => `${f * 100}%`);

  useMotionValueEvent(fraction, 'change', (f) => {
    // Nunca en cero: el diseno arranca en 00:00:04.
    const next = Math.max(4, Math.round(f * TOTAL_SECONDS));
    setSeconds((prev) => (prev === next ? prev : next));
    const idx = Math.min(STOPS.length - 1, Math.floor(f * (STOPS.length - 1) + 0.04));
    setActive((prev) => (prev === idx ? prev : idx));
  });

  return (
    <motion.div
      className={`${styles.timeline} sk-host`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <a
        href="#projects"
        className={styles.play}
        onClick={() => requestProjectCategory('all')}
      >
        <span className={styles.playCircle} aria-hidden="true">
          <Image src="/v3/play-circulo.svg" alt="" width={56} height={56} unoptimized />
          <Image
            src="/v3/play.svg"
            alt=""
            width={20}
            height={22}
            className={styles.playIcon}
            unoptimized
          />
        </span>
        <span className={styles.playText}>
          <span className={`${styles.playTitle} sk`}>{t('hero.cta')}</span>
          <span className={styles.playTime} aria-hidden="true">
            {timecode(seconds)} / {timecode(TOTAL_SECONDS)}
          </span>
        </span>
      </a>

      <nav className={styles.track} aria-label={t('hero.timeline.label')}>
        <span className={styles.rail} aria-hidden="true" />
        <motion.span
          className={styles.progress}
          style={{ scaleX: smooth }}
          aria-hidden="true"
        />

        <ol className={styles.markers}>
          {STOPS.map((stop, i) => (
            <li
              key={stop.id}
              className={styles.marker}
              style={{ left: `${(i / (STOPS.length - 1)) * 100}%` }}
            >
              <button
                type="button"
                className={styles.markerBtn}
                aria-current={active === i ? 'true' : undefined}
                onClick={() => scrollToSection(stop.id)}
              >
                <span className={styles.tick} aria-hidden="true" />
                <span>
                  {String(i).padStart(2, '0')}
                  <span className={styles.markerName}> {t(stop.labelKey)}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>

        <motion.span className={styles.headRail} style={{ x: headX }} aria-hidden="true">
          <span className={styles.playhead}>
            <span className={styles.playheadCap} />
          </span>
        </motion.span>
      </nav>
    </motion.div>
  );
}
