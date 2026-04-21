'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Hero from "@/components/Hero";
import About from "@/components/About";
import ContactForm from "@/components/ContactForm";
import { useLanguage } from '../context/LanguageContext';

const TechStack = dynamic(() => import('@/components/TechStack'), { ssr: false });
const Projects = dynamic(() => import('@/components/Projects'), { ssr: false });
import { ArrowUpRight } from 'lucide-react';

const InstagramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const LinkedinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;
const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>;

export default function Home() {
  const email = "luixmv6@gmail.com";
  const { t } = useLanguage();

  const socialLinks = [
    { 
      name: 'Instagram', 
      icon: <InstagramIcon />,
      href: 'https://instagram.com' 
    },
    { 
      name: 'LinkedIn', 
      icon: <LinkedinIcon />,
      href: 'https://linkedin.com' 
    },
    { 
      name: 'Twitter', 
      icon: <TwitterIcon />,
      href: 'https://twitter.com' 
    },
  ];

  return (
    <>
      <Hero />
      <About />
      <TechStack />
      <Projects />

      <section id="contact" style={{ 
        padding: '8rem 4vw 6rem', 
        background: 'var(--background)',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <div className="container">
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            textAlign: 'center',
            gap: '4rem',
            width: '100%',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            
            <h2 style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: 'clamp(2.5rem, 6vw, 5rem)', 
              lineHeight: 1.1,
              fontWeight: 400
            }}>
              {t('contact.title')}
            </h2>
            
            <div style={{ width: '100%' }}>
              <ContactForm />
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2rem',
              marginTop: '2rem',
              paddingTop: '4rem',
              borderTop: '1px solid var(--border-subtle)',
              width: '100%'
            }}>
              <span style={{ 
                fontFamily: 'var(--font-sans)', 
                fontSize: '1rem', 
                opacity: 0.6,
                letterSpacing: '0.1em'
              }}>
                {email}
              </span>

              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {socialLinks.map((social) => (
                  <a 
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      color: 'var(--foreground)',
                      opacity: 0.5,
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-subtle)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.color = 'var(--accent)';
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.5';
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.color = 'var(--foreground)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
