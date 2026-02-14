'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PLACEHOLDER_BLUR } from '@/lib/utils/image-config';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoadingComplete'> {
  fallback?: string;
  aspectRatio?: 'square' | '16/9' | '4/3' | 'video' | 'auto';
}

/**
 * Optimized image component wrapper around Next.js Image
 * Provides automatic lazy loading, blur placeholder, and aspect ratio handling
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   src="/logo.png"
 *   alt="Company logo"
 *   width={200}
 *   height={200}
 *   aspectRatio="square"
 * />
 * ```
 */
export function OptimizedImage({
  src,
  alt,
  className,
  fallback = '/images/placeholder.png',
  aspectRatio = 'auto',
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const aspectRatioClasses = {
    square: 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    video: 'aspect-video',
    auto: '',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        aspectRatioClasses[aspectRatio],
        loading && 'animate-pulse bg-gray-200',
        className,
      )}
    >
      <Image
        src={error ? fallback : src}
        alt={alt}
        {...props}
        className={cn(
          'object-cover transition-opacity duration-300',
          loading ? 'opacity-0' : 'opacity-100',
        )}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        priority={priority}
        placeholder={priority ? undefined : 'blur'}
        blurDataURL={priority ? undefined : PLACEHOLDER_BLUR}
      />
    </div>
  );
}
