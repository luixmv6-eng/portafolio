'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';

type Props = ImageProps & {
  /** Clase del recuadro: es el que da la forma del skeleton. */
  frameClassName?: string;
};

/** Imagen con skeleton: el recuadro brilla con su forma final hasta que la
 *  imagen termina de cargar y entonces aparece con un fundido (ver .sk-media
 *  en globals.css). Sin JavaScript la imagen se ve directamente. */
export default function SkeletonImage({ frameClassName, onLoad, alt, ...props }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className={`sk-media ${frameClassName ?? ''}`} data-loaded={loaded}>
      <Image
        {...props}
        alt={alt}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
      />
    </span>
  );
}
