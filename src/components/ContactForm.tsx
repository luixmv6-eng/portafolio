'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import styles from './Contact.module.css';

type FormData = {
  name: string;
  email: string;
  message: string;
};

const EASE = [0.16, 1, 0.3, 1] as const;

export default function ContactForm() {
  const { t } = useLanguage();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // Barra de "render": avanza mientras el envio esta en vuelo y llega al
  // 100 % cuando el servidor confirma (notas de motion, 09).
  const progress = useMotionValue(0);
  const percent = useTransform(progress, (v) => `${Math.round(v * 100)}%`);

  const onSubmit = async (data: FormData) => {
    setSubmitError(false);
    progress.set(0);
    const running = animate(progress, 0.9, { duration: 2.4, ease: [0.2, 0.8, 0.3, 1] });
    try {
      const response = await fetch('https://formsubmit.co/ajax/luixmv6@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
          _subject: '¡Nuevo mensaje de contacto desde tu Portfolio!',
          _captcha: 'false',
          _template: 'box',
          _autoresponse: 'Estimado/a,\n\nMuchas gracias por ponerte en contacto. Confirmo la correcta recepción de tu mensaje.\n\nEstaré analizando los detalles de tu solicitud y me comunicaré contigo a la brevedad posible para conversar sobre tu proyecto y explorar cómo podemos generar valor juntos.\n\nAgradezco sinceramente tu interés y el tiempo dedicado a escribirme.\n\nUn cordial saludo,\n\nPedro\nIngeniero Multimedia & Diseño Digital'
        })
      });

      running.stop();
      if (response.ok) {
        await animate(progress, 1, { duration: 0.45, ease: EASE });
        reset();
        setIsSuccess(true);
      } else {
        animate(progress, 0, { duration: 0.4 });
        setSubmitError(true);
      }
    } catch {
      running.stop();
      animate(progress, 0, { duration: 0.4 });
      setSubmitError(true);
    }
  };

  const field = (name: keyof FormData, label: string, error: string, input: React.ReactNode) => (
    <div className={styles.field}>
      <label htmlFor={`contact-${name}`} className={styles.label}>
        {label}
      </label>
      {input}
      {errors[name] && (
        <span id={`contact-${name}-error`} role="alert" className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );

  return (
    <motion.div
      className={`${styles.dialog} sk-host`}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <div className={styles.dialogHead}>
        <h3 className={styles.dialogTitle}>{t('contact.dialogTitle')}</h3>
        <Image src="/v3/dialogo-puntos.svg" alt="" width={42} height={10} unoptimized />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {isSuccess ? (
          <motion.div
            key="done"
            className={styles.done}
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <span className={styles.doneMark} aria-hidden="true">
              <Check size={26} strokeWidth={3} />
            </span>
            <p className={styles.doneTitle}>{t('contact.successTitle')}</p>
            <p className={styles.doneBody}>{t('contact.successBody')}</p>
            <button
              type="button"
              className={styles.again}
              onClick={() => {
                progress.set(0);
                setIsSuccess(false);
              }}
            >
              {t('contact.sendAnother')}
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {field(
              'name',
              t('contact.name'),
              t('contact.errors.name'),
              <input
                id="contact-name"
                className={styles.input}
                autoComplete="name"
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'contact-name-error' : undefined}
                {...register('name', { required: true })}
                placeholder={t('contact.namePlaceholder')}
              />
            )}
            {field(
              'email',
              t('contact.email'),
              t('contact.errors.email'),
              <input
                id="contact-email"
                type="email"
                className={styles.input}
                autoComplete="email"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'contact-email-error' : undefined}
                {...register('email', { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })}
                placeholder={t('contact.emailPlaceholder')}
              />
            )}
            {field(
              'message',
              t('contact.message'),
              t('contact.errors.message'),
              <textarea
                id="contact-message"
                className={`${styles.input} ${styles.textarea}`}
                rows={5}
                aria-invalid={errors.message ? 'true' : 'false'}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
                {...register('message', { required: true })}
                placeholder={t('contact.messagePlaceholder')}
              />
            )}

            <div className={styles.field}>
              <div className={`${styles.progressHead} ${styles.label}`}>
                <span>{t('contact.progress')}</span>
                <motion.span aria-live="polite">{percent}</motion.span>
              </div>
              <div className={styles.progressTrack}>
                <motion.div className={styles.progressFill} style={{ scaleX: progress }} />
              </div>
            </div>

            <button type="submit" className={styles.submit} disabled={isSubmitting}>
              {isSubmitting ? t('contact.sendingLabel') : t('contact.sendLabel')}
              <Image src="/v3/flecha-enviar.svg" alt="" width={20} height={20} unoptimized />
            </button>

            {submitError && (
              <span role="alert" className={styles.error}>
                {t('contact.errorBody')}
              </span>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
