'use client';

import Hero from "@/components/Hero";
import About from "@/components/About";
import ContactForm from "@/components/ContactForm";
import ImmersiveJourney from "@/components/ImmersiveJourney";
import { useLanguage } from '../context/LanguageContext';

import TechStack from "@/components/TechStack";
import Projects from "@/components/Projects";

// lucide-react ya no exporta marcas, asi que los glifos van inline. Todos
// comparten viewBox y strokeWidth para que el trazo case con el resto del sitio.
const brandIcon = (name: string, paths: React.ReactNode) => {
  const Icon = () => (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths}
    </svg>
  );
  Icon.displayName = `${name}Icon`;
  return Icon;
};

const InstagramIcon = brandIcon('Instagram',
  <>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </>
);

const LinkedinIcon = brandIcon('Linkedin',
  <>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </>
);

const XIcon = brandIcon('X',
  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
);

const socialLinks = [
  { name: 'Instagram', Icon: InstagramIcon, href: 'https://www.instagram.com/luixmv6/' },
  { name: 'LinkedIn', Icon: LinkedinIcon, href: 'https://www.linkedin.com/in/pedro-martinez-aa8378233/?skipRedirect=true' },
  { name: 'X', Icon: XIcon, href: 'https://x.com/LuixMv' },
];

export default function Home() {
  const email = "luixmv6@gmail.com";
  const { t } = useLanguage();

  return (
    <>
      <Hero />
      <ImmersiveJourney />
      <About />
      <TechStack />
      <Projects />

      <section
        id="contact"
        style={{
          background: 'var(--background)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '3.5rem',
            width: '100%',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            <h2 className="display-caps" style={{ fontSize: 'var(--t-display-2)', maxWidth: '16ch' }}>
              {t('contact.title')}
            </h2>

            <div style={{ width: '100%' }}>
              <ContactForm />
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.75rem',
              paddingTop: '3.5rem',
              borderTop: '1px solid var(--border-subtle)',
              width: '100%'
            }}>
              <a
                href={`mailto:${email}`}
                className="contact-email"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--t-body)',
                  color: 'var(--muted)',
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                  transition: 'color var(--dur-fast) ease',
                }}
              >
                {email}
              </a>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {socialLinks.map(({ name, Icon, href }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="social-link"
                    style={{
                      color: 'var(--muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--r-pill)',
                      /* Antes rgba(255,255,255,0.03): en tema claro esto es
                         blanco sobre blanco, o sea nada. */
                      background: 'var(--surface-raised)',
                      border: '1px solid var(--border-subtle)',
                      transition: 'color var(--dur-fast) ease, border-color var(--dur-fast) ease, transform var(--dur-fast) var(--ease-out)',
                    }}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .contact-email:hover { color: var(--accent); }
          .social-link:hover {
            color: var(--accent);
            border-color: var(--accent);
            transform: translateY(-3px);
          }
        `}</style>
      </section>
    </>
  );
}
