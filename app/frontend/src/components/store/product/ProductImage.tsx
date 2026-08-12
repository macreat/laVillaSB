'use client';

import { useState } from 'react';
import React from 'react';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
}

export function ProductImage({
  src,
  alt,
  className = 'flex aspect-square items-center justify-center bg-surface p-6',
  imageClassName = 'h-full w-full rounded-lg object-cover',
  fallbackClassName = 'flex h-24 w-24 items-center justify-center rounded-lg border border-border text-text-muted',
}: ProductImageProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = !imageFailed ? src : '';

  return (
    <div className={className}>
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          className={imageClassName}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className={fallbackClassName} aria-label="product-image-fallback">
          <svg className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
}
