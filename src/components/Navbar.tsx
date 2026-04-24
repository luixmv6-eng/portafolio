'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Menu, X, ChevronRight } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const [isMobile, setIsMobile] = useState(false);
  const lastScrollY = useRef(0);
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sections = ['about', 'stack', 'projects', 'contact'];

  useEffect(() => {
    const handleModalToggle = (e: CustomEvent<{isOpen: boolean}>) => {
      setIsModalOpen(e.detail.isOpen);
    };
    window.addEventListener('modalToggle', handleModalToggle as EventListener);
    return () => window.removeEventListener('modalToggle', handleModalToggle as EventListener);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;

      setScrolled(currentY > 50);

      if (diff > 8 && currentY > 100) {
        setHidden(true);
      } else if (diff < -5) {
        setHidden(false);
      }

      lastScrollY.current = currentY;
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    handleResize();

    // Scrollspy
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px -20% 0px' }
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  const navItems = [
    { name: t('nav.about'), href: '#about' },
    { name: t('nav.stack'), href: '#stack' },
    { name: t('nav.projects'), href: '#projects' },
    { name: t('nav.contact'), href: '#contact' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 1000,
      padding: scrolled ? '1.2rem 4vw' : '2.5rem 4vw',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: scrolled ? 'color-mix(in srgb, var(--background) 80%, transparent)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
      transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
      borderBottom: scrolled ? '1px solid var(--border-subtle)' : 'none',
      transform: hidden || isModalOpen ? 'translateY(-110%)' : 'translateY(0)',
      willChange: 'transform',
      opacity: isModalOpen ? 0 : 1,
      pointerEvents: isModalOpen ? 'none' : 'auto',
    }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style={{ width: '2rem', height: '2rem', flexShrink: 0 }}>
          <text x="48" y="76" fontFamily="var(--font-serif)" fontSize="78" fontWeight="700" textAnchor="middle" fill="currentColor" letterSpacing="-3">PM</text>
        </svg>
        <span className="nav-logo-text" style={{ transition: 'opacity 0.3s ease' }}>
          PEDRO LUIS MARTINEZ<span style={{ color: 'var(--accent)', fontSize: '1.8rem', lineHeight: 1 }}>.</span>
        </span>
      </div>

      <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
        {/* Desktop Nav */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '2.5rem' }}>
          {isMounted && navItems.map((item) => (
            <a
              key={item.name}
                href={item.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.2rem',
                  fontWeight: 600,
                  color: activeSection === item.href.slice(1) ? 'var(--accent)' : 'var(--foreground)',
                  textDecoration: 'none',
                  opacity: activeSection === item.href.slice(1) ? 1 : 0.5,
                  transition: 'all 0.4s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.letterSpacing = '0.25rem';
                  e.currentTarget.style.color = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== item.href.slice(1)) {
                    e.currentTarget.style.opacity = '0.5';
                    e.currentTarget.style.letterSpacing = '0.2rem';
                    e.currentTarget.style.color = 'var(--foreground)';
                  }
                }}
              >
                {item.name}
                {activeSection === item.href.slice(1) && (
                  <motion.div
                    layoutId="activeIndicator"
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'var(--accent)',
                      borderRadius: '1px',
                    }}
                  />
                )}
              </a>
            ))}
          </div>
        )}

        <div style={{
          height: '14px',
          width: '1px',
          background: 'var(--border-subtle)',
          margin: '0 0.5rem'
        }} />

        <button
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          style={{
            background: 'none',
            border: '1px solid var(--border-subtle)',
            color: 'var(--foreground)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.15rem',
            cursor: 'pointer',
            opacity: 0.7,
            padding: '0.4rem 0.8rem',
            borderRadius: '100px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--accent)';
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--foreground)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.opacity = '0.7';
          }}
        >
          {language === 'es' ? 'EN' : 'ES'}
        </button>

        <div style={{
          height: '14px',
          width: '1px',
          background: 'var(--border-subtle)',
          margin: '0 0.5rem'
        }} />

        <button
          onClick={() => {
            const themes: Theme[] = ['light', 'dark', 'system'];
            const currentIndex = themes.indexOf(theme);
            setTheme(themes[(currentIndex + 1) % 3]);
          }}
          style={{
            background: 'none',
            border: '1px solid var(--border-subtle)',
            color: 'var(--foreground)',
            fontSize: '1rem',
            cursor: 'pointer',
            opacity: 0.7,
            padding: '0.4rem',
            borderRadius: '50%',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--accent)';
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'scale(1.1) rotate(15deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--foreground)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.opacity = '0.7';
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          }}
          title={`Switch to ${theme === 'light' ? 'Dark' : theme === 'dark' ? 'System' : 'Light'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .nav-logo-text { display: none; }
        }
        @media (max-width: 640px) {
          nav {
            padding: ${scrolled ? '0.8rem 5vw' : '1.5rem 5vw'} !important;
          }
        }
      `}</style>
    </nav>
  );
}
