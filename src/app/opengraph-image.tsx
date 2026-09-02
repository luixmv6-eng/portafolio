import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Pedro Luis Martinez, Ingeniero Multimedia y Desarrollador Web';

// Reemplaza la foto de stock aleatoria que estaba fijada en la metadata.
// Se genera en build, asi que no hay asset que mantener.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#060810',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Halo de acento */}
        <div
          style={{
            position: 'absolute',
            top: -160,
            right: -160,
            width: 620,
            height: 620,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.22) 0%, rgba(56,189,248,0) 70%)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#38bdf8',
            }}
          />
          <div
            style={{
              color: '#e8eaf2',
              fontSize: 22,
              letterSpacing: 6,
              opacity: 0.75,
              display: 'flex',
            }}
          >
            PEDRO LUIS MARTINEZ
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              color: '#e8eaf2',
              fontSize: 116,
              lineHeight: 1.05,
              letterSpacing: -2,
              display: 'flex',
            }}
          >
            DISENO
          </div>
          <div
            style={{
              color: '#38bdf8',
              fontSize: 116,
              lineHeight: 1.05,
              letterSpacing: -2,
              fontStyle: 'italic',
              marginLeft: 120,
              display: 'flex',
            }}
          >
            DIGITAL
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 56, height: 2, background: '#38bdf8' }} />
          <div
            style={{
              color: '#e8eaf2',
              fontSize: 26,
              opacity: 0.6,
              letterSpacing: 2,
              display: 'flex',
            }}
          >
            Ingenieria Multimedia . Desarrollo Web . PWAs
          </div>
        </div>
      </div>
    ),
    size
  );
}
