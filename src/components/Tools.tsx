'use client';

import { useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import techData from '../data/tech.json';
import styles from './Tools.module.css';

type Tool = (typeof techData)[number];

// Fila 1: diseno y produccion. El resto es desarrollo (contorno + cinta).
const isDesign = (t: Tool) => ['design', 'motion', 'video'].includes(t.category) || t.slug === 'blender';

// Orden del diseno; cualquier herramienta nueva de tech.json se suma al final.
const DEV_ORDER = ['python', 'javascript', 'typescript', 'react', 'nextdotjs', 'tailwindcss', 'html5', 'css3', 'threejs', 'framer', 'supabase', 'vercel'];
const byOrder = (order: string[]) => (a: Tool, b: Tool) => {
  const ia = order.indexOf(a.slug);
  const ib = order.indexOf(b.slug);
  return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
};

const DESIGN_TOOLS = techData.filter(isDesign);
const DEV_TOOLS = techData.filter((t) => !isDesign(t)).sort(byOrder(DEV_ORDER));
// La cinta arranca en JavaScript y deja Python al final, como en el diseno.
const RIBBON_TOOLS = [...DEV_TOOLS.slice(1), DEV_TOOLS[0]];

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/** Marquesina infinita: dos copias del contenido y un desplazamiento en % que
 *  se envuelve a la mitad. La velocidad sube con la del scroll y el hover la
 *  frena hasta parar (notas de motion, 05). */
function Marquee({
  speed,
  className,
  children,
}: {
  /** % del ancho de la fila por segundo; el signo marca la direccion. */
  speed: number;
  className?: string;
  children: (copy: number) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '120px 0px' });
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const throttle = useRef(1);

  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const boost = useTransform(smoothVelocity, [-2000, 0, 2000], [4, 0, 4], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (!inView || reduce) return;
    throttle.current += ((hovered ? 0 : 1) - throttle.current) * 0.12;
    const step = speed * (delta / 1000) * (1 + Math.abs(boost.get()));
    baseX.set(baseX.get() + step * throttle.current);
  });

  return (
    <motion.div
      ref={ref}
      className={`${styles.row} ${className ?? ''}`}
      style={{ x }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {children(0)}
      {children(1)}
    </motion.div>
  );
}

function ToolWord({ tool, variant, levelLabel }: { tool: Tool; variant: 'solid' | 'outline'; levelLabel: string }) {
  return (
    <li className={`${styles.word} ${styles[variant]}`}>
      {tool.name.toUpperCase()}
      <span className={styles.card} aria-hidden="true">
        <span className={styles.logo}>
          <Image src={tool.image} alt="" width={30} height={30} />
        </span>
        <span className={styles.cardText}>
          <span className={styles.cardName}>{tool.name}</span>
          <span>
            {levelLabel} {tool.level}/5
          </span>
          <span className={styles.levels}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={styles.level} data-on={n <= tool.level} />
            ))}
          </span>
        </span>
      </span>
    </li>
  );
}

export default function Tools() {
  const { t } = useLanguage();
  const level = t('stack.level');
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section id="stack" className={styles.section} aria-labelledby="stack-title">
      <motion.header
        className={`${styles.head} sk-host`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.headText}>
          <span className={`${styles.mono} sk sk-dark`}>{t('stack.eyebrow')}</span>
          <h2 id="stack-title" className={styles.title}>
            {t('stack.title1')} <span className={styles.titleAccent}>{t('stack.title2')}</span>
          </h2>
        </div>
        <span className={styles.mono}>{t('stack.meta').replace('{n}', String(techData.length))}</span>
      </motion.header>

      {/* Lista legible para lectores de pantalla; las marquesinas son decorado. */}
      <ul className={styles.srOnly} aria-label={t('stack.list')}>
        {techData.map((tool) => (
          <li key={tool.slug}>
            {tool.name} — {level} {tool.level}/5
          </li>
        ))}
      </ul>

      <div className={styles.marquees} aria-hidden="true">
        <Marquee speed={-2.2}>
          {(copy) => (
            <ul className={styles.track} key={copy}>
              {DESIGN_TOOLS.map((tool) => [
                <ToolWord key={tool.slug} tool={tool} variant="solid" levelLabel={level} />,
                <li key={`${tool.slug}-sep`} className={styles.sepStar}>
                  ✦
                </li>,
              ])}
            </ul>
          )}
        </Marquee>

        <Marquee speed={1.6}>
          {(copy) => (
            <ul className={styles.track} key={copy}>
              {DEV_TOOLS.map((tool) => [
                <ToolWord key={tool.slug} tool={tool} variant="outline" levelLabel={level} />,
                <li key={`${tool.slug}-sep`} className={styles.sepSlash}>
                  /
                </li>,
              ])}
            </ul>
          )}
        </Marquee>

        <div className={styles.ribbonWrap}>
          <Marquee speed={-1.4}>
            {(copy) => (
              <ul className={styles.ribbonTrack} key={copy}>
                {RIBBON_TOOLS.map((tool) => [
                  <li key={tool.slug} className={styles.ribbonItem}>
                    {tool.name}
                  </li>,
                  <li key={`${tool.slug}-dot`} className={styles.ribbonDot}>
                    ●
                  </li>,
                ])}
              </ul>
            )}
          </Marquee>
        </div>
      </div>

      <div className={styles.legend}>
        <span className={styles.mono}>
          {t('stack.legendDesign')} ({pad(DESIGN_TOOLS.length)})
        </span>
        <span className={styles.mono}>
          {t('stack.legendDev')} ({pad(DEV_TOOLS.length)})
        </span>
        <span className={`${styles.mono} ${styles.legendStrong}`}>{t('stack.legendLoop')}</span>
      </div>
    </section>
  );
}
