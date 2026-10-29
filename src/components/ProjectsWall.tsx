'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import SkeletonImage from './SkeletonImage';
import { projectText, type Project } from './projectText';
import styles from './Projects.module.css';

// Inclinacion y altura de cada poster en el muro (Figma 13:224).
const LAYOUT = [
  { rotate: 3, y: 30 },
  { rotate: -2, y: 52 },
  { rotate: 1.5, y: 20 },
  { rotate: -3, y: 58 },
  { rotate: 2, y: 35 },
  { rotate: -1.5, y: 49 },
  { rotate: 3, y: 25 },
];

const pad = (n: number) => String(n).padStart(2, '0');

export default function ProjectsWall({
  projects,
  onOpen,
  header,
}: {
  projects: Project[];
  onOpen: (p: Project) => void;
  header: React.ReactNode;
}) {
  const { t } = useLanguage();
  const text = projectText(t);
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [limit, setLimit] = useState(0);
  const dragged = useRef(false);

  // Cuanto se puede arrastrar: lo que la tira sobresale del muro.
  useEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current;
      const track = trackRef.current;
      if (!wrap || !track) return;
      setLimit(Math.max(0, track.scrollWidth - wrap.clientWidth + 80));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, []);

  // Cursor "Arrastra": sigue al puntero con un muelle y solo existe con mouse.
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const sx = useSpring(cx, { stiffness: 500, damping: 40 });
  const sy = useSpring(cy, { stiffness: 500, damping: 40 });
  const [showCursor, setShowCursor] = useState(false);

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    cx.set(e.clientX - r.left);
    cy.set(e.clientY - r.top);
    if (!showCursor) setShowCursor(true);
  };

  return (
    <div className={styles.wall}>
      {header}

      <div
        ref={wrapRef}
        className={styles.wallTrackWrap}
        data-cursor="drag"
        onPointerMove={onPointerMove}
        onPointerLeave={() => setShowCursor(false)}
      >
        <motion.ul
          ref={trackRef}
          className={styles.wallTrack}
          drag="x"
          dragConstraints={{ left: -limit, right: 0 }}
          dragElastic={0.12}
          dragTransition={{ power: 0.35, timeConstant: 320, bounceStiffness: 260, bounceDamping: 28 }}
          onDragStart={() => {
            dragged.current = true;
          }}
          onDragEnd={() => {
            // El clic que cierra un arrastre no debe abrir el poster.
            requestAnimationFrame(() => {
              dragged.current = false;
            });
          }}
        >
          {projects.map((project, i) => {
            const l = LAYOUT[i % LAYOUT.length];
            const pieces = (project.gallery ?? []).length;
            const sub = pieces > 1 ? `${pieces} ${t('projects.pieces')}` : project.tech.join(' + ');
            return (
              <motion.li
                key={project.id}
                className={`${styles.posterSlot} sk-host`}
                style={{ marginTop: l.y }}
                initial={{ opacity: 0, y: -40, rotate: l.rotate * 3 }}
                whileInView={{ opacity: 1, y: 0, rotate: l.rotate }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 160, damping: 16 }}
              >
                <button
                  type="button"
                  className={styles.poster}
                  aria-label={`${t('projects.open')}: ${project.title}`}
                  onClick={() => {
                    if (!dragged.current) onOpen(project);
                  }}
                >
                  <Image src="/v3/chincheta.svg" alt="" width={14} height={14} className={styles.pin} unoptimized />
                  <SkeletonImage
                    src={project.image}
                    alt={project.title}
                    width={472}
                    height={600}
                    sizes="240px"
                    frameClassName={styles.posterImage}
                    draggable={false}
                  />
                  <span className={styles.posterMeta} aria-hidden="true">
                    <span>
                      {pad(i + 1)}/{pad(projects.length)}
                    </span>
                    <span>4:5</span>
                  </span>
                  <span className={styles.posterKicker}>{text.kicker(project)}</span>
                  <span className={styles.posterTitle}>
                    <span className="sk">{project.title}</span>
                  </span>
                  <span className={styles.posterSub}>{sub}</span>
                </button>
              </motion.li>
            );
          })}
        </motion.ul>

        <motion.div
          className={styles.dragCursor}
          aria-hidden="true"
          style={{ x: sx, y: sy }}
          initial={false}
          animate={{ scale: showCursor ? 1 : 0, opacity: showCursor ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        >
          <span className={styles.mono} style={{ color: 'var(--grafito)' }}>
            {t('projects.drag')}
          </span>
          <b>← →</b>
        </motion.div>
      </div>
    </div>
  );
}
