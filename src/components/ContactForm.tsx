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
        setSubmitError(false);
      } else {
        setSubmitError(true);
      }
    } catch (error) {
      setSubmitError(true);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '4rem 3rem',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '24px',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}
      >
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(74, 222, 128, 0.1)',
          border: '1px solid rgba(74, 222, 128, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <CheckCircle size={40} color="#4ade80" />
        </div>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 400 }}>
          ¡Mensaje en camino!
        </h3>
        <p style={{ fontFamily: 'var(--font-sans)', opacity: 0.7, lineHeight: 1.8, fontSize: '1.1rem' }}>
          Gracias por contactarme. He recibido tu mensaje y me pondré en contacto contigo lo más pronto posible.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="premium-button"
          style={{ marginTop: '1.5rem', opacity: 0.8 }}
        >
          Enviar otro mensaje
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', letterSpacing: '0.05em', opacity: 0.7 }}>
          {t('contact.name') || 'Name'}
        </label>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          padding: '1.5rem', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(10px)',
        }}>
          <User size={24} opacity={0.5} />
          <input
            {...register('name', { required: true })}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '1.1rem',
              color: 'var(--foreground)',
              width: '100%',
              outline: 'none',
            }}
            placeholder={t('contact.namePlaceholder') || 'Your name'}
          />
        </div>
        {errors.name && <span style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>Name is required</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', letterSpacing: '0.05em', opacity: 0.7 }}>
          {t('contact.email') || 'Email'}
        </label>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          padding: '1.5rem', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(10px)',
        }}>
          <Mail size={24} opacity={0.5} />
          <input
            type="email"
            {...register('email', { required: true })}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '1.1rem',
              color: 'var(--foreground)',
              width: '100%',
              outline: 'none',
            }}
            placeholder={t('contact.emailPlaceholder') || 'your@email.com'}
          />
        </div>
        {errors.email && <span style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>Valid email required</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', letterSpacing: '0.05em', opacity: 0.7 }}>
          {t('contact.message') || 'Message'}
        </label>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '1rem', 
          padding: '1.5rem', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(10px)',
        }}>
          <MessageSquare size={24} opacity={0.5} />
          <textarea
            {...register('message', { required: true })}
            rows={5}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '1.1rem',
              color: 'var(--foreground)',
              width: '100%',
              outline: 'none',
              resize: 'vertical',
            }}
            placeholder={t('contact.messagePlaceholder') || 'Tell me about your project...'}
          />
        </div>
        {errors.message && <span style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>Message is required</span>}
      </div>

      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1.5rem 3rem',
          background: 'var(--foreground)',
          color: 'var(--background)',
          border: 'none',
          borderRadius: '100px',
          fontFamily: 'var(--font-sans)',
          fontSize: '1.1rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          cursor: 'pointer',
          marginTop: '1rem',
          transition: 'all 0.3s ease',
        }}
      >
        {isSubmitting ? 'Enviando...' : (t('contact.send') || 'Send Message')}
        <Send size={20} />
      </motion.button>
      {submitError && (
        <span style={{ color: 'var(--accent)', textAlign: 'center', marginTop: '1rem', fontFamily: 'var(--font-sans)' }}>
          Hubo un problema al enviar el mensaje. Inténtalo directamente en luixmv6@gmail.com
        </span>
      )}
    </motion.form>
  );
}

