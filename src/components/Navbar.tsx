'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { Menu, X, ChevronDown } from 'lucide-react';
import {
  PROJECT_CATEGORIES,
  categoryHref,
  requestProjectCategory,
  type CategoryFilter,
} from '../data/categories';
import styles from './Navbar.module.css';

const SECTIONS = ['hero', 'about', 'stack', 'projects', 'contact'];
const EASE = [0.16, 1, 0.3, 1] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const lastY = useRef(0);
  const projectsGroupRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { language, setLanguage, t } = useLanguage();

  // Solo llamamos a setState cuando un booleano cambia, no en cada frame.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (current) => {
    const diff = current - lastY.current;
    lastY.current = current;

    setScrolled((prev) => {
      const next = current > 24;
      return prev === next ? prev : next;
    });

    if (diff > 8 && current > 160) {
      setHidden(true);
      // Si la barra se va, el desplegable se va con ella.
      setIsProjectsOpen(false);
    } else if (diff < -5) setHidden(false);
  });

  useEffect(() => {
    const handleModalToggle = (e: Event) => {
      setIsModalOpen((e as CustomEvent<{ isOpen: boolean }>).detail.isOpen);
    };
    window.addEventListener('modalToggle', handleModalToggle);
    return () => window.removeEventListener('modalToggle', handleModalToggle);
  }, []);

  // Scrollspy. El hero tambien cuenta: arriba del todo no hay item activo.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0, rootMargin: '-45% 0px -50% 0px' }
    );

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // El panel movil bloquea el scroll del fondo y cierra con Escape.
  useEffect(() => {
    if (!isMobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.__lenis?.stop();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.__lenis?.start();
      window.removeEventListener('keydown', onKey);
    };
  }, [isMobileOpen]);

  // El desplegable de categorias cierra con Escape o con un clic fuera: el
  // hover no basta en pantallas tactiles ni navegando con teclado.
  useEffect(() => {
    if (!isProjectsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsProjectsOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!projectsGroupRef.current?.contains(e.target as Node)) setIsProjectsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isProjectsOpen]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  const openProjectsMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsProjectsOpen(true);
  };

  // Un respiro al salir del hover: el puntero cruza el hueco entre el enlace y
  // el panel sin que este se cierre en la cara del usuario.
  const scheduleProjectsClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setIsProjectsOpen(false), 160);
  };

  const goToCategory = (category: CategoryFilter) => {
    setIsProjectsOpen(false);
    setIsMobileOpen(false);
    // El href ya escribe el hash (enlace profundo); esto filtra y desplaza aun
    // cuando el hash no cambia porque ya estaba en esa categoria.
    requestProjectCategory(category);
  };

  const navItems = [
    { name: t('nav.aboutLabel'), href: '#about' },
    { name: t('nav.stackLabel'), href: '#stack' },
    { name: t('nav.projectsLabel'), href: '#projects', hasCategories: true },
    { name: t('nav.contactLabel'), href: '#contact' },
  ];

  const categoryItems = PROJECT_CATEGORIES.map((category, i) => ({
    id: category.id,
    index: String(i + 1).padStart(2, '0'),
    name: t(category.labelKey),
    href: categoryHref(category.id),
  }));

  const activePill = (
    <motion.span
      layoutId="nav-active"
      className={styles.activePill}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
    />
  );

  const languageSwitch = (pillId: string) => (
    <div className={styles.lang} role="group" aria-label={t('nav.language')}>
      {(['es', 'en'] as const).map((code) => (
        <button
          key={code}
          type="button"
          className={styles.langOption}
          aria-pressed={language === code}
          onClick={() => setLanguage(code)}
        >
          {language === code && (
            <motion.span
              layoutId={pillId}
              className={styles.langPill}
              transition={{ type: 'spring', stiffness: 480, damping: 38 }}
            />
          )}
          <span className={styles.langText}>{code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <header
        className={styles.bar}
        data-scrolled={scrolled}
        data-hidden={hidden && !isMobileOpen}
        data-modal={isModalOpen}
      >
        <a href="#hero" className={styles.logo} aria-label="Pedro Luis Martinez">
          PM.
        </a>

        <nav className={styles.menu} aria-label="Principal">
          {navItems.map((item) => {
            const isActive = activeSection === item.href.slice(1);

            if (!item.hasCategories) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={styles.item}
                  aria-current={isActive ? 'true' : undefined}
                >
                  {isActive && activePill}
                  <span className={styles.itemLabel}>{item.name}</span>
                </a>
              );
            }

            // Proyectos despliega las cuatro disciplinas del portafolio.
            return (
              <div
                key={item.href}
                ref={projectsGroupRef}
                className={styles.group}
                onMouseEnter={openProjectsMenu}
                onMouseLeave={scheduleProjectsClose}
                onFocus={openProjectsMenu}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsProjectsOpen(false);
                }}
              >
                <a
                  href={item.href}
                  className={styles.item}
                  aria-current={isActive ? 'true' : undefined}
                  aria-haspopup="true"
                  aria-expanded={isProjectsOpen}
                  onClick={() => goToCategory('all')}
                >
                  {isActive && activePill}
                  <span className={styles.itemLabel}>{item.name}</span>
                  <ChevronDown
                    size={13}
                    aria-hidden="true"
                    className={styles.itemChevron}
                    data-open={isProjectsOpen}
                  />
                </a>

                <AnimatePresence>
                  {isProjectsOpen && (
                    <motion.div
                      className={styles.dropdown}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.2, ease: EASE }}
                    >
                      <div role="menu" aria-label={item.name} className={styles.dropdownPanel}>
                        {categoryItems.map((category) => (
                          <a
                            key={category.id}
                            href={category.href}
                            role="menuitem"
                            className={styles.dropdownItem}
                            onClick={() => goToCategory(category.id)}
                          >
                            {category.name}
                            <span>{category.index}</span>
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <p className={styles.file} aria-hidden="true">
          <span className={styles.fileName}>
            {t('bar.file')} — {t('bar.saved')}
          </span>
        </p>

        <div className={styles.status}>
          <span className={styles.statusDot} aria-hidden="true">
            <Image src="/v3/punto-disponible.svg" alt="" width={10} height={10} unoptimized />
          </span>
          {t('hero.availability')}
        </div>

        {languageSwitch('lang-pill-bar')}

        {/* Menu movil: debajo de 960px los enlaces no caben en la barra. */}
        <button
          type="button"
          className={styles.burger}
          onClick={() => setIsMobileOpen(true)}
          aria-label={t('nav.menu')}
          aria-expanded={isMobileOpen}
        >
          <Menu size={20} />
        </button>
      </header>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className={styles.mobilePanel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu')}
            data-lenis-prevent
          >
            <div className={styles.mobileHead}>
              <a href="#hero" className={styles.logo} onClick={() => setIsMobileOpen(false)}>
                PM.
              </a>
              <button
                type="button"
                className={styles.burger}
                style={{ display: 'flex' }}
                onClick={() => setIsMobileOpen(false)}
                aria-label={t('projects.close')}
                autoFocus
              >
                <X size={20} />
              </button>
            </div>

            <nav className={styles.mobileNav}>
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.06, duration: 0.4, ease: EASE }}
                >
                  <a
                    href={item.href}
                    className={styles.mobileLink}
                    aria-current={activeSection === item.href.slice(1) ? 'true' : undefined}
                    onClick={() => (item.hasCategories ? goToCategory('all') : setIsMobileOpen(false))}
                  >
                    <span className={styles.mobileIndex}>{String(i + 1).padStart(2, '0')}</span>
                    {item.name}
                  </a>

                  {/* En movil no hay hover para un desplegable: las categorias
                      viven como pastillas bajo Proyectos. */}
                  {item.hasCategories && (
                    <div className={styles.mobileSub}>
                      {categoryItems.map((category) => (
                        <a
                          key={category.id}
                          href={category.href}
                          className={styles.mobileSubLink}
                          onClick={() => goToCategory(category.id)}
                        >
                          {category.name}
                        </a>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </nav>

            <div className={styles.mobileFoot}>
              <div className={styles.status} style={{ display: 'flex' }}>
                <span className={styles.statusDot} aria-hidden="true">
                  <Image src="/v3/punto-disponible.svg" alt="" width={10} height={10} unoptimized />
                </span>
                {t('hero.availability')}
              </div>
              {languageSwitch('lang-pill-panel')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
