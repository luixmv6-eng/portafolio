'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  type Variants,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import styles from './Sequence.module.css';

const CHAPTERS = [
  {
    tag: 'ORIGEN',
    tone: 'dark',
    title: 'Curioso por\nnaturaleza',
    body: 'Desde el primer render en Blender hasta el primer deploy en producción, siempre busqué la intersección entre lo visual y lo funcional. La ingeniería multimedia no fue una elección, fue un destino.',
  },
  {
    tag: 'DISEÑO',
    tone: 'light',
    title: 'Donde el arte\nse encuentra con el código',
    body: 'El diseño no es decoración, es arquitectura invisible. Cada píxel, cada transición, cada jerarquía tipográfica cuenta una historia antes de que el usuario lea una sola palabra.',
  },
  {
    tag: 'CONSTRUCCIÓN',
    tone: 'panel',
    title: 'PWAs que\nrespiran',
    body: 'Construyo plataformas escalables con Next.js, Supabase e IA integrada. Plataformas que no solo funcionan: piensan, aprenden y se adaptan a quien las usa.',
  },
  {
    tag: 'VISIÓN',
    tone: 'signal',
    title: 'Contigo,\nlo siguiente',
    body: 'El mejor trabajo surge de la colaboración. Aporto rigor técnico, criterio visual y energía creativa. ¿Qué construimos juntos?',
  },
];

// 5 segundos por clip, 24 fotogramas por segundo.
const CLIP_SECONDS = 5;
const TOTAL_SECONDS = CHAPTERS.length * CLIP_SECONDS;
const FPS = 24;
const RULER_MARKS = [0, 5, 10, 15, 20];

const pad = (n: number) => String(n).padStart(2, '0');
const timecode = (s: number) => `00:${pad(Math.floor(s))}:${pad(Math.floor((s % 1) * FPS))}`;

// Forma de onda determinista por clip: misma en servidor y cliente.
const BARS = 44;
function waveform(seed: number) {
  let x = seed * 9301 + 49297;
  return Array.from({ length: BARS }, (_, i) => {
    x = (x * 9301 + 49297) % 233280;
    const noise = x / 233280;
    const envelope = 0.55 + 0.45 * Math.sin(i * 0.42 + seed);
    return Math.round(6 + 28 * Math.max(0, Math.min(1, envelope * 0.7 + noise * 0.4)));
  });
}
const WAVES = CHAPTERS.map((_, i) => waveform(i + 1));

// Los clips entran juntos con la tira: uno a uno no servia, porque los que
// quedan fuera por la derecha (tablet/movil) nunca "entraban" en pantalla.
const clipsIn: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const clipIn: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

// Alto que tapa la linea de tiempo fija del movil.
const MOBILE_TIMELINE = 76;

export default function Sequence() {
  const { t } = useLanguage();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const overflow = useRef(0);
  const [active, setActive] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // Cuanto sobra la tira respecto al carril visible (0 en escritorio) y a que
  // altura se fija el escenario: centrado en el alto util de la pantalla, o
  // alineado abajo si no cabe, para que los clips nunca queden cortados.
  useEffect(() => {
    const measure = () => {
      const lane = timelineRef.current?.clientWidth ?? 0;
      const strip = stripRef.current?.scrollWidth ?? 0;
      overflow.current = Math.max(0, strip - lane);

      const sticky = stickyRef.current;
      const wrapper = wrapperRef.current;
      if (!sticky || !wrapper) return;
      const inset = window.matchMedia('(max-width: 760px)').matches ? MOBILE_TIMELINE : 0;
      const room = window.innerHeight - inset;
      const h = sticky.offsetHeight;
      const top = h <= room ? (room - h) / 2 : room - h;
      wrapper.style.setProperty('--pin-top', `${Math.round(top)}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (timelineRef.current) ro.observe(timelineRef.current);
    if (stripRef.current) ro.observe(stripRef.current);
    if (stickyRef.current) ro.observe(stickyRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.0005 });

  // El playhead recorre la tira entera; si la tira es mas ancha que la
  // pantalla, ademas se desliza hacia la izquierda. En pantalla el cabezal
  // siempre avanza de borde a borde y los clips "pasan" por debajo.
  const stripX = useTransform(progress, (p) => -p * overflow.current);
  const headX = useTransform(progress, (p) => `${p * 100}%`);

  useMotionValueEvent(progress, 'change', (p) => {
    const s = Math.min(TOTAL_SECONDS - 1 / FPS, Math.max(0, p * TOTAL_SECONDS));
    const frame = Math.floor(s * FPS) / FPS;
    setSeconds((prev) => (prev === frame ? prev : frame));
    const idx = Math.min(CHAPTERS.length - 1, Math.floor(p * CHAPTERS.length));
    setActive((prev) => (prev === idx ? prev : idx));
  });

  return (
    <section ref={wrapperRef} id="journey" className={styles.wrapper} aria-labelledby="sequence-title">
      <div ref={stickyRef} className={styles.sticky}>
        <motion.header
          className={`${styles.head} sk-host`}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.headText}>
            <span className={`${styles.eyebrow} sk`}>{t('sequence.eyebrow')}</span>
            <h2 id="sequence-title" className={styles.title}>
              {t('sequence.title1')} → <span className={styles.titleAccent}>{t('sequence.title2')}</span>
            </h2>
          </div>
          <span className={styles.meta}>{t('sequence.meta')}</span>
        </motion.header>

        <div ref={timelineRef} className={styles.timeline}>
          <motion.div ref={stripRef} className={styles.strip} style={{ x: stripX }}>
            <div className={styles.ruler} aria-hidden="true" />
            <div className={styles.rulerLabels} aria-hidden="true">
              {RULER_MARKS.map((s) => (
                <span
                  key={s}
                  className={styles.rulerLabel}
                  style={{ left: `${(s / TOTAL_SECONDS) * 100}%` }}
                >
                  00:{pad(s)}
                </span>
              ))}
            </div>

            <motion.ol
              className={styles.clips}
              variants={clipsIn}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {CHAPTERS.map((chapter, i) => (
                <motion.li
                  key={chapter.tag}
                  className={`${styles.clip} sk-host ${chapter.tone === 'light' ? '' : 'sk-dark'}`}
                  data-tone={chapter.tone}
                  data-active={active === i}
                  aria-current={active === i ? 'step' : undefined}
                  variants={clipIn}
                >
                  <div className={styles.clipHead}>
                    <span>
                      {t('sequence.clip')} {pad(i + 1)} · {chapter.tag}
                    </span>
                    <span>00:{pad(CLIP_SECONDS)}</span>
                  </div>
                  <h3 className={styles.clipTitle}>
                    <span className="sk">{chapter.title}</span>
                  </h3>
                  <p className={styles.clipBody}>
                    <span className="sk">{chapter.body}</span>
                  </p>
                  <div className={styles.wave} aria-hidden="true">
                    {WAVES[i].map((h, b) => (
                      <span
                        key={b}
                        className={styles.bar}
                        style={{ height: h, animationDelay: `${-(b % 7) * 0.13}s` }}
                      />
                    ))}
                  </div>
                </motion.li>
              ))}
            </motion.ol>

            <motion.div
              className={styles.playhead}
              style={{ x: headX }}
              data-flip={seconds > TOTAL_SECONDS * 0.85}
              aria-hidden="true"
            >
              <span className={styles.playheadLine} />
              <span className={styles.playheadCap} />
              <span className={styles.playheadTime}>{timecode(seconds)}</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <div className={styles.pinSpace} aria-hidden="true" />
    </section>
  );
}
