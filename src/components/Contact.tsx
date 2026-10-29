'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import ContactForm from './ContactForm';
import styles from './Contact.module.css';

const EMAIL = 'luixmv6@gmail.com';

const SOCIALS = [
  { name: 'Instagram', href: 'https://www.instagram.com/luixmv6/' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/pedro-martinez-aa8378233/?skipRedirect=true' },
  { name: 'X', href: 'https://x.com/LuixMv' },
];

export default function Contact() {
  const { t } = useLanguage();

  return (
    <section id="contact" className={styles.section} aria-labelledby="contact-title">
      <div className={styles.panel}>
        <div className={styles.top}>
          <span className={`${styles.mono} sk sk-dark`}>{t('contact.eyebrow')}</span>
          <span className={styles.mono}>{t('contact.meta')}</span>
        </div>

        <motion.h2
          id="contact-title"
          className={`${styles.title} sk-host`}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.titleLead}>{t('contact.titleLead')}</span>{' '}
          <span className={styles.titleAccent}>{t('contact.titleAccent')}</span>
        </motion.h2>

        <div className={styles.body}>
          <div className={styles.left}>
            <div className={styles.write}>
              <span className={styles.mono}>{t('contact.writeMe')}</span>
              <a href={`mailto:${EMAIL}`} className={styles.email}>
                {EMAIL}
                <Image src="/v3/flecha-email.svg" alt="" width={40} height={40} unoptimized />
              </a>
            </div>

            <ul className={styles.socials}>
              {SOCIALS.map((s) => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className={styles.social}>
                    {s.name}
                    <Image src="/v3/flecha-social.svg" alt="" width={14} height={14} unoptimized />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}
