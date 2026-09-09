'use client';

import { useEffect, useState, useRef, useSyncExternalStore } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor, Menu, X, ChevronDown } from 'lucide-react';
import {
  PROJECT_CATEGORIES,
  categoryHref,
  requestProjectCategory,
  type CategoryFilter,
} from '../data/categories';

type Theme = 'light' | 'dark' | 'system';

const SECTIONS = ['about', 'stack', 'projects', 'contact'];

// Deteccion de hidratacion sin setState en un efecto. Hace falta porque el
// idioma sale de localStorage: en el servidor las etiquetas siempre son 'es'.
const emptySubscribe = () => () => {};
const useIsHydrated = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const lastY = useRef(0);
  const projectsGroupRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isMounted = useIsHydrated();

  // Se reemplaza window.addEventListener('scroll') por el useScroll de Motion.
  // Solo llamamos a setState cuando un booleano cambia, no en cada frame.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (current) => {
    const diff = current - lastY.current;
    lastY.current = current;

    setScrolled((prev) => {
      const next = current > 50;
      return prev === next ? prev : next;
    });

    if (diff > 8 && current > 100) {
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

  // Scrollspy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px -20% 0px' }
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
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
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
    { name: t('nav.about'), href: '#about' },
    { name: t('nav.stack'), href: '#stack' },
    { name: t('nav.projects'), href: '#projects', hasCategories: true },
    { name: t('nav.contact'), href: '#contact' },
  ];

  const categoryItems = PROJECT_CATEGORIES.map((category) => ({
    id: category.id,
    name: t(category.labelKey),
    href: categoryHref(category.id),
  }));

  const nextTheme: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' };
  const themeIcon =
    theme === 'dark' ? <Moon size={17} /> : theme === 'light' ? <Sun size={17} /> : <Monitor size={17} />;

  const iconButtonStyle: React.CSSProperties = {
    background: 'none',
    border: '1px solid var(--border-subtle)',
    color: 'var(--foreground)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    borderRadius: 'var(--r-pill)',
    transition: 'color var(--dur-fast) ease, border-color var(--dur-fast) ease',
  };

  const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--t-label-sm)',
    letterSpacing: 'var(--track-label)',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: isActive ? 'var(--accent)' : 'var(--muted)',
    textDecoration: 'none',
    transition: 'color var(--dur-fast) ease',
    position: 'relative',
    paddingBottom: '4px',
  });

  const activeIndicator = (
    <motion.span
      layoutId="activeIndicator"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'var(--accent)',
        borderRadius: '1px',
      }}
    />
  );

  return (
    <>
      <nav
        className="site-nav"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1000,
          /* Techo de altura: 80px sin scroll, 64px con scroll. Antes el estado
             inicial ocupaba ~112px de viewport. */
          padding: scrolled ? '1rem var(--gutter)' : '1.5rem var(--gutter)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: scrolled ? 'color-mix(in srgb, var(--background) 82%, transparent)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
          transition: 'padding var(--dur-mid) var(--ease-out), background var(--dur-mid) ease, transform var(--dur-mid) var(--ease-out), opacity var(--dur-fast) ease',
          borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
          transform: (hidden && !isMobileOpen) || isModalOpen ? 'translateY(-110%)' : 'translateY(0)',
          willChange: 'transform',
          opacity: isModalOpen ? 0 : 1,
          pointerEvents: isModalOpen ? 'none' : 'auto',
        }}
      >
        <a
          href="#hero"
          className="nav-logo"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.15rem',
            letterSpacing: '-0.01em',
            color: 'var(--foreground)',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <span className="nav-logo-full">PEDRO LUIS MARTINEZ</span>
          <span className="nav-logo-short" aria-hidden="true">PM</span>
          <span style={{ color: 'var(--accent)' }}>.</span>
        </a>

        <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
          <div className="nav-links" style={{ display: 'flex', gap: '2.25rem' }}>
            {isMounted &&
              navItems.map((item) => {
                const isActive = activeSection === item.href.slice(1);

                if (!item.hasCategories) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className="nav-link"
                      aria-current={isActive ? 'true' : undefined}
                      style={navLinkStyle(isActive)}
                    >
                      {item.name}
                      {isActive && activeIndicator}
                    </a>
                  );
                }

                // Proyectos despliega las cuatro disciplinas del portafolio.
                return (
                  <div
                    key={item.href}
                    ref={projectsGroupRef}
                    className="nav-group"
                    onMouseEnter={openProjectsMenu}
                    onMouseLeave={scheduleProjectsClose}
                    onFocus={openProjectsMenu}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsProjectsOpen(false);
                    }}
                    style={{ position: 'relative' }}
                  >
                    <a
                      href={item.href}
                      className="nav-link"
                      aria-current={isActive ? 'true' : undefined}
                      aria-haspopup="true"
                      aria-expanded={isProjectsOpen}
                      onClick={() => goToCategory('all')}
                      style={{
                        ...navLinkStyle(isActive),
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      {item.name}
                      <ChevronDown
                        size={13}
                        aria-hidden="true"
                        style={{
                          transform: isProjectsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform var(--dur-fast) var(--ease-out)',
                        }}
                      />
                      {isActive && activeIndicator}
                    </a>

                    <AnimatePresence>
                      {isProjectsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: '-0.75rem',
                            /* El relleno superior hace de puente: el puntero
                               pasa del enlace al panel sin salir del grupo. */
                            paddingTop: '1rem',
                          }}
                        >
                          <div
                            role="menu"
                            aria-label={t('nav.projects')}
                            style={{
                              minWidth: '250px',
                              padding: '0.5rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.1rem',
                              background: 'color-mix(in srgb, var(--surface) 88%, transparent)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--r-md)',
                              boxShadow: 'var(--card-shadow-hover)',
                              backdropFilter: 'blur(20px) saturate(180%)',
                              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            }}
                          >
                            {categoryItems.map((category) => (
                              <a
                                key={category.id}
                                href={category.href}
                                role="menuitem"
                                className="nav-dropdown-item"
                                onClick={() => goToCategory(category.id)}
                                style={{
                                  fontFamily: 'var(--font-sans)',
                                  fontSize: 'var(--t-label)',
                                  letterSpacing: 'var(--track-label)',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  color: 'var(--muted)',
                                  textDecoration: 'none',
                                  padding: '0.65rem 0.85rem',
                                  borderRadius: 'var(--r-sm)',
                                  transition: 'color var(--dur-fast) ease, background var(--dur-fast) ease',
                                }}
                              >
                                {category.name}
                              </a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a espanol'}
              style={{
                ...iconButtonStyle,
                width: 'auto',
                padding: '0 0.7rem',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--t-label-sm)',
                fontWeight: 700,
                letterSpacing: '0.1em',
              }}
            >
              {language === 'es' ? 'EN' : 'ES'}
            </button>

            <button
              onClick={() => setTheme(nextTheme[theme])}
              aria-label={`Tema: ${theme}`}
              title={`Tema: ${theme}`}
              style={iconButtonStyle}
            >
              {isMounted ? themeIcon : <Monitor size={17} />}
            </button>

            {/* Menu movil. Antes este boton no existia: en pantallas de 1024px
                o menos no habia forma de navegar entre secciones. */}
            <button
              className="nav-burger"
              onClick={() => setIsMobileOpen(true)}
              aria-label={t('nav.menu')}
              aria-expanded={isMobileOpen}
              style={iconButtonStyle}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu')}
            data-lenis-prevent
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1500,
              background: 'color-mix(in srgb, var(--background) 96%, transparent)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '1.5rem var(--gutter)',
              }}
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                aria-label={t('projects.close')}
                autoFocus
                style={iconButtonStyle}
              >
                <X size={20} />
              </button>
            </div>

            <nav
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '0.25rem',
                padding: '0 var(--gutter) 8vh',
              }}
            >
              {navItems.map((item, i) => (
                <div key={item.href}>
                  <motion.a
                    href={item.href}
                    onClick={() => (item.hasCategories ? goToCategory('all') : setIsMobileOpen(false))}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(1.75rem, 8vw, 3rem)',
                      color: activeSection === item.href.slice(1) ? 'var(--accent)' : 'var(--foreground)',
                      textDecoration: 'none',
                      padding: '0.5rem 0',
                      borderBottom: item.hasCategories ? 'none' : '1px solid var(--border-subtle)',
                    }}
                  >
                    {item.name}
                  </motion.a>

                  {/* En movil no hay hover para un desplegable: las categorias
                      viven como sublista bajo Proyectos. */}
                  {item.hasCategories && (
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        paddingLeft: '1rem',
                        paddingBottom: '0.6rem',
                        borderLeft: '1px solid var(--border-subtle)',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                    >
                      {categoryItems.map((category) => (
                        <a
                          key={category.id}
                          href={category.href}
                          onClick={() => goToCategory(category.id)}
                          className="nav-mobile-sublink"
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 'var(--t-label)',
                            letterSpacing: 'var(--track-label)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            color: 'var(--muted)',
                            textDecoration: 'none',
                            padding: '0.6rem 0',
                          }}
                        >
                          {category.name}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .site-nav .nav-link:hover { color: var(--accent) !important; }
        .site-nav button:hover {
          color: var(--accent);
          border-color: var(--accent);
        }
        .site-nav .nav-dropdown-item:hover,
        .site-nav .nav-dropdown-item:focus-visible {
          color: var(--accent);
          background: rgba(var(--accent-rgb), 0.08);
        }
        .nav-mobile-sublink:hover { color: var(--accent); }
        .nav-logo-short { display: none; }
        .nav-burger { display: none !important; }

        /* Un solo punto de corte para la navegacion: los enlaces se van y el
           menu aparece exactamente a la vez. */
        @media (max-width: 1024px) {
          .nav-links { display: none !important; }
          .nav-burger { display: flex !important; }
        }

        @media (max-width: 620px) {
          .nav-logo-full { display: none; }
          .nav-logo-short { display: inline; }
        }
      `}</style>
    </>
  );
}
