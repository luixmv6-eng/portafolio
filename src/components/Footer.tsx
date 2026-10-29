'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { scrollToSection } from './HeroTimeline';
import styles from './Contact.module.css';

// La linea de tiempo completa: al llegar al pie todos los tramos estan llenos.
const STEPS = [
  { id: 'hero', labelKey: 'hero.timeline.start' },
  { id: 'journey', labelKey: 'footer.sequence' },
  { id: 'about', labelKey: 'nav.about' },
  { id: 'stack', labelKey: 'stack.title' },
  { id: 'projects', labelKey: 'nav.projects' },
  { id: 'contact', labelKey: 'nav.contact' },
];

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref);

  // Con el pie a la vista sobra el boton flotante: aqui ya esta "Volver al inicio".
  useEffect(() => {
    document.documentElement.toggleAttribute('data-footer-visible', inView);
  }, [inView]);

  return (
    <footer ref={ref} className={styles.footer}>
      <nav aria-label={t('footer.nav')}>
        <ol className={styles.steps}>
          {STEPS.map((step, i) => (
            <li key={step.id}>
              <button
                type="button"
                className={`${styles.step} ${i === STEPS.length - 1 ? styles.stepLast : ''}`}
                onClick={() => scrollToSection(step.id)}
              >
                <motion.span
                  className={styles.stepBar}
                  aria-hidden="true"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5, ease: 'linear' }}
                />
                <span className={styles.stepLabel}>
                  {String(i).padStart(2, '0')} {t(step.labelKey)}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <p className={styles.name} aria-label="Pedro Luis Martinez">
        PEDRO LUIS MARTINEZ
      </p>

      <div className={styles.bottom}>
        <span className={styles.mono}>
          © {year} — {t('hero.subtitle')}
        </span>
        <span className={styles.mono}>{t('footer.end')}</span>
        <button type="button" className={styles.back} onClick={() => scrollToSection('hero')}>
          {t('footer.back')}
        </button>
      </div>
    </footer>
  );
}
