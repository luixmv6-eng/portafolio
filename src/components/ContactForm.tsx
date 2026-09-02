'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { Send, User, Mail, MessageSquare, CheckCircle } from 'lucide-react';

type FormData = {
  name: string;
  email: string;
  message: string;
};

export default function ContactForm() {
  const { t } = useLanguage();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const onSubmit = async (data: FormData) => {
    setSubmitError(false);
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

      if (response.ok) {
        reset();
        setIsSuccess(true);
      } else {
        setSubmitError(true);
      }
    } catch {
      setSubmitError(true);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        role="status"
        className="surface-card"
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '3.5rem 2.5rem',
          textAlign: 'center',
          borderRadius: 'var(--r-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem'
        }}
      >
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'color-mix(in srgb, var(--success) 12%, transparent)',
          border: '1px solid color-mix(in srgb, var(--success) 35%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <CheckCircle size={30} color="var(--success)" aria-hidden="true" />
        </div>
        <h3 style={{ fontSize: 'var(--t-display-4)' }}>
          {t('contact.successTitle')}
        </h3>
        <p className="body-copy" style={{ maxWidth: '40ch' }}>
          {t('contact.successBody')}
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="premium-button"
          style={{ marginTop: '0.75rem' }}
        >
          {t('contact.sendAnother')}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        textAlign: 'left',
      }}
    >
      {/* label asociada al input con htmlFor/id: antes eran labels sueltas,
          asi que ni el clic ni el lector de pantalla las vinculaba. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="contact-name" className="label">
          {t('contact.name')}
        </label>
        <div className="field" data-invalid={errors.name ? 'true' : 'false'}>
          <User size={20} aria-hidden="true" style={{ opacity: 0.5, flexShrink: 0 }} />
          <input
            id="contact-name"
            autoComplete="name"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
            {...register('name', { required: true })}
            placeholder={t('contact.namePlaceholder')}
          />
        </div>
        {errors.name && (
          <span id="contact-name-error" role="alert" className="field-error">
            {t('contact.errors.name')}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="contact-email" className="label">
          {t('contact.email')}
        </label>
        <div className="field" data-invalid={errors.email ? 'true' : 'false'}>
          <Mail size={20} aria-hidden="true" style={{ opacity: 0.5, flexShrink: 0 }} />
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            {...register('email', { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })}
            placeholder={t('contact.emailPlaceholder')}
          />
        </div>
        {errors.email && (
          <span id="contact-email-error" role="alert" className="field-error">
            {t('contact.errors.email')}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="contact-message" className="label">
          {t('contact.message')}
        </label>
        <div
          className="field"
          data-invalid={errors.message ? 'true' : 'false'}
          style={{ alignItems: 'flex-start' }}
        >
          <MessageSquare size={20} aria-hidden="true" style={{ opacity: 0.5, flexShrink: 0, marginTop: '0.2rem' }} />
          <textarea
            id="contact-message"
            rows={5}
            aria-invalid={errors.message ? 'true' : 'false'}
            aria-describedby={errors.message ? 'contact-message-error' : undefined}
            {...register('message', { required: true })}
            placeholder={t('contact.messagePlaceholder')}
            style={{ resize: 'vertical' }}
          />
        </div>
        {errors.message && (
          <span id="contact-message-error" role="alert" className="field-error">
            {t('contact.errors.message')}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '1.1rem 2.5rem',
          background: 'var(--foreground)',
          color: 'var(--background)',
          border: '1px solid var(--foreground)',
          borderRadius: 'var(--r-sm)',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--t-label)',
          fontWeight: 700,
          letterSpacing: 'var(--track-label)',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          cursor: isSubmitting ? 'progress' : 'pointer',
          opacity: isSubmitting ? 0.65 : 1,
          marginTop: '0.5rem',
          alignSelf: 'flex-start',
          transition: 'opacity var(--dur-fast) ease, transform var(--dur-fast) ease',
        }}
        onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px)'; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        {isSubmitting ? t('contact.sending') : t('contact.send')}
        <Send size={16} aria-hidden="true" />
      </button>

      {submitError && (
        <span role="alert" className="field-error">
          {t('contact.errorBody')}
        </span>
      )}
    </motion.form>
  );
}
